<!--  审核协议书、审核用印 -->
<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col>
            <el-form-item label="审核结果" prop="result">
              <el-select v-model="form.result" placeholder="请选择">
                <el-option
                  v-for="item in dict.type.dm_audit_result"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.result === DM_AUDIT_RESULT.reject">
            <el-form-item label="驳回原因" prop="rejectReason">
              <el-input
                v-model="form.rejectReason"
                placeholder="请输入驳回原因"
                type="textarea"
                maxlength="1000"
                show-word-limit
                :autosize="{ minRows: 2}"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="visible=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {DM_AUDIT_RESULT} from "@/views/constant/CommonConstant";

export default {
  props: [],
  dicts: ["dm_audit_result"],
  components: {},
  data() {
    return {
      visible: false,
      rules: {
        result: [{required: true, message: '请选择审核结果', trigger: 'blur'}],
        rejectReason: [{required: true, message: '请输入驳回原因', trigger: 'blur'}],
      },
      form: {},
      title: "审核",
      // 常量
      DM_AUDIT_RESULT: DM_AUDIT_RESULT,
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    reset() {
      this.form = {
        result: '',
        rejectReason: '',
      };
    },
    open(title) {
      this.title = title;
      this.reset();
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.$emit('callback', this.form)
        }
      })
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
