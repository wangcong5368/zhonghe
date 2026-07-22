<template>
  <div>
    <el-form :model="formInfo" :rules="rules" ref="callbackRuleForm" label-width="110px" label-position="top">
      <el-form-item v-if="showPartyField" label="当事人" prop="dsr">
        <el-input v-model="dsr" disabled />
      </el-form-item>

      <el-form-item label="回访时间" prop="time">
        <el-date-picker v-model="formInfo.time" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
          :placeholder="isEdit ? '' : '请选择回访时间'" disabled style="width: 100%" clearable :picker-options="{
            disabledDate(time) {
              // 禁用所有小于当前日期的日期
              return time.getTime() > Date.now();
            }
          }"></el-date-picker>
      </el-form-item>

      <el-form-item label="回访类型" prop="returnVisitType">
        <el-select v-model="formInfo.returnVisitType" :placeholder="isEdit ? '' : '请选择回访类型'" clearable
          style="width: 100%" :disabled="isEdit">
          <el-option v-for="dict in dict.type.dm_return_visit_type" :key="dict.value" :label="dict.label"
            :value="dict.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="是否执行完毕" prop="executionCompletedFlag">
        <el-select v-model="formInfo.executionCompletedFlag" :placeholder="isEdit ? '' : '请选择是否执行完毕'" clearable
          style="width: 100%" :disabled="isEdit">
          <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
            :value="dict.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item v-if="formInfo.executionCompletedFlag === SYS_YES_NO.sys_no" label="是否因非金融机构原因导致调解协议未能执行"
        prop="financialCauseFailureFlag"
        :rules="[{ required: formInfo.executionCompletedFlag === SYS_YES_NO.sys_no, message: '是否因非金融机构原因导致调解协议未能执行为必填', trigger: 'change' }]">
        <el-select v-model="formInfo.financialCauseFailureFlag" :placeholder="isEdit ? '' : '请选择是否因非金融机构原因导致调解协议未能执行'"
          clearable style="width: 100%" :disabled="isEdit">
          <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
            :value="dict.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="回访事由" prop="cause">
        <el-input v-model="formInfo.cause" :placeholder="isEdit ? '' : '请输入回访事由'" :disabled="isEdit" maxlength="40"
          show-word-limit clearable />
      </el-form-item>

      <el-form-item label="回访情况" prop="content">
        <el-input type="textarea" v-model="formInfo.content" :placeholder="isEdit ? '' : '请输入回访情况'" :disabled="isEdit"
          :autosize="{ minRows: 3 }" maxlength="1000" show-word-limit clearable />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { SYS_YES_NO } from '@/views/constant/CommonConstant.js';

export default {
  name: '',
  props: {
    initialData: {
      type: Object,
      default: () => { }
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => { }
    },
    showPartyField: {
      type: Boolean,
      default: true
    }
  },
  dicts: ['sys_yes_no', 'dm_return_visit_type'],
  data() {
    return {
      dsr: null,
      formInfo: {
        workOrderId: null,
        time: null,
        cause: null,
        content: null,
        executionCompletedFlag: null,
        financialCauseFailureFlag: null,
        returnVisitType: null
      },
      SYS_YES_NO: SYS_YES_NO, // 是否

      rules: {
        time: [{ required: true, message: '请选择回访日期', trigger: 'change' }],
        cause: [{ required: true, message: '回访事由为必填', trigger: 'blur' }],
        executionCompletedFlag: [{ required: true, message: '是否执行完毕为必填', trigger: 'change' }],
        returnVisitType: [{ required: true, message: '回访类型为必填', trigger: 'change' }],
        // financialCauseFailureFlag: [{ required: true, message: '是否因非金融机构原因导致调解协议未能执行为必填', trigger: 'change' }],
        content: [{ required: true, message: '回访情况不能为空', trigger: 'blur' }]
      }
    };
  },

  watch: {
    row: {
      handler(newVal) {
        this.dsr = newVal.deptContact ? newVal.name + ',' + newVal.deptContact : newVal.name;
      },
      immediate: true,
      deep: true
    },
    initialData: {
      handler(newVal) {
        this.formInfo = {
          ...this.formInfo,
          ...newVal
        };

        if (!this.formInfo.returnVisitId) {
          this.formInfo.time = new Date();
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // 表单验证
    validateForm() {
      return this.$refs.callbackRuleForm.validate();
    },

    // 取消验证结果
    resetValidateForm() {
      this.$refs.agreementRuleForm.clearValidate();
    },

    // 重置表单
    resetForm() {
      this.$refs.callbackRuleForm.resetFields();
    },

    // 获取表单数据
    getFormData() {
      return this.formInfo;
    }
  }
};
</script>

<style scoped lang="scss"></style>
