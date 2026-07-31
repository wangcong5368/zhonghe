<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择类型"
          clearable
        >
          <el-option
            v-for="dict in dict.type.mediation_room_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option
            v-for="dict in dict.type.mediation_room_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['project:mediationRoom:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-date"
          size="mini"
          @click="handleGetCalendar"
          v-hasPermi="['project:mediationRoom:reservation']"
          >测试预约</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
        :columns="columns"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="mediationRoomList"
      @selection-change="handleSelectionChange"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"

    >
      <el-table-column label="序号" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
            (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="名称"
        align="center"
        prop="name"
        v-if="columns.find((i) => i.key === 'name').visible"
        sortable="custom"
      />
      <el-table-column
        label="类型"
        align="center"
        prop="type"
        v-if="columns.find((i) => i.key === 'type').visible"
      >
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.mediation_room_type"
            :value="scope.row.type"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="自定义星期"
        align="center"
        prop="weekday"
        v-if="columns.find((i) => i.key === 'weekday').visible"
      >
        <template slot-scope="scope" v-if="scope.row.weekday">
          <div v-for="item in scope.row.weekday.split(',')">
            {{ weekdayOptions.find((i) => i.value === item).label }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="时间段"
        align="center"
        prop="timeSpan"
        v-if="columns.find((i) => i.key === 'timeSpan').visible"
      >
        <template slot-scope="scope" v-if="scope.row.timeSpan">
          <div v-for="item in scope.row.timeSpan.split(',')">
            {{ timeSpanOptions.find((i) => i.value === item).label }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="摄像头"
        align="center"
        prop="camera"
        v-if="columns.find((i) => i.key === 'camera').visible"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        v-if="columns.find((i) => i.key === 'status').visible"
      >
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.mediation_room_status"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        v-if="columns.find((i) => i.key === 'createTime').visible"
        sortable="custom"
        width="100px"
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
        label="修改时间"
        align="center"
        prop="updateTime"
        v-if="columns.find((i) => i.key === 'updateTime').visible"
        sortable="custom"
        width="100px"
      >
        <template slot-scope="scope">
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
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['project:mediationRoom:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['project:mediationRoom:remove']"
            >删除</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-info"
            @click="handleMediationRoomReservationList(scope.row)"
            v-hasPermi="['project:mediationRoomReservation:list']"
            >预约记录</el-button
          >
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

    <!-- 添加或修改调解室对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" label-width="100px" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型" label-width="100px" prop="type">
          <el-select
            v-model="form.type"
            placeholder="请选择类型"
            @change="
              form.weekday =
                MEDIATION_ROOM_TYPE.custom === form.type ? null : form.weekday
            "
          >
            <el-option
              v-for="dict in dict.type.mediation_room_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="自定义星期"
          label-width="100px"
          prop="weekday"
          v-if="MEDIATION_ROOM_TYPE.custom === form.type"
        >
          <el-select
            v-model="form.weekday"
            multiple
            placeholder="请选择"
            style="width: 100%"
            @change="form.weekday.sort((a, b) => a - b)"
          >
            <el-option
              v-for="item in weekdayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间段" label-width="100px" prop="timeSpan">
          <el-select
            v-model="form.timeSpan"
            multiple
            placeholder="请选择"
            style="width: 100%"
            @change="form.timeSpan.sort((a, b) => a - b)"
          >
            <el-option
              v-for="item in timeSpanOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="摄像头" label-width="100px" prop="camera">
          <el-input
            v-model="form.camera"
            placeholder="请输入摄像头编号或通道"
          />
        </el-form-item>
        <el-form-item label="状态" label-width="100px" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="dict in dict.type.mediation_room_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 预约详情记录对话框 -->
    <!-- <el-dialog
      :title="mediationRoomReservationListTitle"
      :visible.sync="mediationRoomReservationListOpen"
      width="1000px"
      append-to-body
    >
      <el-table
        v-loading="mediationRoomReservationListLoading"
        :data="mediationRoomReservationList"
        :default-sort="mediationRoomReservationListDefaultSort"
        @sort-change="mediationRoomReservationListHandleSortChange"
      >
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
              MEDIATION_ROOM_RESERVATION_STATUS.MEDIATION_ROOM_RESERVATION_STATUS0 ===
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
        <el-table-column
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="cancelReservation(scope.row)"
              v-if="
                MEDIATION_ROOM_RESERVATION_STATUS.MEDIATION_ROOM_RESERVATION_STATUS1 ===
                  scope.row.status &&
                parseTime(scope.row.date, '{y}-{m}-{d}') +
                  ' ' +
                  timeSpanOptions.find(
                    (timeSpanOption) =>
                      timeSpanOption.value === scope.row.timeSpan
                  ).endTime >
                  parseTime(nowDateTime, '{y}-{m}-{d} {h}:{i}:{s}')
              "
              v-hasPermi="['project:mediationRoomReservation:list']"
              >取消预约</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="mediationRoomReservationListTotal > 0"
        :total="mediationRoomReservationListTotal"
        :page.sync="mediationRoomReservationListQueryParams.pageNum"
        :limit.sync="mediationRoomReservationListQueryParams.pageSize"
        @pagination="getMediationRoomReservationList"
      />
    </el-dialog> -->

    <!-- 预约调解日历 -->
    <MediationRoomReservation ref="mediationRoomReservation" title="预约调解室" @callback="checkOpen"/>

    <!-- 预约调解记录 -->
    <AppointmentRecord ref="appointmentRecordRef" title="预约记录"/>

    <!-- 提交预约调解弹窗 -->
    <AppointmentAdd ref="appointmentAddRef" @callback="getList" />
  </div>
</template>

<script>
import {
  listMediationRoom,
  delMediationRoom,
  listMediationRoomReservation,
  addMediationRoom,
  updateMediationRoom,
  cancelReservation,
} from "@/api/project/mediationRoom";
import {
  MEDIATION_ROOM_TYPE,
  MEDIATION_ROOM_RESERVATION_STATUS,
  TIME_SPAN_OPTIONS,
} from "@/views/constant/CommonConstant";

/* component */
import MediationRoomReservation from "@/components/MediationRoomReservation/index.vue";
import AppointmentAdd from "./component/appointmentAdd.vue";
import AppointmentRecord from "@/components/AppointmentRecord/index.vue";

export default {
  name: "MediationRoom",
  dicts: [
    "mediation_room_type",
    "mediation_room_status",
    "mediation_room_reservation_status",
  ],
  components: { MediationRoomReservation, AppointmentAdd, AppointmentRecord },
  data() {
    return {
      // 遮罩层
      loading: true,
      mediationRoomReservationListLoading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      mediationRoomReservationListTotal: 0,
      // 调解室表格数据
      mediationRoomList: [],
      mediationRoomReservationList: [],
      // 弹出层标题
      title: "",
      mediationRoomReservationListTitle: "",
      addReservationCheckTitle: "",
      // 是否显示弹出层
      open: false,
      mediationRoomReservationListOpen: false,
      addReservationCheckOpen: false,
      // 默认排序
      defaultSort: { prop: "name", order: "ascending" },
      mediationRoomReservationListDefaultSort: {
        prop: "createTime",
        order: "descending",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        type: null,
        status: null,
      },
      // 查询参数
      mediationRoomReservationListQueryParams: {},
      // 表单参数
      form: {},
      addReservationForm: {},
      columns: [
        { key: "name", label: `名称`, visible: true },
        { key: "type", label: `类型`, visible: true },
        { key: "weekday", label: `自定义星期`, visible: true },
        { key: "timeSpan", label: `时间段`, visible: true },
        { key: "camera", label: `摄像头`, visible: true },
        { key: "status", label: `状态`, visible: true },
        { key: "createTime", label: `创建时间`, visible: true },
        { key: "updateTime", label: `修改时间`, visible: true },
      ],
      // 表单校验
      rules: {
        name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
        type: [{ required: true, message: "类型为必填项", trigger: "change" }],
        weekday: [
          { required: true, message: "自定义星期为必填项", trigger: "blur" },
        ],
        timeSpan: [
          { required: true, message: "时间段为必填项", trigger: "blur" },
        ],
        camera: [
          { required: true, message: "摄像头为必填项", trigger: "change" },
        ],
        status: [
          { required: true, message: "状态为必填项", trigger: "change" },
        ],
      },
      // 常量
      MEDIATION_ROOM_TYPE: MEDIATION_ROOM_TYPE, // 调解室类型
      MEDIATION_ROOM_RESERVATION_STATUS: MEDIATION_ROOM_RESERVATION_STATUS, // 调解室预约信息状态
      weekdayOptions: [
        { value: "1", label: "星期一" },
        { value: "2", label: "星期二" },
        { value: "3", label: "星期三" },
        { value: "4", label: "星期四" },
        { value: "5", label: "星期五" },
        { value: "6", label: "星期六" },
        { value: "7", label: "星期日" },
      ],
      timeSpanOptions: TIME_SPAN_OPTIONS,
      nowDateTime: new Date(),
    };
  },
  created() {
    this.queryParams.orderByColumn = this.defaultSort.prop;
    this.queryParams.isAsc = this.defaultSort.order;
    this.getList();
  },
  watch: {
    mediationRoomReservationListOpen(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          // 设置定时器，每秒更新一次 dateTime
          this.timer = setInterval(() => {
            this.nowDateTime = new Date(); // 更新为当前的日期时间
          }, 1000);
        } else {
          // 弹窗关闭时清除定时器，避免内存泄漏
          clearInterval(this.timer);
        }
      }
    },
  },
  methods: {
    /** 查询调解室列表 */
    getList() {
      this.loading = true;
      listMediationRoom(this.queryParams).then((response) => {
        this.mediationRoomList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        mediationRoomId: null,
        deptId: null,
        name: null,
        type: null,
        weekday: null,
        timeSpan: null,
        camera: null,
        status: "1",
        createId: null,
        createTime: null,
        updateId: null,
        updateTime: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.mediationRoomId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 排序触发事件 */
    mediationRoomReservationListHandleSortChange(column, prop, order) {
      this.mediationRoomReservationListQueryParams.orderByColumn = column.prop;
      this.mediationRoomReservationListQueryParams.isAsc = column.order;
      this.getMediationRoomReservationList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加调解室";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      // const mediationRoomId = row.mediationRoomId || this.ids
      // getMediationRoom(mediationRoomId).then(response => {
      //   response.data.weekday = response.data.weekday && response.data.weekday.split(","); // 将自定义星期字符串转为数组
      //   response.data.timeSpan = response.data.timeSpan && response.data.timeSpan.split(","); // 将时间段字符串转为数组
      //   this.form = response.data;
      //   this.open = true;
      //   this.title = "修改调解室";
      // });
      const data = { ...row };
      data.weekday = data.weekday && data.weekday.split(","); // 将自定义星期字符串转为数组
      data.timeSpan = data.timeSpan && data.timeSpan.split(","); // 将时间段字符串转为数组
      this.form = data;
      this.open = true;
      this.title = "修改调解室";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          const data = { ...this.form };
          if (this.form.weekday && Array.isArray(this.form.weekday)) {
            data.weekday = this.form.weekday.join(",");
          }
          if (this.form.timeSpan && Array.isArray(this.form.timeSpan)) {
            data.timeSpan = this.form.timeSpan.join(",");
          }
          if (this.form.mediationRoomId != null) {
            updateMediationRoom(data).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addMediationRoom(data).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const mediationRoomIds = row.mediationRoomId || this.ids;
      this.$modal
        .confirm('是否确认删除调解室名称为"' + row.name + '"的数据项？')
        .then(function () {
          return delMediationRoom(mediationRoomIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "project/mediationRoom/export",
        {
          ...this.queryParams,
        },
        `mediationRoom_${new Date().getTime()}.xlsx`
      );
    },
    /** 获取预约记录操作 */
    handleMediationRoomReservationList(data) {
      this.$refs.appointmentRecordRef.open(data, "mediationRoom");

      // this.mediationRoomReservationListTitle = mediationRoom.name + "预约记录";
      // this.mediationRoomReservationListOpen = true;
      // this.mediationRoomReservationListQueryParams = {
      //   pageNum: 1,
      //   pageSize: 10,
      //   mediationRoomId: mediationRoom.mediationRoomId,
      //   workOrderId: null,
      //   orderByColumn: this.mediationRoomReservationListDefaultSort.prop,
      //   isAsc: this.mediationRoomReservationListDefaultSort.order,
      // };
      // this.getMediationRoomReservationList();
    },
    /** 获取预约记录 */
    getMediationRoomReservationList() {
      this.mediationRoomReservationListLoading = true;
      listMediationRoomReservation(
        this.mediationRoomReservationListQueryParams
      ).then((response) => {
        this.mediationRoomReservationList = response.rows;
        this.mediationRoomReservationListTotal = response.total;
        this.mediationRoomReservationListLoading = false;
      });
    },
    /** 取消预约 */
    cancelReservation(row) {
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
        .then(function () {
          return cancelReservation(row);
        })
        .then(() => {
          this.getMediationRoomReservationList();
          this.$modal.msgSuccess("取消成功");
        })
        .catch(() => {});
    },
    /** 打开预约日历操作 */
    handleGetCalendar() {
      this.$refs.mediationRoomReservation.open();
    },
    /** 预约确认操作 */
    checkOpen(data) {
      this.$refs.appointmentAddRef.open(data);

      // this.addReservationForm.workOrderId =
      //   "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      //     const r = (Math.random() * 16) | 0;
      //     const v = c === "x" ? r : (r & 0x3) | 0x8;
      //     return v.toString(16);
      //   });
      // this.addReservationForm.mediationRoomId = result.mediationRoomId;
      // this.addReservationForm.mediationRoomName = result.mediationRoomName;
      // this.addReservationForm.date = result.date;
      // this.addReservationForm.timeSpan = result.timeSpanValue;
      // this.addReservationForm.dateStr =
      //   parseTime(result.date, "{y}-{m}-{d}") + " " + result.timeSpanLabel;
      // this.addReservationCheckTitle = "预约信息确认";
      // this.addReservationCheckOpen = true;
    },

    addReservationCheckSubmit() {
      this.$refs.mediationRoomReservation.addReservationCheckSubmit(
        this.addReservationForm.workOrderId,
        this.addReservationForm.mediationRoomId,
        this.addReservationForm.date,
        this.addReservationForm.timeSpan
      );
    },
  },
};
</script>
