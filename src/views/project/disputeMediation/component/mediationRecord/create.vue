<!-- 新增调解记录 -->
<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" width="92%" :show-close="false"
      class="mediation-dialog" :class="{ 'mediation-dialog--script-open': smartScriptVisible }">
      <!-- <template #title>
        <div>
          <span class="el-dialog__title">{{ title }}</span>
          添加按钮
          <div class="top-right-btn" style="margin-right: 30px; margin-top: -5px">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <i class="el-icon-minus hover-icon" style="margin-top: 5px" @click="minimize"/>
              </el-col>
            </el-row>
          </div>
        </div>
      </template> -->
      <div class="mediation-wrapper">
        <div class="mediation-main">
          <el-row class="mediation-main-body">
            <el-col class="dialog-left" :span="13">
              <div class="dialog-title">
                <span>{{ title }}</span>
                <p>
                  <i class="el-icon-minus hover-icon" @click="minimize" />
                  <i class="el-icon-close" @click="cancel" />
                </p>
              </div>
              <div style="padding: 0 20px">
                <record-form ref="mediationRecordForm" :initial-data="formData" :row="row" />
              </div>
              <el-divider />
              <el-descriptions title="双方信息" :column="2" border style="margin-left: 20px; margin-right: 20px">
                <el-descriptions-item label="消费者代理人姓名" v-if="SYS_YES_NO.sys_no === row.isSelf">
                  {{ row.agentName }}
                </el-descriptions-item>
                <el-descriptions-item label="消费者代理人联系方式" v-if="SYS_YES_NO.sys_no === row.isSelf">
                  {{ row.agentPhone }}
                  <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.agentPhone"
                    style="margin-left: 5px"
                    @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.agentPhone })" />
                </el-descriptions-item>
                <el-descriptions-item label="消费者姓名">
                  {{ row.name }}
                </el-descriptions-item>
                <el-descriptions-item label="消费者联系方式">
                  {{ row.phone }}
                  <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.phone"
                    style="margin-left: 5px"
                    @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.phone })" />
                </el-descriptions-item>
                <el-descriptions-item label="机构联系人">
                  {{ row.deptLeader }}
                </el-descriptions-item>
                <el-descriptions-item label="机构联系电话">
                  {{ row.deptPhone }}
                  <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.deptPhone"
                    style="margin-left: 5px"
                    @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.deptPhone })" />
                </el-descriptions-item>
                <el-descriptions-item label="机构代表姓名">
                  {{ row.deptContact }}
                </el-descriptions-item>
                <el-descriptions-item label="机构代表联系方式">
                  {{ row.deptContactPhone }}
                  <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.deptContactPhone"
                    style="margin-left: 5px"
                    @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.deptContactPhone })" />
                </el-descriptions-item>
                <el-descriptions-item label="机构业务经办人员"
                  v-if="DEPT_TYPE.bankList.includes(this.row.deptType) || DEPT_TYPE.nonBankList.includes(this.row.deptType)">
                  {{ row.deptHandlerName }}
                </el-descriptions-item>
                <el-descriptions-item label="机构业务经办人员联系电话"
                  v-if="DEPT_TYPE.bankList.includes(this.row.deptType) || DEPT_TYPE.nonBankList.includes(this.row.deptType)">
                  {{ row.deptHandlerPhone }}
                  <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.deptHandlerPhone"
                    style="margin-left: 5px"
                    @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.deptHandlerPhone })" />
                </el-descriptions-item>
              </el-descriptions>

              <div class="dialog-footer">
                <el-button type="primary" @click="submitForm" :loading="btnLoading">提 交</el-button>
                <el-button @click="cancel">取 消</el-button>
              </div>
            </el-col>
            <el-col class="dialog-right" :span="11">
              <div class="right-t">
                <div class="t-title">填写调解信息</div>
                <el-form ref="form" :model="diaputeForm" label-width="120px" hide-required-asterisk>
                  <div>
                    <div class="region-title">*新增调解记录</div>
                    <el-row class="line-row">
                      <el-col :span="24">
                        <el-form-item label="调解记录" prop="record">
                          <el-input v-model="diaputeForm.record" type="textarea" placeholder="请输入调解记录" maxlength="2000"
                            :autosize="{ minRows: 2, maxRows: 4 }" show-word-limit />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row class="line-row">
                      <el-col :span="12">
                        <el-form-item label="调解金额" prop="mediationAmount">
                          <el-input v-model="diaputeForm.mediationAmount" placeholder="请输入金额" show-word-limit>
                            <template #append>元</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row class="line-row">
                      <el-col :span="24">
                        <el-form-item label="调解过程中发现的其他问题" prop="otherProblem">
                          <el-input v-model="diaputeForm.otherProblem" type="textarea" placeholder="请输入调解过程中发现的其他问题"
                            maxlength="2000" :autosize="{ minRows: 2, maxRows: 4 }" show-word-limit />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <!-- <el-row class="line-row">
                  <el-col :span="24">
                    <el-form-item label="最终达成的其他调解事项" prop="otherAgreedMediationTerms">
                      <el-input v-model="diaputeForm.otherAgreedMediationTerms" type="textarea"
                        placeholder="请输入最终达成的其他调解事项" maxlength="2000" :autosize="{ minRows: 2, maxRows: 4 }"
                        show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row> -->
                  </div>
                </el-form>
                <div class="confirm-btn">
                  <el-button @click="handelCoverForm">确认信息，自动覆盖</el-button>
                </div>
                <div v-if="!smartScriptSessionEnded" class="smart-script-trigger">
                  <el-button size="small" :type="smartScriptVisible ? 'info' : 'primary'" icon="el-icon-chat-dot-round"
                    @click="toggleSmartScript">
                    智能话术
                  </el-button>
                </div>
              </div>
              <div class="right-b" ref="rightB">
                <div class="right-b-chat">
                  <div v-for="(item, index) in sseList" :key="index" class="socket-item">
                    <div class="socket-l" v-if="item.role === '调解员'">
                      <div class="person-info">
                        <p class="name">调解员</p>
                        <img class="avatar" src="@/assets/images/form-avatar.png" alt="" />
                      </div>
                      <div class="person-message">
                        <span>{{ item.message }}</span>
                      </div>
                    </div>
                    <div class="socket-r" v-if="item.role === '投诉人'">
                      <div class="person-message">
                        <span>{{ item.message }}</span>
                      </div>
                      <div class="person-info">
                        <p class="name">客户</p>
                        <img class="avatar" src="@/assets/images/form-avatar.png" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-if="smartScriptVisible" class="dialog-script">
          <smart-script-panel :panel-data="smartScriptData" :loading="smartScriptLoading"
            :script-regenerating="smartScriptRegenerating" @regenerate="handleSmartScriptRegenerate"
            @close="closeSmartScriptPanel" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addMediationRecord,
  SSEGetFromData,
  getAsrStreamUrl,
  saveCallQualityWorkOrder,
  saveCallTranscriptDetail,
  updateCallQualityWorkOrder,
  getMediationRecordExpandInfo,
  saveOrUpdateMediationRecordExpand
} from '@/api/project/disputeMediation';
import { analyzeTypicalChat } from '@/api/ocr';
import { parseTime } from '@/utils/ruoyi';
import recordForm from './formInfo.vue';
import SmartScriptPanel from './smartScriptPanel.vue';
import { DEPT_TYPE, SYS_YES_NO } from '@/views/constant/CommonConstant';
import { v4 as uuidv4 } from 'uuid';
export default {
  name: '',
  props: ['title'],
  components: {
    recordForm,
    SmartScriptPanel
  },
  data() {
    return {
      row: {},
      dialogVisible: false,
      btnLoading: false,
      formData: {
        workOrderId: null,
        participant: null
      },
      // extn: this.$callWs.state.formData.ola_extn,
      extn: this.$store.getters.userInfo.seatNum ? this.$store.getters.userInfo.seatNum.toString().slice(5, 8) : '',
      // 常量
      SYS_YES_NO: SYS_YES_NO, // 是否
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      diaputeForm: {},
      eventSource: null,
      sseTimeout: null,
      getDataInterval: null,
      sseList: [],
      formId: null,
      minisize: false,
      callQualityWorkOrderId: null,
      hadCallAttemptFlag: false,
      callAnsweredFlag: false,
      callEndHandled: false,
      callQualityRecordLinked: false,
      callStartPromise: null,
      callTranscriptDetailSaved: false,
      pendingSseEnd: false,
      phoneWasConnectedFlag: false,
      smartScriptVisible: false,
      smartScriptLoading: false,
      smartScriptRegenerating: false,
      smartScriptTimer: null,
      smartScriptSessionEnded: false,
      smartScriptData: null
    };
  },
  created() { },
  mounted() { },
  watch: {
    dialogVisible(nVal, oVal) {
      if (this.minisize) {
        return;
      }
      if (!this.minisize) {
        if (nVal) {
          this.$nextTick(() => {
            this.formId = uuidv4();
            clearTimeout(this.sseTimeout);
            clearInterval(this.getDataInterval);
            this.getDataInterval = null;
            this.run = false;
            this.calculateRightBHeight();
            this.sseList = [];
            this.initSSE();
          });
        } else {
          if (this.eventSource) {
            clearTimeout(this.sseTimeout);
            if (this.eventSource) {
              this.eventSource.close();
            }
            clearInterval(this.getDataInterval);
            this.getDataInterval = null;
            this.diaputeForm = {};
            this.run = false;
            console.log('SSE 连接已关闭');
          }
          this.callQualityWorkOrderId = null;
          this.hadCallAttemptFlag = false;
          this.callAnsweredFlag = false;
          this.callEndHandled = false;
          this.callQualityRecordLinked = false;
          this.callStartPromise = null;
          this.callTranscriptDetailSaved = false;
          this.pendingSseEnd = false;
          this.phoneWasConnectedFlag = false;
          this.smartScriptVisible = false;
          this.smartScriptSessionEnded = false;
          this.smartScriptData = null;
          this.stopSmartScriptPolling();
        }
      }
      if (nVal) {
        this.$nextTick(() => this.$refs.mediationRecordForm.refreshTime());
      }
    },
    smartScriptVisible() {
      this.$nextTick(() => this.calculateRightBHeight());
    },
    '$store.state.settings.callInfo.data': {
      handler(data) {
        if (data && data.state === 'acw' && this.isMediationCallSessionActive()) {
          if (this.phoneWasConnectedFlag || this.isCallAnswered()) {
            this.triggerCallEndOnHangUp('acw');
          }
        }
        this.trackCallAttemptFromPhoneState(data);
      },
      deep: true
    }
  },
  methods: {
    open(row, form) {
      this.row = row;
      if (form) {
        this.formData = form;
      } else {
        this.formData.workOrderId = row.workOrderId;
        this.formData.participant = row.mediatorName + ',' + row.assistantName;
        this.callQualityWorkOrderId = null;
        this.hadCallAttemptFlag = false;
        this.callAnsweredFlag = false;
        this.callEndHandled = false;
        this.callQualityRecordLinked = false;
        this.callStartPromise = null;
        this.callTranscriptDetailSaved = false;
        this.pendingSseEnd = false;
        this.phoneWasConnectedFlag = false;
        this.formData.deptType = row.deptType;
      }

      this.dialogVisible = true;
    },
    cancel() {
      this.dialogVisible = false;
      this.minisize = false;
      this.reset();
    },
    minimize(event) {
      this.$emit(
        'minimize',
        '新增调解记录:' + this.row.workOrderId,
        { row: this.row, form: { ...this.$refs.mediationRecordForm.getFormData() } },
        '新增调解记录',
        'success',
        event.clientX,
        event.clientY
      );
      this.minisize = true;
      this.dialogVisible = false;
      this.reset();
    },
    reset() {
      this.$refs.mediationRecordForm.resetForm();
      this.formData = {
        workOrderId: null,
        participant: null
      };
    },

    // 提交
    async submitForm() {
      try {
        const isValid = await this.$refs.mediationRecordForm.validateForm();
        if (!isValid) {
          console.log('error submit!!');
          return false;
        }
        this.btnLoading = true;
        if (this.isCallAnswered()) {
          await this.finalizeCallOnSubmitIfNeeded();
        }
        const childrenFormData = this.$refs.mediationRecordForm.getFormData();
        childrenFormData.time = parseTime(childrenFormData.time, '{y}-{m}-{d} {h}:{i}:{s}');
        childrenFormData.workOrderId = this.formData.workOrderId;

        const { caseLable, otherAgreedMediationTerms, agreedReductionAmount, ...restChildrenFormData } = childrenFormData;

        const res = await addMediationRecord(restChildrenFormData);
        if (res.code === 200) {
          const recordData = res.data || {};

          await saveOrUpdateMediationRecordExpand({
            mediationRecordId: recordData.mediationRecordId,
            workOrderId: this.row.workOrderId,
            manageDeptId: this.row.manageDeptId,
            otherAgreedMediationTerms,
            caseLable,
            agreedReductionAmount,
            mediatorUserId: this.row.mediatorUserId
          });
          if (this.shouldRunCallQualityLogic()) {
            await this.updateCallQualityWorkOrderForMediation({
              recordId: recordData.mediationRecordId,
              recordTime: recordData.time
            });
          }

          this.callQualityRecordLinked = true;
        }

        this.$modal.msgSuccess(res.msg);
        this.$emit('callback', 'b', this.row, true);
        this.cancel();
        this.$refs.mediationRecordForm.resetForm();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.btnLoading = false;
      }
    },
    calculateRightBHeight() {
      const dialogLeft = document.querySelector('.mediation-wrapper .dialog-left');
      const rightT = document.querySelector('.mediation-wrapper .right-t');
      const rightB = this.$refs.rightB || document.querySelector('.mediation-wrapper .right-b');
      if (dialogLeft && rightT && rightB) {
        const dialogLeftHeight = dialogLeft.clientHeight || dialogLeft.offsetHeight;
        const rightTHeight = rightT.clientHeight || rightT.offsetHeight;
        rightB.style.height = dialogLeftHeight - rightTHeight + 'px';
      }
    },
    async toggleSmartScript() {
      if (this.smartScriptSessionEnded) return;
      if (!this.isCallAnswered()) {
        this.$modal.msgWarning('当前暂无通话');
        return;
      }
      this.smartScriptVisible = !this.smartScriptVisible;
      if (this.smartScriptVisible) {
        await this.fetchSmartScriptAnalysis();
        this.startSmartScriptPolling();
      } else {
        this.stopSmartScriptPolling();
      }
    },
    closeSmartScriptPanel() {
      this.smartScriptVisible = false;
      this.stopSmartScriptPolling();
    },
    startSmartScriptPolling() {
      this.stopSmartScriptPolling();
      if (!this.smartScriptVisible || !this.isCallAnswered() || this.smartScriptSessionEnded) return;
      this.smartScriptTimer = setInterval(() => {
        this.fetchSmartScriptAnalysis({ silent: true });
      }, 10000);
    },
    stopSmartScriptPolling() {
      if (this.smartScriptTimer) {
        clearInterval(this.smartScriptTimer);
        this.smartScriptTimer = null;
      }
    },
    buildSmartScriptMessages() {
      return this.sseList
        .filter(d => d && String(d.message || '').trim())
        .map(d => ({
          role: this.mapRoleToTranscriptRole(d.role),
          content: String(d.message || '').trim(),
          timestamp: this.formatTranscriptTimestamp(d.timestamp)
        }));
    },
    async fetchSmartScriptAnalysis({ silent = false } = {}) {
      const messages = this.buildSmartScriptMessages();
      if (!messages.length) {
        if (!silent) {
          this.$modal.msgWarning('当前暂无可分析的通话内容');
        }
        return;
      }
      this.smartScriptLoading = !silent;
      this.smartScriptRegenerating = silent;
      try {
        const res = await analyzeTypicalChat({ messages });
        const body = res && res.data ? res.data : res;
        if (body && body.code === 200 && body.data) {
          this.smartScriptData = body.data;
          return;
        }
        throw new Error((body && (body.message || body.msg)) || '智能话术生成失败');
      } catch (error) {
        if (!silent) {
          this.$modal.msgError(error.message || '智能话术生成失败');
        }
      } finally {
        this.smartScriptLoading = false;
        this.smartScriptRegenerating = false;
      }
    },
    async handleSmartScriptRegenerate() {
      await this.fetchSmartScriptAnalysis();
      if (this.smartScriptVisible && this.isCallAnswered() && !this.smartScriptSessionEnded) {
        this.startSmartScriptPolling();
      }
    },
    completedCount() {
      return this.sseList.filter(d => d && (d.complete === true || d.complete === 'true')).length;
    },
    initSSE() {
      const nowFormId = this.formId;

      if (typeof EventSource !== 'undefined' && this.run === false) {
        const source = new EventSource(getAsrStreamUrl(this.extn));

        source.onmessage = event => {
          try {
            const resData = JSON.parse(event.data);
            if (resData.event === 'run') {
              if (!this.callAnsweredFlag) {
                this.handleSseCallStart();
              }
              const list = [...this.sseList];
              const { direction, complete, data } = resData;
              const role = String(direction) === '2' ? '投诉人' : '调解员';
              this.appendSseRunMessage(list, role, data, complete);
              this.sseList = list;
            } else if (resData.event === 'end') {
              this.pendingSseEnd = true;
              this.tryFlushPendingCallEnd('sse-end');
              if (this.getDataInterval) {
                clearInterval(this.getDataInterval);
                this.getDataInterval = null;
              }
              source.close();
              if (this.completedCount() >= 2) {
                this.fetchMediationFormFromSSE(
                  this.sseList.filter(d => d.complete),
                  nowFormId
                );
              } else if (this.run === false) {
                this.initSSE();
              }
            }
          } catch (error) {
            console.error('解析 SSE 数据失败:', error);
          }
        };
        source.onopen = () => {
          if (!this.getDataInterval && this.run === false) {
            this.getDataInterval = setInterval(() => {
              if (this.completedCount() >= 2) {
                this.run = true;
                this.fetchMediationFormFromSSE(
                  this.sseList.filter(d => d.complete),
                  nowFormId
                );
              }
            }, 60000);
          }
        };
        source.onerror = error => {
          if (source.readyState === EventSource.CLOSED && this.run === false) {
            clearTimeout(this.sseTimeout);
            this.sseTimeout = setTimeout(() => this.initSSE(), 3000);
          }
        };
        this.eventSource = source;
      } else {
        console.error('当前浏览器不支持 SSE');
      }
    },
    handelCoverForm() {
      this.$refs.mediationRecordForm.setFormInfo({ ...this.diaputeForm });
    },
    /** 调解记录弹框会话是否有效（含最小化） */
    isMediationCallSessionActive() {
      return this.dialogVisible || this.minisize;
    },
    /** 话务状态：弹框期间是否发起/接入过通话（含拨号中、振铃、未接听） */
    trackCallAttemptFromPhoneState(data) {
      if (!this.isMediationCallSessionActive()) return;
      if (this.isCallActivityData(data)) {
        this.hadCallAttemptFlag = true;
        if (this.isPhoneCallAnswered(data)) {
          this.phoneWasConnectedFlag = true;
          this.ensureCallAnsweredSession('phone-busy');
        }
      }
    },
    isCallActivityData(data) {
      return !!(data && data.state === 'busy');
    },
    /** 话务侧双方已接听（与 CallOut 展示逻辑一致，不依赖 ASR run） */
    isPhoneCallAnswered(data) {
      if (!data || data.state !== 'busy') return false;
      if (data.call_direction === 'outbound') {
        return data.private_data === 'answered' && data.other_answered === true;
      }
      if (data.call_direction === 'inbound') {
        return data.private_data === 'answered';
      }
      return false;
    },
    /** 弹框期间是否发起/接入过通话（含未接听） */
    hadCallInSession() {
      return this.hadCallAttemptFlag;
    },
    /** 弹框期间是否已接听（ASR 首次 run 表示双方接通） */
    isCallAnswered() {
      return this.callAnsweredFlag;
    },
    /** 是否应执行通话质检接口（已接听且质检工单已创建） */
    shouldRunCallQualityLogic() {
      return this.isCallAnswered() && this.callQualityWorkOrderId != null;
    },
    /** 话务挂机（acw）或 ASR end 到达时尝试立即执行挂断逻辑 */
    triggerCallEndOnHangUp(source) {
      this.pendingSseEnd = true;
      this.tryFlushPendingCallEnd(source);
    },
    /** 已接听且质检工单就绪时执行挂断逻辑；否则保留 pending 待后续刷新 */
    tryFlushPendingCallEnd(source) {
      if (!this.pendingSseEnd) return;
      if (!this.isMediationCallSessionActive() || !this.isCallAnswered()) return;
      if (this.callEndHandled || this.callQualityRecordLinked) {
        this.pendingSseEnd = false;
        return;
      }
      this.pendingSseEnd = false;
      this.handleSseCallEnd();
    },
    /** 标记已接听并创建质检工单（话务接听或 ASR run 均可触发） */
    ensureCallAnsweredSession(source) {
      if (!this.isMediationCallSessionActive() || this.callAnsweredFlag) return;
      this.hadCallAttemptFlag = true;
      this.callAnsweredFlag = true;
      this.callEndHandled = false;
      if (!this.callStartPromise) {
        this.callStartPromise = this.onCallStart().finally(() => {
          this.callStartPromise = null;
          if (this.pendingSseEnd) {
            this.tryFlushPendingCallEnd('call-start-done');
          }
        });
      }
      if (this.pendingSseEnd) {
        this.tryFlushPendingCallEnd(source);
      }
    },
    /** ASR 首次 run：通话接通，创建质检工单 */
    handleSseCallStart() {
      this.ensureCallAnsweredSession('sse-run');
    },
    /** ASR end：通话结束，保存转写并更新质检工单 */
    async handleSseCallEnd() {
      if (!this.isMediationCallSessionActive() || !this.isCallAnswered()) return;
      if (this.callEndHandled || this.callQualityRecordLinked) return;
      if (this.callStartPromise) {
        await this.callStartPromise;
      }
      this.callEndHandled = true;
      this.smartScriptSessionEnded = true;
      this.stopSmartScriptPolling();
      this.smartScriptVisible = false;
      void Promise.all([this.saveCallTranscriptDetailOnCallEnd(), this.onCallEnd({ isHangUp: true })]);
    },
    /** 提交前若通话未正常结束，补调结束接口 */
    async finalizeCallOnSubmitIfNeeded() {
      if (!this.isCallAnswered()) return;
      if (this.callStartPromise) {
        await this.callStartPromise;
      }
      if (this.callEndHandled || this.callQualityRecordLinked) return;
      this.callEndHandled = true;
      await this.onCallEnd();
    },
    async onCallStart() {
      if (!this.isCallAnswered()) return;
      this.smartScriptSessionEnded = false;
      try {
        const res = await saveCallQualityWorkOrder({
          workOrderId: this.row.workOrderId,
          entryChannel: this.row.entryChannel,
          consumerName: this.row.name,
          mediatorUserName: this.$store.getters.userInfo.nickName,
          mediatorUserId: this.row.mediatorUserId,
          consumerPhone: this.row.phone
        });
        if (res && res.code === 200 && res.data && res.data.id != null) {
          this.callQualityWorkOrderId = res.data.id;
        }
      } catch (e) {
        console.error('保存通话质检工单失败:', e);
      }
    },
    /** 更新通话质检工单（仅已接听且有工单 id 时调用） */
    async updateCallQualityWorkOrderForMediation({ recordId = '', recordTime = '', isHangUp = false } = {}) {
      if (!this.shouldRunCallQualityLogic()) return;
      const id = this.callQualityWorkOrderId;
      try {
        const payload = {
          id,
          mediatorUserId: this.row.mediatorUserId,
          recordType: 'mediationRecord',
          recordId: recordId != null ? String(recordId) : '',
          recordTime: recordTime != null ? String(recordTime) : ''
        };
        if (isHangUp) {
          payload.callEndFlag = '10';
        }
        await updateCallQualityWorkOrder(payload);
      } catch (e) {
        console.error('更新通话质检工单失败:', e);
      }
    },
    async onCallEnd({ isHangUp = false } = {}) {
      if (!this.shouldRunCallQualityLogic() || this.callQualityRecordLinked) return;
      await this.updateCallQualityWorkOrderForMediation({ recordId: '', recordTime: '', isHangUp });
    },
    isMessageComplete(complete) {
      return complete === true || complete === 'true';
    },
    /** 追加 ASR run 消息（未完成条目续写，已完成则新开一条并记录时间） */
    appendSseRunMessage(list, role, message, complete) {
      const now = Date.now();
      let lastIndex = list.findLastIndex(item => item.role === role && !this.isMessageComplete(item.complete));
      if (lastIndex !== -1 && list.slice(lastIndex + 1).some(item => item.role !== role)) {
        lastIndex = -1;
      }
      if (lastIndex !== -1) {
        list[lastIndex] = { ...list[lastIndex], role, message, complete };
      } else {
        list.push({ role, message, complete, timestamp: now });
      }
    },
    getCompletedSseContent() {
      return this.sseList.filter(d => d && (d.complete === true || d.complete === 'true'));
    },
    mapRoleToTranscriptRole(role) {
      return role === '投诉人' ? 'consumer' : 'mediator';
    },
    formatTranscriptTimestamp(ts) {
      const date = ts != null ? new Date(ts) : new Date();
      if (Number.isNaN(date.getTime())) {
        return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      }
      return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    },
    buildCallTranscriptMessages() {
      return this.getCompletedSseContent()
        .filter(d => String(d.message || '').trim())
        .map(d => ({
          role: this.mapRoleToTranscriptRole(d.role),
          content: String(d.message || '').trim(),
          timestamp: this.formatTranscriptTimestamp(d.timestamp)
        }));
    },
    /** 通话结束（ASR end）时保存转写，仅调用一次 */
    async saveCallTranscriptDetailOnCallEnd() {
      if (!this.shouldRunCallQualityLogic() || this.callTranscriptDetailSaved) return;
      const messages = this.buildCallTranscriptMessages();
      if (!messages.length) return;
      this.callTranscriptDetailSaved = true;
      try {
        await saveCallTranscriptDetail({
          callQualityWorkId: this.callQualityWorkOrderId,
          workOrderId: this.row.workOrderId,
          mediatorUserId: this.row.mediatorUserId,
          messages
        });
      } catch (e) {
        this.callTranscriptDetailSaved = false;
        console.error('保存通话转写详情失败:', e);
      }
    },
    async fetchMediationFormFromSSE(content, nowFormId) {
      try {
        const res = await SSEGetFromData({ content, type: 1 });
        if (res.code === 200 && nowFormId === this.formId) {
          this.diaputeForm = res.data;
        }
      } catch (e) {
        console.error('解析调解表单失败:', e);
      }
    }
  }
};
</script>

