<template>
    <div>
        <el-dialog :title="'天津众和收文处理单'" :visible.sync="visible" width="860px" append-to-body @close="cancel"
            :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px" :disabled="isFormReadOnly">
                <!-- <el-divider content-position="left">公共信息</el-divider> -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="文号" prop="wordSize">
                            <el-input v-model="form.wordSize" placeholder="请输入文号" maxlength="50" clearable
                                :disabled="isFieldDisabled('wordSize')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="来文单位" prop="cc">
                            <el-input v-model="form.cc" placeholder="请输入来文单位" maxlength="100" clearable
                                :disabled="isFieldDisabled('cc')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="标题" prop="title">
                            <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" clearable
                                :disabled="isFieldDisabled('title')" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="紧急程度" prop="urgencyLevel">
                            <el-select v-model="form.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%"
                                :disabled="isFieldDisabled('urgencyLevel')">
                                <el-option v-for="dict in dict.type.official_urgency_level" :key="dict.value"
                                    :label="dict.label" :value="dict.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- <el-row>
                    <el-col :span="24">
                        <el-form-item label="经办人" prop="handlerId">
                            <el-select v-model="form.handlerId" multiple placeholder="请选择经办人" style="width: 100%">
                                <el-option v-for="item in userList" :key="item.id" :label="item.label"
                                    :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row> -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="附件" prop="filePath">
                            <FileUpload v-if="!isFieldDisabled('filePath')" v-model="form.filePath"
                                @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted"
                                ref="fileUpload" />
                            <div v-else-if="typeof form.filePath === 'string' && form.filePath">
                                <el-link type="primary" @click="previewFile(form.filePath)">
                                    <i class="el-icon-document"></i>
                                    {{ getDisplayFileName(form.filePath) }}
                                </el-link>
                            </div>
                            <div v-else-if="Array.isArray(form.filePath) && form.filePath.length">
                                <div v-for="(f, idx) in form.filePath" :key="f.id || idx" style="margin-bottom: 5px;">
                                    <el-link type="primary" @click="previewFile(normalizeFileUrl(f))">
                                        <i class="el-icon-document"></i>
                                        {{ getDisplayFileName(normalizeFileUrl(f)) }}
                                    </el-link>
                                </div>
                            </div>
                            <span v-else>无附件</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 主任室审核 -->
                <el-divider content-position="left">主任批示</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="办理结果">
                            <el-radio-group v-model="form.status" :disabled="isFieldDisabled('status')">
                                <el-radio label="1">通过</el-radio>
                                <el-radio label="2">拒绝</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="主任批示意见">
                            <el-input v-model="directorRemark" type="textarea" placeholder="请输入主任批示意见"
                                :disabled="isFieldDisabled('directorRemark')" />
                            <QuickReply v-if="!isFieldDisabled('directorRemark')"
                                :onSelect="p => appendPhrase('directorRemark', p)" :superviseId="form.id || form.docId"
                                :inputContent="directorRemark" @collected="handleCollected" />
                        </el-form-item>
                    </el-col>
                </el-row>

                 <!-- 部门分办（收文/发文） -->
                 <el-divider content-position="left">部门分办</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="分发人员">
                            <el-select v-model="form.userIds" multiple placeholder="请选择分发人员" style="width: 100%"
                                :disabled="isFieldDisabled('userIds')">
                                <el-option v-for="item in filteredUsers" :key="item.id" :label="item.label"
                                    :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="备注">
                            <el-input v-model="distributeRemark" type="textarea" placeholder="请输入备注"
                                :disabled="isFieldDisabled('distributeRemark')" />
                            <QuickReply v-if="!isFieldDisabled('distributeRemark')"
                                :onSelect="p => appendPhrase('distributeRemark', p)"
                                :superviseId="form.id || form.docId" :inputContent="distributeRemark"
                                @collected="handleCollected" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 综合管理部办理（综合岗） -->
                <el-divider content-position="left">综合管理部办理</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="批示人">
                            <el-select v-model="form.directorIds" multiple placeholder="请选择批示人" style="width: 100%"
                                :disabled="isFieldDisabled('directorIds')">
                                <el-option v-for="item in directorList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="批示意见">
                            <el-input v-model="comprehensiveRemark" type="textarea" placeholder="请输入批示意见"
                                :disabled="isFieldDisabled('comprehensiveRemark')" />
                            <QuickReply v-if="!isFieldDisabled('comprehensiveRemark')"
                                :onSelect="p => appendPhrase('comprehensiveRemark', p)"
                                :superviseId="form.id || form.docId" :inputContent="comprehensiveRemark"
                                @collected="handleCollected" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 办理流程（时间线） -->
                <el-divider content-position="left">办理流程</el-divider>
                <div class="timeline-container">
                    <el-timeline>
                        <el-timeline-item v-for="(item, index) in historicalRecord" :key="index"
                            :timestamp="formatTime(item.processTime)" placement="top"
                            :type="getStatusType(item.status)">
                            <div class="history-item">
                                <div class="history-header">
                                    <span class="history-title">{{ item.returnRemark || '处理流程' }}</span>
                                    <el-tag size="mini" :type="getStatusTagType(item.status)">
                                        {{ getProcessStatusName(item.status) }}
                                    </el-tag>
                                </div>
                                <div class="history-info" v-if="item.nickName">
                                    <span class="info-label">处理人：</span>
                                    <span class="info-value">{{ item.nickName }}<template v-if="item.deptName">—{{
                                            item.deptName }}</template></span>
                                </div>
                                <div class="history-info" v-if="item.remark">
                                    <span class="info-label">处理意见：</span>
                                    <span class="info-value">{{ item.remark }}</span>
                                </div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button v-if="!isProcessMode && submitAction === 'resubmit'" type="primary"
                    @click="resubmitForm">重新提交</el-button>
                <el-button v-else-if="!isProcessMode" type="primary" @click="publishForm">确 定</el-button>
                <el-button v-else type="primary" @click="submitProcess">确 定</el-button>
                <el-button @click="cancel">关 闭</el-button>
            </div>
        </el-dialog>
        <ViewFile ref="viewFileRef" />
    </div>
