<!-- 派单审核 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body>
    <div class="block">
      <el-timeline v-if="row && row.dmMediatorAuditList.length > 0">
        <el-timeline-item :timestamp="mediatorAudit.createTime" placement="top" v-for="(mediatorAudit, index) in row.dmMediatorAuditList" :key="index">
          <el-card>
            <el-descriptions class="margin-top" :column="2" border>
              <template slot="extra">
                <dict-tag :options="dict.type.dm_mediator_audit_status" :value="mediatorAudit.status" />
              </template>
              <el-descriptions-item >
                <template slot="label">
                  <i class="el-icon-user-solid"/>申请人
                </template>
                {{ mediatorAudit.applicantName }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-date"/>申请时间
                </template>
                {{ mediatorAudit.applyTime }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-user"/>原调解员
                </template>
                {{ mediatorAudit.formerName }}
              </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-user"/>现调解员
                </template>
                {{ mediatorAudit.latterName }}
              </el-descriptions-item>

              <template v-if="mediatorAudit.auditor">
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-user-solid"/>审核人
                  </template>
                  {{ mediatorAudit.auditorName }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-date"/>审核时间
                  </template>
                  {{ mediatorAudit.auditTime }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-date"/>审核意见
                  </template>
                  {{ mediatorAudit.auditOpinion }}
                </el-descriptions-item>
              </template>
            </el-descriptions>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty description="暂无记录" v-else/>
    </div>
  </el-dialog>
</template>

<script>

import { getDisputeMediation } from '@/api/project/disputeMediation'

export default {
  name: '',
  props: ['title'],
  dicts: ["dm_mediator_audit_status"],
  data() {
    return {
      loading: false,
      visible: false,
      row: null,
    };
  },
  methods: {
    open(row) {
      getDisputeMediation(row.workOrderId).then(response => {
        this.row = response.data
        this.visible = true;
      })
    },
    cancel() {
      this.visible = false;
    },
  },
};
</script>
