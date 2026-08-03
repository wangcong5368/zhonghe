<template xmlns="http://www.w3.org/1999/html">
  <div class="app-container">
    <div v-sticky="{ zIndex: 1000, stickyTop: 0 }" style="background-color: #fff; padding: 5px">
      <el-form :model="queryParams" ref="queryForm" size="small" v-show="showSearch" label-width="108px">
        <!-- 第一行 -->
        <el-row>
          <el-col :span="6">
            <el-form-item label="消费者姓名" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入消费者姓名" clearable @keyup.enter.native="handleQuery"
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="机构名称" prop="deptId">
              <treeselect v-model="queryParams.deptId" :options="deptOptions" :normalizer="normalizer"
                placeholder="请选择机构" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="工单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择工单状态" clearable style="width: 100%">
                <el-option v-for="dict in dict.type.dm_status" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="结案类型" prop="finishType">
              <el-select v-model="queryParams.finishType" placeholder="请选择结案类型" clearable style="width: 100%">
                <el-option v-for="dict in dict.type.dm_finish_type" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row>
          <el-col :span="6">
            <el-form-item label="进件渠道" prop="entryChannel">
              <el-cascader v-model="queryParams.entryChannel" :options="dict.type.dm_entry_channel.options"
                :props="{ expandTrigger: 'hover', emitPath: false }" placeholder="请选择进件渠道" clearable
                style="width: 100%" />
              <!--              <el-select v-model="queryParams.entryChannel" placeholder="请选择进件渠道" clearable style="width: 100%">-->
              <!--                <el-option v-for="dict in dict.type.dm_entry_channel" :key="dict.value" :label="dict.label" :value="dict.value" />-->
              <!--              </el-select>-->
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="投诉分类" prop="bankComplaintType">
              <el-select v-model="queryParams.bankComplaintType" placeholder="请选择投诉分类" clearable style="width: 100%">
                <el-option v-for="dict in dict.type.dm_bank_complaint_type" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="$store.getters.userInfo.isDMLeader">
            <el-form-item label="调解员" prop="mediatorUserId">
              <el-select v-model="queryParams.mediatorUserId" placeholder="请选择调解员" clearable style="width: 100%">
                <el-option v-for="item in mediatorOptions" :key="item.mediatorUserId" :label="item.nickName"
                  :value="item.mediatorUserId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="案件编号" prop="workOrderId">
              <el-input v-model="queryParams.workOrderId" placeholder="请输入案件编号" clearable
                @keyup.enter.native="handleQuery" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否执行完毕" prop="executionCompletedFlag">
              <el-select v-model="queryParams.params.executionCompletedFlag" placeholder="请选择是否执行完毕" clearable
                style="width: 100%">
                <el-option v-for="dict in this.executionCompletedFlagOptions" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 高级搜索区域 -->
        <div v-show="advancedSearch">
          <!-- 第三行 -->
          <el-row>
            <el-col :span="6">
              <el-form-item label="证件类型" prop="certType">
                <el-select v-model="queryParams.certType" placeholder="请选择证件类型" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="证件号码" prop="certNum">
                <el-input v-model="queryParams.certNum" placeholder="请输入证件号码" clearable
                  @keyup.enter.native="handleQuery" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="纠纷发生日期" prop="disputeDate">
                <el-date-picker clearable v-model="queryParams.disputeDate" type="date" value-format="yyyy-MM-dd"
                  placeholder="请选择纠纷发生日期" style="width: 100%"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="业务类别" prop="businessType1">
                <el-cascader v-model="queryParams.businessType1" :options="dict.type.dm_business_type.options"
                  :props="{ emitPath: false, checkStrictly: true }" placeholder="请选择业务类别" clearable style="width: 100%"
                  ref="businessType1Ref" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第四行 -->
          <el-row>
            <el-col :span="6">
              <el-form-item label="业务办理渠道" prop="handleChannel">
                <el-select v-model="queryParams.handleChannel" placeholder="请选择业务办理渠道" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_handle_channel" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="产品销售渠道" prop="saleChannel">
                <el-select v-model="queryParams.saleChannel" placeholder="请选择产品销售渠道" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_sale_channel" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="保险消费投诉事由分类" prop="insuranceComplaintType">
                <el-select v-model="queryParams.insuranceComplaintType" placeholder="请选择保险消费投诉事由分类" clearable
                  style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_insurance_complaint_type" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="险种类别" prop="insuranceType1">
                <el-cascader v-model="queryParams.insuranceType1" :options="dict.type.dm_insurance_type.options"
                  :props="{ emitPath: false, checkStrictly: true }" placeholder="请选择险种类别" clearable style="width: 100%"
                  ref="insuranceType1Ref" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 第五行 -->
          <el-row>
            <el-col :span="6">
              <el-form-item label="受理状态" prop="acceptStatus">
                <el-select v-model="queryParams.acceptStatus" placeholder="请选择受理状态" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_accept_status" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="调解结果" prop="mediationResult">
                <el-select v-model="queryParams.mediationResult" placeholder="请选择调解结果" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_mediation_result" :key="dict.value" :label="dict.label"
                    :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="联系方式">
                <el-input v-model="queryParams.params.phone" placeholder="请输入联系方式或代理人联系方式" clearable
                  @keyup.enter.native="handleQuery" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="签署协议情况" prop="signWay">
                <el-select v-model="queryParams.signWay" placeholder="请选择签署协议情况" clearable style="width: 100%">
                  <el-option label="未签署" value="0"/>
                  <el-option v-for="dict in dict.type.dm_sign_way" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="6">
              <el-form-item label="业务类型" prop="industry">
                <el-select v-model="queryParams.industry" placeholder="请选择业务类型" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_industry" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="创建时间" prop="createTime">
                <el-date-picker v-model="queryParams.params.createTime" value-format="yyyy-MM-dd HH:mm:ss"
                  type="datetimerange" range-separator="至" start-placeholder="开始日期"
                  end-placeholder="结束日期"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 原注释的表单项保持不变 -->
          <!--      <el-form-item label="被投诉主体层级" prop="level">-->
          <!--        <el-input-->
          <!--          v-model="queryParams.level"-->
          <!--          placeholder="请输入被投诉主体层级"-->
          <!--          clearable-->
          <!--          @keyup.enter.native="handleQuery"-->
          <!--        />-->
          <!--      </el-form-item>-->

          <!--      <el-form-item label="涉及产品或服务合同号" prop="contract">-->
          <!--        <el-input-->
          <!--          v-model="queryParams.contract"-->
          <!--          placeholder="请输入涉及产品或服务合同号"-->
          <!--          clearable-->
          <!--          @keyup.enter.native="handleQuery"-->
          <!--        />-->
          <!--      </el-form-item>-->
          <!--      <el-form-item label="金融机构是否接受调解" prop="deptAcceptMediate">-->
          <!--        <el-input-->
          <!--          v-model="queryParams.deptAcceptMediate"-->
          <!--          placeholder="请选择金融机构是否接受调解"-->
          <!--          clearable-->
          <!--          @keyup.enter.native="handleQuery"-->
          <!--        />-->
          <!--      </el-form-item>-->

          <!--      <el-form-item label="履约类型" prop="enforceAgreementType">-->
          <!--        <el-select v-model="queryParams.enforceAgreementType" placeholder="请选择履约类型" clearable>-->
          <!--          <el-option-->
          <!--            v-for="dict in dict.type.dm_enforce_agreement_type"-->
          <!--            :key="dict.value"-->
          <!--            :label="dict.label"-->
          <!--            :value="dict.value"-->
          <!--          />-->
          <!--        </el-select>-->
          <!--      </el-form-item>-->
        </div>

        <!-- 展开收起按钮 -->
        <div style="text-align: center; margin: 10px 0">
          <el-link type="primary" @click="advancedSearch = !advancedSearch">
            {{ advancedSearch ? '收起' : '展开' }}
            <i :class="advancedSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </el-link>
        </div>

        <!-- 搜索重置按钮 -->
        <div style="margin: 0 auto; width: 200px">
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </div>
      </el-form>
    </div>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <template v-hasPermi="['project:disputeMediation:add']">
          <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
            v-if="$store.getters.userInfo.isDMEntryClerk || $store.getters.userInfo.isDMInstitutionEntryClerk">
            新增
          </el-button>
        </template>
      </el-col>
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--          type="success"-->
      <!--          plain-->
      <!--          icon="el-icon-edit"-->
      <!--          size="mini"-->
      <!--          :disabled="single"-->
      <!--          @click="handleUpdate"-->
      <!--          v-hasPermi="['project:disputeMediation:edit']"-->
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
      <!--          v-hasPermi="['project:disputeMediation:remove']"-->
      <!--        >删除</el-button>-->
      <!--      </el-col>-->

      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="$refs.importRef.open()"
          v-hasPermi="['project:disputeMediation:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-upload2" size="mini" @click="$refs.importByHDRef.open()"
          v-hasPermi="['project:disputeMediation:importByHD']">河东法院导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="$refs.exportAllRef.open()"
          v-hasPermi="['project:disputeMediation:export']">总局导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="$refs.exportRef.open()"
          v-hasPermi="['project:disputeMediation:export']">自收案件总局导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['project:disputeMediation:dataExport']">数据导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" round icon="el-icon-tickets" size="mini" @click="
          () => {
            backlog = !backlog;
            getList();
          }
        ">
          {{ backlog ? '待办' : '全部' }}
        </el-button>
      </el-col>
      <el-col :span="1.5" v-if="$store.getters.userInfo.isDMMediator">
        <el-button type="success" round icon="el-icon-copy-document" size="mini" @click="
          () => {
            myCase = myCase === 2 ? 0 : myCase + 1;
            getList();
          }
        ">
          {{ myCase === 0 ? '全部' : myCase === 1 ? '主调' : myCase === 2 ? '副调' : '' }}
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns" />
      <div class="top-right-btn" style="margin-right: 10px">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5" v-if="$store.getters.userInfo.isDMMediator">
            <el-button-group>
              <el-button type="primary" plain icon="el-icon-arrow-left" size="mini"
                :disabled="queryParams.pageNum === 1" @click="
                  queryParams.pageNum -= 1;
                getList();
                ">
                上一页
              </el-button>
              <el-button type="primary" plain size="mini"
                :disabled="queryParams.pageNum * queryParams.pageSize >= total" @click="
                  queryParams.pageNum += 1;
                getList();
                ">
                下一页
                <i class="el-icon-arrow-right el-icon--right" />
              </el-button>
            </el-button-group>
          </el-col>
          <el-col :span="1.5" v-if="this.$store.getters.userInfo.isDMMediatorAuditor">
            <el-tooltip class="item" effect="dark" content="派单审核记录" placement="top">
              <el-button size="mini" circle icon="el-icon-s-order" @click="$refs.mediatorAuditListRef.open()" />
            </el-tooltip>
          </el-col>
          <el-col :span="1.5"
            v-if="this.$store.getters.userInfo.dept.type === this.DEPT_TYPE.center || this.$store.getters.userInfo.dept.type === this.DEPT_TYPE.centerDept">
            <el-tooltip class="item" effect="dark" content="查看自动分配表" placement="top">
              <el-button size="mini" circle icon="el-icon-s-custom" @click="$refs.autoAssignRef.open()" />
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
    </el-row>

    <el-table v-loading="loading" :data="disputeMediationList" @selection-change="handleSelectionChange"
      :default-sort="defaultSort" @sort-change="handleSortChange" :row-class-name="tableRowClassName">
      >
      <el-table-column label="案件编号" align="center" prop="workOrderId"
        v-if="columns.find(s => s.label === '案件编号').visible" sortable="custom" width="130px">
        <template slot-scope="scope">
          <el-tooltip
            v-if="!$store.getters.userInfo.isDMInstitution && scope.row.mediatorAcceptTime && !scope.row.finishTime"
            class="item" effect="dark" :content="'调解员接案时间:' + scope.row.mediatorAcceptTime" placement="right">
            <el-badge class="item" :value="scope.row.mediatorHandleTime"
              :type="scope.row.mediatorHandleTime <= 15 ? 'info' : scope.row.mediatorHandleTime < 30 ? 'warning' : 'danger'">
              <span>{{ scope.row.workOrderId }}</span>
            </el-badge>
          </el-tooltip>
          <el-tooltip
            v-else-if="$store.getters.userInfo.isDMInstitution && scope.row.sendFeedbackTime && !scope.row.feedbackTime"
            class="item" effect="dark" :content="'发送反馈单时间:' + scope.row.sendFeedbackTime" placement="right">
            <el-badge class="item" :value="scope.row.deptHandleTime"
              :type="scope.row.deptHandleTime < 4 ? 'info' : scope.row.deptHandleTime < 7 ? 'warning' : 'danger'">
              <span>{{ scope.row.workOrderId }}</span>
            </el-badge>
          </el-tooltip>
          <span v-else>{{ scope.row.workOrderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费者姓名" align="center" prop="name" v-if="columns.find(s => s.label === '消费者姓名').visible" />
      <el-table-column label="联系方式" align="center" width="110" prop="phone"
        v-if="columns.find(s => s.label === '联系方式').visible" />
      <el-table-column label="接案时间" align="center" width="100" v-if="columns.find(s => s.label === '接案时间').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.mediatorAcceptTime, '{y}-{m}-{d}') }}</span><br/><span>{{ parseTime(scope.row.mediatorAcceptTime, '{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="机构名称" align="center" prop="deptId" v-if="columns.find(s => s.label === '机构名称').visible">
        <template slot-scope="scope">
          <span>{{ deptMap.get(scope.row.deptId) ? deptMap.get(scope.row.deptId).deptName : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调解员" align="center" prop="mediatorName" v-if="columns.find(s => s.label === '调解员').visible"/>
      <el-table-column label="工单状态" align="center" prop="status" v-if="columns.find(s => s.label === '状态').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="结案时间" align="center" prop="finishTime" width="100"
        v-if="columns.find(s => s.label === '结案时间').visible" sortable="custom">
        <template slot-scope="scope">
          <span v-if="scope.row.finishTime">{{ parseTime(scope.row.finishTime) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="证件类型" align="center" prop="certType" v-if="columns.find(s => s.label === '证件类型').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.cert_type" :value="scope.row.certType" />
        </template>
      </el-table-column>
      <el-table-column label="证件号码" align="center" prop="certNum"
        v-if="columns.find(s => s.label === '证件号码').visible" />
      <el-table-column label="纠纷发生日期" align="center" prop="disputeDate" width="180"
        v-if="columns.find(s => s.label === '纠纷发生日期').visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.disputeDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进件渠道" align="center" prop="entryChannel"
        v-if="columns.find(s => s.label === '进件渠道').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_entry_channel" :value="scope.row.entryChannel" />
        </template>
      </el-table-column>
      <el-table-column label="受理状态" align="center" prop="acceptStatus"
        v-if="columns.find(s => s.label === '受理状态').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_accept_status" :value="scope.row.acceptStatus" />
        </template>
      </el-table-column>
      <el-table-column label="协议阶段" align="center" prop="agreementStep"
        v-if="columns.find(s => s.label === '协议阶段').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_agreement_step" :value="scope.row.agreementStep" />
        </template>
      </el-table-column>
      <el-table-column label="调解结果" align="center" prop="mediationResult"
        v-if="columns.find(s => s.label === '调解结果').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_mediation_result" :value="scope.row.mediationResult" />
        </template>
      </el-table-column>
      <el-table-column label="结案类型" align="center" prop="finishType"
        v-if="columns.find(s => s.label === '结案类型').visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dm_finish_type" :value="scope.row.finishType" />
        </template>
      </el-table-column>
      <el-table-column label="是否打分" align="center" prop="satisfactionScore" width="90"
        v-if="columns.find(s => s.label === '是否打分').visible">
        <template slot-scope="scope">
          <span :class="{ 'text-danger': !isSatisfactionScored(scope.row.satisfactionScore) }">
            {{ isSatisfactionScored(scope.row.satisfactionScore) ? '已打分' : '未打分' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="盖章反馈天数" align="center" prop="stampedFeedbackAttachmentDay" width="110"
        v-if="columns.find(s => s.label === '盖章反馈天数').visible">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stampedFeedbackAttachmentTime ? 'success' : 'danger'"
            v-if="scope.row.stampedFeedbackAttachmentDay != null">{{ scope.row.stampedFeedbackAttachmentDay }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="100"
        v-if="columns.find(s => s.label === '创建时间').visible" sortable="custom">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="100"
        v-if="columns.find(i => i.label === '修改时间').visible" sortable="custom">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.updateBy" placement="bottom"
            v-if="scope.row.updateBy">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </el-tooltip>
          <span v-if="!scope.row.updateBy">{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="130">
        <template v-slot="{ row }">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleDetail(row)">详情</el-button>

          <el-button size="mini" type="text" icon="el-icon-s-data"
            @click="handleEvidenceComparison(row)">证据比对</el-button>

          <el-button size="mini" type="text" icon="el-icon-s-custom" @click="handleMediatorAudit(row)"
            v-if="$store.getters.userInfo.isDMMediatorAuditor && DM_STATUS.DM_STATUS5 === row.status">
            派单审核
          </el-button>

          <el-button size="mini" type="text" icon="el-icon-s-order" @click="showMediatorAuditRecord(row)"
            v-if="row.mediatorChange && ($store.getters.userInfo.isDMMediatorChanger || $store.getters.userInfo.isDMMediatorAuditor)">
            派单审核记录
          </el-button>

          <div v-if="
            ($store.getters.userInfo.isDMMediator &&
              ($store.getters.userInfo.userId === row.mediatorUserId || $store.getters.userInfo.userId === row.assistantUserId) &&
              [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4, DM_STATUS.DM_STATUS10].includes(row.status)) ||
            ($store.getters.userInfo.isDMMediator &&
              !isApproval(row) &&
              $store.getters.userInfo.userId === row.mediatorUserId &&
              [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status)) ||
            ($store.getters.userInfo.isDMMediatorChanger && (DM_STATUS.DM_STATUS2 === row.status || DM_STATUS.DM_STATUS5 === row.status) && !row.assistantUserId) ||
            (($store.getters.userInfo.isDMMediator || $store.getters.userInfo.isDMEntryClerk) &&
              [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status))
          ">
            <el-dropdown trigger="click" size="mini" @command="edit($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">修改</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit" icon="el-icon-edit" v-if="
                  $store.getters.userInfo.isDMMediator &&
                  ($store.getters.userInfo.userId === row.mediatorUserId || $store.getters.userInfo.userId === row.assistantUserId) &&
                  [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4, DM_STATUS.DM_STATUS10].includes(row.status)
                ">
                  {{ DM_STATUS.DM_STATUS2 === row.status && row.assistantUserId &&
                    DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel) ? '修改工单开始调解' : '修改工单' }}
                </el-dropdown-item>
                <el-dropdown-item command="editAssistant" icon="el-icon-s-custom" v-if="
                  $store.getters.userInfo.isDMMediator &&
                  !isApproval(row) &&
                  $store.getters.userInfo.userId === row.mediatorUserId &&
                  [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status)
                ">
                  {{ row.assistantUserId ? '修改助理调解员' : '选择助理调解员' }}
                </el-dropdown-item>
                <el-dropdown-item command="editMediator" icon="el-icon-s-custom"
                  v-if="$store.getters.userInfo.isDMMediatorChanger && (DM_STATUS.DM_STATUS2 === row.status || DM_STATUS.DM_STATUS5 === row.status) && !row.assistantUserId">
                  修改调解员
                </el-dropdown-item>
                <el-dropdown-item command="editDept" icon="el-icon-office-building" v-if="
                  ($store.getters.userInfo.isDMMediator || $store.getters.userInfo.isDMEntryClerk) &&
                  [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status)
                ">
                  更改机构
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <!--          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(row)" v-if="$store.getters.userInfo.isDMMediator && ($store.getters.userInfo.userId === row.mediatorUserId || $store.getters.userInfo.userId === row.assistantUserId) && [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4, DM_STATUS.DM_STATUS10].includes(row.status)">-->
          <!--            {{ DM_STATUS.DM_STATUS2 === row.status && row.assistantUserId && DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel) ? "修改工单开始调解" : "修改工单" }}-->
          <!--          </el-button>-->

          <!--          <el-button size="mini" type="text" icon="el-icon-s-custom" @click="handleSelectMediator(row, row.assistantUserId?'修改助理调解员':'选择助理调解员')" v-if="$store.getters.userInfo.isDMMediator && !isApproval(row) && $store.getters.userInfo.userId === row.mediatorUserId && [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status)">-->
          <!--            {{ row.assistantUserId?'修改助理调解员':'选择助理调解员' }}-->
          <!--          </el-button>-->

          <!--          <el-button size="mini" type="text" icon="el-icon-s-custom" @click="handleSelectMediator(row, '修改调解员')" v-if="$store.getters.userInfo.isDMMediatorChanger && (DM_STATUS.DM_STATUS2 === row.status || DM_STATUS.DM_STATUS5 === row.status) && !row.assistantUserId">-->
          <!--            修改调解员-->
          <!--          </el-button>-->

          <!--          <el-button size="mini" type="text" icon="el-icon-office-building" @click="handleSelectDept(row)" v-if="($store.getters.userInfo.isDMMediator || $store.getters.userInfo.isDMEntryClerk) && [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status)">-->
          <!--            更改机构-->
          <!--          </el-button>-->

          <el-button size="mini" type="text" icon="el-icon-video-camera-solid" @click="showVideoAuditRecord(row)"
            v-if="row.videoAuditStatus && ($store.getters.userInfo.isDMVideoAuditor1 || $store.getters.userInfo.isDMVideoAuditor2)">
            {{
              (row.videoAuditStatus.split(',').includes(DM_VIDEO_AUDIT_STATUS.STATUS1) &&
                $store.getters.userInfo.isDMVideoAuditor1) ||
                (row.videoAuditStatus.split(',').includes(DM_VIDEO_AUDIT_STATUS.STATUS2) &&
                  $store.getters.userInfo.isDMVideoAuditor2)
                ? '录像审核'
                : '录像审核记录'
            }}
          </el-button>

          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleReception(row)"
            v-if="$store.getters.userInfo.isDMCenterHandler && DM_STATUS.DM_STATUS1 === row.status">
            前台处理
          </el-button>

          <el-button size="mini" type="text" icon="el-icon-s-promotion" @click="sandFeedback(row)"
            v-if="$store.getters.userInfo.isDMMediator && DM_STATUS.DM_STATUS2 === row.status && row.assistantUserId && !DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel)">
            {{ row.deptAcceptMediate ? '重新发送反馈单' : '发送反馈单' }}
          </el-button>

          <template v-hasPermi="['project:disputeMediation:handle']">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleFeedback1(row)"
              v-if="$store.getters.userInfo.isDMInstitutionHandle && DM_STATUS.DM_STATUS3 === row.status && !row.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel)">
              反馈
            </el-button>
            <template v-if="$store.getters.userInfo.isDMInstitutionHandle && DM_STATUS.DM_STATUS20 !== row.status && SYS_YES_NO.sys_yes === row.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel)">
              <el-tooltip v-if="!row.stampedFeedbackAttachment" class="item" effect="dark" content="请及时上传已盖章反馈单附件" placement="left">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="handleFeedback2(row)">
                  {{ DM_STATUS.DM_STATUS3 === row.status && !row.feedbackTime ? '补充反馈单' : '修改反馈单' }}
                </el-button>
              </el-tooltip>
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleFeedback2(row)" v-else>
                {{ DM_STATUS.DM_STATUS3 === row.status && !row.feedbackTime ? '补充反馈单' : '修改反馈单' }}
              </el-button>
            </template>
            <el-button size="mini" type="text" icon="el-icon-star-on" @click="handleSatisfaction(row)" v-if="$store.getters.userInfo.isDMInstitutionHandle && SYS_YES_NO.sys_yes === row.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel) && [DM_STATUS.DM_STATUS10, DM_STATUS.DM_STATUS20].includes(row.status)">
              满意度
            </el-button>
          </template>

          <template
            v-hasPermi="['project:disputeMediation:mediationRoomReservation', 'project:disputeMediation:mediationRoomUse']">
            <div
              v-if="[DM_STATUS.DM_STATUS4, DM_STATUS.DM_STATUS10, DM_STATUS.DM_STATUS20].includes(row.status) && !$store.getters.userInfo.isDMInstitution">
              <el-dropdown trigger="click" size="mini" @command="handleMediationRoom($event, row)">
                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">调解室</el-button>
                <el-dropdown-menu slot="dropdown">
                  <template v-hasPermi="['project:disputeMediation:mediationRoomReservation']">
                    <el-dropdown-item command="a"
                      v-if="DM_STATUS.DM_STATUS4 === row.status && isDMMediator(row)">预约</el-dropdown-item>
                  </template>
                  <template
                    v-hasPermi="['project:disputeMediation:mediationRoomReservation', 'project:disputeMediation:mediationRoomUse']">
                    <el-dropdown-item command="b"
                      v-if="!$store.getters.userInfo.isDMInstitution">预约记录</el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>

          <div v-if="
            [DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4, DM_STATUS.DM_STATUS10, DM_STATUS.DM_STATUS20].includes(row.status) &&
            row.assistantUserId &&
            !$store.getters.userInfo.isDMInstitution
          ">
            <el-dropdown trigger="click" size="mini" @command="handleInvestigation($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">调查记录</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="a" icon="el-icon-circle-plus"
                  v-if="[DM_STATUS.DM_STATUS2, DM_STATUS.DM_STATUS3, DM_STATUS.DM_STATUS4].includes(row.status) && isDMMediator(row)">
                  新增调查记录
                </el-dropdown-item>
                <el-dropdown-item command="b" icon="el-icon-info">调查记录详情</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div v-if="
            ((DM_STATUS.DM_STATUS3 === row.status && SYS_YES_NO.sys_yes === row.deptAcceptMediate) ||
              [DM_STATUS.DM_STATUS4, DM_STATUS.DM_STATUS10, DM_STATUS.DM_STATUS20].includes(row.status)) &&
            !$store.getters.userInfo.isDMInstitution
          ">
            <el-dropdown trigger="click" size="mini" @command="handleMediationRecord($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">调解记录</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="a" icon="el-icon-circle-plus"
                  v-if="((DM_STATUS.DM_STATUS3 === row.status && SYS_YES_NO.sys_yes === row.deptAcceptMediate) || DM_STATUS.DM_STATUS4 === row.status) && isDMMediator(row)">
                  新增调解记录
                </el-dropdown-item>
                <el-dropdown-item command="b" icon="el-icon-info">调解记录详情</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div
            v-if="!!row.agreementId || ($store.getters.userInfo.isDMMediator && DM_STATUS.DM_STATUS4 === row.status && DM_AGREEMENT_STEP.SF !== row.agreementStep)">
            <el-dropdown trigger="click" size="mini" @command="noticeBookSelect($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">协议书</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="edit"
                  v-if="isDMMediator(row) && DM_STATUS.DM_STATUS4 === row.status && DM_AGREEMENT_STEP.SF !== row.agreementStep">
                  编辑协议书
                </el-dropdown-item>
                <el-dropdown-item command="check" v-if="!!row.agreementId">查看协议书</el-dropdown-item>
                <el-dropdown-item command="download" v-if="!!row.agreementId">预审下载</el-dropdown-item>
                <el-dropdown-item command="applyStamp"
                  v-if="isDMMediator(row) && DM_STATUS.DM_STATUS4 === row.status && !!row.agreementId && DM_AGREEMENT_STEP.AS === row.agreementStep">
                  用印申请
                </el-dropdown-item>
                <el-dropdown-item command="openProcessPage"
                  v-if="!!row.agreementId && !$store.getters.userInfo.isDMInstitution">查看审核流程</el-dropdown-item>
                <el-dropdown-item command="signContractOpen"
                  v-if="isDMMediator(row) && DM_STATUS.DM_STATUS4 === row.status && !!row.agreementId && DM_AGREEMENT_STEP.AF === row.agreementStep">
                  签约协议书
                </el-dropdown-item>
                <el-dropdown-item command="onlineSignInfoOpen"
                  v-if="(DEPT_TYPE.center.includes($store.getters.userInfo.dept.type) || DEPT_TYPE.centerDept.includes($store.getters.userInfo.dept.type)) && !!row.signId">
                  线上签署详情
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div v-if="
            [DM_STATUS.DM_STATUS10, DM_STATUS.DM_STATUS20].includes(row.status) &&
            // SYS_YES_NO.sys_yes === row.needReturnVisit &&
            !$store.getters.userInfo.isDMInstitution &&
            DM_ACCEPT_STATUS.accept === row.acceptStatus &&
            SYS_YES_NO.sys_yes === row.deptAcceptMediate &&
            DM_FINISH_TYPE.normal === row.finishType
          ">
            <el-dropdown trigger="click" size="mini" @command="handleCallback($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">回访记录</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="a" icon="el-icon-circle-plus"
                  v-if="DM_STATUS.DM_STATUS10 === row.status && isDMMediator(row)">新增回访记录</el-dropdown-item>
                <el-dropdown-item command="b" icon="el-icon-info">回访记录详情</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <div v-if="
            [DM_STATUS.DM_STATUS10, DM_STATUS.DM_STATUS20].includes(row.status) &&
            DM_ACCEPT_STATUS.accept === row.acceptStatus &&
            SYS_YES_NO.sys_yes === row.deptAcceptMediate &&
            DM_FINISH_TYPE.normal === row.finishType
          ">
            <el-dropdown trigger="click" size="mini" @command="handleAgreement($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">履约登记</el-button>
              <el-dropdown-menu slot="dropdown">
                <template v-hasPermi="['project:disputeMediation:handle']">
                  <el-dropdown-item command="a" icon="el-icon-circle-plus"
                    v-if="DM_STATUS.DM_STATUS10 === row.status && $store.getters.userInfo.isDMInstitutionHandle">
                    新增履约登记
                  </el-dropdown-item>
                </template>
                <el-dropdown-item command="b" icon="el-icon-info">履约登记详情</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <!--          <el-button size="mini" type="text" icon="el-icon-download" @click="downloadFeedback(row)" v-if="SYS_YES_NO.sys_yes === row.deptAcceptMediate && (DM_STATUS.DM_STATUS3 === row.status || row.feedbackTime)">-->
          <!--            下载反馈单-->
          <!--          </el-button>-->

          <div v-if="
            (SYS_YES_NO.sys_yes === row.deptAcceptMediate && (DM_STATUS.DM_STATUS3 === row.status || row.feedbackTime)) ||
            ($store.getters.userInfo.isDMMediator && DM_STATUS.DM_STATUS1 !== row.status)
          ">
            <el-dropdown trigger="click" size="mini" @command="downloadFile($event, row)">
              <el-button size="mini" type="text" icon="el-icon-d-arrow-right">相关下载</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="a" icon="el-icon-download"
                  v-if="SYS_YES_NO.sys_yes === row.deptAcceptMediate && (DM_STATUS.DM_STATUS3 === row.status || row.feedbackTime)">
                  下载反馈单
                </el-dropdown-item>
                <el-dropdown-item command="b" icon="el-icon-download"
                  v-if="$store.getters.userInfo.isDMMediator">下载通话录音</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <el-button size="mini" type="text" icon="el-icon-phone"
            @click="$store.dispatch('settings/setCallInfoOpen', { open: true, workOrderId: row.workOrderId, dialNumber: null })"
            v-if="$store.getters.userInfo.isDMEntryClerk || $store.getters.userInfo.isDMMediator">
            拨打电话
          </el-button>

          <el-button size="mini" type="text" icon="el-icon-document-checked" @click="handleFinish(row)" v-if="
            DM_STATUS.DM_STATUS4 === row.status &&
            isDMMediator(row) &&
            ((row.deptAcceptMediate === SYS_YES_NO.sys_yes && row.mediationResult) || row.deptAcceptMediate === SYS_YES_NO.sys_no) &&
            (!row.agreementStep || [DM_AGREEMENT_STEP.AR, DM_AGREEMENT_STEP.AF, DM_AGREEMENT_STEP.SF].includes(row.agreementStep))
          ">
            办结
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-document-delete" @click="terminate(row)"
            v-if="DM_STATUS.DM_STATUS2 === row.status && isDMMediator(row)">终止受理</el-button>
          <el-button size="mini" type="text" icon="el-icon-document-delete" @click="terminate(row)" v-if="
            DM_STATUS.DM_STATUS4 === row.status &&
            isDMMediator(row) &&
            (!row.agreementStep || [DM_AGREEMENT_STEP.AR, DM_AGREEMENT_STEP.AF, DM_AGREEMENT_STEP.SF].includes(row.agreementStep))
          ">
            终止调解
          </el-button>

          <el-tooltip class="item" :disabled="!row.archiveRejectReason" effect="dark" :content="row.archiveRejectReason"
            placement="left">
            <el-badge :is-dot="DM_ARCHIVE_STATUS.reject === row.archiveStatus" class="item"
              v-if="DM_STATUS.DM_STATUS10 === row.status && isDMMediator(row)">
              <el-button size="mini" type="text" icon="el-icon-document-checked" @click="handleArchiveApply(row)"
                :disabled="DM_ARCHIVE_STATUS.apply === row.archiveStatus">
                {{ DM_ARCHIVE_STATUS.apply === row.archiveStatus ? '已提交归档' : '提交归档' }}
              </el-button>
            </el-badge>
          </el-tooltip>
          <el-button size="mini" type="text" icon="el-icon-folder-checked" @click="handleArchive(row)"
            v-if="DM_STATUS.DM_STATUS10 === row.status && DM_ARCHIVE_STATUS.apply === row.archiveStatus && $store.getters.userInfo.isDMArchivist">
            归档
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-folder-delete" @click="handleArchiveReject(row)"
            v-if="DM_STATUS.DM_STATUS10 === row.status && DM_ARCHIVE_STATUS.apply === row.archiveStatus && $store.getters.userInfo.isDMArchivist">
            归档驳回
          </el-button>

          <div v-hasPermi="['project:disputeMediation:rollbackStatus']">
            <el-button size="mini" type="text" icon="el-icon-back" @click="handleRollbackStatus(row)"
              v-if="DM_STATUS.DM_STATUS10 === row.status">状态回退</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 新增纠纷业务工单对话框 -->
    <AddDisputeMediation ref="addDisputeMediationRef" :deptOptions="deptOptionsAdd" :deptMap="deptMap"
      @callback="getList" />

    <!-- 修改纠纷业务工单对话框 -->
    <UpdateDisputeMediation ref="updateDisputeMediationRef" :title="updateDisputeMediationTitle"
      :deptOptions="deptOptions" :deptMap="deptMap" @callback="getList" />

    <!-- 前台处理对话框 -->
    <ReceptionHandle ref="receptionHandleRef" :title="receptionHandleTitle" :deptOptions="deptOptions"
      :deptMap="deptMap" @callback="getList" />

    <!-- 选择调解员 -->
    <SelectMediator ref="selectMediatorRef" :title="selectMediatorTitle" @callback="getList" />

    <!-- 派单审核 -->
    <MediatorAudit ref="mediatorAuditRef" :title="mediatorAuditTitle" @callback="getList" />

    <!-- 派单审核记录 -->
    <MediatorAuditRecord ref="mediatorAuditRecordRef" :title="mediatorAuditRecordTitle" />

    <!-- 派单审核记录列表 -->
    <MediatorAuditList ref="mediatorAuditListRef" :title="mediatorAuditListTitle" />

    <!-- 录像审核记录 -->
    <AutoVideo ref="autoVideoRef" :title="autoVideoTitle" @callback="getList" />

    <!-- 更改机构 -->
    <SelectDept ref="selectDeptRef" :title="selectDeptTitle" :deptOptions="deptOptions" :deptMap="deptMap"
      @callback="getList" />

    <!--    &lt;!&ndash; 填写反馈单 &ndash;&gt;-->
    <!--    <Feedback ref="feedbackRef" :title="feedbackTitle" :deptOptions="deptOptions" :deptMap="deptMap" @callback="getList"/>-->

    <!-- 填写反馈单 -->
    <Feedback1 ref="feedback1Ref" :title="feedbackTitle" @callback="getList" />

    <!-- 填写反馈单 -->
    <Feedback2 ref="feedback2Ref" :title="feedbackTitle" :deptOptions="deptOptions" :deptMap="deptMap"
      @callback="getList" />

    <!-- 纠纷业务详情 -->
    <Detail ref="detailRef" :title="detailTitle" :deptOptions="deptOptions" :deptMap="deptMap" @minimize="minimize" />

    <el-dialog title="满意度" :visible.sync="satisfactionOpen" width="420px" append-to-body :close-on-click-modal="false">
      <el-form :model="satisfactionForm" label-width="88px">
        <el-form-item label="满意度">
          <el-input-number v-model="satisfactionForm.satisfactionScore" :min="0" :max="100" :precision="0"
            controls-position="right" style="width: 100%" placeholder="0-100" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="satisfactionOpen = false">取 消</el-button>
        <el-button type="primary" :loading="satisfactionLoading" @click="submitSatisfaction">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 预约调解室 -->
    <MediationRoomReservation ref="mediationRoomReservationRef" :title="mediationRoomReservationTitle"
      @callback="checkOpen" />

    <!-- 提交预约调解弹窗 -->
    <AppointmentAdd ref="appointmentAddRef" @callback="refreshMediationRoomReservation" />

    <!-- 预约调解记录 -->
    <AppointmentRecord ref="appointmentRecordRef" :title="appointmentRecordTitle" />

    <!-- 新增调查记录 -->
    <InvestigationCreate ref="investigationCreateRef" :title="investigationCreateTitle" @callback="handleInvestigation"
      @minimize="minimize" />

    <!-- 调查记录详情  -->
    <InvestigationDetail ref="investigationDetailRef" :title="investigationDetailTitle" />

    <!-- 新增调解记录 -->
    <MediationRecordCreate ref="mediationRecordCreateRef" :title="mediationRecordCreateTitle"
      @callback="handleMediationRecord" @minimize="minimize" />

    <!-- 调解记录详情 -->
    <MediationRecordDetail ref="mediationRecordDetailRef" :title="mediationRecordDetailTitle" @callback="getList" />

    <!-- 新增履约登记 -->
    <AgreementRecordCreate ref="agreementCreateRef" :title="agreementRecordCreateTitle" @callback="handleAgreement" />

    <!-- 履约登记详情 -->
    <AgreementRecordDetail ref="agreementDetailRef" :title="agreementRecordDetailTitle" />

    <!-- 新增回访记录 -->
    <CallbackRecordCreate ref="callbackCreateRef" :title="callbackRecordCreateTitle" @callback="handleCallback" @saved="getList" />

    <!-- 回访记录详情 -->
    <CallbackRecordDetail ref="callbackDetailRef" :title="callbackRecordDetailTitle" />

    <!-- 调解协议书 -->
    <Agreement ref="agreementRef" :title="agreementTitle" @callback="getList" />

    <!-- 流程弹窗 -->
    <ProcessPage ref="processPageRef" :title="processPageTitle" />

    <!-- 签约组件 -->
    <SignContract ref="signContractRef" :title="signContractTitle" @callback="getList" />

    <!-- 线上签署详情 -->
    <OnlineSignInfo ref="onlineSignInfoRef" :title="onlineSignInfoTitle" />

    <!-- 导入组件 -->
    <Import ref="importRef" @callback="getList" />

    <!-- 河东法院导入 -->
    <Import ref="importByHDRef" dialog-title="河东法院导入" upload-path="/project/disputeMediation/importByHD"
      :show-template-links="false" :show-hd-template-link="true" @callback="getList" />

    <!-- 导出组件 -->
    <ExportAll ref="exportAllRef" />
    <!-- 自收案件导出组件 -->
    <Export ref="exportRef" />

    <!-- 自动分配表 -->
    <AutoAssign ref="autoAssignRef" />

    <!-- 终止办结 -->
    <Terminate ref="terminateRef" :title="terminateTitle" @callback="getList" />

    <!-- 证据比对报告 -->
    <EvidenceComparison ref="evidenceComparisonRef" @callback="getList" />

    <!-- 悬浮按钮 -->
    <template v-if="showFloatingButton">
      <div v-for="(item, index) in minimizeList" :key="index">
        <FloatingButton ref="floatingButtonRef" @callback="showDialog" />
      </div>
    </template>

    <view-file ref="fileViewer" />
  </div>
</template>

<script>
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { institutionList } from '@/api/system/dept';
import {
  DEPT_TYPE,
  SYS_YES_NO,
  SYS_SEX,
  DM_ACCEPT_STATUS,
  DM_STATUS,
  DM_AGREEMENT_STEP,
  DM_FINISH_TYPE,
  DM_ARCHIVE_STATUS,
  DM_ENTRY_CHANNEL,
  DM_VIDEO_AUDIT_STATUS
} from '@/views/constant/CommonConstant.js';

import {
  listDisputeMediation,
  delDisputeMediation,
  applyStamp,
  finish,
  archiveApply,
  archiveReject,
  archive,
  sendFeedback,
  mediatorList,
  cancelMediatorReminder,
  rollbackStatus,
  getDisputeMediationExpandInfo,
  saveOrUpdateDisputeMediationExpand
} from '@/api/project/disputeMediation';

/* component */
import Treeselect from '@riophae/vue-treeselect';
import AddDisputeMediation from './component/addDisputeMediation.vue';
import UpdateDisputeMediation from './component/updateDisputeMediation.vue';
import AppointmentRecord from '@/components/AppointmentRecord/index.vue';
import MediationRoomReservation from '@/components/MediationRoomReservation/index.vue';
import AppointmentAdd from './component/appointmentAdd.vue';
import InvestigationCreate from './component/investigationRecord/create.vue';
import InvestigationDetail from './component/investigationRecord/detail.vue';

import MediationRecordCreate from './component/mediationRecord/create.vue';
import MediationRecordDetail from './component/mediationRecord/detail.vue';

import CallbackRecordCreate from './component/callbackRecord/create.vue';
import CallbackRecordDetail from './component/callbackRecord/detail.vue';

import AgreementRecordCreate from './component/agreementRecord/create.vue';
import AgreementRecordDetail from './component/agreementRecord/detail.vue';
import Agreement from './component/agreement/agreement.vue';
import SignContract from './component/signContract.vue';
import OnlineSignInfo from './component/onlineSignInfo.vue';
import ProcessPage from './component/processPage.vue';

import ReceptionHandle from './component/receptionHandle.vue';
// import Feedback from "./component/feedback.vue";
import Feedback1 from './component/feedback1.vue';
import Feedback2 from './component/feedback2.vue';
import SelectMediator from './component/selectMediator.vue';
import MediatorAudit from './component/mediatorAudit.vue';
import MediatorAuditRecord from './component/mediatorAuditRecord.vue';
import MediatorAuditList from './component/mediatorAuditList.vue';
import AutoVideo from './component/autoVideo.vue';
import SelectDept from './component/selectDept.vue';
import Detail from './component/detail.vue';
import Import from './component/import.vue';
import Export from './component/export.vue';
import ExportAll from './component/exportAll.vue';
import AutoAssign from './component/autoAssign.vue';
import Terminate from './component/terminate.vue';
import EvidenceComparison from './component/evidenceComparison.vue';
import FloatingButton from './component/floatingButton.vue';
import ViewFile from '@/components/viewFile';
import { DM_CREATE_TYPE } from '../../constant/CommonConstant';

export default {
  name: 'DisputeMediation',
  components: {
    Treeselect,
    AddDisputeMediation,
    UpdateDisputeMediation,
    AppointmentRecord,
    AppointmentAdd,
    MediationRoomReservation,
    InvestigationCreate,
    InvestigationDetail,
    Agreement: Agreement,
    ProcessPage,
    SignContract,
    OnlineSignInfo,
    MediationRecordCreate,
    MediationRecordDetail,
    CallbackRecordCreate,
    CallbackRecordDetail,
    AgreementRecordCreate,
    AgreementRecordDetail,
    ReceptionHandle,
    // Feedback,
    Feedback1,
    Feedback2,
    SelectMediator,
    MediatorAudit,
    MediatorAuditRecord,
    MediatorAuditList,
    AutoVideo,
    SelectDept,
    Detail,
    Import,
    Export,
    ExportAll,
    AutoAssign,
    Terminate,
    EvidenceComparison,
    FloatingButton,
    ViewFile
  },
  dicts: [
    'dept_type',
    'dm_status',
    'dm_sale_channel',
    'dm_bank_complaint_type',
    'dm_insurance_complaint_type',
    'dm_accept_status',
    'dm_reject_reason',
    'dm_business_type',
    'cert_type',
    'sys_yes_no',
    'sys_user_sex',
    'dm_handle_channel',
    'dm_enforce_agreement_type',
    'dm_entry_channel',
    'dm_agreement_step',
    'dm_mediation_result',
    'dm_finish_type',
    'dm_insurance_type',
    'sys_yes_no'
    // "dm_audit_result",
    // "dm_investigation_place",
    "dm_sign_way",
    // "sign_status",
    // "sign_item_status",
    // "dm_terminate_accept_reason",
    // "dm_terminate_mediate_reason",
    "dm_industry",
  ],
  data() {
    return {
      // title
      mediationRoomReservationTitle: '预约调解室',
      appointmentRecordTitle: '预约记录',
      investigationCreateTitle: '新增调查记录',
      investigationDetailTitle: '调查记录详情',
      mediationRecordCreateTitle: '新增调解记录',
      mediationRecordDetailTitle: '调解记录详情',
      callbackRecordCreateTitle: '新增回访记录',
      callbackRecordDetailTitle: '回访记录详情',
      agreementRecordCreateTitle: '新增履约登记',
      agreementRecordDetailTitle: '履约登记详情',
      mediatorAuditTitle: '派单审核',
      mediatorAuditRecordTitle: '派单审核记录',
      autoVideoTitle: '录像审核记录',
      mediatorAuditListTitle: '派单审核记录',
      agreementTitle: '协议书',
      processPageTitle: '审核流程',
      signContractTitle: '签约',
      onlineSignInfoTitle: '线上签署详情',
      selectMediatorTitle: '选择调解员',
      selectDeptTitle: '更改机构',
      feedbackTitle: '填写反馈单',
      receptionHandleTitle: '前台处理',
      detailTitle: '工单详情',
      updateDisputeMediationTitle: '修改工单',
      terminateTitle: '终止',
      satisfactionOpen: false,
      satisfactionLoading: false,
      satisfactionForm: {
        workOrderId: null,
        satisfactionScore: undefined
      },

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
      // 纠纷业务工单表格数据
      disputeMediationList: [],
      // 待办标识符
      backlog: false,
      // 主调、副调标识符
      myCase: 1,
      // 默认排序
      defaultSort: { prop: 'createTime', order: 'descending' },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        workOrderId: null,
        isSelf: null,
        isRepeatedly: null,
        isBlackIndustry: null,
        isThirdPartyAgent: null,
        isHighRisk: null,
        name: null,
        certType: null,
        certNum: null,
        disputeDate: null,
        deptId: null,
        entryChannel: null,
        level: null,
        businessType1: null,
        insuranceType1: null,
        handleChannel: null,
        saleChannel: null,
        bankComplaintType: null,
        insuranceComplaintType: null,
        contract: null,
        deptAcceptMediate: null,
        acceptStatus: null,
        enforceAgreementType: null,
        mediationResult: null,
        mediatorUserId: null,
        assistantUserId: null,
        finishType: null,
        status: null,
        params: { phone: null, createTime: null, executionCompletedFlag: null }
      },
      // 列信息
      columns: [
        { label: `案件编号`, visible: true },
        { label: `消费者姓名`, visible: true },
        { label: `联系方式`, visible: true },
        { label: `接案时间`, visible: true },
        { label: `机构名称`, visible: true },
        { label: `状态`, visible: true },
        { label: `结案时间`, visible: true },
        { label: `证件类型`, visible: false },
        { label: `证件号码`, visible: false },
        { label: `纠纷发生日期`, visible: false },
        { label: `进件渠道`, visible: false },
        { label: `受理状态`, visible: false },
        { label: `协议阶段`, visible: false },
        { label: `调解结果`, visible: false },
        { label: `结案类型`, visible: false },
        { label: `是否打分`, visible: true },
        { label: `盖章反馈天数`, visible: false },
        { label: `创建时间`, visible: true },
        { label: `修改时间`, visible: false }
      ],
      executionCompletedFlagOptions: [
        { label: `是`, value: 'Y' },
        { label: `否`, value: 'N' },
        { label: `待执行`, value: 'P' },
      ],
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      DM_AGREEMENT_STEP: DM_AGREEMENT_STEP, // 纠纷业务协议阶段
      DM_FINISH_TYPE: DM_FINISH_TYPE, // 纠纷业务协议阶段
      DM_ARCHIVE_STATUS: DM_ARCHIVE_STATUS, // 提交归档状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      DM_VIDEO_AUDIT_STATUS: DM_VIDEO_AUDIT_STATUS, // 纠纷业务录像审核状态
      // 机构树选项
      deptOptions: [],
      deptOptionsAdd: [],
      // 机构字典 {id:机构对象}
      deptMap: new Map(),
      orderData: {}, //当前工单信息
      minimizeList: [],
      showFloatingButton: true,
      mediatorOptions: [], // 调解员选项
      advancedSearch: false
    };
  },
  created() {
    this.queryParams.orderByColumn = this.defaultSort.prop;
    this.queryParams.isAsc = this.defaultSort.order;
    institutionList().then(response => {
      this.deptOptions = this.handleTree(response.data, 'deptId');
      if (this.$store.getters.userInfo.isDMEntryClerk) {
        // 新增时，如果是接线员，则过滤对应的机构
        this.deptOptionsAdd = this.handleTree(
          response.data.filter(dept => {
            return (
              ((this.$store.getters.userInfo.isDMCenterBankEntryClerk || this.$store.getters.userInfo.isDMCourtBankEntryClerk) && DEPT_TYPE.bankList.includes(dept.type)) ||
              ((this.$store.getters.userInfo.isDMCenterNonBankEntryClerk || this.$store.getters.userInfo.isDMCourtNonBankEntryClerk) && DEPT_TYPE.nonBankList.includes(dept.type)) ||
              ((this.$store.getters.userInfo.isDMCenterInsuranceEntryClerk || this.$store.getters.userInfo.isDMCourtInsuranceEntryClerk) && DEPT_TYPE.insuranceList.includes(dept.type))
            );
          }),
          'deptId'
        );
      } else {
        // 新增时，如果是机构专员，则放开所有，institutionList只能看到自己机构和下级机构
        this.deptOptionsAdd = this.deptOptions;
      }
      this.initDeptMap(this.deptOptions);
      this.getList();
    });

    // 如果是组长或部长，加载调解员列表
    if (this.$store.getters.userInfo.isDMLeader) {
      this.loadMediators();
    }

    this.handlePhone();
  },
  watch: {
    // 初始化字典，用于层级选择器
    'dict.type.dept_type'(newV, oldV) {
      this.initDict(newV, oldV);
    },
    'dict.type.dm_business_type'(newV, oldV) {
      this.initDict(newV, oldV);
    },
    'dict.type.dm_insurance_type'(newV, oldV) {
      this.initDict(newV, oldV);
    },
    'dict.type.dm_entry_channel'(newV, oldV) {
      this.initDict(newV, oldV);
    },
    'queryParams.businessType1'(newV, oldV) {
      if (newV && this.$refs.businessType1Ref) {
        //关闭级联选择器下拉菜单
        this.$refs.businessType1Ref.toggleDropDownVisible(false);
      }
    },
    'queryParams.insuranceType1'(newV, oldV) {
      if (newV && this.$refs.insuranceType1Ref) {
        //关闭级联选择器下拉菜单
        this.$refs.insuranceType1Ref.toggleDropDownVisible(false);
      }
    },
    '$route.query'() {
      this.handlePhone();
    }
  },
  methods: {
    // 处理地址栏参数
    handlePhone() {
      if (this.$route.query.phoneNumber) {
        this.resetQueryParams();
        this.queryParams.params.phone = this.$route.query.phoneNumber;
        this.advancedSearch = true;
        this.backlog = false;
        this.myCase = 0;
        this.handleQuery();
        this.$router.push({ path: '/mediation/disputeMediation', query: null });
      }
    },
    // 校验工单调解员
    isDMMediator(row) {
      return this.$store.getters.userInfo.isDMMediator && (this.$store.getters.userInfo.userId === row.mediatorUserId || this.$store.getters.userInfo.userId === row.assistantUserId);
    },
    // 用印申请
    applyStamp(row) {
      this.$modal
        .confirm('案件编号"' + row.workOrderId + '"是否要申请用印')
        .then(function () {
          return applyStamp({ workOrderId: row.workOrderId });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('操作成功');
        })
        .catch(() => { });
    },
    queryToData() {
      const data = { ...this.queryParams };
      if (this.backlog) {
        data.params.backlog = true;
      } else {
        delete data.params.backlog;
      }
      if (this.myCase === 1) {
        data.params.myCase = 'M';
      } else if (this.myCase === 2) {
        data.params.myCase = 'A';
      } else if (this.myCase === 0) {
        delete data.params.myCase;
      }
      if (this.queryParams.businessType1 && Array.isArray(this.queryParams.businessType1)) {
        data.businessType1 = null;
        data.params.businessType1 = this.queryParams.businessType1;
      } else {
        delete data.params.businessType1;
      }
      if (this.queryParams.insuranceType1 && Array.isArray(this.queryParams.insuranceType1)) {
        data.insuranceType1 = null;
        data.params.insuranceType1 = this.queryParams.insuranceType1;
      } else {
        delete data.params.insuranceType1;
      }
      if (this.queryParams.params.createTime != null) {
        data.params.createTime = this.queryParams.params.createTime;
      } else {
        delete data.params.createTime;
      }
      if (data.params.statusIn && data.params.statusIn.length === 0) {
        delete data.params.statusIn;
      }
      return data;
    },
    /** 查询纠纷业务工单列表 */
    getList() {
      this.loading = true;
      const data = this.queryToData();
      listDisputeMediation(data).then(response => {
        const { rows, total } = response;
        this.disputeMediationList = rows;
        for (const disputeMediation of this.disputeMediationList) {
          if (disputeMediation.mediatorAcceptTime && !disputeMediation.finishTime) {
            disputeMediation.mediatorHandleTime = this.calculateDaysBetween(disputeMediation.mediatorAcceptTime, new Date());
          }
          if (disputeMediation.sendFeedbackTime && !disputeMediation.feedbackTime) {
            disputeMediation.deptHandleTime = this.calculateDaysBetween(disputeMediation.sendFeedbackTime, new Date());
          }
          // 计算盖章反馈天数
          if (disputeMediation.createType === DM_CREATE_TYPE.TYPE2 || disputeMediation.createType === DM_CREATE_TYPE.TYPE4) {
            if (disputeMediation.acceptTime && disputeMediation.stampedFeedbackAttachmentTime) {
              disputeMediation.stampedFeedbackAttachmentDay = disputeMediation.acceptTime > disputeMediation.stampedFeedbackAttachmentTime ? 0 : (this.calculateDaysBetween(disputeMediation.acceptTime, disputeMediation.stampedFeedbackAttachmentTime) - 1)
            } else if (disputeMediation.acceptTime && disputeMediation.deptAcceptMediate === SYS_YES_NO.sys_yes && !disputeMediation.stampedFeedbackAttachment) {
              disputeMediation.stampedFeedbackAttachmentDay = this.calculateDaysBetween(disputeMediation.acceptTime, new Date()) - 1;
            }
          } else if (disputeMediation.createType === DM_CREATE_TYPE.TYPE1 || disputeMediation.createType === DM_CREATE_TYPE.TYPE3) {
            if (disputeMediation.sendFeedbackTime && disputeMediation.stampedFeedbackAttachmentTime) {
              disputeMediation.stampedFeedbackAttachmentDay = this.calculateDaysBetween(disputeMediation.sendFeedbackTime, disputeMediation.stampedFeedbackAttachmentTime) - 1
            } else if (disputeMediation.acceptTime && disputeMediation.deptAcceptMediate === SYS_YES_NO.sys_yes && !disputeMediation.stampedFeedbackAttachment) {
              disputeMediation.stampedFeedbackAttachmentDay = this.calculateDaysBetween(disputeMediation.sendFeedbackTime, new Date()) - 1
            }
          }
        }
        this.total = total;
        this.loading = false;
      });
    },
    /** 转换机构数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置搜索条件 */
    resetQueryParams() {
      this.resetForm('queryForm');
      this.queryParams.businessType1 = null;
      this.queryParams.insuranceType1 = null;
      this.queryParams.params = { phone: null, createTime: null, executionCompletedFlag: null };
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetQueryParams();
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.workOrderId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 排序触发事件 */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs.addDisputeMediationRef.open();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const workOrderIds = row.workOrderId || this.ids;
      this.$modal
        .confirm('是否确认删除纠纷业务案件编号为"' + workOrderIds + '"的数据项？')
        .then(function () {
          return delDisputeMediation(workOrderIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('删除成功');
        })
        .catch(() => { });
    },
    /** 初始化机构字典 */
    initDeptMap(array) {
      array.forEach(item => {
        this.deptMap.set(item.deptId, item);
        if (item.children) {
          this.initDeptMap(item.children);
        }
      });
    },

    /** 预约确认操作 */
    checkOpen(data) {
      this.$refs.appointmentAddRef.open(data, 'hasmediationRoom', this.orderData);
    },
    /** 办结 */
    handleFinish(row) {
      this.$modal
        .confirm('是否确认办结纠纷业务案件编号为"' + row.workOrderId + '"的数据项？')
        .then(function () {
          return finish({ workOrderId: row.workOrderId });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('办结成功');
        })
        .catch(() => { });
    },
    /** 异常办结 */
    terminate(row) {
      if (DM_STATUS.DM_STATUS2 === row.status && this.isDMMediator(row)) {
        this.terminateTitle = '终止受理:' + row.workOrderId;
        this.$refs.terminateRef.open(row);
      } else if (DM_STATUS.DM_STATUS4 === row.status && this.isDMMediator(row)) {
        this.terminateTitle = '终止调解:' + row.workOrderId;
        this.$refs.terminateRef.open(row);
      }
    },
    /** 提交归档 */
    handleArchiveApply(row) {
      this.$modal
        .confirm('是否确认提交归档纠纷业务案件编号为"' + row.workOrderId + '"的数据项？')
        .then(function () {
          return archiveApply({ workOrderId: row.workOrderId });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('操作成功');
        })
        .catch(() => { });
    },
    /** 归档驳回 */
    handleArchiveReject(row) {
      this.$prompt('归档驳回原因', '归档驳回：' + row.workOrderId, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/, // 限制最多50个字符
        inputErrorMessage: '输入不能为空，且最多只能输入50个字符'
      })
        .then(({ value }) => {
          archiveReject({ workOrderId: row.workOrderId, archiveRejectReason: value }).then(response => {
            this.getList();
            this.$modal.msgSuccess('操作成功');
          });
        })
        .catch(() => { });
    },
    /** 归档 */
    handleArchive(row) {
      this.$modal
        .confirm('是否确认归档纠纷业务案件编号为"' + row.workOrderId + '"的数据项？')
        .then(function () {
          return archive({ workOrderId: row.workOrderId });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('归档成功');
        })
        .catch(() => { });
    },

    // 修改
    edit(e, row) {
      switch (e) {
        case 'edit':
          this.handleUpdate(row);
          break;
        case 'editAssistant':
          this.handleSelectMediator(row, row.assistantUserId ? '修改助理调解员' : '选择助理调解员');
          break;
        case 'editMediator':
          this.handleSelectMediator(row, '修改调解员');
          break;
        case 'editDept':
          this.handleSelectDept(row);
          break;
        default:
          break;
      }
    },

    // 协议书
    noticeBookSelect(e, row) {
      switch (e) {
        case 'edit':
          this.agreementTitle = '协议书:' + row.workOrderId;
          this.$refs.agreementRef.open(row, false, this.dict);
          break;
        case 'check':
          this.agreementTitle = '协议书:' + row.workOrderId;
          this.$refs.agreementRef.open(row, true, this.dict);
          break;
        case 'applyStamp':
          this.applyStamp(row);
          break;
        case 'openProcessPage':
          this.processPageTitle = '审核流程:' + row.workOrderId;
          this.$refs.processPageRef.open(row);
          break;
        case 'signContractOpen':
          this.signContractTitle = '签约:' + row.workOrderId;
          this.$refs.signContractRef.open(row);
          break;
        case 'onlineSignInfoOpen':
          this.onlineSignInfoTitle = '线上签署详情:' + row.workOrderId;
          this.$refs.onlineSignInfoRef.open(row);
          break;
        case 'download':
          this.download('project/disputeMediation/getAgreement', { workOrderId: row.workOrderId }, '协议书' + row.workOrderId + '.docx');
          // this.download2('project/disputeMediation/getAgreement', { workOrderId: row.workOrderId, pdf: true }, '协议书' + row.workOrderId + '.pdf')
          //   .then(url => {
          //     if (url) {
          //       this.$refs.fileViewer.openDialog(url, "pdf");
          //     }
          //   });
          break;
        default:
          break;
      }
    },

    // 调解室
    handleMediationRoom(e, row) {
      this.orderData = {};
      this.orderData = row;
      switch (e) {
        case 'a':
          this.mediationRoomReservationTitle = '预约调解室:' + row.workOrderId;
          this.$refs.mediationRoomReservationRef.open(row);
          break;
        case 'b':
          // 获取预约记录操作
          this.appointmentRecordTitle = '预约记录:' + row.workOrderId;
          this.$refs.appointmentRecordRef.open(row, 'disputeMediation');
          break;
        default:
          break;
      }
    },

    // 调查记录
    handleInvestigation(e, row) {
      switch (e) {
        case 'a':
          // 新增调查记录
          this.investigationCreateTitle = '新增调查记录:' + row.workOrderId;
          this.$refs.investigationCreateRef.open(row);
          break;
        case 'b':
          // 调查记录详情
          this.investigationDetailTitle = '调查记录详情:' + row.workOrderId;
          this.$refs.investigationDetailRef.open(row);
          break;
        default:
          break;
      }
    },

    // 调解记录
    handleMediationRecord(e, row, refreshList) {
      switch (e) {
        case 'a':
          // 新增调解记录
          this.mediationRecordCreateTitle = '新增调解记录:' + row.workOrderId;
          this.$refs.mediationRecordCreateRef.open(row);
          break;
        case 'b':
          // 调解记录详情
          if (refreshList) {
            this.getList();
          }
          this.mediationRecordDetailTitle = '调解记录详情:' + row.workOrderId;
          this.$refs.mediationRecordDetailRef.open(row);
          break;
        default:
          break;
      }
    },

    // 回访记录
    handleCallback(e, row) {
      switch (e) {
        case 'a':
          // 新增回访记录
          this.callbackRecordCreateTitle = '新增回访记录:' + row.workOrderId;
          this.$refs.callbackCreateRef.open(row);
          break;
        case 'b':
          // 回访记录详情
          this.callbackRecordDetailTitle = '回访记录详情:' + row.workOrderId;
          this.$refs.callbackDetailRef.open(row);
          break;
        default:
          break;
      }
    },

    // 履约登记
    handleAgreement(e, row) {
      switch (e) {
        case 'a':
          // 新增履约登记
          this.agreementRecordCreateTitle = '新增履约登记:' + row.workOrderId;
          this.$refs.agreementCreateRef.open(row);
          break;
        case 'b':
          // 履约登记详情
          this.agreementRecordDetailTitle = '履约登记详情:' + row.workOrderId;
          this.$refs.agreementDetailRef.open(row);
          break;
        default:
          break;
      }
    },
    // 下载
    downloadFile(e, row) {
      switch (e) {
        case 'a':
          // 下载反馈单
          this.download(`/project/disputeMediation/downloadFeedback?workOrderId=${row.workOrderId}`, {}, `${row.workOrderId}反馈单.xlsx`);
          break;
        case 'b':
          // 下载通话录音
          this.download(`/project/disputeMediation/downloadSoundAsZip?workOrderId=${row.workOrderId}`, {}, `${row.workOrderId}通话录音.zip`);
          break;
        default:
          break;
      }
    },
    /** 满意度（扩展服务） */
    isSatisfactionScored(score) {
      if (score === null || score === undefined || score === '') {
        return false;
      }
      return !Number.isNaN(Number(score));
    },
    handleSatisfaction(row) {
      this.satisfactionForm = {
        workOrderId: row.workOrderId,
        satisfactionScore: undefined
      };
      this.satisfactionOpen = true;
      getDisputeMediationExpandInfo(row.workOrderId)
        .then(res => {
          if (res.data != null && res.data.satisfactionScore != null && res.data.satisfactionScore !== '') {
            this.satisfactionForm.satisfactionScore = Number(res.data.satisfactionScore);
          }
        })
        .catch(() => { });
    },
    submitSatisfaction() {
      const score = this.satisfactionForm.satisfactionScore;
      if (score === undefined || score === null) {
        this.$modal.msgWarning('请输入满意度');
        return;
      }
      const n = Number(score);
      if (Number.isNaN(n) || n < 0 || n > 100) {
        this.$modal.msgWarning('满意度范围为 0-100');
        return;
      }
      this.satisfactionLoading = true;
      saveOrUpdateDisputeMediationExpand({
        workOrderId: this.satisfactionForm.workOrderId,
        satisfactionScore: n
      })
        .then(() => {
          this.satisfactionLoading = false;
          this.satisfactionOpen = false;
          this.$modal.msgSuccess('保存成功');
          this.getList();
        })
        .catch(() => {
          this.satisfactionLoading = false;
        });
    },
    // 详情
    handleDetail(row) {
      this.detailTitle = '工单详情:' + row.workOrderId;
      this.$refs.detailRef.open(row);
      if (row.mediatorReminder && this.isDMMediator(row)) {
        cancelMediatorReminder({ workOrderId: row.workOrderId }).then(res => {
          if (res.code === 200) {
            row.mediatorReminder = null;
          }
        });
      }
    },
    // 证据比对
    handleEvidenceComparison(row) {
      this.$refs.evidenceComparisonRef.open(row);
    },
    // 前台处理
    handleReception(row) {
      this.receptionHandleTitle = '前台处理:' + row.workOrderId;
      this.$refs.receptionHandleRef.open(row);
    },
    // 选择调解员
    handleSelectMediator(row, title) {
      this.selectMediatorTitle = title + ':' + row.workOrderId;
      this.$nextTick(() => {
        this.$refs.selectMediatorRef.open(row);
      });
    },
    // 派单审核
    handleMediatorAudit(row) {
      this.mediatorAuditTitle = '派单审核:' + row.workOrderId;
      this.$refs.mediatorAuditRef.open(row);
    },
    // 派单审核记录
    showMediatorAuditRecord(row) {
      this.mediatorAuditRecordTitle = '派单审核记录:' + row.workOrderId;
      this.$refs.mediatorAuditRecordRef.open(row);
    },
    // 录像审核记录
    showVideoAuditRecord(row) {
      this.autoVideoTitle = '录像审核记录:' + row.workOrderId;
      this.$refs.autoVideoRef.open(row);
    },
    // 更改机构
    handleSelectDept(row) {
      this.selectDeptTitle = '更改机构:' + row.workOrderId;
      this.$refs.selectDeptRef.open(row);
    },
    // 发送反馈单
    sandFeedback(row) {
      this.$modal
        .confirm('确认发送反馈单:"' + row.workOrderId + '"？')
        .then(function () {
          return sendFeedback({ workOrderId: row.workOrderId });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess('发送成功');
        })
        .catch(() => { });
    },
    // // 填写反馈单
    // handleFeedback(row) {
    //   this.feedbackTitle = (row.deptAcceptMediate ? "修改反馈单:" : "填写反馈单:") + row.workOrderId;
    //   this.$refs.feedbackRef.open(row);
    // },

    // 反馈
    handleFeedback1(row) {
      this.feedbackTitle = '反馈:' + row.workOrderId;
      this.$refs.feedback1Ref.open(row);
    },

    // 补充/修改反馈单
    handleFeedback2(row) {
      this.feedbackTitle = (!row.feedbackTime ? '补充反馈单:' : '修改反馈单:') + row.workOrderId;
      this.$refs.feedback2Ref.open(row);
    },

    // 刷新预约日历
    refreshMediationRoomReservation() {
      this.$refs.mediationRoomReservationRef.refreshList();
    },

    // 调解员修改工单
    handleUpdate(row) {
      this.updateDisputeMediationTitle = '修改工单:' + row.workOrderId;
      this.$refs.updateDisputeMediationRef.open(row);
    },

    // 判断工单是否已经进入协议审核阶段
    isApproval(row) {
      return row.agreementStep != null && DM_AGREEMENT_STEP.AR !== row.agreementStep;
    },

    minimize(title, parameter, callBackType, buttonType, x, y) {
      const id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
      this.minimizeList.push({
        id: id,
        title: title,
        parameter: parameter,
        callBackType: callBackType,
        buttonType: buttonType,
        x: x,
        y: y
      });
      this.$nextTick(() => {
        this.$refs.floatingButtonRef[this.$refs.floatingButtonRef.length - 1].open(id, title, parameter, callBackType, buttonType, x, y);
      });
    },

    showDialog(id, parameter, callBackType) {
      for (let i = 0; i < this.minimizeList.length; i++) {
        const minimize = this.minimizeList[i];
        const position = this.$refs.floatingButtonRef[i].getPosition();
        minimize.x = position.x;
        minimize.y = position.y;
      }
      const index = this.minimizeList.indexOf(this.minimizeList.find(item => item.id === id));
      this.showFloatingButton = false;
      this.minimizeList.splice(index, 1);
      this.showFloatingButton = true;
      this.$nextTick(() => {
        for (let i = 0; i < this.minimizeList.length; i++) {
          const minimize = this.minimizeList[i];
          this.$refs.floatingButtonRef[i].open(minimize.id, minimize.title, minimize.parameter, minimize.callBackType, minimize.buttonType, minimize.x, minimize.y);
        }
      });
      if (callBackType === '新增调查记录') {
        this.$refs.investigationCreateRef.open(parameter.row, parameter.form);
      } else if (callBackType === '新增调解记录') {
        this.$refs.mediationRecordCreateRef.open(parameter.row, parameter.form);
      } else if (callBackType === '工单详情') {
        this.$refs.detailRef.open(parameter);
      }
    },

    // 加载调解员列表
    loadMediators() {
      mediatorList('all').then(response => {
        this.mediatorOptions = response.data;
      });
    },
    calculateDaysBetween(timeStr1, timeStr2) {
      // 解析时间字符串为Date对象
      const date1 = new Date(timeStr1);
      const date2 = new Date(timeStr2);

      // 验证日期有效性
      if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        throw new Error('无效的时间格式');
      }

      // 计算时间差（毫秒）
      const timeDiff = Math.abs(date2 - date1);

      // 转换为天数并向上取整
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      return daysDiff;
    },
    tableRowClassName({ row, rowIndex }) {
      if (
        this.$store.getters.userInfo.isDMInstitution &&
        DM_STATUS.DM_STATUS3 === row.status &&
        row.sendFeedbackTime &&
        !row.feedbackTime &&
        this.calculateDaysBetween(row.sendFeedbackTime, new Date()) > 5
      ) {
        return 'dept-reminder-row';
      }
      // 机构没有上传盖章反馈单
      if (this.$store.getters.userInfo.isDMInstitution && DM_STATUS.DM_STATUS10 !== row.status && DM_STATUS.DM_STATUS20 !== row.status && row.deptAcceptMediate === SYS_YES_NO.sys_yes && !row.stampedFeedbackAttachment) {
        return 'dept-reminder-row';
      }
      if (row.mediatorReminder && this.isDMMediator(row)) {
        return 'mediator-reminder-row';
      }
      return '';
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('project/disputeMediation/dataExport', this.queryToData(), `数据明细_${new Date().getTime()}.xlsx`);
    },

    handleRollbackStatus(row) {
      let lastStatus;
      if (DM_ACCEPT_STATUS.accept === row.acceptStatus) {
        // 正常受理
        if (DM_FINISH_TYPE.normal === row.finishType) {
          // 正常办结
          lastStatus = '调解中';
        } else if (DM_FINISH_TYPE.terminateAccept === row.finishType) {
          // 终止受理，回退到待调解员处理
          lastStatus = '待调解员处理';
        } else if (DM_FINISH_TYPE.terminateMediate === row.finishType) {
          // 终止调解，回退到调解中
          lastStatus = '调解中';
        }
      } else {
        // 未受理
        if (DM_CREATE_TYPE.TYPE2 === row.createType) {
          // 机构申请，回退到待前台处理
          lastStatus = '待前台处理';
        } else {
          // 非机构申请，不允许回退
          this.$message.error('该工单非机构申请，且未受理，不支持回退');
          return;
        }
      }
      this.$confirm('是否将工单' + row.workOrderId + '回退至上一个状态:' + lastStatus, '状态回退', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          rollbackStatus({ workOrderId: row.workOrderId }).then(response => {
            this.getList();
            this.$modal.msgSuccess('操作成功');
          });
        })
        .catch(() => { });
    }
  }
};
</script>

<style scoped>
::v-deep .el-table .cell {
  overflow: visible !important;
}
</style>

<style>
.el-table .dept-reminder-row {
  background: #fddcdc;
}

.el-table .mediator-reminder-row {
  background: #e8f4ff;
}
</style>
