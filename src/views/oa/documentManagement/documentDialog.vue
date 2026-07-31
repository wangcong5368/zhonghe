<template>
    <div>
        <el-dialog :title="'天津众和发文处理单'" :visible.sync="visible" width="900px" append-to-body @close="cancel"
            :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
                <!-- 公共信息 -->
                <!-- <el-divider content-position="left">公共信息</el-divider> -->
                <!-- 基础信息字段 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="标题" prop="title">
                            <el-input v-model="form.title" placeholder="请输入标题" maxlength="50" clearable
                                :disabled="isFieldDisabled('title')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="紧急程度" prop="urgencyLevel">
                            <el-select v-model="form.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%"
                                :disabled="isFieldDisabled('urgencyLevel')">
                                <el-option v-for="dict in dict.type.official_urgency_level" :key="dict.value"
                                    :label="dict.label" :value="dict.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="主送单位" prop="mainDeliveryAgency">
                            <el-input v-model="form.mainDeliveryAgency" placeholder="请输入主送单位" maxlength="50" clearable
                                :disabled="isFieldDisabled('mainDeliveryAgency')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="正文" prop="text">
                            <el-input v-model="form.text" type="textarea" placeholder="请输入正文" maxlength="2000" clearable
                                :autosize="{ minRows: 4 }" class="custom-textarea"
                                :disabled="isFieldDisabled('text')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="附件" prop="filePath">
                            <FileUpload v-if="!isFieldDisabled('filePath')" v-model="form.filePath"
                                @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted"
                                ref="fileUpload" />
                            <div v-else-if="(form.filePathArray || []).length > 0">
                                <div v-for="(filePath, index) in (form.filePathArray || [])" :key="index"
                                    style="margin-bottom: 5px;">
                                    <el-link type="primary" @click="previewFile(filePath)">
                                        <i class="el-icon-document"></i>
                                        {{ getDisplayFileName(filePath) }}
                                    </el-link>
                                </div>
                            </div>
                            <span v-else>无附件</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="附件链接" prop="attachmentDescription">
                            <el-input v-model="form.attachmentDescription" placeholder="请输入附件链接" maxlength="500"
                                clearable :disabled="isFieldDisabled('attachmentDescription')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="抄送" prop="issuingAgency">
                            <el-input v-model="form.issuingAgency" placeholder="请输入抄送" maxlength="50" clearable
                                :disabled="isFieldDisabled('issuingAgency')" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="打印份数" prop="partNumber">
                            <el-input-number v-model="form.partNumber" :min="0" placeholder="请输入打印份数"
                                style="width: 100%" :disabled="isFieldDisabled('partNumber')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="发文人" prop="issuer">
                            <el-input v-model="form.issuer" placeholder="发文人" maxlength="10" disabled />
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 主任批示（主任室审核） -->
                <el-divider content-position="left">主任批示</el-divider>
                <!-- 退回选项：仅当主任处理结果选择退回时显示 -->
                <el-row v-if="processType === 'directorCheck' && directorStatus === '2'">
                    <el-col :span="24">
                        <el-form-item label="退回选项">
                            <el-radio-group v-model="form.returnStatus" :disabled="isFieldDisabled('returnStatus')">
                                <el-radio label="1">退回给发文人</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- 主任批示：处理结果与意见 -->
                                    <el-row>
                    <el-col :span="24">
                        <el-form-item label="主任处理结果">
                            <el-radio-group v-model="directorStatus" :disabled="isFieldDisabled('directorStatus')">
                                <el-radio label="1">通过</el-radio>
                                <el-radio label="2">退回</el-radio>
                            </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="主任意见">
                            <el-input v-model="directorRemark" type="textarea" placeholder="请输入处理意见"
                                :disabled="isFieldDisabled('directorRemark')"></el-input>
                            <quick-reply v-if="!isFieldDisabled('directorRemark')" :onSelect="handleSelectPhrase"
                                :superviseId="form.docId" :inputContent="directorRemark"
                                @collected="handleCollected"></quick-reply>
                        </el-form-item>
                    </el-col>
                </el-row>

                  <!-- 综合管理部意见（综合岗核稿） -->
                  <el-divider content-position="left">综合管理部意见</el-divider>
                <!-- 综合岗审核字段 -->
                <el-row>
                        <el-col :span="24">
                            <el-form-item label="发文字号" prop="wordSize">
                            <el-input v-model="form.wordSize" placeholder="请输入发文字号（非必填）" maxlength="50" clearable
                                :disabled="isFieldDisabled('wordSize')" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                <el-row>
                        <el-col :span="24">
                            <el-form-item label="密级" prop="secrecy">
                            <el-select v-model="form.secrecy" placeholder="请选择密级（非必填）" style="width: 100%" clearable
                                :disabled="isFieldDisabled('secrecy')">
                                    <el-option v-for="dict in dict.type.official_secrecy" :key="dict.value"
                                        :label="dict.label" :value="dict.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="抄送机关" prop="cc">
                            <el-input v-model="form.cc" type="textarea" placeholder="请输入抄送机关（非必填）" maxlength="200"
                                clearable :autosize="{ minRows: 1, maxRows: 3 }" :disabled="isFieldDisabled('cc')" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                            <el-form-item label="联系人" prop="contactPerson">
                            <el-input v-model="form.contactPerson" placeholder="请输入联系人（非必填）" maxlength="20" clearable
                                :disabled="isFieldDisabled('contactPerson')" />
                            </el-form-item>
                        </el-col>
                    <el-col :span="12">
                            <el-form-item label="联系电话" prop="contactPhone">
                            <el-input v-model="form.contactPhone" placeholder="请输入联系电话（非必填）" maxlength="11" clearable
                                :disabled="isFieldDisabled('contactPhone')" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="下一审核人"
                            :required="processType === 'comprehensiveCheck' && form.status === '1'">
                            <el-select v-model="form.directorIds" multiple placeholder="请选择审核人（最多2人，必须包含孙强）"
                                style="width: 100%" @change="handleDirectorIdsChange"
                                :disabled="isFieldDisabled('directorIds')">
                                <el-option v-for="item in (directorList || [])" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"
                                    :disabled="isDirectorOptionDisabled(item.userId)"></el-option>
                            </el-select>
                            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                                注意：最多选择2人，且必须包含孙强
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 部门经理意见（经理审核） -->
                <el-divider content-position="left">部门经理意见</el-divider>
                <!-- 经理审核：处理结果与意见 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="部门经理处理结果">
                            <el-radio-group v-model="managerStatus" :disabled="isFieldDisabled('managerStatus')">
                                <el-radio label="1">通过</el-radio>
                                <el-radio label="2">退回</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="部门经理意见">
                            <el-input v-model="managerRemark" type="textarea" placeholder="请输入处理意见"
                                :disabled="isFieldDisabled('managerRemark')"></el-input>
                            <quick-reply v-if="!isFieldDisabled('managerRemark')" :onSelect="handleSelectPhrase"
                                :superviseId="form.docId" :inputContent="managerRemark"
                                @collected="handleCollected"></quick-reply>
                        </el-form-item>
                    </el-col>
                </el-row>

              



                <!-- 文件套头 -->
                <el-divider content-position="left">文件套头</el-divider>
                <!-- 套头模板字段 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="套头模板" :required="processType === 'directorHair'">
                            <el-select v-model="form.word" placeholder="请选择套头模板" style="width: 100%"
                                :disabled="isFieldDisabled('word')">
                                <el-option v-for="item in (documentTemplates || [])" :key="item.dictValue"
                                    :label="item.dictLabel" :value="item.dictValue"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 日期字段 -->
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="成文日期" :required="processType === 'directorHair' && needsWrittenDate">
                            <el-date-picker v-model="form.writtenDate" type="date" format="yyyy-MM-dd"
                                value-format="yyyy-MM-dd" placeholder="成文日期" style="width: 100%"
                                :disabled="isFieldDisabled('writtenDate')"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="印发日期" :required="processType === 'directorHair'">
                            <el-date-picker v-model="form.issuingDate" type="date" format="yyyy-MM-dd"
                                value-format="yyyy-MM-dd" placeholder="印发日期" style="width: 100%"
                                :disabled="isFieldDisabled('issuingDate')"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 内部发送字段 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="内部发送">
                            <el-select v-model="form.internalCirculation" placeholder="请选择部门" style="width: 100%"
                                clearable multiple :disabled="isFieldDisabled('internalCirculation')">
                                <el-option v-for="item in (departmentList || [])" :key="item.id" :label="item.label"
                                    :value="item.id"></el-option>
                            </el-select>
                            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                                选择需要内部发送的部门，可多选，非必填项
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 公文分发字段 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="公文分发">
                            <el-select v-model="form.userIds" multiple placeholder="请选择公文分发" style="width: 100%"
                                clearable :disabled="isFieldDisabled('userIds')">
                                <el-option v-for="item in (filteredUsers || [])" :key="item.id" :label="item.label"
                                    :value="item.id"></el-option>
                            </el-select>
                            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                                选择部门经理，可多选，非必填项
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 分发人员字段 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="分发人员" :required="processType === 'leaderDistribute'">
                            <el-select v-model="form.distributeUserIds" multiple placeholder="请选择分发人员"
                                style="width: 100%" :disabled="isFieldDisabled('distributeUserIds')">
                                <el-option v-for="item in (userList || [])" :key="item.userId" :label="item.nickName"
                                    :value="item.userId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 文件套头：备注 -->
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="备注">
                            <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"
                                :disabled="isFieldDisabled('remark')"></el-input>
                            <quick-reply v-if="!isFieldDisabled('remark')" :onSelect="handleSelectPhrase"
                                :superviseId="form.docId" :inputContent="form.remark"
                                @collected="handleCollected"></quick-reply>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- 处理流程信息 -->
                <el-divider content-position="left">处理流程</el-divider>
                <div class="timeline-container">
                    <el-timeline>
                        <el-timeline-item v-for="(item, index) in historicalRecord" :key="index"
                            :timestamp="formatTime(item.processTime)" placement="top" :type="getStatusType(item.status)">
                            <div class="history-item">
                                <div class="history-header">
                                    <span class="history-title">{{ item.returnRemark || '处理流程' }}</span>
                                    <el-tag size="mini" :type="'info'">
                                        {{ getProcessStatusName(item.status) }}
                                    </el-tag>
                                </div>
                                <div class="history-info" v-if="item.nickName">
                                    <span class="info-label">处理人：</span>
                                    <span class="info-value">{{ item.nickName }}<template v-if="item.deptName">—{{ item.deptName }}</template></span>
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
                <el-button v-if="!isView && submitAction === 'resubmit'" type="primary"
                    @click="resubmitForm">重新提交</el-button>
                <el-button v-else-if="!isView && isProcessMode" type="primary" @click="submitProcess">确 定</el-button>
                <el-button v-else-if="!isView" type="primary" @click="publishForm">确 定</el-button>
                <el-button @click="cancel">关 闭</el-button>
            </div>
        </el-dialog>
        <ViewFile ref="viewFileRef" />
    </div>
