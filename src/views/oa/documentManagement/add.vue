<template>
    <div class="app-container">
        <div class="document-form-container">
            <!-- 页面标题 -->
            <div class="page-title">
                <h2>天津众和发文处理单</h2>
            </div>

            <!-- 发文处理表单 - Word表格样式 -->
            <el-form ref="documentForm" :model="form" :rules="rules" class="document-form">
                <!-- 发文类型选择表格 -->
                <table class="word-table">
                    <tr>
                        <td class="label-cell">发文类型</td>
                        <td class="input-cell" colspan="3">
                            <el-select v-model="form.type" placeholder="请选择发文类型" :disabled="isReadOnly" class="table-select" @change="handleTypeChange">
                                <el-option v-for="dict in dict.type.document_sending_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                            </el-select>
                        </td>
                    </tr>
                </table>

                <!-- 动态字段区域 -->
                <template v-if="form.type && visibleFields.fields.length > 0">
                    <!-- 基本信息表格 -->
                    <table class="word-table">
                        <tr v-if="shouldShowField('wordSize')">
                            <td class="label-cell">发文字号</td>
                            <td class="input-cell">
                                <el-input v-model="form.wordSize" placeholder="保存后由系统自动生成" :disabled="true" class="table-input"></el-input>
                            </td>
                            <td class="label-cell" v-if="shouldShowField('draftDate')">发文日期</td>
                            <td class="input-cell" v-if="shouldShowField('draftDate')">
                                <el-date-picker
                                    v-model="form.draftDate"
                                    type="date"
                                    placeholder="选择发文日期"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    :disabled="isReadOnly"
                                    class="table-date-picker"
                                ></el-date-picker>
                            </td>
                        </tr>
                        <tr v-if="shouldShowField('urgencyLevel')">
                            <td class="label-cell">紧急程度</td>
                            <td class="input-cell" colspan="3">
                                <el-select v-model="form.urgencyLevel" placeholder="选择紧急程度" :disabled="isReadOnly" class="table-select">
                                    <el-option v-for="dict in dict.type.official_urgency_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                                </el-select>
                            </td>
                        </tr>
                    </table>

                    <!-- 主送单位表格 -->
                    <table class="word-table" v-if="shouldShowField('mainDeliveryAgency')">
                        <tr>
                            <td class="label-cell">主送单位</td>
                            <td class="input-cell" colspan="3">
                                <el-input v-model="form.mainDeliveryAgency" placeholder="请输入主送单位" :disabled="isReadOnly" class="table-input"></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    v-if="!isReadOnly"
                                    :isShowSave="false"
                                    :onSelect="phrase => handleSelectPhrase('mainDeliveryAgency', phrase)"
                                    :inputContent="form.mainDeliveryAgency"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                            </td>
                        </tr>
                    </table>

                    <!-- 标题和内容表格 -->
                    <table class="word-table">
                        <tr v-if="shouldShowField('title')">
                            <td class="label-cell">标题</td>
                            <td class="input-cell" colspan="3">
                                <el-input v-model="form.title" placeholder="请输入标题" maxlength="200" show-word-limit :disabled="isReadOnly" class="table-input"></el-input>
                            </td>
                        </tr>
                        <tr v-if="shouldShowField('text')">
                            <td class="label-cell">内容</td>
                            <td class="input-cell" colspan="3">
                                <!-- <el-input
                                    v-model="form.text"
                                    type="textarea"
                                    :rows="5"
                                    placeholder="请输入内容"
                                    maxlength="2000"
                                    show-word-limit
                                    :disabled="isReadOnly"
                                    class="table-textarea"
                                ></el-input> -->
                                <RichEditor v-model="form.text" :disabled="isReadOnly" />
                                <!-- 浏览套头文件按钮，当有公文ID时显示 -->
                                <div class="content-actions" v-if="form.id">
                                    <el-button type="info" size="small" @click="previewRedHeaderDoc">
                                        <i class="el-icon-document"></i>
                                        浏览套头文件
                                    </el-button>
                                </div>
                            </td>
                        </tr>
                    </table>
                    <!-- 附件表格 -->
                    <table class="word-table" v-if="shouldShowField('filePath')">
                        <tr>
                            <td class="label-cell">附件</td>
                            <td class="input-cell" colspan="3">
                                <FileUpload v-if="!isReadOnly" v-model="form.filePath" style="margin: 5px 10px" @upload-success="handleFileChange" />
                                <div v-else-if="form.filePath" class="attachment-list">
                                    <div v-for="(filePath, index) in form.filePath.split(',')" :key="index" class="attachment-item" v-if="filePath.trim()">
                                        <span class="file-info" @click="previewFileOnline({ name: getFileName(filePath) })">
                                            <i class="el-icon-document"></i>
                                            {{ getDisplayFileName(filePath) }}
                                        </span>
                                        <div class="attachment-actions">
                                            <el-button type="primary" size="mini" @click="downloadFile({ url: filePath, name: getFileName(filePath) })">下载</el-button>
                                            <el-button type="primary" size="mini" @click="previewFile({ url: filePath, name: getFileName(filePath) })">预览</el-button>
                                        </div>
                                    </div>
                                </div>
                                <div v-else style="display: flex; align-items: center; justify-content: center">
                                    <span style="color: #c0c4cc">无附件</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- 抄送和内部发送表格 -->
                    <table class="word-table" v-if="shouldShowField('cc') || shouldShowField('internalCirculation')">
                        <tr>
                            <td class="label-cell" v-if="shouldShowField('cc')">抄送</td>
                            <td class="input-cell" v-if="shouldShowField('cc')">
                                <el-input v-model="form.cc" placeholder="请输入抄送单位" :disabled="isReadOnly" class="table-input"></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    :isShowSave="false"
                                    v-if="!isReadOnly"
                                    :onSelect="phrase => handleSelectPhrase('cc', phrase)"
                                    :inputContent="form.cc"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                            </td>
                            <td class="label-cell" v-if="shouldShowField('internalCirculation')">内部发送</td>
                            <td class="input-cell" v-if="shouldShowField('internalCirculation')">
                                <el-input v-model="form.internalCirculation" placeholder="请输入内部发送" :disabled="isReadOnly" class="table-input"></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    :isShowSave="false"
                                    v-if="!isReadOnly"
                                    :onSelect="phrase => handleSelectPhrase('internalCirculation', phrase)"
                                    :inputContent="form.internalCirculation"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                            </td>
                        </tr>
                    </table>

                    <!-- 联系人和联系电话表格 -->
                    <table class="word-table" v-if="shouldShowField('contactPerson') || shouldShowField('contactPhone')">
                        <tr>
                            <td class="label-cell" v-if="shouldShowField('contactPerson')">联系人</td>
                            <td class="input-cell" v-if="shouldShowField('contactPerson')">
                                <el-input v-model="form.contactPerson" placeholder="请输入联系人" :disabled="isReadOnly" class="table-input"></el-input>
                            </td>
                            <td class="label-cell" v-if="shouldShowField('contactPhone')">联系电话</td>
                            <td class="input-cell" v-if="shouldShowField('contactPhone')">
                                <el-input v-model="form.contactPhone" placeholder="请输入联系电话" :disabled="isReadOnly" class="table-input"></el-input>
                            </td>
                        </tr>
                    </table>

                    <!-- 套头模板表格 - 已隐藏，通过发文类型自动设置 -->
                </template>

                <!-- 打印份数和印发日期表格 -->
                <table class="word-table" v-if="shouldShowField('partNumber') || shouldShowField('issuingDate')">
                    <tr>
                        <td class="label-cell" v-if="shouldShowField('partNumber')">打印份数</td>
                        <td class="input-cell" v-if="shouldShowField('partNumber')">
                            <div class="part-number-wrapper">
                                <el-input
                                    v-model="form.partNumber"
                                    placeholder="请输入打印份数"
                                    :disabled="isReadOnly"
                                    class="table-input"
                                    @input="handlePartNumberInput"
                                    @keydown="handlePartNumberKeydown"
                                ></el-input>
                                <div class="part-number-controls">
                                    <button type="button" class="part-number-btn part-number-decrease" @click="decreasePartNumber" :disabled="isReadOnly || form.partNumber <= 1">-</button>
                                    <button type="button" class="part-number-btn part-number-increase" @click="increasePartNumber" :disabled="isReadOnly || form.partNumber >= 999">+</button>
                                </div>
                            </div>
                        </td>
                        <td class="label-cell" v-if="shouldShowField('issuingDate')">印发日期</td>
                        <td class="input-cell" v-if="shouldShowField('issuingDate')">
                            <el-date-picker
                                v-model="form.issuingDate"
                                type="date"
                                placeholder="选择印发日期"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :disabled="isReadOnly"
                                class="table-date-picker"
                            ></el-date-picker>
                        </td>
                    </tr>
                </table>

                <!-- 未选择发文类型时的提示 -->
                <!-- <div v-else class="type-select-tip">
          <el-alert
            title="请先选择发文类型"
            type="info"
            description="选择发文类型后将显示相应的表单字段"
            show-icon
            :closable="false">
          </el-alert>
        </div> -->

                <!-- 审批意见表格 -->
                <table class="word-table">
                    <tr>
                        <td class="label-cell">主任批示</td>
                        <td class="input-cell" colspan="3">
                            <div class="approval-section">
                                <!-- <el-radio-group v-model="directorStatus" v-if="editStatus === 3 && false">
                  <el-radio label="1">通过</el-radio>
                  <el-radio label="2">退回</el-radio>
                </el-radio-group> -->
                                <el-input v-model="directorRemark" type="textarea" :rows="3" placeholder="填写意见" :disabled="editStatus !== 3" class="table-textarea"></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    v-if="editStatus === 3"
                                    :onSelect="phrase => handleSelectPhrase('directorRemark', phrase)"
                                    :inputContent="directorRemark"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                                <div class="handler-info" v-if="directorHandler">
                                    <span class="handler-time">处理人: {{ directorHandler }} 日期: {{ directorDate }} 时间: {{ directorTime }}</span>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td class="label-cell">
                            综合管理部
                            <br />
                            经理意见
                        </td>
                        <td class="input-cell" colspan="3">
                            <div class="approval-section">
                                <!-- <el-radio-group v-model="comprehensiveStatus" v-if="editStatus === 2">
              <el-radio label="1">通过</el-radio>
              <el-radio label="2">退回</el-radio>
            </el-radio-group> -->
                                <el-input v-model="comprehensiveRemark" type="textarea" :rows="3" placeholder="填写审批意见" :disabled="editStatus !== 2" class="table-textarea"></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    v-if="editStatus === 2"
                                    :onSelect="phrase => handleSelectPhrase('comprehensiveRemark', phrase)"
                                    :inputContent="comprehensiveRemark"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                                <div class="handler-info" v-if="comprehensiveHandler">
                                    <span class="handler-time">处理人: {{ comprehensiveHandler }} 日期: {{ comprehensiveDate }} 时间: {{ comprehensiveTime }}</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="label-cell">部门经理意见</td>
                        <td class="input-cell" colspan="3">
                            <div class="approval-section">
                                <!-- <el-radio-group v-model="managerStatus" v-if="editStatus === 1">
                  <el-radio label="1">通过</el-radio>
                  <el-radio label="2">退回</el-radio>
                </el-radio-group> -->
                                <el-input v-model="managerRemark" type="textarea" :rows="3" placeholder="填写意见" :disabled="editStatus !== 1" class="table-textarea"></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    v-if="editStatus === 1"
                                    :onSelect="phrase => handleSelectPhrase('managerRemark', phrase)"
                                    :inputContent="managerRemark"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                                <div class="handler-info" v-if="managerHandler">
                                    <span class="handler-time">处理人: {{ managerHandler }} 日期: {{ managerDate }} 时间: {{ managerTime }}</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="label-cell">综合管理部处理</td>
                        <td class="input-cell" colspan="3">
                            <div class="approval-section">
                                <el-input
                                    v-model="comprehensiveProcessRemark"
                                    type="textarea"
                                    :rows="3"
                                    placeholder="填写综合管理部处理意见"
                                    :disabled="editStatus !== 4"
                                    class="table-textarea"
                                ></el-input>
                                <quick-reply
                                    style="margin: 5px 10px"
                                    v-if="editStatus === 4"
                                    :onSelect="phrase => handleSelectPhrase('comprehensiveProcessRemark', phrase)"
                                    :inputContent="comprehensiveProcessRemark"
                                    :superviseId="$route.query.id"
                                    :buttonWidth="'90px'"
                                    :buttonHeight="'30px'"
                                    @collected="handleCollected"
                                />
                                <div class="handler-info" v-if="comprehensiveProcessHandler">
                                    <span class="handler-time">处理人: {{ comprehensiveProcessHandler }} 日期: {{ comprehensiveProcessDate }} 时间: {{ comprehensiveProcessTime }}</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="label-cell">备注</td>
                        <td class="input-cell" colspan="3">
                            <el-input
                                v-model="form.documentRemark"
                                type="textarea"
                                :rows="2"
                                placeholder="输入备注"
                                :disabled="editStatus !== null && ![1, 2, 3, 4, 7].includes(editStatus)"
                                class="table-textarea"
                            ></el-input>
                        </td>
                    </tr>
                </table>

                <!-- 部门分发表格 (editStatus=4 主任分发) -->
                <!-- <table class="word-table" v-if="editStatus === 4">
          <tr>
            <td class="label-cell">部门分发</td>
            <td class="input-cell" colspan="3">
              <div class="approval-section">
                <el-select v-model="form.deptDistribution" multiple placeholder="请选择部门经理分发" style="width: 100%;"
                  class="table-select">
                  <el-option v-for="item in departmentManagers" :key="item.id" :label="item.label" :value="item.id">
                  </el-option>
                </el-select>
              </div>
            </td>
          </tr>
        </table> -->

                <!-- 部门人员分发表格 (editStatus=5 部门经理分发) -->
                <!-- <table class="word-table" v-if="editStatus === 5">
          <tr>
            <td class="label-cell">部门人员分发</td>
            <td class="input-cell" colspan="3">
              <div class="approval-section">
                <el-select v-model="form.userIds" multiple placeholder="请选择分发人员" style="width: 100%;"
                  class="table-select">
                  <el-option v-for="item in currentDeptUsers" :key="item.userId" :label="item.nickName"
                    :value="item.userId">
                  </el-option>
                </el-select>
              </div>
            </td>
          </tr>
        </table> -->
            </el-form>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
            <el-button type="primary" :disabled="editStatus === null" @click="openDocSignDialog">打印</el-button>
            <el-button type="primary" :disabled="!canClickNextHandler" @click="openNextHandlerDialog">下一处理人</el-button>
            <el-button type="success" :disabled="!canClickApprove" @click="handleApprove">通过</el-button>
            <el-button type="danger" :disabled="!canClickReject" @click="handleReject">退回</el-button>
            <el-button type="success" :disabled="!canClickComplete" @click="handleComplete">办结</el-button>
            <el-button type="primary" :disabled="!canClickSubmit" @click="handleSubmitAction">{{ getSubmitButtonText }}</el-button>
            <el-button v-if="canClickConfirmRead" type="info" @click="handleConfirmRead">已阅</el-button>
            <el-button @click="handleExit">退出</el-button>
        </div>

        <!-- 分隔线 -->
        <el-divider></el-divider>

        <!-- 处理流程 -->
        <div class="process-flow-section">
            <h4 style="text-align: left">处理流程</h4>
            <el-table :data="processFlowList" style="width: 100%" border>
                <el-table-column prop="no" label="序号" width="80" align="center"></el-table-column>
                <el-table-column prop="record" label="处理记录" min-width="200"></el-table-column>
                <el-table-column prop="notApprovedUserNames" label="处理状态" width="80"></el-table-column>
                <el-table-column prop="handler" label="处理人" width="120" align="center"></el-table-column>
                <el-table-column prop="time" label="处理时间" width="180" align="center"></el-table-column>
            </el-table>
        </div>

        <ViewFile ref="viewFileRef" />

        <!-- 下一处理人弹窗 -->
        <el-dialog title="选择下一处理人" :visible.sync="showNextHandlerDialog" width="600px" :close-on-click-modal="false">
            <el-form>
                <el-form-item label="下一处理人" required>
                    <el-cascader
                        v-model="selectedNextReviewer"
                        :options="deptUserTreeOptions"
                        :props="deptUserProps"
                        :placeholder="getPlaceholderText()"
                        clearable
                        multiple
                        checkStrictly="false"
                        @change="handleNextReviewerChange"
                        style="width: 100%; border: 1px solid #ccc; border-radius: 5px"
                    ></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showNextHandlerDialog = false">取 消</el-button>
                <el-button type="primary" @click="handleNextHandlerConfirm">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 文签弹窗 -->
        <doc-sign-dialog
            :visible.sync="dialogVisible"
            :form="form"
            :director-remark="directorRemark"
            :comprehensive-remark="comprehensiveRemark"
            :comprehensive-process-remark="comprehensiveProcessRemark"
            :director-handler="directorHandler"
            :director-date="directorDate"
            :director-time="directorTime"
            :comprehensive-process-handler="comprehensiveProcessHandler"
            :comprehensive-process-date="comprehensiveProcessDate"
            :comprehensive-process-time="comprehensiveProcessTime"
            :comprehensive-handler="comprehensiveHandler"
            :comprehensive-date="comprehensiveDate"
            :comprehensive-time="comprehensiveTime"
            @close="handleClose"
            type="发文"
        />
    </div>
