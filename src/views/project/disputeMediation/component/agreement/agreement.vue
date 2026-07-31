<!-- 调解协议书 -->
<template>
  <el-dialog :title="title" :visible.sync="visible" width="1200px" :close-on-click-modal="false"
             :close-on-press-escape="false" :modal-append-to-body="false" :append-to-body="true">
    <template #title>
      <div>
        <span class="el-dialog__title">{{ title }}</span>
        <!-- 添加按钮 -->

        <div class="top-right-btn" style="margin-right: 30px; margin-top: -5px">
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5" v-if="!disabled && isDMMediator(row) && DM_STATUS.DM_STATUS4 === row.status && DM_AGREEMENT_STEP.SF !== row.agreementStep">
              <el-tooltip class="item" effect="dark" content="暂存" placement="top">
                <el-button type="success" size="mini" circle icon="el-icon-s-flag" @click="temporarySave"/>
              </el-tooltip>
            </el-col>
            <el-col :span="1.5" v-if="!disabled && isDMMediator(row) && temporary">
              <el-tooltip class="item" effect="dark" content="加载" placement="top">
                <el-button type="info" size="mini" circle icon="el-icon-edit" @click="temporaryLoad"/>
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
    <!-- 银行模板 -->
    <Bank1 v-if="template==='static/dm/调解协议书(银行).docx'" ref="bankRef1" @changeData="changeData" :disabled="disabled"/>
    <Bank2 v-if="template==='static/dm/调解协议书(银行)2.docx'" ref="bankRef2" @changeData="changeData" :disabled="disabled"/>

    <!-- 保险模板 -->
    <Insurance1 v-if="template==='static/dm/调解协议书(保险).docx'" ref="insuranceRef1" @changeData="changeData" :disabled="disabled"/>
    <Insurance2 v-if="template==='static/dm/调解协议书(保险)2.docx'" ref="insuranceRef2" @changeData="changeData" :disabled="disabled"/>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" v-if="!disabled" @click="submitForm">确 定</el-button>
      <el-button type="primary" v-if="showAuditButton()" @click="handleAudit">审 核</el-button>
      <el-button @click="visible=false">取 消</el-button>
    </div>

    <!-- 审核协议书、审核用印 -->
    <AuditAgreement ref="auditAgreementRef" @callback="submitAudit"/>
  </el-dialog>
</template>
<script>
import {
  editAgreement,
  temporarySaveAgreement,
  temporaryLoadAgreement,
  getDisputeMediation,
  auditAgreement1,
  auditAgreement2,
  auditAgreement3,
  auditAgreement4,
  auditStamp1,
  auditStamp2,
  auditStamp3,
  auditStamp4,
} from "@/api/project/disputeMediation";
import {DEPT_TYPE, DM_AGREEMENT_STEP, DM_STATUS} from "@/views/constant/CommonConstant";
import AuditAgreement from "@/views/project/disputeMediation/component/auditAgreement.vue";
import Bank1 from "@/views/project/disputeMediation/component/agreement/bank1.vue";
import Bank2 from "@/views/project/disputeMediation/component/agreement/bank2.vue";
import Insurance1 from "@/views/project/disputeMediation/component/agreement/insurance1.vue";
import Insurance2 from "@/views/project/disputeMediation/component/agreement/insurance2.vue";

