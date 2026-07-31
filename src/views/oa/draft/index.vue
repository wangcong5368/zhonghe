<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
            <el-form-item label="紧急程度" prop="urgencyLevel">
                <el-select v-model="queryParams.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%">
                    <el-option v-for="dict in dict.type.official_urgency_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="密级" prop="secrecy">
                <el-select v-model="queryParams.secrecy" placeholder="请选择密级" style="width: 100%">
                    <el-option v-for="dict in dict.type.official_secrecy" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="拟稿开始日期" prop="draftStartDate">
                <el-date-picker v-model="queryParams.draftStartDate" type="date" format="yyyy-MM-dd" placeholder="选择拟稿开始日期" style="width: 100%"></el-date-picker>
            </el-form-item>

            <el-form-item label="拟稿结束日期" prop="draftEndDate">
                <el-date-picker v-model="queryParams.draftEndDate" type="date" format="yyyy-MM-dd" placeholder="选择拟稿结束日期" style="width: 100%"></el-date-picker>
            </el-form-item>

            <el-form-item label="公文类型" prop="type">
                <el-select v-model="queryParams.type" placeholder="请选择公文类型" style="width: 100%">
                    <el-option label="收文发文" :value="0"></el-option>
                    <el-option label="普通发文" :value="1"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="标题" prop="mainTextTitile">
                <el-input v-model="queryParams.mainTextTitile" placeholder="请输入标题" clearable @keyup.enter.native="handleQuery" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['project:draft:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['project:draft:remove']">删除</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="draftList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="公文类型" align="center" prop="type">
                <template slot-scope="scope">
                    {{ scope.row.type == 0 ? '收文发文' : '普通发文' }}
                </template>
            </el-table-column>
            <el-table-column label="紧急程度" align="center" prop="urgencyLevelName" />
            <el-table-column label="秘密类型" align="center" prop="secrecyName" />
            <el-table-column label="份号" align="center" prop="partNumber" />
            <el-table-column label="发文机关标志" align="center" prop="officialLog" />
            <el-table-column label="发文字号" align="center" prop="wordSize" />
            <el-table-column label="签发人" align="center" prop="issuer" />
            <el-table-column label="标题" align="center" prop="title" />
            <el-table-column label="主送机关" align="center" prop="mainDeliveryAgency" />
            <!-- <el-table-column label="正文" align="center" prop="text" /> -->
            <el-table-column label="正文" align="center" prop="text">
                <template slot-scope="scope">
                    <div style="max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap" v-html="scope.row.text" class="content"></div>
                </template>
            </el-table-column>
            <el-table-column label="拟稿日期" align="center" prop="createTime" width="180">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <!--      <el-table-column label="附注" align="center" prop="annotations">
        <template slot-scope="scope">
          <div
            style="
              max-height: 40px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
            v-html="scope.row.annotations"
            class="content"
          ></div>
        </template>
      </el-table-column>
      <el-table-column label="发文机关署名" align="center" prop="sign" />
      <el-table-column label="抄送机关" align="center" prop="cc" />
      <el-table-column label="印发机关" align="center" prop="issuingAgency" />
      <el-table-column
        label="印发日期"
        align="center"
        prop="issuingDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.issuingDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="内部发送"
        align="center"
        prop="internalCirculation"
      />
      <el-table-column label="联系人" align="center" prop="contactPerson" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" />
      <el-table-column
        label="附件说明"
        align="center"
        prop="attachmentDescription"
      >
        <template slot-scope="scope">
          <div
            style="
              max-height: 40px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
            v-html="scope.row.attachmentDescription"
            class="content"
          ></div>
        </template>
      </el-table-column>-->
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleSubmit(scope.row)">提交</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)">详情</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改公文管理草稿对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="公文类型" prop="type">
                    <el-input v-model="form.type" placeholder="请输入公文类型" />
                </el-form-item>
                <el-form-item label="代字/红头" prop="officialHeader">
                    <el-input v-model="form.officialHeader" placeholder="请输入代字/红头" />
                </el-form-item>
                <el-form-item label="文种" prop="genre">
                    <el-input v-model="form.genre" placeholder="请输入文种" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <AddDialog ref="addDialog" :formData="form" :title="title" :userList="userList" :comprehensiveList="comprehensiveList" :controls="controls" :close="close" @cancel="getList()" />
    </div>
</template>

<script>
import { listDraft, getDetail, submitDraft, updateDraft, deleteDraft, submitDraftById } from '@/api/oa/document';
import { getAllUser, getComprehensiveList } from '@/api/oa/publicApi.js';
import AddDialog from './addDialog.vue';

export default {
    name: 'Draft',
    dicts: ['sys_normal_disable', 'official_secrecy', 'official_urgency_level'],
    components: { AddDialog },
    data() {
        return {
            controls: null,
            // 遮罩层
            loading: false,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            // 显示搜索条件
            showSearch: true,
            // 总条数
            total: 0,
            // 公文管理草稿表格数据
            draftList: [],
            // 弹出层标题
            title: '',
            // 是否显示弹出层
            open: false,
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                type: null,
                officialHeader: null,
                urgencyLevel: null,
                genre: null,
                secrecy: null,
                leadDept: null,
                issuance: null,
                direct: null,
                createDate: null,
                issuanceDate: null,
                mainTextTitile: null,
                attachmentTitle: null,
                userId: null,
                phoneNumber: null,
                reviewing: null,
                mainRecipient: null,
                carbonCopy: null,
                fileUrl: null,
                subject: null,
                issuingAuthority: null,
                createId: null,
                updateId: null,
                status: null,
                archiving: null,
                draftStartDate: null,
                draftEndDate: null
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                createId: [{ required: true, message: '创建者不能为空', trigger: 'blur' }],
                createTime: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }]
            },
            userList: [],
            comprehensiveList: [],
            isView: false
        };
    },
    created() {
        this.getList();
        this.getComprehensiveList();
        this.getUserList();
        // 监听刷新列表事件
        this.$bus.$on('refreshDraftList', this.getList);
    },
    // 在组件销毁前移除事件监听
    beforeDestroy() {
        this.$bus.$off('refreshDraftList', this.getList);
    },
    methods: {
        //获取综合岗角色
        getComprehensiveList() {
            getComprehensiveList().then(res => {
                this.comprehensiveList = res.data;
            });
        },
        // 获取所有角色
        getUserList() {
            getAllUser().then(res => {
                this.userList = res.data;
            });
        },
        /** 查询公文管理草稿列表 */
        getList() {
            this.loading = true;
            listDraft(this.queryParams).then(response => {
                this.draftList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
        },
        // 取消按钮
        cancel() {
            this.open = false;
            this.reset();
        },
        // 表单重置
        reset() {
            this.form = {
                id: null,
                type: null,
                officialHeader: null,
                urgencyLevel: null,
                genre: null,
                secrecy: null,
                leadDept: null,
                issuance: null,
                direct: null,
                createDate: null,
                issuanceDate: null,
                mainTextTitile: null,
                attachmentTitle: null,
                userId: null,
                phoneNumber: null,
                reviewing: null,
                mainRecipient: null,
                carbonCopy: null,
                filePath: null,
                subject: null,
                issuingAuthority: null,
                createId: null,
                createTime: null,
                updateId: null,
                updateTime: null,
                remark: null,
                status: null,
                delFlag: null,
                archiving: null
            };
            this.resetForm('form');
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
        // 多选框选中数据
        handleSelectionChange(selection) {
            this.ids = selection.map(item => item.id);
            this.single = selection.length !== 1;
            this.multiple = !selection.length;
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.title = '添加公文管理草稿';
            this.$refs.addDialog.open();
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.controls = 'update';
            this.reset();
            const id = row.id || this.ids;
            getDetail(id).then(response => {
                this.$refs.addDialog.open(response.data, response.data.filePath);
                this.title = '修改公文管理草稿';
            });
        },
        /** 详情按钮 */
        async handleDetail(row) {
            this.controls = 'view';
            this.reset();
            const id = row.id || this.ids;
            const data = await getDetail(id);
            this.$refs.addDialog.open(data.data);
            this.title = '公文管理草稿详情';
        },
        close() {
            this.controls = '';
        },
        /** 提交按钮 */
        handleSubmit(row) {
            submitDraftById({ id: row.id }).then(res => {
                this.getList();
                this.$modal.msgSuccess('提交成功');
            });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download(
                'project/draft/export',
                {
                    ...this.queryParams
                },
                `draft_${new Date().getTime()}.xlsx`
            );
        },
        /** 删除操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$modal
                .confirm('是否确认删除公文管理草稿编号为"' + ids + '"的数据项？')
                .then(() => {
                    return deleteDraft(ids);
                })
                .then(() => {
                    this.getList();
                    this.$modal.msgSuccess('删除成功');
                })
                .catch(() => {});
        }
    }
};
</script>
