<!-- 选择调解员 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="调解员" prop="userId">
        <el-select v-model="form.userId" placeholder="请选择调解员" clearable style="width: 100%">
          <el-option
            v-for="item in mediatorList"
            :key="item.mediatorUserId"
            :label="item.remark"
            :value="item.mediatorUserId"
            :disabled="item.disabled"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { mediatorList, mediatorChange, assistantChange } from "@/api/project/disputeMediation";
import { DEPT_TYPE, DM_ENTRY_CHANNEL } from '@/views/constant/CommonConstant.js'

export default {
  name: '',
  props: ['title'],
  data() {
    return {
      loading: false,
      visible: false,
      mediatorList: [],
      form: {},
      rules: {
        userId: [{ required: true, message: '请选择调解员', trigger: 'blur' }],
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
    };
  },
  methods: {
    open(row) {
      this.form = {
        workOrderId: undefined,
        userId: undefined,
        assistantUserId: undefined,
        mediatorUserId: undefined,
      };
      this.resetForm("form");
      mediatorList(DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel) ? 'court' : 'center').then((res) => {
        if (res && res.code === 200) {
          this.mediatorList = res.data;
          this.mediatorList.forEach((item) => {
            if (DEPT_TYPE.bankList.includes(item.workDeptType)) {
              item.remark = item.nickName + "(案件数:" + item.hasNum.length + ";" + "银行" + ")";
            } else if (DEPT_TYPE.nonBankList.includes(item.workDeptType)) {
              item.remark = item.nickName + "(案件数:" + item.hasNum.length + ";" + "非银" + ")";
            } else if (DEPT_TYPE.insuranceList.includes(item.workDeptType)) {
              item.remark = item.nickName + "(案件数:" + item.hasNum.length + ";" + "保险" + ")";
            }
            if (this.title.startsWith("选择助理调解员") || this.title.startsWith("修改助理调解员")) {
              // 和调解员不能是同一人
              item.disabled = item.mediatorUserId === row.mediatorUserId;
            } else if (this.title.startsWith("选择调解员") || this.title.startsWith("修改调解员")) {
              // 机构避嫌
              item.disabled = item.disableDpetIdList.includes(row.deptId);
            }
            if (DEPT_TYPE.bankList.includes(row.deptType) || DEPT_TYPE.nonBankList.includes(row.deptType)) {
              // 银行/非银的单子归到银行调解员
              item.disabled = item.disabled || !DEPT_TYPE.bankList.includes(item.workDeptType) && !DEPT_TYPE.nonBankList.includes(item.workDeptType);
            } else if (DEPT_TYPE.insuranceList.includes(row.deptType)) {
              // 保险的单子归保险调解员
              item.disabled = item.disabled || !DEPT_TYPE.insuranceList.includes(item.workDeptType);
            }
            if (!item.participate) {
              item.disabled = true
            }
          });
          this.form.workOrderId = row.workOrderId;
          if (this.title.startsWith("选择助理调解员") || this.title.startsWith("修改助理调解员")) {
            this.form.userId = row.assistantUserId;
            // if (!this.mediatorList.some(item => item.mediatorUserId === row.assistantUserId)) {
            //   this.mediatorList.push({
            //     mediatorUserId: row.assistantUserId,
            //     nickName: row.assistantName,
            //     remark: row.assistantName,
            //     disabled: true,
            //   });
            // }
          } else if (this.title.startsWith("选择调解员") || this.title.startsWith("修改调解员")) {
            this.form.userId = row.mediatorUserId;
            // if (!this.mediatorList.some(item => item.mediatorUserId === row.mediatorUserId)) {
            //   this.mediatorList.push({
            //     mediatorUserId: row.mediatorUserId,
            //     nickName: row.mediatorName,
            //     remark: row.mediatorName,
            //     disabled: true,
            //   });
            // }
          }
          this.visible = true;
        }
      });
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.form.assistantUserId = this.form.userId;
          this.form.mediatorUserId = this.form.userId;
          if (this.title.startsWith("选择助理调解员") || this.title.startsWith("修改助理调解员")) {
            assistantChange(this.form).then(() => {
              this.$modal.msgSuccess("操作成功");
              this.loading = false;
              this.visible = false;
              this.$emit('callback')
            }).catch(() => {
              this.loading = false;
            })
          } else if (this.title.startsWith("选择调解员") || this.title.startsWith("修改调解员")) {
            mediatorChange(this.form).then(() => {
              this.$modal.msgSuccess("操作成功");
              this.loading = false;
              this.visible = false;
              this.$emit('callback')
            }).catch(() => {
              this.loading = false;
            })
          } else {
            this.loading = false;
            this.$modal.msgError("错误的标题");
          }
        }
      });
    },
    cancel() {
      this.visible = false;
    },
  },
};
</script>
