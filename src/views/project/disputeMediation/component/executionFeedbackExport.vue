<template>
  <el-dialog title="执行阶段导出" :visible.sync="visible" width="560px" append-to-body>
    <el-form ref="form" :model="form" label-width="110px">
      <el-form-item
        label="行业"
        prop="industry"
        :rules="[{ required: true, message: '行业为必填项', trigger: 'change' }]"
      >
        <el-select v-model="form.industry" placeholder="请选择行业" clearable style="width: 216px">
          <el-option label="银行业" value="银行业" />
          <el-option label="保险业" value="保险业" />
        </el-select>
      </el-form-item>
      <el-form-item
        label="履约回访时间"
        prop="returnVisitTime"
        :rules="[{ required: true, message: '履约回访时间为必填项', trigger: 'change' }]"
      >
        <el-date-picker
          v-model="form.returnVisitTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 400px"
        />
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
      visible: false,
      form: {
        industry: undefined,
        returnVisitTime: undefined
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', createDayRange(0));
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              picker.$emit('pick', createDayRange(-1));
            }
          },
          {
            text: '前天',
            onClick(picker) {
              picker.$emit('pick', createDayRange(-2));
            }
          }
        ]
      }
    };
  },
  methods: {
    open() {
      this.form = {
        industry: undefined,
        returnVisitTime: createDayRange(-1)
      };
      this.visible = true;
      this.$nextTick(() => this.$refs.form.clearValidate());
    },
    submitFileForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }

        const returnVisitTimeStart = this.form.returnVisitTime[0];
        const returnVisitTimeEnd = this.form.returnVisitTime[1];
        const industryName = this.form.industry === '银行业' ? '银行' : '保险';
        this.download(
          'project/disputeMediation/executionFeedbackExport',
          {
            params: {
              industry: this.form.industry,
              returnVisitTimeStart: this.parseTime(returnVisitTimeStart, '{y}-{m}-{d} {h}:{i}:{s}'),
              returnVisitTimeEnd: this.parseTime(returnVisitTimeEnd, '{y}-{m}-{d} {h}:{i}:{s}')
            }
          },
          `${industryName}-执行阶段反馈_${this.parseTime(returnVisitTimeEnd, '{y}-{m}-{d}')}.xlsx`
        );
        this.visible = false;
      });
    }
  }
};

function createDayRange(dayOffset) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  const end = new Date(start);
  end.setHours(23, 59, 59);
  return [start, end];
}
</script>
