<template>
  <el-row>
    <el-col :span="14">
      <div style="overflow-y: auto">
        <record-form ref="investigationRecordForm" :initial-data="formData" :isEdit="!isEditing"/>
      </div>

      <!-- 按钮区域 -->
      <div class="btn">
        <template v-if="!isEditing">
          <el-button type="primary" @click="startEdit" style="margin-right: 10px" v-if="isDMMediator() && (DM_STATUS.DM_STATUS2 === row.status || DM_STATUS.DM_STATUS3 === row.status || DM_STATUS.DM_STATUS4 === row.status)">修 改</el-button>
        </template>
        <template v-else>
          <el-button type="primary" style="margin: 0 10px" @click="submitForm" :loading="btnLoading">保 存</el-button>
          <el-button @click="cancelEdit">取 消</el-button>
        </template>
      </div>
    </el-col>
    <el-col :span="10">
      <div style="height: 400px;overflow-y: auto">
        <SoundRecording ref="soundRecordingRef" :isEditing="isEditing" @refresh="refresh"/>
      </div>
    </el-col>
  </el-row>
</template>

<script>
/** api */
import {updateInvestigationRecord} from '@/api/project/disputeMediation';
import recordForm from './formInfo.vue';
import { RECORD_RELATION_TYPE, DM_STATUS } from '@/views/constant/CommonConstant'
import SoundRecording from '@/views/project/disputeMediation/component/callSound/soundRecording.vue'

export default {
  name: '',
  props: ['title'],
  components: { SoundRecording, recordForm},
  data() {
    return {
      btnLoading: false,
      isEditing: false, // 编辑状态
      originalData: null, // 保存原始数据
      formData: {},
      row: {},
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      CALL_RELATION_TYPE: RECORD_RELATION_TYPE, // 通话记录关联类型
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row, data) {
      this.row = row;
      this.formData = {
        ...data
      };
      this.$refs.soundRecordingRef.open(row, data.callLogList, RECORD_RELATION_TYPE.investigationRecordSound, data.investigationRecordId, data.time);
    },

    startEdit() {
      // 保存原始数据
      this.originalData = JSON.parse(JSON.stringify(this.formData));
      this.isEditing = true;
    },

    cancelEdit() {
      this.isEditing = false;
      // 恢复原始数据
      this.formData = JSON.parse(JSON.stringify(this.originalData));
      this.$refs.investigationRecordForm.resetValidateForm()
      this.originalData = null;
    },

    // 提交
    async submitForm() {
      try {
        const isValid = await this.$refs.investigationRecordForm.validateForm();
        if (!isValid) {
          console.log('error submit!!');
          return false;
        }

        this.btnLoading = true;
        const childrenFormData = this.$refs.investigationRecordForm.getFormData();
        const res = await updateInvestigationRecord(childrenFormData);
        this.$modal.msgSuccess(res.msg);
        this.refresh();
        this.isEditing = false;
        this.originalData = null;
        // this.formData = {};
        // this.$refs.investigationRecordForm.resetForm();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.btnLoading = false;
      }
    },

    // 校验工单调解员
    isDMMediator() {
      return this.$store.getters.userInfo.isDMMediator && (this.$store.getters.userInfo.userId === this.row.mediatorUserId || this.$store.getters.userInfo.userId === this.row.assistantUserId);
    },

    refresh() {
      this.$emit('success', this.formData.investigationRecordId);
    },
  }
};
</script>
<style scoped lang="scss">
.btn {
  float: right;
  display: flex;
  align-items: center;
  padding-top: 10px;
}
</style>
