<!-- 派单审核记录列表 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 100%" @change="handleQuery">
              <el-option v-for="dict in dict.type.dm_mediator_audit_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" :data="mediatorAuditList" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column label="序号" type="index" align="center">
        <template slot-scope="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="案件编号" align="center" prop="workOrderId" width="120"/>
      <el-table-column label="申请人" align="center" prop="applicantName"/>
      <el-table-column label="申请时间" align="center" prop="applyTime" width="100" sortable="custom">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.applyTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="auditorName"/>
<!--      <el-table-column label="审核意见" align="center" prop="auditOpinion"/>-->
      <el-table-column label="审核时间" align="center" prop="auditTime" width="100" sortable="custom">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.auditOpinion" placement="right" v-if="scope.row.auditOpinion">
            <span>{{ parseTime(scope.row.auditTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          </el-tooltip>
          <span v-else>{{ parseTime(scope.row.auditTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原调解员" align="center" prop="formerName"/>
      <el-table-column label="现调解员" align="center" prop="latterName"/>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_mediator_audit_status" :value="scope.row.status"/>
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
  </el-dialog>
</template>

<script>

import { mediatorAuditList } from "@/api/project/disputeMediation";

export default {
  name: '',
  props: [ "title" ],
  dicts: [ "dm_mediator_audit_status" ],
  data() {
    return {
      loading: false,
      visible: false,
      // 总条数
      total: 0,
      // 纠纷业务调解员审核表格数据
      mediatorAuditList: [],
      // 默认排序
      defaultSort: {prop: 'applyTime', order: 'descending'},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: null,
      },
    };
  },
  methods: {
    /** 查询纠纷业务调解员审核列表 */
    getList() {
      this.loading = true;
      mediatorAuditList(this.queryParams).then(response => {
        this.mediatorAuditList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    open() {
      this.queryParams.orderByColumn = this.defaultSort.prop;
      this.queryParams.isAsc = this.defaultSort.order;
      this.queryParams.status = null;
      this.handleQuery();
      this.visible = true;
    },
    cancel() {
      this.visible = false;
    },
  },
};
</script>
