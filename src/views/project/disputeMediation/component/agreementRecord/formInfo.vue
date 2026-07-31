<template>
  <div>
    <el-form :model="formInfo" :rules="rules" ref="agreementRuleForm" label-width="110px">
      <el-form-item label="是否履约" prop="isFulfill">
        <el-select v-model="formInfo.isFulfill" placeholder="请选择是否履约" style="width: 200px" :disabled="isEdit">
          <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="附件" prop="attachment">
        <file-upload v-if="!isEdit || formInfo.attachment" v-model="formInfo.attachment" :isShowDele="!isEdit" :isShowBtn="!isEdit" :isShowTip="!isEdit" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]"/>
        <span v-else>无</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: '',
  dicts: ['sys_yes_no'],
  props: {
    initialData: {
      type: Object,
      default: () => {
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formInfo: {
        workOrderId: null,
        isFulfill: null,
        attachment: null
      },
      fileList: [],
      fileUrl: [],
      rules: {
        isFulfill: [{ required: true, message: '请选择是否履约', trigger: 'change'}],
      }
    };
  },

  watch: {
    initialData: {
      handler(newVal) {
        this.formInfo = {
          ...this.formInfo,
          ...newVal
        };
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // 表单验证
    validateForm() {
      return this.$refs.agreementRuleForm.validate();
    },

    // 取消验证结果
    resetValidateForm(){
      this.$refs.agreementRuleForm.clearValidate();
    },

    // 重置表单
    resetForm() {
      this.$refs.agreementRuleForm.resetFields();
      this.fileList = [];
      this.fileUrl = [];
    },

    // 获取表单数据
    getFormData() {
      return {
        ...this.formInfo
      };
    }
  }
};
</script>

<style scoped lang="scss"></style>
