<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      <el-form-item label="紧急程度" prop="urgencyLevel">
        <el-select
          v-model="queryParams.urgencyLevel"
          placeholder="请选择紧急程度"
          style="width: 100%"
        >
          <el-option
            v-for="dict in dict.type.official_urgency_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="密级" prop="secrecy">
        <el-select
          v-model="queryParams.secrecy"
          placeholder="请选择密级"
          style="width: 100%"
        >
          <el-option
            v-for="dict in dict.type.official_secrecy"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="公文类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择公文类型"
          style="width: 100%"
        >
          <el-option label="收文发文" :value="0"></el-option>
          <el-option label="普通发文" :value="1"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="标题" prop="mainTextTitile">
        <el-input
          v-model="queryParams.mainTextTitile"
          placeholder="请输入标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
        <!-- <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['project:draft:add']"
          >新增</el-button
        > -->
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['project:draft:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['project:draft:remove']"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="draftList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公文类型" align="center" prop="type">
        <template slot-scope="scope">
          {{ scope.row.type == 0 ? "收文发文" : "普通发文" }}
        </template>
      </el-table-column>
      <el-table-column
        label="紧急程度"
        align="center"
        prop="urgencyLevelName"
      />
      <el-table-column label="秘密类型" align="center" prop="secrecyName" />
      <el-table-column label="份号" align="center" prop="partNumber" />
      <el-table-column label="发文机关标志" align="center" prop="officialLog" />
      <el-table-column label="发文字号" align="center" prop="wordSize" />
      <el-table-column label="签发人" align="center" prop="issuer" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column
        label="主送机关"
        align="center"
        prop="mainDeliveryAgency"
      />
      <!-- <el-table-column label="正文" align="center" prop="text" /> -->
      <el-table-column label="正文" align="center" prop="text">
        <template slot-scope="scope">
          <div
            style="
              max-height: 40px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
            v-html="scope.row.text"
            class="content"
          ></div>
        </template>
      </el-table-column>
      <el-table-column label="发文机关署名" align="center" prop="sign" />
      <el-table-column
        label="成文日期"
        align="center"
        prop="writtenDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.writtenDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="附注" align="center" prop="annotations">
        <template slot-scope="scope">
          <div
            style="
              max-height: 40px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
            v-html="scope.row.annotations"
            class="content"
          ></div>
        </template>
      </el-table-column>
      <el-table-column label="抄送机关" align="center" prop="cc" />
      <el-table-column label="印发机关" align="center" prop="issuingAgency" />
      <el-table-column
        label="印发日期"
        align="center"
        prop="issuingDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.issuingDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="内部发送"
        align="center"
        prop="internalCirculation"
      />
      <el-table-column label="联系人" align="center" prop="contactPerson" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" />
      <el-table-column
        label="附件说明"
        align="center"
        prop="attachmentDescription"
      >
        <template slot-scope="scope">
          <div
            style="
              max-height: 40px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
            v-html="scope.row.attachmentDescription"
            class="content"
          ></div>
        </template>
      </el-table-column>-->
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        width="100"
      >
        <template slot-scope="scope">
          <div style="display: flex; flex-direction: column">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleDetail(scope.row)"
              >详情</el-button
            >
            <el-popover
              placement="top-end"
              width="500"
              trigger="click"
              popper-class="process-history-popover"
            >
              <div class="timeline-container">
                <el-timeline :reverse="true">
                  <el-timeline-item
                    v-for="(item, index) in historicalRecord"
                    :key="index"
                    :timestamp="formatTime(item.processTime)"
                    placement="top"
                    :type="getStatusType(item.status)"
                  >
                    <div class="history-item">
                      <div class="history-header">
                        <span class="history-title">{{
                          item.returnRemark
                        }}</span>
                        <el-tag
                          size="mini"
                          :type="getStatusTagType(item.status)"
                        >
                          {{ getProcessStatusName(item.status) }}
                        </el-tag>
                      </div>
                      <div class="history-info" v-if="item.nickName">
                        <span class="info-label">处理人：</span>
                        <span class="info-value">{{ item.nickName }}</span>
                      </div>
                      <div class="history-info" v-if="item.remark">
                        <span class="info-label">处理意见：</span>
                        <span class="info-value">{{ item.remark }}</span>
                      </div>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
              <el-button
                slot="reference"
                size="mini"
                type="text"
                icon="el-icon-view"
                @click="selectDocumentProcessListByDocId(scope.row.id)"
                >查看处理流程</el-button
              >
            </el-popover>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="getPreviewRedHeaderDoc(scope.row.id)"
              v-if="scope.row.status > 15"
              >公文预览</el-button
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
    <viewDialog
      ref="viewDialog"
      :formData="form"
      :title="title"
      :isView="isView"
      :userList="userList"
      :comprehensiveList="comprehensiveList"
      @cancel="getList()"
    />
  </div>
</template>

<script>
import {
  getDetail,
  listDocumentArchive,
  selectDocumentProcessListByDocId,
  getPreviewRedHeaderDoc,
} from "@/api/oa/document";
import { getAllUser, getComprehensiveList } from "@/api/oa/publicApi.js";
import viewDialog from "../document/viewDialog.vue";
export default {
  name: "completeDocument",
  dicts: ["sys_normal_disable", "official_secrecy", "official_urgency_level"],
  components: { viewDialog },
  data() {
    return {
      isView: false,
      // 遮罩层
      loading: false,
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
      // 公文管理草稿表格数据
      draftList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: null,
        officialHeader: null,
        urgencyLevel: null,
        genre: null,
        secrecy: null,
        leadDept: null,
        issuance: null,
        direct: null,
        createDate: null,
        issuanceDate: null,
        mainTextTitile: null,
        attachmentTitle: null,
        userId: null,
        phoneNumber: null,
        reviewing: null,
        mainRecipient: null,
        carbonCopy: null,
        fileUrl: null,
        subject: null,
        issuingAuthority: null,
        createId: null,
        updateId: null,
        status: null,
        archiving: null,
        draftStartDate: null,
        draftEndDate: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        createId: [
          { required: true, message: "创建者不能为空", trigger: "blur" },
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" },
        ],
      },
      historicalRecord: [],
    };
  },
  created() {
    this.getList();
    this.getComprehensiveList();
    this.getUserList();
  },
  methods: {
    //获取综合岗角色
    getComprehensiveList() {
      getComprehensiveList().then((res) => {
        this.comprehensiveList = res.data;
      });
    },
    // 获取所有角色
    getUserList() {
      getAllUser().then((res) => {
        this.userList = res.data;
      });
    },
    /** 详情按钮 */
    handleDetail(row) {
      this.reset();
      const id = row.id || this.ids;
      getDetail(id).then((response) => {
        this.$refs.viewDialog.open(response.data);
        this.title = "公文详情";
      });
    },
    /** 查询公文管理草稿列表 */
    getList() {
      this.loading = true;
      listDocumentArchive(this.queryParams).then((response) => {
        console.log(response, "response");
        this.draftList = response.rows;
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
        id: null,
        type: null,
        officialHeader: null,
        urgencyLevel: null,
        genre: null,
        secrecy: null,
        leadDept: null,
        issuance: null,
        direct: null,
        createDate: null,
        issuanceDate: null,
        title: null,
        attachmentTitle: null,
        userId: null,
        phoneNumber: null,
        reviewing: null,
        mainRecipient: null,
        carbonCopy: null,
        fileUrl: null,
        subject: null,
        issuingAuthority: null,
        createId: null,
        createTime: null,
        updateId: null,
        updateTime: null,
        remark: null,
        status: null,
        delFlag: null,
        archiving: null,
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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.title = "公文发布";
      this.$refs.addDialog.open();
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getDraft(id).then((response) => {
        this.$refs.addDialog.open(response.data);
        this.title = "修改公文管理草稿";
      });
    },
    /** 提交按钮 */
    handleSubmit(row) {
      submitDraft({ id: row.id }).then((res) => {
        this.getList();
        this.$modal.msgSuccess("提交成功");
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除公文管理草稿编号为"' + ids + '"的数据项？')
        .then(function () {
          return delDraft(ids);
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
        "project/draft/export",
        {
          ...this.queryParams,
        },
        `draft_${new Date().getTime()}.xlsx`
      );
    },
    // 获取公文处理详情
    selectDocumentProcessListByDocId(id) {
      selectDocumentProcessListByDocId({ id }).then((res) => {
        this.historicalRecord = res.data;
      });
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return "未知时间";
      return new Date(time).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },

    // 公文预览
    getPreviewRedHeaderDoc(id) {
      getPreviewRedHeaderDoc(id)
        .then((res) => {
          // 创建 blob 对象，设置正确的 MIME 类型
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });
          // 创建下载链接
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          // 设置下载文件名
          link.download = `公文_${id}.docx`;
          // 添加到页面并触发点击
          document.body.appendChild(link);
          link.click();
          // 清理
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          this.$message.error("文件下载失败");
          console.error("下载失败:", error);
        });
    },
    // 获取处理状态名称
    getProcessStatusName(status) {
      const statusMap = {
        0: "待办",
        1: "已办",
        2: "通过",
        3: "退回",
        4: "已被退回",
      };
      return statusMap[status] || "未知";
    },

    // 获取状态对应的标签类型
    getStatusTagType(status) {
      const typeMap = {
        0: "info",
        1: "success",
        2: "success",
        3: "warning",
        4: "danger",
      };
      return typeMap[status] || "";
    },

    // 获取时间线项目类型
    getStatusType(status) {
      const typeMap = {
        0: "info",
        1: "success",
        2: "success",
        3: "warning",
        4: "danger",
      };
      return typeMap[status] || "";
    },
  },
};
</script>

<style scope>
/* 处理流程弹窗样式 */
::v-deep .process-history-popover {
  max-width: 500px;
}

.timeline-container {
  height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.history-item {
  padding: 8px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-bottom: 8px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-title {
  font-weight: bold;
  flex: 1;
}

.history-info {
  font-size: 13px;
  margin-top: 5px;
  color: #606266;
}

.info-label {
  color: #909399;
  margin-right: 5px;
}

.info-value {
  color: #303133;
}

/* 滚动条样式 */
.timeline-container::-webkit-scrollbar {
  width: 6px;
}

.timeline-container::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.timeline-container::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}
</style>
