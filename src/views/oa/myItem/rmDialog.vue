<template>
  <div>
      <el-dialog title="选择转发部门与转发人" :visible.sync="detailOpen" width="700px" append-to-body size="medium" :close-on-click-modal="false">
          <!-- 使用协办部门和协办人选择器 -->
          <el-form :model="assistDeptUserData" ref="assistDeptUserForm" :rules="rules">
              <assist-dept-user-selector
                  v-model="assistDeptUserData"
                  :is-view="isView"
                  :exclude-user-ids="[form.leadLeader, form.sponsorId]"
                  @change="handleAssistDeptUserChange"
                  ref="assistDeptUserSelectorDialog"
              ></assist-dept-user-selector>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button @click="cancelDialog">取 消</el-button>
              <el-button type="primary" @click="submitForm">提 交</el-button>
          </div>
      </el-dialog>
  </div>
</template>

<script>
import AssistDeptUserSelector from './AssistDeptUserSelector';
import { addOrganizer } from '@/api/oa/supervise';

export default {
  components: {
      AssistDeptUserSelector
  },
  data() {
      return {
          detailOpen: false,
          isView: false,
          form: {
              leadLeader: null,
              sponsorId: null,
              xbBusinessUnit: [],
              organizerIds: []
          },
          assistDeptUserData: {
              deptIds: [],
              userIds: []
          },
          id: null,
          // 添加表单验证规则
          rules: {
              deptIds: [
                  { type: 'array', required: true, message: '请选择转发部门', trigger: 'change' }
              ],
              userIds: [
                  { type: 'array', required: true, message: '请选择转发人员', trigger: 'change' }
              ]
          }
      };
  },
  methods: {
      openDialog(id) {
          this.detailOpen = true;
          this.id = id;
          // 清空表单数据
          this.resetForm();
      },

      // 清空表单数据
      resetForm() {
          this.assistDeptUserData = {
              deptIds: [],
              userIds: []
          };
          // 如果引用存在，重置子组件
          if (this.$refs.assistDeptUserSelectorDialog) {
              this.$refs.assistDeptUserSelectorDialog.reset();
          }
      },

      // 处理协办部门和协办人变更
      handleAssistDeptUserChange(data) {
          // 更新表单中的值
          this.form.xbBusinessUnit = data.deptIds;
          this.form.organizerIds = data.userIds;
      },

      // 表单提交前处理
      submitForm() {
          // 先进行表单验证
          if (this.assistDeptUserData.deptIds.length === 0) {
              this.$message.warning('请选择转发部门');
              return;
          }

          if (this.assistDeptUserData.userIds.length === 0) {
              this.$message.warning('请选择转发人员');
              return;
          }

          // 确保xbBusinessUnit是字符串格式
          let deptIds = this.form.xbBusinessUnit;
          if (deptIds && Array.isArray(deptIds)) {
              deptIds = deptIds.join(',');
          }

          // 将协办人ID数组转换为逗号分隔的字符串
          let userIds = this.form.organizerIds;
          if (userIds && Array.isArray(userIds)) {
              userIds = userIds.join(',');
          }

          // 提交API，参数包含部门ID和协办人ID
          addOrganizer({
              superviseId: this.id,
              organizerIds: userIds,
              organizerDeptIds: deptIds
          }).then(response => {
              this.$modal.msgSuccess('事项转发成功');
              this.detailOpen = false;
              // 重置表单数据
              this.resetForm();
              // 刷新父组件数据
              this.$bus.$emit('refresh');
          }).catch(error => {
              console.error('转发失败:', error);
          });
      },

      // 取消对话框
      cancelDialog() {
          this.detailOpen = false;
          this.resetForm();
      }
  },
  // 组件销毁前清理
  beforeDestroy() {
      this.resetForm();
  }
};
</script>
