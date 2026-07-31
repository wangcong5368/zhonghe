<!-- 预约记录 -->
<template>
  <div>
    <el-dialog
      title="预约记录"
      :visible.sync="dialogVisible"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
      @close="cancel"
    >
      <el-table v-loading="loading" :data="dataList">
        <el-table-column label="序号" type="index" align="center" />

        <el-table-column label="工单编号" align="center" prop="workOrderId" />

        <el-table-column
          label="预约日期"
          align="center"
          prop="date"
          sortable="custom"
        />
        <el-table-column label="预约时间段" align="center" prop="timeSpan">
          <template slot-scope="scope">
            {{
              timeSpanOptions.find(
                (timeSpanOption) => timeSpanOption.value === scope.row.timeSpan
              ).label
            }}
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          align="center"
          prop="status"
          sortable="custom"
        >
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.mediation_room_reservation_status"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="预约时间"
          align="center"
          prop="createTime"
          width="100"
          sortable="custom"
        >
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.createBy"
              placement="bottom"
              v-if="scope.row.createBy"
            >
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </el-tooltip>
            <span v-if="!scope.row.createBy">{{
              parseTime(scope.row.createTime)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="取消时间"
          align="center"
          prop="updateTime"
          width="100"
        >
          <template
            slot-scope="scope"
            v-if="
              mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS0 ===
              scope.row.status
            "
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row.updateBy"
              placement="bottom"
              v-if="scope.row.updateBy"
            >
              <span>{{ parseTime(scope.row.updateTime) }}</span>
            </el-tooltip>

            <span v-if="!scope.row.updateBy">{{
              parseTime(scope.row.updateTime)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <div v-hasPermi="['project:mediationRoomReservation:list']">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="cacelOrder(scope.row)"
                v-if="
                  isReservationActive(scope.row) &&
                  !isAppointmentExpired(scope.row)
                "
                >取消预约</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-dialog>
  </div>
</template>

<script>
/* api */
import {
  listMediationRoomReservation,
  cancelReservation,
} from "@/api/project/mediationRoom";

import {
  reservationList,
  dmCancelReservation,
} from "@/api/project/disputeMediation";

/* enums */
import {
  MEDIATION_ROOM_RESERVATION_STATUS,
  TIME_SPAN_OPTIONS,
} from "@/views/constant/CommonConstant";

import { parseTime } from "@/utils/ruoyi";

export default {
  name: "",
  dicts: ["mediation_room_reservation_status"],
  components: {},
  data() {
    return {
      total: 0,
      dialogVisible: false,
      loading: false,
      // 排序
      DefaultSort: {
        prop: "createTime",
        order: "descending",
      },
      type: null,

      queryParams: {
        // 调解室
        pageNum: 1,
        pageSize: 10,
        mediationRoomId: null,
        workOrderId: null,
        orderByColumn: null,
        isAsc: null,
      },

      dataList: [],
      timeSpanOptions: TIME_SPAN_OPTIONS,
      mediationRoom: MEDIATION_ROOM_RESERVATION_STATUS,
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 判断预约是否处于可取消状态
     * @param {Object} row 当前预约记录
     * @returns {Boolean} 是否可取消
     */
    isReservationActive(row) {
      return (
        this.mediationRoom.MEDIATION_ROOM_RESERVATION_STATUS1 === row.status
      );
    },

    /**
     * 判断预约是否已过期
     * @param {Object} row 当前预约记录
     * @returns {Boolean} 是否已过期
     */
    isAppointmentExpired(row) {
      const appointmentEndTime = this.getAppointmentEndTime(row);
      const currentTime = parseTime(new Date(), "{y}-{m}-{d} {h}:{i}:{s}");
      return appointmentEndTime <= currentTime;
    },

    /**
     * 获取预约结束时间
     * @param {Object} row 当前预约记录
     * @returns {String} 预约结束时间字符串
     */
    getAppointmentEndTime(row) {
      const timeSpan = this.timeSpanOptions.find(
        (option) => option.value === row.timeSpan
      );
      return `${row.date} ${timeSpan.endTime}`;
    },

    /**
     * 打开预约记录弹窗
     * @param {Object} data 初始化数据
     * @param {String} type 预约类型
     */
    open(data, type) {
      this.type = type;
      this.init(data);
      this.getList();
      this.dialogVisible = true;
    },

    /**
     * 初始化查询参数
     * @param {Object} data 初始化数据
     */
    init(data) {
      switch (this.type) {
        case "mediationRoom":
          this.queryParams.mediationRoomId = data.mediationRoomId;
          break;

        case "disputeMediation":
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
        isAsc: null,
      };
      this.workOrderId = null;
      this.type = null;
      this.dataList = [];
      this.total = 0;
    },

    /**
     *  获取预约记录
     */
    getList() {
      this.loading = true;

      switch (this.type) {
        case "mediationRoom":
          this.getMediationRoomList();
          break;

        case "disputeMediation":
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
        .then((res) => {
          const { total, rows } = res;
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
        .then((res) => {
          const { total, rows } = res;
          this.total = total;
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
        case "mediationRoom":
          this.cancelMediationRoom(row);
          break;

        case "disputeMediation":
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
        .confirm(
          '是否确认取消"' +
            row.date +
            " " +
            this.timeSpanOptions.find(
              (timeSpanOption) => timeSpanOption.value === row.timeSpan
            ).label +
            '"的预约记录？'
        )
        .then((res) => {
          return cancelReservation(row);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("取消成功");
        })
        .catch(() => {});
    },

    /**
     * 取消纠纷调解预约
     * @param {Object} row 当前预约记录
     */
    cancelDisputeMediation(row) {
      this.$modal
        .confirm(
          '是否确认取消"' +
            row.date +
            " " +
            this.timeSpanOptions.find(
              (timeSpanOption) => timeSpanOption.value === row.timeSpan
            ).label +
            '"的预约记录？'
        )
        .then((res) => {
          console.log("cancelDisputeMediation", res);

          return dmCancelReservation(row);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("取消成功");
        })
        .catch(() => {});
    },
  },
  computed: {},
};
</script>
<style scoped lang="scss"></style>