</template>

<script>
import { addDraft, updateDraft, selectDocumentProcessListByDocId } from '@/api/oa/document';
import { addDocument, submitDraft } from '@/api/oa/documentManagement';
import {
    documentLeaderCheck,
    documentComprehensiveCheck,
    documentDirectorCheck,
    documentDirectorHair,
    documentSealCheck,
    departmentalDistribution
} from '@/api/oa/documentManagement';
import conf from '@/conf.js'; // 导入配置文件
import ViewFile from '@/components/viewFile';
import { getQueryDeptOrPermission } from '@/api/oa/publicApi';
import QuickReply from '@/components/quickReply/index.vue';

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
        comprehensiveList: {
            type: Array,
            default: () => []
        },
        isView: {
            type: Boolean,
            default: false
        },
        deptLeaderUserTreeList: {
            type: Array,
            default: () => []
        },
        directorList: {
            type: Array,
            default: () => []
        },
        documentTemplates: {
            type: Array,
            default: () => []
        },
        needsWrittenDate: {
            type: Boolean,
            default: false
        },
        // 流程相关的props
        processType: {
            type: String,
            default: ''
        },
        isProcessMode: {
            type: Boolean,
            default: false
        }
    },
    dicts: ['official_secrecy', 'official_urgency_level'],
    data() {
        return {
            visible: false,
            form: {
                type: 1,
                // 基础字段
                title: null,
                urgencyLevel: null,
                mainDeliveryAgency: null,
                text: null,
                filePath: null,
                filePathArray: [],
                attachmentDescription: null,
                issuingAgency: null,
                partNumber: 0,
                issuer: null,
                // 综合岗审核字段
                wordSize: null,
                secrecy: null,
                cc: null,
                contactPerson: null,
                contactPhone: null,
                // 流程字段
                directorIds: [],
                returnStatus: '',
                word: '',
                distributeUserIds: [],
                issuingDate: '',
                writtenDate: '',
                internalCirculation: [],
                userIds: [],
                status: '1',
                remark: '',
                docId: null
            },
            // 分阶段意见/结果字段，避免互相覆盖
            managerStatus: '1',
            managerRemark: '',
            comprehensiveStatus: '1',
            comprehensiveRemark: '',
            directorStatus: '1',
            directorRemark: '',
            titleType: null,
            rules: {
                title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
                urgencyLevel: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
                text: [{ required: true, message: '正文不能为空', trigger: 'blur' }],
                mainDeliveryAgency: [{ required: true, message: '主送单位不能为空', trigger: 'blur' }]
            },
            filePath: null,
            submitAction: 'publish',
            anyLeaveUsers: [], // 存储综合部人员
            filteredUsers: [],
            departmentList: [],
            historicalRecord: [],
            // 字段可编辑配置（现在所有字段都显示，但只有对应流程的字段可编辑）
            fieldVisibilityConfig: {
                // 新建公文时可编辑的字段
                create: ['title', 'urgencyLevel', 'mainDeliveryAgency', 'text', 'filePath', 'attachmentDescription', 'issuingAgency', 'partNumber'],
                // 查看详情时可编辑的字段（查看模式下所有字段都不可编辑）
                detail: [],
                // 修改并重新提交时可编辑的字段
                resubmit: ['title', 'urgencyLevel', 'mainDeliveryAgency', 'text', 'filePath', 'attachmentDescription', 'issuingAgency', 'partNumber'],
                // 经理审核时可编辑的字段
                leaderCheck: ['managerStatus', 'managerRemark'],
                // 综合岗审核时可编辑的字段
                comprehensiveCheck: ['directorIds', 'wordSize', 'secrecy', 'cc', 'contactPerson', 'contactPhone', 'comprehensiveStatus', 'comprehensiveRemark'],
                // 主任室审核时可编辑的字段（仅主任意见与结果、退回选项，不可编辑部门经理意见字段）
                directorCheck: ['directorStatus', 'directorRemark', 'returnStatus'],
                // 文件套头时可编辑的字段
                directorHair: ['word', 'writtenDate', 'issuingDate', 'internalCirculation', 'userIds', 'remark'],
                // 用印审批时可编辑的字段
                sealCheck: ['directorStatus', 'directorRemark', 'returnStatus'],
                // 部门经理分发时可编辑的字段
                leaderDistribute: ['distributeUserIds', 'remark']
            }
        };
    },
    methods: {
        // 时间格式化（与列表页保持一致简化版）
        formatTime(time) {
            if (!time) return '未知时间';
            try {
                return new Date(time).toLocaleString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            } catch(e) {
                return time;
            }
        },
        // 时间线样式类型
        getStatusType(status) {
            const typeMap = { 0: 'info', 1: 'success', 2: 'success', 3: 'warning', 4: 'danger' };
            return typeMap[status] || '';
        },
        // 处理状态名称
        getProcessStatusName(status) {
            const statusMap = { 0: '待办', 1: '已办', 2: '通过', 3: '退回', 4: '已被退回' };
            return statusMap[status] || '未知';
        },
        // 判断字段是否应该禁用
        isFieldDisabled(fieldName) {
            // 查看模式下所有字段都禁用
            if (this.isView) {
                return true;
            }

            // 发文人字段总是禁用
            if (fieldName === 'issuer') {
                return true;
            }

            // 退回选项只有在选择退回时才可编辑
            if (fieldName === 'returnStatus') {
                return this.form.status !== '2';
            }

            // 根据当前模式判断哪些字段可以编辑
            let currentMode = 'create';
            if (this.submitAction === 'resubmit') {
                currentMode = 'resubmit';
            } else if (this.isProcessMode && this.processType) {
                currentMode = this.processType;
            }

            // 获取当前模式下可编辑的字段
            const editableFields = this.fieldVisibilityConfig[currentMode] || [];

            // 特殊逻辑处理
            if (currentMode === 'directorHair' && fieldName === 'writtenDate') {
                // 成文日期只有在需要时才可编辑
                return !this.needsWrittenDate || !editableFields.includes(fieldName);
            }

            // 如果字段不在当前模式的可编辑字段列表中，则禁用
            return !editableFields.includes(fieldName);
        },

        // 处理主任岗人员选择变化
        handleDirectorIdsChange(selectedIds) {
            if (!selectedIds || !Array.isArray(selectedIds)) {
                return;
            }

            // 确保孙强总是被选中
            const sunQiangUserId = this.getSunQiangUserId();
            if (sunQiangUserId && !selectedIds.includes(sunQiangUserId)) {
                this.$message.warning('必须包含孙强作为审核人');
                // 自动添加孙强
                this.form.directorIds = [...selectedIds, sunQiangUserId];
            }

            // 限制最多选择2人
            if (selectedIds.length > 2) {
                this.$message.warning('最多只能选择2人');
                // 保留最后选择的2个人，确保孙强在其中
                const sunQiangId = this.getSunQiangUserId();
                if (sunQiangId && selectedIds.includes(sunQiangId)) {
                    // 如果孙强在选择中，保留孙强和最后一个选择的人
                    const otherIds = selectedIds.filter(id => id !== sunQiangId);
                    this.form.directorIds = [sunQiangId, otherIds[otherIds.length - 1]];
                } else {
                    // 如果孙强不在选择中，保留最后一个选择的人和孙强
                    this.form.directorIds = [selectedIds[selectedIds.length - 1], sunQiangId];
                }
            }
        },

        // 判断选项是否应该被禁用
        isDirectorOptionDisabled(userId) {
            const sunQiangUserId = this.getSunQiangUserId();
            // 如果是孙强，永远不禁用
            if (userId === sunQiangUserId) {
                return false;
            }
            // 如果已经选择了2个人且当前人员未被选中，则禁用
            const directorIds = this.form.directorIds || [];
            return directorIds.length >= 2 && !directorIds.includes(userId);
        },

        // 获取孙强的用户ID
        getSunQiangUserId() {
            if (!this.directorList || !Array.isArray(this.directorList)) {
                return null;
            }
            const sunQiang = this.directorList.find(user => user.nickName === '孙强');
            return sunQiang ? sunQiang.userId : null;
        },

        // 处理快速回复选择
        handleSelectPhrase(phrase) {
            this.form.remark = this.form.remark + phrase;
        },

        // 处理收藏意见成功回调
        handleCollected(content) {
            console.log('收藏成功:', content);
        },

        extractDepartments() {
            this.departmentList = [];
            if (!this.deptLeaderUserTreeList || !Array.isArray(this.deptLeaderUserTreeList)) {
                return;
            }
            const traverse = (nodes) => {
                if (!nodes) return;
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
            traverse(this.deptLeaderUserTreeList);
        },
        filterUsers() {
            this.filteredUsers = [];
            if (!this.deptLeaderUserTreeList || !Array.isArray(this.deptLeaderUserTreeList)) {
                return;
            }
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
        reset() {
            this.form = {
                type: 1,
                title: null,
                urgencyLevel: null,
                text: null,
                filePath: null,
                filePathArray: [],
                attachmentDescription: null,
                mainDeliveryAgency: null,
                issuingAgency: null,
                partNumber: 0,
                issuer: null,
                wordSize: null,
                secrecy: null,
                contactPerson: null,
                contactPhone: null
            };
            if (this.$refs.fileUpload) {
                setTimeout(() => {
                    this.$refs.fileUpload.clearFileList();
                }, 100);
            }
            if (this.$refs.form) {
                setTimeout(() => {
                    this.$refs.form.clearValidate();
                }, 100);
            }
        },
        open(data) {
            this.reset();
            if (data) {
                this.form = { ...data };
                // 处理filePath：将字符串按逗号分割为数组
                if (this.form.filePath && typeof this.form.filePath === 'string') {
                    this.form.filePathArray = this.form.filePath.split(',').filter(Boolean);
                } else {
                    this.form.filePathArray = [];
                }
                // 注释掉对隐藏字段的处理
                // 将deptLeaderIds转换为数字类型的数组显示
                // if (this.form.deptLeaderIds && typeof this.form.deptLeaderIds === 'string') {
                //     this.form.deptLeaderIds = this.form.deptLeaderIds.split(',').map(id => Number(id));
                // }
                // if (this.form.internalCirculation && typeof this.form.internalCirculation === 'string') {
                //     this.form.internalCirculation = this.form.internalCirculation.split(',').filter(Boolean).map(id => Number(id));
                // }
            } else {
                this.form.issuer = this.$store.getters.userInfo.nickName;
                this.form.filePathArray = [];
            }
            this.filterUsers();
            this.extractDepartments();
            // 拉取处理流程
            const docId = this.form.docId || this.form.id;
            if (docId) {
                selectDocumentProcessListByDocId({ id: docId }).then(res => {
                    this.historicalRecord = Array.isArray(res.data) ? res.data : [];
                }).catch(() => {
                    this.historicalRecord = [];
                });
            } else {
                this.historicalRecord = [];
            }
            this.visible = true;
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

            // // 根据文件类型选择不同的预览方式
            // if (this.isImageFile(filePath)) {
            //     window.open(baseUrl + filePath, '_blank');
            // } else if (['pdf'].includes(fileExt)) {
            //     window.open(baseUrl + filePath, '_blank');
            // } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt)) {
            //     const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`;
            //     window.open(officeOnlineUrl, '_blank');
            // } else {
            //     this.openFileViewerDialog(baseUrl + filePath, fileName, fileExt);
            // }
        },

        // 打开文件预览对话框
        openFileViewerDialog(fileUrl, fileName, fileExt) {
            this.$alert(
                `<div class="file-preview-container">
                    <p>当前文件格式(${fileExt})无法直接预览，请下载后查看。</p>
                    <a href="${fileUrl}" download="${fileName}" class="el-button el-button--primary">
                        <i class="el-icon-download"></i> 下载文件
                    </a>
                </div>`,
                `文件: ${fileName}`,
                {
                    dangerouslyUseHTMLString: true,
                    center: true,
                    confirmButtonText: '关闭'
                }
            );
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
            this.$refs['form'].validate(valid => {
                if (valid) {
                    // 创建表单数据的副本
                    const submitForm = JSON.parse(JSON.stringify(this.form));

                    // 注释掉对隐藏字段的处理
                    // 将deptLeaderIds数组转换为逗号分隔的字符串
                    // if (Array.isArray(submitForm.deptLeaderIds)) {
                    //     submitForm.deptLeaderIds = submitForm.deptLeaderIds.join(',');
                    // }
                    // if (Array.isArray(submitForm.internalCirculation)) {
                    //     submitForm.internalCirculation = submitForm.internalCirculation.join(',');
                    // }

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
        // 下载附件
        handleDownload(filePath) {
            // 获取完整的文件URL
            const fileUrl = this._baseUrl + filePath;
            // 获取文件名
            const fileName = filePath.split('/').pop() || '附件';

            // 使用fetch获取文件内容
            fetch(fileUrl)
                .then(response => response.blob())
                .then(blob => {
                    // 创建Blob URL
                    const blobUrl = window.URL.createObjectURL(blob);

                    // 创建下载链接
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName;

                    // 添加到文档并触发点击
                    document.body.appendChild(link);
                    link.click();

                    // 清理
                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);
                })
                .catch(error => {
                    console.error('下载文件失败:', error);
                    this.$message.error('下载文件失败');
                });
        },
        // 获得背景材料上传成功信息
        handleMaterialUploadSuccess(fileList) {
            // 如果需要处理背景材料上传成功的逻辑
        },

        // 处理背景材料删除
        handleMaterialFileDeleted() {
            this.form.materialFile = null;
        },
        // 设置提交动作类型
        setSubmitAction(action) {
            this.submitAction = action;
        },

        // 重新提交表单
        resubmitForm() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    // 创建表单数据的副本
                    const submitForm = JSON.parse(JSON.stringify(this.form));

                    // 注释掉对隐藏字段的处理
                    // 将deptLeaderIds数组转换为逗号分隔的字符串
                    // if (Array.isArray(submitForm.deptLeaderIds)) {
                    //     submitForm.deptLeaderIds = submitForm.deptLeaderIds.join(',');
                    // }
                    // if (Array.isArray(submitForm.internalCirculation)) {
                    //     submitForm.internalCirculation = submitForm.internalCirculation.join(',');
                    // }

                    submitDraft(submitForm).then(response => {
                        this.$modal.msgSuccess('重新提交成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                }
            });
        },
        // 提交流程处理
        submitProcess() {
            if (this.processType === 'leaderCheck') {
                // 经理审核需要：docId, status, remark 以及公文基本信息字段
                const params = {
                    docId: this.form.docId,
                    status: this.form.status,
                    remark: this.form.remark,
                    title: this.form.title,
                    urgencyLevel: this.form.urgencyLevel,
                    mainDeliveryAgency: this.form.mainDeliveryAgency,
                    text: this.form.text,
                    filePath: this.form.filePath,
                    attachmentDescription: this.form.attachmentDescription,
                    issuingAgency: this.form.issuingAgency,
                    partNumber: this.form.partNumber
                };
                documentLeaderCheck(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.visible = false;
                    this.$emit('cancel');
                });
            } else if (this.processType === 'comprehensiveCheck') {
                if (this.form.status === '1') {
                    const directorIds = this.form.directorIds || [];
                    if (directorIds.length === 0) {
                        this.$message.error('请选择主任岗人员');
                        return;
                    }

                    // 验证选择人数不超过2人
                    if (directorIds.length > 2) {
                        this.$message.error('最多只能选择2人');
                        return;
                    }

                    // 验证必须包含孙强
                    const sunQiangUserId = this.getSunQiangUserId();
                    if (sunQiangUserId && !directorIds.includes(sunQiangUserId)) {
                        this.$message.error('必须包含孙强作为审核人');
                        return;
                    }
                }

                // 验证联系电话必须为数字（如果已填写）
                if (this.form.contactPhone && this.form.contactPhone.trim()) {
                    const phoneRegex = /^[0-9]+$/;
                    if (!phoneRegex.test(this.form.contactPhone.trim())) {
                        this.$message.error('联系电话必须为纯数字');
                        return;
                    }
                }

                // 综合岗审核需要：docId, status, remark, 通过时需要directorIds
                const params = {
                    docId: this.form.docId,
                    status: this.form.status,
                    remark: this.form.remark
                };
                if (this.form.status === '1') {
                    // 将directorIds数组转换为逗号分隔的字符串
                    const directorIds = this.form.directorIds || [];
                    params.directorIds = directorIds.join(',');
                }
                // 添加新增的字段
                if (this.form.wordSize) {
                    params.wordSize = this.form.wordSize;
                }
                if (this.form.secrecy) {
                    params.secrecy = this.form.secrecy;
                }
                if (this.form.cc) {
                    params.cc = this.form.cc;
                }
                if (this.form.contactPerson) {
                    params.contactPerson = this.form.contactPerson;
                }
                if (this.form.contactPhone) {
                    params.contactPhone = this.form.contactPhone;
                }
                documentComprehensiveCheck(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.visible = false;
                    this.$emit('cancel');
                });
            } else if (this.processType === 'directorCheck') {
                // 主任室审核需要：docId, status, remark, 拒绝时需要returnStatus
                const params = {
                    docId: this.form.docId,
                    status: this.form.status,
                    remark: this.form.remark
                };
                if (this.form.status === '2') {
                    params.returnStatus = this.form.returnStatus;
                }
                documentDirectorCheck(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.visible = false;
                    this.$emit('cancel');
                });
            } else if (this.processType === 'directorHair') {
                if (!this.form.word) {
                    this.$message.error('请选择套头模板');
                    return;
                }
                if (!this.form.issuingDate) {
                    this.$message.error('请选择印发日期');
                    return;
                }
                // 检查是否需要成文日期
                if (this.needsWrittenDate && !this.form.writtenDate) {
                    this.$message.error('请选择成文日期');
                    return;
                }
                // 综合岗套头需要：docId, word, remark
                const params = {
                    docId: this.form.docId,
                    word: this.form.word,
                    remark: this.form.remark,
                    issuingDate: this.form.issuingDate,
                };
                // 如果需要成文日期，添加到参数中
                if (this.needsWrittenDate) {
                    params.writtenDate = this.form.writtenDate;
                }
                // 如果选择了内部发送部门，添加到参数中
                const internalCirculation = this.form.internalCirculation || [];
                if (internalCirculation.length > 0) {
                    params.internalCirculation = internalCirculation.join(',');
                }
                // 如果选择了部门经理，添加到参数中
                const userIds = this.form.userIds || [];
                if (userIds.length > 0) {
                    params.userIds = userIds.join(',');
                }
                documentDirectorHair(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.visible = false;
                    this.$emit('cancel');
                });
            } else if (this.processType === 'sealCheck') {
                // 用印审批需要：docId, status, remark, 拒绝时需要returnStatus
                const params = {
                    docId: this.form.docId,
                    status: this.form.status,
                    remark: this.form.remark
                };
                if (this.form.status === '2') {
                    params.returnStatus = this.form.returnStatus;
                }
                documentSealCheck(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.visible = false;
                    this.$emit('cancel');
                });
            } else if (this.processType === 'leaderDistribute') {
                // 部门经理分发
                const distributeUserIds = this.form.distributeUserIds || [];
                if (distributeUserIds.length === 0) {
                    this.$message.error('请选择分发人员');
                    return;
                }

                const params = {
                    docId: this.form.docId,
                    userIds: distributeUserIds.join(','),
                    remark: this.form.remark
                };

                departmentalDistribution(params).then(res => {
                    this.$modal.msgSuccess('处理成功');
                    this.visible = false;
                    this.$emit('cancel');
                });
            }
        },

        loadAnyLeaveUsers() {
            const anyLeaveUsers = new Map();
            
            // 获取有 anyLeave 权限的用户
            getQueryDeptOrPermission('system:user:anyLeave').then(res => {
                if (res.data && res.data.length) {
                    res.data.forEach(user => {
                        anyLeaveUsers.set(user.userId, user);
                    });
                    this.anyLeaveUsers = Array.from(anyLeaveUsers.values());
                }
            });
            
            // 获取有 anyFinance 权限的用户并合并
            getQueryDeptOrPermission('system:user:anyFinance').then(res => {
                if (res.data && res.data.length) {
                    res.data.forEach(user => {
                        anyLeaveUsers.set(user.userId, user);
                    });
                }
                this.anyLeaveUsers = Array.from(anyLeaveUsers.values());
            });
        }
    },
    mounted() {
        this.loadAnyLeaveUsers();
    },
    watch: {
        'form.word': {
            handler(newValue) {
                // Check if selected template is one of the specific ones requiring writtenDate
                const requiredTemplates = [
                    '/调解风险建议书.docx',
                    '/津众和发〔202X〕XX号.docx',
                    '/津众和便函〔202X〕XX号.docx'
                ];
                // 通过事件通知父组件更新needsWrittenDate
                this.$emit('update-needs-written-date', requiredTemplates.includes(newValue));
            },
            immediate: true
        },
        'form.seal': {
            handler(newVal) {
                // 当seal值变化时，如果表单已经渲染，重新验证sealUserId字段
                this.$nextTick(() => {
                    if (this.$refs.form) {
                        this.$refs.form.validateField('sealUserId');
                    }
                });
            }
        }
    }
};
</script>

<style scoped>
/* 处理流程样式，与列表页保持一致 */
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
    max-height: 80vh;
    overflow: auto;
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
