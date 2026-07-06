<template>
    <el-dialog :visible.sync="dialogVisible" width="700px" :close-on-click-modal="false" custom-class="doc-sign-dialog" @closed="handleClose">
        <div class="dialogVisible-wrap" v-if="type === '发文'">
            <div slot="title" class="dialog-title">
                <span>金融监管总局天津监管局文件处理单</span>
            </div>

            <!-- 1. 公文头部：密级、缓急 -->
            <div class="doc-header">
                <!-- <div class="header-top">
                    <span class="security-level">密级</span>
                    <span class="urgency-level">〔非密〕</span>
                </div> -->
                <div class="header-top" v-if="shouldShowField('urgencyLevel')">
                    <span class="security-level">紧急程度</span>
                    <span class="urgency-level">〔{{ form.urgencyLevel === 'routine' ? '普通' : form.urgencyLevel === 'emergency' ? '一般' : '加急' }}〕</span>
                </div>
            </div>

            <!-- 2. 信息表格 -->
            <div class="word-table">
                <div class="word-table-item-unit">
                    <div class="label-cell-unit">发文类型</div>
                    <div class="input-cell-unit">{{ DM_DOCUMENT_SENDING_TYPE[form.type] || '' }}</div>
                </div>
                <div class="word-table-item">
                    <div class="label-cell">发文字号</div>
                    <div class="input-cell">{{ form.wordSize || '' }}</div>
                </div>
                <div class="word-table-item">
                    <div class="label-cell">发文日期</div>
                    <div class="input-cell">{{ form.draftDate || '' }}</div>
                </div>
                <div class="word-table-item-unit">
                    <div class="label-cell-unit">主送单位</div>
                    <div class="input-cell-unit">{{ form.mainDeliveryAgency || '' }}</div>
                </div>
            </div>
            <div class="word-div" v-if="shouldShowField('text')">
                <div class="word-title-cell">内容</div>
                <div class="word-title-input" v-html="form.text || ''"></div>
            </div>

            <!-- 3. 标题 -->
            <div class="word-div">
                <div class="word-title-cell">标题</div>
                <div class="word-title-input1">{{ form.title || '' }}</div>
            </div>
            <div class="word-table1" v-if="shouldShowField('contactPerson') || shouldShowField('contactPhone')">
                <div class="word-table-item" v-if="shouldShowField('contactPerson')">
                    <div class="label-cell">联系人</div>
                    <div class="input-cell">{{ form.contactPerson || '' }}</div>
                </div>
                <div class="word-table-item" v-if="shouldShowField('contactPhone')">
                    <div class="label-cell">联系电话</div>
                    <div class="input-cell">{{ form.contactPhone || '' }}</div>
                </div>
            </div>
            <!-- 3. 印发日期 -->
            <div class="word-div-wrap">
                <div class="word-title-cell">印发日期</div>
                <div class="word-title-input2">{{ form.issuingDate || '' }}</div>
            </div>

            <!-- 4. 主任批示 -->
            <div class="word-div">
                <div class="word-title-cell">主任批示</div>

                <div class="word-div-handle">
                    <div class="word-title-input">
                        {{ directorRemark || '' }}
                    </div>
                    <div class="handler-info" v-if="directorHandler">
                        <span class="handler-time">处理人: {{ directorHandler }} 日期: {{ directorDate }} 时间: {{ directorTime }}</span>
                    </div>
                </div>
            </div>

            <!-- 5. 综合管理部经理意见 -->
            <div class="word-div">
                <div class="word-title-cell">综合管理部经理意见</div>
                <div class="word-div-handle">
                    <div class="word-title-input">{{ comprehensiveRemark || '' }}</div>
                    <div class="handler-info" v-if="comprehensiveHandler">
                        <span class="handler-time">处理人: {{ comprehensiveHandler }} 日期: {{ comprehensiveDate }} 时间: {{ comprehensiveTime }}</span>
                    </div>
                </div>
            </div>

            <!-- 6. 主办处室及意见表格 -->
            <div class="word-zhu">
                <div class="word-zhu-cell">主办处室:</div>
                <div class="word-zhu-input">{{ '综合管理部' }}</div>
            </div>
            <!-- 7. 主办处室意见表格 -->
            <div class="word-ban">
                <div class="word-ban-item1">
                    <div class="word-ban-cell">主办处室意见</div>
                    <div class="word-div-handle">
                        <div class="word-ban-input">{{ comprehensiveProcessRemark }}</div>
                        <div class="handler-info" v-if="comprehensiveProcessHandler">
                            <span class="handler-time">处理人: {{ comprehensiveProcessHandler }} 日期: {{ comprehensiveProcessDate }} 时间: {{ comprehensiveProcessTime }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 7. 备注 -->
            <div class="word-div">
                <div class="word-title-cell">备注</div>
                <div class="word-title-input">{{ form.documentRemark || '' }}</div>
            </div>
            <div class="word-fu" v-if="form.filePath">
                <div class="word-fu-cell">附件</div>
                <div class="attachment-list">
                    <div v-for="(filePath, index) in (form.filePath || '').split(',')" :key="index" class="attachment-item" v-if="filePath.trim()">
                        <span class="file-info">
                            <i class="el-icon-document"></i>
                            {{ getDisplayFileName(filePath) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="dialogVisible-wrap" v-else>
            <div slot="title" class="dialog-title">
                <span>金融监管总局天津监管局文件处理单</span>
            </div>

            <!-- 1. 公文头部：密级、缓急 -->
            <div class="doc-header">
                <!-- <div class="header-top">
                    <span class="security-level">密级</span>
                    <span class="urgency-level">〔非密〕</span>
                </div> -->
                <div class="header-top" v-if="shouldShowField('urgencyLevel')">
                    <span class="security-level">紧急程度</span>
                    <span class="urgency-level">〔{{ form.urgencyLevel === 'routine' ? '普通' : form.urgencyLevel === 'emergency' ? '一般' : '加急' }}〕</span>
                </div>
            </div>

            <!-- 2. 信息表格 -->
            <div class="word-table">
                <div class="word-table-item">
                    <div class="label-cell">局编号</div>
                    <div class="input-cell">{{ form.superiorDocNumber || '' }}</div>
                </div>
                <div class="word-table-item">
                    <div class="label-cell">来文字号</div>
                    <div class="input-cell">{{ form.incomingDocNumber || '' }}</div>
                </div>
                <div class="word-table-item">
                    <div class="label-cell">原文日期</div>
                    <div class="input-cell">{{ form.originalDocDate || '' }}</div>
                </div>
                <div class="word-table-item">
                    <div class="label-cell">收文日期</div>
                    <div class="input-cell">{{ form.receivedDate || '' }}</div>
                </div>
                <div class="word-table-item-unit">
                    <div class="label-cell-unit">来文单位</div>
                    <div class="input-cell-unit">{{ form.originatingUnit || '' }}</div>
                </div>
            </div>

            <!-- 3. 标题 -->
            <div class="word-div">
                <div class="word-title-cell">标题</div>
                <div class="word-title-input1">{{ form.title || '' }}</div>
            </div>

            <!-- 4. 主任批示 -->
            <div class="word-div">
                <div class="word-title-cell">主任批示</div>
                <div class="word-div-handle">
                    <div class="word-title-input">
                        {{ form.directorInstruction || '' }}
                    </div>
                    <div class="handler-info" v-if="form.directorHandler">
                        <span class="handler-time">处理人: {{ form.directorHandler }} 日期: {{ form.directorDate }} 时间: {{ form.directorTime }}</span>
                    </div>
                </div>
            </div>

            <!-- 5. 综合管理部经理意见 -->
            <div class="word-div">
                <div class="word-title-cell">综合管理部经理意见</div>
                <div class="word-div-handle">
                    <div class="word-title-input">{{ form.comprehensiveOpinion || '' }}</div>
                    <div class="handler-info" v-if="form.comprehensiveHandler">
                        <span class="handler-time">处理人: {{ form.comprehensiveHandler }} 日期: {{ form.comprehensiveDate }} 时间: {{ form.comprehensiveTime }}</span>
                    </div>
                </div>
            </div>

            <!-- 6. 主办处室及意见表格 -->
            <div class="word-zhu">
                <div class="word-zhu-cell">主办处室:</div>
                <div class="word-zhu-input">{{ '综合管理部' }}</div>
            </div>
            <!-- 7. 主办处室意见表格 -->
            <div class="word-ban">
                <div class="word-ban-item">
                    <div class="word-ban-cell">主办处室意见</div>
                    <div class="word-ban-input">{{ form.leadDeptOpinion || '' }}</div>
                </div>
                <div class="word-ban-item2">
                    <div class="word-ban-cell">其他部门</div>
                    <div class="record-list">
                        <div v-for="(record, index) in filteredProcessingRecords" :key="index" class="record-item">
                            <span class="record-text">{{ record.text }}</span>
                            <span class="record-info">处理人:{{ record.handler }}; {{ record.date }}:{{ record.time }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- <div class="word-time">
                <div class="word-time-item1">
                    <div class="word-time-cell">办公室协调情况</div>
                    <div class="word-time-input">{{ form.mainDept || '' }}</div>
                </div>
                <div class="word-time-item2">
                    <div class="word-time-cell">完成时限</div>
                    <div class="word-time-input">{{ form.deadline || '' }}</div>
                </div>
                <div class="word-time-item3">
                    <div class="word-time-cell">复印分送情况</div>
                    <div class="word-time-input">{{ form.copyDistribution || '' }}</div>
                </div>
            </div> -->

            <!-- 7. 备注 -->
            <div class="word-div">
                <div class="word-title-cell">备注</div>
                <div class="word-title-input">{{ form.remarks || '' }}</div>
            </div>
            <div class="word-fu" v-if="form.attachments">
                <div class="word-fu-cell">附件</div>
                <div class="attachment-list">
                    <div v-for="(filePath, index) in (form.attachments || '').split(',')" :key="index" class="attachment-item" v-if="filePath.trim()">
                        <span class="file-info">
                            <i class="el-icon-document"></i>
                            {{ getDisplayFileName(filePath) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div class="word-btn">
            <el-button>打印</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { DM_DOCUMENT_SENDING_TYPE } from '@/views/constant/CommonConstant.js';
export default {
    name: 'DocSignDialog',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ''
        },
        form: {
            type: Object,
            default: () => ({
                // 发文
                id: null,
                type: '',
                wordSize: '',
                draftDate: '',
                urgencyLevel: '',
                mainDeliveryAgency: '',
                partNumber: null,
                title: '',
                text: '',
                word: '',
                filePath: null,
                cc: '',
                issuer: '',
                issuingDate: '',
                internalCirculation: '',
                contactPerson: '',
                contactPhone: '',
                documentRemark: '',
                nextReviewer: [],
                deptDistribution: [],
                userIds: [],
                status: null,
                // 收文
                superiorDocNumber: '',
                incomingDocNumber: '',
                type: '',
                wordSize: '',
                originalDocDate: '',
                receivedDate: '',
                originatingUnit: '',
                title: '',
                text: '',
                attachments: '',
                directorInstruction: '',
                directorHandler: '',
                directorDate: '',
                directorTime: '',
                comprehensiveOpinion: '',
                comprehensiveHandler: '',
                comprehensiveDate: '',
                comprehensiveTime: '',
                nextReviewer: [],
                leadDeptOpinion: '',
                leadDeptHandler: '',
                leadDeptDate: '',
                leadDeptTime: '',
                deptDistribution: [],
                staffDistribution: [],
                managerAttachment: '', // 分发给部门经理的附件
                deptOpinion: '', // 部门经理处理意见
                processingRecords: [],
                readOpinion: '',
                completionTime: '',
                issuingAgency: '',
                creator: '', // 创建人
                remarks: '',
                directorStatus: '1',
                comprehensiveStatus: '1'
            })
        },
        directorRemark: null,
        comprehensiveRemark: null,
        comprehensiveProcessRemark: null,
        directorHandler: '',
        directorDate: '',
        directorTime: '',
        comprehensiveProcessHandler: '',
        comprehensiveProcessDate: '',
        comprehensiveProcessTime: '',
        comprehensiveHandler: '',
        comprehensiveDate: '',
        comprehensiveTime: ''
    },
    data() {
        return {
            DM_DOCUMENT_SENDING_TYPE: DM_DOCUMENT_SENDING_TYPE
        };
    },
    computed: {
        dialogVisible: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit('update:visible', val);
            }
        },
        visibleFields() {
            const typeMap = {
                6: {
                    // （发）津众和发
                    fields: [
                        'wordSize',
                        'draftDate',
                        'mainDeliveryAgency',
                        'title',
                        'text',
                        'word',
                        'cc',
                        'internalCirculation',
                        'partNumber',
                        'filePath',
                        'contactPerson',
                        'contactPhone',
                        'issuingDate'
                    ],
                    wordPrefix: '津众和发'
                },
                7: {
                    // （发）调解风险建议书
                    fields: ['wordSize', 'draftDate', 'title', 'text', 'word', 'mainDeliveryAgency', 'cc', 'internalCirculation', 'contactPerson', 'contactPhone', 'filePath', 'issuingDate'],
                    wordPrefix: '调解风险建议书'
                },
                8: {
                    // （发）津众和党发
                    fields: [
                        'wordSize',
                        'draftDate',
                        'urgencyLevel',
                        'mainDeliveryAgency',
                        'title',
                        'text',
                        'word',
                        'filePath',
                        'cc',
                        'internalCirculation',
                        'partNumber',
                        'contactPerson',
                        'contactPhone',
                        'issuingDate'
                    ],
                    wordPrefix: '津众和党发'
                },
                9: {
                    // （发）津众和函
                    fields: ['wordSize', 'draftDate', 'mainDeliveryAgency', 'title', 'text', 'word', 'filePath', 'internalCirculation', 'partNumber', 'contactPerson', 'contactPhone', 'issuingDate'],
                    wordPrefix: '津众和函'
                },
                10: {
                    // （发）津众和便函
                    fields: ['wordSize', 'draftDate', 'mainDeliveryAgency', 'title', 'text', 'word', 'filePath', 'contactPerson', 'contactPhone', 'issuingDate'],
                    wordPrefix: '津众和便函'
                },
                11: {
                    // （发）主任办公会议纪要
                    fields: ['wordSize', 'draftDate', 'title', 'text', 'word', 'filePath', 'issuingDate'],
                    wordPrefix: '主任办公会议纪要'
                }
            };
            return typeMap[this.form.type] || { fields: [], wordPrefix: '' };
        },
        shouldShowField() {
            return fieldName => {
                return this.visibleFields.fields.includes(fieldName);
            };
        },
        filteredProcessingRecords() {
            // 显示除了主任批示、综合管理部经理意见、综合管理部意见之外的所有记录
            return this.form.processingRecords.filter(record => {
                if (!record.text) return false;

                const text = record.text;
                // 排除这三种类型的记录
                const excludePatterns = ['主任岗审核通过', '综合部经理审核通过', '收文综合部文秘岗分发'];

                // 如果包含排除模式中的任何一个，则不显示
                return !excludePatterns.some(pattern => text.includes(pattern));
            });
        }
    },
    methods: {
        handleClose() {
            this.$emit('close');
        },
        getDisplayFileName(filePath) {
            if (!filePath) return '未知文件';
            const fileName = filePath.split('/').pop();
            const lastDotIndex = fileName.lastIndexOf('.');
            return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        }
    }
};
</script>

<style lang="scss" scoped>
.dialogVisible-wrap {
    padding: 0px 50px;
}
/* ========== 对话框标题样式 ========== */
.dialog-title {
    font-size: 30px;
    text-align: center;
    letter-spacing: 4px;
    color: red;
}
// 绝密
.doc-header {
    padding: 5px;
    display: flex;
    justify-content: space-between;
}
.header-top {
    display: flex;
}
.security-level {
    color: red;
}

//
.word-table {
    width: 100%;
    border: 1px solid #000;
    margin-bottom: 0;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    border-left: none;
    border-right: none;
}
.word-table1 {
    width: 100%;
    border: 1px solid #000;
    margin-bottom: 0;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    border-left: none;
    border-right: none;
    border-top: none;
}
.word-table-item {
    display: flex;
    width: 50%;
    height: 40px;
}
.word-table-item-unit {
    display: flex;
    width: 100%;
    height: 40px;
}

.label-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    width: 80px;
    padding: 5px 0;
}
.label-cell-unit {
    color: red;
    white-space: nowrap;
    text-align: left;
    width: 80px;
    padding: 5px 0;
}
.input-cell {
    white-space: nowrap;
    text-align: left;
    padding: 5px 0;
    flex: 1;
}
.input-cell-unit {
    white-space: nowrap;
    text-align: left;
    padding: 5px 0;
    flex: 1;
}
.word-div {
    padding: 5px 0;
    border-bottom: 1px solid #000;
}
.word-div-wrap {
    padding: 5px 0;
    border-bottom: 1px solid #000;
    display: flex;
    align-items: center;
    gap: 5px;
}
.word-div-handle {
    display: flex;
    justify-content: space-between;
}
.word-title-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
}
.word-title-input {
    white-space: nowrap;
    text-align: left;
    min-height: 60px;
}
.word-title-input1 {
    white-space: nowrap;
    text-align: left;
    min-height: 40px;
}
.word-title-input2 {
    white-space: nowrap;
    text-align: left;
}
.word-zhu {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #000;
}
.word-zhu-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
}
.word-zhu-input {
    white-space: nowrap;
    text-align: left;
}

