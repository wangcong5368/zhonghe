<!-- 预约调解室确认弹窗 -->
<template>
  <div>
    <el-dialog
      title="预约信息确认"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      @close="cancel"
      width="600px"
      append-to-body
    >
      <el-descriptions
        :column="1"
        size="medium"
        border
        :labelStyle="{ width: '120px', textAlign: 'center' }"
      >
        <el-descriptions-item label="工单编号">
          {{ formData.workOrderId }}
        </el-descriptions-item>
        <el-descriptions-item label="调解员">
          {{ formData.mediatorName }}
        </el-descriptions-item>
        <el-descriptions-item label="被调解人">
          {{ formData.name }}
        </el-descriptions-item>
        <el-descriptions-item label="被调解机构">
          {{ formData.deptName }}
        </el-descriptions-item>
        <el-descriptions-item label="调解室">
          {{ formData.mediationRoomName }}
        </el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ formData.dateStr }}
        </el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="btnLoading">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from "@/utils/ruoyi";
import { addReservation } from "@/api/project/disputeMediation";

/**
 * @method success
 * @description 提交成功后通知父组件
 * @emits success
 */

export default {
  components: {},
  data() {
    return {
      dialogVisible: false,
      btnLoading: false,
      type: null,
      formData: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
    open(data, type = null, orderData) {
      this.type = type;
      this.init(data, type, orderData);
      this.dialogVisible = true;
    },

    // 数据初始化
    init(data, type, orderData) {
      if (type === "hasmediationRoom") {
        this.formData.workOrderId = data.workOrderId;
      } else {
        this.formData.workOrderId =
          "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
      }

      this.formData.mediationRoomId = data.mediationRoomId;
      this.formData.mediationRoomName = data.mediationRoomName;
      this.formData.date = data.date;
      this.formData.timeSpan = data.timeSpanValue;
      this.formData.dateStr =
        parseTime(data.date, "{y}-{m}-{d}") + " " + data.timeSpanLabel;

      this.formData.mediatorName = orderData.mediatorName;
      this.formData.name = orderData.name;
      this.formData.deptName = orderData.deptName;
    },

    cancel() {
      this.dialogVisible = false;
      this.reset();
    },

    reset() {
      this.formData = {};
      this.type = null;
    },

    // 提交
    submitForm() {
      this.btnLoading = true;

      const options = {
        workOrderId: this.formData.workOrderId,
        mediationRoomId: this.formData.mediationRoomId,
        date: this.formData.date,
        timeSpan: this.formData.timeSpan,
      };

      addReservation(options)
        .then((res) => {
          this.$modal.msgSuccess("预约成功");
          this.cancel();
          this.$emit("callback");
        })
        .finally(() => {
          this.btnLoading = false;
        });
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
