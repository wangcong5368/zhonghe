<!-- 新增调解记录 -->
<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" width="75%"
               :show-close="false" class="mediation-dialog">
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
      <el-row class="mediation-wrapper">
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
                         style="margin-left: 5px" @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.agentPhone })" />
            </el-descriptions-item>
            <el-descriptions-item label="消费者姓名">
              {{ row.name }}
            </el-descriptions-item>
            <el-descriptions-item label="消费者联系方式">
              {{ row.phone }}
              <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.phone"
                         style="margin-left: 5px" @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.phone })" />
            </el-descriptions-item>
            <el-descriptions-item label="机构联系人">
              {{ row.deptLeader }}
            </el-descriptions-item>
            <el-descriptions-item label="机构联系电话">
              {{ row.deptPhone }}
              <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.deptPhone"
                         style="margin-left: 5px" @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.deptPhone })" />
            </el-descriptions-item>
            <el-descriptions-item label="机构代表姓名">
              {{ row.deptContact }}
            </el-descriptions-item>
            <el-descriptions-item label="机构代表联系方式">
              {{ row.deptContactPhone }}
              <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.deptContactPhone"
                         style="margin-left: 5px" @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.deptContactPhone })" />
            </el-descriptions-item>
            <el-descriptions-item label="机构业务经办人员"
                                  v-if="DEPT_TYPE.bankList.includes(this.row.deptType) || DEPT_TYPE.nonBankList.includes(this.row.deptType)">
              {{ row.deptHandlerName }}
            </el-descriptions-item>
            <el-descriptions-item label="机构业务经办人员联系电话"
                                  v-if="DEPT_TYPE.bankList.includes(this.row.deptType) || DEPT_TYPE.nonBankList.includes(this.row.deptType)">
              {{ row.deptHandlerPhone }}
              <el-button type="success" icon="el-icon-phone" circle size="mini" v-if="row.deptHandlerPhone"
                         style="margin-left: 5px" @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: row.deptHandlerPhone })" />
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
              </div>
            </el-form>
            <div class="confirm-btn">
              <el-button @click="handelCoverForm">确认信息，自动覆盖</el-button>
            </div>
          </div>
          <div class="right-b">
            <div v-for="(item, index) in sseList" :key="index" class="socket-item">
              <div class="socket-l" v-if="item.role === '调解员'">
                <div class="person-info">
                  <p class="name">调解员</p>
                  <img class="avatar" src="@/assets/images/form-avatar.png" alt="">
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
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { addMediationRecord, SSEGetFromData } from '@/api/project/disputeMediation';
import { parseTime } from '@/utils/ruoyi';
import recordForm from './formInfo.vue';
import { DEPT_TYPE, SYS_YES_NO } from '@/views/constant/CommonConstant'
import { v4 as uuidv4 } from 'uuid';
export default {
  name: '',
  props: ['title'],
  components: {
    recordForm
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
    };
  },
  created() {
    // console.log('🚀 ~ 开始打印 ~ this.$callWs.state.formData :', this.$callWs.state.formData.ola_extn)
    console.log('🚀 ~ 开始打印 ~ this.$callWs.state.formData :', this.$store.getters.userInfo.seatNum ? this.$store.getters.userInfo.seatNum.toString().slice(5, 8) : '')
  },
  mounted() {
  },
  watch: {
    "dialogVisible"(nVal, oVal) {
      if (this.minisize) {
        return
      }
      if (!this.minisize) {
        if (nVal) {
          this.$nextTick(() => {
            this.formId = uuidv4();
            clearTimeout(this.sseTimeout)
            clearInterval(this.getDataInterval);
            this.getDataInterval = null
            this.run = false
            this.calculateRightBHeight();
            this.sseList = []
            this.initSSE();
          });
        } else {
          if (this.eventSource) {
            clearTimeout(this.sseTimeout)
            if (this.eventSource) {
              this.eventSource.close();
            }
            clearInterval(this.getDataInterval);
            this.getDataInterval = null
            this.diaputeForm = {}
            this.run = false
            console.log('SSE 连接已关闭');
          }
        }
      }
      if (nVal) {
        this.$nextTick(() => this.$refs.mediationRecordForm.refreshTime())
      }
    },
  },
  methods: {
    open(row, form) {
      this.row = row;
      if (form) {
        this.formData = form;
      } else {
        this.formData.workOrderId = row.workOrderId;
        this.formData.participant = row.mediatorName + ',' + row.assistantName;
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
        "新增调解记录:" + this.row.workOrderId,
        { row: this.row, form: { ...this.$refs.mediationRecordForm.getFormData() } },
        "新增调解记录",
        "success",
        event.clientX,
        event.clientY,
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
        const childrenFormData = this.$refs.mediationRecordForm.getFormData();
        childrenFormData.time = parseTime(childrenFormData.time, '{y}-{m}-{d} {h}:{i}:{s}');
        childrenFormData.workOrderId = this.formData.workOrderId;
        const res = await addMediationRecord(childrenFormData);
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
      const dialogLeft = document.querySelector('.dialog-left');
      const rightT = document.querySelector('.right-t');
      const rightB = document.querySelector('.right-b');
      if (dialogLeft && rightT && rightB) {
        const dialogLeftHeight = dialogLeft.clientHeight || dialogLeft.offsetHeight;
        const rightTHeight = rightT.clientHeight || rightT.offsetHeight;
        rightB.style.height = (dialogLeftHeight - rightTHeight) + 'px';
        console.log('计算高度:', dialogLeftHeight, rightTHeight, dialogLeftHeight - rightTHeight);
      }
    },
    completedCount() {
      return this.sseList.filter(d => d && (d.complete === true || d.complete === 'true')).length;
    },
    initSSE() {
      const nowFormId = this.formId;

      if (typeof (EventSource) !== "undefined") {
        const source = new EventSource(`/asr/stream/?code=${this.extn}`);
        source.onmessage = (event) => {
          try {
            const resData = JSON.parse(event.data);
            if (resData.event === 'run') {
              const list = [...this.sseList]
              const { direction, complete, data } = resData;
              if (direction === '2') {
                const lastIndex = list.findLastIndex(item => item.role === "投诉人" && item.complete === 'false');
                if (lastIndex !== -1) {
                  list[lastIndex] = { role: "投诉人", message: data, complete }
                } else {
                  list[list.length] = { role: "投诉人", message: data, complete }
                }
              } else {
                const lastIndex = list.findLastIndex(item => item.role === "调解员" && item.complete === 'false');
                if (lastIndex !== -1) {
                  list[lastIndex] = { role: "调解员", message: data, complete }
                } else {
                  list[list.length] = { role: "调解员", message: data, complete }
                }
              }
              this.sseList = list
            } else if (resData.event === 'end') {
              console.log(resData.event);
              if (this.getDataInterval) {
                clearInterval(this.getDataInterval);
                this.getDataInterval = null
                source.close();
                if (this.completedCount() >= 2) {
                  SSEGetFromData({ content: this.sseList.filter(d => d.complete), type: 1 }).then(res => {
                    if (res.code === 200 && nowFormId === this.formId) {
                      this.diaputeForm = res.data
                    }
                  })
                } else {
                  this.initSSE();
                }
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
                this.run = true
                SSEGetFromData({ content: this.sseList.filter(d => d.complete), type: 1 }).then(res => {
                  if (res.code === 200 && nowFormId === this.formId) {
                    this.diaputeForm = res.data
                  }
                })
              }
            }, 60000);
          }
        };
        source.onerror = (error) => {
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

.mediation-wrapper {
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

    .right-t {
      .t-title {
        font-size: 18px;
        margin-top: 20px;
        text-align: center;
      }

      .region-title {
        color: #DCDFE6;
        margin: 20px 0;
        font-size: 18px;
      }

      .confirm-btn {
        display: flex;
        justify-content: center;
        border-bottom: 2px solid #ccc;
        margin-bottom: 10px;
        padding-bottom: 10px;

        button {
          background: #0958d9;
          color: #fff;

          &:hover {
            color: #fff;
          }
        }
      }

      .line-row {
        border-bottom: 1px solid #DCDFE6;
        padding-bottom: 18px;
        margin-bottom: 18px;

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }

    .right-b {
      overflow-y: auto;

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
</style>
