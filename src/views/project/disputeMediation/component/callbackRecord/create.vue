<template>
  <div>
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" @close="cancel" width="600px">
      <div style="padding: 0 20px">
        <record-form ref="callBackRecordForm" :initial-data="formData" :row="row"/>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="btnLoading">提 交</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {addReturnVisit} from '@/api/project/disputeMediation';
import {parseTime} from '@/utils/ruoyi';
import recordForm from './formInfo.vue';

export default {
  name: '',
  props: ['title'],
  components: {
    recordForm
  },
  data() {
    return {
      row: {},
      dialogVisible: false,
      btnLoading: false,
      formData: {
        workOrderId: null,
      }
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row) {
      this.row = row;
      this.formData.workOrderId = row.workOrderId;
      this.dialogVisible = true;
    },

    cancel() {
      this.dialogVisible = false;
      this.reset();
    },
    reset() {
      this.$refs.callBackRecordForm.resetForm();
      this.formData.workOrderId = null;
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
        childrenFormData.time = parseTime(childrenFormData.time, '{y}-{m}-{d} {h}:{i}:{s}');
        const res = await addReturnVisit(childrenFormData);
        this.$modal.msgSuccess(res.msg);
        this.$emit('callback', 'b', this.row);
        this.cancel();
        this.$refs.callBackRecordForm.resetForm();
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.btnLoading = false;
      }
    }
  }
};
</script>

<style scoped lang="scss"></style>
