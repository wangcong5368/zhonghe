<template>
  <div>
    <div style="height: 500px; overflow-y: auto; padding: 0 20px 60px">
      <record-form ref="callBackRecordForm" :initial-data="formData" :isEdit="!isEditing" :row="row"/>
    </div>

    <!-- 按钮区域 -->
    <div class="btn">
      <template v-if="!isEditing">
        <el-button type="primary" @click="startEdit" style="margin-right: 10px" v-if="isDMMediator() && DM_STATUS.DM_STATUS10 === row.status">修 改</el-button>
      </template>

      <template v-else>
        <el-button type="primary" style="margin: 0 10px" @click="submitForm" :loading="btnLoading">保 存</el-button>
        <el-button @click="cancelEdit">取 消</el-button>
      </template>
    </div>
  </div>
</template>

<script>
/** api */
import {updateReturnVisit} from '@/api/project/disputeMediation';
import recordForm from './formInfo.vue';
import {DM_STATUS} from "@/views/constant/CommonConstant";

export default {
  name: '',
  components: {recordForm},
  dicts: ['dm_investigation_place', 'dm_mediation_result', 'sys_yes_no'],
  data() {
    return {
      btnLoading: false,
      isEditing: false, // 编辑状态
      originalData: null, // 保存原始数据
      formData: {},
      row: {},
      DM_STATUS: DM_STATUS, // 纠纷业务状态
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
        returnVisitId: data.returnVisitId || null,
        workOrderId: data.workOrderId || null,
        time: data.time || null,
        cause: data.cause || null,
        content: data.content || null,
        manageDeptId: data.manageDeptId || null
      };
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
      this.$refs.callBackRecordForm.resetValidateForm()
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
        const res = await updateReturnVisit(childrenFormData);
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