</template>

<script>
import FileUpload from '@/components/FileUpload';
import ViewFile from '@/components/viewFile';
import QuickReply from '@/components/quickReply/index.vue';
import RichEditor from '../components/RichEditor.vue';
import DocSignDialog from '../components/DocSignDialog.vue';
import conf from '@/conf.js';
import {
    addDocument,
    documentImageSave,
    documentLeaderCheck,
    documentComprehensiveCheck,
    documentDirectorCheck,
    departmentalDistribution,
    documentDirectorHair,
    readingConfirmation,
    submitDraft,
    getDocumentImageList
} from '@/api/oa/documentManagement';
import { dispatchAllDetails } from '@/api/oa/documentReceive';
import { getDirectorList, getDeptUserTree, getDocumentDict } from '@/api/oa/publicApi';
import { getDeptLeaderUserTreeList, getPreviewRedHeaderDoc } from '@/api/oa/document';
import { mapGetters } from 'vuex';
import { getToken } from '@/utils/auth';

export default {
    name: 'DocumentAdd',
    components: { FileUpload, ViewFile, QuickReply, RichEditor, DocSignDialog },
    dicts: ['document_sending_type', 'official_urgency_level'],
    data() {
        const validateNextApprover = (rule, value, callback) => {
            // 新增模式且用户有权限时需要选择审核人
            if (this.editStatus === null && this.showNextApprover && (!value || value.length === 0)) {
                return callback(new Error('请选择下一审核人'));
            }
            // 部门经理审批通过时需要选择下一审核人
            if (this.editStatus === 1 && this.managerStatus === '1' && (!value || value.length === 0)) {
                return callback(new Error('请选择下一审核人'));
            }
            // 综合管理部审批通过时需要选择下一审核人
            if (this.editStatus === 2 && this.comprehensiveStatus === '1' && (!value || value.length === 0)) {
                return callback(new Error('请选择下一审核人'));
            }
            return callback();
        };
        return {
            dialogVisible: false,
            editStatus: null,
            needsWrittenDate: false,
            nextApproverUsers: [],
            lockedReviewerId: null,
            lockedDeptId: null, // 锁定的默认部门ID
            showNextApprover: false, // 使用数据属性替代计算属性
            departmentManagers: [],
            currentDeptUsers: [],
            userPermissions: {
                canDepartmentReadConfirm: false
            },
            form: {
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
                status: null
            },
            documentTemplates: [], // 套头模板列表
            // 流程处理相关数据
            managerStatus: '1',
            managerRemark: '',
            managerHandler: '',
            managerDate: '',
            managerTime: '',
            comprehensiveStatus: '1',
            comprehensiveRemark: '',
            comprehensiveHandler: '',
            comprehensiveDate: '',
            comprehensiveTime: '',
            directorStatus: '1',
            directorRemark: '',
            directorHandler: '',
            directorDate: '',
            directorTime: '',
            // 综合管理部处理意见相关数据
            comprehensiveProcessRemark: '',
            comprehensiveProcessHandler: '',
            comprehensiveProcessDate: '',
            comprehensiveProcessTime: '',
            distributionUserIds: [],

            rules: {
                type: [{ required: true, message: '请选择发文类型', trigger: 'change' }],
                title: [{ validator: (rule, value, callback) => this.validateRequiredField('title', value, callback, '请输入标题'), trigger: 'blur' }],
                text: [{ validator: (rule, value, callback) => this.validateRequiredField('text', value, callback, '请输入内容'), trigger: 'blur' }],
                mainDeliveryAgency: [{ validator: (rule, value, callback) => this.validateRequiredField('mainDeliveryAgency', value, callback, '请输入主送单位'), trigger: 'blur' }],
                contactPerson: [{ validator: (rule, value, callback) => this.validateRequiredField('contactPerson', value, callback, '请输入联系人'), trigger: 'blur' }],
                contactPhone: [{ validator: (rule, value, callback) => this.validateRequiredField('contactPhone', value, callback, '请输入联系电话'), trigger: 'blur' }],
                urgencyLevel: [{ validator: (rule, value, callback) => this.validateRequiredField('urgencyLevel', value, callback, '请选择紧急程度'), trigger: 'change' }],
                partNumber: [{ validator: (rule, value, callback) => this.validateRequiredField('partNumber', value, callback, '请输入打印份数'), trigger: 'change' }],
                issuingDate: [{ required: true, message: '请选择印发日期', trigger: 'change' }],
                nextReviewer: [{ validator: validateNextApprover, trigger: 'change' }],
                deptDistribution: [{ required: true, message: '请选择部门分发', trigger: 'change' }],
                userIds: [{ required: true, message: '请选择分发人员', trigger: 'change' }],
                comprehensiveProcessRemark: [
                    { validator: (rule, value, callback) => this.validateRequiredField('comprehensiveProcessRemark', value, callback, '请填写综合管理部处理意见'), trigger: 'blur' }
                ]
            },
            processFlowList: [],
            showNextHandlerDialog: false,
            selectedNextReviewer: [],
            deptUserTreeOptions: [],
            deptUserProps: {
                value: 'id',
                label: 'label',
                children: 'children',
                checkStrictly: false, // 改为 false，允许父节点全选子节点
                emitPath: true,
                multiple: true,
                disabled: 'disabled',
                leaf: 'isUser'
            },
            // 当前状态下的选择限制
            currentSelectionLimit: 1,
            // 锁定的用户ID（不可删除）
            lockedUserId: null,

            uploadFiles: [],
            getUploadFiles: []
        };
    },
    computed: {
        ...mapGetters(['permissions', 'userInfo']),
        isReadOnly() {
            return this.editStatus !== null && this.editStatus !== 7;
        },
        // 根据发文类型获取需要显示的字段
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
        // 检查字段是否应该显示
        shouldShowField() {
            return fieldName => {
                return this.visibleFields.fields.includes(fieldName);
            };
        },
        // 按钮状态控制
        canClickNextHandler() {
            // 新建时可点击，或者有权限且状态为1,2时可点击，或修改重新提交时可点击
            const hasPermission = this.permissions && this.permissions.includes('document:leader:user');
            return (this.editStatus === null && hasPermission) || ([1, 2].includes(this.editStatus) && hasPermission) || this.editStatus === 7;
        },
        canClickApprove() {
            // 状态1,2,3时可点击通过
            return [1, 2, 3].includes(this.editStatus);
        },
        canClickReject() {
            // 状态1,2,3时可点击退回
            return [1, 2, 3].includes(this.editStatus);
        },
        canClickComplete() {
            // 状态4时可点击办结
            return this.editStatus === 4;
        },
        canClickSubmit() {
            // 新建时可点击提交；修改重新提交时可点击提交；状态5时可点击提交
            // 状态1,2,3时使用通过/退回按钮，不显示提交/提交按钮
            return this.editStatus === null || this.editStatus === 7 || this.editStatus === 5;
        },
        canClickConfirmRead() {
            // 状态6时可点击已阅
            return this.editStatus === 6;
        },
        getSubmitButtonText() {
            if (this.editStatus === null) {
                return '提交';
            } else if (this.editStatus === 7) {
                return '修改并重新提交';
            } else if ([3, 5].includes(this.editStatus)) {
                return '提交';
            }
            return '提交';
        }
    },
    watch: {
        permissions() {
            this.updateApproverFieldVisibility();
        },
        'form.nextReviewer'(newValue, oldValue) {
            // 同步更新弹窗中的选择器 - 转换为级联选择器需要的路径格式
            this.selectedNextReviewer = this.convertToCascaderValue(newValue);
        }
    },
    created() {
        const id = this.$route.query.id;
        this.getDepartmentManagers();
        this.getDocumentTemplates();
        this.getDeptUserTree();
        if (id) {
            this.getDetails(id);
        } else {
            this.editStatus = null; // 新增模式
            this.updateApproverFieldVisibility();
        }
    },
    methods: {
        // 上传文件列表
        handleFileChange(files) {
            this.uploadFiles = files;
        },
        //文签弹框
        handleClose() {
            this.dialogVisible = false;
        },
        openDocSignDialog() {
            this.dialogVisible = true;
        },
        // 处理发文类型变化
        handleTypeChange(typeValue, forceUpdate = true) {
            if (!typeValue) {
                if (forceUpdate) {
                    this.form.word = '';
                }
                return;
            }

            // 根据发文类型的label匹配套头模板
            const selectedType = this.dict.type.document_sending_type.find(item => item.value === typeValue);
            if (selectedType && this.documentTemplates && this.documentTemplates.length > 0) {
                // 去除"（发）"前缀进行匹配
                const cleanLabel = selectedType.label.replace(/^（发）\s*/, '');

                // 模糊匹配：查找包含cleanLabel的套头模板
                const matchedTemplate = this.documentTemplates.find(template => template.dictLabel && template.dictLabel.includes(cleanLabel));

                if (matchedTemplate && forceUpdate) {
                    this.form.word = matchedTemplate.dictValue;
                    console.log(`发文类型 "${selectedType.label}" 去除前缀后为 "${cleanLabel}" 模糊匹配到套头模板: "${matchedTemplate.dictLabel}" -> ${matchedTemplate.dictValue}`);
                } else if (!matchedTemplate && forceUpdate) {
                    this.form.word = '';
                    console.log(`发文类型 "${selectedType.label}" 去除前缀后为 "${cleanLabel}" 未找到匹配的套头模板`);
                }
            }
        },
        updateApproverFieldVisibility() {
            const wasVisible = this.showNextApprover;
            const hasPermission = this.permissions && this.permissions.includes('document:leader:user');
            this.showNextApprover = this.editStatus === null && hasPermission;

            // 如果字段刚刚变为可见，则加载审批人数据
            if ((this.showNextApprover && !wasVisible) || this.editStatus === 2) {
                this.loadNextApprovers();
            }
        },
        getDetails(id) {
            dispatchAllDetails({ id }).then(response => {
                const { document, documentProcessList, sendEdit } = response.data;
                // 获取附件列表
                getDocumentImageList({ documentId: id }).then(res => {
                    this.getUploadFiles = res.data || [];
                });

                this.form = document;
                this.editStatus = sendEdit;

                // 调试信息：打印editStatus值
                console.log('当前editStatus:', this.editStatus);

                // 确保type字段转换为字符串
                this.form.type = document.type !== null && document.type !== undefined ? String(document.type) : '';

                // 处理日期字段格式，确保包含时间部分
                if (this.form.draftDate && !this.form.draftDate.includes(' ')) {
                    this.form.draftDate = this.form.draftDate + ' 00:00:00';
                }
                if (this.form.issuingDate && !this.form.issuingDate.includes(' ')) {
                    this.form.issuingDate = this.form.issuingDate + ' 00:00:00';
                }

                // 附件处理保持为字符串格式，与收文add页面一致

                // 处理流程和审批意见反显
                if (documentProcessList && documentProcessList.length > 0) {
                    // 生成处理流程列表
                    this.processFlowList = documentProcessList.map((p, index) => ({
                        no: index + 1,
                        record: p.returnRemark,
                        handler: p.nickName || '未知',
                        time: p.processTime,
                        notApprovedUserNames: p.notApprovedUserNames ? '未处理' : '已处理'
                    }));

                    console.log('processFlowList', this.processFlowList);

                    // 反显审批意见（仅反显意见内容和处理人信息，不反显通过/退回状态）
                    documentProcessList.forEach(p => {
                        if (p.returnRemark === '部门经理审核通过') {
                            this.managerRemark = p.remark || '';
                            this.managerHandler = p.nickName || '未知';
                            this.managerDate = p.createTime ? p.createTime.split(' ')[0] : '';
                            this.managerTime = p.createTime ? p.createTime.split(' ')[1] : '';
                        } else if (p.returnRemark && p.returnRemark.includes('综合部审核通过')) {
                            this.comprehensiveRemark = p.remark || '';
                            this.comprehensiveHandler = p.nickName || '未知';
                            this.comprehensiveDate = p.createTime ? p.createTime.split(' ')[0] : '';
                            this.comprehensiveTime = p.createTime ? p.createTime.split(' ')[1] : '';
                        } else if (p.returnRemark && p.returnRemark.includes('主任审核通过')) {
                            this.directorRemark = p.remark || '';
                            this.directorHandler = p.nickName || '未知';
                            this.directorDate = p.createTime ? p.createTime.split(' ')[0] : '';
                            this.directorTime = p.createTime ? p.createTime.split(' ')[1] : '';
                        } else if (p.returnRemark && p.returnRemark.includes('综合部经理发文办结')) {
                            this.comprehensiveProcessRemark = p.remark || '';
                            this.comprehensiveProcessHandler = p.nickName || '未知';
                            this.comprehensiveProcessDate = p.createTime ? p.createTime.split(' ')[0] : '';
                            this.comprehensiveProcessTime = p.createTime ? p.createTime.split(' ')[1] : '';
                        }
                    });
                } else {
                    this.processFlowList = [];
                }

                if (this.editStatus === 1 || this.editStatus === 2 || this.editStatus === 3 || this.editStatus === 7) {
                    this.loadNextApprovers();
                }
                if (this.editStatus === 5) {
                    console.log('editStatus为5，准备调用getCurrentDeptUsers');
                    this.getCurrentDeptUsers();
                }
                if (this.editStatus === 6) {
                    this.fetchUserPermissions();
                }
            });
        },
        getDepartmentManagers() {
            getDeptLeaderUserTreeList().then(res => {
                const managers = [];
                const traverse = dept => {
                    // 只添加有用户列表（部门经理）的部门
                    if (dept.deptId && dept.deptName && dept.userList && dept.userList.length > 0) {
                        dept.userList.forEach(user => {
                            if (user.userId) {
                                managers.push({
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
                if (res.data && Array.isArray(res.data)) {
                    res.data.forEach(dept => traverse(dept));
                }
                this.departmentManagers = managers;

                // 按部门名称和用户名排序，确保与documentDialog.vue的filteredUsers一致
                this.departmentManagers.sort((a, b) => {
                    const deptA = a.label.split(' / ')[0];
                    const deptB = b.label.split(' / ')[0];
                    const nameA = a.label.split(' / ')[1];
                    const nameB = b.label.split(' / ')[1];

                    if (deptA !== deptB) {
                        return deptA.localeCompare(deptB);
                    }
                    return nameA.localeCompare(nameB);
                });
            });
        },
        loadNextApprovers() {
            getDirectorList().then(res => {
                this.nextApproverUsers = res.data;

                let defaultUsername = '';
                if (this.editStatus === null && this.showNextApprover) {
                    // 新增模式：默认选择zhwm1
                    defaultUsername = 'zhwm1';
                } else if (this.editStatus === 1) {
                    // 部门经理审批：默认选择zhwm1
                    defaultUsername = 'zhwm1';
                } else if (this.editStatus === 2) {
                    // 综合管理部审批：默认选择zxzr1
                    defaultUsername = 'zxzr1';
                } else if (this.editStatus === 7) {
                    // 修改重新提交：默认选择zhwm1
                    defaultUsername = 'zhwm1';
                }

                if (defaultUsername) {
                    const defaultUser = this.nextApproverUsers.find(user => user.userName === defaultUsername);
                    if (defaultUser) {
                        this.form.nextReviewer = [defaultUser.userId];
                        this.lockedReviewerId = defaultUser.userId;

                        // 根据状态设置选择限制和锁定用户
                        this.updateSelectionRules(defaultUsername);

                        // 根据默认用户自动选择部门
                        this.loadDeptByUserId(defaultUser.userId);
                    }
                }
            });
        },
        // 获取占位符文本
        getPlaceholderText() {
            if (this.currentSelectionLimit === 2) {
                return '请选择部门和人员（主任不可删除）';
            } else {
                return '请选择部门和人员';
            }
        },
        // 根据状态更新选择规则
        updateSelectionRules(defaultUsername) {
            if (defaultUsername === 'zxzr1') {
                // zxzr1状态：可以选择2人，zxzr1不可删除
                this.currentSelectionLimit = 2;
                this.lockedUserId = this.lockedReviewerId; // 锁定zxzr1用户
            } else {
                // 其他状态：只能选择1人，可以删除默认用户
                this.currentSelectionLimit = 1;
                this.lockedUserId = null; // 不锁定任何用户
            }
        },
        loadDeptByUserId(userId) {
            // 根据用户ID查找用户信息，获取部门ID
            const user = this.nextApproverUsers.find(u => u.userId === userId);
            if (user && user.deptId) {
                // 记录默认部门，但不锁定
                this.lockedDeptId = user.deptId;
                // 设置级联选择器的默认值
                this.selectedNextReviewer = this.convertToCascaderValue([userId]);
            } else {
                // 如果用户信息中没有部门ID，尝试从用户信息中获取
                if (this.userInfo && this.userInfo.deptId) {
                    this.lockedDeptId = this.userInfo.deptId;
                }
            }
        },
        getDocumentTemplates() {
            // 获取套头模板列表
            getDocumentDict().then(res => {
                this.documentTemplates = res.data;
            });
        },
        getDeptUserTree() {
            // 获取部门和用户的树形数据
            getDeptUserTree().then(res => {
                this.deptUserTreeOptions = this.formatDeptUserTree(res.data, 1);
            });
        },
        formatDeptUserTree(data, level = 1) {
            if (!data) return [];

            const shouldFilter = this.editStatus === 2 || this.editStatus === 4;
            const allowedDeptIds = ['103', '102', '2841'];

            return data
                .filter(item => {
                    // 第一级（根节点）不过滤
                    if (level === 1) {
                        return true;
                    }
                    // 第二级及以上只保留指定部门
                    if (shouldFilter) {
                        return item.deptId && allowedDeptIds.includes(String(item.deptId));
                    }
                    return true;
                })
                .map(item => {
                    const node = {
                        id: item.deptId,
                        label: item.deptName,
                        children: [],
                        disabled: false,
                        isUser: false
                    };

                    // 添加用户到子节点
                    if (item.userList && item.userList.length > 0) {
                        item.userList.forEach(user => {
                            node.children.push({
                                id: user.userId,
                                label: user.nickName || user.userName,
                                deptId: item.deptId,
                                isUser: true,
                                disabled: false,
                                userName: user.userName
                            });
                        });
                    }

                    // 递归处理子部门
                    if (item.children && item.children.length > 0) {
                        const childDepts = this.formatDeptUserTree(item.children, level + 1);
                        if (childDepts && childDepts.length > 0) {
                            node.children = [...node.children, ...childDepts];
                        }
                    }

                    // 如果没有子节点，则删除children属性
                    if (node.children.length === 0) {
                        delete node.children;
                    }

                    return node;
                });
        },
        // 将用户ID数组转换为级联选择器需要的路径格式
        convertToCascaderValue(userIds) {
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return [];
            }

            const paths = [];
            userIds.forEach(userId => {
                const path = this.findUserPath(userId, this.deptUserTreeOptions);
                if (path) {
                    paths.push(path);
                }
            });
            return paths;
        },
        // 查找用户在树中的路径
        findUserPath(userId, tree, currentPath = []) {
            for (const node of tree) {
                const newPath = [...currentPath, node.id];

                // 如果当前节点是用户节点
                if (node.isUser && node.id === userId) {
                    return newPath;
                }

                // 递归查找子节点
                if (node.children && node.children.length > 0) {
                    const result = this.findUserPath(userId, node.children, newPath);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        },
        // 将级联选择器的值转换为用户ID数组
        convertFromCascaderValue(cascaderValues) {
            if (!cascaderValues || !Array.isArray(cascaderValues) || cascaderValues.length === 0) {
                return [];
            }

            const userIds = [];
            cascaderValues.forEach(path => {
                if (path && path.length > 0) {
                    // 取路径的最后一个元素作为用户ID
                    const userId = path[path.length - 1];
                    userIds.push(userId);
                }
            });
            return userIds;
        },
        // 更新选项的禁用状态
        // updateOptionsDisabled() {
        //     const hasSelection = this.selectedNextReviewer && this.selectedNextReviewer.length > 0;
        //     // this.updateTreeDisabled(this.deptUserTreeOptions, hasSelection);
        // },
        // 递归更新树节点的禁用状态
        // updateTreeDisabled(nodes, hasSelection) {
        //     if (!nodes) return;

        //     nodes.forEach(node => {
        //         if (node.isUser) {
        //             // 对于用户节点
        //             if (this.lockedUserId && node.id === this.lockedUserId) {
        //                 // 锁定的用户永远不禁用（但不可删除）
        //                 node.disabled = false;
        //             } else if (this.currentSelectionLimit === 1) {
        //                 // 限制1人时：如果已有选择且当前节点未被选中，则禁用
        //                 node.disabled = hasSelection && !this.isNodeSelected(node);
        //             } else if (this.currentSelectionLimit === 2) {
        //                 // 限制2人时：如果已选2人且当前节点未被选中，则禁用
        //                 node.disabled = hasSelection && this.selectedNextReviewer.length >= 2 && !this.isNodeSelected(node);
        //             } else {
        //                 node.disabled = false;
        //             }
        //         } else {
        //             // 对于部门节点，始终禁用（不可选择）
        //             node.disabled = true;
        //         }

        //         // 递归处理子节点
        //         if (node.children) {
        //             this.updateTreeDisabled(node.children, hasSelection);
        //         }
        //     });
        // },
        // 检查节点是否被选中
        isNodeSelected(node) {
            if (!this.selectedNextReviewer || this.selectedNextReviewer.length === 0) {
                return false;
            }

            return this.selectedNextReviewer.some(path => {
                if (path && path.length > 0) {
                    const lastId = path[path.length - 1];
                    return lastId === node.id;
                }
                return false;
            });
        },
        // 检查部门下是否有选中的用户
        hasSelectedUserInDept(deptNode) {
            if (!deptNode.children) return false;

            for (const child of deptNode.children) {
                if (child.isUser && this.isNodeSelected(child)) {
                    return true;
                }
                if (!child.isUser && this.hasSelectedUserInDept(child)) {
                    return true;
                }
            }
            return false;
        },
        getCurrentDeptUsers() {
            console.log('调用getCurrentDeptUsers方法');
            console.log('userInfo:', this.userInfo);
            if (this.userInfo && this.userInfo.deptId) {
                console.log('开始获取部门用户数据，deptId:', this.userInfo.deptId);
                getDeptUserTree().then(res => {
                    const getUsersByDeptId = (deptId, tree) => {
                        let users = [];
                        const findNode = nodes => {
                            for (const node of nodes) {
                                if (node.deptId === deptId) {
                                    users = node.userList || [];
                                    return;
                                }
                                if (node.children) {
                                    findNode(node.children);
                                }
                            }
                        };
                        findNode(tree);
                        return users;
                    };
                    this.currentDeptUsers = getUsersByDeptId(this.userInfo.deptId, res.data);
                });
            }
        },
        fetchUserPermissions() {
            this.userPermissions.canDepartmentReadConfirm = this.hasPermission('project:document:departmentReadConfirm');
        },
        hasPermission(permission) {
            return this.permissions.some(p => p === permission);
        },
        previewFile(file) {
            if (!file || !file.url) return;
            const baseUrl = conf.server.baseUrl;
            const fileUrl = baseUrl + file.url;
            const fileName = file.name;
            const fileExt = fileName.split('.').pop().toLowerCase();
            this.$refs.viewFileRef.openDialog(fileUrl, fileExt);
        },
        // 预览文件在线
        previewFileOnline(file) {
            if (this.getUploadFiles && this.getUploadFiles.length > 0) {
                const fileInList = this.getUploadFiles.find(f => f.fileName.includes(file.name));
                const token = getToken();
                if (fileInList) {
                    // 构建目标 URL
                    const baseUrl = 'http://192.168.0.139:5174/'; // 替换为实际地址
                    const id = this.$route.query.id;
                    // 方式1：通过 URL 参数传递
                    const url = `${baseUrl}?fileId=${fileInList.id}&userId=${this.userInfo.userId}&token=${token}&userName=${decodeURIComponent(this.userInfo.nickName)}`;

                    // // 在新窗口打开
                    window.open(url, '_blank');
                }
            }
        },
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
        handleSelectPhrase(fieldName, phrase) {
            // 如果传入了字段名，则直接设置对应字段
            if (fieldName) {
                if (fieldName === 'mainDeliveryAgency') {
                    this.form.mainDeliveryAgency = (this.form.mainDeliveryAgency || '') + phrase;
                } else if (fieldName === 'cc') {
                    this.form.cc = (this.form.cc || '') + phrase;
                } else if (fieldName === 'internalCirculation') {
                    this.form.internalCirculation = (this.form.internalCirculation || '') + phrase;
                } else if (fieldName === 'managerRemark') {
                    this.managerRemark = (this.managerRemark || '') + phrase;
                } else if (fieldName === 'comprehensiveRemark') {
                    this.comprehensiveRemark = (this.comprehensiveRemark || '') + phrase;
                } else if (fieldName === 'directorRemark') {
                    this.directorRemark = (this.directorRemark || '') + phrase;
                } else if (fieldName === 'comprehensiveProcessRemark') {
                    this.comprehensiveProcessRemark = (this.comprehensiveProcessRemark || '') + phrase;
                }
                return;
            }

            // 原有的审批意见逻辑（保留向后兼容）
            switch (this.editStatus) {
                case 1:
                    this.managerRemark = (this.managerRemark || '') + phrase;
                    break;
                case 2:
                    this.comprehensiveRemark = (this.comprehensiveRemark || '') + phrase;
                    break;
                case 3:
                    this.directorRemark = (this.directorRemark || '') + phrase;
                    break;
                case 4:
                    this.comprehensiveProcessRemark = (this.comprehensiveProcessRemark || '') + phrase;
                    break;
            }
        },
        handleCollected() {
            this.$modal.msgSuccess('收藏成功');
        },
        // 处理打印份数输入
        handlePartNumberInput(value) {
            // 只允许数字
            const numericValue = value.replace(/[^\d]/g, '');
            if (numericValue !== value) {
                this.form.partNumber = numericValue;
            }
            // 限制范围
            const num = parseInt(numericValue) || 0;
            if (num > 999) {
                this.form.partNumber = 999;
            } else if (num < 1 && numericValue !== '') {
                this.form.partNumber = 1;
            }
        },
        // 处理键盘事件
        handlePartNumberKeydown(event) {
            // 只允许数字键、退格键、删除键、方向键、Tab键
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
                event.preventDefault();
            }
        },
        // 减少打印份数
        decreasePartNumber() {
            if (this.form.partNumber > 1) {
                this.form.partNumber = Math.max(1, (parseInt(this.form.partNumber) || 1) - 1);
            }
        },
        // 增加打印份数
        increasePartNumber() {
            if (this.form.partNumber < 999) {
                this.form.partNumber = Math.min(999, (parseInt(this.form.partNumber) || 0) + 1);
            }
        },
        handleComplete() {
            if (this.editStatus === 4) {
                // if (!this.form.deptDistribution || this.form.deptDistribution.length === 0) {
                //   this.$message.error('请选择分发部门');
                //   return;
                // }

                const docId = this.form.id;
                if (!docId) {
                    this.$message.error('未找到公文ID');
                    return;
                }

                this.$confirm('确定要办结此公文吗?', '办结确认', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                    .then(() => {
                        return documentDirectorHair({
                            docId: docId,
                            remark: this.comprehensiveProcessRemark,
                            documentRemark: this.form.documentRemark
                        });
                    })
                    .then(() => {
                        this.$modal.msgSuccess('办结分发成功');
                        this.$router.push('/document/documentManagement');
                    })
                    .catch(() => {});
            } else {
                this.$message.info('办结功能待实现');
            }
        },
        handleArchive() {
            this.$message.info('归档功能待实现');
        },
        handleSubmit() {
            // 手动校验印发日期
            if (!this.form.issuingDate || this.form.issuingDate.trim() === '') {
                this.$message.error('请选择印发日期');
                return;
            }

            // 部门经理新增时校验下一处理人
            if (this.editStatus === null && this.showNextApprover) {
                if (!this.form.nextReviewer || !Array.isArray(this.form.nextReviewer) || this.form.nextReviewer.length === 0) {
                    this.$message.error('请选择下一处理人');
                    return;
                }
            }

            this.$refs.documentForm.validate(valid => {
                if (valid) {
                    const payload = {
                        type: this.form.type,
                        title: this.form.title,
                        text: this.form.text,
                        filePath: this.form.filePath,
                        documentRemark: this.form.documentRemark
                    };

                    // 根据发文类型添加相应字段
                    // 新增时不发送 wordSize，由后端生成；编辑时才发送
                    if (this.editStatus !== null && this.shouldShowField('wordSize')) {
                        payload.wordSize = this.form.wordSize;
                    }
                    if (this.shouldShowField('draftDate')) {
                        payload.draftDate = this.form.draftDate && !this.form.draftDate.includes(' ') ? this.form.draftDate + ' 00:00:00' : this.form.draftDate;
                    }
                    if (this.shouldShowField('urgencyLevel')) payload.urgencyLevel = this.form.urgencyLevel;
                    if (this.shouldShowField('mainDeliveryAgency')) payload.mainDeliveryAgency = this.form.mainDeliveryAgency;
                    if (this.shouldShowField('cc')) payload.cc = this.form.cc;
                    if (this.shouldShowField('internalCirculation')) payload.internalCirculation = this.form.internalCirculation;
                    if (this.shouldShowField('partNumber')) payload.partNumber = this.form.partNumber ? String(this.form.partNumber) : '';
                    if (this.shouldShowField('contactPerson')) payload.contactPerson = this.form.contactPerson;
                    if (this.shouldShowField('contactPhone')) payload.contactPhone = this.form.contactPhone;
                    if (this.shouldShowField('issuingDate')) {
                        payload.issuingDate = this.form.issuingDate && !this.form.issuingDate.includes(' ') ? this.form.issuingDate + ' 00:00:00' : this.form.issuingDate;
                    }
                    if (this.shouldShowField('word')) payload.word = this.form.word;

                    if (this.showNextApprover && this.editStatus === null) {
                        payload.receivedIds = this.form.nextReviewer.join(',');
                    }

                    addDocument(payload).then(response => {
                        if (this.uploadFiles && this.uploadFiles.length > 0) {
                            const documentSaveObj = this.uploadFiles.map(item => ({
                                document_id: response.data,
                                url: item.urlBack,
                                file_name: item.name,
                                edit: true
                            }));
                            if (response.data) {
                                documentImageSave(documentSaveObj).then(ress => {
                                    console.log('🚀 ~ ress ~ :', ress);
                                });
                            }
                        }

                        this.$modal.msgSuccess('提交成功');
                        this.$router.push('/document/documentManagement');
                    });
                } else {
                    this.$message.error('请完善必填信息');
                    return false;
                }
            });
        },
        handleProcess() {
            // 手动校验印发日期
            if (!this.form.issuingDate || this.form.issuingDate.trim() === '') {
                this.$message.error('请选择印发日期');
                return;
            }
            console.log('this.editStatus:', this.editStatus);
            console.log('this.showNextApprover:', this.showNextApprover);
            console.log('this.form.nextReviewer:', this.form.nextReviewer);

            // 部门经理重新提交时校验下一处理人
            if (this.editStatus === 7 && !this.showNextApprover) {
                console.log('部门经理重新提交时校验下一处理人');

                if (!this.form.nextReviewer || !Array.isArray(this.form.nextReviewer) || this.form.nextReviewer.length === 0) {
                    this.$message.error('请选择下一处理人');
                    return;
                }
            }

            this.$refs.documentForm.validate(valid => {
                if (!valid) {
                    this.$message.error('请完善必填信息');
                    return;
                }
                let promise;
                const docId = this.form.id;
                switch (this.editStatus) {
                    case 1: // 部门经理
                        let managerPayload = { docId, status: this.managerStatus, remark: this.managerRemark, documentRemark: this.form.documentRemark };
                        if (this.managerStatus === '1' && this.form.nextReviewer && this.form.nextReviewer.length > 0) {
                            managerPayload.receivedIds = this.form.nextReviewer.join(',');
                        }
                        promise = documentLeaderCheck(managerPayload);
                        break;
                    case 2: // 综合管理部
                        let comprehensivePayload = { docId, status: this.comprehensiveStatus, remark: this.comprehensiveRemark, documentRemark: this.form.documentRemark };
                        if (this.comprehensiveStatus === '1' && this.form.nextReviewer && this.form.nextReviewer.length > 0) {
                            comprehensivePayload.directorIds = this.form.nextReviewer.join(',');
                        }
                        promise = documentComprehensiveCheck(comprehensivePayload);
                        break;
                    case 3: // 主任
                        promise = documentDirectorCheck({ docId, status: this.directorStatus, remark: this.directorRemark, documentRemark: this.form.documentRemark });
                        break;
                    case 5: // 部门经理分发
                        if (!this.form.userIds || this.form.userIds.length === 0) {
                            this.$message.error('请选择分发人员');
                            return;
                        }
                        promise = departmentalDistribution({ docId, userIds: this.form.userIds.join(',') });
                        break;
                    case 7: // 发文创建人修改并重新提交
                        const resubmitPayload = {
                            id: docId,
                            type: this.form.type,
                            urgencyLevel: this.form.urgencyLevel,
                            mainDeliveryAgency: this.form.mainDeliveryAgency,
                            title: this.form.title,
                            text: this.form.text,
                            filePath: this.form.filePath,
                            cc: this.form.cc,
                            partNumber: this.form.partNumber ? String(this.form.partNumber) : '',
                            internalCirculation: this.form.internalCirculation,
                            issuingDate: this.form.issuingDate && !this.form.issuingDate.includes(' ') ? this.form.issuingDate + ' 00:00:00' : this.form.issuingDate,
                            word: this.form.word,
                            documentRemark: this.form.documentRemark
                        };
                        if (this.form.nextReviewer && this.form.nextReviewer.length > 0) {
                            resubmitPayload.receivedIds = this.form.nextReviewer.join(',');
                        }
                        promise = submitDraft(resubmitPayload);
                        break;
                }
                if (promise) {
                    promise.then(() => {
                        this.$modal.msgSuccess('处理成功');
                        this.$router.push('/document/documentManagement');
                    });
                }
            });
        },
        handleConfirmRead() {
            const docId = this.form.id;
            if (!docId) {
                this.$message.error('未找到公文ID');
                return;
            }

            this.$confirm('确定已阅此公文吗?', '已阅确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            })
                .then(() => {
                    return readingConfirmation({ docId });
                })
                .then(() => {
                    this.$modal.msgSuccess('已阅成功');
                    this.$router.push('/document/documentManagement');
                })
                .catch(() => {});
        },
        previewRedHeaderDoc() {
            const docId = this.form.id;
            if (!docId) {
                this.$message.error('未找到公文ID');
                return;
            }

            getPreviewRedHeaderDoc(docId)
                .then(res => {
                    // 创建 blob 对象，设置正确的 MIME 类型
                    const blob = new Blob([res], {
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    });
                    // 创建下载链接
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    // 设置下载文件名
                    link.download = `公文_${docId}.docx`;
                    // 添加到页面并触发点击
                    document.body.appendChild(link);
                    link.click();
                    // 清理
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);
                })
                .catch(error => {
                    console.error('预览套头文件失败:', error);
                    this.$message.error('预览套头文件失败');
                });
        },
        downloadFile(file) {
            const baseUrl = conf.server.baseUrl;
            const url = baseUrl + file.url;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        validateRequiredField(fieldName, value, callback, message) {
            // 对于综合管理部处理意见，只在状态为4时验证
            if (fieldName === 'comprehensiveProcessRemark') {
                if (this.editStatus === 4 && (!value || value.trim() === '')) {
                    return callback(new Error(message));
                }
                return callback();
            }

            // 只有当字段应该显示时才验证
            if (this.shouldShowField(fieldName)) {
                if (!value || value.trim() === '') {
                    return callback(new Error(message));
                }
            }
            return callback();
        },
        handleExit() {
            this.$router.go(-1);
        },
        // 下一处理人弹窗相关方法
        openNextHandlerDialog() {
            // 确保数据已加载
            if (!this.deptUserTreeOptions || this.deptUserTreeOptions.length === 0) {
                this.getDeptUserTree();
            }
            // 打开弹窗时，将当前的nextReviewer值同步到selectedNextReviewer
            this.selectedNextReviewer = this.convertToCascaderValue(this.form.nextReviewer);
            this.showNextHandlerDialog = true;

            // 更新选项的禁用状态
            // this.$nextTick(() => {
            //     this.updateOptionsDisabled();
            // });
        },
        handleNextHandlerConfirm() {
            if (!this.selectedNextReviewer || this.selectedNextReviewer.length === 0) {
                this.$message.error('请选择下一处理人');
                return;
            }

            // 将级联选择器的值转换为用户ID数组
            const userIds = this.convertFromCascaderValue(this.selectedNextReviewer);
            this.form.nextReviewer = userIds;
            this.showNextHandlerDialog = false;
            this.$message.success('下一处理人设置成功');
        },
        handleNextReviewerChange(value) {
            // 检查是否超过限制
            // if (value && value.length > this.currentSelectionLimit) {
            //     this.$message.warning(`最多只能选择${this.currentSelectionLimit}人`);
            //     return;
            // }

            // 检查是否尝试删除锁定的用户
            if (this.lockedUserId && value) {
                const lockedUserPath = this.findUserPath(this.lockedUserId, this.deptUserTreeOptions);
                const hasLockedUser = lockedUserPath && value.some(path => JSON.stringify(path) === JSON.stringify(lockedUserPath));

                if (!hasLockedUser) {
                    this.$message.warning('主任用户不可删除');
                    this.$nextTick(() => {
                        if (lockedUserPath) {
                            this.selectedNextReviewer = [...value, lockedUserPath];
                        }
                    });
                    return;
                }
            }

            // 更新选择
            this.selectedNextReviewer = value;

            // 更新选项的禁用状态
            // this.$nextTick(() => {
            //     this.updateOptionsDisabled();
            // });
        },
        // 统一提交处理方法
        handleSubmitAction() {
            if (this.editStatus === null) {
                this.handleSubmit();
            } else {
                this.handleProcess();
            }
        },
        // 通过按钮处理
        handleApprove() {
            // 设置状态为通过，然后执行处理逻辑
            if (this.editStatus === 1) {
                this.managerStatus = '1';
            } else if (this.editStatus === 2) {
                this.comprehensiveStatus = '1';
            } else if (this.editStatus === 3) {
                this.directorStatus = '1';
            }
            this.handleProcess();
        },
        // 退回按钮处理
        handleReject() {
            // 设置状态为退回，然后执行处理逻辑
            if (this.editStatus === 1) {
                this.managerStatus = '2';
            } else if (this.editStatus === 2) {
                this.comprehensiveStatus = '2';
            } else if (this.editStatus === 3) {
                this.directorStatus = '2';
            }
            this.handleProcess();
        }
    }
};
</script>

<style scoped>
.document-form-container {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.page-title {
    text-align: center;
    margin-bottom: 30px;
}

.page-title h2 {
    color: #000;
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.document-form {
    margin-top: 20px;
}

/* Word表格样式 */
.word-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ccc;
    margin-bottom: 0;
    background: #fff;
}

.word-table td {
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 0;
    vertical-align: middle;
    font-size: 14px;
    line-height: 1.4;
}

.word-table tr:first-child td {
    border-top: 1px solid #ccc;
}

.word-table td:first-child {
    border-left: 1px solid #ccc;
}

.label-cell {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
    width: 120px;
    min-width: 120px;
    color: #000;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    padding: 12px 8px;
    vertical-align: middle;
}

.input-cell {
    background-color: #fff;
    padding: 12px 8px;
    vertical-align: middle;
}

.table-input {
    width: 100%;
    border: none !important;
    background: transparent !important;
    font-size: 14px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.table-input .el-input__inner {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: 14px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    box-shadow: none !important;
    outline: none !important;
}

.table-input .el-input__inner:focus {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.table-input .el-input__inner:hover {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

.table-select {
    width: 100%;
}

.table-select .el-input__inner {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: 14px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    box-shadow: none !important;
    outline: none !important;
}

.table-select .el-input__inner:focus {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.table-select .el-input__inner:hover {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

.table-date-picker {
    width: 100%;
}

.table-date-picker .el-input__inner {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: 14px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    box-shadow: none !important;
    outline: none !important;
}

.table-date-picker .el-input__inner:focus {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.table-date-picker .el-input__inner:hover {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

.table-textarea {
    width: 100%;
}

.table-textarea .el-textarea__inner {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: 14px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    resize: none;
    box-shadow: none !important;
    outline: none !important;
}

.table-textarea .el-textarea__inner:focus {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.table-textarea .el-textarea__inner:hover {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

.table-input-number {
    width: 100%;
}

.table-input-number .el-input__inner {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: 14px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    box-shadow: none !important;
    outline: none !important;
}

.table-input-number .el-input__inner:focus {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.table-input-number .el-input__inner:hover {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

/* 打印份数包装器样式 */
.part-number-wrapper {
    position: relative;
    width: 100%;
}

.part-number-controls {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 2px;
    z-index: 10;
}

.part-number-btn {
    width: 24px;
    height: 24px;
    border: 1px solid #409eff;
    background: #409eff;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.part-number-btn:hover:not(:disabled) {
    background: #66b1ff;
    border-color: #66b1ff;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
}

.part-number-btn:active:not(:disabled) {
    background: #3a8ee6;
    border-color: #3a8ee6;
    color: #fff;
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.part-number-btn:disabled {
    background: #f5f7fa;
    border-color: #e4e7ed;
    color: #c0c4cc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

.part-number-decrease {
    order: 1;
}

.part-number-increase {
    order: 2;
}

/* 全局去除表格内所有Element UI组件的边框和背景 */
.word-table .el-input__inner,
.word-table .el-textarea__inner,
.word-table .el-input__suffix,
.word-table .el-input__prefix {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.word-table .el-input__inner:focus,
.word-table .el-textarea__inner:focus {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
}

.word-table .el-input__inner:hover,
.word-table .el-textarea__inner:hover {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

/* 去除选择器的下拉箭头背景 */
.word-table .el-input__suffix {
    background: transparent !important;
}

.word-table .el-input__suffix .el-input__icon {
    background: transparent !important;
}

/* 禁用状态的输入框背景色设为白色 */
.word-table .el-input.is-disabled .el-input__inner,
.word-table .el-textarea.is-disabled .el-textarea__inner,
.word-table .el-input.is-disabled .el-input__inner:hover,
.word-table .el-textarea.is-disabled .el-textarea__inner:hover {
    background-color: #fff !important;
    color: #606266 !important;
    cursor: not-allowed;
}

.word-table .el-select.is-disabled .el-input__inner {
    background-color: #fff !important;
    color: #606266 !important;
    cursor: not-allowed;
}

.word-table .el-date-editor.is-disabled .el-input__inner {
    background-color: #fff !important;
    color: #606266 !important;
    cursor: not-allowed;
}

.approval-section {
    position: relative;
}

/* 确保部门分发select有足够宽度 */
.approval-section .el-select {
    width: 100% !important;
    min-width: 0;
}

.approval-section .el-select .el-input__inner {
    width: 100% !important;
}

.handler-info {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
    padding: 4px 8px;
    background: #ffffff;
    border-radius: 4px;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
    text-align: right;
}

.handler-time {
    font-size: 12px;
    color: #666;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.action-buttons .el-button {
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
}

.action-buttons .el-button:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
}

.action-buttons .el-button:disabled {
    background-color: #c0c4cc !important;
    border-color: #c0c4cc !important;
    color: #fff !important;
}

/* 弹窗按钮样式 */
.el-dialog__footer .el-button--primary {
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
}

.el-dialog__footer .el-button--primary:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
}

.el-dialog__footer .el-button--default {
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
}

.el-dialog__footer .el-button--default:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
}

.content-actions {
    margin-top: 10px;
    text-align: right;
}

.attachment-list {
    margin-top: 10px;
}

.attachment-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fafafa;
    margin-bottom: 8px;
}

.file-info {
    flex: 1;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.attachment-actions {
    display: flex;
    gap: 8px;
}

.attachment-actions .el-button {
    background-color: #409eff !important;
    border-color: #409eff !important;
    color: #fff !important;
}

.attachment-actions .el-button:hover {
    background-color: #66b1ff !important;
    border-color: #66b1ff !important;
}

.process-flow-section {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.process-flow-section h3 {
    color: #303133;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
}

.type-select-tip {
    margin: 30px 0;
    text-align: center;
}

::v-deep .el-input.is-disabled .el-input__inner,
::v-deep .el-textarea.is-disabled textarea,
::v-deep .el-date-editor--daterange.is-disabled.el-range-editor {
    background-color: #ffffff !important;
    border: none !important;
}

::v-deep .el-textarea.is-disabled .el-textarea__inner {
    background-color: #ffffff !important;
    border: none !important;
}

::v-deep .el-textarea__inner {
    background-color: #ffffff !important;
    border: none !important;
}
::v-deep .el-input__inner {
    background-color: #ffffff !important;
    border: none !important;
}
</style>
