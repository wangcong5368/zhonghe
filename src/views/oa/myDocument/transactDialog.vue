<template>
    <el-dialog :title="dialogTitle" :visible.sync="visible" width="800px" append-to-body>
        <el-form ref="form" :model="form" label-width="120px" :disabled="form.status !== 1 && form.status !== 11" :rules="rules">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="公文类型" prop="type">
                        <el-radio-group v-model="form.type">
                            <el-radio :label="0">收文发文</el-radio>
                            <el-radio :label="1">普通发文</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="份号" prop="partNumber">
                        <el-input v-model="form.partNumber" placeholder="请输入份号" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="密级" prop="secrecy">
                        <el-select v-model="form.secrecy" placeholder="请选择密级" style="width: 100%">
                            <el-option v-for="dict in dict.type.official_secrecy" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="紧急程度" prop="urgencyLevel">
                        <el-select v-model="form.urgencyLevel" placeholder="请选择紧急程度" style="width: 100%">
                            <el-option v-for="dict in dict.type.official_urgency_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="发文机关标志" prop="officialLog">
                        <el-input v-model="form.officialLog" placeholder="请输入发文机关标志" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="12">
                    <el-form-item label="综合岗处理人" prop="generalId">
                        <el-select v-model="form.generalId" placeholder="请选择综合岗处理人" style="width: 100%" clearable>
                            <el-option v-for="item in comprehensiveList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="接收人" prop="receivedIds">
                        <el-select v-model="form.receivedIds" multiple placeholder="请选择接收人" style="width: 100%" clearable>
                            <el-option v-for="item in userList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="12">
                    <el-form-item label="发文字号" prop="wordSize">
                        <el-input v-model="form.wordSize" placeholder="请输入发文字号" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="签发人" prop="issuer">
                        <el-input v-model="form.issuer" placeholder="请输入签发人" maxlength="10"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="标题" prop="title">
                        <el-input v-model="form.title" placeholder="请输入标题" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="主送机关" prop="mainDeliveryAgency">
                        <el-input v-model="form.mainDeliveryAgency" placeholder="请输入主送机关" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="正文" prop="text">
                        <el-input v-model="form.text" type="textarea" placeholder="请输入正文" maxlength="2000"  clearable :autosize="{ minRows: 2 }" class="custom-textarea" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="发文机关署名" prop="sign">
                        <el-input v-model="form.sign" placeholder="请输入发文机关署名" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="成文日期" prop="writtenDate">
                        <el-date-picker v-model="form.writtenDate" type="date" placeholder="选择成文日期" style="width: 100%"></el-date-picker>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="附注" prop="annotations">
                        <el-input v-model="form.annotations" type="textarea" placeholder="请输入附注" maxlength="200"  clearable :autosize="{ minRows: 2 }" class="custom-textarea" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="抄送机关" prop="cc">
                        <el-input v-model="form.cc" placeholder="请输入抄送机关" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="印发机关" prop="issuingAgency">
                        <el-input v-model="form.issuingAgency" placeholder="请输入印发机关" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="印发日期" prop="issuingDate">
                        <el-date-picker v-model="form.issuingDate" type="date" placeholder="选择印发日期" style="width: 100%"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="内部发送" prop="internalCirculation">
                        <el-input v-model="form.internalCirculation" placeholder="请输入内部发送" maxlength="50"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="联系人" prop="contactPerson">
                        <el-input v-model="form.contactPerson" placeholder="请输入联系人" maxlength="10"  clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="联系电话" prop="contactPhone">
                        <el-input v-model="form.contactPhone" placeholder="请输入联系电话" maxlength="11"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="24">
                    <el-form-item label="附件" prop="attachmentDescription">
                        <template v-if="(form.filePath && form.status == 1) || (form.filePath && form.status == 11)">
                            <el-row>
                                <el-col :span="6">
                                    <!-- 根据文件类型显示不同内容 -->
                                    <template v-if="isImageFile(form.filePath)">
                                        <el-image style="width: 100px; height: 100px" :src="_baseUrl + form.filePath" :preview-src-list="[_baseUrl + form.filePath]"></el-image>
                                    </template>
                                    <template v-else>
                                        <div class="file-icon-container">
                                            <i :class="getFileIcon(form.filePath)" class="file-icon"></i>
                                            <span class="file-name">{{ getFileName(form.filePath) }}</span>
                                        </div>
                                    </template>
                                </el-col>
                                <el-col :span="18">
                                    <span>
                                        重新上传
                                        <FileUpload @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted" ref="fileUpload" />
                                    </span>
                                </el-col>
                            </el-row>
                        </template>

                        <template v-else-if="form.filePath">
                            <el-row>
                                <el-col :span="6">
                                    <!-- 根据文件类型显示不同内容 -->
                                    <template v-if="isImageFile(form.filePath)">
                                        <el-image style="width: 100px; height: 100px" :src="_baseUrl + form.filePath" :preview-src-list="[_baseUrl + form.filePath]"></el-image>
                                    </template>
                                    <template v-else>
                                        <div class="file-icon-container">
                                            <i :class="getFileIcon(form.filePath)" class="file-icon"></i>
                                            <span class="file-name">{{ getFileName(form.filePath) }}</span>
                                        </div>
                                    </template>
                                </el-col>
                                <el-col :span="18">
                                    <span>
                                        重新上传
                                        <FileUpload @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted" ref="fileUpload" />
                                    </span>
                                </el-col>
                            </el-row>
                        </template>

                        <template v-else>
                            <span>无附件</span>
                            <FileUpload @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted" ref="fileUpload" />
                        </template>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="24">
                    <el-form-item label="附件说明" prop="attachmentDescription">
                        <el-input v-model="form.attachmentDescription" placeholder="请输入附件说明" type="textarea" maxlength="200"  clearable />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <!-- 经理审核 -->
            <template v-if="form.status == 12">
                <el-button type="primary" @click="handleLeaderCheck(1)">通过</el-button>
                <el-button type="danger" @click="handleLeaderCheck(2)">拒绝</el-button>
            </template>

            <!-- 综合岗审核 -->
            <template v-else-if="form.status == 13">
                <el-form :inline="true" size="small">
                    <el-form-item label="选择主任岗">
                        <el-select v-model="selectedDirectors" multiple placeholder="请选择主任岗人员" style="width: 240px" :disabled="comprehensiveStatus === 2">
                            <el-option v-for="item in directorList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleComprehensiveCheck(1)">通过</el-button>
                        <el-button type="danger" @click="handleComprehensiveCheck(2)">拒绝</el-button>
                    </el-form-item>
                </el-form>
            </template>

            <!-- 综合岗收文办理 -->
            <template v-else-if="form.status == 2">
                <el-form :inline="true" size="small">
                    <el-form-item label="选择主任岗">
                        <el-select v-model="selectedDirectors" multiple placeholder="请选择主任岗人员" style="width: 240px">
                            <el-option v-for="item in directorList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="选择办理人">
                        <el-select v-model="selectedHandlers" multiple placeholder="请选择办理人员" style="width: 240px">
                            <el-option v-for="item in handleList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleReceivingComprehensive">提交</el-button>
                    </el-form-item>
                </el-form>
            </template>

            <!-- 主任岗收文审核 -->
            <template v-else-if="form.status == 3">
                <el-button type="primary" @click="handleReceivingDirectorCheck(1)">通过</el-button>
                <el-button type="danger" @click="handleReceivingDirectorCheck(2)">拒绝</el-button>
            </template>

            <!-- 办理、协办岗收文办理 -->
            <template v-else-if="form.status == 4">
                <el-button type="primary" @click="handleReceivingHandle">提交</el-button>
            </template>

            <!-- 主任岗审核 -->
            <template v-else-if="form.status == 14">
                <el-button type="primary" @click="handleDirectorCheck(1, 0)">通过</el-button>
                <el-button type="warning" @click="handleDirectorCheck(2, 0)">退回上一步</el-button>
                <el-button type="danger" @click="handleDirectorCheck(2, 1)">退回发文人</el-button>
            </template>

            <!-- 综合岗套头 -->
            <template v-else-if="form.status == 15">
                <el-form :inline="true" size="small" :model="templateForm" ref="templateForm" :rules="templateRules">
                    <el-form-item label="选择模板" prop="template">
                        <el-select v-model="templateForm.template" placeholder="请选择模板" style="width: 140px">
                            <el-option v-for="item in documentDict" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="印发日期" prop="issuingDate">
                        <el-date-picker v-model="templateForm.issuingDate" type="date" placeholder="选择印发日期" style="width: 140px"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="用印审批人" prop="sealUser">
                        <el-select v-model="templateForm.sealUser" placeholder="请选择用印审批人" style="width: 140px">
                            <el-option v-for="item in userList" :key="item.userId" :label="item.nickName" :value="item.userId"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleDirectorHair">提交</el-button>
                    </el-form-item>
                </el-form>
            </template>

            <!-- 用印审批 -->
            <template v-else-if="form.status == 16">
                <el-button type="primary" @click="handleSealCheck(1, 0)">通过</el-button>
                <el-button type="warning" @click="handleSealCheck(2, 0)">退回上一步</el-button>
                <el-button type="danger" @click="handleSealCheck(2, 1)">退回发文人</el-button>
            </template>

            <!-- 接收人确认 -->
            <template v-else-if="form.status == 17">
                <el-button type="primary" @click="handleReceivedConfirm">确认</el-button>
            </template>

            <!-- 综合岗办结 -->
            <template v-else-if="form.status == 18">
                <el-button type="primary" @click="handlePlaceOnFile">归档</el-button>
            </template>

            <!-- 默认按钮 -->
            <template>
                <el-button v-if="form.status == 1 || form.status == 11" @click="submitForm" type="primary">重新提交</el-button>
                <el-button @click="cancel">取 消</el-button>
                <!-- <el-button @click="getPreviewRedHeaderDoc" v-if="form.status > 15"
          >公文预览</el-button
        >
        <el-popover
          placement="top-end"
          offset="200"
          width="400"
          trigger="click"
        >
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in historicalRecord"
              :key="index"
              :timestamp="formatTime(item.processTime)"
              placement="top"
            >
              <div class="history-content">{{ item.returnRemark }}</div>
            </el-timeline-item>
          </el-timeline>
          <el-button slot="reference">查看处理流程</el-button>
        </el-popover> -->
            </template>
        </div>
    </el-dialog>
