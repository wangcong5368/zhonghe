<!-- 已关联调解室录像记录  -->
<template>
  <div>
    <template v-if="list.length > 0">
      <el-timeline >
        <el-timeline-item :timestamp="item.startTime" placement="top" v-for="(item, index) in list" :key="index">
          <el-row>
            <el-col :span="23">
              <el-card>
                <el-row>
                  <el-col :span="20">
                    <p>调解室名称：{{ item.mediationRoomName }}</p>
                    <p>摄像头：{{ item.camera }}</p>
                    <p>开始时间：{{ item.startTime }}</p>
                    <p>结束时间：{{ item.endTime }}</p>
                    <video width="280" height="auto" controls="controls" ref="videoRef" @play="onPlay(index)" v-show="item.videoVisible">
                      <source :src="item.ossUrl" v-if="item.videoVisible"/>
<!--                      <source :src="item.ossUrl.replace('https://obs-tj5.cucloud.cn/', '/oss/')" v-if="item.videoVisible && _env==='prod'"/>-->
                    </video>
                    <el-row :gutter="10" class="mb8">
<!--                      已上传，不在编辑状态，是主调或助调，没有有效期或有效已过，没有申请记录或已申请通过次数小于2，没有正在审核中的申请-->
                      <el-col :span="1.5" v-if="item.status === DM_VIDEO_STATUS.STATUS3 && !isEditing && isDMMediator() && (!item.ossExpiration || new Date(item.ossExpiration.replace(' ', 'T')) < new Date()) && (!map.get(item.mediationRoomVideoId) || (map.get(item.mediationRoomVideoId).filter(i => i.status === DM_VIDEO_AUDIT_STATUS.STATUS20 ).length < 2 && !map.get(item.mediationRoomVideoId).find(i => i.status === DM_VIDEO_AUDIT_STATUS.STATUS1 || i.status === DM_VIDEO_AUDIT_STATUS.STATUS2)))">
                        <el-popover placement="left" width="350" v-model="item.applyVisible">
                          <p>申请查看原因</p>
                          <el-input v-model="item.applyReason" placeholder="请输入原因" maxlength="50" show-word-limit type="textarea" :autosize="{ minRows: 2}"/>
                          <div style="text-align: right; margin-top: 10px">
                            <el-button size="mini" type="text" @click="item.applyVisible = false">取消</el-button>
                            <el-button type="primary" size="mini" @click="apply(item)">确定</el-button>
                          </div>
                          <el-button slot="reference" type="warning" size="mini" plain round>申请查看</el-button>
                        </el-popover>
                      </el-col>
                      <el-col :span="1.5" v-if="item.status === DM_VIDEO_STATUS.STATUS3 && !isEditing && map.get(item.mediationRoomVideoId)">
                        <el-popover placement="right" width="500" v-model="item.auditVisible">
                          <el-timeline >
                            <el-timeline-item :timestamp="mediationRoomVideo.applyTime" placement="top" v-for="(mediationRoomVideo, mediationRoomVideoIndex) in map.get(item.mediationRoomVideoId)" :key="index">
                              <el-card>
                                <el-descriptions :column="1">
                                  <el-descriptions-item label="申请人">{{ mediationRoomVideo.applicantName }}</el-descriptions-item>
                                  <el-descriptions-item label="申请原因">{{ mediationRoomVideo.applyReason }}</el-descriptions-item>
                                  <el-descriptions-item label="组长" v-if="mediationRoomVideo.auditor1">{{ mediationRoomVideo.auditor1Name }}</el-descriptions-item>
                                  <el-descriptions-item label="组长意见" v-if="mediationRoomVideo.auditor1">{{ mediationRoomVideo.audit1Opinion }}</el-descriptions-item>
                                  <el-descriptions-item label="部门长" v-if="mediationRoomVideo.auditor2">{{ mediationRoomVideo.auditor2Name }}</el-descriptions-item>
                                  <el-descriptions-item label="部门长意见" v-if="mediationRoomVideo.auditor2">{{ mediationRoomVideo.audit2Opinion }}</el-descriptions-item>
                                  <el-descriptions-item label="状态">
                                    <dict-tag :options="dict.type.dm_video_audit_status" :value="mediationRoomVideo.status" />
                                  </el-descriptions-item>
                                </el-descriptions>
                              </el-card>
                            </el-timeline-item>
                          </el-timeline>