<style scoped lang="scss">
.respondentSelect ::v-deep .el-input {
  width: 100px;
}

.input-with-select ::v-deep .el-input-group__prepend {
  background-color: #fff;
}

.hover-icon:hover {
  color: #1872ff;
  /* 鼠标悬停时图标变成蓝色 */
  cursor: pointer;
  /* 鼠标悬停时变成点击手势 */
}

.mediation-dialog ::v-deep .el-dialog__header {
  padding: 0;
}

.mediation-dialog ::v-deep .el-dialog__body {
  padding-top: 0;
}

.mediation-dialog ::v-deep .el-dialog {
  max-width: 1680px;
  transition: width 0.25s ease;
}

.mediation-wrapper {
  display: flex;
  align-items: stretch;
  min-height: 480px;

  .mediation-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    transition: flex 0.25s ease;
  }

  .mediation-main-body {
    flex: 1;
    min-width: 0;
  }

  .dialog-script {
    width: 360px;
    flex-shrink: 0;
    margin-left: 12px;
    padding-left: 12px;
    border-left: 1px solid #d9e2ef;
    display: flex;
    flex-direction: column;
    animation: script-column-in 0.28s ease-out;
  }

  .dialog-left {
    border-right: 1px solid #ccc;
    padding-right: 10px !important;

    .dialog-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      color: #303133;
      margin: 10px 0;

      .el-icon-close {
        cursor: pointer;
        margin-left: 10px;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 25px;
    }
  }

  .dialog-right {
    padding-left: 10px !important;
    display: flex;
    flex-direction: column;

    .right-t {
      .t-title {
        font-size: 18px;
        margin-top: 20px;
        text-align: center;
      }

      .region-title {
        color: #dcdfe6;
        margin: 20px 0;
        font-size: 18px;
      }

      .confirm-btn {
        display: flex;
        justify-content: center;
        padding-bottom: 8px;

        button {
          background: #0958d9;
          color: #fff;

          &:hover {
            color: #fff;
          }
        }
      }

      .smart-script-trigger {
        display: flex;
        justify-content: flex-end;
        padding: 0 4px 10px;
        margin-bottom: 10px;
        border-bottom: 2px solid #ccc;

        .el-button {
          border-radius: 4px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
      }

      .line-row {
        border-bottom: 1px solid #dcdfe6;
        padding-bottom: 18px;
        margin-bottom: 18px;

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }

    .right-b {
      overflow: hidden;
      flex: 1;
      min-height: 120px;

      .right-b-chat {
        height: 100%;
        overflow-y: auto;
        padding-right: 4px;
      }

      .socket-item {
        margin-top: 10px;
        display: flex;
        flex-direction: column;

        .socket-l {
          display: flex;
          align-items: flex-end;

          .person-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 5px;

            .name {
              color: #999;
              margin-block-start: 0;
              margin-block-end: 0;
            }

            .avatar {
              width: 50px;
              height: 50px;
              margin-top: 5px;
            }
          }

          .person-message {
            max-width: 60%;

            span {
              display: inline-block;
              height: auto;
              background: #999;
              color: #000;
              border-radius: 10px;
              padding: 8px;
            }
          }
        }

        .socket-r {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;

          .person-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 5px;

            .name {
              color: #999;
              margin-block-start: 0;
              margin-block-end: 0;
            }

            .avatar {
              width: 50px;
              height: 50px;
              margin-top: 5px;
            }
          }

          .person-message {
            max-width: 60%;

            span {
              display: inline-block;
              height: auto;
              background: #4096ff;
              color: #fff;
              border-radius: 10px;
              padding: 8px;
            }
          }
        }
      }
    }
  }
}

@keyframes script-column-in {
  from {
    opacity: 0;
    transform: translateX(12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
