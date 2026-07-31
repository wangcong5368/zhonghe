<!-- 录像审核 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body destroy-on-close>
    <el-table :data="row.dmVideoAuditList">
      <el-table-column label="序号" type="index" align="center" width="50px">
        <template slot-scope="scope">
          <span>{{scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="调解室名称" width="100px">
        <template slot-scope="scope">
          <span>{{mediationRoomVideoMap.get(scope.row.mediationRoomVideoId).mediationRoomName}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="录像起止时间" width="150px">
        <template slot-scope="scope">
          <span>{{mediationRoomVideoMap.get(scope.row.mediationRoomVideoId).startTime}}</span>
          <br/>
          <span>{{mediationRoomVideoMap.get(scope.row.mediationRoomVideoId).endTime}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" property="applicantName" label="申请人" width="100px">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.applyTime" placement="top">
            <span>{{scope.row.applicantName}}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" property="applyReason" label="申请原因">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.applyReason" placement="top" v-if="scope.row.applyReason && scope.row.applyReason.length > 10">
            <span>{{scope.row.applyReason.substring(0, 10) + '...'}}</span>
          </el-tooltip>
          <span v-else>{{ scope.row.applyReason }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" property="auditor1Name" label="组长" width="100px"/>
      <el-table-column align="center" property="audit1Opinion" label="组长意见">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.audit1Opinion" placement="top" v-if="scope.row.audit1Opinion && scope.row.audit1Opinion.length > 10">
            <span>{{scope.row.audit1Opinion.substring(0, 10) + '...'}}</span>
          </el-tooltip>
          <span v-else>{{ scope.row.audit1Opinion }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" property="auditor2Name" label="部门长" width="100px"/>
      <el-table-column align="center" property="audit2Opinion" label="部门意见">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.audit2Opinion" placement="top" v-if="scope.row.audit2Opinion && scope.row.audit2Opinion.length > 10">
            <span>{{scope.row.audit2Opinion.substring(0, 10) + '...'}}</span>
          </el-tooltip>
          <span v-else>{{ scope.row.audit2Opinion }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" property="status" label="状态" width="100px">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_video_audit_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80">
        <template slot-scope="scope">
          <el-popover placement="left" width="500" v-model="scope.row.applyVisible" v-if="(scope.row.status === DM_VIDEO_AUDIT_STATUS.STATUS1 && $store.getters.userInfo.isDMVideoAuditor1) || (scope.row.status === DM_VIDEO_AUDIT_STATUS.STATUS2 && $store.getters.userInfo.isDMVideoAuditor2)">
            <el-form ref="auditForm" label-width="80px" :model="auditForm" v-if="scope.row.applyVisible">
              <el-form-item label="审核结果" :rules="[{ required: true, message: '审核结果为必填项', trigger: 'change' }]">
                <el-radio v-model="auditForm.result" :label="true">通过</el-radio>
                <el-radio v-model="auditForm.result" :label="false">驳回</el-radio>
              </el-form-item>
              <el-form-item label="审核意见">
                <el-input v-model="auditForm.auditOpinion" placeholder="请输入审核意见" maxlength="50" show-word-limit type="textarea" :autosize="{ minRows: 2}"/>
              </el-form-item>
            </el-form>
            <div style="text-align: right; margin-top: 10px">
              <el-button size="mini" type="text" @click="scope.row.applyVisible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="audit()">确定</el-button>
            </div>
            <el-button slot="reference" type="text" size="mini" plain round @click="changeMediationRoomVideoId(scope.row)">审核</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { getDisputeMediation, auditVideo } from '@/api/project/disputeMediation'
import { DM_VIDEO_AUDIT_STATUS } from '@/views/constant/CommonConstant'

export default {
  props: ['title'],
  dicts: ["dm_video_audit_status", "dm_audit_result"],
  data() {
    return {
      visible: false,
      row: {},
      mediationRoomVideoMap: new Map(),
      DM_VIDEO_AUDIT_STATUS: DM_VIDEO_AUDIT_STATUS,
      auditForm: {
        result: true,
        auditOpinion: null,
        workOrderId: null,
        mediationRoomVideoId: null,
      },
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
    open(row) {
      getDisputeMediation(row.workOrderId).then(response => {
        this.row = response.data;
        this.mediationRoomVideoMap = new Map();
        this.row.mediationRoomVideoList.forEach((item) => {
          this.mediationRoomVideoMap.set(item.mediationRoomVideoId, item);
        })
        // this.row.dmVideoAuditList.forEach((item) => {
        //   item.result = "1";
        //   item.auditOpinion = null;
        // })
        this.visible = true;
      })
    },
    changeMediationRoomVideoId(item) {
      this.auditForm.result = true;
      this.auditForm.auditOpinion = null;
      this.auditForm.videoAuditId = item.videoAuditId;
      this.auditForm.workOrderId = item.workOrderId;
    },
    audit(){
      this.$refs["auditForm"].validate((valid) => {
        if (valid) {
          auditVideo(this.auditForm).then((response) => {
            this.$modal.msgSuccess("操作成功");
            this.open(this.row);
            this.$emit('callback');
          }).catch(() => {
          })
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
