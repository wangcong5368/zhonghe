<template>
    <div class="app-container">
        <el-card>
            <div slot="header" class="clearfix">
                <span>考勤记录导入</span>
            </div>

            <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
                <el-form-item label="文件名称" prop="name">
                    <el-input v-model="queryParams.name" placeholder="请输入文件名称" clearable style="width: 240px" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                    <el-button type="primary" plain icon="el-icon-upload2" @click="handleImport">导入考勤</el-button>
                </el-col>
                <!-- <el-col :span="1.5">
                    <el-button type="success" plain icon="el-icon-download" @click="downloadTemplate">下载模板</el-button>
                </el-col> -->
                <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="attendanceList" border>
                <!-- <el-table-column label="ID" align="center" prop="id" width="80" /> -->
                <el-table-column label="文件名称" align="center" prop="name" />
                <el-table-column label="总记录数" align="center" prop="totalCount" />
                <el-table-column label="成功数量" align="center" prop="successCount" />
                <el-table-column label="失败数量" align="center" prop="failCount" />
                <el-table-column label="状态" align="center" prop="status" :formatter="formatStatus" />
                <el-table-column label="导入时间" align="center" prop="createTime" width="160" />
                <el-table-column label="完成时间" align="center" prop="finishTime" width="160" />
                <!-- <el-table-column label="说明" align="center" prop="remark" width="160">
                    <template slot-scope="scope">
                        <el-tooltip class="item" effect="dark" :content="scope.row.remark" placement="top" :disabled="!scope.row.remark" popper-class="remark-tooltip">
                            <div class="remark-cell">{{ scope.row.remark }}</div>
                        </el-tooltip>
                    </template>
                </el-table-column> -->
            </el-table>

            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>

        <!-- 导入对话框 -->
        <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body @closed="handleDialogClosed">
            <Uploda @upload-success="handleUploadSuccess" @upload-complete="handleUploadComplete" ref="fileUpload" v-model="form.fileUrl" />
        </el-dialog>
    </div>
</template>

<script>
import { getToken } from '@/utils/auth';
import { importAttendanceData, getAttendanceReportList, getAttendanceList, downloadAttendanceTemplate } from '@/api/oa/attendance';
import Uploda from './uploda.vue';

export default {
    name: 'AttendanceImport',
    data() {
        return {
            // 遮罩层
            loading: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 考勤数据列表
            attendanceList: [],
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                name: null
            },
            form: {
                fileUrl: null
            },

            // 上传参数
            upload: {
                // 是否显示弹出层
                open: false,
                // 弹出层标题
                title: '导入考勤数据'
                // 是否禁用上传
                // isUploading: false,
                // // 设置上传的请求头部
                // headers: { Authorization: 'Bearer ' + getToken() },
                // // 上传的地址
                // url: process.env.VUE_APP_BASE_API + '/oa/attendanceImport/importData'
            }
        };
    },
    components: {
        Uploda
    },
    created() {
        this.getList();
    },
    methods: {
        /** 查询考勤记录列表 */
        getList() {
            this.loading = true;
            getAttendanceList(this.queryParams).then(response => {
                this.attendanceList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
        },
        // 格式化状态
        formatStatus(row, column) {
            const statusMap = {
                0: '导入失败',
                1: '已上传',
                2: '导入中',
                3: '导入完成'
            };
            return statusMap[row.status] || '未知';
        },
        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.getList();
        },
        /** 重置按钮操作 */
        resetQuery() {
            this.resetForm('queryForm');
            this.handleQuery();
        },
        /** 导入按钮操作 */
        handleImport() {
            this.upload.open = true;
        },
        /** 下载模板操作 */
        downloadTemplate() {
            downloadAttendanceTemplate()
                .then(response => {
                    const blob = new Blob([response]);
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = '考勤导入模板.xlsx';
                    link.click();
                    URL.revokeObjectURL(link.href);
                })
                .catch(() => {
                    this.$message.error('模板下载失败');
                });
        },
        // 文件上传中处理
        handleFileUploadProgress(event, file, fileList) {
            this.upload.isUploading = true;
        },
        // 文件上传成功处理
        handleFileSuccess(response, file, fileList) {
            this.upload.open = false;
            this.upload.isUploading = false;
            this.$refs.upload.clearFiles();
            this.$alert(response.msg || '导入成功', '导入结果', { type: response.code === 200 ? 'success' : 'error' });
            this.getList();
        },
        // 提交上传文件
        submitFileForm() {
            importAttendanceData({ file: this.form.fileUrl })
                .then(response => {
                    this.upload.open = false;
                    this.upload.isUploading = false;
                    this.$refs.upload.clearFiles();
                    this.$alert(response.msg || '导入成功', '导入结果', { type: response.code === 200 ? 'success' : 'error' });
                    this.getList();
                })
                .catch(() => {
                    this.upload.isUploading = false;
                });
        },
        // 获得上传文件信息
        handleUploadSuccess(fileList) {
            console.log('上传成功的文件列表：', fileList[0].url);
            this.form.fileUrl = fileList[0].url;
        },
        // 处理上传完成事件
        handleUploadComplete() {
            this.upload.open = false;
            this.getList(); // 刷新列表
            this.$message.success('文件上传成功');
        },
        // 处理对话框关闭事件
        handleDialogClosed() {
            // 清空上传文件列表
            this.form.fileUrl = null;
            if (this.$refs.fileUpload) {
                this.$refs.fileUpload.fileList = [];
                this.$refs.fileUpload.uploadList = [];
            }
        }
    }
};
</script>

<style scoped>
.mb8 {
    margin-bottom: 8px;
}
.remark-cell {
    max-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>

<style>
/* 自定义提示框样式 */
.remark-tooltip {
    max-width: 300px !important;
    white-space: normal !important;
    word-break: break-all !important;
    line-height: 1.5 !important;
}
</style>
