<template>
  <div class="app-container">
    <div class="document-form-container">
      <!-- 页面标题 -->
      <div class="page-title">
        <h2>天津众和收文处理单</h2>
      </div>

      <!-- 收文处理表单 - Word表格样式 -->
      <el-form ref="documentForm" :model="form" :rules="rules" class="document-form">
        <!-- 基本信息表格 -->
        <table class="word-table">
          <tr>
            <td class="label-cell">上级文件编号</td>
            <td class="input-cell">
              <el-input v-model="form.superiorDocNumber" placeholder="自由输入不超20字符" maxlength="20" show-word-limit
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)" class="table-input"></el-input>
            </td>
            <td class="label-cell">来文字号</td>
            <td class="input-cell">
              <el-input v-model="form.incomingDocNumber" placeholder="自由输入不超20字符" maxlength="20" show-word-limit
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)" class="table-input"></el-input>
            </td>
          </tr>
          <tr>
            <td class="label-cell">收文类型</td>
            <td class="input-cell">
              <el-select v-model="form.type" placeholder="下拉选择"
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)" class="table-select">
                <el-option v-for="dict in dict.type.document_receive_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </td>
            <td class="label-cell">收文编号</td>
            <td class="input-cell">
              <el-input v-model="form.wordSize" disabled placeholder="系统自动生成" class="table-input"></el-input>
            </td>
          </tr>
          <tr>
            <td class="label-cell">原文日期</td>
            <td class="input-cell">
              <el-date-picker v-model="form.originalDocDate" type="date" placeholder="自由输入日期" value-format="yyyy-MM-dd"
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)"
                class="table-date-picker"></el-date-picker>
            </td>
            <td class="label-cell">收文日期</td>
            <td class="input-cell">
              <el-input v-model="form.receivedDate" disabled placeholder="系统自动生成" class="table-input"></el-input>
            </td>
          </tr>
          <tr>
            <td class="label-cell">来文单位</td>
            <td class="input-cell" colspan="3">
              <el-input v-model="form.originatingUnit" placeholder="自由输入不超100字符" maxlength="100" show-word-limit
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)" class="table-input"></el-input>
            </td>
          </tr>
        </table>

        <!-- 标题和内容表格 -->
        <table class="word-table">
          <tr>
            <td class="label-cell">标题</td>
            <td class="input-cell" colspan="3">
              <el-input v-model="form.title" placeholder="输入不超200字符" maxlength="200" show-word-limit
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)" class="table-input"></el-input>
            </td>
          </tr>
        </table>

        <!-- 附件表格 -->
        <table class="word-table">
          <tr>
            <td class="label-cell">附件</td>
            <td class="input-cell" colspan="3">
              <FileUpload v-if="!isView && (putEditStatus === null || putEditStatus === 7)" v-model="form.attachments"
                @upload-success="handleFileChange" style="margin: 5px 10px" />
              <div v-else-if="form.attachments" class="attachment-list">
                <div v-for="(filePath, index) in form.attachments.split(',')" :key="index" class="attachment-item"
                  v-if="filePath.trim()">
                  <span class="file-info" @click="previewFileOnline({ name: getFileName(filePath) })">
                    <i class="el-icon-document"></i>
                    {{ getDisplayFileName(filePath) }}
                  </span>
                  <div class="attachment-actions">
                    <el-button type="primary" size="mini"
                      @click="downloadFile({ url: filePath, name: getFileName(filePath) })">下载</el-button>
                    <el-button type="primary" size="mini"
                      @click="previewFile({ url: filePath, name: getFileName(filePath) })">预览</el-button>
                  </div>
                </div>
              </div>
              <div v-else style="display: flex; align-items: center; justify-content: center">
                <span style="color: #c0c4cc">无附件</span>
              </div>
            </td>
          </tr>
        </table>

        <!-- 审批意见表格 -->
        <table class="word-table">
          <tr>
            <td class="label-cell">主任批示</td>
            <td class="input-cell" colspan="3">
              <div class="approval-section">
                <el-input v-model="form.directorInstruction" type="textarea" :rows="3" placeholder="填写意见"
                  :disabled="isSectionDisabled(2)" class="table-textarea"></el-input>
                <QuickReply v-if="!isSectionDisabled(2)" style="margin: 5px 10px"
                  :onSelect="phrase => handleSelectPhrase('director', phrase)" :superviseId="$route.query.id"
                  :inputContent="form.directorInstruction" :buttonWidth="'90px'" :buttonHeight="'30px'"
                  @collected="handleCollected" />
                <div class="handler-info" v-if="form.directorHandler">
                  <span class="handler-time">处理人: {{ form.directorHandler }} 日期: {{ form.directorDate }} 时间: {{
                    form.directorTime }}</span>
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
                <el-input v-model="form.comprehensiveOpinion" type="textarea" :rows="3" placeholder="填写意见"
                  :disabled="isSectionDisabled(1)" class="table-textarea"></el-input>
                <QuickReply v-if="!isSectionDisabled(1)" style="margin: 5px 10px"
                  :onSelect="phrase => handleSelectPhrase('comprehensive', phrase)" :superviseId="$route.query.id"
                  :inputContent="form.comprehensiveOpinion" :buttonWidth="'100px'" :buttonHeight="'30px'"
                  @collected="handleCollected" />
                <div class="handler-info" v-if="form.comprehensiveHandler">
                  <span class="handler-time">处理人: {{ form.comprehensiveHandler }} 日期: {{ form.comprehensiveDate }} 时间:
                    {{ form.comprehensiveTime }}</span>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td class="label-cell">综合管理部意见</td>
            <td class="input-cell" colspan="3">
              <div class="approval-section">
                <el-input v-model="form.leadDeptOpinion" type="textarea" :rows="3" placeholder="填写意见"
                  :disabled="isSectionDisabled(3)" class="table-textarea"></el-input>
                <QuickReply v-if="!isSectionDisabled(3)" style="margin: 5px 10px"
                  :onSelect="phrase => handleSelectPhrase('leadDept', phrase)" :superviseId="$route.query.id"
                  :inputContent="form.leadDeptOpinion" :buttonWidth="'90px'" :buttonHeight="'30px'"
                  @collected="handleCollected" />
                <!-- 分发给部门经理的附件 -->
                <el-form-item label="附件" prop="managerAttachment" style="margin-top: 10px"
                  v-if="form.managerAttachment && putEditStatus !== 3">
                  <FileUpload v-if="!isView && !isSectionDisabled(3)" v-model="form.managerAttachment"
                    style="margin: 5px 10px" />
                  <div v-else-if="form.managerAttachment" class="attachment-list">
                    <div v-for="(filePath, index) in getAttachmentList(form.managerAttachment)" :key="index"
                      class="attachment-item" v-if="filePath.trim()">
                      <span class="file-info" @click="previewFileOnline({ name: getDisplayFileName(filePath) })">
                        <i class="el-icon-document"></i>
                        {{ getDisplayFileName(filePath) }}
                      </span>
                      <div class="attachment-actions">
                        <el-button type="primary" size="mini"
                          @click="downloadFile({ url: filePath, name: getFileName(filePath) })">下载</el-button>
                        <el-button type="primary" size="mini"
                          @click="previewFile({ url: filePath, name: getFileName(filePath) })">预览</el-button>
                      </div>
                    </div>
                  </div>
                  <span v-else>无附件</span>
                </el-form-item>
                <div class="dept-distribution" v-if="!isSectionDisabled(3)">
                  <div class="dept-distribution-wrap">
                    <div class="dept-distribution-content">
                      <span class="dept-distribution-label">综合管理部部门分发:</span>
                      <el-select v-model="form.deptDistribution" placeholder="请选择综合管理部部门经理分发" style="width: 100%"
                        :disabled="isSectionDisabled(3)">
                        <el-option v-for="item in departmentManagers" :key="item.id" :label="item.label"
                          :value="item.id"></el-option>
                      </el-select>
                    </div>
                    <div class="dept-distribution-content">
                      <span class="dept-distribution-label">其他部门分发:</span>
                      <el-select v-model="form.deptDistribution1" multiple placeholder="请选择其他部门经理分发" style="width: 100%"
                        :disabled="isSectionDisabled(3)">
                        <el-option v-for="item in departmentManagers" :key="item.id" :label="item.label"
                          :value="item.id"></el-option>
                      </el-select>
                    </div>
                  </div>

                  <el-form-item label="附件" prop="managerAttachment" style="margin-top: 10px">
                    <FileUpload v-if="!isView && !isSectionDisabled(3)" v-model="form.managerAttachment" />
                  </el-form-item>
                </div>
                <div class="handler-info" v-if="form.leadDeptHandler">
                  <span class="handler-time">处理人: {{ form.leadDeptHandler }} 日期: {{ form.leadDeptDate }} 时间: {{
                    form.leadDeptTime }}</span>
                </div>
              </div>
            </td>
          </tr>
        </table>
        <table class="word-table">
          <tr>
            <!-- 综合管理部门意见表格 -->
            <td class="label-cell" style="width: 10%;">综合管理部门意见</td>
            <td class="input-cell" style="width: 40%;">
              <div class="processing-record">
                <div class="record-label">处理记录:</div>
                <div class="record-list">
                  <div v-for="(record, index) in filteredComprehensiveRecords" :key="record.id" class="record-item">
                    <span class="record-text">{{ record.text }}</span>
                    <span class="record-info">处理人:{{ record.handler }} 日期:{{ record.date }} 时间:{{ record.time }}</span>
                  </div>
                </div>
              </div>
              <!-- 处理内容输入和按钮 -->
              <div class="read-section" v-if="showReadButton() && this.userInfo.dept.deptName == '综合管理部'">
                <el-form-item label="处理内容" prop="readOpinion">
                  <el-input v-model="form.readOpinion" type="textarea" :rows="3" placeholder="填写处理内容"
                    class="table-textarea"></el-input>
                  <QuickReply style="margin: 5px 10px" :onSelect="phrase => handleSelectPhrase('read', phrase)"
                    :superviseId="$route.query.id" :inputContent="form.readOpinion" :buttonWidth="'90px'"
                    :buttonHeight="'30px'" @collected="handleCollected" />
                </el-form-item>
                <div class="read-button-wrapper">
                  <el-button type="primary" @click="handleConfirmRead">已阅</el-button>
                </div>
              </div>
              <!-- 部门人员分发 -->
              <div class="dept-distribution" v-if="!isSectionDisabled(4) && this.userInfo.dept.deptName == '综合管理部'">
                <el-form-item label="部门人员分发" prop="staffDistribution">
                  <el-select v-model="form.staffDistribution" multiple placeholder="请选择分发人员" style="width: 100%">
                    <el-option v-for="item in currentDeptUsers" :key="item.userId" :label="item.nickName"
                      :value="item.userId"></el-option>
                  </el-select>
                </el-form-item>
                <!-- 部门经理处理意见 -->
                <el-form-item label="处理意见" prop="deptOpinion">
                  <el-input v-model="form.deptOpinion" type="textarea" :rows="3" placeholder="填写处理意见"
                    class="table-textarea"></el-input>
                  <QuickReply style="margin: 5px 10px" :onSelect="phrase => handleSelectPhrase('dept', phrase)"
                    :superviseId="$route.query.id" :inputContent="form.deptOpinion" :buttonWidth="'90px'"
                    :buttonHeight="'30px'" @collected="handleCollected" />
                </el-form-item>
              </div>
            </td>
            <!-- 其他部门意见表格 -->
            <td class="label-cell" style="width: 10%;">其他部门意见</td>
            <td class="input-cell" style="width: 40%;">
              <div class="processing-record">
                <div class="record-label">处理记录:</div>
                <div class="record-list">
                  <div v-for="(record, index) in filteredOtherRecords" :key="record.id" class="record-item">
                    <span class="record-text">{{ record.text }}</span>
                    <span class="record-info">处理人:{{ record.handler }} 日期:{{ record.date }} 时间:{{ record.time }}</span>
                  </div>
                </div>
              </div>
              <!-- 处理内容输入和按钮 -->
              <div class="read-section" v-if="showReadButton() && this.userInfo.dept.deptName != '综合管理部'">
                <el-form-item label="处理内容" prop="readOpinion">
                  <el-input v-model="form.readOpinion" type="textarea" :rows="3" placeholder="填写处理内容"
                    class="table-textarea"></el-input>
                  <QuickReply style="margin: 5px 10px" :onSelect="phrase => handleSelectPhrase('read', phrase)"
                    :superviseId="$route.query.id" :inputContent="form.readOpinion" :buttonWidth="'90px'"
                    :buttonHeight="'30px'" @collected="handleCollected" />
                </el-form-item>
                <div class="read-button-wrapper">
                  <el-button type="primary" @click="handleConfirmRead">已阅</el-button>
                </div>
              </div>
              <!-- 部门人员分发 -->
              <div class="dept-distribution" v-if="!isSectionDisabled(4) && this.userInfo.dept.deptName != '综合管理部'">
                <el-form-item label="部门人员分发" prop="staffDistribution">
                  <el-select v-model="form.staffDistribution" multiple placeholder="请选择分发人员" style="width: 100%">
                    <el-option v-for="item in currentDeptUsers" :key="item.userId" :label="item.nickName"
                      :value="item.userId"></el-option>
                  </el-select>
                </el-form-item>
                <!-- 部门经理处理意见 -->
                <el-form-item label="处理意见" prop="deptOpinion">
                  <el-input v-model="form.deptOpinion" type="textarea" :rows="3" placeholder="填写处理意见"
                    class="table-textarea"></el-input>
                  <QuickReply style="margin: 5px 10px" :onSelect="phrase => handleSelectPhrase('dept', phrase)"
                    :superviseId="$route.query.id" :inputContent="form.deptOpinion" :buttonWidth="'90px'"
                    :buttonHeight="'30px'" @collected="handleCollected" />
                </el-form-item>
              </div>
            </td>
          </tr>
        </table>

        <!-- 完成时间和备注表格 -->
        <table class="word-table">
          <tr>
            <td class="label-cell">创建人</td>
            <td class="input-cell">
              <el-input v-model="form.creator" disabled placeholder="系统自动生成" class="table-input"></el-input>
            </td>
            <td class="label-cell">完成时间</td>
            <td class="input-cell">
              <el-input v-model="form.completionTime" disabled placeholder="系统自动生成" class="table-input"></el-input>
            </td>
            <td class="label-cell">复印分送情况</td>
            <td class="input-cell">
              <el-input v-model="form.issuingAgency" placeholder="自由输入"
                :disabled="isView || (putEditStatus !== null && putEditStatus !== 7)" class="table-input"></el-input>
            </td>
          </tr>
          <tr>
            <td class="label-cell">备注</td>
            <td class="input-cell" colspan="5">
              <el-input v-model="form.remarks" type="textarea" :rows="2" placeholder="自由输入"
                :disabled="isView || (putEditStatus !== null && ![1, 2, 3, 6, 7].includes(putEditStatus))"
                class="table-textarea"></el-input>
            </td>
          </tr>
        </table>

        <!-- 操作按钮 -->
        <el-form-item>
          <div class="action-buttons">
            <el-button type="primary" :disabled="!canClickNextHandler" @click="openNextHandlerDialog">下一处理人</el-button>
            <el-button type="success" :disabled="!canClickApprove" @click="handleApprove">通过</el-button>
            <el-button type="danger" :disabled="!canClickReject" @click="handleReject">退回</el-button>
            <el-button type="success" :disabled="!canClickComplete" @click="handleComplete">办结</el-button>
            <el-button type="primary" :disabled="putEditStatus === null" @click="confirmPrint">打印</el-button>
            <el-button type="primary" :disabled="!canClickSubmit" @click="handleSubmitAction">{{ getSubmitButtonText
            }}</el-button>
            <el-button @click="handleExit">退出</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div class="print-area">
      <div class="dialogVisible-wrap" id="printArea">
        <div slot="title" class="dialog-title">
          <span>天津众和收文处理单</span>
        </div>

        <!-- 1. 公文头部：密级、缓急 -->
        <div class="doc-header">
          <!-- <div class="header-top">
                    <span class="security-level">密级</span>
                    <span class="urgency-level">〔非密〕</span>
                </div> -->
          <!-- <div class="header-top" v-if="shouldShowField('urgencyLevel')">
            <span class="security-level">紧急程度</span>
            <span class="urgency-level">〔{{ form.urgencyLevel === 'routine' ? '普通' : form.urgencyLevel === 'emergency' ?
              '一般' : '加急' }}〕</span>
          </div> -->
        </div>

        <!-- 2. 信息表格 -->
        <div class="docSignWord-table">
          <div class="docSignWord-table-item">
            <div class="docSignWord-label-cell">上级文件编号</div>
            <div class="docSignWord-input-cell">{{ form.superiorDocNumber || '' }}</div>
          </div>
          <div class="docSignWord-table-item">
            <div class="docSignWord-label-cell">来文字号</div>
            <div class="docSignWord-input-cell">{{ form.incomingDocNumber || '' }}</div>
          </div>
          <div class="docSignWord-table-item">
            <div class="docSignWord-label-cell">收文类型</div>
            <div class="docSignWord-input-cell">{{ DM_DOCUMENT_SENDING_TYPE2[form.type] || '' }}</div>
          </div>
          <div class="docSignWord-table-item">
            <div class="docSignWord-label-cell">收文编号</div>
            <div class="docSignWord-input-cell">{{ form.originalDocDate || '' }}</div>
          </div>
          <div class="docSignWord-table-item">
            <div class="docSignWord-label-cell">收文日期</div>
            <div class="docSignWord-input-cell">{{ form.receivedDate || '' }}</div>
          </div>
          <div class="docSignWord-table-item-unit">
            <div class="label-cell-unit">来文单位</div>
            <div class="input-cell-unit">{{ form.originatingUnit || '' }}</div>
          </div>
        </div>

        <!-- 3. 标题 -->
        <div class="docSignWord-div">
          <div class="docSignWord-title-cell">标题</div>
          <div class="docSignWord-title-input1">{{ form.title || '' }}</div>
        </div>

        <!-- 4. 主任批示 -->
        <div class="docSignWord-div">
          <div class="docSignWord-title-cell">主任批示</div>
          <div class="docSignWord-div-handle">
            <div class="docSignWord-title-input">
              {{ form.directorInstruction || '' }}
            </div>
            <div class="handler-info" v-if="form.directorHandler">
              <span class="handler-time">处理人: {{ form.directorHandler }} 日期: {{ form.directorDate }} 时间: {{
                form.directorTime }}</span>
            </div>
          </div>
        </div>

        <!-- 5. 综合管理部经理意见 -->
        <div class="docSignWord-div">
          <div class="docSignWord-title-cell">综合管理部经理意见</div>
          <div class="docSignWord-div-handle">
            <div class="docSignWord-title-input">{{ form.comprehensiveOpinion || '' }}</div>
            <div class="handler-info" v-if="form.comprehensiveHandler">
              <span class="handler-time">处理人: {{ form.comprehensiveHandler }} 日期: {{ form.comprehensiveDate }} 时间: {{
                form.comprehensiveTime }}</span>
            </div>
          </div>
        </div>
        <!-- 5. 综合管理部意见 -->
        <div class="docSignWord-div">
          <div class="docSignWord-title-cell">综合管理部意见</div>
          <div class="docSignWord-div-handle">
            <div class="docSignWord-title-input">{{ form.leadDeptOpinion || '' }}</div>
            <div class="handler-info" v-if="form.leadDeptHandler">
              <span class="handler-time">处理人: {{ form.leadDeptHandler }} 日期: {{ form.leadDeptDate }} 时间: {{
                form.leadDeptTime }}</span>
            </div>
          </div>
        </div>

        <!-- 7. 主办处室意见表格 -->
        <div class="docSignWord-ban">
          <div class="docSignWord-ban-item">
            <div class="docSignWord-ban-cell">综合管理部部门意见</div>
            <div class="record-list">
              <div v-for="(record, index) in filteredComprehensiveRecords" :key="record.id" class="record-item">
                <span class="record-text">{{ record.text }}</span>
                <span class="record-info">处理人:{{ record.handler }} 日期:{{ record.date }} 时间:{{ record.time }}</span>
              </div>
            </div>
          </div>
          <div class="docSignWord-ban-item2">
            <div class="docSignWord-ban-cell">其他部门意见</div>
            <div class="record-list">
              <div v-for="(record, index) in filteredOtherRecords" :key="index" class="record-item">
                <span class="record-text">{{ record.text }}</span>
                <span class="record-info">处理人:{{ record.handler }}; {{ record.date }}:{{ record.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="docSignWord-time">
          <div class="docSignWord-time-item1">
            <div class="docSignWord-time-cell">创建人</div>
            <div class="docSignWord-time-input">{{ form.creator || '' }}</div>
          </div>
          <div class="docSignWord-time-item2">
            <div class="docSignWord-time-cell">完成时间</div>
            <div class="docSignWord-time-input">{{ form.completionTime || '' }}</div>
          </div>
          <div class="docSignWord-time-item3">
            <div class="docSignWord-time-cell">复印分送情况</div>
            <div class="docSignWord-time-input">{{ form.issuingAgency || '' }}</div>
          </div>
        </div>

        <!-- 7. 备注 -->
        <div class="docSignWord-div">
          <div class="docSignWord-title-cell">备注</div>
          <div class="docSignWord-title-input">{{ form.remarks || '' }}</div>
        </div>

      </div>
    </div>

    <div v-if="printImage" style="display: none">
      <img :src="printImage" id="printImage" style="width:794px;height:auto;" />
    </div>

    <!-- 分隔线 -->
    <el-divider></el-divider>

    <!-- 处理进度 -->
    <div class="processing-progress-section">
      <h4 style="text-align: left">处理流程</h4>
      <el-table :data="processingProgressList" style="width: 100%" border>
        <el-table-column prop="no" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="item" label="处理记录" min-width="200"></el-table-column>
        <el-table-column prop="handler" label="处理人" width="120" align="center"></el-table-column>
        <el-table-column prop="notApprovedUserNames" label="处理状态" width="80"></el-table-column>
        <el-table-column prop="time" label="处理时间" width="180" align="center"></el-table-column>
      </el-table>
    </div>
    <ViewFile ref="viewFileRef" />

    <!-- 下一处理人弹窗 -->
    <el-dialog title="选择下一处理人" :visible.sync="showNextHandlerDialog" width="600px" :close-on-click-modal="false">
      <el-form>
        <el-form-item label="下一处理人" required>
          <el-cascader v-model="selectedNextReviewer" :options="deptUserTreeOptions" :props="deptUserProps"
            :placeholder="getPlaceholderText()" clearable multiple @change="handleNextReviewerChange"
            style="width: 100%; border: 1px solid #ccc; border-radius: 5px"></el-cascader>
          <!-- :multiple-limit="currentSelectionLimit" -->
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showNextHandlerDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleNextHandlerConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  dispatchAllDetails,
  documentReceivingComprehensive,
  documentReceivingDirectorCheck,
  documentReceivingLeaderDistribute,
  getUserPermission,
  dispatchDepartmentSelect,
  documentReceivingUserConfirm,
  documentReceivingEnd,
  documentReceivingLeaderCompleted
} from '@/api/oa/documentReceive';
import { addDocument, submitDraft, officialDocumentHasBeenCompleted, getDocumentImageList, documentImageSave } from '@/api/oa/documentManagement';
import { getDirectorList, getDeptUserTree } from '@/api/oa/publicApi.js';
import { getDeptLeaderUserTreeList } from '@/api/oa/document';
import QuickReply from '@/components/quickReply/index.vue';
import FileUpload from '@/components/FileUpload/index.vue';
import ViewFile from '@/components/viewFile';
import conf from '@/conf.js';
import { mapGetters } from 'vuex';
import DocSignDialog from '../components/DocSignDialog.vue';
import { getToken } from '@/utils/auth';
import RichEditor from '../components/RichEditor.vue';
import { DM_DOCUMENT_SENDING_TYPE2 } from '@/views/constant/CommonConstant.js';

export default {
  name: 'DocumentReceiveAdd',
  components: { QuickReply, FileUpload, ViewFile, DocSignDialog, RichEditor },
  dicts: ['document_receive_type'],
  data() {
    return {
      printImage: '',
      DM_DOCUMENT_SENDING_TYPE2: DM_DOCUMENT_SENDING_TYPE2,
      isView: false,
      isNew: false,
      putEditStatus: null,
      readButton: null,
      form: {
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
        comprehensiveRecords: [],// 综合管理部部门员工处理意见
        otherRecords: [],// 其他部门处理意见
        readOpinion: '',
        completionTime: '',
        issuingAgency: '',
        creator: '', // 创建人
        remarks: '',
        directorStatus: '1',
        comprehensiveStatus: '1'
      },
      rules: {
        superiorDocNumber: [{ required: true, message: '请输入上级文件编号', trigger: 'blur' }],
        incomingDocNumber: [{ required: true, message: '请输入来文字号', trigger: 'blur' }],
        type: [{ required: true, message: '请选择收文类型', trigger: 'change' }],
        originatingUnit: [{ required: true, message: '请输入来文单位', trigger: 'blur' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        text: [{ required: true, message: '请输入内容', trigger: 'blur' }],
        nextReviewer: [{ validator: (rule, value, callback) => this.validateNextReviewer(rule, value, callback), trigger: 'change' }],
        deptDistribution: [{ required: true, message: '请选择部门分发', trigger: 'change' }]
      },
      processingProgressList: [],
      nextReviewerUsers: [],
      lockedReviewerId: null,
      lockedDeptId: null, // 锁定的默认部门ID
      departmentManagers: [],
      currentDeptUsers: [],
      userPermissions: {
        isDocumentLeader: false,
        canDepartmentReadConfirm: false
      },
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
      getUploadFiles: []
    };
  },
  computed: {
    ...mapGetters(['permissions', 'userInfo']),
    canClickNextHandler() {
      // 新建时可点击，或者综合部经理审批且通过时可点击，或修改重新提交时可点击
      return this.isNew || (this.putEditStatus === 1 && this.form.comprehensiveStatus === '1') || this.putEditStatus === 7;
    },
    canClickComplete() {
      // 综合部文秘办结时可点击
      return this.putEditStatus === 6;
    },
    canClickSubmit() {
      // 新建时可点击提交；修改重新提交时可点击提交；状态3,4时可点击提交
      // 状态1,2时使用通过/退回按钮，不显示提交/提交按钮
      return this.isNew || this.putEditStatus === 7 || [3, 4].includes(this.putEditStatus);
    },
    getSubmitButtonText() {
      if (this.isNew) {
        return '提交';
      } else if (this.putEditStatus === 7) {
        return '修改并重新提交';
      } else if ([3, 4].includes(this.putEditStatus)) {
        return '提交';
      }
      return '提交';
    },
    filteredProcessingRecords() {
      // console.log(this.form.processingRecords, 'this.form.processingRecords');

      // 显示除了主任批示、综合管理部经理意见、综合管理部意见之外的所有记录
      return this.form.processingRecords.filter(record => {
        if (!record.text) return false;
        const text = record.text;

        // 排除这三种类型的记录
        const excludePatterns = ['主任岗审核通过', '综合部经理审核通过', '收文综合部文秘岗分发'];

        // 如果包含排除模式中的任何一个，则不显示
        return !excludePatterns.some(pattern => text.includes(pattern));
      });
    },
    // 综合管理部门审批记录
    filteredComprehensiveRecords() {
      // console.log(this.form.comprehensiveRecords, 'this.form.comprehensiveRecords');
      // 显示除了主任批示、综合管理部经理意见、综合管理部意见之外的所有记录
      return this.form.comprehensiveRecords.filter(record => {
        if (!record.text) return false;
        const text = record.text;

        // 排除这三种类型的记录
        const excludePatterns = ['主任岗审核通过', '综合部经理审核通过', '收文综合部文秘岗分发'];

        // 如果包含排除模式中的任何一个，则不显示
        return !excludePatterns.some(pattern => text.includes(pattern));
      });
    },
    // 部门经理审批记录
    filteredOtherRecords() {
      // console.log(this.form.otherRecords, 'this.form.otherRecords');

      // 显示除了主任批示、综合管理部经理意见、综合管理部意见之外的所有记录
      return this.form.otherRecords.filter(record => {
        if (!record.text) return false;
        const text = record.text;

        // 排除这三种类型的记录
        const excludePatterns = ['主任岗审核通过', '综合部经理审核通过', '收文综合部文秘岗分发'];

        // 如果包含排除模式中的任何一个，则不显示
        return !excludePatterns.some(pattern => text.includes(pattern));
      });
    },
    canClickApprove() {
      // 综合管理部经理审批时或主任批示时可点击通过
      return this.putEditStatus === 1 || this.putEditStatus === 2;
    },
    canClickReject() {
      // 综合管理部经理审批时或主任批示时可点击退回
      return this.putEditStatus === 1 || this.putEditStatus === 2;
    }
  },
  watch: {
    'form.nextReviewer'(newValue, oldValue) {
      // 同步更新弹窗中的选择器 - 转换为级联选择器需要的路径格式
      this.selectedNextReviewer = this.convertToCascaderValue(newValue);
    }
  },
  created() {
    const id = this.$route.query.id;
    this.getDepartmentManagers();
    this.getDeptUserTree();
    if (id) {
      this.isView = false; // When processing, it's not in view mode
      this.getDetail(id);
      // Permissions are fetched only when viewing an existing document
      this.fetchUserPermissions();
      this.getCurrentDeptUsers();
    } else {
      this.isNew = true;
      this.isView = false;
      this.setDefaultReviewer('zhwm1');
    }
  },
  methods: {
    // 在线文件
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
    // 上传文件列表
    handleFileChange(files) {
      this.uploadFiles = files;
    },
    isSectionDisabled(sectionStatus) {
      if (this.isView) {
        return true;
      }
      if (this.isNew || this.putEditStatus === 7) {
        return true;
      }
      return this.putEditStatus !== sectionStatus;
    },
    setDefaultReviewer(defaultUsername) {
      getDirectorList().then(res => {
        this.nextReviewerUsers = res.data;
        const defaultUser = this.nextReviewerUsers.find(user => user.userName === defaultUsername);
        if (defaultUser) {
          this.form.nextReviewer = [defaultUser.userId];
          this.lockedReviewerId = defaultUser.userId; // 保留用于记录，但不锁定

          // 根据状态设置选择限制和锁定用户
          this.updateSelectionRules(defaultUsername);

          // 根据默认用户自动选择部门
          this.loadDeptByUserId(defaultUser.userId);
        }
      });
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
    // 获取占位符文本
    getPlaceholderText() {
      if (this.currentSelectionLimit === 2) {
        return '请选择部门和人员（主任不可删除）';
      } else {
        return '请选择部门和人员';
      }
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
    //     this.updateTreeDisabled(this.deptUserTreeOptions, hasSelection);
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
    getDepartmentManagers() {
      getDeptLeaderUserTreeList().then(res => {
        const managers = [];
        const traverse = dept => {
          if (dept.userList && dept.userList.length > 0) {
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
        res.data.forEach(dept => traverse(dept));
        this.departmentManagers = managers;
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

      let shouldFilter = false;
      let allowedDeptIds = [];
      if (this.putEditStatus === null) {
        // 新建时只显示 103, 102
        shouldFilter = true;
        allowedDeptIds = ['103', '102'];
      } else if (this.putEditStatus === 1 || this.putEditStatus === 3) {
        // 综合部经理审批 或 综合部文秘岗分发 时显示 103, 102, 2841
        shouldFilter = true;
        allowedDeptIds = ['103', '102', '2841'];
      }

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
    loadDeptByUserId(userId) {
      // 根据用户ID查找用户信息，获取部门ID
      const user = this.nextReviewerUsers.find(u => u.userId === userId);
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
    getFileName(filePath) {
      if (!filePath) return '';
      return filePath.split('/').pop();
    },
    // 获取不带后缀名的文件名（用于显示）
    getDisplayFileName(filePath) {
      if (!filePath) return '未知文件';
      const fileName = filePath.split('/').pop();
      const lastDotIndex = fileName.lastIndexOf('.');
      return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    },
    getAttachmentList(attachmentStr) {
      if (!attachmentStr) return [];
      // 如果包含逗号，按逗号分割；否则返回包含单个文件的数组
      return attachmentStr.includes(',') ? attachmentStr.split(',') : [attachmentStr];
    },
    getDetail(id) {
      dispatchAllDetails({ id }).then(response => {
        const { document, documentProcessList, putEdit } = response.data;
        getDocumentImageList({ documentId: id }).then(res => {
          this.getUploadFiles = res.data || [];
        });

        this.putEditStatus = putEdit;
        if (putEdit === 1) {
          this.setDefaultReviewer('zxzr1');
        } else if (putEdit === 7) {
          this.setDefaultReviewer('zhwm1');
        }
        this.form.superiorDocNumber = document.secrecy;
        this.form.incomingDocNumber = document.urgencyLevel;
        this.form.type = document.type !== null && document.type !== undefined ? String(document.type) : '';
        this.form.wordSize = document.wordSize;
        this.form.originalDocDate = document.writtenDate;
        this.form.receivedDate = document.draftDate ? document.draftDate.split(' ')[0] : '';
        this.form.originatingUnit = document.cc;
        this.form.title = document.title;
        this.form.text = document.text || '';
        this.form.attachments = document.filePath || '';
        this.form.issuingAgency = document.issuingAgency || '';

        this.form.remarks = document.remark;

        // 反显创建人信息
        if (document.createId) {
          console.log(document.createId, 'document.createId');
          // 直接使用documentProcessList中的nickName字段
          const creatorProcess = documentProcessList.find(p => p.userId === document.createId);
          this.form.creator = creatorProcess ? creatorProcess.nickName || '未知' : '未知';
          console.log(this.form.creator, 'this.form.creator');
        }

        if (documentProcessList && documentProcessList.length > 0) {
          // 生成处理流程列表
          this.processingProgressList = documentProcessList.map((p, index) => ({
            no: index + 1,
            item: p.returnRemark,
            handler: p.nickName || '未知',
            time: p.processTime,
            notApprovedUserNames: p.notApprovedUserNames ? '未处理' : '已处理'
          }));

          const records = [];
          documentProcessList.forEach(p => {
            // 添加空值检查，避免 returnRemark 为 null 时的错误
            if (!p.returnRemark) {
              return;
            }

            if (p.returnRemark.includes('主任审核通过')) {
              this.form.directorInstruction = p.remark;
              this.form.directorHandler = p.nickName || '未知';
              this.form.directorDate = p.processTime ? p.processTime.split(' ')[0] : '';
              this.form.directorTime = p.processTime ? p.processTime.split(' ')[1] : '';
            } else if (p.returnRemark.includes('综合部经理审核通过')) {
              this.form.comprehensiveOpinion = p.remark;
              this.form.comprehensiveHandler = p.nickName || '未知';
              this.form.comprehensiveDate = p.processTime ? p.processTime.split(' ')[0] : '';
              this.form.comprehensiveTime = p.processTime ? p.processTime.split(' ')[1] : '';
            } else if (p.returnRemark.includes('公文分发')) {
              this.form.leadDeptOpinion = p.remark;
              this.form.leadDeptHandler = p.nickName || '未知';
              this.form.leadDeptDate = p.processTime ? p.processTime.split(' ')[0] : '';
              this.form.leadDeptTime = p.processTime ? p.processTime.split(' ')[1] : '';
              // 反显附件
              this.form.managerAttachment = p.attachment || '';
            } else if (p.returnRemark.includes('收文部门经理分发部门人员完成') || p.returnRemark.includes('收文部门人员阅读完成')) {
              records.push({
                id: p.id,
                text: p.remark ? `${p.remark}` : p.returnRemark,
                handler: p.nickName || '未知',
                date: p.processTime ? p.processTime.split(' ')[0] : '',
                time: p.processTime ? p.processTime.split(' ')[1] : ''
              });
              if (p.deptId == '103') {
                this.form.comprehensiveRecords.push({
                  id: p.id,
                  text: p.remark ? `${p.remark}` : p.returnRemark,
                  handler: p.nickName || '未知',
                  date: p.processTime ? p.processTime.split(' ')[0] : '',
                  time: p.processTime ? p.processTime.split(' ')[1] : ''
                });
              } else {
                this.form.otherRecords.push({
                  id: p.id,
                  text: p.remark ? `${p.remark}` : p.returnRemark,
                  handler: p.nickName || '未知',
                  date: p.processTime ? p.processTime.split(' ')[0] : '',
                  time: p.processTime ? p.processTime.split(' ')[1] : ''
                });
              }
            }
          });
          this.form.processingRecords = records;

          const lastProcess = documentProcessList[documentProcessList.length - 1];
          if (lastProcess && lastProcess.returnRemark && lastProcess.returnRemark.includes('办结')) {
            this.form.completionTime = lastProcess.processTime;
          }
        }
      });
    },
    fetchUserPermissions() {
      getUserPermission('document:leader:user').then(res => {
        this.userPermissions.isDocumentLeader = res.code === 200 && res.data;
      });
      this.userPermissions.canDepartmentReadConfirm = this.hasPermission('project:document:departmentReadConfirm');
    },
    hasPermission(permission) {
      return this.permissions.some(p => p === permission);
    },
    getCurrentDeptUsers() {
      if (this.userInfo && this.userInfo.deptId) {
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
    previewFile(file) {
      if (!file || !file.url) return;
      const baseUrl = conf.server.baseUrl;
      const fileUrl = baseUrl + file.url;
      const fileName = file.name;
      const fileExt = fileName.split('.').pop().toLowerCase();
      this.$refs.viewFileRef.openDialog(fileUrl, fileExt);
    },
    handleSelectPhrase(type, phrase) {
      switch (type) {
        case 'director':
          this.form.directorInstruction = (this.form.directorInstruction || '') + phrase;
          break;
        case 'comprehensive':
          this.form.comprehensiveOpinion = (this.form.comprehensiveOpinion || '') + phrase;
          break;
        case 'leadDept':
          this.form.leadDeptOpinion = (this.form.leadDeptOpinion || '') + phrase;
          break;
        case 'dept':
          this.form.deptOpinion = (this.form.deptOpinion || '') + phrase;
          break;
        case 'read':
          this.form.readOpinion = (this.form.readOpinion || '') + phrase;
          break;
      }
    },
    handleCollected() {
      this.$modal.msgSuccess('收藏成功');
    },
    handleComplete() {
      const docId = this.$route.query.id;
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
          // 参考列表页的综合岗办结逻辑
          return officialDocumentHasBeenCompleted({
            docId: docId,
            documentRemark: this.form.remarks
          });
        })
        .then(() => {
          this.$modal.msgSuccess('办结成功');
          this.$router.push('/document/documentReceive');
        })
        .catch(() => { });
    },
    handleSubmit() {
      this.$refs.documentForm.validate(valid => {
        if (valid) {
          const payload = {
            secrecy: this.form.superiorDocNumber,
            urgencyLevel: this.form.incomingDocNumber,
            title: this.form.title,
            text: this.form.text,
            cc: this.form.originatingUnit,
            type: parseInt(this.form.type),
            receivedIds: this.form.nextReviewer.join(','),
            writtenDate: this.form.originalDocDate,
            filePath: this.form.attachments,
            documentRemark: this.form.remarks,
            issuingAgency: this.form.issuingAgency
          };

          addDocument(payload).then(res => {
            if (this.uploadFiles && this.uploadFiles.length > 0) {
              const documentSaveObj = this.uploadFiles.map(item => ({
                document_id: res.data,
                url: item.urlBack,
                file_name: item.name,
                edit: false
              }));
              if (res.data) {
                documentImageSave(documentSaveObj).then(ress => {
                  console.log('🚀 ~ ress ~ :', ress);
                });
              }
            }

            this.$modal.msgSuccess('新增成功');
            this.$router.push('/document/documentReceive');
          });
        } else {
          this.$message.error('请完善必填信息');
        }
      });
    },
    handleProcess() {
      console.log('🚀 ~ this.form.deptDistribution ~ :', this.form.deptDistribution)
      this.$refs.documentForm.validate(valid => {
        if (valid) {
          const docId = this.$route.query.id;
          let promise;
          switch (this.putEditStatus) {
            case 1: // 综合部经理审批
              const comprehensivePayload = {
                docId: docId,
                remark: this.form.comprehensiveOpinion,
                status: this.form.comprehensiveStatus,
                documentRemark: this.form.remarks
              };
              if (this.form.comprehensiveStatus === '1' && this.form.nextReviewer && this.form.nextReviewer.length > 0) {
                comprehensivePayload.directorIds = this.form.nextReviewer.join(',');
              }
              promise = documentReceivingComprehensive(comprehensivePayload);
              break;
            case 2: // 主任岗审核
              promise = documentReceivingDirectorCheck({
                docId: docId,
                status: this.form.directorStatus,
                remark: this.form.directorInstruction,
                documentRemark: this.form.remarks
              });
              break;
            case 3: // 综合部文秘岗分发
              if (!this.form.deptDistribution || this.form.deptDistribution.length === 0) {
                this.$message.error('请选择分发人员');
                return;
              }
              promise = documentReceivingLeaderDistribute({
                docId: docId,
                // userIds: this.form.deptDistribution && this.form.deptDistribution.join(','),
                userIds: `${this.form.deptDistribution},${this.form.deptDistribution1.join(',')}`,
                remark: this.form.leadDeptOpinion,
                attachment: this.form.managerAttachment || '',
                documentRemark: this.form.remarks
              });
              break;
            case 4: // 部门经理分发
              if (!this.form.staffDistribution || this.form.staffDistribution.length === 0) {
                this.$message.error('请选择分发人员');
                return;
              }
              promise = dispatchDepartmentSelect({
                docId: docId,
                userIds: this.form.staffDistribution.join(','),
                remark: this.form.deptOpinion || ''
              });
              break;
            case 7: // 收文创建人修改并重新提交
              const resubmitPayload = {
                id: docId,
                secrecy: this.form.superiorDocNumber,
                urgencyLevel: this.form.incomingDocNumber,
                title: this.form.title,
                text: this.form.text,
                cc: this.form.originatingUnit,
                type: this.form.type ? parseInt(this.form.type) : undefined,
                writtenDate: this.form.originalDocDate,
                filePath: this.form.attachments,
                receivedIds: this.form.nextReviewer.join(','),
                documentRemark: this.form.remarks,
                issuingAgency: this.form.issuingAgency
              };
              promise = submitDraft(resubmitPayload);
              break;
            default:
              this.$message.error('未知的处理状态');
              return;
          }

          if (promise) {
            promise.then(() => {
              this.$modal.msgSuccess('处理成功');
              this.$router.push('/document/documentReceive');
            });
          }
        } else {
          this.$message.error('请完善必填信息');
        }
      });
    },
    validateNextReviewer(rule, value, callback) {
      // 新建时始终需要；综合部经理审批时仅在“通过”时需要
      const needsReviewer = this.isNew || (this.putEditStatus === 1 && this.form.comprehensiveStatus === '1') || this.putEditStatus === 7;
      if (needsReviewer) {
        if (Array.isArray(value) && value.length > 0) return callback();
        return callback(new Error('请选择下一审核人'));
      }
      return callback();
    },
    handleConfirmRead() {
      const docId = this.$route.query.id;
      const payload = {
        docId: docId,
        remark: this.form.readOpinion || ''
      };
      documentReceivingUserConfirm(payload).then(res => {
        this.$modal.msgSuccess('操作成功');
        this.$router.push('/document/documentReceive');
      });
    },
    handleExit() {
      // 退出逻辑
      this.$router.go(-1);
    },
    showReadButton() {
      // 显示已阅按钮的条件：只有状态5时部门成员且有相应权限才显示
      return this.putEditStatus === 5;
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
          this.$message.warning('用户不可删除');
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
    handleSubmitAction() {
      if (this.isNew) {
        this.handleSubmit();
      } else {
        this.handleProcess();
      }
    },
    handleApprove() {
      // 设置状态为通过，然后执行处理逻辑
      if (this.putEditStatus === 1) {
        this.form.comprehensiveStatus = '1';
      } else if (this.putEditStatus === 2) {
        this.form.directorStatus = '1';
      }
      this.handleProcess();
    },
    handleReject() {
      // 设置状态为退回，然后执行处理逻辑
      if (this.putEditStatus === 1) {
        this.form.comprehensiveStatus = '2';
      } else if (this.putEditStatus === 2) {
        this.form.directorStatus = '2';
      }
      this.handleProcess();
    },
    confirmPrint() {

      const printContent = document.getElementById('printArea').outerHTML;
      const printWindow = window.open(
        '',
        '_blank',
      );
      printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title></title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin:0;
          background:#fff;
          font-family:
          "Microsoft YaHei",
          Arial,
          sans-serif;

        }
        .dialogVisible-wrap {
          padding: 40px 40px 0 40px;

          /* ========== 对话框标题样式 ========== */
          .record-list{
            padding: 5px;
          }
          .dialog-title {
            font-size: 30px;
            text-align: center;
            letter-spacing: 4px;
            color: red;
          }

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

          .docSignWord-table {
            width: 100%;
            border: 1px solid #000;
            margin-bottom: 0;
            display: flex;
            text-align: center;
            flex-wrap: wrap;
            border-left: none;
            border-right: none;
          }

          .docSignWord-table1 {
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

          .docSignWord-table-item {
            display: flex;
            width: 50%;
            height: 40px;
          }

          .docSignWord-table-item-unit {
            display: flex;
            width: 100%;
            height: 40px;
          }

          .docSignWord-label-cell {
            color: red;
            white-space: nowrap;
            text-align: left;
            width: 110px;
            padding: 5px 0;
          }

          .label-cell-unit {
            color: red;
            white-space: nowrap;
            text-align: left;
            width: 110px;
            padding: 5px 0;
          }

          .docSignWord-input-cell {
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

          .docSignWord-div {
            padding: 5px 0;
            border-bottom: 1px solid #000;
          }

          .docSignWord-div-wrap {
            padding: 5px 0;
            border-bottom: 1px solid #000;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .docSignWord-div-handle {
            display: flex;
            justify-content: space-between;
          }

          .docSignWord-title-cell {
            color: red;
            white-space: nowrap;
            text-align: left;
          }

          .docSignWord-title-input {
            white-space: nowrap;
            text-align: left;
            min-height: 60px;
          }

          .docSignWord-title-input1 {
            white-space: nowrap;
            text-align: left;
            min-height: 40px;
          }

          .docSignWord-title-input2 {
            white-space: nowrap;
            text-align: left;
          }

          .docSignWord-zhu {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #000;
          }

          .docSignWord-zhu-cell {
            color: red;
            white-space: nowrap;
            text-align: left;
          }

          .docSignWord-zhu-input {
            white-space: nowrap;
            text-align: left;
          }

          .docSignWord-ban {
            display: flex;
            border-bottom: 1px solid #000;
          }

          .docSignWord-ban-item1 {
            display: flex;
            width: 100%;
            flex-direction: column;
          }

          .docSignWord-ban-item1 .handler-info {
            flex-shrink: 0;
          }

          .docSignWord-ban-item {
            display: flex;
            width: 50%;
            border-right: 1px dashed #ccc;
            flex-direction: column;
          }

          .docSignWord-ban-item2 {
            display: flex;
            width: 50%;
            flex-direction: column;
          }

          .docSignWord-ban-cell {
            color: red;
            white-space: nowrap;
            text-align: left;

            padding: 5px;
            border-bottom: 1px dashed #ccc;
          }

          .docSignWord-ban-input {
            text-align: left;
            min-height: 80px;
            padding: 5px 0;
            flex-wrap: wrap;
            display: flex;
            word-break: break-word;
          }

          .docSignWord-ban-item .docSignWord-ban-input {
            padding: 5px;
          }

          .record-text {
            margin-right: 10px;
          }

          .docSignWord-time {
            display: flex;
            border-bottom: 1px solid #000;
          }

          .docSignWord-time-item1 {
            flex: 1;
            display: flex;
            padding: 5px 0;
            gap: 5px;
            border-right: 1px solid #000;
          }

          .docSignWord-time-item2 {
            flex: 1;
            display: flex;
            padding: 5px 5px 0 5px;
            gap: 5px;
            border-right: 1px solid #000;
          }

          .docSignWord-time-item3 {
            flex: 1;
            display: flex;
            padding: 5px 5px 0 5px;
            gap: 5px;
          }

          .docSignWord-time-cell {
            color: red;
            white-space: nowrap;
            text-align: left;
          }

          .docSignWord-time-input {
            text-align: left;
          }
        }

        #printArea {

          width:794px;

          margin:0 auto;

          background:#fff;

        }
        .dialog-title {
          text-align:center;
          font-size:20px;
          font-weight:bold;
          margin-bottom:20px;
        }
        /* 保留你的原打印样式 */
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `);

      printWindow.document.close();
      printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
      };

    },

    closePreview() {
      // 清理资源
      this.printImage = null;
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

.attachment-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  cursor: pointer;
  font-size: 14px;
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

.read-button-wrapper .el-button {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #fff !important;
}

.read-button-wrapper .el-button:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
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

.locked-reviewer-tip {
  margin-top: 8px;
  padding: 4px 8px;
  background-color: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  color: #1e40af;
  font-size: 12px;
}

.locked-reviewer-tip i {
  margin-right: 4px;
}

.file-name {
  flex: 1;
  color: #606266;
}

.approval-section {
  position: relative;
}

.approval-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.next-reviewer {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.next-reviewer-label {
  color: #f56c6c;
  font-weight: 500;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.dept-distribution {
  margin-top: 8px;
}

.dept-distribution-wrap {
  display: flex;
  align-items: center;
  gap: 30px;
}

.dept-distribution-content {
  display: flex;
  width: 50%;
  align-items: center;
  gap: 8px;
}

.dept-distribution-label {
  color: #333;
  font-weight: 500;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  white-space: nowrap;
  flex-shrink: 0;
}

.dept-distribution-content .el-select {
  flex: 1;
  min-width: 0;
}

.handler-info {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  padding: 4px 8px;
  /* background: #f5f7fa; */
  border-radius: 4px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  text-align: right;
}

.handler-time {
  font-size: 12px;
  color: #666;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.processing-record {
  margin-top: 8px;
}

.record-label {
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.record-list {
  /* background: #f5f7fa; */
  border-radius: 4px;
  padding: 0 10px;
  /* border: 1px solid #ddd; */
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  gap: 5px;
}

.record-item:last-child {
  border-bottom: none;
}

.record-text {
  color: #333;
  font-size: 14px;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.record-info {
  font-size: 12px;
  color: #666;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
}

.read-section {
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.read-button-wrapper {
  text-align: center;
  margin-top: 12px;
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

.processing-progress-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  border: 1px solid #ddd;
}

.processing-progress-section h3 {
  color: #000;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  font-family: 'Microsoft YaHei', 'SimSun', serif;
  text-align: center;
}

.common-phrases-content {
  padding: 20px 0;
}

.phrase-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.phrase-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.phrase-tag:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .document-form-container {
    padding: 15px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .next-reviewer,
  .dept-distribution-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 禁用状态的输入框背景色设为白色 */
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

::v-deep .el-textarea .el-textarea__inner {
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



.dialogVisible-wrap {
  padding: 40px 40px 0 40px;

  /* ========== 对话框标题样式 ========== */
  .dialog-title {
    font-size: 30px;
    text-align: center;
    letter-spacing: 4px;
    color: red;
  }

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

  .docSignWord-table {
    width: 100%;
    border: 1px solid #000;
    margin-bottom: 0;
    display: flex;
    text-align: center;
    flex-wrap: wrap;
    border-left: none;
    border-right: none;
  }

  .docSignWord-table1 {
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

  .docSignWord-table-item {
    display: flex;
    width: 50%;
    height: 40px;
  }

  .docSignWord-table-item-unit {
    display: flex;
    width: 100%;
    height: 40px;
  }

  .docSignWord-label-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
    width: 110px;
    padding: 5px 0;
  }

  .label-cell-unit {
    color: red;
    white-space: nowrap;
    text-align: left;
    width: 110px;
    padding: 5px 0;
  }

  .docSignWord-input-cell {
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

  .docSignWord-div {
    padding: 5px 0;
    border-bottom: 1px solid #000;
  }

  .docSignWord-div-wrap {
    padding: 5px 0;
    border-bottom: 1px solid #000;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .docSignWord-div-handle {
    display: flex;
    justify-content: space-between;
  }

  .docSignWord-title-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
  }

  .docSignWord-title-input {
    white-space: nowrap;
    text-align: left;
    min-height: 60px;
  }

  .docSignWord-title-input1 {
    white-space: nowrap;
    text-align: left;
    min-height: 40px;
  }

  .docSignWord-title-input2 {
    white-space: nowrap;
    text-align: left;
  }

  .docSignWord-zhu {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid #000;
  }

  .docSignWord-zhu-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
  }

  .docSignWord-zhu-input {
    white-space: nowrap;
    text-align: left;
  }

  .docSignWord-ban {
    display: flex;
    border-bottom: 1px solid #000;
  }

  .docSignWord-ban-item1 {
    display: flex;
    width: 100%;
    flex-direction: column;
  }

  .docSignWord-ban-item1 .handler-info {
    flex-shrink: 0;
  }

  .docSignWord-ban-item {
    display: flex;
    width: 50%;
    border-right: 1px dashed #ccc;
    flex-direction: column;
  }

  .docSignWord-ban-item2 {
    display: flex;
    width: 50%;
    flex-direction: column;
  }

  .docSignWord-ban-cell {
    color: red;
    white-space: nowrap;
    text-align: left;

    padding: 5px;
    border-bottom: 1px dashed #ccc;
  }

  .docSignWord-ban-input {
    text-align: left;
    min-height: 80px;
    padding: 5px 0;
    flex-wrap: wrap;
    display: flex;
    word-break: break-word;
  }

  .docSignWord-ban-item .docSignWord-ban-input {
    padding: 5px;
  }

  .record-text {
    margin-right: 10px;
  }

  .docSignWord-time {
    display: flex;
    border-bottom: 1px solid #000;
  }

  .docSignWord-time-item1 {
    flex: 1;
    display: flex;
    padding: 5px 0;
    gap: 5px;
    border-right: 1px solid #000;
  }

  .docSignWord-time-item2 {
    flex: 1;
    display: flex;
    padding: 5px 5px 0 5px;
    gap: 5px;
    border-right: 1px solid #000;
  }

  .docSignWord-time-item3 {
    flex: 1;
    display: flex;
    padding: 5px 5px 0 5px;
    gap: 5px;
  }

  .docSignWord-time-cell {
    color: red;
    white-space: nowrap;
    text-align: left;
  }

  .docSignWord-time-input {
    text-align: left;
  }
}

.docSignWord-fu {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
}

.docSignWord-fu-cell {
  color: red;
  white-space: nowrap;
  text-align: left;
}

.docSignWord-fu-input {
  white-space: nowrap;
  text-align: left;
  min-height: 30px;
}

.docSignWord-btn {
  margin-top: 10px;
  padding: 0px 50px;
  display: flex;
  justify-content: flex-end;
}



.print-area {
  position: fixed;
  left: -99999px;
  top: 0;
  width: 794px;
}

/* 打印时 */
@media print {

  body * {
    visibility: hidden;
  }

  #printArea,
  #printArea * {
    visibility: visible;
  }

  #printArea {
    position: absolute;
    left: 0;
    top: 0;
    width: 794px !important;
    background: #fff;

  }

}
</style>
