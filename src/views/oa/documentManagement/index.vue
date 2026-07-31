<template>
    <div class="app-container">

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   >新增</el-button>
                <!-- <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button> -->
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

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
            <!-- <el-table-column type="selection" width="55" align="center" /> -->
            <el-table-column label="序号" align="center" type="index" width="50" />
            <el-table-column label="发文日期" align="center" prop="createTime" />
            <el-table-column label="发文字号" align="center" prop="wordSize" />
            <el-table-column label="发文类型" align="center" prop="type">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.document_sending_type" :value="scope.row.type" />
                </template>
            </el-table-column>
            <el-table-column label="主送机关" align="center" prop="mainDeliveryAgency" width="150">
                <template slot-scope="scope">
                    <el-tooltip :content="scope.row.mainDeliveryAgency" placement="top"
                        :disabled="!scope.row.mainDeliveryAgency || scope.row.mainDeliveryAgency.length <= 20">
                        <div class="text-ellipsis-2" style="text-align: center;">{{ scope.row.mainDeliveryAgency }}
                        </div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column label="标题" align="center" prop="title" width="200">
                <template slot-scope="scope">
                    <el-tooltip :content="scope.row.title" placement="top"
                        :disabled="!scope.row.title || scope.row.title.length <= 30">
                        <div class="text-ellipsis-2" style="text-align: center;">{{ scope.row.title }}</div>
                    </el-tooltip>
                </template>
            </el-table-column>
            <!-- <el-table-column label="紧急程度" align="center" width="150" prop="urgencyLevel">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.official_urgency_level" :value="scope.row.urgencyLevel" />
                </template>
            </el-table-column> -->
            <el-table-column label="发文状态" align="center" prop="status">
                <template slot-scope="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)">{{ getStatusName(scope.row.status) }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right"
                width="80px">
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
                                <i class="el-icon-view"></i> {{scope.row.processStatus === 0 ? '处理' : '详情'}}
                            </el-dropdown-item> -->

                    <!-- 修改并重新提交按钮，仅在文档被退回时显示
                            <el-dropdown-item :command="{ type: 'resubmit', row: scope.row }"
                                v-if="scope.row.processStatus === 0 && scope.row.status === 11">
                                <i class="el-icon-edit"></i> 修改并重新提交
                            </el-dropdown-item>

                            <!-- 办理按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'process', row: scope.row }"
                                v-if="scope.row.processStatus === 0 && scope.row.status !== 11 && scope.row.readButton === null && scope.row.status !== 25 && scope.row.status !== 20">
                                <i class="el-icon-s-promotion"></i> 办理
                            </el-dropdown-item> -->

                    <!-- 部门经理分发按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'leaderDistribute', row: scope.row }"
                                v-if="(scope.row.readButton === 0 && userPermissions.isDocumentLeader) || (scope.row.readButton === 2 && userPermissions.isDocumentLeader)">
                                <i class="el-icon-s-promotion"></i> 公文分发
                            </el-dropdown-item> -->

                    <!-- 浏览套头文件按钮，仅在状态值大于16时显示 -->
                    <!-- <el-dropdown-item :command="{ type: 'previewHeader', row: scope.row }"
                                v-if="scope.row.status >= 16">
                                <i class="el-icon-document"></i> 浏览套头文件
                            </el-dropdown-item> -->

                    <!-- 查看处理流程按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'viewProcess', row: scope.row }">
                                <i class="el-icon-view"></i> 查看处理流程
                            </el-dropdown-item> -->

                    <!-- 查看分发进度按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'viewProgress', row: scope.row }"
                                v-if="hasPermission('document:co:organizer:user')">
                                <i class="el-icon-s-data"></i> 查看分发进度
                            </el-dropdown-item> -->

                    <!-- 确认阅读按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'confirm', row: scope.row }"
                                v-if="(scope.row.readButton === 1 && userPermissions.canDepartmentReadConfirm) || (scope.row.readButton === 3 && userPermissions.canDepartmentReadConfirm)">
                                <i class="el-icon-check"></i> 已阅
                            </el-dropdown-item> -->

                    <!-- 部门办结按钮 -->
                    <!-- 
                            <el-dropdown-item :command="{ type: 'secretaryComplete', row: scope.row }"
                                v-if="scope.row.readButton === 3">
                                <i class="el-icon-check"></i> 部门办结
                            </el-dropdown-item>
                            -->

                    <!-- 综合岗办结按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'comprehensiveComplete', row: scope.row }"
                                v-if="scope.row.status === 25 && scope.row.processStatus === 0">
                                <i class="el-icon-check"></i> 综合部归档
                            </el-dropdown-item> -->

                    <!-- 删除按钮 -->
                    <!-- <el-dropdown-item :command="{ type: 'delete', row: scope.row }"
                                v-if="canDeleteDocument(scope.row)" style="color: #f56c6c;">
                                <i class="el-icon-delete"></i> 删除
                            </el-dropdown-item> -->
                    <!-- </el-dropdown-menu>
                    </el-dropdown> -->
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <documentDialog ref="documentDialog" :formData="form" :title="title" :isView="isView" :userList="userList"
            :comprehensiveList="comprehensiveList" :deptLeaderUserTreeList="deptLeaderUserTreeList"
            :directorList="directorList" :documentTemplates="documentTemplates" :needsWrittenDate="needsWrittenDate"
            :processType="processType" :isProcessMode="isProcessMode" :departmentList="departmentList"
            :filteredUsers="filteredUsers" @cancel="getList()" @update-needs-written-date="updateNeedsWrittenDate" />



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
    </div>
