<!-- 终止办结 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="110px">
<!--      <el-form-item :label="DM_STATUS.DM_STATUS2 === this.row.status ? '终止受理原因' : (DM_STATUS.DM_STATUS4 === this.row.status ? '终止调解原因' : '终止原因')" prop="terminateReason">-->
<!--        <el-select v-model="form.terminateReason" placeholder="请选择" clearable style="width: 100%">-->
<!--          <el-option-->
<!--            v-for="dict in dict.type.dm_terminate_reason"-->
<!--            :key="dict.value"-->
<!--            :label="dict.label"-->
<!--            :value="dict.value"-->
<!--          />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item label="终止受理原因" prop="terminateReason" v-if="DM_STATUS.DM_STATUS2 === this.row.status">
        <el-select v-model="form.terminateReason" placeholder="请选择" clearable style="width: 100%">
          <el-option
            v-for="dict in dict.type.dm_terminate_accept_reason"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="终止调解原因" prop="terminateReason" v-if="DM_STATUS.DM_STATUS4 === this.row.status">
        <el-select v-model="form.terminateReason" placeholder="请选择" clearable style="width: 100%">
          <el-option
            v-for="dict in dict.type.dm_terminate_mediate_reason"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="终止备注" prop="terminateRemark">
        <el-input
          v-model="form.terminateRemark"
          placeholder="请输入"
          clearable
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { terminate } from "@/api/project/disputeMediation";
import {DM_STATUS} from "@/views/constant/CommonConstant";

export default {
  name: '',
  computed: {
    DM_STATUS() {
      return DM_STATUS
    }
  },
  props: ['title'],
  dicts: ["dm_terminate_accept_reason", "dm_terminate_mediate_reason"],
  data() {
    return {
      row: {},
      loading: false,
      visible: false,
      form: {},
      rules: {
        terminateReason: [{ required: true, message: '必填项', trigger: 'blur' }],
      },
    };
  },
  methods: {
    open(row) {
      this.row = row;
      this.resetForm("form");
      this.form = {
        workOrderId: row.workOrderId,
        terminateReason: undefined,
        terminateRemark: undefined,
      };
      this.visible = true;
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          terminate(this.form).then(() => {
            this.$modal.msgSuccess("操作成功");
            this.loading = false;
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
    },
  },
};
</script>
