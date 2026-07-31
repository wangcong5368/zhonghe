<!-- 导出对话框 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="600px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="行业" prop="industry">
        <el-select v-model="form.industry" placeholder="请选择行业" clearable>
          <el-option
            v-for="item in [{label: '银行业', value: '银行业'}, {label: '保险业', value: '保险业'}]"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="办结时间" prop="finishTime">
        <el-date-picker
          v-model="form.finishTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          :default-time="['16:30:00', '16:30:00']"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default {
  data() {
    return {
      title: "消保平台转办导出",
      visible: false,
      // 导入参数
      form: {
        industry: undefined,
        finishTime: undefined,
      },
      rules: {
        industry: [{ required: true, message: '行业为必填项', trigger: 'change' }],
        finishTime: [{ required: true, message: '办结时间为必填项', trigger: 'change' }],
      },
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            const nowTime = new Date();
            const todayTime = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 16, 30);
            const start = new Date(todayTime);
            const end = new Date(todayTime);
            start.setDate(start.getDate() - 1);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const nowTime = new Date();
            const todayTime = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 16, 30);
            const start = new Date(todayTime);
            const end = new Date(todayTime);
            start.setDate(start.getDate() - 2);
            end.setDate(end.getDate() - 1);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '前天',
          onClick(picker) {
            const nowTime = new Date();
            const todayTime = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 16, 30);
            const start = new Date(todayTime);
            const end = new Date(todayTime);
            start.setDate(start.getDate() - 3);
            end.setDate(end.getDate() - 2);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
    open() {
      const nowTime = new Date();
      const todayTime = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 16, 30);
      const start = new Date(todayTime);
      const end = new Date(todayTime);
      start.setDate(start.getDate() - 1);
      this.form = {
        industry: undefined,
        finishTime: [start, end],
      };
      this.resetForm("form");
      this.visible = true;
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const finishTimeStart = this.form.finishTime[0];
          const finishTimeEnd = this.form.finishTime[1];
          this.download("project/disputeMediation/export", { params: {industry: this.form.industry, finishTimeStart: this.parseTime(finishTimeStart, '{y}-{m}-{d} {h}:{i}:{s}'), finishTimeEnd: this.parseTime(finishTimeEnd, '{y}-{m}-{d} {h}:{i}:{s}')} }, `消保平台转办导出_${this.parseTime(finishTimeEnd, '{y}-{m}-{d}')}.xlsx`);
          this.visible = false;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.min_title {
  position: relative;
  width: 100%;
  height: 30px;
  line-height: 35px;
  background: #4682b4;
  color: #fff;
  padding-left: 5px;
  box-sizing: inherit;
  text-align: left;
  // margin-top: 10px;
  margin-bottom: 10px;
}
</style>
