<template>
  <div>
    <div style="height: 500px; overflow-y: auto; padding: 0 20px 60px">
      <record-form ref="agreementRecordForm" :initial-data="formData" :isEdit="!isEditing"/>
    </div>

    <!-- 按钮区域 -->
    <div class="btn">
      <template v-if="!isEditing">
        <el-button type="primary" @click="startEdit" style="margin-right: 10px" v-if="$store.getters.userInfo.isDMInstitutionHandle && DM_STATUS.DM_STATUS10 === row.status">修 改</el-button>
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
import {updateFulfillment} from '@/api/project/disputeMediation';
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
        fulfillmentId: data.fulfillmentId || null,
        workOrderId: data.workOrderId || null,
        manageDeptId: data.manageDeptId || null,
        isFulfill: data.isFulfill || null,
        attachment: data.attachment || null
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
      this.$refs.agreementRecordForm.resetValidateForm()
      this.originalData = null;
    },

    // 提交
    async submitForm() {
      try {
        const isValid = await this.$refs.agreementRecordForm.validateForm();
        if (!isValid) {
          console.log('error submit!!');
          return false;
        }

        this.btnLoading = true;
        const childrenFormData = this.$refs.agreementRecordForm.getFormData();
        childrenFormData.fulfillmentId = this.formData.fulfillmentId;
        childrenFormData.manageDeptId = this.formData.manageDeptId;

        const res = await updateFulfillment(childrenFormData);
        this.$modal.msgSuccess(res.msg);
        this.$emit('success');
        this.isEditing = false;
        this.originalData = null;
        this.formData = {};
        this.$refs.agreementRecordForm.resetForm();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.btnLoading = false;
      }
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