</template>

<script>
import {
    listDocumentHandle,
    getDetail,
    documentLeaderCheck,
    documentComprehensiveCheck,
    documentDirectorCheck,
    documentDirectorHair,
    documentSealApply,
    documentSealCheck,
    departmentalDistribution,
    readingConfirmation,
    secretaryOver,
    comprehensiveCompletion
} from '@/api/oa/documentManagement';
import { selectDocumentProcessListByDocId, getPreviewRedHeaderDoc, getDeptLeaderUserTreeList } from '@/api/oa/document';
import { checkTheProgress, getUserPermission, deleteDocument } from '@/api/oa/documentReceive';
import { getAllUser, getComprehensiveList, getDirectorList, getDocumentDict, getDeptUserTree } from '@/api/oa/publicApi.js';
import { mapGetters } from 'vuex';
import documentDialog from './documentDialog.vue';
import QuickReply from '@/components/quickReply/index.vue';
import FileUpload from '@/components/FileUpload/index.vue';
export default {
    name: 'DocumentManagement',
    components: { documentDialog, QuickReply, FileUpload },
    props: {},
    dicts: ['official_document_type', 'official_urgency_level', 'official_secrecy', 'document_sending_type'],
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
                type: 1,
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
            historicalRecord: [],
            processHistoryDialog: false,
            deptUserTree: [],
            needsWrittenDate: false,
            progressRecord: [],
            progressDialog: false,
            departmentList: [], // 部门列表
            filteredUsers: [], // 过滤后的用户列表
            deptLeaderUserTreeList: [], // 部门经理树数据
            userPermissions: {
                isDocumentLeader: false, // 是否有发文部门经理岗权限
                canDepartmentReadConfirm: false // 是否有发文部门人员阅读确认权限
            },
            // 添加流程模式标识
            isProcessMode: false,
            processType: ''
        };
    },
    watch: {
        // 由于processForm已经移到documentDialog中，这个watch已经不需要了
        // needsWrittenDate的判断逻辑现在在documentDialog.vue中处理
    },
    computed: {
        ...mapGetters(['userInfo', 'permissions'])
    },
    created() {
        this.getList();
        this.getComprehensiveList();
        this.getUserList();
        this.getDirectorList();
        this.getDocumentTemplates();
        // 获取部门用户树数据（用于级联选择器）
        getDeptUserTree().then(res => {
            this.deptUserTree = this.processTreeData(res.data);
        });
        // 获取部门经理数据（同时用于内部发送部门过滤）
        getDeptLeaderUserTreeList().then(res => {
            this.deptLeaderUserTreeList = res.data;
            // 从部门经理数据中提取有部门经理的部门列表
            this.extractDepartments(res.data);
            this.filterUsers();
        });
        getUserPermission('document:leader:user').then(res => {
            console.log('发文部门经理岗权限检查结果:', res);
            this.userPermissions.isDocumentLeader = res.code === 200 && res.data;
        }).catch(err => {
            console.error('权限检查失败:', err);
            this.userPermissions.isDocumentLeader = false;
        });
        // 检查发文部门人员阅读确认权限
        this.userPermissions.canDepartmentReadConfirm = this.hasPermission('project:document:departmentReadConfirm');
    },
    mounted() { },
    activated() {
        // 当页面被激活时（从其他页面返回时）刷新数据
        this.getList();
    },
    methods: {
        // 获取孙强的用户ID
        getSunQiangUserId() {
            const sunQiang = this.directorList.find(user => user.nickName === '孙强');
            return sunQiang ? sunQiang.userId : null;
        },

        // 预览文件
        previewFile(filePath) {
            if (!filePath) return;
            const baseUrl = this.$store.getters.settings.baseUrl || '';
            const fileUrl = encodeURIComponent(baseUrl + filePath);
            const fileName = this.getFileName(filePath);
            const fileExt = fileName.split('.').pop().toLowerCase();

            // 根据文件类型选择不同的预览方式
            if (this.isImageFile(filePath)) {
                window.open(baseUrl + filePath, '_blank');
            } else if (['pdf'].includes(fileExt)) {
                window.open(baseUrl + filePath, '_blank');
            } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt)) {
                const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`;
                window.open(officeOnlineUrl, '_blank');
            } else {
                // 对于其他文件类型，直接下载
                const link = document.createElement('a');
                link.href = baseUrl + filePath;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        },

        // 判断是否为图片文件
        isImageFile(filePath) {
            if (!filePath) return false;
            const ext = filePath.split('.').pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
        },

        // 获取文件名
        getFileName(filePath) {
            if (!filePath) return '未知文件';
            return filePath.split('/').pop();
        },
        // 处理收藏意见成功回调
        handleCollected(content) {
            console.log('收藏成功:', content);
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
                11: 'danger', // 退回状态
                12: 'info', // 待经理审核
                13: 'info', // 综合岗待审核
                14: 'info', // 主任岗待审核
                15: 'info', // 综合岗套头
                16: 'info', // 用印申请
                17: 'info', // 用印审批
                20: 'info', // 部门经理分发
                23: 'info', // 部门人员确认
                24: 'info', // 部门办结
                25: 'info', // 部门办结
                26: 'success', // 发文完结

            };
            return typeMap[status] || 'info';
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
                    console.log(res, 'res');
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
                type: 1,
                secrecy: null,
                urgencyLevel: null,
                wordSize: null,
                issuer: null,
                title: null,
                mainDeliveryAgency: null,
                text: null,
                filePath: null,
                attachmentDescription: null,
                sign: null,
                writtenDate: null,
                annotations: null,
                cc: null,
                issuingAgency: null,
                issuingDate: null,
                internalCirculation: null,
                partNumber: null,
                contactPerson: null,
                contactPhone: null,
                transactor: null,
                assistantOrganizer: null
            };
        },

        handleSelectionChange(selection) {
            // 表格选择项变化处理
            this.ids = selection.map(item => item.id);
            this.single = selection.length !== 1;
            this.multiple = !selection.length;
        },
        handleAdd() {
            // 跳转到新增发文处理单页面
            this.$router.push('/document/documentManagementAdd');
        },
        handleDetail(row) {
            this.$router.push({ path: '/document/documentManagementAdd', query: { id: row.id } });
        },
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            getDetail(id).then(response => {
                this.form = response.data;
                this.title = '修改公文';
                this.isView = false;
                this.isProcessMode = false;
                this.processType = '';
                // 处理filePath：将字符串按逗号分割为数组
                if (this.form.filePath && typeof this.form.filePath === 'string') {
                    this.form.filePathArray = this.form.filePath.split(',').filter(Boolean);
                } else {
                    this.form.filePathArray = [];
                }
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
            // 如果是用印申请流程，直接弹出确认框
            if (row.status === 16) {
                this.$confirm('确定要提交用印申请吗?', '用印申请', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info'
                })
                    .then(() => {
                        // 用户确认后，直接调用用印申请接口
                        const params = {
                            docId: row.id
                        };
                        documentSealApply(params).then(res => {
                            this.$modal.msgSuccess('用印申请成功');
                            this.getList();
                        });
                    })
                    .catch(() => {
                        // 用户取消操作
                    });
                return;
            }

            // 如果是综合岗办结，直接确认
            if (row.status === 25) {
                this.$confirm('确定要归档此公文吗?', '综合部归档', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                    .then(() => {
                        comprehensiveCompletion({ docId: row.id }).then(() => {
                            this.$modal.msgSuccess('归档成功');
                            this.getList();
                        });
                    })
                    .catch(() => { });
                return;
            }

            // 设置流程模式
            this.isProcessMode = true;
            this.isView = false;

            // 根据状态确定当前处理类型
            switch (row.status) {
                case 12: // 待经理审核
                    this.processType = 'leaderCheck';
                    this.title = '经理审核';
                    // 经理审核时需要获取文档详情并反显字段
                    getDetail(row.id).then(response => {
                        const detail = response.data;
                        // 设置文档ID
                        detail.docId = row.id;
                        // 处理filePath：将字符串按逗号分割为数组，同时保留原字符串用于提交
                        if (detail.filePath && typeof detail.filePath === 'string') {
                            detail.filePathArray = detail.filePath.split(',').filter(Boolean);
                        } else {
                            detail.filePathArray = [];
                        }
                        this.form = detail;
                        this.$refs.documentDialog.open(detail);
                    });
                    break;
                case 13: // 综合岗待审核
                    this.processType = 'comprehensiveCheck';
                    this.title = '综合岗审核';
                    // 创建基础表单数据
                    const comprehensiveForm = {
                        docId: row.id,
                        status: '1',
                        remark: '',
                        directorIds: [],
                        wordSize: '',
                        secrecy: '',
                        cc: '',
                        contactPerson: '',
                        contactPhone: ''
                    };
                    // 自动选中孙强
                    this.$nextTick(() => {
                        const sunQiangUserId = this.getSunQiangUserId();
                        if (sunQiangUserId) {
                            comprehensiveForm.directorIds = [sunQiangUserId];
                        }
                        this.form = comprehensiveForm;
                        this.$refs.documentDialog.open(comprehensiveForm);
                    });
                    break;
                case 14: // 主任岗待审核
                    this.processType = 'directorCheck';
                    this.title = '主任室审核';
                    this.form = {
                        docId: row.id,
                        status: '1',
                        remark: '',
                        returnStatus: '1'
                    };
                    this.$refs.documentDialog.open(this.form);
                    break;
                case 15: // 综合岗套头
                    this.processType = 'directorHair';
                    this.title = '文件套头';
                    this.form = {
                        docId: row.id,
                        word: '',
                        remark: '',
                        issuingDate: '',
                        writtenDate: '',
                        internalCirculation: [],
                        userIds: []
                    };
                    this.$refs.documentDialog.open(this.form);
                    break;
                case 17: // 用印审批
                    this.processType = 'sealCheck';
                    this.title = '用印审批';
                    this.form = {
                        docId: row.id,
                        status: '1',
                        remark: '',
                        returnStatus: '1'
                    };
                    this.$refs.documentDialog.open(this.form);
                    break;
                default:
                    this.$message.error('未知的处理状态');
                    return;
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
                this.isProcessMode = false;
                this.processType = '';

                // 处理filePath：将字符串按逗号分割为数组
                if (this.form.filePath && typeof this.form.filePath === 'string') {
                    this.form.filePathArray = this.form.filePath.split(',').filter(Boolean);
                } else {
                    this.form.filePathArray = [];
                }

                // 设置表单提交方法为重新提交
                this.$refs.documentDialog.open(response.data);
                this.$refs.documentDialog.setSubmitAction('resubmit');
            });
        },
        // 获取发文状态名称
        getStatusName(status) {
            const statusMap = {
                11: '待修改',
                12: '经理审核',
                13: '综合管理部审核',
                14: '主任室审核',
                15: '待办结',
                16: '用印申请',
                17: '用印审批',
                20: '公文分发',

                23: '部门人员确认',
                24: '部门办结',
                25: '综合岗归档',
                26: '发文已完结'
            };
            return statusMap[status] || '未知状态';
        },
        handleCommand(command) {
            const { type, row } = command;
            switch (type) {
                case 'detail':
                    this.handleDetail(row);
                    break;
                case 'resubmit':
                    this.handleResubmit(row);
                    break;
                case 'process':
                    this.handleProcess(row);
                    break;
                case 'viewProcess':
                    this.selectDocumentProcessListByDocId(row.id);
                    break;
                case 'viewProgress':
                    this.checkProgress(row.id);
                    break;
                case 'previewHeader':
                    this.previewRedHeaderDoc(row.id);
                    break;
                case 'confirm':
                    this.confirmReading(row.id);
                    break;
                case 'secretaryComplete':
                    this.handleSecretaryComplete(row);
                    break;
                case 'comprehensiveComplete':
                    this.handleComprehensiveComplete(row);
                    break;
                case 'leaderDistribute':
                    this.handleLeaderDistribute(row);
                    break;
                case 'delete':
                    this.handleDeleteDocument(row);
                    break;
                default:
                    break;
            }
        },
        // 预览套头文件
        previewRedHeaderDoc(id) {
            getPreviewRedHeaderDoc(id)
                .then((res) => {
                    // 创建 blob 对象，设置正确的 MIME 类型
                    const blob = new Blob([res], {
                        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    });
                    // 创建下载链接
                    const link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    // 设置下载文件名
                    link.download = `公文_${id}.docx`;
                    // 添加到页面并触发点击
                    document.body.appendChild(link);
                    link.click();
                    // 清理
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);
                })
                .catch((error) => {
                    this.$message.error("文件下载失败");
                    console.error("下载失败:", error);
                });
        },
        // 获取部门用户树
        getDeptUserTree() {
            getDeptUserTree().then(res => {
                this.deptUserTreeList = res.data;
            });
        },
        // 处理部门用户树数据结构
        processTreeData(treeData) {
            if (!treeData || !treeData.length) return [];

            return treeData.map(node => {
                const processedNode = { ...node };

                // 确保部门节点有正确的label
                if (!node.isUser) {
                    processedNode.label = node.deptName || node.name || node.label;
                    processedNode.id = 'dept_' + (node.deptId || 'unknown');
                }

                // 如果有用户列表，将用户列表转换为子节点
                if (node.userList && node.userList.length) {
                    // 如果没有children属性，创建一个空数组
                    if (!processedNode.children) {
                        processedNode.children = [];
                    }

                    // 将用户添加为子节点
                    node.userList.forEach(user => {
                        processedNode.children.push({
                            ...user,
                            isUser: true, // 标记为用户节点
                            id: 'user_' + (user.userId || 'unknown'), // 添加唯一 id
                            label: user.nickName || user.userName // 用户显示名称
                        });
                    });

                    // 删除原始userList
                    delete processedNode.userList;
                }

                // 递归处理子节点
                if (processedNode.children && processedNode.children.length) {
                    processedNode.children = this.processTreeData(processedNode.children);
                }

                return processedNode;
            });
        },
        // 提取部门列表（只显示有部门经理的部门）
        extractDepartments(treeData) {
            this.departmentList = [];
            const traverse = (nodes) => {
                nodes.forEach(node => {
                    // 只添加有用户列表（部门经理）的部门
                    if (node.deptId && node.deptName && node.userList && node.userList.length > 0) {
                        this.departmentList.push({
                            id: node.deptId,
                            label: node.deptName
                        });
                    }
                    if (node.children && node.children.length > 0) {
                        traverse(node.children);
                    }
                });
            };
            traverse(treeData);
        },
        // 过滤用户列表
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
        // 处理部门经理分发
        handleLeaderDistribute(row) {
            this.isProcessMode = true;
            this.isView = false;
            this.processType = 'leaderDistribute';
            this.title = '公文分发';

            // 获取部门用户树，并从中筛选当前部门用户
            getDeptUserTree().then(res => {
                const getUsersByDeptId = (deptId) => {
                    const result = [];
                    const findUsers = (departments) => {
                        departments.forEach((dept) => {
                            if (dept.deptId === deptId || dept.ancestors.includes(deptId)) {
                                // 如果当前部门或其祖先部门匹配，添加 userList
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
                this.userList = getUsersByDeptId(this.userInfo.deptId);

                // 创建表单数据
                this.form = {
                    docId: row.id,
                    distributeUserIds: [],
                    remark: ''
                };

                // 获取到用户列表后再打开对话框
                this.$refs.documentDialog.open(this.form);
            });
        },
        // 确认阅读
        confirmReading(docId) {
            this.$confirm('确定已阅?', '已阅', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(() => {
                readingConfirmation({ docId }).then(res => {
                    this.$modal.msgSuccess('提交成功');
                    this.getList();
                });
            }).catch(() => { });
        },
        // 处理部门办结
        handleSecretaryComplete(row) {
            this.$confirm('确定要办结此公文吗?', '部门办结', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    secretaryOver({ docId: row.id }).then(() => {
                        this.$modal.msgSuccess('办结成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        // 处理综合岗办结
        handleComprehensiveComplete(row) {
            this.$confirm('确定要归档此公文吗?', '综合部归档', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
                .then(() => {
                    comprehensiveCompletion({ docId: row.id }).then(() => {
                        this.$modal.msgSuccess('归档成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        checkProgress(docId) {
            checkTheProgress({ docId, roleStatus: 4 }).then(res => {
                this.progressRecord = res.data;
                this.progressDialog = true;
            });
        },
        hasPermission(permission) {
            return this.permissions.some(p => p === permission);
        },

        // 更新是否需要成文日期
        updateNeedsWrittenDate(needsDate) {
            this.needsWrittenDate = needsDate;
        },
        // 处理表格行点击事件
        handleRowClick(row) {
            this.selectDocumentProcessListByDocId(row.id);
        },

        // 判断是否可以删除公文
        canDeleteDocument(row) {

            // 首先检查创建人是否与当前登录用户一致
            if (!row.issuer || row.issuer !== this.userInfo.nickName) {
                return false;
            }

            // 如果是部门经理，状态在主任室审核之前可以显示（status < 14）
            if (this.userPermissions.isDocumentLeader) {
                return row.status < 14;
            }

            // 如果是普通用户，状态在综合岗审核之前可以显示（status < 13）
            return row.status < 13;
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
    max-height: 2.8em;
    /* 约两行的高度 */
    text-align: left;
}
</style>
