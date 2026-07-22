<template>
  <el-row>
    <el-col :span="14">
      <div style=" padding: 0 20px 60px">
        <record-form ref="callBackRecordForm" :initial-data="formData" :isEdit="!isEditing" :row="row" />
      </div>

      <!-- 按钮区域 -->
      <div class="btn">
        <template v-if="!isEditing">
          <el-button type="primary" @click="startEdit" style="margin-right: 10px"
            v-if="isDMMediator() && DM_STATUS.DM_STATUS10 === row.status">修 改</el-button>
        </template>

        <template v-else>
          <el-button type="primary" style="margin: 0 10px" @click="submitForm" :loading="btnLoading">保 存</el-button>
          <el-button @click="cancelEdit">取 消</el-button>
        </template>
      </div>
    </el-col>

    <el-col :span="10">
      <div class="recording-panel">
        <div class="recording-panel__header">
          <div>
            <i class="el-icon-headset" />
            <span>关联通话录音</span>
          </div>
          <span>可手动选择或按回访时间自动匹配</span>
        </div>
        <SoundRecording ref="soundRecordingRef" :isEditing="isEditing" :show-text-buttons="true" @refresh="refresh" />
      </div>
    </el-col>
  </el-row>
</template>

<script>
/** api */
import { updateReturnVisit, saveOrUpdateReturnVisitExpand } from '@/api/project/disputeMediation';
import recordForm from './formInfo.vue';
import SoundRecording from '@/views/project/disputeMediation/component/callSound/soundRecording.vue';
import { DM_STATUS, RECORD_RELATION_TYPE } from '@/views/constant/CommonConstant';

export default {
  name: '',
  components: { recordForm, SoundRecording },
  dicts: ['dm_investigation_place', 'dm_mediation_result', 'sys_yes_no'],
  data() {
    return {
      btnLoading: false,
      isEditing: false, // 编辑状态
      originalData: null, // 保存原始数据
      formData: {},
      row: {},
      DM_STATUS: DM_STATUS // 纠纷业务状态
    };
  },
  created() { },
  mounted() { },
  methods: {
    open(row, data) {
      this.row = row;
      this.formData = {
        returnVisitId: data.returnVisitId || null,
        workOrderId: data.workOrderId || null,
        time: data.time || null,
        cause: data.cause || null,
        content: data.content || null,
        manageDeptId: data.manageDeptId || null,
        executionCompletedFlag: data.executionCompletedFlag || null,
        financialCauseFailureFlag: data.financialCauseFailureFlag || null,
        returnVisitType: data.returnVisitType || null
      };
      this.$nextTick(() => {
        this.$refs.soundRecordingRef.open(
          row,
          data.callLogList || [],
          RECORD_RELATION_TYPE.returnVisitRecordSound,
          data.returnVisitId,
          data.time
        );
      });
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
      this.$refs.callBackRecordForm.resetValidateForm();
      this.originalData = null;
    },

    // 提交
    async submitForm() {
      try {
        const isValid = await this.$refs.callBackRecordForm.validateForm();
        if (!isValid) {
          console.log('error submit!!');
          return false;
        }

        this.btnLoading = true;
        const childrenFormData = this.$refs.callBackRecordForm.getFormData();
        childrenFormData.returnVisitId = this.formData.returnVisitId;
        childrenFormData.manageDeptId = this.formData.manageDeptId;
        const { executionCompletedFlag, financialCauseFailureFlag, returnVisitType, ...restChildrenFormData } = childrenFormData;

        const res = await updateReturnVisit(restChildrenFormData);
        await saveOrUpdateReturnVisitExpand({
          returnVisitId: restChildrenFormData.returnVisitId,
          workOrderId: this.row.workOrderId,
          manageDeptId: this.row.manageDeptId,
          executionCompletedFlag,
          financialCauseFailureFlag,
          returnVisitType,
          mediatorUserId: this.row.mediatorUserId
        });
        this.$modal.msgSuccess(res.msg);
        this.$emit('success');
        this.isEditing = false;
        this.originalData = null;
        this.formData = {};
        this.$refs.callBackRecordForm.resetForm();
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
      this.$emit('success');
    }
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

.recording-panel {
  padding: 0 12px;
}

.recording-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
  font-weight: 600;

  i {
    margin-right: 6px;
    color: #409eff;
  }

  >span {
    color: #909399;
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
