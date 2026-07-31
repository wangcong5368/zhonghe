<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="报表类型" prop="type">
        <el-select v-model="queryParams.type" @change="handleQuery">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            placeholder="请选择报表类型"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="报表名称" prop="name">
        <el-select v-model="queryParams.name" @change="handleQuery">
          <el-option
            v-for="item in nameOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            placeholder="请选择报表名称"
          >
          </el-option>
        </el-select>
      </el-form-item>
<!--      <el-form-item>-->
<!--        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>-->
<!--        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>-->
<!--      </el-form-item>-->
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增自定义报表</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['project:dmReport:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['project:dmReport:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="warning"-->
<!--          plain-->
<!--          icon="el-icon-download"-->
<!--          size="mini"-->
<!--          @click="handleExport"-->
<!--          v-hasPermi="['project:dmReport:export']"-->
<!--        >导出</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"/>
    </el-row>

    <el-table v-loading="loading" :data="dmReportList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center">
        <template slot-scope="scope">
          <span>{{
              (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="报表类型" align="center" prop="type" v-if="columns.find(s=>s.label==='报表类型').visible"/>
      <el-table-column label="报表名称" align="center" prop="name" v-if="columns.find(s=>s.label==='报表名称').visible"/>
      <el-table-column label="报表时间" align="center" prop="remark" v-if="columns.find(s=>s.label==='报表时间').visible"/>
      <el-table-column label="起止日期" align="center" v-if="columns.find(s=>s.label==='起止日期').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}至{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计时间" align="center" prop="createTime" v-if="columns.find(s=>s.label==='统计时间').visible"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleDownload(scope.row)"
          >下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改调解报表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="报表名称" prop="name">
          <el-select v-model="form.name">
            <el-option
              v-for="item in nameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              placeholder="请选择报表名称"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="起止时间" prop="time">
          <el-date-picker
            v-model="form.time"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDmReport, getDmReport, delDmReport, addDmReport, updateDmReport } from "@/api/project/dmReport";
import { parseTime } from '@/utils/ruoyi'

export default {
  name: "DmReport",
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
      // 调解报表表格数据
      dmReportList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 默认排序
      defaultSort: {prop: 'createTime', order: 'descending'},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: "周报表",
        name: "调解员案件统计表",
        startTime: null,
        endTime: null,
        userId: null,
        template: null,
        parameter: null,
      },
      typeOptions: [{
        value: '周报表',
        label: '周报表'
      }, {
        value: '月报表',
        label: '月报表'
      }, {
        value: '年报表',
        label: '年报表'
      }, {
        value: '自定义报表',
        label: '自定义报表'
      }],
      nameOptions: [
        {
          value: '调解员案件统计表',
          label: '调解员案件统计表'
        },
        {
          value: '调解情况统计表',
          label: '调解情况统计表'
        }
      ],
      // 表单参数
      form: {},
      // 列信息
      columns: [
        { label: `报表类型`, visible: true },
        { label: `报表名称`, visible: true },
        { label: `起止日期`, visible: true },
        { label: `统计时间`, visible: true },
        { label: `报表时间`, visible: true },
      ],
      // 表单校验
      rules: {
        type: [
          { required: true, message: "类型不能为空", trigger: "change" }
        ],
        name: [
          { required: true, message: "报表名称不能为空", trigger: "blur" }
        ],
        startTime: [
          { required: true, message: "开始日期不能为空", trigger: "blur" }
        ],
        endTime: [
          { required: true, message: "结束日期不能为空", trigger: "blur" }
        ],
        template: [
          { required: true, message: "模板路径不能为空", trigger: "blur" }
        ],
        parameter: [
          { required: true, message: "参数不能为空", trigger: "blur" }
        ],
        createId: [
          { required: true, message: "创建者不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.queryParams.orderByColumn = this.defaultSort.prop;
    this.queryParams.isAsc = this.defaultSort.order;
    this.getList();
  },
  methods: {
    /** 查询调解报表列表 */
    getList() {
      this.loading = true;
      listDmReport(this.queryParams).then(response => {
        this.dmReportList = response.rows;
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
        type: null,
        time: null,
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
      this.ids = selection.map(item => item.reportId)
      this.single = selection.length!==1
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
      this.title = "新增自定义报表";
    },
    /** 提交按钮 */
    submitForm() {
      const data = { name: this.form.name, startTime: parseTime(this.form.time[0], "{y}-{m}-{d} {h}:{i}:{s}"), endTime: parseTime(this.form.time[1], "{y}-{m}-{d} {h}:{i}:{s}") }
      addDmReport(data).then(response => {
        this.$modal.msgSuccess("操作成功");
        this.open = false;
        this.getList();
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const reportIds = row.reportId || this.ids;
      this.$modal.confirm('是否确认删除调解报表编号为"' + reportIds + '"的数据项？').then(function() {
        return delDmReport(reportIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('project/dmReport/export', {
        ...this.queryParams
      }, `dmReport_${new Date().getTime()}.xlsx`)
    },
    handleDownload(row) {
      this.download(`/project/dmReport/${row.reportId}`, {}, `${row.name}.xlsx`)
    },
  }
};
</script>
