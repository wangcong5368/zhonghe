<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="通话流水" prop="callAccept">
        <el-input v-model="queryParams.callAccept" placeholder="请输入通话流水" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="主叫名称" prop="callerIdName">
        <el-input v-model="queryParams.callerIdName" placeholder="请输入主叫名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="主叫号码" prop="callerIdNumber">
        <el-input v-model="queryParams.callerIdNumber" placeholder="请输入主叫号码"
          clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="被叫号码" prop="destinationNumber">
        <el-input v-model="queryParams.destinationNumber" placeholder="请输入被叫号码" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="话务发起时间" prop="createdTime">
        <el-date-picker clearable v-model="queryParams.createdTime" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择话务发起时间">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="话务使用的线路" prop="gateway">
        <el-input v-model="queryParams.gateway" placeholder="请输入话务使用的线路" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
     
      <!-- <el-form-item label="自动外呼的任务ID号" prop="batchAccept">
        <el-input v-model="queryParams.batchAccept" placeholder="请输入自动外呼的任务ID号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item label="转接的号码" prop="transNumber">
        <el-input v-model="queryParams.transNumber" placeholder="请输入转接的号码" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="转接话务流水号" prop="otheraccept">
        <el-input v-model="queryParams.otheraccept" placeholder="请输入转接话务流水号" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="客户自定义的标识" prop="otherStr">
        <el-input v-model="queryParams.otherStr" placeholder="请输入客户自定义的标识" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['phone:callLog:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['phone:callLog:edit']">修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['phone:callLog:remove']">删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['phone:callLog:export']">导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns" />
    </el-row>

    <el-table v-loading="loading" :data="callLogList" @selection-change="handleSelectionChange"
      :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="通话记录id" align="center" prop="callLogId"
        v-if="columns.find(s => s.label === '通话记录id').visible" />
      <el-table-column label="通话流水" align="center" prop="callAccept"
        v-if="columns.find(s => s.label === '通话流水').visible" />
      <el-table-column label="主叫名称" align="center" prop="callerIdName"
        v-if="columns.find(s => s.label === '主叫名称').visible" />
      <el-table-column label="主叫号码" align="center" prop="callerIdNumber"
        v-if="columns.find(s => s.label === '主叫号码').visible" />
      <el-table-column label="被叫号码" align="center" prop="destinationNumber"
        v-if="columns.find(s => s.label === '被叫号码').visible" />
      <el-table-column label="话务发起时间" align="center" prop="createdTime" width="180"
        v-if="columns.find(s => s.label === '话务发起时间').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createdTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="呼叫方向" align="center" prop="callDirection"
        v-if="columns.find(s => s.label === '呼叫方向').visible" />
      <el-table-column label="话务接听时间" align="center" prop="answeredTime" width="180"
        v-if="columns.find(s => s.label === '话务接听时间').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.answeredTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="话务结束时间" align="center" prop="overTime" width="180"
        v-if="columns.find(s => s.label === '话务结束时间').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.overTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="线路或者系统返回的状态，无实际意义" align="center" prop="status"
        v-if="columns.find(s => s.label === '线路或者系统返回的状态，无实际意义').visible" /> -->
      <!-- <el-table-column label="话务使用的线路" align="center" prop="gateway"
        v-if="columns.find(s => s.label === '话务使用的线路').visible" /> -->
      <!-- <el-table-column label="通话录音的绝对地址，如果未接通，则为空" align="center" prop="recordingFileName"
        v-if="columns.find(s => s.label === '通话录音的绝对地址，如果未接通，则为空').visible" /> -->
      <el-table-column label="通话录音" align="center" prop="recordingFileUrl"
        v-if="columns.find(s => s.label === '通话录音').visible" />
      <el-table-column label="自动外呼的任务id" align="center" prop="batchAccept"
        v-if="columns.find(s => s.label === '自动外呼的任务id').visible" />
      <el-table-column label="转接的号码" align="center" prop="transNumber"
        v-if="columns.find(s => s.label === '转接的号码').visible" />
      <el-table-column label="转接话务流水号" align="center" prop="otherAccept"
        v-if="columns.find(s => s.label === '转接话务流水号').visible" />
      <el-table-column label="客户自定义的标识" align="center" prop="otherStr"
        v-if="columns.find(s => s.label === '客户自定义的标识').visible" />
      <!-- <el-table-column label="${comment}" align="center" prop="user"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="hangupSide"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="daType"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="otherAccept"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="beginIvrTime" width="180"
        v-if="columns.find(s => s.label === '${comment}').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.beginIvrTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="${comment}" align="center" prop="endIvrTime" width="180"
        v-if="columns.find(s => s.label === '${comment}').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endIvrTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="${comment}" align="center" prop="beginRingTime" width="180"
        v-if="columns.find(s => s.label === '${comment}').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.beginRingTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="${comment}" align="center" prop="endRingTime" width="180"
        v-if="columns.find(s => s.label === '${comment}').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endRingTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="${comment}" align="center" prop="getParams"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="ivrDtmf"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="dtmfType"
        v-if="columns.find(s => s.label === '${comment}').visible" />
      <el-table-column label="${comment}" align="center" prop="type"
        v-if="columns.find(s => s.label === '${comment}').visible" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['phone:callLog:edit']">修改</el-button> -->
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['phone:callLog:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
  </div>
</template>

<script>
import { listCallLog, getCallLog, delCallLog, addCallLog, updateCallLog } from "@/api/phone/callLog";

export default {
  name: "CallLog",
  data() {
    return {
      // 遮罩层
      loading: true,
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
      // 通话记录表格数据
      callLogList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 默认排序
      defaultSort: { prop: 'createTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        callAccept: null,
        callerIdName: null,
        callerIdNumber: null,
        destinationNumber: null,
        createdTime: null,
        callDirection: null,
        answeredTime: null,
        overTime: null,
        status: null,
        gateway: null,
        recordingFileName: null,
        recordingFileUrl: null,
        batchAccept: null,
        transNumber: null,
        otheraccept: null,
        otherStr: null,
        user: null,
        hangupSide: null,
        daType: null,
        otherAccept: null,
        beginIvrTime: null,
        endIvrTime: null,
        beginRingTime: null,
        endRingTime: null,
        getParams: null,
        ivrDtmf: null,
        dtmfType: null,
        type: null
      },
      // 表单参数
      form: {},
      // 列信息
      columns: [
        { label: `通话记录id`, visible: true },
        { label: `通话流水`, visible: true },
        { label: `主叫名称`, visible: true },
        { label: `主叫号码`, visible: true },
        { label: `被叫号码`, visible: true },
        { label: `话务发起时间`, visible: true },
        { label: `呼叫方向`, visible: true },
        { label: `话务接听时间`, visible: true },
        { label: `话务结束时间`, visible: true },

        // // { label: `线路或者系统返回的状态，无实际意义`, visible: true },
        // { label: `话务使用的线路`, visible: true },
        // // { label: `通话录音的绝对地址`, visible: true },
        { label: `通话录音`, visible: true },
        { label: `自动外呼的任务id`, visible: true },
        { label: `转接的号码`, visible: true },
        { label: `转接话务流水号`, visible: true },
        { label: `客户自定义的标识`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
        // { label: `$comment`, visible: true },
      ],
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.queryParams.orderByColumn = this.defaultSort.prop;
    this.queryParams.isAsc = this.defaultSort.order;
    this.getList();
  },
  methods: {
    /** 查询通话记录列表 */
    getList() {
      this.loading = true;
      listCallLog(this.queryParams).then(response => {
        this.callLogList = response.rows;
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
        callLogId: null,
        callAccept: null,
        callerIdName: null,
        callerIdNumber: null,
        destinationNumber: null,
        createdTime: null,
        callDirection: null,
        answeredTime: null,
        overTime: null,
        status: null,
        gateway: null,
        recordingFileName: null,
        recordingFileUrl: null,
        batchAccept: null,
        transNumber: null,
        otheraccept: null,
        otherStr: null,
        user: null,
        hangupSide: null,
        daType: null,
        otherAccept: null,
        beginIvrTime: null,
        endIvrTime: null,
        beginRingTime: null,
        endRingTime: null,
        getParams: null,
        ivrDtmf: null,
        dtmfType: null,
        type: null
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
      this.ids = selection.map(item => item.callLogId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加通话记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const callLogId = row.callLogId || this.ids
      getCallLog(callLogId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改通话记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.callLogId != null) {
            updateCallLog(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCallLog(this.form).then(response => {
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
      const callLogIds = row.callLogId || this.ids;
      this.$modal.confirm('是否确认删除通话记录编号为"' + callLogIds + '"的数据项？').then(function () {
        return delCallLog(callLogIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('phone/callLog/export', {
        ...this.queryParams
      }, `callLog_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
