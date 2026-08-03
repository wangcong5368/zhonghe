<!-- 填写反馈单 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="110px">
      <div>
        <div class="min_title">消费者信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="消费者姓名" prop="name">
              <el-input
                v-model="form.name"
                maxlength="50"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="phone">
              <el-input
                v-model="form.phone"
                oninput="value=value.replace(/[^\d]/g,'')"
                maxlength="11"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="证件类型" prop="certType">
              <el-select
                v-model="form.certType"
                style="width: 100%"
                disabled
              >
                <el-option
                  v-for="dict in dict.type.cert_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码" prop="certNum">
              <el-input
                v-model="form.certNum"
                maxlength="18"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="金融机构是否接受调解" prop="deptAcceptMediate" label-width="165px">
            <el-select
              v-model="form.deptAcceptMediate"
              placeholder=""
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in dict.type.sys_yes_no"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="拒绝调解原因" prop="deptRejectMediateReason" v-if="SYS_YES_NO.sys_no === form.deptAcceptMediate">
            <el-select v-model="form.deptRejectMediateReason" placeholder="请选择" clearable style="width: 100%">
              <el-option
                v-for="dict in dict.type.dm_dept_reject_mediate_reason"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="拒绝调解备注" prop="deptRejectMediateRemark" v-if="SYS_YES_NO.sys_no === form.deptAcceptMediate">
            <el-input
              v-model="form.deptRejectMediateRemark"
              placeholder="请输入"
              clearable
              maxlength="50"
              show-word-limit
            />
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
import {feedback1} from "@/api/project/disputeMediation";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { SYS_YES_NO } from '@/views/constant/CommonConstant.js'

export default {
  components: {Treeselect},
  dicts: ["sys_yes_no", "cert_type", "dm_dept_reject_mediate_reason"],
  props: ["title"],
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      // 表单校验
      rules: {
        deptAcceptMediate: [{ required: true, message: '金融机构是否接受调解为必填项', trigger: 'change' }],
        deptRejectMediateReason: [{ required: true, message: '拒绝调解原因为必填项', trigger: 'change' }],
      },
      // 常量
      SYS_YES_NO: SYS_YES_NO, // 是否
    };
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        workOrderId: undefined,
        deptAcceptMediate: undefined,
        deptRejectMediateReason: undefined,
        deptRejectMediateRemark: undefined,
      };
      this.resetForm("form");
    },
    open(row) {
      this.reset();
      this.form = { ...row };
      this.visible = true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          feedback1(this.form).then((response) => {
            this.loading = false;
            if (this.form.deptAcceptMediate === SYS_YES_NO.sys_yes) {
              this.$modal.alertSuccess('操作成功，请继续填报反馈单相关信息')
            } else {
              this.$modal.msgSuccess("操作成功");
            }
            this.visible = false;
            this.$emit('callback')
          }).catch(() => {
            this.loading = false;
          })
        }
      });
    },
    cancel() {
      this.visible = false;
      this.reset();
    },
  },
};
</script>

<style lang="scss" scoped>
.min_title {
  position: relative;
  width: 100%;
  height: 30px;
  line-height: 35px;
  background: #4682b4;
  color: #fff;
  padding-left: 5px;
  box-sizing: inherit;
  text-align: left;
  // margin-top: 10px;
  margin-bottom: 10px;
}
</style>
