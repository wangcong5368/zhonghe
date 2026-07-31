<template xmlns="http://www.w3.org/1999/html">
    <!-- 日历对话框 -->
    <el-dialog :title="title" :visible.sync="visible" width="1000px" append-to-body :close-on-click-modal="false"
               :model="false">
      <el-form :model="queryParams" ref="queryParams" size="small" :inline="true" label-width="68px">
        <el-row :gutter="20">
          <div v-if="showCalendar">
            <el-col :span="2" :offset="8">
              <el-button type="primary" icon="el-icon-arrow-left" plain circle style="margin-top: 2px"
                         @click="subtractMonth"/>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-date-picker v-model="queryParams.date" value-format="yyyy-MM-dd" type="month" :clearable="false"
                                placeholder="选择年月" @change="handleCalendarQuery" style="width: 100%" size="large"/>
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <el-button type="primary" icon="el-icon-arrow-right" plain circle style="margin-top: 2px"
                         @click="addMonth"/>
            </el-col>
          </div>
          <div v-else>
            <el-col :span="4" :offset="10">
              <el-form-item>
                <el-date-picker v-model="queryParams.date" value-format="yyyy-MM-dd" type="date" :clearable="false"
                                placeholder="选择年月" style="width: 100%" size="large" readonly/>
              </el-form-item>
            </el-col>
          </div>
          <el-col :span="1.5" style="float: right">
            <el-button type="primary" plain icon="el-icon-arrow-left" size="small" style="margin-top: 5px"
                       v-if="!showCalendar" @click="showCalendar = !showCalendar">返回
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <el-table ref="tables" v-loading="loading" :data="weekList" v-if="showCalendar">
        <el-table-column :label="item" align="center" v-for="(item, index) in weekDayNameList1" :key="index">
          <template v-slot="scope">
            <div v-if="scope.row[weekDayNameList2[index]]"
                 :class="isCalendarActivated(scope.row[weekDayNameList2[index]].date) ? 'calendarActivated' : 'calendarDisabled'">
              <el-card style="height: 105px" class="box-card" shadow="hover"
                       @click.native="handleSelectDate(scope.row[weekDayNameList2[index]])">
                <div slot="header" class="clearfix">
                  <span
                    :style="{color: isCalendarActivated(scope.row[weekDayNameList2[index]].date) ? '#000000' : 'silver'}">
                    {{ parseTime(scope.row[weekDayNameList2[index]].date, "{d}") }}
                  </span>
                  <span
                    :style="{color: isCalendarActivated(scope.row[weekDayNameList2[index]].date) ? 'red' : 'silver'}"
                    v-if="[weekDayNameList1[0], weekDayNameList1[6]].includes(scope.row[weekDayNameList2[index]].weekDay) && scope.row[weekDayNameList2[index]].isWorkday">
                    (班)
                  </span>
                  <span
                    :style="{color: isCalendarActivated(scope.row[weekDayNameList2[index]].date) ? 'green' : 'silver'}"
                    v-else-if="[weekDayNameList1[1],weekDayNameList1[2],weekDayNameList1[3],weekDayNameList1[4],weekDayNameList1[5],].includes(scope.row[weekDayNameList2[index]].weekDay) && !scope.row[weekDayNameList2[index]].isWorkday">
                    (休)
                  </span>
                </div>
                <div class="text item">
                  <div v-if="isCalendarActivated(scope.row[weekDayNameList2[index]].date)">
                    <span style="color: green" v-if="mediationRoomStatus1(scope.row[weekDayNameList2[index]])">
                      可预约
                    </span>
                    <span style="color: silver" v-else-if="mediationRoomStatus2(scope.row[weekDayNameList2[index]])">
                      已约满
                    </span>
                    <span style="color: silver" v-else-if="mediationRoomStatus3(scope.row[weekDayNameList2[index]])">
                      不可预约
                    </span>
                  </div>
                </div>
              </el-card>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row v-if="!showCalendar">
        <el-col :span="12" v-for="(mediationRoom, index) in selectDate.mediationRoomList" :key="index">
          <div class="grid-content bg-purple mediationRoom">
            <el-card :style="{margin: '0 10px 20px 10px', height: 58 + 63 * mediationRoomHeightList[index] + 'px'}" class="box-card" shadow="hover">
              <div slot="header" class="clearfix" style="text-align: center">
                <span>{{ mediationRoom.name }}</span>
              </div>
              <div class="text item">
                <el-col :span="8" v-for="(timeSpanOption, index) in mediationRoom.timeSpanOptionList" :key="index">
                  <el-card style="margin: 0 5px 10px 5px" class="box-card" shadow="hover" v-if="timeSpanOption.includes"
                           @click.native="handleAddReservationCheck(mediationRoom, timeSpanOption)">
                    <div class="text item" style="text-align: center">
                      <span style="color: silver"
                            v-if="timeSpanOption.reservation || parseTime(selectDate.date, '{y}-{m}-{d}') + ' ' + timeSpanOption.timeSpanOption.endTime <= parseTime(nowDateTime, '{y}-{m}-{d} {h}:{i}:{s}')">
                        {{ timeSpanOption.timeSpanOption.label}}
                      </span>
                      <span style="color: green" v-else>{{ timeSpanOption.timeSpanOption.label }}</span>
                    </div>
                  </el-card>
                </el-col>
              </div>
            </el-card>
          </div>
        </el-col>
        <el-col :span="24" v-if="selectDate.mediationRoomList.length === 0" style="
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 50px;
          ">
          <span style="color: silver">暂无可预约的调解室</span>
        </el-col>
      </el-row>
    </el-dialog>
