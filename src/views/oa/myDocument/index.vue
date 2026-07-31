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

      <el-form-item label="发布开始日期" prop="draftStartDate">
        <el-date-picker
          v-model="queryParams.draftStartDate"
          type="date"
          format="yyyy-MM-dd"
          placeholder="选择发布开始日期"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>

      <el-form-item label="发布结束日期" prop="draftEndDate">
        <el-date-picker
          v-model="queryParams.draftEndDate"
          type="date"
          format="yyyy-MM-dd"
          placeholder="选择发布结束日期"
          style="width: 100%"
        >
        </el-date-picker>
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

    <el-table v-loading="loading" :data="myDocumentList">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
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
      <el-table-column label="状态" align="center" prop="status" width="150">
        <template slot-scope="scope">
          <el-tag>{{ getStatusName(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="发布日期"
        align="center"
        prop="draftDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.draftDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
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
              v-if="scope.row.processStatus !== 1"
              size="mini"
              type="text"
              :class="{
                'edit-button':
                  scope.row.status === 1 || scope.row.status === 11,
              }"
              :icon="
                scope.row.status === 1 || scope.row.status === 11
                  ? 'el-icon-edit'
                  : 'el-icon-view'
              "
              @click="handleTransact(scope.row)"
              >{{
                scope.row.status === 1 || scope.row.status === 11
                  ? "修改"
                  : "办理"
              }}</el-button
            >
            <el-popover
              placement="top-end"
              width="500"
              trigger="click"
              popper-class="process-history-popover"
            >
              <div class="timeline-container">
                <el-timeline>
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
    <transactDialog
      ref="transactDialog"
      :formData="form"
      :title="title"
      @cancel="getList()"
    />
  </div>
</template>
<script>
import {
  listDocumentHandle,
  getDetail,
  selectDocumentProcessListByDocId,
  getPreviewRedHeaderDoc,
} from "@/api/oa/document";
import transactDialog from "./transactDialog.vue";
export default {
  name: "",
  components: { transactDialog },
  dicts: ["sys_normal_disable", "official_secrecy", "official_urgency_level"],
  mixins: [],
  props: {},
  data() {
    return {
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
      // 显示搜索条件
      showSearch: true,
      // 表单参数
      form: {},
      title: "",
      myDocumentList: [],
      total: 0,
      loading: false,
      historicalRecord: [],
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.getList();
  },
  methods: {
    //获取综合岗角色
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
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      listDocumentHandle(this.queryParams).then((response) => {
        this.myDocumentList = response.rows;
        this.total = response.total;
        this.loading = false;
        console.log(response, "response");
      });
    },
    handleTransact(data) {
      this.reset();
      const id = data.id || this.ids;
      getDetail(id).then((response) => {
        // 检查原始响应和处理后的数据
        console.log('原始响应:', response);
        console.log('处理后的数据:', response.data);

        // 如果filePath不存在但应该存在，可以手动添加
        if (response.filePath && !response.data.filePath) {
          response.data.filePath = response.filePath;
        }

        this.$refs.transactDialog.open(response.data);
        this.title = "办理公文";
      });
    },
    // 获取状态名称
    getStatusName(status) {
      const statusMap = {
        1: "公文修改",
        2: "综合岗收文办理",
        3: "主任岗收文审核",
        4: "办理、协办岗收文办理",
        5: "已归档",
        11: "公文修改",
        12: "经理审核",
        13: "综合岗核稿",
        14: "主任岗审核",
        15: "文件套头",
        16: "用印审批",
        17: "接收人确认",
        18: "综合岗办结",
        20: "已归档",
      };
      return statusMap[status] || "未知状态";
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
<style scoped>
.edit-button {
  color: #f56c6c !important;
}

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