</template>

<script>
import {
    documentLeaderCheck,
    documentComprehensiveCheck,
    documentDirectorCheck,
    documentDirectorHair,
    documentSealCheck,
    documentReceivedConfirm,
    updatePlaceOnFile,
    documentReceivingComprehensive,
    documentReceivingDirectorCheck,
    documentReceivingHandle,
    getPreviewRedHeaderDoc,
    selectDocumentProcessListByDocId,
    submitDraft
} from '@/api/oa/document';
import { getAllUser, getDirectorList, getHandleList, getDocumentDict, getComprehensiveList } from '@/api/oa/publicApi.js';

export default {
    props: ['title'],
    dicts: ['official_secrecy', 'official_urgency_level'],
    data() {
        return {
            visible: false,
            form: {},
            titleType: null,
            rules: {
                secrecy: [{ required: true, message: '密级不能为空', trigger: 'change' }],
                urgencyLevel: [{ required: true, message: '紧急程度不能为空', trigger: 'change' }],
                wordSize: [{ required: true, message: '发文字号不能为空', trigger: 'blur' }],
                title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
                mainDeliveryAgency: [{ required: true, message: '主送机关不能为空', trigger: 'blur' }],
                text: [{ required: true, message: '正文不能为空', trigger: 'blur' }],

                blr: [{ required: true, message: '办理人不能为空', trigger: 'blur' }],
                generalId: [{ required: true, message: '综合处理人不能为空', trigger: 'blur' }],
                receivedIds: [{ required: true, message: '接收人不能为空', trigger: 'blur' }]
            },
            userList: [],
            directorList: [],
            handleList: [], // 存储办理人列表
            selectedHandlers: [], // 存储选中的办理人
            selectedDirectors: [], // 存储选中的主任岗人员
            comprehensiveStatus: 1, // 默认为通过状态
            comprehensiveList: [],
            documentDict: [],
            selectedTemplate: '', // 存储选中的模板
            selectedSealUser: '', // 存储选中的用印审批人
            historicalRecord: [],
            selectedIssuingDate: null, // 添加印发日期字段
            templateForm: {
                template: '',
                issuingDate: null,
                sealUser: ''
            },
            templateRules: {
                template: [{ required: true, message: '请选择模板', trigger: 'change' }],
                issuingDate: [{ required: true, message: '请选择印发日期', trigger: 'change' }],
                sealUser: [{ required: true, message: '请选择用印审批人', trigger: 'change' }]
            }
        };
    },
    methods: {
        //获取综合岗角色
        getComprehensiveList() {
            getComprehensiveList().then(res => {
                this.comprehensiveList = res.data;
                console.log(res, 'ress');
            });
        },
        //获取所有用户
        getUserList() {
            getAllUser().then(res => {
                this.userList = res.data;
            });
        },
        //获取主任列表
        getDirectorList() {
            getDirectorList().then(res => {
                this.directorList = res.data;
            });
        },
        // 获取办理人列表
        getHandleList() {
            getHandleList().then(res => {
                this.handleList = res.data;
            });
        },
        // 获取模板字典
        getDocumentDict() {
            getDocumentDict().then(res => {
                this.documentDict = res.data;
            });
        },
        reset() {
            this.form = {
                type: 0,
                partNumber: null,
                secrecy: null,
                urgencyLevel: null,
                officialLog: null,
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
                contactPerson: null,
                contactPhone: null,
                transactor: null,
                assistantOrganizer: null,
                nblyj: null,
                blyj: null,
                zbrbljg: null,
                xbrbljg: null,
                stamp: 1,
                bmjlspyj: null,
                hgyj: null,
                sqyj: null,
                gwht: null,
                yyspyj: null,
                cyqk: null,
                generalId: null,
                receivedIds: null
            };
            this.templateForm = {
                template: '',
                issuingDate: null,
                sealUser: ''
            };
            setTimeout(() => {
                this.$refs.fileUpload.clearFileList();
            }, 100);
            setTimeout(() => {
                this.$refs.form.clearValidate();
            }, 100);
            this.selectedDirectors = [];
            this.selectedHandlers = [];
            this.selectedTemplate = '';
            this.selectedSealUser = '';
            this.selectedIssuingDate = null; // 重置印发日期
            this.comprehensiveStatus = 1;
        },
        open(data) {
            this.reset();
            if (data) {
                this.form = data;
                // 将receivedIds字符串转换为数组
                if (data.receivedIds) {
                    this.form.receivedIds = this.form.receivedIds.split(',').map(item => Number(item));
                }
                this.selectDocumentProcessListByDocId();
            }
            this.visible = true;
        },
        // 获得上传文件信息
        handleUploadSuccess(fileList) {
            if (fileList && fileList.length > 0) {
                this.form.filePath = fileList[0].url;
            }
        },
        // 取消按钮
        cancel() {
            this.visible = false;
            this.reset();
        },
        // 经理审核
        handleLeaderCheck(status) {
            this.$prompt('请输入审核意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    const params = {
                        docId: this.form.id,
                        status: status,
                        remark: value
                    };
                    documentLeaderCheck(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {});
        },

        // 综合岗审核
        handleComprehensiveCheck(status) {
            // 如果是通过状态，需要校验是否选择了主任岗人员
            if (status === 1 && this.selectedDirectors.length === 0) {
                this.$message.error('请至少选择一位主任岗人员');
                return;
            }

            this.$prompt('请输入审核意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    // 设置状态，用于禁用选择框
                    this.comprehensiveStatus = status;

                    const params = {
                        docId: this.form.id,
                        status: status,
                        remark: value
                    };

                    // 如果是通过状态，添加主任岗人员ID
                    if (status === 1) {
                        params.directorIds = this.selectedDirectors.join(',');
                    }
                    documentComprehensiveCheck(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {
                    // 取消操作时不改变状态
                });
        },

        // 主任岗审核
        handleDirectorCheck(status, returnStatus) {
            this.$prompt('请输入审核意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    const params = {
                        docId: this.form.id,
                        status: status,
                        remark: value,
                        returnStatus: returnStatus
                    };
                    documentDirectorCheck(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {});
        },

        // 综合岗套头
        handleDirectorHair() {
            this.$refs.templateForm.validate(valid => {
                if (!valid) {
                    return;
                }

                this.$prompt('请输入审核意见', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'textarea'
                })
                    .then(({ value: remark }) => {
                        const params = {
                            docId: this.form.id,
                            word: this.templateForm.template,
                            remark: remark,
                            userId: this.templateForm.sealUser,
                            issuingDate: this.templateForm.issuingDate
                        };

                        documentDirectorHair(params).then(response => {
                            this.$modal.msgSuccess('操作成功');
                            this.$emit('cancel');
                            this.visible = false;
                        });
                    })
                    .catch(() => {});
            });
        },

        // 用印审批
        handleSealCheck(status, returnStatus) {
            this.$prompt('请输入审核意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    const params = {
                        docId: this.form.id,
                        status: status,
                        remark: value,
                        returnStatus: returnStatus
                    };
                    documentSealCheck(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {});
        },

        // 接收人确认
        handleReceivedConfirm() {
            const params = {
                docId: this.form.id
            };
            documentReceivedConfirm(params).then(response => {
                this.$modal.msgSuccess('确认成功');
                this.$emit('cancel');
                this.visible = false;
            });
        },

        // 综合岗办结-归档
        handlePlaceOnFile() {
            const params = {
                id: this.form.id
            };
            updatePlaceOnFile(params).then(response => {
                this.$modal.msgSuccess('归档成功');
                this.$emit('cancel');
                this.visible = false;
            });
        },
        // 综合岗收文办理
        handleReceivingComprehensive() {
            // 校验是否选择了主任岗和办理人员
            if (this.selectedDirectors.length === 0) {
                this.$message.error('请至少选择一位主任岗人员');
                return;
            }
            if (this.selectedHandlers.length === 0) {
                this.$message.error('请至少选择一位办理人员');
                return;
            }

            this.$prompt('请输入意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    const params = {
                        docId: this.form.id,
                        directorIds: this.selectedDirectors.join(','),
                        handleIds: this.selectedHandlers.join(','),
                        remark: value
                    };

                    documentReceivingComprehensive(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {});
        },

        // 主任岗收文审核
        handleReceivingDirectorCheck(status) {
            this.$prompt('请输入意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    const params = {
                        docId: this.form.id,
                        status: status,
                        remark: value
                    };

                    documentReceivingDirectorCheck(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {});
        },

        // 办理、协办岗收文办理
        handleReceivingHandle() {
            this.$prompt('请输入意见', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputType: 'textarea'
            })
                .then(({ value }) => {
                    const params = {
                        docId: this.form.id,
                        remark: value
                    };

                    documentReceivingHandle(params).then(response => {
                        this.$modal.msgSuccess('操作成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                })
                .catch(() => {});
        },

        // 公文预览
        getPreviewRedHeaderDoc() {
            getPreviewRedHeaderDoc(this.form.id)
                .then(res => {
                    // 创建 blob 对象，设置正确的 MIME 类型
                    const blob = new Blob([res], {
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });
                    // 创建下载链接
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    // 设置下载文件名
                    link.download = `公文_${this.form.id}.docx`;
                    // 添加到页面并触发点击
                    document.body.appendChild(link);
                    link.click();
                    // 清理
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);
                })
                .catch(error => {
                    this.$message.error('文件下载失败');
                    console.error('下载失败:', error);
                });
        },

        // 获取公文处理详情
        selectDocumentProcessListByDocId() {
            selectDocumentProcessListByDocId({ id: this.form.id }).then(res => {
                this.historicalRecord = res.data;
            });
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

        // 修改提交
        submitForm() {
            if (this.form.receivedIds && Array.isArray(this.form.receivedIds)) {
                this.form.receivedIds = this.form.receivedIds.join(',');
            }
            this.$refs['form'].validate(valid => {
                if (valid) {
                    submitDraft(this.form).then(response => {
                        this.$modal.msgSuccess('重新提交成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                }
            });
        },

        // 判断是否为图片文件
        isImageFile(filePath) {
            if (!filePath) return false;
            const ext = filePath.split('.').pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
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

        getFileIcon(filePath) {
            if (!filePath) return 'el-icon-document';
            const ext = filePath.split('.').pop().toLowerCase();

            // 根据文件扩展名返回对应的图标
            const iconMap = {
                doc: 'el-icon-document',
                docx: 'el-icon-document',
                xls: 'el-icon-tickets',
                xlsx: 'el-icon-tickets',
                ppt: 'el-icon-document',
                pptx: 'el-icon-document',
                pdf: 'el-icon-document',
                txt: 'el-icon-document',
                zip: 'el-icon-folder',
                rar: 'el-icon-folder'
            };

            return iconMap[ext] || 'el-icon-document';
        },
        // 获取文件名
        getFileName(filePath) {
            if (!filePath) return '未知文件';
            return filePath.split('/').pop();
        },
        // 处理文件删除
        handleFileDeleted() {
            this.form.filePath = null;
        }
    },
    mounted() {
        this.getUserList();
        this.getDirectorList();
        this.getHandleList();
        this.getDocumentDict();
        this.getComprehensiveList();
    },
    computed: {
        // 根据状态获取对话框标题
        dialogTitle() {
            if (!this.form.status) {
                return this.title;
            }

            const statusMap = {
                2: '综合岗收文办理',
                3: '主任岗收文审核',
                4: '办理、协办岗收文办理',
                12: '经理审核',
                13: '综合岗核稿',
                14: '主任岗审核',
                15: '文件套头',
                16: '用印审批',
                17: '接收人确认',
                18: '综合岗办结'
            };

            const statusName = statusMap[this.form.status];
            if (statusName) {
                return `${this.title} - ${statusName}`;
            }

            return this.title;
        }
    }
};
</script>

<style scoped>
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
    overflow: hidden;
    padding: 0 5px;
}
</style>