.word-ban {
    display: flex;
    border-bottom: 1px solid #000;
}

.word-ban-item1 {
    display: flex;
    width: 100%;
    flex-direction: column;
}
.word-ban-item {
    display: flex;
    width: 50%;
    border-right: 1px dashed #ccc;
    flex-direction: column;
}
.word-ban-item2 {
    display: flex;
    width: 50%;
    flex-direction: column;
}
.word-ban-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
    padding: 5px 0;
    border-bottom: 1px dashed #ccc;
}
.word-ban-item .word-ban-cell {
    padding: 5px;
}
.word-ban-input {
    text-align: left;
    min-height: 80px;
    padding: 5px 0;
    flex-wrap: wrap;
    display: flex;
    word-break: break-word;
}
.word-ban-item .word-ban-input {
    padding: 5px;
}
.word-fu {
    margin-top: 5px;
    display: flex;
    flex-direction: column;
}
.word-fu-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
}
.word-fu-input {
    white-space: nowrap;
    text-align: left;
    min-height: 30px;
}
.word-btn {
    margin-top: 10px;
    padding: 0px 50px;
    display: flex;
    justify-content: flex-end;
}
.record-text {
    margin-right: 10px;
}

.word-time {
    display: flex;
    border-bottom: 1px solid #000;
}
.word-time-item1 {
    flex: 1;
    display: flex;
    padding: 5px 0;
    gap: 5px;
    border-right: 1px solid #000;
}
.word-time-item2 {
    flex: 1;
    display: flex;
    padding: 5px 5px 0 5px;
    gap: 5px;
    border-right: 1px solid #000;
}
.word-time-item3 {
    flex: 1;
    display: flex;
    padding: 5px 5px 0 5px;
    gap: 5px;
}
.word-time-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    font-weight: bold;
}
.word-time-input {
    text-align: left;
}

/* ========== 签名信息 ========== */
.signature-info {
    text-align: right;
    margin-top: 10px;
    font-size: 12px;
    color: #333;

    .sign-name {
        font-weight: bold;
        margin-right: 20px;
    }
    .sign-date {
        color: #666;
    }
}

::v-deep .doc-sign-dialog {
    .el-dialog {
        border-radius: 4px;
    }
}
</style>
