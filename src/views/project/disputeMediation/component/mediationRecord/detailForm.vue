<template>
  <div>
    <el-col :span="14">
      <div style="overflow-y: auto">
        <mediation-record-form ref="mediationRecordForm" :initial-data="formData" :isEdit="!isEditing" :row="row"/>
      </div>

      <!-- 按钮区域 -->
      <div class="btn">
        <template v-if="!isEditing">
          <el-button type="primary" @click="startEdit" style="margin-right: 10px" v-if="isDMMediator() && (DM_STATUS.DM_STATUS3 === row.status && SYS_YES_NO.sys_yes === row.deptAcceptMediate || DM_STATUS.DM_STATUS4 === row.status || DM_STATUS.DM_STATUS10 === row.status)">修 改</el-button>
        </template>
        <template v-else>
          <el-button type="primary" style="margin: 0 10px" @click="submitForm" :loading="btnLoading">保 存</el-button>
          <el-button @click="cancelEdit">取 消</el-button>
        </template>
      </div>
    </el-col>
    <el-col :span="10">
      <el-tabs style="margin-left: 10px;margin-right: 10px" type="card" v-model="relationActivate.name">
        <el-tab-pane label="通话录音" name="sound">
          <div style="height: 1000px;overflow-y: auto">
            <SoundRecording ref="soundRecordingRef" :isEditing="isEditing" @refresh="refresh" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="调解室录像" name="video">
          <div style="height: 1000px;overflow-y: auto">
            <VideoRecording ref="videoRecordingRef" :isEditing="isEditing" @refresh="refresh" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </div>
</template>

<script>
/** api */
import {updateMediationRecord} from '@/api/project/disputeMediation';
import MediationRecordForm from './formInfo.vue';
import { RECORD_RELATION_TYPE, DM_STATUS, SYS_YES_NO } from '@/views/constant/CommonConstant'
import SoundRecording from '@/views/project/disputeMediation/component/callSound/soundRecording.vue'
import VideoRecording from '@/views/project/disputeMediation/component/mediationRoomVideo/videoRecording.vue'

export default {
  name: '',
  components: { SoundRecording, MediationRecordForm, VideoRecording },
  props: ["relationActivate"],
  dicts: ['sys_yes_no'],
  data() {
    return {
      btnLoading: false,
      isEditing: false, // 编辑状态
      originalData: null, // 保存原始数据
      formData: {},
      row: {},
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      CALL_RELATION_TYPE: RECORD_RELATION_TYPE, // 通话记录关联类型
      SYS_YES_NO: SYS_YES_NO, // 通话记录关联类型
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
        mediationRecordId: data.mediationRecordId || null,
        workOrderId: data.workOrderId || null,
        time: data.time || null,

        place: data.place || null,
        participant: data.participant || null,
        respondent: data.respondent || null,
        recorder: data.recorder || null,
        record: data.record || null,
        result: data.result || null,

        mediationAmount: data.mediationAmount || null,
        needReturnVisit: data.needReturnVisit || null,
        isGetJudicialCheck: data.isGetJudicialCheck || null,
        isApplyJudicialCheck: data.isApplyJudicialCheck || null,
        failReason: data.failReason || null,
        otherProblem: data.otherProblem || null,
        consumerIdentificationPhoto: data.consumerIdentificationPhoto || null,
        institutionIdentificationPhoto: data.institutionIdentificationPhoto || null,
        scenePhoto: data.scenePhoto || null,
        attachment: data.attachment || null
      };
      this.$refs.soundRecordingRef.open(row, data.callLogList, RECORD_RELATION_TYPE.mediationRecordSound, data.mediationRecordId, data.time);
      this.$refs.videoRecordingRef.open(row, data.mediationRoomVideoList, RECORD_RELATION_TYPE.mediationRecordVideo, data.mediationRecordId, data.time);
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
      this.$refs.mediationRecordForm.resetValidateForm()
      this.originalData = null;
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
        const res = await updateMediationRecord(childrenFormData);
        this.$modal.msgSuccess(res.msg);
        this.refresh();
        this.isEditing = false;
        this.originalData = null;
        this.formData = {};
        this.$refs.mediationRecordForm.resetForm();
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
      this.$emit('success', this.formData.mediationRecordId);
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
