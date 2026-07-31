<template>
  <div>
    <el-form :model="formInfo" :rules="rules" ref="investigationRuleForm" label-width="85px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="地点" prop="place">
            <el-select v-model="formInfo.place" :placeholder="isEdit?'':'请选择地点'" style="width: 100%" :disabled="isEdit" clearable>
              <el-option v-for="dict in dict.type.dm_investigation_place" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调查时间" prop="time">
            <el-date-picker
              v-model="formInfo.time"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              :placeholder="isEdit?'':'请选择调查时间'"
              :disabled="isEdit"
              style="width: 100%"
              clearable
              :picker-options="{
                disabledDate(time) {
                  // 禁用所有小于当前日期的日期
                  return time.getTime() > Date.now();
                }
              }"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="参加人" prop="participant">
            <el-input v-model="formInfo.participant" :placeholder="isEdit?'':'请输入参加人'" :disabled="isEdit" maxlength="50" show-word-limit clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="被调查人" prop="respondent">
            <el-input :placeholder="isEdit?'':'请输入被调查人'" v-model="formInfo.respondent" :disabled="isEdit" maxlength="100" show-word-limit clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="提交证据或资料名称" prop="recorder">
            <el-input type="textarea" v-model="formInfo.recorder" :placeholder="isEdit?'':'请输入提交证据或资料名称'" :disabled="isEdit" maxlength="100" show-word-limit clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="记录" prop="record">
            <el-input type="textarea" v-model="formInfo.record" :placeholder="isEdit?'':'请输入记录'" :disabled="isEdit" maxlength="500" show-word-limit :autosize="{ minRows: 3}" clearable/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  name: '',
  dicts: ['dm_investigation_place'],
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
        time: null,
        place: null,
        participant: null,
        respondent: null,
        recorder: null,
        record: null
      },

      rules: {
        time: [{required: true, message: '请选择调查时间', trigger: 'change'}],
        participant: [{required: true, message: '请输入参加人', trigger: 'blur'}],
        recorder: [{required: true, message: '请输入提交证据或资料名称', trigger: 'blur'}],
        place: [{required: true, message: '请选择地点', trigger: 'change'}],
        respondent: [{required: true, message: '请输入被调查人', trigger: 'blur'}],
        record: [{required: true, message: '请输入记录', trigger: 'blur'}]
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

        // if (!this.formInfo.recorder) {
        //   this.formInfo.recorder = newVal.mediatorName + ',' + newVal.assistantName;
        // }

        // if (!this.formInfo.investigationRecordId && !this.formInfo.time) {
        //   this.formInfo.time = new Date();
        // }

        // console.log('this.formInfo', this.formInfo);
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // 表单验证
    validateForm() {
      return this.$refs.investigationRuleForm.validate();
    },

    // 取消验证结果
    resetValidateForm(){
      this.$refs.investigationRuleForm.clearValidate();
    },

    // 重置表单
    resetForm() {
      this.$refs.investigationRuleForm.resetFields();
      this.formInfo.workOrderId = null;
    },

    // 获取表单数据
    getFormData() {
      return this.formInfo;
    },

    setFormInfo(data) {
      this.formInfo = { ...this.formInfo, ...data };
    },

    // 刷新时间
    refreshTime() {
      this.formInfo.time = new Date();
    },
  }
};
</script>

<style scoped lang="scss"></style>