</template>

<script>
import {parseTime} from "@/utils/ruoyi";
import {getCalendar} from "@/api/project/mediationRoom";
import {TIME_SPAN_OPTIONS} from "@/views/constant/CommonConstant";

/**
 * @method submit
 * @description 提交预约信息给父组件
 * @emits submit 触发父组件的submit事件
 */

/**
 * @method close
 * @description 关闭预约弹窗并通知父组件
 * @emits close 触发父组件的submit事件
 */

export default {
  name: '',
  props: ['title'],
  data() {
    return {
      visible: false,
      queryParams: {
        date: null,
      },
      form: {},
      loading: false,
      showCalendar: true,
      workdayList: [],
      weekList: [],
      // weekDayNameList1: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
      weekDayNameList1: ["日", "一", "二", "三", "四", "五", "六"],
      weekDayNameList2: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      selectDate: null,
      mediationRoomHeightList: [],
      nowDateTime: new Date(),
      activatedDay: null,
      timeSpanOptions: TIME_SPAN_OPTIONS,
      workOrderId: null, //工单编号 纠纷业务页面预约使用
    };
  },
  watch: {
    visible(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          // 设置定时器，每秒更新一次 dateTime
          this.timer = setInterval(() => {
            this.nowDateTime = new Date(); // 更新为当前的日期时间
            // 如果不需要限制15天，注释一下代码，使activatedDay始终为null即可
            const activatedDay = new Date(this.nowDateTime);
            this.activatedDay = parseTime(
              activatedDay.setDate(activatedDay.getDate() + 15),
              "{y}-{m}-{d}"
            );
          }, 1000);
        } else {
          // 弹窗关闭时清除定时器，避免内存泄漏
          clearInterval(this.timer);
        }
      }
    },
  },
  methods: {
    open(row = null) {
      if (row) {
        this.workOrderId = row.workOrderId;
      }

      this.queryParams.date = parseTime(new Date(), "{y}-{m}-01");
      this.handleCalendarQuery();
      this.visible = true;
    },

    refreshList() {
      this.queryParams.date = parseTime(new Date(), "{y}-{m}-01");
      this.handleCalendarQuery();
    },

    /** 调接口封装日历 */
    handleCalendarQuery() {
      this.selectDate = null;
      this.showCalendar = true;
      this.loading = true;
      getCalendar(this.queryParams).then((response) => {
        // 按表格形式重组
        this.weekList = [];
        this.workdayList = response.data;
        this.workdayList.sort((a, b) => a.date.localeCompare(b.date));
        this.workdayList.map((item) => {
          item.weekDay = this.weekDayNameList1[new Date(item.date).getDay()];
          if (item.weekDay === this.weekDayNameList1[0]) {
            this.weekList.push({});
          } else {
            if (this.weekList.length === 0) {
              this.weekList.push({});
            }
          }
          this.weekList[this.weekList.length - 1][
            this.weekDayNameList2[this.weekDayNameList1.indexOf(item.weekDay)]
            ] = item;
          this.loading = false;
        });
        // 添加自定义属性
        this.workdayList.map((item) => {
          item.mediationRoomList.forEach((mediationRoom) => {
            let mediationRoomTimeSpan = mediationRoom.timeSpan.split(",");
            mediationRoom.timeSpanOptionList = this.timeSpanOptions.map(
              (timeSpanOption) => {
                return {
                  timeSpanOption: timeSpanOption,
                  includes: mediationRoomTimeSpan.includes(
                    timeSpanOption.value
                  ),
                  reservation: item.mediationRoomReservationList.some(
                    (mediationRoomReservation) =>
                      parseTime(
                        mediationRoomReservation.date,
                        "{y}-{m}-{d}"
                      ) === parseTime(item.date, "{y}-{m}-{d}") &&
                      mediationRoomReservation.timeSpan ===
                      timeSpanOption.value &&
                      mediationRoomReservation.mediationRoomId ===
                      mediationRoom.mediationRoomId
                  ),
                };
              }
            );
          });
        });
      });
    },

    /** 选择日期操作 */
    handleSelectDate(item) {
      if (this.isCalendarActivated(item.date)) {
        // 获取调解室预约时间段高度list
        const heightList = item.mediationRoomList.map(
          (mediationRoom) =>
            mediationRoom.timeSpanOptionList.filter(
              (timeSpanOption) => timeSpanOption.includes
            ).length
        );
        let step1 = 2;
        let step2 = 3;
        this.mediationRoomHeightList = [];
        for (let i = 0; i < heightList.length; i += step1) {
          let maxVal = Math.max(...heightList.slice(i, i + step1));
          for (let j = 0; j < step1 && i + j < heightList.length; j++) {
            this.mediationRoomHeightList.push(Math.ceil(maxVal / step2));
          }
        }
        // 预约对话框
        this.showCalendar = false;
        this.selectDate = item;
        this.queryParams.date = parseTime(this.selectDate.date, "{y}-{m}-{d}");
      }
    },

    handleAddReservationCheck(mediationRoom, timeSpanOption) {
      if (
        !timeSpanOption.reservation &&
        parseTime(this.selectDate.date, "{y}-{m}-{d}") +
        " " +
        timeSpanOption.timeSpanOption.endTime >
        parseTime(this.nowDateTime, "{y}-{m}-{d} {h}:{i}:{s}")
      ) {
        const options = {
          mediationRoomName: mediationRoom.name,
          mediationRoomId: mediationRoom.mediationRoomId,
          date: this.selectDate.date,
          timeSpanValue: timeSpanOption.timeSpanOption.value,
          timeSpanLabel: timeSpanOption.timeSpanOption.label,
          workOrderId: this.workOrderId,
        };

        this.$emit("callback", options);
      }
    },
    /** 提交预约 */
    // addReservationCheckSubmit(workOrderId, mediationRoomId, date, timeSpan) {
    //   addReservation({
    //     workOrderId: workOrderId,
    //     mediationRoomId: mediationRoomId,
    //     date: date,
    //     timeSpan: timeSpan,
    //   }).then((response) => {
    //     this.$modal.msgSuccess("预约成功");
    //     this.visible = false;
    //     this.$emit("close");
    //   });
    // },
    // 增加一个月
    addMonth() {
      const date = new Date(this.queryParams.date);
      this.queryParams.date = parseTime(
        date.setMonth(date.getMonth() + 1),
        "{y}-{m}-{d}"
      );
      this.handleCalendarQuery();
    },
    // 减少一个月
    subtractMonth() {
      const date = new Date(this.queryParams.date);
      this.queryParams.date = parseTime(
        date.setMonth(date.getMonth() - 1),
        "{y}-{m}-{d}"
      );
      this.handleCalendarQuery();
    },

    // 可预约
    mediationRoomStatus1(item) {
      return item.mediationRoomList.some((mediationRoom) =>
        mediationRoom.timeSpanOptionList
          .filter((timeSpanOption) => timeSpanOption.includes)
          .some(
            (timeSpanOption) =>
              !timeSpanOption.reservation &&
              parseTime(item.date, "{y}-{m}-{d}") +
              " " +
              timeSpanOption.timeSpanOption.endTime >
              parseTime(this.nowDateTime, "{y}-{m}-{d} {h}:{i}:{s}")
          )
      );
    },

    // 已约满
    mediationRoomStatus2(item) {
      return (
        item.mediationRoomList.length !== 0 &&
        item.mediationRoomList.every((mediationRoom) =>
          mediationRoom.timeSpanOptionList
            .filter((timeSpanOption) => timeSpanOption.includes)
            .every((timeSpanOption) => timeSpanOption.reservation)
        )
      );
    },

    // 不可预约
    mediationRoomStatus3(item) {
      return item.mediationRoomList.every((mediationRoom) =>
        mediationRoom.timeSpanOptionList
          .filter((timeSpanOption) => timeSpanOption.includes)
          .every(
            (timeSpanOption) =>
              timeSpanOption.reservation ||
              parseTime(item.date, "{y}-{m}-{d}") +
              " " +
              timeSpanOption.timeSpanOption.endTime <=
              parseTime(this.nowDateTime, "{y}-{m}-{d} {h}:{i}:{s}")
          )
      );
    },

    // 日期是否激活
    isCalendarActivated(date) {
      return (
        parseTime(date, "{y}-{m}-{d}") >=
        parseTime(this.nowDateTime, "{y}-{m}-{d}") &&
        (!this.activatedDay ||
          parseTime(date, "{y}-{m}-{d}") < this.activatedDay)
      );
    },
  },
};
</script>

<style scoped>
::v-deep .calendarDisabled .el-card__header {
  background-color: #f8f8f9; /* 浅灰色背景 */
}

::v-deep .calendarActivated .el-card__header {
  background-color: #edf6ff; /* 浅蓝色背景 */
}

::v-deep .mediationRoom .el-card__header {
  background-color: #edf6ff; /* 浅蓝色背景 */
}
</style>
