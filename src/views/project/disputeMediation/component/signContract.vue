<!-- 签约页面 -->
<template>
  <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body @close="cancel">
    <el-form ref="form" :model="form" :rules="rules" label-width="150px">
      <el-row>
        <el-col :span="8">
          <el-form-item label="签约类型" prop="signWay">
            <el-select v-model="form.signWay" placeholder="请选择">
              <el-option
                v-for="item in dict.type.dm_sign_way"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label-width="0">
            <span style="color: red"><i class="el-icon-info"/>请务必填写签署人员的真实姓名及手机号</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="当事人姓名" prop="consumerName">
            <el-input v-model="form.consumerName" placeholder="请输入当事人姓名" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="手机号" prop="consumerPhone" label-width="100px">
            <el-input v-model="form.consumerPhone" placeholder="请输入手机号" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="短信通知" prop="consumerMsgNotice" label-width="100px">
            <el-switch v-model="form.consumerMsgNotice" active-color="#13ce66"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="机构委托代表姓名" prop="deptName">
            <el-input v-model="form.deptName" placeholder="请输入机构委托代表姓名" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="手机号" prop="deptPhone" label-width="100px">
            <el-input v-model="form.deptPhone" placeholder="请输入手机号" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="短信通知" prop="deptMsgNotice" label-width="100px">
            <el-switch v-model="form.deptMsgNotice" active-color="#13ce66"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="调解员姓名" prop="mediatorName">
            <el-input v-model="form.mediatorName" placeholder="请输入调解员姓名" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="手机号" prop="mediatorPhone" label-width="100px">
            <el-input v-model="form.mediatorPhone" placeholder="请输入手机号" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="短信通知" prop="mediatorMsgNotice" label-width="100px">
            <el-switch v-model="form.mediatorMsgNotice" active-color="#13ce66"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="助理调解员姓名" prop="assistantName">
            <el-input v-model="form.assistantName" placeholder="请输入助理调解员姓名" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="手机号" prop="assistantPhone" label-width="100px">
            <el-input v-model="form.assistantPhone" placeholder="请输入手机号" style="width: 100%"/>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="DM_SIGN_WAY.online === form.signWay">
          <el-form-item label="短信通知" prop="assistantMsgNotice" label-width="100px">
            <el-switch v-model="form.assistantMsgNotice" active-color="#13ce66"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" v-if="DM_SIGN_WAY.offline === form.signWay">
          <el-form-item label="附件" prop="agreementAttachment">
            <file-upload v-model="form.agreementAttachment"
                         :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {onlineSigning, offlineSigning} from "@/api/project/disputeMediation";
import { DM_SIGN_WAY, SYS_YES_NO } from '@/views/constant/CommonConstant.js'

export default {
  dicts: ["dm_sign_way"],
  props: ["title"],
  watch: {},
  components: {},
  data() {
    return {
      visible: false,
      loading: false,
      rules: {
        signWay: [{required: true, message: '签约类型为必填项', trigger: 'change'}],
        consumerName: [{required: true, message: '当事人姓名为必填项', trigger: 'blur'}],
        consumerPhone: [{required: true, message: '当事人手机号为必填项', trigger: 'blur'}],
        deptName: [{required: true, message: '机构授权调解代理人姓名为必填项', trigger: 'blur'}],
        deptPhone: [{required: true, message: '机构授权调解代理人手机号为必填项', trigger: 'blur'}],
        mediatorName: [{required: true, message: '调解员姓名为必填项', trigger: 'blur'}],
        mediatorPhone: [{required: true, message: '调解员手机号为必填项', trigger: 'blur'}],
        assistantName: [{required: true, message: '助理调解员姓名为必填项', trigger: 'blur'}],
        assistantPhone: [{required: true, message: '助理调解员手机号为必填项', trigger: 'blur'}],
        agreementAttachment: [{required: true, message: '请上传附件', trigger: 'blur'}],
      },
      form: {
        signWay: undefined,
        workOrderId: undefined,
        consumerName: undefined,
        consumerPhone: undefined,
        consumerMsgNotice: false,
        deptName: undefined,
        deptPhone: undefined,
        deptMsgNotice: false,
        mediatorName: undefined,
        mediatorPhone: undefined,
        mediatorMsgNotice: false,
        assistantName: undefined,
        assistantPhone: undefined,
        assistantMsgNotice: false,
        agreementAttachment: undefined,
      },
      DM_SIGN_WAY: DM_SIGN_WAY, // 签约方式
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row) {
      this.row = row;
      this.form = {
        signWay: undefined,
        workOrderId: row.workOrderId,
        consumerName: SYS_YES_NO.sys_yes === row.isSelf ? row.name : row.agentName,
        consumerPhone: SYS_YES_NO.sys_yes === row.isSelf ? row.phone : row.agentPhone,
        consumerMsgNotice: false,
        deptName: row.deptContact,
        deptPhone: row.deptContactPhone,
        deptMsgNotice: false,
        mediatorName: row.mediatorName,
        mediatorPhone: row.mediatorPhone,
        mediatorMsgNotice: false,
        assistantName: row.assistantName,
        assistantPhone: row.assistantPhone,
        assistantMsgNotice: false,
        agreementAttachment: undefined,
      };
      this.resetForm("form");
      this.visible = true;
    },
    cancel() {
      this.visible = false;
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (DM_SIGN_WAY.online === this.form.signWay) {
            this.$modal.loading("线上签约提交中，请稍后……！");
            onlineSigning(this.form).then((response) => {
              this.$modal.closeLoading();
              this.$modal.msgSuccess("操作成功");
              this.visible = false;
              this.$emit('callback');
            }).catch(() => {
              this.$modal.closeLoading();
            })
          } else if (DM_SIGN_WAY.offline === this.form.signWay) {
            this.loading = true;
            offlineSigning(this.form).then((response) => {
              this.loading = false;
              this.$modal.msgSuccess("操作成功");
              this.visible = false;
              this.$emit('callback');
            }).catch(() => {
              this.visible = false;
            })
          }
        }
      });
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
