<!-- 调查记录详情  -->
<template>
  <div>
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" @close="cancel" width="1250px">
      <div v-if="tabHeaderList.length > 0">
        <el-tabs v-model="activate" @tab-click="handleTab" tab-position="left" :closable="isDMMediator() && [DM_STATUS.DM_STATUS2,DM_STATUS.DM_STATUS3,DM_STATUS.DM_STATUS4].includes(row.status)" @edit="handleTabsEdit">
          <el-tab-pane v-for="(item, index) in tabHeaderList" :key="item.id" :label="item.time" :name="item.id">
            <div>
              <DetailForm ref="detailFormRef" v-if="activate === item.id" @success="getList"/>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <el-empty description="暂无记录" v-else/>
    </el-dialog>
  </div>
</template>

<script>
/** api */
import {getDisputeMediation, deleteInvestigationRecord} from '@/api/project/disputeMediation';
/** components */
import DetailForm from './detailForm.vue';
import { DM_STATUS } from '@/views/constant/CommonConstant'

export default {
  name: '',
  props: ['title'],
  components: {DetailForm},
  data() {
    return {
      dialogVisible: false,
      tabLoading: false,
      activate: null,
      btnLoading: false,
      workOrderId: null,
      tabHeaderList: [],
      dataList: [],
      row: {},
      DM_STATUS: DM_STATUS,
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row) {
      this.workOrderId = row.workOrderId;
      this.getList();
      this.dialogVisible = true;
    },

    cancel() {
      this.dialogVisible = false;
      this.reset();
    },

    reset() {
      this.activate = null;
      this.workOrderId = null;
      this.tabHeaderList = [];
      this.dataList = [];
      this.record = {};
    },

    /**
     * tab事件
     */

    // 点击tab
    handleTab(val) {
      this.activate = val.name;
      this.$nextTick(() => {
        this.dataList.forEach(e => {
          if (e.investigationRecordId.toString() === this.activate) {
            this.$refs.detailFormRef[0].open(this.row, e);
          }
        });
      });
    },

    // 删除tab
    handleTabsEdit(val) {
      this.$confirm('是否删除该条记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let options = {};
          this.dataList.forEach(e => {
            if (e.investigationRecordId.toString() === val) {
              options.investigationRecordId = e.investigationRecordId;
              options.workOrderId = e.workOrderId;
            }
          });
          deleteInvestigationRecord(options)
            .then(res => {
              this.$modal.msgSuccess(res.msg);
              this.getList();
            })
            .finally(() => {
            });
        })
        .catch(() => {
        });
    },

    /**获取调查记录 */
    getList(activateId) {
      getDisputeMediation(this.workOrderId).then(res => {
        this.row = res.data;
        this.dataList = res.data.dmInvestigationRecordList;
        if (this.dataList.length > 0) {
          this.tabHeaderList = this.dataList.map(item => ({
            id: item.investigationRecordId.toString(),
            time: item.time
          }));
          this.activate = activateId ? activateId.toString() : this.tabHeaderList[this.tabHeaderList.length - 1].id;
          this.$nextTick(() => {
            this.$refs.detailFormRef[0].open(this.row, this.dataList.find(i => i.investigationRecordId.toString() === this.activate));
          })
        } else {
          this.tabHeaderList = [];
        }
      })
    },
    // 校验工单调解员
    isDMMediator() {
      return this.$store.getters.userInfo.isDMMediator && (this.$store.getters.userInfo.userId === this.row.mediatorUserId || this.$store.getters.userInfo.userId === this.row.assistantUserId);
    },
  }
};
</script>

<style scoped lang="scss">
.respondentSelect ::v-deep .el-input {
  width: 100px;
}

.input-with-select ::v-deep .el-input-group__prepend {
  background-color: #fff;
}

.tips {
  font-size: 18px;
  width: 100%;
  text-align: center;
  color: #909399;
}
</style>