export default {
  components: {AuditAgreement, Bank1, Bank2, Insurance1, Insurance2},
  props: ["title"],
  data() {
    return {
      visible: false,
      row: {
        agreement: {
          parameter: null,
        },
        agreementStep: null,
      },
      type: null,
      disabled: false,
      data: null,
      temporary: undefined,
      template: null,
      currentBankTemplate: "static/dm/调解协议书(银行)2.docx",
      currentInsuranceTemplate: "static/dm/调解协议书(保险)2.docx",
      // // 常量
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      DM_AGREEMENT_STEP: DM_AGREEMENT_STEP, // 纠纷业务协议阶段
    }
  },
  computed: {},
  created() {
  },
  mounted() {
  },
  methods: {
    changeData(data) {
      this.data = data;
    },
    open(row, disable, dict) {
      this.disabled = disable;
      getDisputeMediation(row.workOrderId).then(response => {
        this.row = response.data;
        if (!this.disabled && this.isDMMediator(this.row)) {
          temporaryLoadAgreement({workOrderId: this.row.workOrderId}).then(load => {
            this.temporary = load.data;
          });
        }
        if (DEPT_TYPE.bankList.includes(this.row.deptType) || DEPT_TYPE.nonBankList.includes(this.row.deptType)) {
          this.template = this.row.agreementId ? this.row.agreement.template : this.currentBankTemplate;
        } else if (DEPT_TYPE.insuranceList.includes(this.row.deptType)) {
          this.template = this.row.agreementId ? this.row.agreement.template : this.currentInsuranceTemplate;
        }
        this.$nextTick(() => {
          if (this.template === 'static/dm/调解协议书(银行).docx') {
            this.$refs.bankRef1.init(this.row, dict)
          } else if (this.template === 'static/dm/调解协议书(银行)2.docx') {
            this.$refs.bankRef2.init(this.row, dict);
          } else if (this.template === 'static/dm/调解协议书(保险).docx') {
            this.$refs.insuranceRef1.init(this.row, dict)
          } else if (this.template === 'static/dm/调解协议书(保险)2.docx') {
            this.$refs.insuranceRef2.init(this.row, dict)
          }
        })
        this.visible = true;
      })
    },
    // 校验工单调解员
    isDMMediator(row) {
      return this.$store.getters.userInfo.isDMMediator && (this.$store.getters.userInfo.userId === row.mediatorUserId || this.$store.getters.userInfo.userId === row.assistantUserId);
    },
    showAuditButton() {
      switch (this.row.agreementStep) {
        case DM_AGREEMENT_STEP.AA1:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMAgreementAuditor1;
        case DM_AGREEMENT_STEP.AA2:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMAgreementAuditor2;
        case DM_AGREEMENT_STEP.AA3:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMAgreementAuditor3;
        case DM_AGREEMENT_STEP.AA4:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMAgreementAuditor4;
        case DM_AGREEMENT_STEP.AS1:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMStampAuditor1;
        case DM_AGREEMENT_STEP.AS2:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMStampAuditor2;
        case DM_AGREEMENT_STEP.AS3:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMStampAuditor3;
        case DM_AGREEMENT_STEP.AS4:
          return DM_STATUS.DM_STATUS4 === this.row.status && this.$store.getters.userInfo.isDMStampAuditor4;
        default:
          return false;
      }
    },
    submitForm() {
      if (this.row.agreementStep && DM_AGREEMENT_STEP.AR !== this.row.agreementStep) {
        this.$confirm('重新编辑协议将会重新审核，若已经选择线上签约，签约中的协议将撤销, 是否确定继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {workOrderId: this.row.workOrderId, agreementParameter: this.data};
          editAgreement(data).then(response => {
            this.$modal.msgSuccess("编辑成功");
            this.$emit('callback');
            this.visible = false;
          });
        }).catch(() => {
        });
      } else {
        let data = {workOrderId: this.row.workOrderId, agreementParameter: this.data};
        editAgreement(data).then(response => {
          this.$modal.msgSuccess("编辑成功");
          this.$emit('callback');
          this.visible = false;
        });
      }
    },
    temporarySave() {
      let data = {workOrderId: this.row.workOrderId, agreementParameter: this.data};
      temporarySaveAgreement(data).then(response => {
        this.$modal.msgSuccess("保存成功");
        if (!this.disabled && this.isDMMediator(this.row) && !this.temporary) {
          temporaryLoadAgreement({workOrderId: this.row.workOrderId}).then(load => {
            this.temporary = load.data;
          });
        }
      });
    },
    temporaryLoad() {
      temporaryLoadAgreement({workOrderId: this.row.workOrderId}).then(response => {
        this.temporary = response.data;
        let temporaryParameter = JSON.parse(this.temporary.parameter);

        if (this.template === 'static/dm/调解协议书(银行).docx') {
          this.$refs.bankRef1.update(temporaryParameter);
        } else if (this.template === 'static/dm/调解协议书(银行)2.docx') {
          this.$refs.bankRef2.update(temporaryParameter);
        } else if (this.template === 'static/dm/调解协议书(保险).docx') {
          this.$refs.insuranceRef1.update(temporaryParameter);
        } else if (this.template === 'static/dm/调解协议书(保险)2.docx') {
          this.$refs.insuranceRef2.update(temporaryParameter);
        }
      });
    },
    handleAudit() {
      let auditAgreementTitle;
      switch (this.row.agreementStep) {
        case DM_AGREEMENT_STEP.AA1:
          auditAgreementTitle = '审核协议书(一审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AA2:
          auditAgreementTitle = '审核协议书(二审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AA3:
          auditAgreementTitle = '审核协议书(三审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AA4:
          auditAgreementTitle = '审核协议书(四审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AS1:
          auditAgreementTitle = '审核用印(一审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AS2:
          auditAgreementTitle = '审核用印(二审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AS3:
          auditAgreementTitle = '审核用印(三审):' + this.row.workOrderId;
          break;
        case DM_AGREEMENT_STEP.AS4:
          auditAgreementTitle = '审核用印(四审):' + this.row.workOrderId;
          break;
        default:
          break;
      }
      this.$refs.auditAgreementRef.open(auditAgreementTitle);
    },
    async submitAudit(form) {
      let data = {
        agreementId: this.row.agreementId,
        workOrderId: this.row.workOrderId,
        result: form.result,
        rejectReason: form.rejectReason,
      }
      let agreementResults;
      switch (this.row.agreementStep) {
        case DM_AGREEMENT_STEP.AA1:
          agreementResults = await auditAgreement1(data)
          break;
        case DM_AGREEMENT_STEP.AA2:
          agreementResults = await auditAgreement2(data)
          break;
        case DM_AGREEMENT_STEP.AA3:
          agreementResults = await auditAgreement3(data)
          break;
        case DM_AGREEMENT_STEP.AA4:
          agreementResults = await auditAgreement4(data)
          break;
        case DM_AGREEMENT_STEP.AS1:
          agreementResults = await auditStamp1(data)
          break;
        case DM_AGREEMENT_STEP.AS2:
          agreementResults = await auditStamp2(data)
          break;
        case DM_AGREEMENT_STEP.AS3:
          agreementResults = await auditStamp3(data)
          break;
        case DM_AGREEMENT_STEP.AS4:
          agreementResults = await auditStamp4(data)
          break;
        default:
          break;
      }
      if (agreementResults) {
        if (agreementResults.code === 200) {
          this.$modal.msgSuccess("操作成功");
          this.$refs.auditAgreementRef.close();
          this.visible = false;
          this.$emit('callback');
        }
      }
    },
    /** 给textarea文本域段落行首添加空格 */
    addSpaceToTextarea(object, columnName) {
      if (object[columnName]) {
        object[columnName] = object[columnName].replace(/^(\s*)(.*)$/gm, (match, spaces, content) => {
          return spaces.length !== 2 ? '    ' + content : match;
        });
      }
    },
  }
}

</script>
<style lang="scss">
.acceptanceFormBorder {
  border: 1px solid #000;
  margin-top: 20px;

  .littleBorder {
    border: 1px solid #000;
    min-width: 180px;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
