<template>
    <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body @close="cancel">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px" :disabled="controls == 'view'">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="公文类型" prop="type">
                        <el-radio-group v-model="form.type" :disabled="controls == 'update'">
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
                    <el-form-item label="接收人" prop="receivedIds" v-if="form.type === 1">
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
                    <el-form-item label="签发人" prop="issuer" :rules="form.type == 0 ? rules.issuer : [{ required: false }]">
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
            <el-row v-if="form.type === 0">
                <el-col :span="12">
                    <el-form-item label="印发日期" prop="issuingDate">
                        <el-date-picker v-model="form.issuingDate" type="date" placeholder="选择印发日期" style="width: 100%"></el-date-picker>
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
                    <el-form-item label="发文机关署名" prop="sign">
                        <el-input v-model="form.sign" placeholder="请输入发文机关署名" maxlength="50"  clearable />
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
                        <template v-if="(form.filePath && form.status == 1) || (form.filePath && form.status == 11) || (form.filePath && form.status == 0)">
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
                                        <FileUpload v-model="form.filePath" @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted" ref="fileUpload" />
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
                                        <FileUpload v-model="form.filePath" @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted" ref="fileUpload" />
                                    </span>
                                </el-col>
                            </el-row>
                        </template>

                        <template v-else>
                            <!-- 调试信息 -->
                            <!-- <div v-if="true">当前文件路径: {{ form.filePath }}</div> -->
                            <span>无附件</span>
                            <FileUpload v-model="form.filePath" @upload-success="handleUploadSuccess" @file-deleted="handleFileDeleted" ref="fileUpload" />
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
            <el-button type="primary" v-if="controls !== 'view'" @click="saveForm">保 存</el-button>
            <el-button v-if="title == '公文发布'" type="primary" @click="publishForm">发 布</el-button>
            <el-button v-if="title == '修改公文管理草稿'" type="primary" @click="submitForm">提 交</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { addDraft, updateDraft, submitDraft } from '@/api/oa/document';
import { addDocument } from '@/api/oa/document';

export default {
    props: ['title', 'controls', 'userList', 'comprehensiveList', 'close'],
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
                issuer: [{ required: true, message: '签发人不能为空', trigger: 'blur' }],
                title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
                mainDeliveryAgency: [{ required: true, message: '主送机关不能为空', trigger: 'blur' }],
                text: [{ required: true, message: '正文不能为空', trigger: 'blur' }],

                blr: [{ required: true, message: '办理人不能为空', trigger: 'blur' }],
                generalId: [{ required: true, message: '综合处理人不能为空', trigger: 'blur' }],
                receivedIds: [{ required: true, message: '接收人不能为空', trigger: 'blur' }]
            },
            filePath: null
        };
    },
    methods: {
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
            setTimeout(() => {
                this.$refs.fileUpload.clearFileList();
            }, 100);
            setTimeout(() => {
                this.$refs.form.clearValidate();
            }, 100);
        },
        open(data) {
            // this.reset();
            if (data) {
                this.form = data;
                // 将receivedIds字符串转换为数组
                if (data.receivedIds) {
                    this.form.receivedIds = this.form.receivedIds.split(',').map(item => Number(item));
                }
            }
            this.visible = true;
        },
        // 获得上传文件信息
        handleUploadSuccess(fileList) {
            // this.form.filePath = fileList[0].url;
        },
        // 保存表单
        saveForm() {
            if (this.form.receivedIds && Array.isArray(this.form.receivedIds)) {
                this.form.receivedIds = this.form.receivedIds.join(',');
            }
            this.$refs['form'].validate(valid => {
                if (valid) {
                    if (this.title == '添加公文管理草稿' || this.title == '公文发布') {
                        addDraft(this.form).then(response => {
                            this.$modal.msgSuccess('新增成功');
                            this.$emit('cancel');
                            this.visible = false;
                            this.$bus.$emit('refreshDraftList');
                        });
                    } else {
                        updateDraft(this.form).then(response => {
                            this.$modal.msgSuccess('修改成功');
                            this.$emit('cancel');
                            this.visible = false;
                            this.$bus.$emit('refreshDraftList');
                        });
                    }
                }
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
        },
        // 公文发布
        publishForm() {
            if (this.form.receivedIds && Array.isArray(this.form.receivedIds)) {
                this.form.receivedIds = this.form.receivedIds.join(',');
            }
            this.$refs['form'].validate(valid => {
                if (valid) {
                    addDocument(this.form).then(response => {
                        this.$modal.msgSuccess('发布成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                }
            });
        },
        // 提交表单
        submitForm() {
            if (this.form.receivedIds && Array.isArray(this.form.receivedIds)) {
                this.form.receivedIds = this.form.receivedIds.join(',');
            }
            this.$refs['form'].validate(valid => {
                if (valid) {
                    submitDraft(this.form).then(response => {
                        this.$modal.msgSuccess('新增成功');
                        this.$emit('cancel');
                        this.visible = false;
                    });
                }
            });
        },
        // 取消按钮
        cancel() {
            if (this.controls) {
                this.close();
            }
            this.visible = false;
            this.reset();
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
        }
    },
    mounted() {}
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
