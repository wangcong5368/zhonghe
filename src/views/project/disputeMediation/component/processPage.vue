<!-- 流程显示页面 -->
<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body>
      <el-timeline v-if="row.dmAgreementAuditList.length > 0">
        <el-timeline-item :timestamp="item.createTime" placement="top" v-for="(item, index) in row.dmAgreementAuditList" :key="index">
          <el-card>
            <div style="display:flex;align-items:center">
              <dict-tag :options="dict.type.dm_agreement_step" :value="item.step"/>
              <dict-tag style="margin-left:20px" :options="dict.type.dm_audit_result" :value="item.result"/>
            </div>
            <p v-if="item.result === DM_AUDIT_RESULT.reject"><strong>驳回原因：</strong> {{ item.rejectReason }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty description="暂无记录" v-else/>
    </el-dialog>
  </div>
</template>

<script>

import {DM_AUDIT_RESULT} from "@/views/constant/CommonConstant";
/** api */
import {getDisputeMediation} from '@/api/project/disputeMediation';

export default {
  dicts: ["dm_agreement_step", "dm_audit_result"],
  props: ["title"],
  components: {},
  data() {
    return {
      visible: false,
      row: {
        dmAgreementAuditList: []
      },
      DM_AUDIT_RESULT: DM_AUDIT_RESULT,
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row) {
      getDisputeMediation(row.workOrderId).then(response => {
        this.row = response.data;
        this.visible = true;
      });
    },
  },
  computed: {
  },
};
</script>
<style scoped lang="scss">
.tips {
  font-size: 18px;
  width: 100%;
  text-align: center;
  color: #909399;
}
</style>
