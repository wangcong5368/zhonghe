<!--  派单审核 -->
<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body>
      <el-descriptions class="margin-top" :column="2" border style="margin-bottom: 50px">
        <el-descriptions-item >
          <template slot="label">
            <i class="el-icon-user-solid"/>申请人
          </template>
          {{ mediatorAudit.applicantName }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-date"/>申请时间
          </template>
          {{ mediatorAudit.applyTime }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-user"/>原调解员
          </template>
          {{ mediatorAudit.formerName }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label">
            <i class="el-icon-user"/>现调解员
          </template>
          {{ mediatorAudit.latterName }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col>
            <el-form-item label="审核结果" prop="result">
              <el-select v-model="form.result" placeholder="请选择">
                <el-option label="通过" :value="1"/>
                <el-option label="驳回" :value="0"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="审核意见" prop="auditOpinion">
              <el-input
                v-model="form.auditOpinion"
                placeholder="请输入审核意见"
                type="textarea"
                maxlength="100"
                show-word-limit
                :autosize="{ minRows: 2}"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="visible=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDisputeMediation, mediatorAudit } from '@/api/project/disputeMediation'
import { DM_MEDIATOR_AUDIT_STATUS } from '@/views/constant/CommonConstant'

export default {
  props: ['title'],
  dicts: ["dm_audit_result"],
  components: {},
  data() {
    return {
      visible: false,
      rules: {
        result: [{required: true, message: '请选择审核结果', trigger: 'blur'}],
      },
      form: {},
      mediatorAudit: {},
      DM_MEDIATOR_AUDIT_STATUS: DM_MEDIATOR_AUDIT_STATUS,
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    reset() {
      this.form = {
        workOrderId: null,
        result: null,
        auditOpinion: null,
      };
    },
    open(row) {
      this.reset();
      this.form.workOrderId = row.workOrderId;
      getDisputeMediation(row.workOrderId).then(response => {
        this.mediatorAudit = response.data.dmMediatorAuditList.find(item => item.status === DM_MEDIATOR_AUDIT_STATUS.toAudit);
        this.form.mediatorAuditId = this.mediatorAudit.mediatorAuditId;
        this.visible = true;
      })
    },
    close() {
      this.visible = false;
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          mediatorAudit(this.form).then(response => {
            this.visible = false;
            this.$emit('callback');
          })
        }
      })
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