</template>

<script>
import { addDraft, updateDraft } from '@/api/oa/document';
import { addDocument, submitDraft } from '@/api/oa/documentManagement';
import conf from '@/conf.js'; // 导入配置文件
import ViewFile from '@/components/viewFile';
import QuickReply from '@/components/quickReply/index.vue';
import { selectDocumentProcessListByDocId } from '@/api/oa/document';

export default {
    name: 'DocumentDialog',
    components: {
        ViewFile,
        QuickReply
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        formData: {
            type: Object,
            default: () => ({})
        },
        userList: {
            type: Array,
            default: () => []
        },
        isView: {
            type: Boolean,
            default: false
        },
        directorList: {
            type: Array,
            default: () => []
        },
        filteredUsers: {
            type: Array,
            default: () => []
        },
        isProcessMode: {
            type: Boolean,
            default: false
        },
        processType: {
            type: String,
            default: ''
        }
    },
    dicts: ['official_urgency_level'],
    data() {
        return {
            visible: false,
            form: { type: 0 },
            titleType: null,
            rules: {
                wordSize: [{ required: true, message: '文号不能为空', trigger: 'blur' }],
                cc: [{ required: true, message: '来文单位不能为空', trigger: 'blur' }],
                title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
                urgencyLevel: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
                handlerId: [
                    {
                        required: true,
                        validator: (rule, value, callback) => {
                            if (!value || (Array.isArray(value) && value.length === 0)) {
                                callback(new Error('经办人不能为空'));
                            } else {
                                callback();
                            }
                        },
                        trigger: ['change', 'blur']
                    }
                ]
            },
            filePath: null,
            submitAction: 'publish',
            // 分区独立文本，避免互相影响
            comprehensiveRemark: '',
            directorRemark: '',
            distributeRemark: '',
            // 办理流程时间线数据
            historicalRecord: []
        };
    },
    computed: {
        // 新增/修改：非流程；详情：isView true
        // 需求：
        // - 详情不允许修改
        // - 新增只允许公共信息分区，后续流程字段禁用
        // - 流程模式时，仅允许本流程字段可编辑
        isFormReadOnly() {
            return this.isView;
        }
    },
    methods: {
        // 时间与状态辅助方法（与列表页一致）
        formatTime(time) {
            if (!time) return '未知时间';
            try {
                return new Date(time).toLocaleString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            } catch (e) {
                return time;
            }
        },
        getStatusType(status) {
            const typeMap = { 0: 'info', 1: 'success', 2: 'success', 3: 'warning', 4: 'danger' };
            return typeMap[status] || '';
        },
        getStatusTagType(status) {
            const typeMap = { 0: 'info', 1: 'success', 2: 'success', 3: 'warning', 4: 'danger' };
            return typeMap[status] || 'info';
        },
        getProcessStatusName(status) {
            const statusMap = { 0: '待办', 1: '已办', 2: '通过', 3: '退回', 4: '已被退回' };
            return statusMap[status] || '未知';
        },
        // 统一提交流程由父组件处理，这里仅组装数据并上抛
        submitProcess() {
            const processType = this.processType;
            const docId = this.form.docId || this.form.id;
            const payload = { processType, docId };
            if (processType === 'comprehensiveProcess') {
                payload.directorIds = (this.form.directorIds || []).join(',');
                payload.remark = this.comprehensiveRemark || '';
            } else if (processType === 'directorProcess') {
                payload.status = this.form.status;
                payload.remark = this.directorRemark || '';
            } else if (processType === 'leaderDistribute') {
                payload.userIds = (this.form.userIds || []).join(',');
                payload.remark = this.distributeRemark || '';
                // 归并附件为字符串，供父组件直接提交
                let filePathStr = '';
                const fp = this.form.filePath;
                if (Array.isArray(fp) && fp.length > 0) {
                    filePathStr = fp.map(f => (f.isExisting ? (f.url || f.path) : (f.url || f.path))).filter(Boolean).join(',');
                } else if (typeof fp === 'string' && fp.trim()) {
                    filePathStr = fp;
                }
                payload.filePath = filePathStr;
            }
            this.$emit('submit-process', payload);
        },
        // 快速回复插入（分区独立）
        appendPhrase(key, phrase) {
            this[key] = (this[key] || '') + phrase;
        },
        handleCollected() { },
        normalizeFileUrl(f) {
            if (!f) return '';
            if (typeof f === 'string') return f;
            return f.url || f.path || '';
        },
        normalizeFileName(f) {
            const url = this.normalizeFileUrl(f);
            if (!url) return '附件';
            return url.split('/').pop();
        },
        isFieldDisabled(field) {
            // 详情模式：全部禁用
            if (this.isView) return true;
            // 新增/修改（非流程）：仅公共信息可编辑，其它流程字段禁用
            if (!this.isProcessMode) {
                const publicFields = ['wordSize', 'cc', 'title', 'urgencyLevel', 'filePath'];
                return !publicFields.includes(field);
            }
            const map = {
                comprehensiveProcess: ['directorIds', 'comprehensiveRemark'],
                directorProcess: ['status', 'directorRemark'],
                leaderDistribute: ['userIds', 'distributeRemark']
            };
            const editable = map[this.processType] || [];
            return !editable.includes(field);
        },

        reset() {
            this.form = {
                type: 0,
                wordSize: null,
                cc: null,
                title: null,
                urgencyLevel: null,
                handlerId: [],
                filePath: null
            };
            if (this.$refs.fileUpload) {
                setTimeout(() => {
                    this.$refs.fileUpload.clearFileList();
                }, 100);
            }
            setTimeout(() => {
                this.$refs.form.clearValidate();
            }, 100);
        },
        setSubmitAction(action) {
            this.submitAction = action;
        },
        open(data) {
            if (data) {
                this.form = { ...data };
                // 将handlerId字符串转换为数组格式显示
                if (this.form.handlerId && typeof this.form.handlerId === 'string') {
                    this.form.handlerId = this.form.handlerId.split(',').map(id => Number(id));
                }
            }
            this.visible = true;
            // 延迟清除验证，避免刚打开就显示验证错误
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate();
                }
            });
            // 拉取办理流程
            const docId = this.form.id || this.form.docId;
            if (docId) {
                selectDocumentProcessListByDocId({ id: docId }).then(res => {
                    this.historicalRecord = Array.isArray(res.data) ? res.data : [];
                }).catch(() => {
                    this.historicalRecord = [];
                });
            } else {
                this.historicalRecord = [];
            }
        },
        // 获得上传文件信息
        handleUploadSuccess(fileList) {
            // this.form.filePath = fileList[0].url;
        },

        // 预览文件
        previewFile(filePath) {
            if (!filePath) return;
            const baseUrl = conf.server.baseUrl;
            const fileUrl = encodeURIComponent(baseUrl + filePath);
            const fileName = this.getFileName(filePath);
            const fileExt = fileName.split('.').pop().toLowerCase();

            this.$refs.viewFileRef.openDialog(baseUrl + filePath, fileExt);
        },

        // 获取文件名
        getFileName(filePath) {
            if (!filePath) return '未知文件';
            return filePath.split('/').pop();
        },
        // 获取不带后缀名的文件名（用于显示）
        getDisplayFileName(filePath) {
            if (!filePath) return '未知文件';
            const fileName = filePath.split('/').pop();
            const lastDotIndex = fileName.lastIndexOf('.');
            return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        },

        // 处理文件删除
        handleFileDeleted() {
            this.form.filePath = null;
        },
        // 公文发布
        publishForm() {
            console.log("????");

            this.$refs['form'].validate(valid => {
                if (valid) {
                    // 创建表单数据的副本
                    const submitForm = JSON.parse(JSON.stringify(this.form));

                    // 将handlerId数组转换为逗号分隔的字符串
                    if (Array.isArray(submitForm.handlerId)) {
                        submitForm.handlerId = submitForm.handlerId.join(',');
                    }

                    addDocument(submitForm).then(response => {
                        this.$modal.msgSuccess('发布成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                }
            });
        },
        // 取消按钮
        cancel() {
            this.visible = false;
            this.reset();
        },
        // 重新提交表单
        resubmitForm() {
            console.log("!!!!!");

            this.$refs['form'].validate(valid => {
                if (valid) {
                    // 创建表单数据的副本
                    const submitForm = JSON.parse(JSON.stringify(this.form));

                    // 将handlerId数组转换为逗号分隔的字符串
                    if (Array.isArray(submitForm.handlerId)) {
                        submitForm.handlerId = submitForm.handlerId.join(',');
                    }

                    submitDraft(submitForm).then(response => {
                        this.$modal.msgSuccess('重新提交成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                }
            });
        }
    },
    mounted() { }
};
</script>

<style scoped>
/* 办理流程样式（与发文保持一致） */
.timeline-container {
    max-height: 300px;
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

::v-deep .el-dialog {
    height: 80%;
    overflow: scroll;
}

.custom-textarea ::v-deep .el-textarea__inner {
    min-height: 100px;
}

.custom-textarea ::v-deep .el-input__count {
    bottom: 5px;
    background: transparent;
}

.file-icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    background-color: #f5f7fa;
}

.file-icon {
    font-size: 32px;
    color: #909399;
    margin-bottom: 8px;
}

.file-name {
    font-size: 12px;
    color: #606266;
    text-align: center;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    padding: 0 5px;
}

.file-preview-container {
    text-align: center;
    padding: 20px;
}
</style>
