<template>
    <div class="app-container">

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   >新增</el-button>
                <!-- <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['document:co:organizer:user']">新增</el-button> -->
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['project:draft:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple"
                    @click="handleDelete" v-hasPermi="['project:draft:remove']">删除</el-button>
            </el-col>
            <right-toolbar @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange"
            >
            <!-- <el-table-column type="selection" width="55" align="center" /> -->
            <el-table-column label="序号" align="center" type="index" width="50" />
            <el-table-column label="收文日期" align="center" prop="createTime"/>
            <el-table-column label="收文编号" align="center" prop="wordSize" />
            <el-table-column label="收文类型" align="center" prop="type">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.document_receive_type" :value="scope.row.type" />
                </template>
            </el-table-column>
            <el-table-column label="来文单位" align="center" prop="cc" width="150">
                <template slot-scope="scope">
                    <el-tooltip :content="scope.row.cc" placement="top" :disabled="!scope.row.cc || scope.row.cc.length <= 20">
                        <div class="text-ellipsis-2" style="text-align: center;">{{ scope.row.cc }}</div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="标题" align="center" prop="title" width="200">
                <template slot-scope="scope">
                    <el-tooltip :content="scope.row.title" placement="top" :disabled="!scope.row.title || scope.row.title.length <= 30">
                        <div class="text-ellipsis-2" style="text-align: center;">{{ scope.row.title }}</div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <!-- <el-table-column label="紧急程度" align="center" width="150" prop="urgencyLevel">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.official_urgency_level" :value="scope.row.urgencyLevel" />
                </template>
            </el-table-column> -->
            <!-- <el-table-column label="经办人" align="center" prop="handlerName">
                <template slot-scope="scope">
                    {{ getHandlerName(scope.row.handlerId) }}
                </template>
            </el-table-column> -->
            <el-table-column label="收文状态" align="center" prop="status">
                <template slot-scope="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
                >
                <template slot-scope="scope">
                    <el-button type="text" @click="handleDetail(scope.row)">
                        <i class="el-icon-view"></i> {{ scope.row.processStatus === 0 ? '处理' : '详情' }}
                    </el-button>
                    <!-- <el-dropdown trigger="hover" @command="handleCommand">
                        <span class="el-dropdown-link">
                            <i class="el-icon-more"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <!-- 查看按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'detail', row: scope.row }">
                                <i class="el-icon-view"></i>
                                详情
                            </el-dropdown-item> -->

                    <!-- 修改并重新提交按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'resubmit', row: scope.row }"
                                v-if="scope.row.processStatus === 0 && scope.row.status === 1">
                                <i class="el-icon-edit"></i>
                                修改并重新提交
                            </el-dropdown-item> -->

                    <!-- 办理按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'process', row: scope.row }"
                                v-if="scope.row.processStatus === 0 && scope.row.status !== 1 && scope.row.status !== 21 && scope.row.readButton === null && scope.row.status !== 22">
                                <i class="el-icon-s-promotion"></i>
                                办理
                            </el-dropdown-item> -->

                    <!-- 确认接收按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'confirm', row: scope.row }"
                                v-if="scope.row.readButton === 3 && userPermissions.canDepartmentReadConfirm">
                                <i class="el-icon-check"></i>
                                已阅
                            </el-dropdown-item> -->

                    <!-- 部门办结按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'secretaryComplete', row: scope.row }"
                                v-if="scope.row.readButton === 1 && userPermissions.canDepartmentReadConfirm">
                                <i class="el-icon-check"></i>
                                部门办结
                            </el-dropdown-item> -->

                    <!-- 部门经理分发按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'leaderDistribute', row: scope.row }"
                                v-if="scope.row.readButton === 5">
                                <i class="el-icon-s-promotion"></i>
                                部门经理分发
                            </el-dropdown-item> -->

                    <!-- 收文部门经理分发按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'receiveLeaderDistribute', row: scope.row }"
                                v-if="scope.row.readButton === 2 && userPermissions.isDocumentLeader">
                                <i class="el-icon-s-promotion"></i>
                                部门分发
                            </el-dropdown-item> -->

                    <!-- 部门经理已阅按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'leaderConfirm', row: scope.row }"
                                v-if="scope.row.readButton === 2 && userPermissions.isDocumentLeader">
                                <i class="el-icon-check"></i>
                                部门经理已阅
                            </el-dropdown-item> -->

                    <!-- 查看处理流程按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'viewProcess', row: scope.row }">
                                <i class="el-icon-view"></i>
                                查看处理流程
                            </el-dropdown-item> -->

                    <!-- 查看分发进度按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'viewProgress', row: scope.row }"
                                v-if="hasPermission('document:co:organizer:user') || userPermissions.isDocumentLeader">
                                <i class="el-icon-s-data"></i>
                                查看分发进度
                            </el-dropdown-item> -->

                    <!-- 删除按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'delete', row: scope.row }"
                                v-if="canDeleteDocument(scope.row)" style="color: #f56c6c;">
                                <i class="el-icon-delete"></i> 删除
                            </el-dropdown-item> -->

                    <!-- 公文办结按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'officialComplete', row: scope.row }"
                                v-if="scope.row.processStatus === 0 && scope.row.status === 22">
                                <i class="el-icon-check"></i>
                                公文办结
                            </el-dropdown-item> -->
                    <!-- </el-dropdown-menu>
                    </el-dropdown>  -->
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <documentDialog ref="documentDialog" :formData="form" :title="title" :isView="isView"
            :directorList="directorList" :filteredUsers="filteredUsers" :isProcessMode="isProcessMode"
            :processType="processType" @submit-process="handleDialogSubmitProcess" @cancel="handleDialogCancel" />

        <!-- 流程处理对话框 -->
        <el-dialog :title="title" :visible.sync="processDialog" width="500px" append-to-body
            @close="handleProcessDialogClose">
            <el-form ref="processForm" :model="processForm" label-width="100px">
                <!-- 主任室审核 -->
                <el-form-item label="办理结果" v-if="processType === 'directorProcess'">
                    <el-radio-group v-model="processForm.status">
                        <el-radio label="1">通过</el-radio>
                        <el-radio label="2">拒绝</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 综合岗办理 - 选择主任岗 -->
                <el-form-item label="批示人" v-if="processType === 'comprehensiveProcess'">
                    <el-select v-model="processForm.directorIds" multiple placeholder="请选择批示人" style="width: 100%">
                        <el-option v-for="item in directorList" :key="item.userId" :label="item.nickName"
                            :value="item.userId"></el-option>
                    </el-select>
                </el-form-item>

                <!-- 部门经理分发 - 选择人员 -->
                <el-form-item label="分发人员"
                    v-if="processType === 'leaderDistribute' || processType === 'receiveLeaderDistribute'">
                    <el-select v-model="processForm.userIds" multiple placeholder="请选择分发人员" style="width: 100%">
                        <el-option v-for="item in filteredUsers" :key="item.id" :label="item.label" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>

                <!-- 公文分办 - 附件管理 -->
                <el-form-item label="附件"
                    v-if="processType === 'leaderDistribute' || processType === 'receiveLeaderDistribute'">
                    <FileUpload @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted"
                        ref="processFileUpload" :file-list="processForm.filePath" />
                </el-form-item>

                <!-- 审核意见 -->
                <el-form-item
                    :label="processType === 'leaderDistribute' || processType === 'receiveLeaderDistribute' ? '备注' : '批示意见'"
                    v-if="processType !== 'comprehensiveEnd'">
                    <el-input v-model="processForm.remark" type="textarea"
                        :placeholder="processType === 'leaderDistribute' || processType === 'receiveLeaderDistribute' ? '请输入备注' : '请输入批示意见'"></el-input>
                    <QuickReply :onSelect="handleSelectPhrase" :superviseId="processForm.docId"
                        :inputContent="processForm.remark" @collected="handleCollected" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="processDialog = false">取 消</el-button>
                <el-button type="primary" @click="submitProcess">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 处理流程弹窗 -->
        <el-dialog title="处理流程" :visible.sync="processHistoryDialog" width="600px" append-to-body>
            <div class="timeline-container">
                <el-timeline>
                    <el-timeline-item v-for="(item, index) in historicalRecord" :key="index"
                        :timestamp="formatTime(item.processTime)" placement="top" :type="getStatusType(item.status)">
                        <div class="history-item">
                            <div class="history-header">
                                <span class="history-title">{{ item.returnRemark || '处理流程' }}</span>
                                <el-tag size="mini" :type="getStatusTagType(item.status)">
                                    {{ getProcessStatusName(item.status) }}
                                </el-tag>
                            </div>
                            <div class="history-info" v-if="item.nickName">
                                <span class="info-label">处理人：</span>
                                <span class="info-value">{{ item.nickName }}—{{ item.deptName }}</span>
                            </div>
                            <div class="history-info" v-if="item.remark">
                                <span class="info-label">处理意见：</span>
                                <span class="info-value">{{ item.remark }}</span>
                            </div>
                        </div>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>

        <!-- 分发进度弹窗 -->
        <el-dialog title="分发进度" :visible.sync="progressDialog" width="600px" append-to-body>
            <div class="timeline-container">
                <el-timeline>
                    <el-timeline-item v-for="(item, index) in progressRecord" :key="index"
                        :timestamp="formatTime(item.processTime)" placement="top" :type="getStatusType(item.status)">
                        <div class="history-item">
                            <div class="history-header">
                                <span class="history-title">{{ item.status === 0 ? '未阅读' : "已读" }}</span>
                                <el-tag size="mini" :type="getStatusTagType(item.status)">
                                    {{ getProcessStatusName(item.status) }}
                                </el-tag>
                            </div>
                            <div class="history-info" v-if="item.nickName">
                                <span class="info-label">处理人：</span>
                                <span class="info-value">{{ item.nickName }}</span>
                            </div>
                            <div class="history-info" v-if="item.remark">
                                <span class="info-label">处理意见：</span>
                                <span class="info-value">{{ item.remark }}</span>
                            </div>
                        </div>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>

        <!-- 部门分发对话框 -->
        <el-dialog title="部门分发" :visible.sync="deptDistributeDialog" width="500px" append-to-body
            @close="handleDeptDistributeDialogClose">
            <el-form ref="deptDistributeForm" :model="deptDistributeForm" label-width="100px"
                class="dept-distribute-form">
                <el-form-item label="分发人员" prop="userIds"
                    :rules="[{ required: true, message: '请选择分发人员', trigger: 'change' }]">
                    <el-select v-model="deptDistributeForm.userIds" multiple placeholder="请选择分发人员" style="width: 100%"
                        filterable>
                        <el-option v-for="item in currentDeptUsers" :key="item.userId" :label="item.nickName"
                            :value="item.userId">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="deptDistributeDialog = false">取 消</el-button>
                <el-button type="primary" @click="submitDeptDistribute">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { listDocumentHandle, getDetail } from '@/api/oa/documentManagement';
