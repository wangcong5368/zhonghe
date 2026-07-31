<!-- 已关联通话记录  -->
<template>
  <div>
    <template v-if="callLogList.length > 0">
      <el-timeline >
        <el-timeline-item :timestamp="callLog.answeredTime" placement="top" v-for="(callLog, index) in callLogList" :key="index">
          <el-row>
            <el-col :span="23">
              <el-card>
                <el-row>
                  <el-col :span="20">
                    <p>主叫：{{ callLog.destinationNumber }}</p>
                    <p>被叫：{{ callLog.callerIdNumber }}</p>
                  </el-col>
                  <el-col :span="1" :offset="3">
                    <i class="el-icon-close hover-icon" @click="handleDelete(callLog)" v-if="isDMMediator() && !isEditing"/>
                  </el-col>
                </el-row>
                <video width="300" height="30" controls="controls" ref="videoRef" @play="onPlay(index)">
                  <source src="https://www.cambridgeenglish.org/images/153149-movers-sample-listening-test-vol2.mp3" v-if="_env==='dev'"/>
                  <source :src="callLog.recordingFileUrl.replace('127.0.0.1', '192.168.50.30')" v-if="_env==='prod'"/>
                </video>
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
    <el-empty description="暂无关联通话记录" :image-size="100" v-else>
      <el-tooltip class="item" effect="dark" content="手动关联" placement="left" v-if="time">
        <el-button type="primary" icon="el-icon-plus" circle @click="select" v-if="isDMMediator() && !isEditing"/>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="自动关联" placement="right" v-if="time">
        <el-button type="primary" icon="el-icon-s-operation" circle @click="handleAutoRelate" v-if="isDMMediator() && !isEditing"/>
      </el-tooltip>
    </el-empty>

    <SelectSound ref="selectSoundRef" @callback="handleAdd" :disable-ids="callLogList.map(i => i.callLogId)" :phones="phones"/>
  </div>
</template>

<script>
import { addRecordRelation, deleteRecordRelation, autoRelate } from "@/api/project/disputeMediation";
import SelectSound from '@/views/project/disputeMediation/component/callSound/selectSound.vue'

export default {
  name: '',
  props: ['isEditing'],
  components: { SelectSound },
  data() {
    return {
      row: null,
      callLogList: [],
      type: null,
      recordId: null,
      time: null,
      currentPlayingIndex: null,
      phones: [],
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row, callLogList, type, recordId, time) {
      this.row = {};
      this.callLogList = callLogList;
      this.type = type;
      this.recordId = recordId;
      this.time = time;

      this.phones = [];
      this.onPlay(null);
      this.$nextTick(() => {
        this.row = row;
        if (this.row.mediatorUserId) {
          this.phones.push({name: "调解员", phone: this.row.mediatorSeatNum.toString().replace("10014", ""), color: "DarkMagenta"});
        }
        if (this.row.assistantUserId) {
          this.phones.push({name: "助理调解员", phone: this.row.assistantSeatNum.toString().replace("10014", ""), color: "DarkMagenta"});
        }
        if (row.agentPhone) {
          this.phones.push({name: "代理人", phone: row.agentPhone, color: "DarkOrange"});
        }
        if (row.phone) {
          this.phones.push({name: "消费者", phone: row.phone, color: "DarkGreen"});
        }
        if (row.deptContactPhone) {
          this.phones.push({name: "机构代表", phone: row.deptContactPhone, color: "DeepSkyBlue"});
        }
      })
    },

    // 选择记录
    select() {
      this.onPlay(null);
      this.$refs.selectSoundRef.open(this.time);
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
    handleAdd(callLog) {
      addRecordRelation({
        'workOrderId': this.row.workOrderId,
        'type': this.type,
        'id1': this.recordId,
        'id2': callLog.callLogId
      }).then(response => {
        this.$modal.msgSuccess('操作成功')
        this.$refs.selectSoundRef.close()
        this.$emit('refresh')
      })
    },

    // 取消关联记录
    handleDelete(callLog) {
      this.$confirm('是否取消关联该通话录音?', '取消关联', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRecordRelation({
          'workOrderId': this.row.workOrderId,
          'type': this.type,
          'id1': this.recordId,
          'id2': callLog.callLogId
        }).then(response => {
          this.$modal.msgSuccess('操作成功')
          this.$emit('refresh')
        })
      })
    },

    // 确定自动关联
    handleAutoRelate() {
      this.$confirm('确认是否自动关联通话录音记录', '自动关联', {
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
