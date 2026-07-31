<!-- 预约记录 -->
<template>
  <div>
    <el-dialog :title="title" :visible.sync="dialogVisible" width="1000px" append-to-body @close="cancel">
      <div style="float:right;">
        <el-tooltip class="item" effect="dark" content="调解纪律" placement="left">
          <video width="300" :height="30" controls="controls" muted="muted" ref="audio">
            <!-- <source :src="this._baseUrl + '/profile/upload/2025/01/01/tjjl.mp3'"/> -->
            <source :src="audioUrl"/>
          </video>
        </el-tooltip>
      </div>
      <el-table v-loading="loading" :data="dataList" :default-sort="defaultSort" @sort-change="handleSortChange">
        <el-table-column label="序号" type="index" align="center"/>
        <el-table-column label="工单编号" align="center" prop="workOrderId"/>
        <el-table-column label="调解室名称" align="center" prop="mediationRoomName"/>
        <el-table-column label="预约时间" align="center" prop="date,timeSpan" width="100" sortable="custom">
          <template slot-scope="scope">
            {{ scope.row.date + " " + timeSpanOptions.find(timeSpanOption => timeSpanOption.value === scope.row.timeSpan).label }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" sortable="custom">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.mediation_room_reservation_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="100" sortable="custom">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" :content="scope.row.createBy" placement="bottom" v-if="scope.row.createBy">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </el-tooltip>
            <span v-if="!scope.row.createBy">{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="取消时间" align="center" prop="updateTime" width="100">
          <template slot-scope="scope" v-if="mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS0 === scope.row.status">
            <el-tooltip class="item" effect="dark" :content="scope.row.updateBy" placement="bottom" v-if="scope.row.updateBy">
              <span>{{ parseTime(scope.row.updateTime) }}</span>
            </el-tooltip>
            <span v-if="!scope.row.updateBy">{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <div v-hasPermi="['project:disputeMediation:mediationRoomUse']" v-if="showStartVideo(scope.row)" style="display: inline-block; margin-right: 10px">
              <el-button type="primary" size="mini" plain round @click="handleStartVideo(scope.row)" :disabled="DM_STATUS.DM_STATUS4 !== data.status" :loading="startVideoLoading" icon="el-icon-video-play">录像</el-button>
            </div>
            <div v-hasPermi="['project:disputeMediation:mediationRoomUse']" v-if="showEndVideo(scope.row)" style="display: inline-block; margin-right: 10px">
              <el-button type="danger" size="mini" plain round @click="handleEndVideo(scope.row)" :disabled="DM_STATUS.DM_STATUS4 !== data.status" :loading="endVideoLoading" icon="el-icon-video-pause">结束</el-button>
            </div>
            <div v-hasPermi="['project:mediationRoomReservation:list', 'project:disputeMediation:mediationRoomReservation']" v-if="isReservationActive(scope.row) && !isAppointmentExpired(scope.row)" style="display: inline-block">
              <el-button type="info" size="mini" plain round @click="cacelOrder(scope.row)" icon="">取消预约</el-button>
            </div>
            <el-popover placement="right" trigger="click" v-if="scope.row.mediationRoomVideoList.length > 0">
              <el-table :data="scope.row.mediationRoomVideoList" max-height="500">
                <el-table-column width="100" align="center" type="index" label="序号"/>
                <el-table-column width="100" align="center" property="startTime" label="起始时间"/>
                <el-table-column width="100" align="center" property="endTime" label="结束时间"/>
              </el-table>
              <el-button type="info" size="mini" plain round slot="reference">查看录像</el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList"/>
    </el-dialog>
  </div>
</template>

<script>
/* api */
import {listMediationRoomReservation, cancelReservation} from '@/api/project/mediationRoom';
import {reservationList, dmCancelReservation, startVideo, endVideo} from '@/api/project/disputeMediation';
import { DM_STATUS } from '@/views/constant/CommonConstant.js';

/* enums */
import {MEDIATION_ROOM_RESERVATION_STATUS, TIME_SPAN_OPTIONS} from '@/views/constant/CommonConstant';
import {parseTime} from '@/utils/ruoyi';

export default {
  name: '',
  props:['title'],
  dicts: ['mediation_room_reservation_status'],
  components: {},
  data() {
    return {
      data: {},
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      total: 0,
      dialogVisible: false,
      loading: false,
      startVideoLoading: false,
      endVideoLoading: false,
      // 排序
      defaultSort: {
        prop: 'createTime',
        order: 'descending'
      },
      type: null,
      nowDate: Date.now(), // 当前时间戳
      refreshTimer: null, // 定时器

      queryParams: {
        // 调解室
        pageNum: 1,
        pageSize: 10,
        mediationRoomId: null,
        workOrderId: null,
        orderByColumn: null,
        isAsc: null
      },

      dataList: [],
      timeSpanOptions: TIME_SPAN_OPTIONS,
      mediationRoom: MEDIATION_ROOM_RESERVATION_STATUS,
      audioUrl: require('@/assets/voice/tjjl.mp3')//音频地址
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /**
     * 判断预约是否处于可取消状态
     * @param {Object} row 当前预约记录
     * @returns {Boolean} 是否可取消
     */
    isReservationActive(row) {
      return this.mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS1 === row.status;
    },

    /**
     * 判断预约是否已过期
     * @param {Object} row 当前预约记录
     * @returns {Boolean} 是否已过期
     */
    isAppointmentExpired(row) {
      const appointmentEndTime = this.getAppointmentEndTime(row);
      const currentTime = parseTime(new Date(), '{y}-{m}-{d} {h}:{i}:{s}');
      return appointmentEndTime <= currentTime;
    },

    /**
     * 获取预约结束时间
     * @param {Object} row 当前预约记录
     * @returns {String} 预约结束时间字符串
     */
    getAppointmentEndTime(row) {
      const timeSpan = this.timeSpanOptions.find(option => option.value === row.timeSpan);
      return `${row.date} ${timeSpan.endTime}`;
    },

    /**
     * 打开预约记录弹窗
     * @param {Object} data 初始化数据
     * @param {String} type 预约类型
     */
    open(data, type) {
      this.data = data;
      this.type = type;
      this.init(data);
      this.getList();
      this.dialogVisible = true;
      // 启动定时器，每秒更新当前时间
      this.refreshTimer = setInterval(() => {
        this.nowDate = Date.now();
      }, 1000);

      this.$nextTick(()=>{
        this.$refs.audio.load(); //重新加载录像
      })
    },

    /**
     * 初始化查询参数
     * @param {Object} data 初始化数据
     */
    init(data) {
      switch (this.type) {
        case 'mediationRoom':
          this.queryParams.mediationRoomId = data.mediationRoomId;
          break;

        case 'disputeMediation':
          this.queryParams.workOrderId = data.workOrderId;
          break;

        default:
          break;
      }
    },

    /**
     * 关闭弹窗并重置数据
     */
    cancel() {
      this.dialogVisible = false;
      this.reset();
      // 清除定时器
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    /**
     * 重置表单数据和状态
     */
    reset() {
      this.formData = {
        pageNum: 1,
        pageSize: 10,
        mediationRoomId: null,
        workOrderId: null,
        orderByColumn: null,
        isAsc: null
      };
      this.workOrderId = null;
      this.type = null;
      this.dataList = [];
      this.total = 0;
      this.$refs.audio.pause() //暂停录音
    },

    /**
     *  获取预约记录
     */
    getList() {
      this.loading = true;

      switch (this.type) {
        case 'mediationRoom':
          this.getMediationRoomList();
          break;

        case 'disputeMediation':
          this.getDisputeMediationList();
          break;

        default:
          break;
      }
    },

    /**
     * 获取调解室预约记录
     * 调用调解室预约列表接口
     */
    getMediationRoomList() {
      listMediationRoomReservation(this.queryParams)
        .then(res => {
          const {total, rows} = res;
          this.total = total;
          this.dataList = rows;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * 获取纠纷调解预约记录
     * 调用纠纷调解预约列表接口
     */
    getDisputeMediationList() {
      reservationList(this.queryParams)
        .then(res => {
          let {total, rows} = res;
          this.total = total;

          // 添加开始时间、结束时间字段
          rows = rows.map(item => {
            item.startTime = `${item.date} ${this.timeSpanOptions.find(e => e.value === item.timeSpan).startTime}`;
            item.endTime = `${item.date} ${this.timeSpanOptions.find(e => e.value === item.timeSpan).endTime}`;
            return item;
          });
          this.dataList = rows;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * 取消预约操作
     * 根据当前类型调用不同的取消预约接口
     */
    cacelOrder(row) {
      switch (this.type) {
        case 'mediationRoom':
          this.cancelMediationRoom(row);
          break;

        case 'disputeMediation':
          this.cancelDisputeMediation(row);
          break;

        default:
          break;
      }
    },

    /**
     * 取消调解室预约
     * @param {Object} row 当前预约记录
     */
    cancelMediationRoom(row) {
      this.$modal
        .confirm('是否确认取消"' + row.date + ' ' + this.timeSpanOptions.find(timeSpanOption => timeSpanOption.value === row.timeSpan).label + '"的预约记录？')
        .then(res => {
          return cancelReservation(row);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('取消成功');
        })
        .catch(() => {
        });
    },

    /**
     * 取消纠纷调解预约
     * @param {Object} row 当前预约记录
     */
    cancelDisputeMediation(row) {
      this.$modal
        .confirm('是否确认取消"' + row.date + ' ' + this.timeSpanOptions.find(timeSpanOption => timeSpanOption.value === row.timeSpan).label + '"的预约记录？')
        .then(res => {
          return dmCancelReservation(row);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('取消成功');
        })
        .catch(() => {
        });
    },

    // 转换时间戳
    toTimestamp(timeStr) {
      if (!timeStr) return;
      const date = new Date(timeStr);
      return date.getTime();
    },

    async handleStartVideo(row) {
      this.startVideoLoading = true;
      try {
        const res = await startVideo({workOrderId: row.workOrderId});
        this.getDisputeMediationList();
        this.$modal.msgSuccess('操作成功');
      } catch (error) {
      } finally {
        this.startVideoLoading = false;
      }
    },

    async handleEndVideo(row) {
      this.endVideoLoading = true;
      try {
        const res = await endVideo({workOrderId: row.workOrderId});
        this.getDisputeMediationList();
        this.$modal.msgSuccess('操作成功');
      } catch (error) {
      } finally {
        this.endVideoLoading = false;
      }
    }
  },
  computed: {
    showStartVideo() {
      return row => {
        if (this.mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS1 === row.status || this.mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS2 === row.status) {
          const startTimestamp = this.toTimestamp(row.startTime);
          const endTimestamp = this.toTimestamp(row.endTime);
          if (this.nowDate > startTimestamp && this.nowDate < endTimestamp) {
            const length = row.mediationRoomVideoList.length;
            if (length === 0) return true;
            const startVideoTime = row.mediationRoomVideoList[length - 1].startTime;
            const endVideoTime = row.mediationRoomVideoList[length - 1].endTime;
            return !!startVideoTime && !!endVideoTime;
          }
        }
        return false;
      };
    },
    showEndVideo() {
      return row => {
        if (this.mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS1 === row.status || this.mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS2 === row.status) {
          const startTimestamp = this.toTimestamp(row.startTime);
          const endTimestamp = this.toTimestamp(row.endTime);
          if (this.nowDate > startTimestamp && this.nowDate < endTimestamp) {
            const length = row.mediationRoomVideoList.length;
            if (length === 0) return false;
            const startVideoTime = row.mediationRoomVideoList[length - 1].startTime;
            const endVideoTime = row.mediationRoomVideoList[length - 1].endTime;
            return !!startVideoTime && !endVideoTime;
          }
        }
        return false;
      };
    }
  }
};
</script>
<style scoped lang="scss">

::v-deep .el-dialog__body{
  padding: 0 20px 30px;
}
</style>
