<template>
    <div class="app-container">
        <el-card class="search-card">
            <div slot="header" class="card-header">
                <span>统一查询</span>
            </div>
            
            <!-- 查询表单 -->
            <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="100px">
                <el-form-item label="查询类别" prop="category" class="category-select">
                    <el-cascader 
                        v-model="queryParams.categoryPath" 
                        :options="categoryOptions" 
                        placeholder="请选择查询类别" 
                        style="width: 200px"
                        @change="handleCategoryChange"
                        :props="{ 
                            value: 'value', 
                            label: 'label', 
                            children: 'children',
                            emitPath: false
                        }"
                        clearable>
                    </el-cascader>
                </el-form-item>

                <!-- 公文管理查询条件 -->
                <template v-if="queryParams.category === 'documentManagement' || queryParams.category === 'documentReceive'">
                    <el-form-item :label="queryParams.category === 'documentManagement' ? '发文日期' : '收文日期'" prop="createTime">
                        <el-date-picker v-model="queryParams.createTime" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" 
                            :placeholder="queryParams.category === 'documentManagement' ? '选择发文日期' : '选择收文日期'" style="width: 150px"></el-date-picker>
                    </el-form-item>
                    <el-form-item :label="queryParams.category === 'documentManagement' ? '发文字号' : '收文编号'" prop="wordSize">
                        <el-input v-model="queryParams.wordSize" :placeholder="queryParams.category === 'documentManagement' ? '请输入发文字号' : '请输入收文编号'" 
                            clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item :label="queryParams.category === 'documentManagement' ? '发文类型' : '收文类型'" prop="type">
                        <el-select v-model="queryParams.type" :placeholder="queryParams.category === 'documentManagement' ? '请选择发文类型' : '请选择收文类型'" style="width: 120px">
                            <el-option v-for="dict in (queryParams.category === 'documentManagement' ? dict.type.document_sending_type : dict.type.document_receive_type)" 
                                :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="queryParams.category === 'documentManagement' ? '主送机关' : '来文单位'" prop="mainDeliveryAgency">
                        <el-input v-model="queryParams.mainDeliveryAgency" :placeholder="queryParams.category === 'documentManagement' ? '请输入主送机关' : '请输入来文单位'" 
                            clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="标题" prop="title">
                        <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="紧急程度" prop="urgencyLevel">
                        <el-select v-model="queryParams.urgencyLevel" placeholder="请选择紧急程度" style="width: 120px">
                            <el-option v-for="dict in dict.type.official_urgency_level" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- <el-form-item label="密级" prop="secrecy">
                        <el-select v-model="queryParams.secrecy" placeholder="请选择密级" style="width: 120px">
                            <el-option v-for="dict in dict.type.official_secrecy" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="份号" prop="partNumber">
                        <el-input v-model="queryParams.partNumber" placeholder="请输入份号" clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="签发人" prop="issuer">
                        <el-input v-model="queryParams.issuer" placeholder="请输入签发人" clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item> -->
                </template>

                <!-- 督办事项查询条件 -->
                <template v-if="queryParams.category === 'supervise' || queryParams.category === 'myItem' || queryParams.category === 'examine'">
                    <el-form-item label="查询范围" prop="queryScope">
                        <el-select v-model="queryParams.queryScope" placeholder="请选择查询范围" style="width: 150px">
                            <el-option label="所有" value="all"></el-option>
                            <el-option label="本人处理" value="myProcess"></el-option>
                            <el-option label="本人发起" value="myCreate"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="事项编号" prop="code">
                        <el-input v-model="queryParams.code" placeholder="请输入事项编号" clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="事项名称" prop="name">
                        <el-input v-model="queryParams.name" placeholder="请输入事项名称" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="事项来源" prop="sourceName">
                        <el-select v-model="queryParams.sourceName" placeholder="请选择事项来源" style="width: 150px">
                            <el-option v-for="item in sourceList" :key="item.dictCode" :label="item.dictLabel" :value="item.dictLabel" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="紧急程度" prop="urgencyName">
                        <el-select v-model="queryParams.urgencyName" placeholder="请选择紧急程度" style="width: 120px">
                            <el-option v-for="item in urgencyList" :key="item.dictCode" :label="item.dictLabel" :value="item.dictLabel" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="督办人" prop="leadLeaderName">
                        <el-select v-model="queryParams.leadLeaderName" placeholder="请选择督办人" style="width: 150px">
                            <el-option v-for="item in userList" :key="item.userId" :label="item.nickName" :value="item.nickName"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="业务分类" prop="typeName">
                        <el-select v-model="queryParams.typeName" placeholder="请选择业务分类" style="width: 150px">
                            <el-option v-for="item in typeList" :key="item.dictCode" :label="item.dictLabel" :value="item.dictLabel"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="督办状态" prop="status">
                        <el-select v-model="queryParams.status" placeholder="请选择督办状态" style="width: 120px">
                            <el-option v-for="(value, key) in superviseStatusText" :key="key" :label="value" :value="key"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="督办日期" prop="timeRange">
                        <el-date-picker v-model="queryParams.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width: 240px"></el-date-picker>
                    </el-form-item>
                </template>

                <!-- 事务申请/审批查询条件 -->
                <template v-if="queryParams.category === 'affairsApply' || queryParams.category === 'affairsCheck' || queryParams.category === 'affairsApprovedList'">
                    <el-form-item label="申请状态" prop="status">
                        <el-select v-model="queryParams.status" placeholder="请选择申请状态" style="width: 120px">
                            <el-option label="待审核" :value="0"></el-option>
                            <el-option label="审核中" :value="1"></el-option>
                            <el-option label="已通过" :value="2"></el-option>
                            <el-option label="已拒绝" :value="3"></el-option>
                            <el-option label="已撤回" :value="4"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="事务类型" prop="affairsType">
                        <el-select v-model="queryParams.affairsType" placeholder="请选择事务类型" style="width: 150px">
                            <el-option v-for="dict in dict.type.affairs_type" :key="dict.value" :label="dict.label" :value="dict.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="抄送人查询" prop="isNotCC">
                        <el-select v-model="queryParams.isNotCC" placeholder="请选择查询范围" style="width: 150px">
                            <el-option label="否" :value="1"></el-option>
                            <el-option label="是" :value="0"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="申请时间" prop="timeRange">
                        <el-date-picker v-model="queryParams.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width: 240px"></el-date-picker>
                    </el-form-item>
                </template>

                <!-- 考勤管理查询条件 -->
                <template v-if="queryParams.category === 'attendanceReport'">
                    <el-form-item label="姓名" prop="nickName">
                        <el-input v-model="queryParams.nickName" placeholder="请输入姓名" clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="部门" prop="deptName">
                        <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable style="width: 150px" @keyup.enter.native="handleQuery" />
                    </el-form-item>
                    <el-form-item label="考勤结果" prop="attendanceStatus">
                        <el-select v-model="queryParams.attendanceStatus" placeholder="请选择考勤结果" style="width: 120px">
                            <el-option label="正常" :value="1"></el-option>
                            <el-option label="迟到" :value="2"></el-option>
                            <el-option label="早退" :value="3"></el-option>
                            <el-option label="缺卡" :value="4"></el-option>
                            <el-option label="请休假" :value="5"></el-option>
                            <el-option label="出差" :value="6"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="日期" prop="timeRange">
                        <el-date-picker v-model="queryParams.timeRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width: 240px"></el-date-picker>
                    </el-form-item>
                </template>

                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" :disabled="!queryParams.category">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 查询结果 -->
        <el-card class="result-card" v-if="queryParams.category && list.length > 0">
            <div slot="header" class="card-header">
                <span>查询结果</span>
                <div class="header-right">
                    <span>共找到 {{ total }} 条记录</span>
                </div>
            </div>

            <!-- 公文管理结果表格 -->
            <el-table v-if="queryParams.category === 'documentManagement' || queryParams.category === 'documentReceive'" 
                      v-loading="loading" :data="list">
                <el-table-column label="序号" align="center" type="index" width="50" />
                <el-table-column :label="queryParams.category === 'documentManagement' ? '发文日期' : '收文日期'" align="center" prop="createTime" />
                <el-table-column :label="queryParams.category === 'documentManagement' ? '发文字号' : '收文编号'" align="center" prop="wordSize" />
                <el-table-column :label="queryParams.category === 'documentManagement' ? '发文类型' : '收文类型'" align="center" prop="type">
                    <template slot-scope="scope">
                        <dict-tag :options="queryParams.category === 'documentManagement' ? dict.type.document_sending_type : dict.type.document_receive_type" :value="scope.row.type" />
                    </template>
                </el-table-column>
                <el-table-column :label="queryParams.category === 'documentManagement' ? '主送机关' : '来文单位'" align="center" :prop="queryParams.category === 'documentManagement' ? 'mainDeliveryAgency' : 'cc'" width="150">
                    <template slot-scope="scope">
                        <el-tooltip :content="queryParams.category === 'documentManagement' ? scope.row.mainDeliveryAgency : scope.row.cc" placement="top" 
                            :disabled="!(queryParams.category === 'documentManagement' ? scope.row.mainDeliveryAgency : scope.row.cc) || (queryParams.category === 'documentManagement' ? scope.row.mainDeliveryAgency : scope.row.cc).length <= 20">
                            <div class="text-ellipsis-2" style="text-align: center;">{{ queryParams.category === 'documentManagement' ? scope.row.mainDeliveryAgency : scope.row.cc }}</div>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <el-table-column label="标题" align="center" prop="title" width="200">
                    <template slot-scope="scope">
                        <el-tooltip :content="scope.row.title" placement="top" :disabled="!scope.row.title || scope.row.title.length <= 30">
                            <div class="text-ellipsis-2" style="text-align: center;">{{ scope.row.title }}</div>
                        </el-tooltip>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="紧急程度" align="center" width="150" prop="urgencyLevel">
                    <template slot-scope="scope">
                        <dict-tag :options="dict.type.official_urgency_level" :value="scope.row.urgencyLevel" />
                    </template>
                </el-table-column> -->
                <el-table-column :label="queryParams.category === 'documentManagement' ? '发文状态' : '收文状态'" align="center" prop="status">
                    <template slot-scope="scope">
                        <el-tag :type="getDocumentStatusTagType(scope.row.status)">{{ getDocumentStatusName(scope.row.status) }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleDocumentDetail(scope.row)">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 督办事项结果表格 -->
            <el-table v-if="queryParams.category === 'supervise' || queryParams.category === 'myItem' || queryParams.category === 'examine'" v-loading="loading" :data="list">
                <el-table-column type="index" label="序号" width="50" align="center" />
                <el-table-column label="事项编号" align="center" prop="code" width="100" />
                <el-table-column label="事项来源" align="center" prop="sourceName" />
                <el-table-column label="业务分类" align="center" prop="typeName" />
                <el-table-column label="紧急程度" align="center" prop="urgencyName" />
                <el-table-column label="事项名称" align="center" prop="name" width="300">
                    <template slot-scope="scope">
                        <div style="max-height: 30px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                            {{ scope.row.name }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="督办人" align="center" prop="leadLeaderName" />
                <el-table-column label="督办截止日期" align="center" prop="endTime" width="120">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="督办状态" align="center">
                    <template slot-scope="scope">
                        {{ superviseStatusText[scope.row.status] }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleSuperviseDetail(scope.row)">查看详情</el-button>
                        <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadRowMaterial(scope.row)" 
                                   v-if="scope.row.materialFile" style="color: #409EFF">下载背景材料</el-button>
                        <!-- <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadSuperviseWord(scope.row)" style="color: #67C23A">下载督办单</el-button> -->
                    </template>
                </el-table-column>
            </el-table>

            <!-- 事务申请/审批结果表格 -->
            <el-table v-if="queryParams.category === 'affairsApply' || queryParams.category === 'affairsCheck' || queryParams.category === 'affairsApprovedList'" 
                      v-loading="loading" :data="list">
                <el-table-column type="index" label="序号" width="50" align="center" />
                <el-table-column label="申请人" align="center" prop="applyName" />
                <el-table-column label="类型" align="center" prop="affairsType">
                    <template slot-scope="scope">
                        <dict-tag :options="dict.type.affairs_type" :value="scope.row.affairsType" />
                    </template>
                </el-table-column>
                <el-table-column label="申请时间" align="center" prop="createTime" width="150px" />
                <el-table-column label="申请状态" align="center" prop="status">
                    <template slot-scope="scope">
                        {{ affairsStatusText[scope.row.status] }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="150">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleAffairsDetail(scope.row)">查看详情</el-button>
                        <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadAttachments(scope.row)">下载附件</el-button>
                        <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadAffairsWord(scope.row)" style="color: #67C23A">下载申请书</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 考勤管理结果表格 -->
            <el-table v-if="queryParams.category === 'attendanceReport'" v-loading="loading" :data="list" border>
                <el-table-column label="姓名" align="center" prop="nickName" />
                <el-table-column label="部门" align="center" prop="deptName" />
                <el-table-column label="日期" align="center" prop="reportDate" width="100" />
                <el-table-column label="上班打卡时间" align="center" prop="workStart" width="120" />
                <el-table-column label="下班打卡时间" align="center" prop="workEnd" width="120" />
                <el-table-column label="考勤结果" align="center" prop="status" :formatter="formatAttendanceStatus" />
                <el-table-column label="应出勤(小时)" align="center" prop="workAttendance" />
                <el-table-column label="计薪时长(小时)" align="center" prop="workCompensable" />
                <el-table-column label="实际出勤(小时)" align="center" prop="workHours" />
                <el-table-column label="迟到时长(分钟)" align="center" prop="lateDuration" />
                <el-table-column label="早退时长(分钟)" align="center" prop="earlyDuration" />
                <el-table-column label="加班时长(小时)" align="center" prop="overtimeDuration" />
                <el-table-column label="操作" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleAttendanceDetail(scope.row)">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="handleQuery" />
        </el-card>

        <!-- 无查询结果提示 -->
        <el-card class="result-card" v-if="queryParams.category && list.length === 0 && !loading && hasSearched">
            <div class="no-data">
                <i class="el-icon-document"></i>
                <p>暂无查询结果</p>
            </div>
        </el-card>

        <!-- 事务详情弹窗 -->
        <el-dialog :title="detailTitle" :visible.sync="affairsDetailOpen" width="800px" append-to-body 
                   :close-on-click-modal="false" @closed="closeDetailDialog">
            <div style="max-height: 600px; overflow-y: auto">
                <AffairsDetail :detailData="affairsDetailData" :userList="userList" :typeList="dict.type.affairs_type" 
                               :deptList="superviseSectionList" :allUserList="userList" />
            </div>
        </el-dialog>

        <!-- 督办事项详情弹窗 -->
        <el-dialog :title="detailTitle" :visible.sync="superviseDetailOpen" width="900px" append-to-body 
                   :close-on-click-modal="false" @closed="closeDetailDialog">
            <el-form ref="superviseDetailForm" :model="superviseDetailData" label-width="130px" label-position="right">
                <el-row v-if="superviseIsView">
                    <el-col :span="24">
                        <el-form-item label="事项编号" prop="code">
                            <el-input v-model="superviseDetailData.code" placeholder="无" disabled maxlength="50"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="事项来源" prop="source">
                            <el-select v-model="superviseDetailData.source" :placeholder="superviseIsView ? '无' : '请选择事项来源'" :disabled="superviseIsView">
                                <el-option v-for="item in sourceList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="业务分类" prop="type">
                            <el-select v-model="superviseDetailData.type" :placeholder="superviseIsView ? '无' : '请选择业务分类'" :disabled="superviseIsView">
                                <el-option v-for="item in typeList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="紧急程度" prop="urgency">
                            <el-select v-model="superviseDetailData.urgency" :placeholder="superviseIsView ? '无' : '请选择紧急程度'"
                                :disabled="superviseIsView">
                                <el-option v-for="item in urgencyList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="督办部门" prop="superviseDept">
                            <el-cascader v-model="superviseDetailData.superviseDept" :options="superviseSectionList" :props="superviseDeptProps"
                                :placeholder="superviseIsView ? '无' : '请选择督办部门'" :disabled="superviseIsView" clearable></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="督办人" prop="leadLeader">
                            <el-select v-model="superviseDetailData.leadLeader" :placeholder="superviseIsView ? '无' : '请选择督办人'"
                                :disabled="superviseIsView">
                                <el-option v-for="item in superviseSuperviseDeptUserList" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="主办部门" prop="firstBusinessUnit">
                            <el-cascader v-model="superviseDetailData.firstBusinessUnit" :options="superviseSectionList" :props="superviseDeptProps"
                                :placeholder="superviseIsView ? '无' : '请选择主办部门'" :disabled="superviseIsView" clearable></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="主办人" prop="sponsorId">
                            <el-select v-model="superviseDetailData.sponsorId" :placeholder="superviseIsView ? '无' : '请选择主办人'"
                                :disabled="superviseIsView">
                                <el-option v-for="item in superviseMainDeptUserList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="协办部门" prop="xbBusinessUnit">
                            <el-cascader v-model="superviseDetailData.xbBusinessUnit" :options="superviseSectionList"
                                :props="{ ...superviseDeptProps, multiple: true }" :placeholder="superviseIsView ? '无' : '请选择协办部门'"
                                :disabled="superviseIsView" clearable></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="协办人" prop="organizerIds">
                            <el-select v-model="superviseDetailData.organizerIds" multiple :placeholder="superviseIsView ? '无' : '选填，可选多人'"
                                :disabled="superviseIsView" clearable>
                                <el-option v-for="item in superviseAssistDeptUserList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="事项名称" prop="name">
                    <el-input v-model="superviseDetailData.name" :placeholder="superviseIsView ? '无' : '请输入事项名称'" :disabled="superviseIsView"
                        maxlength="50" />
                </el-form-item>
                <el-form-item label="事项内容" prop="content">
                    <el-input type="textarea" v-model="superviseDetailData.content" :placeholder="superviseIsView ? '无' : '请输入事项内容'" :rows="3"
                        :disabled="superviseIsView" maxlength="2000" />
                </el-form-item>

                <!-- 督办频次 -->
                <el-form-item label="督办频次" prop="frequency">
                    <el-input-number v-model="superviseDetailData.frequency" :min="1" :max="50" :disabled="superviseIsView"
                        :placeholder="superviseIsView ? '无' : '请输入督办频次(1-50)'"></el-input-number>
                </el-form-item>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="督办日期" prop="timePeriod">
                            <el-date-picker v-model="superviseDetailData.timePeriod" type="daterange" range-separator="至"
                                start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"
                                :disabled="superviseIsView"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 督办背景材料 -->
                <el-form-item label="督办背景材料" prop="materialFile">
                    <div v-if="superviseIsView">
                        <div v-if="superviseDetailData.materialFile" class="attachment">
                            <template v-if="superviseDetailData.materialFile.includes(',')">
                                <div v-for="(file, index) in superviseDetailData.materialFile.split(',')" :key="index"
                                    class="file-item">
                                    <el-button type="primary" size="mini" icon="el-icon-view"
                                        @click.prevent="previewFile(file.trim())">在线查看附件{{ index + 1 }}</el-button>
                                    <el-button type="success" size="mini" icon="el-icon-download">
                                        <a :href="getDownloadUrl(file.trim())" :download="getFileName(file.trim())"
                                            style="color: white; text-decoration: none">下载文件</a>
                                    </el-button>
                                </div>
                            </template>
                            <div v-else class="file-actions">
                                <el-button type="primary" size="mini" icon="el-icon-view"
                                    @click.prevent="previewFile(superviseDetailData.materialFile)">
                                    在线查看({{ getShortFileName(superviseDetailData.materialFile) }})
                                </el-button>
                                <el-button type="success" size="mini" icon="el-icon-download">
                                    <a :href="getDownloadUrl(superviseDetailData.materialFile)"
                                        :download="getFileName(superviseDetailData.materialFile)"
                                        style="color: white; text-decoration: none">下载文件</a>
                                </el-button>
                            </div>
                        </div>
                        <span v-else>无</span>
                    </div>
                </el-form-item>

                <!-- 材料链接 -->
                <el-form-item label="材料链接" prop="materialLink">
                    <div v-if="superviseIsView">
                        <el-link v-if="superviseDetailData.materialLink" type="primary" :href="superviseDetailData.materialLink" target="_blank">
                            {{ superviseDetailData.materialLink }}
                        </el-link>
                        <span v-else>无</span>
                    </div>
                </el-form-item>

                <!-- 抄送领导 -->
                <el-form-item label="抄送领导" prop="copyLeaderIds">
                    <div v-if="superviseIsView">
                        {{ superviseDetailData.copyLeaderNames || '无' }}
                    </div>
                </el-form-item>

                <!-- 备注 -->
                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" v-model="superviseDetailData.remark" :rows="3" :disabled="superviseIsView" maxlength="2000" />
                </el-form-item>

                <el-form-item label="审核权" prop="reviewAuthority">
                    <el-select v-model="superviseDetailData.reviewAuthority" placeholder="请选择审核权" :disabled="superviseIsView">
                        <el-option label="创建人" :value="0"></el-option>
                        <el-option label="督办人" :value="1"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="superviseDetailOpen = false">关 闭</el-button>
            </div>
        </el-dialog>


        <!-- 考勤详情弹窗 -->
        <el-dialog :title="detailTitle" :visible.sync="attendanceDetailOpen" width="700px" append-to-body 
                   :close-on-click-modal="false" @closed="closeDetailDialog">
            <el-form ref="attendanceDetailForm" :model="attendanceDetailData" label-width="130px" label-position="right" :disabled="true">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="nickName">
                            <el-input v-model="attendanceDetailData.nickName" readonly />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门" prop="deptName">
                            <el-input v-model="attendanceDetailData.deptName" readonly />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="日期" prop="reportDate">
                            <el-input v-model="attendanceDetailData.reportDate" readonly />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="考勤结果" prop="status">
                            <el-tag :type="getAttendanceStatusTagType(attendanceDetailData.status)">
                                {{ formatAttendanceStatus(attendanceDetailData) }}
                            </el-tag>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-divider content-position="left">打卡时间</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="上班打卡时间" prop="workStart">
                            <el-input v-model="attendanceDetailData.workStart" readonly>
                                <template slot="suffix">
                                    <i class="el-icon-time" style="color: #409eff;"></i>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="下班打卡时间" prop="workEnd">
                            <el-input v-model="attendanceDetailData.workEnd" readonly>
                                <template slot="suffix">
                                    <i class="el-icon-time" style="color: #409eff;"></i>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-divider content-position="left">工时统计</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="应出勤(小时)" prop="workAttendance">
                            <el-input v-model="attendanceDetailData.workAttendance" readonly>
                                <template slot="suffix">
                                    <span style="color: #909399;">小时</span>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="实际出勤(小时)" prop="workHours">
                            <el-input v-model="attendanceDetailData.workHours" readonly>
                                <template slot="suffix">
                                    <span style="color: #909399;">小时</span>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="计薪时长(小时)" prop="workCompensable">
                            <el-input v-model="attendanceDetailData.workCompensable" readonly>
                                <template slot="suffix">
                                    <span style="color: #909399;">小时</span>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="加班时长(小时)" prop="overtimeDuration">
                            <el-input v-model="attendanceDetailData.overtimeDuration" readonly>
                                <template slot="suffix">
                                    <span style="color: #909399;">小时</span>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-divider content-position="left">异常统计</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="迟到时长(分钟)" prop="lateDuration">
                            <el-input v-model="attendanceDetailData.lateDuration" readonly>
                                <template slot="suffix">
                                    <span style="color: #f56c6c;">分钟</span>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="早退时长(分钟)" prop="earlyDuration">
                            <el-input v-model="attendanceDetailData.earlyDuration" readonly>
                                <template slot="suffix">
                                    <span style="color: #f56c6c;">分钟</span>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- 考勤统计汇总 -->
                <el-divider content-position="left">考勤汇总</el-divider>
                <el-row>
                    <el-col :span="24">
                        <div class="attendance-summary">
                            <el-card class="summary-card" shadow="never">
                                <div class="summary-item">
                                    <div class="summary-label">考勤状态</div>
                                    <div class="summary-value">
                                        <el-tag :type="getAttendanceStatusTagType(attendanceDetailData.status)" size="medium">
                                            {{ formatAttendanceStatus(attendanceDetailData) }}
                                        </el-tag>
                                    </div>
                                </div>
                                <div class="summary-item" v-if="attendanceDetailData.lateDuration > 0">
                                    <div class="summary-label">迟到情况</div>
                                    <div class="summary-value text-danger">迟到 {{ attendanceDetailData.lateDuration }} 分钟</div>
                                </div>
                                <div class="summary-item" v-if="attendanceDetailData.earlyDuration > 0">
                                    <div class="summary-label">早退情况</div>
                                    <div class="summary-value text-danger">早退 {{ attendanceDetailData.earlyDuration }} 分钟</div>
                                </div>
                                <div class="summary-item" v-if="attendanceDetailData.overtimeDuration > 0">
                                    <div class="summary-label">加班情况</div>
                                    <div class="summary-value text-success">加班 {{ attendanceDetailData.overtimeDuration }} 小时</div>
                                </div>
                            </el-card>
                        </div>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="attendanceDetailOpen = false">关 闭</el-button>
            </div>
        </el-dialog>

        <!-- 文件预览组件 -->
        <ViewFile ref="viewFileRef" />
    </div>
</template>

<script>
import { listDocumentHandle, getDetail } from '@/api/oa/documentManagement';
import { listSupervise, getProcessList, getCheckList, getSupervise } from '@/api/oa/supervise';
import { listAffairsApply, affairsDetail } from '@/api/oa/affairsApply';
import { listAffairsCheck, getOAList } from '@/api/oa/affairsCheck';
import { getAttendanceReportList } from '@/api/oa/attendance';
import { getSourceDict, getTypeDict, getUrgencyDict, getDeptUserTree } from '@/api/oa/publicApi';
import { listPerson } from '@/api/oa/affairsApply';
import { listDeptTree } from '@/api/oa/supervise';
import AffairsDetail from '../components/AffairsDetail.vue';
// Word文档生成相关导入
import { saveAs } from 'file-saver';
import { WordGenerator } from '@/utils/wordGenerator';
import conf from '@/conf.js'; // 导入配置文件
import ViewFile from '@/components/viewFile';

export default {
    name: 'UnifiedSearch',
    dicts: ['official_urgency_level', 'official_secrecy', 'affairs_type', 'document_sending_type', 'document_receive_type'],
    components: { AffairsDetail, ViewFile },
    data() {
        return {
            loading: false,
            list: [],
            total: 0,
            hasSearched: false,
            _baseUrl: conf.server.baseUrl, // 添加基础URL
            // 级联选择器选项数据
            categoryOptions: [
                {
                    value: 'document',
                    label: '公文管理',
                    children: [
                        { value: 'documentReceive', label: '收文管理' },
                        { value: 'documentManagement', label: '发文管理' }
                    ]
                },
                {
                    value: 'supervise',
                    label: '督办管理',
                    children: [
                        { value: 'supervise', label: '督办事项' },
                        { value: 'myItem', label: '我的事项' },
                        { value: 'examine', label: '审核事项' }
                    ]
                },
                {
                    value: 'affairs',
                    label: '事务管理',
                    children: [
                        { value: 'affairsCheck', label: '事务审批' },
                        { value: 'affairsApply', label: '事务申请' },
                        { value:'affairsApprovedList', label: '事务已审批列表'}
                    ]
                },
                {
                    value: 'attendance',
                    label: '考勤管理',
                    children: [
                        { value: 'attendanceReport', label: '考勤管理' }
                    ]
                }
            ],
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                category: '',
                categoryPath: '',
                // 公文查询参数
                type: undefined,
                urgencyLevel: undefined,
                secrecy: undefined,
                partNumber: undefined,
                wordSize: undefined,
                issuer: undefined,
                mainDeliveryAgency: undefined,
                createTime: undefined,
                title: undefined,
                // 督办事项查询参数
                queryScope: 'all', // 查询范围：all-所有，myProcess-本人处理，myCreate-本人发起
                code: undefined,
                name: undefined,
                sourceName: undefined,
                urgencyName: undefined,
                leadLeaderName: undefined,
                typeName: undefined,
                status: undefined,
                timeRange: undefined,
                // 事务查询参数
                affairsType: undefined,
                isNotCC: 1, // 是否抄送人查询：1-否，0-是，默认为1
                // 考勤查询参数
                nickName: undefined,
                deptName: undefined,
                attendanceStatus: undefined
            },
            // 字典数据
            sourceList: [],
            typeList: [],
            urgencyList: [],
            userList: [],
            // 状态文本映射
            superviseStatusText: {
                0: '待办',
                1: '办理中',
                2: '已办结待审核',
                3: '发起人通过',
                4: '审核员通过',
                6: '待处理',
                7: '已处理',
                10: '已完结',
                99: '废止'
            },
            affairsStatusText: {
                0: '待审核',
                1: '审核中',
                2: '已通过',
                3: '已拒绝',
                4: '已撤回'
            },
            // 详情弹窗相关
            detailOpen: false,
            detailTitle: '',
            detailData: {},
            detailForm: {},
            // 事务详情相关
            affairsDetailOpen: false,
            affairsDetailData: {},
            affairsIsView: true,
            // 督办事项详情相关
            superviseDetailOpen: false,
            superviseDetailData: {},
            superviseIsView: true,
            // 督办相关的字典数据
            superviseSectionList: [],
            superviseMainDeptUserList: [],
            superviseAssistDeptUserList: [],
            superviseSuperviseDeptUserList: [],
            superviseDeptUserTree: [],
            superviseDeptProps: {
                value: 'id',
                label: 'label',
                children: 'children',
                checkStrictly: true,
                emitPath: false
            },
            superviseDeptUserTreeProps: {
                label: function (data) {
                    if (data.isUser) {
                        return data.nickName || data.userName || data.name;
                    }
                    return data.deptName || data.depName || data.name || data.label;
                },
                children: 'children',
                id: function (data) {
                    if (data.isUser) {
                        return 'user_' + (data.userId || 'unknown');
                    }
                    return 'dept_' + (data.deptId || 'unknown');
                }
            },
            // 考勤详情相关
            attendanceDetailOpen: false,
            attendanceDetailData: {},
        };
    },
    created() {
        this.getSourceDict();
        this.getTypeDict();
        this.getUrgencyDict();
        this.getUserList();
        this.getSuperviseDeptList();
        this.getSuperviseDeptUser();
        this.getAffairsTypeList();
    },
    methods: {
         /** 下载所有附件 */
         downloadAllAttachments(attachments) {
            if (attachments.length === 0) {
                this.$modal.msgInfo('没有可下载的附件');
                return;
            }
            
            this.$modal.msgSuccess(`开始下载 ${attachments.length} 个附件`);
            
            // 批量下载附件
            attachments.forEach((attachment, index) => {
                setTimeout(() => {
                    this.downloadSingleFile(attachment);
                }, index * 200); // 每个文件间隔200ms下载，避免浏览器限制
            });
        },
          /** 提取附件信息 */
          extractAttachments(fileData, attachments, category) {
            if (!fileData) return;
            
            let files = [];
            
            // 如果是字符串，尝试解析JSON或按逗号分割
            if (typeof fileData === 'string') {
                try {
                    files = JSON.parse(fileData);
                } catch (e) {
                    // 如果解析失败，检查是否是逗号分隔的URL字符串
                    if (fileData.includes(',')) {
                        // 按逗号分割多个文件URL
                        const urlList = fileData.split(',').map(url => url.trim()).filter(url => url);
                        files = urlList.map((url, index) => ({
                            name: `${category}文件${urlList.length > 1 ? (index + 1) : ''}`,
                            url: url
                        }));
                    } else {
                        // 单个文件URL
                        files = [{ name: `${category}文件`, url: fileData }];
                    }
                }
            } else if (Array.isArray(fileData)) {
                files = fileData;
            } else if (typeof fileData === 'object') {
                files = [fileData];
            }
            
            // 确保files是数组
            if (!Array.isArray(files)) {
                files = [files];
            }
            
            // 添加到附件列表
            files.forEach((file, index) => {
                if (file && (file.url || file.name || file)) {
                    // 处理不同的文件格式
                    let fileName, fileUrl;
                    
                    if (typeof file === 'string') {
                        // 如果file本身就是URL字符串
                        fileName = `${category}文件${files.length > 1 ? (index + 1) : ''}`;
                        fileUrl = file;
                    } else if (typeof file === 'object') {
                        // 如果file是对象
                        fileName = file.name || `${category}文件${files.length > 1 ? (index + 1) : ''}`;
                        fileUrl = file.url || file.path || file;
                    }
                    
                    if (fileUrl) {
                        attachments.push({
                            name: fileName,
                            url: fileUrl,
                            category: category
                        });
                    }
                }
            });
        },
        handleDownloadAttachments(row) {
            // 显示加载提示
            const loading = this.$loading({
                lock: true,
                text: '正在获取附件信息...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            // 调用详情接口获取完整数据
            affairsDetail(row.id).then(res => {
                loading.close();
                const detailData = res.data;
                
                // 解析formData
                let formData = {};
                if (typeof detailData.formData === 'string') {
                    try {
                        formData = JSON.parse(detailData.formData);
                    } catch (e) {
                        console.error('解析formData失败', e);
                        this.$modal.msgError('数据格式错误，无法解析附件信息');
                        return;
                    }
                } else if (typeof detailData.formData === 'object') {
                    formData = detailData.formData;
                }

                // 收集所有附件
                const attachments = [];
                
                // 1. 出差类型的差旅费附件
                if (formData.travelExpenseFiles) {
                    this.extractAttachments(formData.travelExpenseFiles, attachments, '差旅费报销单');
                }
                
                // 2. 拨款/报销类型的付款凭证
                if (formData.payProofFiles) {
                    this.extractAttachments(formData.payProofFiles, attachments, '付款凭证');
                }
                
                // 3. 其他类型的附件
                if (formData.fileUrl) {
                    this.extractAttachments(formData.fileUrl, attachments, '附件');
                }
                // 3.1 用印、请假、业务招待等统一附件
                if (!formData.fileUrl && (formData.sealReason || formData.leaveType || formData.hospitalityReason)) {
                    if (formData.fileUrl) {
                        this.extractAttachments(formData.fileUrl, attachments, '附件');
                    }
                }
                
                // 4. 零星采购中每个商品的附件
                if (formData.items && Array.isArray(formData.items)) {
                    formData.items.forEach((item, index) => {
                        if (item.fileUrl) {
                            this.extractAttachments(item.fileUrl, attachments, `商品${index + 1}附件`);
                        }
                    });
                }
                
                // 5. 合同审批的附件
                if (formData.attachment) {
                    this.extractAttachments(formData.attachment, attachments, '合同附件');
                }

                // 下载附件
                if (attachments.length > 0) {
                    this.downloadAllAttachments(attachments);
                } else {
                    this.$modal.msgInfo('该记录没有附件');
                }
            }).catch(error => {
                loading.close();
                console.error('获取详情失败', error);
                this.$modal.msgError('获取附件信息失败');
            });
        },
        // 获取字典数据
        getSourceDict() {
            getSourceDict().then(response => {
                this.sourceList = response.data;
            });
        },
        getTypeDict() {
            getTypeDict().then(response => {
                this.typeList = response.data;
            });
        },
        getUrgencyDict() {
            getUrgencyDict().then(response => {
                this.urgencyList = response.data;
            });
        },
        getUserList() {
            listPerson().then(response => {
                this.userList = response.data;
            });
        },
        // 获取事务类型列表
        getAffairsTypeList() {
            // 从字典中获取事务类型，已通过dict系统获取
        },
        // 获取督办部门列表
        getSuperviseDeptList() {
            listDeptTree().then(response => {
                this.superviseSectionList = response.data;
            });
        },
        // 获取督办部门与用户树
        getSuperviseDeptUser() {
            getDeptUserTree().then(response => {
                this.superviseDeptUserTree = this.processSuperviseTreeData(response.data);
            });
        },
        // 处理督办树数据
        processSuperviseTreeData(treeData) {
            if (!treeData || !treeData.length) return [];
            
            return treeData.map(node => {
                const processedNode = { ...node };
                
                if (processedNode.isUser) {
                    processedNode.id = 'user_' + processedNode.userId;
                } else {
                    processedNode.id = 'dept_' + processedNode.deptId;
                }
                
                if (processedNode.children && processedNode.children.length > 0) {
                    processedNode.children = this.processSuperviseTreeData(processedNode.children);
                }
                
                return processedNode;
            });
        },
        // 督办部门变更处理
        handleSuperviseSuperviseDeptChange(deptId) {
            if (!deptId) {
                this.superviseSuperviseDeptUserList = [];
                return;
            }
            listPerson({ deptId: deptId }).then(response => {
                this.superviseSuperviseDeptUserList = response.data;
            });
        },
        // 主办部门变更处理
        handleSuperviseMainDeptChange(deptId) {
            if (!deptId) {
                this.superviseMainDeptUserList = [];
                return;
            }
            listPerson({ deptId: deptId }).then(response => {
                this.superviseMainDeptUserList = response.data;
            });
        },
        // 协办部门变更处理
        handleSuperviseAssistDeptChange(deptIds) {
            if (!deptIds || deptIds.length === 0) {
                this.superviseAssistDeptUserList = [];
                return;
            }
            
            const promises = deptIds.map(deptId => {
                return listPerson({ deptId: deptId });
            });
            
            Promise.all(promises).then(responses => {
                this.superviseAssistDeptUserList = [];
                responses.forEach(response => {
                    if (response && response.data) {
                        this.superviseAssistDeptUserList = [...this.superviseAssistDeptUserList, ...response.data];
                    }
                });
                
                // 移除重复的人员（基于userId）
                this.superviseAssistDeptUserList = this.removeDuplicateUsers(this.superviseAssistDeptUserList);
            });
        },
        // 移除重复用户
        removeDuplicateUsers(userList) {
            const uniqueUsers = {};
            return userList.filter(user => {
                if (uniqueUsers[user.userId]) {
                    return false;
                }
                uniqueUsers[user.userId] = true;
                return true;
            });
        },
        // 获取文件下载URL
        getDownloadUrl(filePath) {
            if (!filePath) return '';
            return this._baseUrl + filePath;
        },
        // 获取文件名
        getFileName(filePath) {
            if (!filePath) return '';
            return filePath.split('/').pop() || '附件';
        },
        // 获取短文件名
        getShortFileName(filePath) {
            const fileName = this.getFileName(filePath);
            if (fileName.length <= 20) return fileName;
            return fileName.substring(0, 10) + '...' + fileName.substring(fileName.length - 10);
        },
        // 预览文件
        previewFile(filePath) {
            if (!filePath) return;
            const baseUrl = this._baseUrl;
            const fileName = this.getFileName(filePath);
            const fileExt = fileName.split('.').pop().toLowerCase();

            this.$refs.viewFileRef.openDialog(baseUrl + filePath, fileExt);
        },
        // 处理类别变更
        handleCategoryChange(value) {
            // 级联选择器返回的是最后一级的值
            this.queryParams.category = value || '';
            this.resetQueryParams();
            this.list = [];
            this.total = 0;
            this.hasSearched = false;
        },
        // 重置查询参数
        resetQueryParams() {
            const currentCategory = this.queryParams.category;
            const currentCategoryPath = this.queryParams.categoryPath;
            this.queryParams = {
                pageNum: 1,
                pageSize: 10,
                category: currentCategory,
                categoryPath: currentCategoryPath,
                type: undefined,
                urgencyLevel: undefined,
                secrecy: undefined,
                partNumber: undefined,
                wordSize: undefined,
                issuer: undefined,
                mainDeliveryAgency: undefined,
                createTime: undefined,
                title: undefined,
                queryScope: 'all',
                code: undefined,
                name: undefined,
                sourceName: undefined,
                urgencyName: undefined,
                leadLeaderName: undefined,
                typeName: undefined,
                status: undefined,
                timeRange: undefined,
                affairsType: undefined,
                isNotCC: 1, // 重置时保持默认值1
                nickName: undefined,
                deptName: undefined,
                attendanceStatus: undefined
            };
        },
        // 查询按钮操作
        handleQuery() {
            if (!this.queryParams.category) {
                this.$message.warning('请先选择查询类别');
                return;
            }

            this.loading = true;
            this.hasSearched = true;

            // 处理时间范围参数
            if (this.queryParams.timeRange && this.queryParams.timeRange.length === 2) {
                this.queryParams.startTime = this.queryParams.timeRange[0];
                this.queryParams.endTime = this.queryParams.timeRange[1];
            } else {
                this.queryParams.startTime = null;
                this.queryParams.endTime = null;
            }

            let apiCall;
            const params = { ...this.queryParams };
            delete params.timeRange;

            // 根据类别调用不同的API
            switch (this.queryParams.category) {
                case 'documentManagement':
                    params.type = 1; // 发文
                    apiCall = listDocumentHandle(params);
                    break;
                case 'documentReceive':
                    params.type = 0; // 收文
                    apiCall = listDocumentHandle(params);
                    break;
                case 'supervise':
                    // 处理督办事项查询范围
                    if (params.queryScope === 'myProcess') {
                        params.isNotApproval = true;
                    } else if (params.queryScope === 'myCreate') {
                        params.isNotCreate = true;
                    }
                    // 删除queryScope参数，避免传递给后端
                    delete params.queryScope;
                    apiCall = listSupervise(params);
                    break;
                case 'myItem':
                    // 处理我的事项查询范围
                    if (params.queryScope === 'myProcess') {
                        params.isNotApproval = true;
                    } else if (params.queryScope === 'myCreate') {
                        params.isNotCreate = true;
                    }
                    // 删除queryScope参数，避免传递给后端
                    delete params.queryScope;
                    apiCall = getProcessList(params);
                    break;
                case 'examine':
                    // 处理审核事项查询范围
                    if (params.queryScope === 'myProcess') {
                        params.isNotApproval = true;
                    } else if (params.queryScope === 'myCreate') {
                        params.isNotCreate = true;
                    }
                    // 删除queryScope参数，避免传递给后端
                    delete params.queryScope;
                    apiCall = getCheckList(params);
                    break;
                case 'affairsApply':
                    apiCall = listAffairsApply(params);
                    break;
                case 'affairsCheck':
                    apiCall = listAffairsCheck(params);
                    break;
                case 'affairsApprovedList':
                    apiCall = getOAList(params);
                    break;
                case 'attendanceReport':
                    // 考勤查询需要特殊处理状态参数
                    if (params.attendanceStatus) {
                        params.status = params.attendanceStatus;
                        delete params.attendanceStatus;
                    }
                    apiCall = getAttendanceReportList(params);
                    break;
                default:
                    this.loading = false;
                    return;
            }

            apiCall.then(response => {
                this.list = response.rows || response.data || [];
                this.total = response.total || 0;
                this.loading = false;
            }).catch(() => {
                this.loading = false;
            });
        },
        // 重置查询
        resetQuery() {
            this.resetForm('queryForm');
            this.queryParams = {
                pageNum: 1,
                pageSize: 10,
                category: '',
                categoryPath: '',
                type: undefined,
                urgencyLevel: undefined,
                secrecy: undefined,
                partNumber: undefined,
                wordSize: undefined,
                issuer: undefined,
                mainDeliveryAgency: undefined,
                createTime: undefined,
                title: undefined,
                queryScope: 'all',
                code: undefined,
                name: undefined,
                sourceName: undefined,
                urgencyName: undefined,
                leadLeaderName: undefined,
                typeName: undefined,
                status: undefined,
                timeRange: undefined,
                affairsType: undefined,
                isNotCC: 1, // 重置时保持默认值1
                nickName: undefined,
                deptName: undefined,
                attendanceStatus: undefined
            };
            this.list = [];
            this.total = 0;
            this.hasSearched = false;
        },
        // 获取公文状态标签类型
        getDocumentStatusTagType(status) {
            const typeMap = {
                11: 'danger', // 退回状态
                12: 'info', // 待经理审核
                13: 'info', // 综合岗待审核
                14: 'info', // 主任岗待审核
                15: 'info', // 综合岗套头
                16: 'info', // 用印申请
                17: 'info', // 用印审批
                20: 'info', // 部门经理分发
                21: 'info', // 部门人员确认
                22: 'info', // 部门办结
                23: 'info', // 部门人员确认
                24: 'info', // 部门办结
                25: 'info', // 部门办结
                26: 'success', // 发文完结
                1: 'warning', // 待修改
                2: 'info', // 综合岗办理
                3: 'info', // 主任室审核
                4: 'info', // 部门经理分发
                5: 'success', // 综合岗办结
                6: 'success' // 已办结
            };
            return typeMap[status] || 'info';
        },
        // 获取公文状态名称
        getDocumentStatusName(status) {
            const statusMap = {
                11: '待修改',
                12: '经理审核',
                13: '综合岗审核',
                14: '主任室审核',
                15: '文件套头',
                16: '用印申请',
                17: '用印审批',
                20: '公文分发',
                21: '部门人员确认',
                22: '部门办结',
                23: '部门人员确认',
                24: '部门办结',
                25: '综合岗归档',
                26: '发文已完结',
                1: '待修改',
                2: '综合岗办理',
                3: '主任室审核',
                4: '公文分发',
                5: '综合岗办结',
                6: '已办结'
            };
            return statusMap[status] || '未知状态';
        },
        // 格式化考勤状态
        formatAttendanceStatus(row, column) {
            const statusMap = {
                1: '正常',
                2: '迟到',
                3: '早退',
                4: '缺卡',
                5: '请休假',
                6: '出差'
            };
            return statusMap[row.status] || '未知';
        },
        // 获取考勤状态标签类型
        getAttendanceStatusTagType(status) {
            const typeMap = {
                1: 'success', // 正常
                2: 'warning', // 迟到
                3: 'warning', // 早退
                4: 'danger',  // 缺卡
                5: 'info',    // 请休假
                6: 'primary'  // 出差
            };
            return typeMap[status] || 'info';
        },
        // 处理详情查看
        handleDocumentDetail(row) {
            const id = row.id;
            if (this.queryParams.category === 'documentManagement') {
                // 跳转到发文管理详情页面
                this.$router.push({ path: '/document/documentManagementAdd', query: { id: id } });
            } else if (this.queryParams.category === 'documentReceive') {
                // 跳转到收文管理详情页面
                this.$router.push({ path: '/document/documentReceiveAdd', query: { id: id } });
            }
        },
        handleSuperviseDetail(row) {
            this.detailTitle = '督办事项信息';
            const id = row.id;
            this.superviseIsView = true;
            getSupervise(id).then(response => {
                // 将相关字段转换为number类型
                response.data.leadLeader = Number(response.data.leadLeader);
                response.data.superviseDept = Number(response.data.superviseDept);
                response.data.firstBusinessUnit = Number(response.data.firstBusinessUnit);

                // 处理协办部门，可能是多个值
                if (response.data.xbBusinessUnit) {
                    if (typeof response.data.xbBusinessUnit === 'string' && response.data.xbBusinessUnit.includes(',')) {
                        response.data.xbBusinessUnit = response.data.xbBusinessUnit.split(',').map(id => Number(id));
                    } else {
                        response.data.xbBusinessUnit = [Number(response.data.xbBusinessUnit)];
                    }
                } else {
                    response.data.xbBusinessUnit = [];
                }

                // 将organizerIds字符串转换为数组
                if (response.data.organizerIds) {
                    response.data.organizerIds = response.data.organizerIds.split(',').map(item => Number(item));
                }

                // 确保frequency是数字类型
                if (response.data.frequency) {
                    response.data.frequency = Number(response.data.frequency);
                } else {
                    response.data.frequency = 1; // 默认值
                }

                this.superviseDetailData = response.data;
                this.superviseDetailData.timePeriod = [this.superviseDetailData.startTime, this.superviseDetailData.endTime];

                // 加载主办部门人员
                if (this.superviseDetailData.firstBusinessUnit) {
                    this.handleSuperviseMainDeptChange(this.superviseDetailData.firstBusinessUnit);
                }

                // 加载协办部门人员
                if (this.superviseDetailData.xbBusinessUnit && this.superviseDetailData.xbBusinessUnit.length > 0) {
                    this.handleSuperviseAssistDeptChange(this.superviseDetailData.xbBusinessUnit);
                }

                // 加载督办部门人员
                if (this.superviseDetailData.superviseDept) {
                    this.handleSuperviseSuperviseDeptChange(this.superviseDetailData.superviseDept);
                }

                this.superviseDetailOpen = true;
            }).catch(() => {
                this.$message.error('获取督办事项详情失败');
            });
        },
        handleAffairsDetail(row) {
            this.detailTitle = '事务申请详情';
            affairsDetail(row.id).then(response => {
                this.affairsDetailData = response.data;
                // 设置事务类型名称
                const typeItem = this.dict.type.affairs_type.find(item => item.value == this.affairsDetailData.affairsType);
                if (typeItem) {
                    this.affairsDetailData.typeName = typeItem.label;
                }
                this.affairsDetailOpen = true;
            }).catch(() => {
                this.$message.error('获取事务详情失败');
            });
        },
        // 处理考勤详情
        handleAttendanceDetail(row) {
            this.detailTitle = '考勤记录详情';
            this.attendanceDetailData = { ...row };
            this.attendanceDetailOpen = true;
        },
        // 关闭详情弹窗
        closeDetailDialog() {
            this.affairsDetailOpen = false;
            this.superviseDetailOpen = false;
            this.attendanceDetailOpen = false;
            this.detailTitle = '';
            // 重置详情数据
            this.affairsDetailData = {};
            this.superviseDetailData = {};
            this.attendanceDetailData = {};
            // 重置督办相关数据
            this.superviseIsView = true;
            this.superviseMainDeptUserList = [];
            this.superviseAssistDeptUserList = [];
            this.superviseSuperviseDeptUserList = [];
        },
        handleDownloadSuperviseWord(row) {
            // 显示加载提示
            const loading = this.$loading({
                lock: true,
                text: '正在生成督办单Word文档...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            // 获取督办事项详情
            getSupervise(row.id).then(response => {
                loading.close();
                const detailData = response.data;
                
                // 生成督办单Word文档
                this.generateSuperviseWordDocument(detailData, row);
                
            }).catch(error => {
                loading.close();
                console.error('获取督办事项详情失败:', error);
                this.$modal.msgError('获取督办事项详情失败');
            });
        },
        handleDownloadAffairsWord(row) {
            // 显示加载提示
            const loading = this.$loading({
                lock: true,
                text: '正在生成申请书Word文档...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            // 获取事务申请详情 - 使用affairsDetail接口
            affairsDetail(row.id).then(response => {
                loading.close();
                const detailData = response.data;
                
                // 生成事务申请Word文档
                this.generateAffairsWordDocument(detailData, row);
                
            }).catch(error => {
                loading.close();
                console.error('获取事务申请详情失败:', error);
                this.$modal.msgError('获取事务申请详情失败');
            });
        },
        // 生成督办单Word文档
        async generateSuperviseWordDocument(detailData, row) {
            try {
                // 动态导入docx相关模块
                const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, HeadingLevel, BorderStyle, VerticalAlign, TableLayoutType, Packer } = await import('docx');
                
                // 创建督办单文档
                const doc = this.createSuperviseDocument(detailData, row, { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, HeadingLevel, BorderStyle, VerticalAlign, TableLayoutType, Packer });
                
                // 生成并下载文档
                const blob = await Packer.toBlob(doc);
                const fileName = `天津众和金融消费者权益保护中心督办事项单_${row.code || row.id}.docx`;
                saveAs(blob, fileName);
                
                this.$modal.msgSuccess('督办单Word文档生成成功');
                
            } catch (error) {
                console.error('生成督办单Word文档失败:', error);
                this.$modal.msgError('生成督办单Word文档失败');
            }
        },
        // 生成事务申请Word文档
        async generateAffairsWordDocument(detailData, row) {
            try {
                // 解析formData
                let formData = {};
                if (typeof detailData.formData === 'string') {
                    try {
                        formData = JSON.parse(detailData.formData);
                    } catch (e) {
                        formData = {};
                    }
                } else if (typeof detailData.formData === 'object') {
                    formData = detailData.formData || {};
                }

                // 使用WordGenerator工具类生成Word文档
                await WordGenerator.generateAffairsApplyWord(detailData, formData, row, this.superviseSectionList, this.userList);
                
                this.$modal.msgSuccess('申请书Word文档生成成功');
                
            } catch (error) {
                console.error('生成申请书Word文档失败:', error);
                this.$modal.msgError('生成申请书Word文档失败');
            }
        },
        // 创建督办单文档
        createSuperviseDocument(detailData, row, docxModules) {
            const { Document, Paragraph, TextRun, AlignmentType, Header, BorderStyle, WidthType, VerticalAlign, TableLayoutType, Packer } = docxModules;
            
            // 创建页眉
            const header = new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 200, after: 200 },
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6
                            }
                        },
                        children: [
                            new TextRun({
                                text: "天津众和金融消保中心",
                                font: "宋体",
                                size: 18,
                                bold: true,
                                color: "000000"
                            })
                        ]
                    })
                ]
            });

            // 获取督办状态文本
            const statusText = this.superviseStatusText[detailData.status] || '未知状态';
            
            // 获取紧急程度文本
            const urgencyText = detailData.urgencyName || '一般';
            
            // 获取事项来源文本
            const sourceText = detailData.sourceName || '';
            
            // 获取业务分类文本
            const typeText = detailData.typeName || '';
            
            // 获取督办人姓名
            const leadLeaderName = detailData.leadLeaderName || '';
            
            // 获取主办人姓名
            const sponsorName = detailData.sponsorName || '';
            
            // 获取协办人姓名
            const organizerNames = detailData.organizerNames || '';
            
            // 获取抄送领导姓名
            const copyLeaderNames = detailData.copyLeaderNames || '';

            // 创建文档
            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 1440,
                                right: 720,
                                bottom: 720,
                                left: 720
                            }
                        }
                    },
                    headers: {
                        default: header
                    },
                    children: [
                        // 文档标题
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                            children: [
                                new TextRun({
                                    text: "天津众和金融消费者权益保护中心督办事项单",
                                    font: "宋体",
                                    size: 36,
                                    bold: true
                                })
                            ]
                        }),
                        
                        // 基本信息
                        new Paragraph({
                            spacing: { after: 200 },
                            children: [
                                new TextRun({
                                    text: `事项编号：${detailData.code || ''}`,
                                    font: "宋体",
                                    size: 20
                                }),
                                new TextRun({
                                    text: `                                                         创建日期：${detailData.createTime ? detailData.createTime.split(' ')[0] : ''}`,
                                    font: "宋体",
                                    size: 20
                                })
                            ]
                        }),

                        // 基本信息表格
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "事项来源", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 30, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: sourceText })]
                                        }),
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "业务分类", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 30, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: typeText })]
                                        })
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({ text: "紧急程度", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: urgencyText })]
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: "督办状态", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: statusText })]
                                        })
                                    ]
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({ text: "督办人", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: leadLeaderName })]
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: "主办人", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ text: sponsorName })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 事项名称
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "事项名称", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: detailData.name || '' })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 事项内容
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "事项内容", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: detailData.content || '' })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 督办时间
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "督办时间", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: `${detailData.startTime || ''} 至 ${detailData.endTime || ''}` })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 督办频次
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "督办频次", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: `${detailData.frequency || 1} 次` })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 协办人
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "协办人", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: organizerNames })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 抄送领导
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "抄送领导", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: copyLeaderNames })]
                                        })
                                    ]
                                })
                            ]
                        }),

                        new Paragraph({ spacing: { after: 200 } }),

                        // 备注
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: "备注", alignment: AlignmentType.CENTER })],
                                            shading: { fill: "F0F0F0" }
                                        }),
                                        new TableCell({
                                            width: { size: 80, type: WidthType.PERCENTAGE },
                                            children: [new Paragraph({ text: detailData.remark || '' })]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }]
            });

            return doc;
        },
        /** 下载单个文件 */
        downloadSingleFile(attachment) {
            try {
                let fileUrl = attachment.url;
                const fileName = attachment.name || `附件_${Date.now()}`;
                
                // 如果URL是相对路径，补充完整路径
                if (fileUrl && !fileUrl.startsWith('http')) {
                    fileUrl = this._baseUrl + fileUrl;
                }
                
                // 检查是否为PDF文件或其他需要强制下载的文件类型
                const isPDF = fileName.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().includes('.pdf');
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i.test(fileName);
                
                if (isPDF || isImage) {
                    // 对于PDF和图片文件，使用fetch方式下载以确保强制下载
                    this.forceDownloadFile(fileUrl, fileName);
                } else {
                    // 对于其他文件类型，使用传统方式
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = fileUrl;
                    link.download = fileName;
                    
                    // 添加额外属性确保下载
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                console.log(`正在下载: ${fileName}`);
            } catch (error) {
                console.error('下载文件失败:', attachment.name, error);
                this.$modal.msgError(`下载文件失败: ${attachment.name}`);
            }
        },
        
        /** 强制下载文件（适用于PDF、图片等浏览器可能直接打开的文件） */
        forceDownloadFile(url, filename) {
            // 使用fetch下载文件并创建blob来强制下载
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    // 创建下载链接
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = filename;
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // 清理URL对象
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('强制下载失败，尝试传统方式:', error);
                    // 如果fetch失败，回退到传统下载方式
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = filename;
                    link.setAttribute('target', '_blank');
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
        },
        /** 下载指定行的背景材料文件 */
        handleDownloadRowMaterial(row) {
            if (!row.materialFile) {
                this.$modal.msgWarning('该事项没有背景材料文件');
                return;
            }

            const fileUrls = row.materialFile.split(',').map(url => url.trim()).filter(url => url !== '');

            if (fileUrls.length === 0) {
                this.$modal.msgWarning('没有找到有效的背景材料文件');
                return;
            }

            if (fileUrls.length === 1) {
                // 只有一个文件，直接下载
                this.downloadSingleFileByUrl(fileUrls[0]);
            } else {
                // 多个文件，询问是否全部下载
                this.$modal.confirm(`该事项共有 ${fileUrls.length} 个背景材料文件，确定要全部下载吗？`)
                    .then(async () => {
                        await this.batchDownloadFiles(fileUrls);
                    })
                    .catch(() => { });
            }
        },
        /** 批量下载文件 */
        async batchDownloadFiles(fileUrls) {
            this.$modal.msgSuccess(`开始下载 ${fileUrls.length} 个文件`);
            
            for (let i = 0; i < fileUrls.length; i++) {
                try {
                    await this.downloadSingleFileByUrl(fileUrls[i]);
                    // 每个文件间隔200ms下载，避免浏览器限制
                    if (i < fileUrls.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                } catch (error) {
                    console.error(`下载文件失败:`, fileUrls[i], error);
                }
            }
            
            this.$modal.msgSuccess('所有文件下载完成');
        },
        /** 通过URL下载单个文件 */
        async downloadSingleFileByUrl(filePath) {
            if (!filePath) return;
            
            try {
                const fileName = this.getFileName(filePath);
                const fullUrl = this.getDownloadUrl(filePath);
                
                // 检查是否为PDF文件或其他需要强制下载的文件类型
                const isPDF = fileName.toLowerCase().endsWith('.pdf') || filePath.toLowerCase().includes('.pdf');
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i.test(fileName);
                
                if (isPDF || isImage) {
                    // 对于PDF和图片文件，使用fetch方式下载以确保强制下载
                    this.forceDownloadFile(fullUrl, fileName);
                } else {
                    // 对于其他文件类型，使用传统方式
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = fullUrl;
                    link.download = fileName;
                    
                    // 添加额外属性确保下载
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                console.log(`正在下载: ${fileName}`);
            } catch (error) {
                console.error('下载文件失败:', filePath, error);
                this.$modal.msgError(`下载文件失败: ${this.getFileName(filePath)}`);
            }
        },
    }
};
</script>

<style scoped>
.search-card {
    margin-bottom: 20px;
}

.result-card {
    margin-top: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-right {
    color: #909399;
    font-size: 14px;
}

.category-select {
    margin-right: 20px;
}

.no-data {
    text-align: center;
    padding: 60px 0;
    color: #909399;
}

.no-data i {
    font-size: 48px;
    margin-bottom: 16px;
}

.no-data p {
    font-size: 16px;
    margin: 0;
}

/* 表单项间距调整 */
.el-form--inline .el-form-item {
    margin-right: 15px;
    margin-bottom: 15px;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
    .el-form--inline .el-form-item {
        display: block;
        margin-right: 0;
    }
}

/* 文件相关样式 */
.attachment {
    margin-top: 5px;
}

.file-item {
    margin-bottom: 8px;
}

.file-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.file-actions .el-button {
    margin-right: 10px;
}

/* 考勤详情汇总样式 */
.attendance-summary {
    margin-top: 10px;
}

.summary-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-label {
    font-weight: 500;
    color: #606266;
}

.summary-value {
    font-weight: 600;
}

.text-danger {
    color: #f56c6c;
}

.text-success {
    color: #67c23a;
}

/* 文本超过两行显示省略号样式 */
.text-ellipsis-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    line-height: 1.4;
    max-height: 2.8em; /* 约两行的高度 */
    text-align: left;
}
</style>