import { dispatchAllDetails } from '@/api/oa/documentReceive';
import { selectDocumentProcessListByDocId, getDeptLeaderUserTreeList } from '@/api/oa/document';
import {
    documentReceivingComprehensive,
    documentReceivingDirectorCheck,
    documentReceivingLeaderDistribute,
    documentReceivingLeaderCompleted,
    documentReceivingUserConfirm,
    documentReceivingEnd,
    checkTheProgress,
    getUserPermission,
    dispatchDepartmentSelect,
    deleteDocument
} from '@/api/oa/documentReceive';
import { departmentalDistribution, readingConfirmation, officialDocumentHasBeenCompleted } from '@/api/oa/documentManagement';
import documentDialog from './documentDialog.vue';
import { getAllUser, getComprehensiveList, getDirectorList, getDocumentDict, getDeptUserTree } from '@/api/oa/publicApi.js';
import { mapGetters } from 'vuex';
import { getUserListByDeptId } from '@/api/oa/publicApi.js';
import QuickReply from '@/components/quickReply/index.vue';
import FileUpload from '@/components/FileUpload/index.vue'; // 导入 FileUpload 组件

export default {
    name: 'documentReceive',
    props: {},
    components: { documentDialog, QuickReply, FileUpload }, // 注册 FileUpload 组件
    dicts: ['official_document_type', 'official_urgency_level', 'official_secrecy', 'document_receive_type'],
    data() {
        return {
            loading: false,
            list: [],
            total: 0,
            ids: [],
            single: true,
            multiple: true,
            isView: false, // 是否为查看模式
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                type: 0,
                urgencyLevel: undefined,
                secrecy: undefined,
                createTime: undefined,
                draftEndDate: undefined,
                title: undefined,
                partNumber: undefined,
                wordSize: undefined,
                issuer: undefined,
                mainDeliveryAgency: undefined
            },
            userList: [],
            form: {},
            comprehensiveList: [],
            directorList: [], // 主任岗列表
            documentTemplates: [], // 公文套头模板
            title: null,
            // 流程处理相关数据
            processDialog: false,
            processForm: {
                docId: null,
                status: '1', // 默认通过
                remark: '',
                directorIds: [], // 批示人ids
                returnStatus: '0', // 默认退回上一步
                word: '', // 套头模板
                userIds: [],
                filePath: [] // 附件列表
            },
            processType: '', // 当前处理的流程类型
            historicalRecord: [],
            deptLeaderUserTreeList: [],
            progressRecord: [],
            processHistoryDialog: false,
            progressDialog: false,
            filteredUsers: [], // 格式化后的经办人列表
            userPermissions: {
                isDocumentLeader: false, // 是否有收文部门经理岗权限
                canDepartmentReadConfirm: false // 是否有收文部门人员阅读确认权限
            },
            deptDistributeDialog: false, // 部门分发对话框
            deptDistributeForm: {
                userIds: []
            },
            currentDeptUsers: [], // 当前部门的用户列表
            currentDocumentId: null // 当前操作的文档ID
            ,
            isProcessMode: false,
            processType: ''
        };
    },
    watch: {},
    computed: {
        ...mapGetters(['permissions', 'userInfo'])
    },
    created() {
        this.getList();
        this.getComprehensiveList();
        this.getUserList();
        this.getDirectorList();
        this.getDocumentTemplates();
        getDeptLeaderUserTreeList().then(res => {
            this.deptLeaderUserTreeList = res.data;
            this.filterUsers(); // 调用过滤方法
        });
        getUserPermission("project:document:selectDocumentArchivelist").then(res => {
            console.log(res.data, "用户权限");
        });

        // 检查收文部门经理岗权限
        getUserPermission('document:leader:user').then(res => {
            console.log('收文部门经理岗权限检查结果:', res);
            this.userPermissions.isDocumentLeader = res.code === 200 && res.data;
        }).catch(err => {
            console.error('权限检查失败:', err);
            this.userPermissions.isDocumentLeader = false;
        });

        // 检查收文部门人员阅读确认权限
        this.userPermissions.canDepartmentReadConfirm = this.hasPermission('project:document:departmentReadConfirm');

        // 获取当前部门用户列表
        this.getCurrentDeptUsers();
    },
    mounted() {
        console.log(this.userInfo, "用户信息");
        getDeptUserTree().then(res => {
            // this.deptUserTreeList = res.data;
            console.log(res.data, "树");
        });
    },
    methods: {
        handleDialogCancel() {
            // 关闭对话框后刷新列表并还原状态
            this.getList();
            this.isProcessMode = false;
            this.processType = '';
            this.isView = false;
        },
        handleDialogSubmitProcess(payload) {
            const { processType, docId } = payload;
            if (processType === 'comprehensiveProcess') {
                if (!payload.directorIds) {
                    this.$message.error('请选择批示人');
                    return;
                }
                const params = { docId, directorIds: payload.directorIds, remark: payload.remark };
                documentReceivingComprehensive(params).then(() => {
                    this.$modal.msgSuccess('处理成功');
                    this.getList();
                });
            } else if (processType === 'directorProcess') {
                const params = { docId, status: payload.status, remark: payload.remark };
                documentReceivingDirectorCheck(params).then(() => {
                    this.$modal.msgSuccess('处理成功');
                    this.getList();
                });
            } else if (processType === 'leaderDistribute') {
                if (!payload.userIds) {
                    this.$message.error('请选择分发人员');
                    return;
                }
                const params = { docId, userIds: payload.userIds, remark: payload.remark, filePath: payload.filePath };
                documentReceivingLeaderDistribute(params).then(() => {
                    this.$modal.msgSuccess('处理成功');
                    this.getList();
                });
            }
            // 关闭对话框
            this.$refs.documentDialog.visible = false;
        },
        // 格式化时间
        formatTime(time) {
            if (!time) return '未知时间';
            return new Date(time).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },
        // 获取时间线项目类型
        getStatusType(status) {
            const typeMap = {
                0: 'info',
                1: 'success',
                2: 'success',
                3: 'warning',
                4: 'danger'
            };
            return typeMap[status] || '';
        },
        // 获取状态对应的标签类型
        getStatusTagType(status) {
            const typeMap = {
                0: 'info',
                1: 'success',
                2: 'success',
                3: 'warning',
                4: 'danger'
            };
            return typeMap[status] || '';
        },
        // 获取处理状态名称
        getProcessStatusName(status) {
            const statusMap = {
                0: '待办',
                1: '已办',
                2: '通过',
                3: '退回',
                4: '已被退回'
            };
            return statusMap[status] || '未知';
        },
        // 获取公文处理详情
        selectDocumentProcessListByDocId(id) {
            selectDocumentProcessListByDocId({ id }).then(res => {
                this.historicalRecord = res.data;
                this.processHistoryDialog = true;
            });
        },
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
        // 获取主任岗角色
        getDirectorList() {
            getDirectorList().then(res => {
                this.directorList = res.data;
            });
        },
        // 获取公文套头模板
        getDocumentTemplates() {
            getDocumentDict().then(res => {
                this.documentTemplates = res.data;
            });
        },
        getList() {
            this.loading = true;
            // 获取文档列表
            listDocumentHandle(this.queryParams)
                .then(res => {
                    this.list = res.rows;
                    this.total = res.total;
                    this.loading = false;
                })
                .catch(() => {
                    this.loading = false;
                });
        },

        reset() {
            this.form = {
                id: null,
                type: 0,
                wordSize: null,
                sourceUnit: null,
                title: null,
                urgencyLevel: null,
                handlerId: [],
                filePath: null
            };
        },

        handleSelectionChange(selection) {
            // 表格选择项变化处理
            this.ids = selection.map(item => item.id);
            this.single = selection.length !== 1;
            this.multiple = !selection.length;
        },
        handleAdd() {
            // 跳转到新增收文处理单页面
            this.$router.push('/document/documentReceiveAdd');
        },
        handleDetail(row) {
            this.reset();
            const id = row.id || this.ids;
            this.$router.push({ path: '/document/documentReceiveAdd', query: { id: id } });
        },
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            getDetail(id).then(response => {
                this.form = response.data;
                this.title = '修改公文';
                this.isView = false;
                this.$refs.documentDialog.open(response.data);
            });
        },
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$confirm('是否确认删除选中的数据项?', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    // 这里需要添加删除API
                    this.$modal.msgSuccess('删除成功');
                    this.getList();
                })
                .catch(() => { });
        },
        // 处理流程
        handleProcess(row) {
            this.resetProcessForm(row.id); // 重置表单
            // 根据状态确定当前处理类型
            switch (row.status) {
                case 2: // 综合岗办理
                    this.processType = 'comprehensiveProcess';
                    this.title = '批示';
                    // 如果批示人列表中有名为"孙强"的用户，默认选中
                    const sunQiang = this.directorList.find(user => user.nickName === '孙强');
                    if (sunQiang) {
                        this.processForm.directorIds = [sunQiang.userId];
                    }
                    break;
                case 3: // 主任岗办理
                    this.processType = 'directorProcess';
                    this.title = '签批意见';
                    break;
                case 4: // 部门经理分发
                    this.processType = 'leaderDistribute';
                    this.title = '公文分办';

                    // 反显经办人
                    if (row.handlerId) {
                        const handlerIds = typeof row.handlerId === 'string' ?
                            row.handlerId.split(',').map(id => Number(id)) :
                            [row.handlerId];
                        this.processForm.userIds = handlerIds;
                    }

                    // 处理附件数据
                    if (row.filePath) {
                        const filePaths = row.filePath.split(',').filter(path => path.trim());
                        this.processForm.filePath = filePaths.map((path, index) => ({
                            id: `existing_${index}`,
                            name: path.split('/').pop(),
                            url: path.trim(),
                            isExisting: true
                        }));
                    } else {
                        this.processForm.filePath = [];
                    }

                    break;
                case 5: // 综合岗办结
                    this.processType = 'comprehensiveEnd';
                    this.title = '综合岗办结1';
                    // 直接确认办结，可以不显示对话框
                    this.$confirm('确定要办结此公文吗?', '综合岗办结1', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                        .then(() => {
                            documentReceivingEnd({ docId: row.id }).then(() => {
                                this.$modal.msgSuccess('办结成功');
                                this.getList();
                            });
                        })
                        .catch(() => { });
                    return;
                default:
                    this.$message.error('未知的处理状态');
                    return;
            }

            this.isProcessMode = true;
            this.$refs.documentDialog.open({ ...this.processForm });
        },

        // 重置流程表单
        resetProcessForm(docId = null) {
            this.processForm = {
                docId: docId,
                status: '1',
                remark: '',
                directorIds: [],
                returnStatus: '0',
                word: '',
                userIds: [],
                filePath: []
            };
        },

        // 提交流程处理
        submitProcess() {
            if (this.processType === 'directorProcess') {
                // 主任室审核
                const params = {
                    docId: this.processForm.docId,
                    status: this.processForm.status,
                    remark: this.processForm.remark
                };
                documentReceivingDirectorCheck(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.processDialog = false;
                    this.getList();
                });
            } else if (this.processType === 'comprehensiveProcess') {
                // 综合岗办理
                if (!this.processForm.directorIds || this.processForm.directorIds.length === 0) {
                    this.$message.error('请选择批示人');
                    return;
                }

                const params = {
                    docId: this.processForm.docId,
                    directorIds: this.processForm.directorIds.join(','),
                    remark: this.processForm.remark
                };

                documentReceivingComprehensive(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.processDialog = false;
                    this.getList();
                });
            } else if (this.processType === 'leaderDistribute') {
                // 部门经理分发
                if (!this.processForm.userIds || this.processForm.userIds.length === 0) {
                    this.$message.error('请选择分发人员');
                    return;
                }

                // 处理附件数据
                let filePathStr = '';
                if (this.processForm.filePath && Array.isArray(this.processForm.filePath) && this.processForm.filePath.length > 0) {
                    filePathStr = this.processForm.filePath.map(file => {
                        // 如果是已存在的附件，返回原始路径；如果是新上传的，返回新路径
                        return file.isExisting ? file.url : (file.url || file.path);
                    }).join(',');
                } else if (typeof this.processForm.filePath === 'string' && this.processForm.filePath.trim()) {
                    // 如果filePath是字符串，直接使用
                    filePathStr = this.processForm.filePath;
                }

                const params = {
                    docId: this.processForm.docId,
                    userIds: this.processForm.userIds.join(','),
                    remark: this.processForm.remark,
                    filePath: filePathStr
                };

                documentReceivingLeaderDistribute(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.processDialog = false;
                    this.getList();
                });
            } else if (this.processType === 'receiveLeaderDistribute') {
                // 收文部门分发
                if (!this.processForm.userIds || this.processForm.userIds.length === 0) {
                    this.$message.error('请选择分发人员');
                    return;
                }

                // 处理附件数据
                let filePathStr = '';
                if (this.processForm.filePath && Array.isArray(this.processForm.filePath) && this.processForm.filePath.length > 0) {
                    filePathStr = this.processForm.filePath.map(file => {
                        // 如果是已存在的附件，返回原始路径；如果是新上传的，返回新路径
                        return file.isExisting ? file.url : (file.url || file.path);
                    }).join(',');
                } else if (typeof this.processForm.filePath === 'string' && this.processForm.filePath.trim()) {
                    // 如果filePath是字符串，直接使用
                    filePathStr = this.processForm.filePath;
                }

                const params = {
                    docId: this.processForm.docId,
                    userIds: this.processForm.userIds.join(','),
                    remark: this.processForm.remark,
                    filePath: filePathStr
                };

                // 使用发文的部门分发API
                departmentalDistribution(params).then(res => {
                    this.$modal.msgSuccess('分发成功');
                    this.processDialog = false;
                    this.getList();
                });
            }
        },
        // 处理重新提交
        handleResubmit(row) {
            this.reset();
            const id = row.id;
            getDetail(id).then(response => {
                this.form = response.data;
                this.title = '修改并重新提交';
                this.isView = false;

                // 设置表单提交方法为重新提交
                this.$refs.documentDialog.open(response.data);
                this.$refs.documentDialog.setSubmitAction('resubmit');
            });
        },
        // 获取发文状态对应的标签类型
        getStatusTagType(status) {
            const typeMap = {
                1: 'warning', // 待修改
                2: 'info', // 综合岗办理
                3: 'info', // 主任室审核
                4: 'info', // 部门经理分发
                21: 'info', // 部门人员确认
                22: 'info', // 部门办结
                5: 'success', // 综合岗办结
                6: 'success', // 已办结
                20: 'info', // 收文部门分发
                22: 'info' // 待综合部公文办结
            };
            return typeMap[status] || 'info';
        },

        // 获取发文状态名称
        getStatusName(status) {
            const statusMap = {
                1: '待修改',
                2: '综合经理审批',
                3: '主任批示',
                4: '公文分办',
                21: '部门人员确认',
                22: '部门办结',
                5: '已办结',
                6: '已办结',
                20: '收文部门处理',
                22: "公文办结"
            };
            return statusMap[status] || '未知状态';
        },
        hasPermission(permission) {
            return this.permissions.some(p => p === permission);
        },
        checkProgress(docId) {
            checkTheProgress({ docId, roleStatus: 2 }).then(res => {
                this.progressRecord = res.data;
                this.progressDialog = true;
            });
        },
        confirmReceipt(docId) {
            this.$confirm('确定已阅?', '已阅', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            })
                .then(() => {
                    documentReceivingUserConfirm({ docId }).then(res => {
                        this.$modal.msgSuccess('提交成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        handleCommand(command) {
            if (command.type === 'detail') {
                this.handleDetail(command.row);
            } else if (command.type === 'resubmit') {
                this.handleResubmit(command.row);
            } else if (command.type === 'process') {
                this.handleProcess(command.row);
            } else if (command.type === 'confirm') {
                this.confirmReceipt(command.row.id);
            } else if (command.type === 'viewProcess') {
                this.selectDocumentProcessListByDocId(command.row.id);
            } else if (command.type === 'viewProgress') {
                this.checkProgress(command.row.id);
            } else if (command.type === 'secretaryComplete') {
                this.handleSecretaryComplete(command.row);
            } else if (command.type === 'leaderDistribute') {
                this.handleLeaderDistribute(command.row);
            } else if (command.type === 'receiveLeaderDistribute') {
                this.handleReceiveLeaderDistribute(command.row);
            } else if (command.type === 'receiveUserConfirm') {
                this.handleReceiveUserConfirm(command.row);
            } else if (command.type === 'leaderConfirm') {
                this.confirmReceipt(command.row.id);
            } else if (command.type === 'delete') {
                this.handleDeleteDocument(command.row);
            } else if (command.type === 'officialComplete') {
                this.handleOfficialComplete(command.row);
            }
        },
        // 处理部门经理分发
        handleLeaderDistribute(row) {
            this.resetProcessForm(row.id); // 重置表单
            this.processType = 'leaderDistribute';
            this.title = '公文分办';

            // 反显经办人
            if (row.handlerId) {
                const handlerIds = typeof row.handlerId === 'string' ?
                    row.handlerId.split(',').map(id => Number(id)) :
                    [row.handlerId];
                this.processForm.userIds = handlerIds;
            }

            // 处理附件数据
            if (row.filePath) {
                const filePaths = row.filePath.split(',').filter(path => path.trim());
                this.processForm.filePath = filePaths.map((path, index) => ({
                    id: `existing_${index}`,
                    name: path.split('/').pop(),
                    url: path.trim(),
                    isExisting: true
                }));
            } else {
                this.processForm.filePath = [];
            }

            this.processDialog = true;
        },
        // 处理部门办结
        handleSecretaryComplete(row) {
            this.$confirm('确定要办结此公文吗?', '部门办结', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    documentReceivingLeaderCompleted({ docId: row.id }).then(() => {
                        this.$modal.msgSuccess('办结成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        // 处理收文部门经理分发
        handleReceiveLeaderDistribute(row) {
            // 直接打开部门分发对话框
            this.openDeptDistributeDialog(row.id);
        },
        // 处理收文人员阅读确认
        handleReceiveUserConfirm(row) {
            this.$confirm('确定要确认阅读此公文吗?', '阅读确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            })
                .then(() => {
                    readingConfirmation({ docId: row.id }).then(res => {
                        this.$modal.msgSuccess('确认成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        // 处理表格行点击事件
        handleRowClick(row) {
            this.selectDocumentProcessListByDocId(row.id);
        },
        // 过滤用户列表，将部门和用户名组合在一起
        filterUsers() {
            this.filteredUsers = [];
            const traverse = dept => {
                if (dept.userList && dept.userList.length > 0) {
                    dept.userList.forEach(user => {
                        if (user.userId) {
                            this.filteredUsers.push({
                                id: user.userId,
                                label: `${dept.deptName} / ${user.nickName || user.userName}`
                            });
                        }
                    });
                }
                if (dept.children && dept.children.length > 0) {
                    dept.children.forEach(child => traverse(child));
                }
            };
            // 从根部门开始遍历
            this.deptLeaderUserTreeList.forEach(dept => traverse(dept));
        },
        // 根据handlerId获取经办人名称
        getHandlerName(handlerId) {
            if (!handlerId) return '未指定';

            // 如果是字符串，转换为数组
            const handlerIds = typeof handlerId === 'string' ? handlerId.split(',') : [handlerId];

            const handlerNames = handlerIds.map(id => {
                const handler = this.filteredUsers.find(user => user.id == id);
                return handler ? handler.label : '未知';
            });

            return handlerNames.join(', ');
        },
        // 处理快速回复选择
        handleSelectPhrase(phrase) {
            this.processForm.remark = this.processForm.remark + phrase;
        },
        // 处理快速回复收集成功
        handleCollected(content) {
            console.log('收藏成功:', content);
        },
        // 处理附件上传成功
        handleUploadSuccess(file) {
            // 确保 filePath 是数组类型
            if (!Array.isArray(this.processForm.filePath)) {
                this.processForm.filePath = [];
            }

            // 添加新上传的附件
            this.processForm.filePath.push({
                id: `new_${Date.now()}`,
                name: file.name || file.fileName,
                url: file.url || file.path,
                isExisting: false
            });
        },
        // 处理附件删除
        handleFileDeleted(file) {
            // 确保 filePath 是数组类型
            if (!Array.isArray(this.processForm.filePath)) {
                this.processForm.filePath = [];
                return;
            }

            this.processForm.filePath = this.processForm.filePath.filter(f => f.id !== file.id);
        },
        // 处理流程对话框关闭
        handleProcessDialogClose() {
            // 清理 FileUpload 组件的文件列表
            if (this.$refs.processFileUpload) {
                this.$refs.processFileUpload.clearFiles();
            }
            // 重置附件数据
            this.processForm.filePath = [];
        },
        // 处理部门分发对话框关闭
        handleDeptDistributeDialogClose() {
            this.$nextTick(() => {
                if (this.$refs.deptDistributeForm) {
                    this.$refs.deptDistributeForm.resetFields();
                }
            });
            this.currentDocumentId = null;
        },
        // 提交部门分发
        submitDeptDistribute() {
            this.$refs.deptDistributeForm.validate(valid => {
                if (valid) {
                    const params = {
                        docId: this.currentDocumentId,
                        userIds: this.deptDistributeForm.userIds.join(',')
                    };

                    // 使用部门分发专用API
                    dispatchDepartmentSelect(params).then(res => {
                        this.$modal.msgSuccess('部门分发成功');
                        this.deptDistributeDialog = false;
                        this.getList();
                    }).catch(err => {
                        console.error('部门分发失败:', err);
                        this.$modal.msgError('部门分发失败，请重试');
                    });
                }
            });
        },
        // 打开部门分发对话框
        openDeptDistributeDialog(docId) {
            this.currentDocumentId = docId; // 存储文档ID
            this.deptDistributeForm.userIds = []; // 清空已选用户

            this.deptDistributeDialog = true;

            // 延迟清除表单验证
            this.$nextTick(() => {
                if (this.$refs.deptDistributeForm) {
                    this.$refs.deptDistributeForm.clearValidate();
                }
            });
        },
        // 获取当前部门用户列表
        getCurrentDeptUsers() {
            const userInfo = this.userInfo;
            if (userInfo && userInfo.deptId) {
                getDeptUserTree().then(res => {
                    const getUsersByDeptId = (deptId) => {
                        const result = [];
                        const findUsers = (departments) => {
                            departments.forEach((dept) => {
                                if (dept.deptId === deptId) {
                                    // 如果当前部门匹配，添加 userList
                                    if (dept.userList && dept.userList.length > 0) {
                                        result.push(...dept.userList);
                                    }
                                }
                                // 递归处理子部门
                                if (dept.children && dept.children.length > 0) {
                                    findUsers(dept.children);
                                }
                            });
                        };
                        findUsers(res.data);
                        return result;
                    }
                    this.currentDeptUsers = getUsersByDeptId(userInfo.deptId);
                    console.log('当前部门用户列表:', this.currentDeptUsers);
                }).catch(err => {
                    console.error('获取部门用户列表失败:', err);
                });
            }
        },

        // 判断是否可以删除公文
        canDeleteDocument(row) {
            // 首先检查创建人是否与当前登录用户一致
            if (!row.createId || row.createId !== this.userInfo.userId) {
                return false;
            }

            // 在主任批示前可以显示删除（status < 3）
            return row.status < 3;
        },

        // 处理删除公文
        handleDeleteDocument(row) {
            this.$confirm(`确定要删除公文"${row.title}"吗？删除后无法恢复！`, '删除确认', {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
                dangerouslyUseHTMLString: false
            }).then(() => {
                deleteDocument(row.id).then(res => {
                    if (res.code === 200) {
                        this.$modal.msgSuccess('删除成功');
                        this.getList();
                    } else {
                        this.$modal.msgError(res.msg || '删除失败');
                    }
                }).catch(error => {
                    console.error('删除失败:', error);
                    this.$modal.msgError('删除失败，请稍后重试');
                });
            }).catch(() => {
                // 用户取消删除
            });
        },
        // 公文办结
        handleOfficialComplete(row) {
            this.$confirm('请确认是否办结该公文？', '公文办结', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    // 调用公文办结API
                    this.$modal.loading('正在办结...');
                    officialDocumentHasBeenCompleted({ docId: row.id }).then(res => {
                        this.$modal.closeLoading();
                        if (res.code === 200) {
                            this.$modal.msgSuccess('公文办结成功');
                            this.getList();
                        } else {
                            this.$modal.msgError(res.msg || '公文办结失败');
                        }
                    }).catch(error => {
                        this.$modal.closeLoading();
                        this.$modal.msgError('公文办结失败，请稍后重试');
                    });
                })
                .catch(() => { });
        }
    }
};
</script>
<style scoped>
/* 处理流程弹窗样式 */
::v-deep .process-history-popover {
    max-width: 500px;
}

.timeline-container {
    max-height: 400px;
    /* 从固定高度改为最大高度 */
    overflow-y: auto;
    padding-right: 10px;
}

.history-item {
    padding: 8px;
    background-color: #f8f8f8;
    border-radius: 4px;
    margin-bottom: 8px;
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.history-title {
    font-weight: bold;
    flex: 1;
}

.history-info {
    font-size: 13px;
    margin-top: 5px;
    color: #606266;
}

.info-label {
    color: #909399;
    margin-right: 5px;
}

.info-value {
    color: #303133;
}

/* 滚动条样式 */
.timeline-container::-webkit-scrollbar {
    width: 6px;
}

.timeline-container::-webkit-scrollbar-thumb {
    background-color: #909399;
    border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-track {
    background-color: #f5f7fa;
}

/* 新增样式 */
.form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.2;
}

.form-tip i {
    margin-right: 4px;
}

/* 快速回复组件样式 */
::v-deep .quick-reply-container {
    margin-top: 8px;
}

/* 收文部门按钮样式 */
.receive-dept-buttons {
    background-color: #e6f7ff;
    border-color: #91d5ff;
}

/* 部门分发对话框样式 */
::v-deep .el-dialog__header {
    background-color: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
}

::v-deep .el-dialog__title {
    font-weight: 600;
    color: #303133;
}

.dept-distribute-form {
    padding: 20px 0;
}

.dept-distribute-form .el-form-item__label {
    font-weight: 500;
}

.dept-distribute-form .el-select {
    width: 100%;
}

/* 文本超过两行显示省略号样式 */
.text-ellipsis-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    line-height: 1.4;
    max-height: 2.8em; /* 约两行的高度 */
    text-align: left;
}
</style>