<!--                          <el-table :data="map.get(item.mediationRoomVideoId)">-->
<!--                            <el-table-column property="applicantName" label="申请人" align="center"/>-->
<!--                            <el-table-column property="applyTime" label="申请时间" align="center" width="100"/>-->
<!--                            <el-table-column property="applyReason" label="申请原因" align="center"/>-->
<!--                            <el-table-column property="auditor1Name" label="组长" align="center"/>-->
<!--                            <el-table-column property="audit1Opinion" label="组长意见" align="center"/>-->
<!--                            <el-table-column property="auditor2Name" label="部门长" align="center"/>-->
<!--                            <el-table-column property="audit2Opinion" label="部门长意见" align="center"/>-->
<!--                            <el-table-column property="status" label="状态" align="center">-->
<!--                              <template slot-scope="scope">-->
<!--                                <dict-tag :options="dict.type.dm_video_audit_status" :value="scope.row.status"/>-->
<!--                              </template>-->
<!--                            </el-table-column>-->
<!--                          </el-table>-->
                          <el-button slot="reference" type="info" size="mini" plain round>申请记录</el-button>
                        </el-popover>
                      </el-col>
                      <el-col :span="1.5" v-if="!item.videoVisible && (isDMMediator() || $store.getters.userInfo.isDMVideoAuditor2) && (item.ossExpiration && new Date(item.ossExpiration.replace(' ', 'T')) >= new Date())">
                        <el-tooltip class="item" effect="dark" :content="'有效期至'+item.ossExpiration" placement="bottom">
                          <el-button type="primary" size="mini" plain round @click="item.videoVisible=true;$forceUpdate();">查看录像</el-button>
                        </el-tooltip>
                      </el-col>
                    </el-row>
                  </el-col>
                  <el-col :span="1" :offset="3">
                    <i class="el-icon-close hover-icon" @click="handleDelete(item)" v-if="isDMMediator() && !isEditing"/>
                  </el-col>
                </el-row>
              </el-card>
            </el-col>
          </el-row>
        </el-timeline-item>
      </el-timeline>
      <div style="display: flex; justify-content: center; align-items: center; padding-left: 40px">
        <el-tooltip class="item" effect="dark" content="手动关联" placement="left" v-if="time">
          <el-button type="primary" icon="el-icon-plus" circle @click="select" v-if="isDMMediator() && !isEditing"/>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="自动关联" placement="right" v-if="time">
          <el-button type="primary" icon="el-icon-s-operation" circle @click="handleAutoRelate" v-if="isDMMediator() && !isEditing"/>
        </el-tooltip>
      </div>
    </template>
    <el-empty description="暂无关联调解室录像" :image-size="100" v-else>
      <el-tooltip class="item" effect="dark" content="手动关联" placement="left" v-if="time">
        <el-button type="primary" icon="el-icon-plus" circle @click="select" v-if="isDMMediator() && !isEditing"/>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="自动关联" placement="right" v-if="time">
        <el-button type="primary" icon="el-icon-s-operation" circle @click="handleAutoRelate" v-if="isDMMediator() && !isEditing"/>
      </el-tooltip>
    </el-empty>

    <SelectVideo ref="selectVideoRef" @callback="handleAdd" :disable-ids="list.map(i => i.mediationRoomVideoId)"/>
  </div>
</template>

<script>
import { addRecordRelation, deleteRecordRelation, autoRelate, applyViewVideo } from "@/api/project/disputeMediation";
import SelectVideo from '@/views/project/disputeMediation/component/mediationRoomVideo/selectVideo.vue'
import { DM_VIDEO_AUDIT_STATUS, DM_VIDEO_STATUS } from '@/views/constant/CommonConstant'

export default {
  name: '',
  props: ['isEditing'],
  dicts: ['dm_video_audit_status'],
  components: { SelectVideo },
  data() {
    return {
      row: null,
      map: null,
      list: [],
      type: null,
      recordId: null,
      time: null,
      currentPlayingIndex: null,
      DM_VIDEO_STATUS: DM_VIDEO_STATUS,
      DM_VIDEO_AUDIT_STATUS: DM_VIDEO_AUDIT_STATUS,
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row, list, type, recordId, time) {
      this.row = {};
      this.map = new Map();
      this.list = [];
      this.type = type;
      this.recordId = recordId;
      this.time = time;

      this.onPlay(null);
      this.$nextTick(() => {
        this.row = row;
        this.list = list;
        this.map = row.dmVideoAuditList.reduce((map, videoAudit) => {
          if (!map.get(videoAudit.mediationRoomVideoId)) {
            map.set(videoAudit.mediationRoomVideoId, [])
          }
          map.get(videoAudit.mediationRoomVideoId).push(videoAudit);
          return map;
        }, this.map);
      })
    },

    // 选择调解室录像记录
    select() {
      this.onPlay(null);
      this.$refs.selectVideoRef.open(this.row.workOrderId);
    },

    onPlay(index) {
      // 如果有视频正在播放，暂停它
      if (this.currentPlayingIndex !== null && this.currentPlayingIndex !== index) {
        const video = this.$refs.videoRef[this.currentPlayingIndex].pause();
        if (video) {
          video.pause()
        }
      }
      this.currentPlayingIndex = index;
    },

    // 关联记录
    handleAdd(item) {
      addRecordRelation({
        'workOrderId': this.row.workOrderId,
        'type': this.type,
        'id1': this.recordId,
        'id2': item.mediationRoomVideoId
      }).then(response => {
        this.$modal.msgSuccess('操作成功')
        this.$refs.selectVideoRef.close()
        this.$emit('refresh')
      })
    },

    // 取消关联记录
    handleDelete(item) {
      this.$confirm('是否取消关联该调解室录像?', '取消关联', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRecordRelation({
          'workOrderId': this.row.workOrderId,
          'type': this.type,
          'id1': this.recordId,
          'id2': item.mediationRoomVideoId
        }).then(response => {
          this.$modal.msgSuccess('操作成功')
          this.$emit('refresh')
        })
      })
    },

    // 确定自动关联
    handleAutoRelate() {
      this.$confirm('确认是否自动关联调解室录像记录', '自动关联', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        autoRelate({
          'workOrderId': this.row.workOrderId,
          'type': this.type,
          'id1': this.recordId,
        }).then(response => {
          this.$modal.msgSuccess('操作成功')
          this.$emit('refresh')
        })
      })
    },

    // 申请查看录像
    apply(item) {
      applyViewVideo(item).then(res => {
        item.applyVisible = false;
        this.$modal.msgSuccess("操作成功");
        this.$emit('refresh')
      }).catch(() => {
        item.applyVisible = false;
      })
    },

    // 校验工单调解员
    isDMMediator() {
      return this.$store.getters.userInfo.isDMMediator && (this.$store.getters.userInfo.userId === this.row.mediatorUserId || this.$store.getters.userInfo.userId === this.row.assistantUserId);
    },
  }
}
</script>

<style lang="scss" scoped>
.hover-icon:hover {
  color: #1872ff; /* 鼠标悬停时图标变成蓝色 */
  cursor: pointer; /* 鼠标悬停时变成点击手势 */
}
</style>
