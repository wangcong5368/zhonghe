<!-- 选择通话录音  -->
<template>
  <el-dialog title="选择关联通话录音" :visible.sync="visible" append-to-body width="1000px" @close="handleDialogClose">
    <el-form :model="queryParams" ref="queryForm" size="small" label-width="70px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="接通时间" prop="answeredTime">
            <el-date-picker
              v-model="queryParams.answeredTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              :clearable="false"
              end-placeholder="结束日期"
              @change="handleQuery"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="phones.length > 0">
        <el-col :span="24">
          <el-form-item label="关联号码">
            <el-checkbox-group v-model="queryParams.params.phones" size="mini" @change="handleQuery">
              <el-checkbox-button v-for="(item,index) in phones" :label="item.phone" :key="index">{{ item.name + ':' + item.phone }}</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!--      <el-form-item>-->
      <!--        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>-->
      <!--        <el-button icon="el-icon-refresh" size="mini" @click="">重置</el-button>-->
      <!--      </el-form-item>-->
    </el-form>

    <el-table v-loading="loading" :data="list" highlight-current-row @current-change="handleCurrentChange" :row-class-name="rowClassName">
      <el-table-column label="序号" type="index" align="center" width="50px">
        <template slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen;margin-right: 3px" v-if="disableIds.includes(scope.row.callLogId)"/>
          <span>{{
              (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1
            }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" property="answeredTime" label="接通时间" width="100px"/>
      <el-table-column align="center" property="overTime" label="挂断时间" width="100px"/>
      <el-table-column align="center" property="callDirection" label="呼叫方向" width="80px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.callDirection === 'out'">呼出</el-tag>
          <el-tag v-else-if="scope.row.callDirection === 'in'" type="success">呼入</el-tag>
          <span v-else>{{ scope.row.callDirection }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" property="destinationNumber" label="主叫" width="150px">
        <template slot-scope="scope">
          <span v-if="!phones.map(i => i.phone).includes(scope.row.destinationNumber)">{{ scope.row.destinationNumber }}</span>
          <el-tooltip v-else class="item" effect="dark" :content="phones.find(i => i.phone === scope.row.destinationNumber).name" placement="top">
            <span :style="{'color': phones.find(i => i.phone === scope.row.destinationNumber).color, 'font-weight': 'bold'}">{{ scope.row.destinationNumber }}</span>
<!--            <span style="font-weight: bold">{{ scope.row.destinationNumber }}</span>-->
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" property="callerIdNumber" label="被叫" width="150px">
        <template slot-scope="scope">
          <span v-if="!phones.map(i => i.phone).includes(scope.row.callerIdNumber)">{{ scope.row.callerIdNumber }}</span>
          <el-tooltip v-else class="item" effect="dark" :content="phones.find(i => i.phone === scope.row.callerIdNumber).name" placement="top">
            <span :style="{'color': phones.find(i => i.phone === scope.row.callerIdNumber).color, 'font-weight': 'bold'}">{{ scope.row.callerIdNumber }}</span>
<!--            <span style="font-weight: bold">{{ scope.row.callerIdNumber }}</span>-->
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="center" property="recordingFileUrl" label="录音">
        <template slot-scope="scope">
          <video width="300" :height="30" controls="controls" :ref="'videoRef' + scope.$index" @play="onPlay(scope.$index)">
            <source src="https://www.cambridgeenglish.org/images/153149-movers-sample-listening-test-vol2.mp3" v-if="_env==='dev'"/>
            <source :src="scope.row.recordingFileUrl.replace('127.0.0.1', '192.168.50.30')" v-if="_env==='prod'"/>
          </video>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit" :disabled="!currentRow">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listCallLog } from "@/api/phone/callLog";

export default {
  name: '',
  props: {
    disableIds: {
      type: Array,
      default: () => []
    },
    phones: {
      type: Array,
      default: () => []
    },
  },
  components: {},
  data() {
    return {
      visible: false,
      list: null,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        callDirection: null,
        answeredTime: [
          new Date(), // 默认起始时间为当前日期
          new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 默认结束时间为当前日期的后一天
        ],
        params: {
          phones: [],
        },
      },
      // 总条数
      total: 0,
      loading: true,
      // 当前选中的row
      currentRow: null,
      // 正在播放的video下标
      currentPlayingIndex: null,
      // // 是否关联坐席号
      // relateSeatNum: null,
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(time) {
      this.visible = true;
      let answeredTimeStart = new Date(time)
      answeredTimeStart.setMinutes(answeredTimeStart.getMinutes() - 15)
      let answeredTimeEnd = new Date(time)
      answeredTimeEnd.setMinutes(answeredTimeEnd.getMinutes() + 15)
      this.$nextTick(() => {
        this.queryParams.answeredTime = [answeredTimeStart, answeredTimeEnd]
        this.getList()
      })
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    getList() {
      this.onPlay(null);
      this.loading = true;
      listCallLog(this.handleStartEnd(this.queryParams, "answeredTime")).then(response => {
        this.list = null;
        this.$nextTick(() => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        })
      });
    },

    // 关闭时清空列表
    handleDialogClose() {
      this.list = null;
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        callDirection: null,
        answeredTime: [
          new Date(), // 默认起始时间为当前日期
          new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 默认结束时间为当前日期的后一天
        ],
        params: {
          phones: [],
        },
      };
    },

    handleCurrentChange(val) {
      this.currentRow = val;
    },

    onPlay(index) {
      // 如果有视频正在播放，暂停它
      if (this.currentPlayingIndex !== null && this.currentPlayingIndex !== index) {
        const video = this.$refs['videoRef' + this.currentPlayingIndex]
        if (video) {
          video.pause()
        }
      }
      this.currentPlayingIndex = index;
    },

    rowClassName({ row, rowIndex }) {
      // 根据禁用行的条件设置行的样式
      if (this.disableIds.includes(row.callLogId)) {
        return 'disabled-row';  // 添加禁用行的样式类
      }
      return '';
    },

    submit() {
      this.$emit('callback', this.currentRow);
    },

    close() {
      this.visible = false;
    },
  }
}
</script>

<style>
.disabled-row {
  background-color: #f5f5f5;  /* 设置禁用行的背景颜色 */
  color: #ccc;  /* 设置禁用行的字体颜色 */
  pointer-events: none; /* 禁用整个行的选中功能 */
}

.disabled-row span {
  pointer-events: auto; /* 保证播放器可以正常播放 */
}

.disabled-row video {
  pointer-events: auto; /* 保证播放器可以正常播放 */
}
</style>
