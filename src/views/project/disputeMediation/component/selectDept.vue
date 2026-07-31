<!-- 选择调解员 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="500px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="机构名称" prop="deptId">
            <treeselect
              v-model="form.deptId"
              :options="deptOptions"
              :normalizer="normalizer"
              @input="deptChange"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="机构类型" prop="type">
            <el-cascader
              v-model="form.deptType"
              :options="dict.type.dept_type.options"
              :props="{ expandTrigger: 'hover', emitPath: false }"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { deptChange } from "@/api/project/disputeMediation";
import { DEPT_TYPE } from '@/views/constant/CommonConstant.js'
import Treeselect from '@riophae/vue-treeselect'

export default {
  name: '',
  components: { Treeselect },
  props: [ "title", "deptOptions", "deptMap" ],
  dicts: [ "dept_type" ],
  data() {
    return {
      loading: false,
      visible: false,
      form: {},
      rules: {
        deptId: [{ required: true, message: '请选择', trigger: 'blur' }],
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
    };
  },
  watch: {
    // 初始化字典，用于层级选择器
    "dict.type.dept_type"(newV, oldV) {
      this.initDict(newV, oldV);
    },
  },

  methods: {
    open(row) {
      this.resetForm("form");
      this.form = {
        workOrderId: row.workOrderId,
        deptId: row.deptId,
        deptType: row.deptType,
      };
      this.visible = true;
    },
    /** 机构发生变化 */
    deptChange() {
      if (this.form.deptId) {
        this.form.deptType = this.deptMap.get(this.form.deptId).type;
      } else {
        this.form.deptType = null;
      }
    },
    /** 转换机构数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          deptChange(this.form).then(() => {
            this.$modal.msgSuccess("操作成功");
            this.loading = false;
            this.visible = false;
            this.$emit('callback')
          }).catch(() => {
            this.loading = false;
          })
        }
      });
    },
    cancel() {
      this.visible = false;
    },
  },
};
</script>
