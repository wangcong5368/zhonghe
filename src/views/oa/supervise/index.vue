<template>
    <div class="app-container">
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                    v-hasPermi="['project:supervise:addSupervise']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="info" plain icon="el-icon-setting" size="mini" @click="handleColumnSetting">
                    列设置
                </el-button>
            </el-col>
            <right-toolbar @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="superviseList" @selection-change="handleSelectionChange"
            :row-class-name="tableRowClassName" @row-click="handleRowClick"
            ref="superviseTable">

            <!-- 动态生成表格列 -->
            <template v-for="column in visibleColumns">
                <!-- 序号列 -->
                <el-table-column v-if="column.key === 'index'" type="index" :label="column.label" :width="column.width"
                    align="center" :key="'index-' + column.key" />

                <!-- 事项名称列（特殊处理） -->
                <el-table-column v-else-if="column.key === 'name'" :label="column.label" align="center"
                    :prop="column.prop" :width="column.width" :key="'name-' + column.key">
                    <template slot-scope="scope">
                        <div style="max-height: 30px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                            {{ scope.row.name }}
                        </div>
                    </template>
                </el-table-column>

                <!-- 督办截止日期列 -->
                <el-table-column v-else-if="column.key === 'endTime'" :label="column.label" align="center"
                    :prop="column.prop" :width="column.width" :key="'endTime-' + column.key">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
                    </template>
                </el-table-column>

                <!-- 督办状态列 -->
                <el-table-column v-else-if="column.key === 'status'" :label="column.label" align="center"
                    :width="column.width" :key="'status-' + column.key">
                    <template slot-scope="scope">
                        {{ statusText[scope.row.status] }}
                    </template>
                </el-table-column>

                <!-- 事项版本列 -->
                <el-table-column v-else-if="column.key === 'editStatus'" :label="column.label" align="center"
                    :width="column.width" :key="'editStatus-' + column.key">
                    <template slot-scope="scope">
                        {{ versionText[scope.row.editStatus] }}
                    </template>
                </el-table-column>

                <!-- 创建时间列 -->
                <el-table-column v-else-if="column.key === 'createTime'" :label="column.label" align="center"
                    :prop="column.prop" :width="column.width" :key="'createTime-' + column.key">
                    <template slot-scope="scope">
                        <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
                    </template>
                </el-table-column>

                <!-- 是否超期列 -->
                <el-table-column v-else-if="column.key === 'overdue'" :label="column.label" align="center"
                    :prop="column.prop" :width="column.width" :key="'overdue-' + column.key">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.overdue === 1 ? 'danger' : ''">
                            {{ scope.row.overdue === 1 ? '超期' : '正常' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- 操作列 -->
                <el-table-column v-else-if="column.key === 'actions'" :label="column.label" align="center"
                    class-name="small-padding fixed-width" fixed="right" :width="column.width"
                    :key="'actions-' + column.key">
                    <template slot-scope="scope">
                        <el-dropdown trigger="hover" @command="handleCommand">
                            <span class="el-dropdown-link">
                                <i class="el-icon-more"></i>
                            </span>
                            <el-dropdown-menu slot="dropdown">
                                <!-- 查看详情按钮 -->
                                <el-dropdown-item :command="{ type: 'detail', row: scope.row }">
                                    <i class="el-icon-view"></i>
                                    详情
                                </el-dropdown-item>

                                <!-- 查看进度按钮 -->
                                <!-- <el-dropdown-item :command="{ type: 'progress', row: scope.row }">
                                    <i class="el-icon-s-data"></i>
                                    查看进度
                                </el-dropdown-item> -->

                                <!-- 修改事项按钮，仅在创建人且状态为待办且非作废版本时显示 -->
                                <el-dropdown-item :command="{ type: 'resubmit', row: scope.row }"
                                    v-if="scope.row.createId === userInfo.userId && scope.row.status === 0 && scope.row.editStatus !== 2">
                                    <i class="el-icon-edit"></i>
                                    修改事项
                                </el-dropdown-item>

                                <!-- 作废按钮，仅在创建人且状态为待办且非作废版本时显示 -->
                                <el-dropdown-item :command="{ type: 'abolish', row: scope.row }"
                                    v-if="scope.row.createId === userInfo.userId && scope.row.status === 0 && scope.row.editStatus !== 2">
                                    <i class="el-icon-close"></i>
                                    作废
                                </el-dropdown-item>

                                <!-- 下载背景材料按钮，仅在有背景材料时显示 -->
                                <el-dropdown-item :command="{ type: 'downloadMaterial', row: scope.row }"
                                    v-if="scope.row.materialFile">
                                    <i class="el-icon-download"></i>
                                    下载背景材料
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>

                <!-- 普通列 -->
                <el-table-column v-else :label="column.label" align="center" :prop="column.prop" :width="column.width"
                    :key="'default-' + column.key" />
            </template>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改督办事项信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="900px" @close="cancel" append-to-body
            :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="130px" label-position="right">
                <el-row v-if="isView">
                    <el-col :span="24">
                        <el-form-item label="事项编号" prop="code">
                            <el-input v-model="form.code" placeholder="无" disabled maxlength="50"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="8">
                        <el-form-item label="业务分类" prop="source">
                            <el-select v-model="form.type" :placeholder="isView ? '无' : '请选择业务分类'" :disabled="isView">
                                <el-option v-for="item in typeList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="紧急程度" prop="urgency">
                            <el-select v-model="form.urgency" :placeholder="isView ? '无' : '请选择紧急程度'"
                                :disabled="isView">
                                <el-option v-for="item in urgencyList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="事项来源" prop="source">
                            <el-select v-model="form.source" :placeholder="isView ? '无' : '请选择事项来源'" :disabled="isView">
                                <el-option v-for="item in sourceList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="督办部门" prop="superviseDept">
                            <el-cascader v-model="form.superviseDept" :options="sectionList" :props="deptProps"
                                :placeholder="isView ? '无' : '请选择督办部门'" :disabled="isView" clearable
                                @change="handleSuperviseDeptChange" ref="superviseDeptCascader"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="督办人" prop="leadLeader">
                            <el-select v-model="form.leadLeader" :placeholder="isView ? '无' : '请选择督办人'"
                                :disabled="isView">
                                <el-option v-if="!isView && superviseDeptUserList.length === 0" label="请先选择督办部门"
                                    value="" disabled></el-option>
                                <el-option v-for="item in superviseDeptUserList" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"
                                    :disabled="isUserSelected(item.userId, 'leadLeader')"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="主办部门" prop="firstBusinessUnit">
                            <el-cascader v-model="form.firstBusinessUnit" :options="sectionList" :props="deptProps"
                                :placeholder="isView ? '无' : '请选择主办部门'" :disabled="isView" clearable
                                @change="handleMainDeptChange" ref="mainDeptCascader"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="主办人" prop="sponsorId">
                            <el-select v-model="form.sponsorId" :placeholder="isView ? '无' : '请选择主办人'"
                                :disabled="isView">
                                <el-option v-if="!isView && mainDeptUserList.length === 0" label="请先选择主办部门" value=""
                                    disabled></el-option>
                                <el-option v-for="item in mainDeptUserList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"
                                    :disabled="isUserSelected(item.userId, 'sponsorId')"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="协办部门" prop="xbBusinessUnit">
                            <el-cascader v-model="form.xbBusinessUnit" :options="sectionList"
                                :props="{ ...deptProps, multiple: true }" :placeholder="isView ? '无' : '请选择协办部门'"
                                :disabled="isView" clearable @change="handleAssistDeptChange"
                                ref="assistDeptCascader"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="协办人" prop="organizerIds">
                            <el-select v-model="form.organizerIds" multiple :placeholder="isView ? '无' : '选填，可选多人'"
                                :disabled="isView" clearable>
                                <el-option v-if="!isView && assistDeptUserList.length === 0" label="请先选择协办部门" value=""
                                    disabled></el-option>
                                <el-option v-if="!isView && assistDeptUserList.length > 0" label="全选该部门人员"
                                    :value="'all'" @click.native="selectAllAssistUsers"></el-option>
                                <el-option v-for="item in assistDeptUserList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"
                                    :disabled="isUserSelected(item.userId, 'organizerIds')"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="事项名称" prop="name">
                    <el-input v-model="form.name" :placeholder="isView ? '无' : '请输入事项名称'" :disabled="isView"
                        maxlength="50" />
                </el-form-item>
                <el-form-item label="事项内容" prop="content">
                    <!-- <editor v-if="open" v-model="form.content" :min-height="192" :readOnly="isView" :key="isView ? 'view-editor' : 'edit-editor'" /> -->
                    <el-input type="textarea" v-model="form.content" :placeholder="isView ? '无' : '请输入事项内容'" :rows="3"
                        :disabled="isView" maxlength="2000" />
                </el-form-item>
                <!-- <el-row v-if="isView">
                    <el-col :span="12">
                        <el-form-item label="督办开始日期" prop="startTime">
                            <el-date-picker clearable v-model="form.startTime" type="date" value-format="yyyy-MM-dd" :disabled="isView"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="督办截止日期" prop="endTime">
                            <el-date-picker clearable v-model="form.endTime" type="date" value-format="yyyy-MM-dd" :disabled="isView"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row> -->

                <!-- 新增字段：督办频次 -->
                <el-form-item label="督办频次" prop="frequency">
                    <el-input-number v-model="form.frequency" :min="1" :max="50" :disabled="isView"
                        :placeholder="isView ? '无' : '请输入督办频次(1-50)'" @change="handleFrequencyChange"></el-input-number>
                </el-form-item>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="督办日期" prop="timePeriod">
                            <el-date-picker v-model="form.timePeriod" type="daterange" range-separator="至"
                                start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"
                                :disabled="isView" @change="handleTimePeriodChange"
                                :picker-options="{ disabledDate: time => time.getTime() < Date.now() - 8.64e7 }"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 督办时间节点选择 -->
                <el-form-item v-if="!isView && form.frequency > 1" label="督办时间节点" prop="frequencyTimeList">
                    <div class="frequency-time-container">
                        <div class="frequency-time-info">
                            <span style="color: #ff4d4f;">● 起始时间节点</span>
                            <span style="color: #52c41a; margin-left: 20px;">● 中间时间节点</span>
                            <span style="margin-left: 20px;">需选择 {{ form.frequency - 1 }} 个中间时间节点</span>
                        </div>
                        <div class="frequency-time-list">
                            <!-- 起始时间节点（固定显示，红色） -->
                            <div class="time-node start-node">
                                <span class="node-label">起始时间</span>
                                <span class="node-date">{{ form.timePeriod && form.timePeriod[0] ? form.timePeriod[0] :
                                    '请先选择督办日期' }}</span>
                            </div>

                            <!-- 中间时间节点（动态生成，绿色） -->
                            <div v-for="(timeNode, index) in frequencyTimeNodes" :key="index"
                                class="time-node middle-node">
                                <span class="node-label">节点{{ index + 1 }}</span>
                                <el-date-picker v-model="timeNode.date" type="date" value-format="yyyy-MM-dd"
                                    :placeholder="`选择时间节点${index + 1}`"
                                    :picker-options="getTimeNodePickerOptions(index)"
                                    @change="handleTimeNodeChange(index, $event)" size="small">
                                </el-date-picker>
                            </div>

                            <!-- 结束时间节点（固定显示，红色） -->
                            <div class="time-node end-node">
                                <span class="node-label">结束时间</span>
                                <span class="node-date">{{ form.timePeriod && form.timePeriod[1] ? form.timePeriod[1] :
                                    '请先选择督办日期' }}</span>
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <!-- 查看模式下显示已选择的时间节点 -->
                <el-form-item v-if="isView && getViewFrequencyTimeList().length > 0" label="督办时间节点">
                    <div class="view-frequency-time-list">
                        <div class="time-node start-node">
                            <span class="node-label">起始时间</span>
                            <span class="node-date">{{ form.timePeriod && form.timePeriod[0] ? form.timePeriod[0] :
                                form.startTime }}</span>
                        </div>
                        <div v-for="(timeItem, index) in getViewFrequencyTimeList()" :key="index"
                            class="time-node middle-node">
                            <span class="node-label">节点{{ index + 1 }}</span>
                            <span class="node-date">{{ timeItem }}</span>
                        </div>
                        <div class="time-node end-node">
                            <span class="node-label">结束时间</span>
                            <span class="node-date">{{ form.timePeriod && form.timePeriod[1] ? form.timePeriod[1] :
                                form.endTime
                                }}</span>
                        </div>
                    </div>
                </el-form-item>

                <!-- 新增字段：督办背景材料 -->
                <el-form-item label="督办背景材料" prop="materialFile">
                    <FileUpload v-if="!isView" @upload-success="handleMaterialFileUploadSuccess"
                        ref="materialFileUpload" v-model="form.materialFile"
                        :oldList="form.materialFile ? [{ name: '督办背景材料', url: form.materialFile }] : []" />
                    <div v-else>
                        <div v-if="form.materialFile" class="attachment">
                            <!-- 一键下载按钮 -->
                            <!-- <div style="margin-bottom: 10px;" v-if="form.materialFile.includes(',')">
                                <el-button type="warning" size="mini" icon="el-icon-download"
                                    @click="downloadFormMaterialFiles">
                                    一键下载所有背景材料
                                </el-button>
                            </div> -->
                            <template v-if="form.materialFile.includes(',')">
                                <div v-for="(file, index) in form.materialFile.split(',')" :key="index"
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
                                    @click.prevent="previewFile(form.materialFile)">
                                    在线查看({{ getShortFileName(form.materialFile) }})
                                </el-button>
                                <el-button type="success" size="mini" icon="el-icon-download">
                                    <a :href="getDownloadUrl(form.materialFile)"
                                        :download="getFileName(form.materialFile)"
                                        style="color: white; text-decoration: none">下载文件</a>
                                </el-button>
                            </div>
                        </div>
                        <span v-else>无</span>
                    </div>
                </el-form-item>

                <!-- 新增字段：材料链接 -->
                <el-form-item label="材料链接" prop="materialLink">
                    <el-input v-if="!isView" v-model="form.materialLink" :placeholder="isView ? '无' : '请输入材料链接'"
                        maxlength="200" />
                    <div v-else>
                        <el-link v-if="form.materialLink" type="primary" :href="form.materialLink" target="_blank">
                            {{ form.materialLink }}
                        </el-link>
                        <span v-else>无</span>
                    </div>
                </el-form-item>

                <!-- 新增字段：抄送领导 -->
                <el-form-item label="抄送领导" prop="copyLeaderIds">
                    <el-tree v-if="!isView" ref="deptUserTreeRef" :data="deptUserTree" show-checkbox node-key="id"
                        :props="deptUserTreeProps" :default-checked-keys="checkedLeaderIds"
                        @check="handleCopyLeadersCheck"></el-tree>
                    <div v-else>
                        {{ form.copyLeaderNames || '无' }}
                    </div>
                </el-form-item>

                <!-- 新增字段：备注 -->
                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" v-model="form.remark" :rows="3" :disabled="isView" maxlength="2000" />
                </el-form-item>

                <el-form-item label="审核权" prop="reviewAuthority"
                    :rules="[{ required: true, message: '请选择审核权', trigger: 'change' }]">
                    <el-select v-model="form.reviewAuthority" placeholder="请选择审核权" :disabled="isView">
                        <el-option label="创建人" :value="0"></el-option>
                        <el-option label="督办人" :value="1"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" v-if="title === '添加督办事项信息'" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>

        <el-dialog :title="viewTitle" :visible.sync="viewOpen" width="900px" append-to-body
            :close-on-click-modal="false">
            <el-timeline>
                <el-timeline-item v-for="(item, index) in scheduleData" placement="top" :key="index"
                    :timestamp="parseTime(item.createTime)" :type="getTimelineItemType(item.remark)">
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <span>{{ item.processName || '系统' }}</span>
                            <span style="float: right">{{ getActionFromRemark(item.status) }}</span>
                        </div>
                        <div class="text-content">
                            <div v-html="item.notes" class="content"></div>
                            <div v-html="item.content || item.remark" class="content"></div>
                            <div v-if="item.url" class="attachment">
                                <template v-if="item.url.includes(',')">
                                    <div v-for="(file, index) in item.url.split(',')" :key="index" class="file-item">
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
                                        @click.prevent="previewFile(item.url)">在线查看({{ getShortFileName(item.url)
                                        }})</el-button>
                                    <el-button type="success" size="mini" icon="el-icon-download">
                                        <a :href="getDownloadUrl(item.url)" :download="getFileName(item.url)"
                                            style="color: white; text-decoration: none">下载文件</a>
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-timeline-item>
            </el-timeline>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="() => (viewOpen = false)">关闭</el-button>
            </div>
        </el-dialog>

        <ViewFile ref="viewFileRef" />

        <!-- 新增事项重新提交对话框 -->
        <el-dialog title="修改事项" :visible.sync="resubmitOpen" width="900px" append-to-body :close-on-click-modal="false">
            <el-form ref="resubmitForm" :model="resubmitForm" :rules="resubmitRules" label-width="130px" label-position="right">
                <!-- 重新提交时不显示事项编号，由后端自动生成 -->

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="事项来源" prop="source">
                            <el-select v-model="resubmitForm.source" placeholder="请选择事项来源">
                                <el-option v-for="item in sourceList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="业务分类" prop="source">
                            <el-select v-model="resubmitForm.type" placeholder="请选择业务分类">
                                <el-option v-for="item in typeList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="紧急程度" prop="urgency">
                            <el-select v-model="resubmitForm.urgency" placeholder="请选择紧急程度">
                                <el-option v-for="item in urgencyList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="督办部门" prop="superviseDept">
                            <el-cascader v-model="resubmitForm.superviseDept" :options="sectionList" :props="deptProps"
                                placeholder="请选择督办部门" clearable @change="handleResubmitSuperviseDeptChange"
                                ref="resubmitSuperviseDeptCascader"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="督办人" prop="leadLeader">
                            <el-select v-model="resubmitForm.leadLeader" placeholder="请选择督办人">
                                <el-option v-if="resubmitSuperviseDeptUserList.length === 0" label="请先选择督办部门" value=""
                                    disabled></el-option>
                                <el-option v-for="item in resubmitSuperviseDeptUserList" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"
                                    :disabled="isUserSelected(item.userId, 'leadLeader')"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="主办部门" prop="firstBusinessUnit">
                            <el-cascader v-model="resubmitForm.firstBusinessUnit" :options="sectionList"
                                :props="deptProps" placeholder="请选择主办部门" clearable
                                @change="handleResubmitMainDeptChange" ref="resubmitMainDeptCascader"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="协办部门" prop="xbBusinessUnit">
                            <el-cascader v-model="resubmitForm.xbBusinessUnit" :options="sectionList"
                                :props="{ ...deptProps, multiple: true }" placeholder="请选择协办部门" clearable
                                @change="handleResubmitAssistDeptChange" ref="resubmitAssistDeptCascader"></el-cascader>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="主办人" prop="sponsorId">
                            <el-select v-model="resubmitForm.sponsorId" placeholder="请选择主办人">
                                <el-option v-if="resubmitMainDeptUserList.length === 0" label="请先选择主办部门" value=""
                                    disabled></el-option>
                                <el-option v-for="item in resubmitMainDeptUserList" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"
                                    :disabled="isUserSelected(item.userId, 'sponsorId')"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="协办人" prop="organizerIds">
                            <el-select v-model="resubmitForm.organizerIds" multiple placeholder="选填，可选多人" clearable>
                                <el-option v-if="resubmitAssistDeptUserList.length === 0" label="请先选择协办部门" value=""
                                    disabled></el-option>
                                <el-option v-if="resubmitAssistDeptUserList.length > 0" label="全选该部门人员" :value="'all'"
                                    @click.native="resubmitSelectAllAssistUsers"></el-option>
                                <el-option v-for="item in resubmitAssistDeptUserList" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"
                                    :disabled="isUserSelected(item.userId, 'organizerIds')"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="事项名称" prop="name">
                    <el-input v-model="resubmitForm.name" placeholder="请输入事项名称" maxlength="50" />
                </el-form-item>
                <el-form-item label="事项内容" prop="content">
                    <el-input type="textarea" v-model="resubmitForm.content" placeholder="请输入事项内容" :rows="3"
                        maxlength="2000" />
                </el-form-item>

                <el-form-item label="督办频次" prop="frequency">
                    <el-input-number v-model="resubmitForm.frequency" :min="1" :max="50" placeholder="请输入督办频次(1-50)"
                        @change="handleResubmitFrequencyChange"></el-input-number>
                </el-form-item>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="督办日期" prop="timePeriod">
                            <el-date-picker v-model="resubmitForm.timePeriod" type="daterange" range-separator="至"
                                start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"
                                :picker-options="{ disabledDate: time => time.getTime() < Date.now() - 8.64e7 }"
                                @change="handleResubmitTimePeriodChange"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 重新提交时的督办时间节点选择 -->
                <el-form-item v-if="resubmitForm.frequency > 1" label="督办时间节点" prop="frequencyTimeList">
                    <div class="frequency-time-container">
                        <div class="frequency-time-info">
                            <span style="color: #ff4d4f;">● 起始时间节点</span>
                            <span style="color: #52c41a; margin-left: 20px;">● 中间时间节点</span>
                            <span style="margin-left: 20px;">需选择 {{ resubmitForm.frequency - 1 }} 个中间时间节点</span>
                        </div>
                        <div class="frequency-time-list">
                            <!-- 起始时间节点（固定显示，红色） -->
                            <div class="time-node start-node">
                                <span class="node-label">起始时间</span>
                                <span class="node-date">{{ resubmitForm.timePeriod && resubmitForm.timePeriod[0] ?
                                    resubmitForm.timePeriod[0] : '请先选择督办日期' }}</span>
                            </div>

                            <!-- 中间时间节点（动态生成，绿色） -->
                            <div v-for="(timeNode, index) in resubmitFrequencyTimeNodes" :key="index"
                                class="time-node middle-node">
                                <span class="node-label">节点{{ index + 1 }}</span>
                                <el-date-picker v-model="timeNode.date" type="date" value-format="yyyy-MM-dd"
                                    :placeholder="`选择时间节点${index + 1}`"
                                    :picker-options="getResubmitTimeNodePickerOptions(index)"
                                    @change="handleResubmitTimeNodeChange(index, $event)" size="small">
                                </el-date-picker>
                            </div>

                            <!-- 结束时间节点（固定显示，红色） -->
                            <div class="time-node end-node">
                                <span class="node-label">结束时间</span>
                                <span class="node-date">{{ resubmitForm.timePeriod && resubmitForm.timePeriod[1] ?
                                    resubmitForm.timePeriod[1] : '请先选择督办日期' }}</span>
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="督办背景材料" prop="materialFile">
                    <FileUpload @upload-success="handleResubmitMaterialFileUploadSuccess"
                        ref="resubmitMaterialFileUpload" v-model="resubmitForm.materialFile"
                        :oldList="resubmitForm.materialFile ? [{ name: '督办背景材料', url: resubmitForm.materialFile }] : []" />
                    <!-- 显示现有文件并提供下载选项 -->
                    <div v-if="resubmitForm.materialFile" style="margin-top: 10px;" class="existing-files">
                        <!-- <div style="margin-bottom: 5px;" v-if="resubmitForm.materialFile.includes(',')">
                            <el-button type="warning" size="mini" icon="el-icon-download"
                                @click="downloadResubmitMaterialFiles">
                                一键下载现有背景材料
                            </el-button>
                        </div> -->
                        <div class="file-list">
                            <template v-if="resubmitForm.materialFile.includes(',')">
                                <div v-for="(file, index) in resubmitForm.materialFile.split(',')" :key="index"
                                    class="file-item" style="margin-bottom: 5px;">
                                    <span style="font-size: 12px; color: #606266;">现有文件{{ index + 1 }}: {{
                                        getShortFileName(file.trim()) }}</span>
                                    <el-button type="text" size="mini" @click="previewFile(file.trim())">预览</el-button>
                                </div>
                            </template>
                            <div v-else style="font-size: 12px; color: #606266;">
                                现有文件: {{ getShortFileName(resubmitForm.materialFile) }}
                                <el-button type="text" size="mini"
                                    @click="previewFile(resubmitForm.materialFile)">预览</el-button>
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="材料链接" prop="materialLink">
                    <el-input v-model="resubmitForm.materialLink" placeholder="请输入材料链接" maxlength="200" />
                </el-form-item>

                <el-form-item label="抄送领导" prop="copyLeaderIds">
                    <el-tree ref="resubmitDeptUserTreeRef" :data="deptUserTree" show-checkbox node-key="id"
                        :props="deptUserTreeProps" :default-checked-keys="resubmitCheckedLeaderIds"
                        @check="handleResubmitCopyLeadersCheck"></el-tree>
                </el-form-item>

                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" v-model="resubmitForm.remark" :rows="3" maxlength="2000" />
                </el-form-item>

                <el-form-item label="审核权" prop="reviewAuthority"
                    :rules="[{ required: true, message: '请选择审核权', trigger: 'change' }]">
                    <el-select v-model="resubmitForm.reviewAuthority" placeholder="请选择审核权">
                        <el-option label="创建人" :value="0"></el-option>
                        <el-option label="督办人" :value="1"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitResubmitForm">确 定</el-button>
                <el-button @click="cancelResubmit">取 消</el-button>
            </div>
        </el-dialog>

        <!-- 列设置对话框 -->
        <el-dialog title="表格列设置" :visible.sync="columnSettingVisible" width="600px" append-to-body>
            <div class="column-setting-container">
                <div class="setting-header">
                    <el-button type="primary" size="small" @click="resetColumnOrder">恢复默认</el-button>
                    <el-button type="success" size="small" @click="selectAllColumns">全选</el-button>
                    <el-button type="warning" size="small" @click="clearAllColumns">全不选</el-button>
                </div>

                <div class="column-list" ref="columnList">
                    <div v-for="(column, index) in allColumns" :key="column.key" class="column-item"
                        :class="{ 'disabled': !column.visible }">
                        <div class="column-item-content">
                            <i class="el-icon-s-grid drag-handle"></i>
                            <el-checkbox v-model="column.visible" @change="handleColumnVisibleChange">
                                {{ column.label }}
                            </el-checkbox>
                            <span class="column-info">{{ column.width ? `宽度: ${column.width}px` : '自适应宽度' }}</span>
                        </div>
                    </div>
                </div>

                <div class="setting-tip">
                    <i class="el-icon-info"></i>
                    <span>提示：拖拽左侧图标可调整列顺序，勾选框控制列显示/隐藏</span>
                </div>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelColumnSetting">取 消</el-button>
                <el-button type="primary" @click="saveColumnSetting">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style scope>
.urgent-row {
    color: #fa1515 !important;
}

.semi-urgent-row {
    color: #e6a23c !important;
}

.normal-row {
    color: #67c23a !important;
}

.file-item {
    margin-bottom: 5px;
}

.file-preview-container {
    text-align: center;
    padding: 20px;
}

.existing-files {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
    background-color: #fafafa;
}

.existing-files .file-list {
    margin-top: 5px;
}

.existing-files .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 0;
}
</style>

<script>
import { listSupervise, getSupervise, delSupervise, addSupervise, updateSupervise, getProgressList, resubmitSupervise, withdrawSupervise, abolishSupervise } from '@/api/oa/supervise';
import { listDeptTree, getSourceDict, getTypeDict, getUrgencyDict, getDeptUserTree } from '@/api/oa/publicApi';
import { listPerson } from '@/api/oa/affairsApply';
import { deptTreeSelect } from '@/api/system/user';
import FileUpload from '@/components/FileUpload/index'; // 导入文件上传组件
import conf from '@/conf.js'; // 导入配置文件
import ViewFile from '@/components/viewFile';
import { mapGetters } from 'vuex';

export default {
    name: 'Supervise',
    components: {
        FileUpload, // 注册文件上传组件
        ViewFile
    },
    computed: {
        ...mapGetters(['userInfo']),
        // 判断是否有附件
        hasAttachments() {
            if (!this.scheduleData || this.scheduleData.length === 0) {
                return false;
            }
            return this.scheduleData.some(item => item.url && item.url.trim() !== '');
        },
        // 获取可见的列
        visibleColumns() {
            return this.allColumns.filter(column => column.visible);
        }
    },
    data() {
        return {
            timePeriod: [],
            queryParamsTime: null,
            // 是否查看详情
            isView: false,
            // 主办部门用户列表
            mainDeptUserList: [],
            // 协办部门用户列表
            assistDeptUserList: [],
            // 督办部门用户列表
            superviseDeptUserList: [],
            // 部门树配置
            deptProps: {
                value: 'id',
                label: 'label',
                children: 'children',
                checkStrictly: true,
                emitPath: false
            },
            // 抄送领导部门用户树配置
            deptUserTreeProps: {
                label: function (data) {
                    // 用户节点显示用户名
                    if (data.isUser) {
                        return data.nickName || data.userName || data.name;
                    }
                    // 部门节点显示部门名
                    return data.deptName || data.depName || data.name || data.label;
                },
                children: 'children',
                id: function (data) {
                    // 确保即使属性为 null 或 undefined 也能返回有效字符串
                    if (data.isUser) {
                        return 'user_' + (data.userId || 'unknown');
                    }
                    return 'dept_' + (data.deptId || 'unknown');
                }
            },
            statusText: {
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
            versionText: {
                0: '初始版本',
                1: '修改版本',
                2: '作废版本'
            },
            // 事项来源列表
            sourceList: [],
            // 业务分类列表
            typeList: [],
            // 紧急程度列表
            urgencyList: [],
            //  部门列表
            sectionList: [],
            // 用户列表
            userList: [],
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,

            // 总条数
            total: 0,
            // 督办事项信息表格数据
            superviseList: [],
            // 弹出层标题
            title: '',
            // 是否显示弹出层
            open: false,
            // 查询参数
            viewTitle: null,
            viewOpen: null,
            scheduleData: null,
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                code: null,
                name: null,
                source: null,
                type: null,
                urgency: null,
                leadLeaderName: null,
                superviseDeptName: null,
                firstBusinessUnitName: null,
                xbBusinessUnitName: null,
                content: null,
                startTime: null,
                endTime: null,
                releaseTime: null,
                status: null,
                overdue: null,
                createId: null,
                updateId: null
            },
            // 表单参数
            form: {},
            // 表单校验
            rules: {
                source: [{ required: true, message: '请选择事项来源', trigger: 'change' }],
                type: [{ required: true, message: '请选择业务分类', trigger: 'change' }],
                urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
                superviseDept: [{ required: true, message: '请选择督办部门', trigger: 'change' }],
                leadLeader: [{ required: true, message: '请选择督办人', trigger: 'change' }],
                firstBusinessUnit: [{ required: true, message: '请选择主办部门', trigger: 'change' }],
                sponsorId: [{ required: true, message: '请选择主办人', trigger: 'change' }],
                name: [
                    { required: true, message: '事项名称不能为空', trigger: 'blur' },
                    {
                        min: 2,
                        max: 200,
                        message: '事项名称长度在2-200个字符之间',
                        trigger: 'blur'
                    }
                ],
                content: [{ required: true, message: '事项内容不能为空', trigger: 'blur' }],
                timePeriod: [{ required: true, message: '请选择督办日期', trigger: 'change' }],
                frequency: [
                    { required: true, message: '请输入督办频次', trigger: 'blur' },
                    { type: 'number', min: 1, max: 50, message: '督办频次必须在1-50之间', trigger: 'blur' }
                ],
                copyLeaderIds: [{ required: false, message: '请选择抄送领导', trigger: 'change' }],
                frequencyTimeList: [{
                    validator: (rule, value, callback) => {
                        const form = this.resubmitOpen ? this.resubmitForm : this.form;
                        if (form.frequency > 1) {
                            if (!form.timePeriod || form.timePeriod.length !== 2) {
                                callback(new Error('请先选择督办日期范围'));
                                return;
                            }
                            const expectedNodes = form.frequency - 1;
                            if (!value || value.length !== expectedNodes) {
                                callback(new Error(`请选择 ${expectedNodes} 个中间时间节点`));
                                return;
                            }
                            for (let i = 0; i < value.length; i++) {
                                if (!value[i]) {
                                    callback(new Error(`请选择时间节点${i + 1}`));
                                    return;
                                }
                            }
                        }
                        callback();
                    },
                    trigger: 'blur'
                }]
            },
            deptUserTree: [],
            checkedLeaderIds: [],
            defaultProps: {
                children: 'children',
                label: 'deptName'
            },
            _baseUrl: conf.server.baseUrl, // 添加基础URL
            resubmitOpen: false,
            resubmitForm: {},
            resubmitSuperviseDeptUserList: [],
            resubmitMainDeptUserList: [],
            resubmitAssistDeptUserList: [],
            resubmitCheckedLeaderIds: [],
            resubmitRules: {},
            // 督办时间节点相关
            frequencyTimeNodes: [], // 主表单的时间节点
            resubmitFrequencyTimeNodes: [], // 重新提交表单的时间节点
            // 下载相关
            downloadingAttachments: false,
            // 列设置相关
            columnSettingVisible: false,
            allColumns: [
                { key: 'index', label: '序号', width: 50, visible: true, prop: null, fixed: false },
                { key: 'code', label: '事项编号', width: 100, visible: true, prop: 'code', fixed: false },
                { key: 'sourceName', label: '事项来源', width: null, visible: true, prop: 'sourceName', fixed: false },
                { key: 'typeName', label: '业务分类', width: null, visible: true, prop: 'typeName', fixed: false },
                { key: 'urgencyName', label: '紧急程度', width: null, visible: true, prop: 'urgencyName', fixed: false },
                { key: 'name', label: '事项名称', width: 300, visible: true, prop: 'name', fixed: false },
                { key: 'leadLeaderName', label: '督办人', width: null, visible: true, prop: 'leadLeaderName', fixed: false },
                { key: 'endTime', label: '督办截止日期', width: 180, visible: true, prop: 'endTime', fixed: false },
                { key: 'status', label: '督办状态', width: null, visible: true, prop: null, fixed: false },
                { key: 'editStatus', label: '事项版本', width: null, visible: true, prop: null, fixed: false },
                { key: 'createTime', label: '创建时间', width: 180, visible: true, prop: 'createTime', fixed: false },
                { key: 'overdue', label: '是否超期', width: null, visible: true, prop: 'overdue', fixed: false },
                { key: 'actions', label: '操作', width: 80, visible: true, prop: null, fixed: true }
            ],
            originalColumnOrder: [] // 保存原始列顺序
        };
    },
    created() {
        this.getList();
        this.getUserList();
        this.getDeptList();
        this.getSourceDict();
        this.getTypeDict();
        this.getUrgencyDict();
        this.getDeptUser();
        this.initColumnSettings();
    },
    methods: {
        // 获取部门与用户树
        getDeptUser() {
            getDeptUserTree().then(response => {
                // 处理树数据，将userList转换为子节点
                this.deptUserTree = this.processTreeData(response.data);
            });
        },
        processTreeData(treeData) {
            if (!treeData || !treeData.length) return [];

            return treeData.map(node => {
                const processedNode = { ...node };

                // 添加唯一 id
                processedNode.id = node.isUser ? 'user_' + (node.userId || 'unknown') : 'dept_' + (node.deptId || 'unknown');

                // 如果有用户列表，将用户列表转换为子节点
                if (node.userList && node.userList.length) {
                    // 如果没有children属性，创建一个空数组
                    if (!processedNode.children) {
                        processedNode.children = [];
                    }

                    // 将用户添加为子节点
                    node.userList.forEach(user => {
                        processedNode.children.push({
                            ...user,
                            isUser: true, // 标记为用户节点
                            id: 'user_' + (user.userId || 'unknown'), // 添加唯一 id
                            label: user.nickName || user.userName // 用户显示名称
                        });
                    });

                    // 删除原始userList
                    delete processedNode.userList;
                }

                // 递归处理子节点
                if (processedNode.children && processedNode.children.length) {
                    processedNode.children = this.processTreeData(processedNode.children);
                }

                return processedNode;
            });
        },
        // 从备注中提取操作类型
        getActionFromRemark(status) {
            if (!status) return '';

            switch (status) {
                case 1:
                    return '发布事项';
                case 2:
                    return '进度更新';
                case 3:
                    return '事项办结';
                case 4:
                    return '事项审核';
                case 5:
                    return '主办频次';
                default:
                    return '其他操作';
            }
        },
        getTimelineItemType(remark) {
            // 添加空值检查
            if (!remark) {
                return '';
            }

            if (remark.includes('发布督办事项')) {
                return 'primary';
            } else if (remark.includes('更新进度')) {
                return 'warning';
            } else if (remark.includes('办结事项')) {
                return 'success';
            } else if (remark.includes('审核通过')) {
                return 'success';
            } else {
                return '';
            }
        },
        /** 查看进度按钮操作 */
        handleView(row) {
            getProgressList(row.id).then(res => {
                this.viewTitle = `${row.name}事项进度信息`;
                this.viewOpen = true;
                this.scheduleData = res.data;
            });
        },
        /** 获取紧急程度字典值 */
        getUrgencyDict() {
            getUrgencyDict().then(response => {
                this.urgencyList = response.data;
                console.log(this.urgencyList, '@@@@@@@@@@@@@@@@@@@@');
            });
        },
        /** 获取业务分类字典值 */
        getTypeDict() {
            getTypeDict().then(response => {
                this.typeList = response.data;
            });
        },
        /** 获取事项来源字典值 */
        getSourceDict() {
            getSourceDict().then(response => {
                this.sourceList = response.data;
            });
        },
        /** 查询督办事项信息列表 */
        getList() {
            this.loading = true;
            listSupervise(this.queryParams).then(response => {
                this.superviseList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
        },
        // 获取部门列表
        getDeptList() {
            listDeptTree().then(response => {
                // 将返回的树形结构转换为适合级联选择器的格式
                this.sectionList = this.formatDeptTree(response.data);
            });

            // deptTreeSelect().then(response => {
            //     this.sectionList = this.formatDeptTree(response.data);
            // });
        },
        // 格式化部门树数据
        formatDeptTree(data) {
            if (!data) return [];
            return data.map(item => {
                const node = {
                    id: item.id,
                    label: item.label,
                    children: this.formatDeptTree(item.children)
                };
                // 如果没有子节点，则删除children属性
                if (node.children.length === 0) {
                    delete node.children;
                }
                return node;
            });
        },
        // 获取人员列表
        getUserList() {
            listPerson().then(response => {
                this.userList = response.data;
            });
        },
        // 督办部门变更处理
        handleSuperviseDeptChange(deptId) {
            if (!deptId) {
                this.superviseDeptUserList = [];
                return;
            }
            listPerson({ deptId: deptId }).then(response => {
                this.superviseDeptUserList = response.data;
                // 如果当前选中的督办人不在新的部门人员列表中，则清空督办人选择
                if (this.form.leadLeader && !this.superviseDeptUserList.some(user => user.userId === this.form.leadLeader)) {
                    this.form.leadLeader = null;
                }
            });
        },
        // 主办部门变更处理
        handleMainDeptChange(deptId) {
            if (!deptId) {
                this.mainDeptUserList = [];
                return;
            }
            listPerson({ deptId: deptId }).then(response => {
                this.mainDeptUserList = response.data;
                // 如果当前选中的主办人不在新的部门人员列表中，则清空主办人选择
                if (this.form.sponsorId && !this.mainDeptUserList.some(user => user.userId === this.form.sponsorId)) {
                    this.form.sponsorId = null;
                }
            });
        },
        // 协办部门变更处理
        handleAssistDeptChange(deptIds) {
            if (!deptIds || deptIds.length === 0) {
                this.assistDeptUserList = [];
                this.form.organizerIds = [];
                return;
            }

            // 使用Promise.all同时请求所有部门的人员
            const promises = deptIds.map(deptId => {
                return listPerson({ deptId: deptId });
            });

            Promise.all(promises).then(responses => {
                // 合并所有部门的人员列表
                this.assistDeptUserList = [];
                responses.forEach(response => {
                    if (response && response.data) {
                        this.assistDeptUserList = [...this.assistDeptUserList, ...response.data];
                    }
                });

                // 移除重复的人员（基于userId）
                this.assistDeptUserList = this.removeDuplicateUsers(this.assistDeptUserList);

                // 过滤掉不在新部门的人员
                if (this.form.organizerIds && this.form.organizerIds.length > 0) {
                    // 检查是否有'all'值，如果有则移除
                    if (this.form.organizerIds.includes('all')) {
                        const index = this.form.organizerIds.indexOf('all');
                        this.form.organizerIds.splice(index, 1);
                    }
                    // 过滤掉不在新部门的人员ID
                    this.form.organizerIds = this.form.organizerIds.filter(id => this.assistDeptUserList.some(user => user.userId === id));
                }
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
        // 全选协办部门人员
        selectAllAssistUsers() {
            // 如果已经有'all'值，则移除它
            if (this.form.organizerIds && this.form.organizerIds.includes('all')) {
                const index = this.form.organizerIds.indexOf('all');
                this.form.organizerIds.splice(index, 1);
            }

            // 将所有协办部门人员ID添加到选中列表，排除已被选为督办人或主办人的用户
            this.form.organizerIds = this.assistDeptUserList.filter(user => user.userId !== this.form.leadLeader && user.userId !== this.form.sponsorId).map(user => user.userId);
        },
        // 取消按钮
        cancel() {
            this.open = false;
            this.isView = false;
            this.reset();

            // 清空文件上传组件
            if (this.$refs.materialFileUpload) {
                this.$refs.materialFileUpload.clearFileList();
            }
        },
        // 表单重置
        reset() {
            this.form = {
                id: null,
                code: null,
                name: null,
                source: null,
                type: null,
                urgency: null,
                leadLeader: null,
                superviseDept: null,
                firstBusinessUnit: null,
                xbBusinessUnit: null,
                content: null,
                startTime: null,
                endTime: null,
                releaseTime: null,
                status: null,
                overdue: null,
                createId: null,
                createTime: null,
                updateId: null,
                updateTime: null,
                remark: null,
                delFlag: null,
                frequency: 1, // 默认督办频次为1
                materialFile: '', // 督办背景材料
                materialLink: '', // 材料链接
                copyLeaderIds: '', // 抄送领导
                timePeriod: [], // 初始化日期范围
                reviewAuthority: 0, // 默认审核权为创建人
                frequencyTimeList: [] // 督办时间节点列表
            };
            this.mainDeptUserList = [];
            this.assistDeptUserList = [];
            this.superviseDeptUserList = [];
            this.checkedLeaderIds = [];
            this.frequencyTimeNodes = [];
            this.resetForm('form');
        },

        // 多选框选中数据
        handleSelectionChange(selection) {
            this.ids = selection.map(item => item.id);
            this.single = selection.length !== 1;
            this.multiple = !selection.length;
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset();
            this.open = true;
            this.isView = false;
            this.title = '添加督办事项信息';
            this.timePeriod = [];
            // 确保树形选择器的选中状态被清空
            this.$nextTick(() => {
                if (this.$refs.deptUserTreeRef) {
                    this.$refs.deptUserTreeRef.setCheckedKeys([]);
                }
            });
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            this.isView = true;
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

                this.form = response.data;
                this.form.timePeriod = [this.form.startTime, this.form.endTime];

                // 加载主办部门人员
                if (this.form.firstBusinessUnit) {
                    this.handleMainDeptChange(this.form.firstBusinessUnit);
                }

                // 加载协办部门人员
                if (this.form.xbBusinessUnit && this.form.xbBusinessUnit.length > 0) {
                    this.handleAssistDeptChange(this.form.xbBusinessUnit);
                }

                // 加载督办部门人员
                if (this.form.superviseDept) {
                    this.handleSuperviseDeptChange(this.form.superviseDept);
                }

                // 设置抄送领导选中状态（仅在编辑模式下）
                if (!this.isView && this.form.copyLeaderIds) {
                    this.$nextTick(() => {
                        if (this.$refs.deptUserTreeRef) {
                            // 将字符串转为数组
                            this.checkedLeaderIds = this.form.copyLeaderIds.split(',').map(id => 'user_' + id);
                            // 设置选中状态
                            this.$refs.deptUserTreeRef.setCheckedKeys(this.checkedLeaderIds);
                        }
                    });
                }

                // 初始化时间节点（仅在编辑模式下）
                if (!this.isView && this.form.frequency > 1) {
                    // 处理现有的时间节点数据
                    if (this.form.frequencyTimeList) {
                        let timeList = [];

                        // 处理新的数据格式：[{frequencyTime: xxxx}, {frequencyTime: xxxx}, ...]
                        if (Array.isArray(this.form.frequencyTimeList)) {
                            if (this.form.frequencyTimeList.length > 0 && this.form.frequencyTimeList[0].frequencyTime) {
                                // 新格式：数组中每个元素都是对象，包含 frequencyTime 属性
                                timeList = this.form.frequencyTimeList.map(item => this.parseDateTimeString(item.frequencyTime));
                            } else {
                                // 旧格式：直接是时间字符串数组
                                timeList = this.form.frequencyTimeList.map(time => this.parseDateTimeString(time));
                            }
                        } else if (this.form.frequencyTimeList.frequencyTime) {
                            // 更旧的格式：{frequencyTime: [时间数组]}
                            timeList = this.form.frequencyTimeList.frequencyTime.map(time => this.parseDateTimeString(time));
                        }

                        // 初始化时间节点数组
                        this.initializeFrequencyTimeNodes(this.form.frequency - 1);

                        // 设置已有的时间节点
                        for (let i = 0; i < timeList.length && i < this.frequencyTimeNodes.length; i++) {
                            this.frequencyTimeNodes[i].date = timeList[i];
                        }

                        this.updateFrequencyTimeList();
                    } else {
                        this.initializeFrequencyTimeNodes(this.form.frequency - 1);
                    }
                }

                this.open = true;
                this.title = '督办事项信息';
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    // 处理日期范围
                    if (this.form.timePeriod && this.form.timePeriod.length === 2) {
                        this.form.startTime = this.form.timePeriod[0];
                        this.form.endTime = this.form.timePeriod[1];
                    }

                    delete this.form.timePeriod;

                    // 确保copyLeaderIds是字符串格式
                    if (this.form.copyLeaderIds && typeof this.form.copyLeaderIds !== 'string') {
                        this.form.copyLeaderIds = this.form.copyLeaderIds.toString();
                    }

                    // 确保xbBusinessUnit是字符串格式
                    if (this.form.xbBusinessUnit && Array.isArray(this.form.xbBusinessUnit)) {
                        this.form.xbBusinessUnit = this.form.xbBusinessUnit.join(',');
                    }

                    // 处理督办时间节点数据
                    if (this.form.frequency > 1 && this.form.frequencyTimeList && this.form.frequencyTimeList.length > 0) {
                        // 转换为要求的数据格式：[{frequencyTime: xxxx}, {frequencyTime: xxxx}, ...]
                        this.form.frequencyTimeList = this.form.frequencyTimeList.map(time => ({
                            frequencyTime: this.formatDateTimeString(time)
                        }));
                    } else {
                        // 如果频次为1或没有时间节点，清空该字段
                        this.form.frequencyTimeList = null;
                    }

                    if (this.form.id != null) {
                        if (this.form.organizerIds && Array.isArray(this.form.organizerIds)) {
                            this.form.organizerIds = this.form.organizerIds.join(',');
                        }
                        updateSupervise(this.form).then(response => {
                            this.$modal.msgSuccess('修改成功');
                            this.open = false;
                            this.getList();
                            this.reset();

                            // 清空文件上传组件
                            if (this.$refs.materialFileUpload) {
                                this.$refs.materialFileUpload.clearFileList();
                            }
                        });
                    } else {
                        // 删除form中值为null的属性
                        Object.keys(this.form).forEach(key => {
                            if (this.form[key] === null) {
                                delete this.form[key];
                            }
                        });

                        // 将协办人ID数组转换为逗号分隔的字符串
                        if (this.form.organizerIds && Array.isArray(this.form.organizerIds)) {
                            this.form.organizerIds = this.form.organizerIds.join(',');
                        }

                        addSupervise(this.form).then(response => {
                            this.$modal.msgSuccess('新增成功');
                            this.open = false;
                            this.getList();
                            this.reset();

                            // 清空文件上传组件
                            if (this.$refs.materialFileUpload) {
                                this.$refs.materialFileUpload.clearFileList();
                            }
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$modal
                .confirm('是否确认删除督办事项信息编号为"' + ids + '"的数据项？')
                .then(function () {
                    return delSupervise(ids);
                })
                .then(() => {
                    this.getList();
                    this.$modal.msgSuccess('删除成功');
                })
                .catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download(
                'project/supervise/export',
                {
                    ...this.queryParams
                },
                `supervise_${new Date().getTime()}.xlsx`
            );
        },
        // 添加表格行的类名方法
        tableRowClassName({ row }) {
            if (row.urgencyName === '紧急') {
                return 'urgent-row';
            } else if (row.urgencyName === '较急') {
                return 'semi-urgent-row';
            } else if (row.urgencyName === '一般') {
                return 'normal-row';
            }
            return '';
        },
        // 督办背景材料上传成功处理
        handleMaterialFileUploadSuccess(fileList) {
            if (fileList && fileList.length > 0) {
                this.form.materialFile = fileList[0].url;
            }
        },
        // 重新提交表单的督办背景材料上传成功处理
        handleResubmitMaterialFileUploadSuccess(fileList) {
            if (fileList && fileList.length > 0) {
                this.resubmitForm.materialFile = fileList[0].url;
            }
        },
        // 处理抄送领导选择
        handleCopyLeadersCheck() {
            // 获取当前选中的节点
            const checkedNodes = this.$refs.deptUserTreeRef.getCheckedNodes();
            // 过滤出用户节点（有nickName属性的节点）
            const userNodes = checkedNodes.filter(node => node.nickName);
            // 提取用户ID并转换为逗号分隔的字符串
            this.form.copyLeaderIds = userNodes.map(node => node.userId).join(',');
            console.log('选中的抄送领导:', userNodes, this.form.copyLeaderIds);
        },
        // 判断用户是否已被选择
        isUserSelected(userId, currentField) {
            // 如果是当前字段，不禁用
            if (currentField === 'leadLeader' && this.form.leadLeader === userId) {
                return false;
            }
            if (currentField === 'sponsorId' && this.form.sponsorId === userId) {
                return false;
            }
            if (currentField === 'organizerIds' && this.form.organizerIds && this.form.organizerIds.includes(userId)) {
                return false;
            }

            // 检查是否已在其他字段中被选择
            if (this.form.leadLeader === userId) {
                return true;
            }
            if (this.form.sponsorId === userId) {
                return true;
            }
            if (this.form.organizerIds && this.form.organizerIds.includes(userId)) {
                return true;
            }

            return false;
        },
        textViewFile(url) { },
        // 预览文件
        previewFile(filePath) {
            if (!filePath) return;
            const baseUrl = conf.server.baseUrl;
            const fileUrl = encodeURIComponent(baseUrl + filePath);
            const fileName = this.getFileName(filePath);
            const fileExt = fileName.split('.').pop().toLowerCase();

            this.$refs.viewFileRef.openDialog(baseUrl + filePath, fileExt);

            // // 根据文件类型选择不同的预览方式
            // if (this.isImageFile(filePath)) {
            //     window.open(baseUrl + filePath, '_blank');
            // } else if (['pdf'].includes(fileExt)) {
            //     window.open(baseUrl + filePath, '_blank');
            // } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExt)) {
            //     const officeOnlineUrl = `https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`;
            //     window.open(officeOnlineUrl, '_blank');
            // } else {
            //     this.openFileViewerDialog(baseUrl + filePath, fileName, fileExt);
            // }
        },
        // 打开文件预览对话框
        openFileViewerDialog(fileUrl, fileName, fileExt) {
            this.$alert(
                `<div class="file-preview-container">
                    <p>当前文件格式(${fileExt})无法直接预览，请下载后查看。</p>
                    <a href="${fileUrl}" download="${fileName}" class="el-button el-button--primary">
                        <i class="el-icon-download"></i> 下载文件
                    </a>
                </div>`,
                `文件: ${fileName}`,
                {
                    dangerouslyUseHTMLString: true,
                    center: true,
                    confirmButtonText: '关闭'
                }
            );
        },
        // 判断是否为图片文件
        isImageFile(filePath) {
            if (!filePath) return false;
            const ext = filePath.split('.').pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
        },
        // 获取文件名
        getFileName(filePath) {
            if (!filePath) return '未知文件';
            return filePath.split('/').pop();
        },
        // 获取文件下载URL
        getDownloadUrl(filePath) {
            if (!filePath) return '#';
            return this._baseUrl + filePath;
        },
        // 获取短文件名（截断过长的文件名）
        getShortFileName(filePath) {
            if (!filePath) return '未知文件';
            let fileName = filePath.split('/').pop();
            // 如果文件名过长，截断显示
            if (fileName.length > 15) {
                const ext = fileName.split('.').pop();
                const nameWithoutExt = fileName.substring(0, fileName.length - ext.length - 1);
                fileName = nameWithoutExt.substring(0, 12) + '...' + '.' + ext;
            }
            return fileName;
        },
        /** 事项重新提交操作 */
        handleResubmit(row) {
            // 获取完整的事项数据
            getSupervise(row.id).then(response => {
                this.resubmitOpen = true;

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
                } else {
                    response.data.organizerIds = [];
                }

                // 确保frequency是数字类型
                if (response.data.frequency) {
                    response.data.frequency = Number(response.data.frequency);
                } else {
                    response.data.frequency = 1; // 默认值
                }

                // 设置日期范围
                response.data.timePeriod = [response.data.startTime, response.data.endTime];

                // 设置默认审核权为创建人
                response.data.reviewAuthority = 0;

                this.resubmitRules = { ...this.rules };
                // 设置表单数据
                this.resubmitForm = response.data;

                // 加载部门人员数据
                if (this.resubmitForm.superviseDept) {
                    this.handleResubmitSuperviseDeptChange(this.resubmitForm.superviseDept);
                }
                if (this.resubmitForm.firstBusinessUnit) {
                    this.handleResubmitMainDeptChange(this.resubmitForm.firstBusinessUnit);
                }
                if (this.resubmitForm.xbBusinessUnit && this.resubmitForm.xbBusinessUnit.length > 0) {
                    this.handleResubmitAssistDeptChange(this.resubmitForm.xbBusinessUnit);
                }

                // 设置抄送领导选中状态
                if (this.resubmitForm.copyLeaderIds) {
                    this.$nextTick(() => {
                        if (this.$refs.resubmitDeptUserTreeRef) {
                            // 将字符串转为数组
                            this.resubmitCheckedLeaderIds = this.resubmitForm.copyLeaderIds.split(',').map(id => 'user_' + id);
                            // 设置选中状态
                            this.$refs.resubmitDeptUserTreeRef.setCheckedKeys(this.resubmitCheckedLeaderIds);
                        }
                    });
                }

                // 初始化重新提交表单的时间节点
                if (this.resubmitForm.frequency > 1) {
                    // 处理现有的时间节点数据
                    if (this.resubmitForm.frequencyTimeList) {
                        let timeList = [];

                        // 处理新的数据格式：[{frequencyTime: xxxx}, {frequencyTime: xxxx}, ...]
                        if (Array.isArray(this.resubmitForm.frequencyTimeList)) {
                            if (this.resubmitForm.frequencyTimeList.length > 0 && this.resubmitForm.frequencyTimeList[0].frequencyTime) {
                                // 新格式：数组中每个元素都是对象，包含 frequencyTime 属性
                                timeList = this.resubmitForm.frequencyTimeList.map(item => this.parseDateTimeString(item.frequencyTime));
                            } else {
                                // 旧格式：直接是时间字符串数组
                                timeList = this.resubmitForm.frequencyTimeList.map(time => this.parseDateTimeString(time));
                            }
                        } else if (this.resubmitForm.frequencyTimeList.frequencyTime) {
                            // 更旧的格式：{frequencyTime: [时间数组]}
                            timeList = this.resubmitForm.frequencyTimeList.frequencyTime.map(time => this.parseDateTimeString(time));
                        }

                        // 初始化时间节点数组
                        this.initializeResubmitFrequencyTimeNodes(this.resubmitForm.frequency - 1);

                        // 设置已有的时间节点
                        for (let i = 0; i < timeList.length && i < this.resubmitFrequencyTimeNodes.length; i++) {
                            this.resubmitFrequencyTimeNodes[i].date = timeList[i];
                        }

                        this.updateResubmitFrequencyTimeList();
                    } else {
                        this.initializeResubmitFrequencyTimeNodes(this.resubmitForm.frequency - 1);
                    }
                }
            });
        },
        /** 事项作废操作 */
        handleAbolish(row) {
            this.$modal
                .confirm('确定要作废该事项吗？作废后将无法恢复！')
                .then(() => {
                    // const superviseId = row.id;
                    abolishSupervise(row).then(response => {
                        this.$modal.msgSuccess('事项作废成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        handleResubmitSuperviseDeptChange(deptId) {
            if (!deptId) {
                this.resubmitSuperviseDeptUserList = [];
                return;
            }
            listPerson({ deptId: deptId }).then(response => {
                this.resubmitSuperviseDeptUserList = response.data;
                // 如果当前选中的督办人不在新的部门人员列表中，则清空督办人选择
                if (this.resubmitForm.leadLeader && !this.resubmitSuperviseDeptUserList.some(user => user.userId === this.resubmitForm.leadLeader)) {
                    this.resubmitForm.leadLeader = null;
                }
            });
        },
        handleResubmitMainDeptChange(deptId) {
            if (!deptId) {
                this.resubmitMainDeptUserList = [];
                return;
            }
            listPerson({ deptId: deptId }).then(response => {
                this.resubmitMainDeptUserList = response.data;
                // 如果当前选中的主办人不在新的部门人员列表中，则清空主办人选择
                if (this.resubmitForm.sponsorId && !this.resubmitMainDeptUserList.some(user => user.userId === this.resubmitForm.sponsorId)) {
                    this.resubmitForm.sponsorId = null;
                }
            });
        },
        handleResubmitAssistDeptChange(deptIds) {
            if (!deptIds || deptIds.length === 0) {
                this.resubmitAssistDeptUserList = [];
                this.resubmitForm.organizerIds = [];
                return;
            }

            // 使用Promise.all同时请求所有部门的人员
            const promises = deptIds.map(deptId => {
                return listPerson({ deptId: deptId });
            });

            Promise.all(promises).then(responses => {
                // 合并所有部门的人员列表
                this.resubmitAssistDeptUserList = [];
                responses.forEach(response => {
                    if (response && response.data) {
                        this.resubmitAssistDeptUserList = [...this.resubmitAssistDeptUserList, ...response.data];
                    }
                });

                // 移除重复的人员（基于userId）
                this.resubmitAssistDeptUserList = this.removeDuplicateUsers(this.resubmitAssistDeptUserList);

                // 过滤掉不在新部门的人员
                if (this.resubmitForm.organizerIds && this.resubmitForm.organizerIds.length > 0) {
                    // 检查是否有'all'值，如果有则移除
                    if (this.resubmitForm.organizerIds.includes('all')) {
                        const index = this.resubmitForm.organizerIds.indexOf('all');
                        this.resubmitForm.organizerIds.splice(index, 1);
                    }
                    // 过滤掉不在新部门的人员ID
                    this.resubmitForm.organizerIds = this.resubmitForm.organizerIds.filter(id => this.resubmitAssistDeptUserList.some(user => user.userId === id));
                }
            });
        },
        handleResubmitCopyLeadersCheck() {
            // 获取当前选中的节点
            const checkedNodes = this.$refs.resubmitDeptUserTreeRef.getCheckedNodes();
            // 过滤出用户节点（有nickName属性的节点）
            const userNodes = checkedNodes.filter(node => node.nickName);
            // 提取用户ID并转换为逗号分隔的字符串
            this.resubmitForm.copyLeaderIds = userNodes.map(node => node.userId).join(',');
            console.log('选中的抄送领导:', userNodes, this.resubmitForm.copyLeaderIds);
        },
        resubmitSelectAllAssistUsers() {
            // 如果已经有'all'值，则移除它
            if (this.resubmitForm.organizerIds && this.resubmitForm.organizerIds.includes('all')) {
                const index = this.resubmitForm.organizerIds.indexOf('all');
                this.resubmitForm.organizerIds.splice(index, 1);
            }

            // 将所有协办部门人员ID添加到选中列表，排除已被选为督办人或主办人的用户
            this.resubmitForm.organizerIds = this.resubmitAssistDeptUserList
                .filter(user => user.userId !== this.resubmitForm.leadLeader && user.userId !== this.resubmitForm.sponsorId)
                .map(user => user.userId);
        },
        submitResubmitForm() {
            this.$refs['resubmitForm'].validate(valid => {
                if (valid) {
                    // 处理日期范围
                    if (this.resubmitForm.timePeriod && this.resubmitForm.timePeriod.length === 2) {
                        this.resubmitForm.startTime = this.resubmitForm.timePeriod[0];
                        this.resubmitForm.endTime = this.resubmitForm.timePeriod[1];
                    }

                    // 创建一个提交用的表单数据对象，避免直接修改 resubmitForm
                    const submitData = { ...this.resubmitForm };
                    delete submitData.timePeriod;

                    // 确保copyLeaderIds是字符串格式
                    if (submitData.copyLeaderIds && typeof submitData.copyLeaderIds !== 'string') {
                        submitData.copyLeaderIds = submitData.copyLeaderIds.toString();
                    }

                    // 确保xbBusinessUnit是字符串格式
                    if (submitData.xbBusinessUnit && Array.isArray(submitData.xbBusinessUnit)) {
                        submitData.xbBusinessUnit = submitData.xbBusinessUnit.join(',');
                    }

                    // 将协办人ID数组转换为逗号分隔的字符串
                    if (submitData.organizerIds && Array.isArray(submitData.organizerIds)) {
                        // 检查是否有'all'值，如果有则移除
                        if (submitData.organizerIds.includes('all')) {
                            const index = submitData.organizerIds.indexOf('all');
                            submitData.organizerIds.splice(index, 1);
                        }
                        submitData.organizerIds = submitData.organizerIds.join(',');
                    }

                    // 处理督办时间节点数据
                    if (submitData.frequency > 1 && submitData.frequencyTimeList && submitData.frequencyTimeList.length > 0) {
                        // 转换为要求的数据格式：[{frequencyTime: xxxx}, {frequencyTime: xxxx}, ...]
                        submitData.frequencyTimeList = submitData.frequencyTimeList.map(time => ({
                            frequencyTime: this.formatDateTimeString(time)
                        }));
                    } else {
                        // 如果频次为1或没有时间节点，清空该字段
                        submitData.frequencyTimeList = null;
                    }

                    this.$modal
                        .confirm('确定要修改事项并重新提交吗？')
                        .then(() => {
                            resubmitSupervise(submitData).then(response => {
                                this.$modal.msgSuccess('修改成功');
                                this.resubmitOpen = false;
                                this.getList();

                                // 清空文件上传组件
                                if (this.$refs.resubmitMaterialFileUpload) {
                                    this.$refs.resubmitMaterialFileUpload.clearFileList();
                                }
                            });
                        })
                        .catch(() => { });
                }
            });
        },
        cancelResubmit() {
            this.resubmitOpen = false;
            this.resubmitFrequencyTimeNodes = [];
        },
        /** 事项撤回修改操作 */
        handleWithdraw(row) {
            this.$modal
                .confirm('确定要撤回该事项进行修改吗？')
                .then(() => {
                    withdrawSupervise(row).then(response => {
                        this.$modal.msgSuccess('撤回修改成功');
                        this.getList();
                    });
                })
                .catch(() => { });
        },
        // 处理下拉菜单命令
        handleCommand(command) {
            const { type, row } = command;
            switch (type) {
                case 'detail':
                    this.handleUpdate(row);
                    break;
                case 'progress':
                    this.handleView(row);
                    break;
                case 'resubmit':
                    this.handleResubmit(row);
                    break;
                case 'abolish':
                    this.handleAbolish(row);
                    break;
                case 'downloadMaterial':
                    this.handleDownloadRowMaterial(row);
                    break;
                default:
                    break;
            }
        },
        // 处理表格行点击事件
        handleRowClick(row) {
            this.handleView(row);
        },

        /** 一键下载所有附件 */
        downloadAllAttachments() {
            if (!this.scheduleData || this.scheduleData.length === 0) {
                this.$modal.msgWarning('没有找到附件');
                return;
            }

            // 收集所有附件URL
            const attachmentUrls = this.collectAllAttachmentUrls();

            if (attachmentUrls.length === 0) {
                this.$modal.msgWarning('没有找到附件');
                return;
            }

            this.$modal.confirm(`共找到 ${attachmentUrls.length} 个附件，确定要全部下载吗？`)
                .then(async () => {
                    this.downloadingAttachments = true;
                    await this.batchDownloadFiles(attachmentUrls);
                })
                .catch(() => { });
        },

        /** 收集所有附件URL */
        collectAllAttachmentUrls() {
            const urls = [];

            if (this.scheduleData && this.scheduleData.length > 0) {
                this.scheduleData.forEach(item => {
                    if (item.url && item.url.trim() !== '') {
                        // 处理多个文件的情况（逗号分隔）
                        if (item.url.includes(',')) {
                            const fileUrls = item.url.split(',').map(url => url.trim()).filter(url => url !== '');
                            urls.push(...fileUrls);
                        } else {
                            urls.push(item.url.trim());
                        }
                    }
                });
            }

            // 去重
            return [...new Set(urls)];
        },

        /** 批量下载文件 */
        async batchDownloadFiles(urls) {
            let downloadCount = 0;
            let successCount = 0;
            const totalCount = urls.length;

            // 显示下载进度提示
            const loadingInstance = this.$loading({
                lock: true,
                text: `正在下载附件... (0/${totalCount})`,
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            // 批量下载，每次下载间隔一定时间，避免浏览器阻止
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];

                try {
                    // 等待下载完成
                    await this.downloadSingleFile(url);
                    successCount++;
                } catch (error) {
                    console.error(`下载文件失败: ${url}`, error);
                }

                downloadCount++;

                // 更新进度提示
                loadingInstance.text = `正在下载附件... (${downloadCount}/${totalCount})`;

                // 下载间隔，避免浏览器阻止
                if (i < urls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            // 所有文件下载完成
            setTimeout(() => {
                loadingInstance.close();
                this.downloadingAttachments = false;

                if (successCount === totalCount) {
                    this.$modal.msgSuccess(`成功下载 ${totalCount} 个附件`);
                } else {
                    this.$modal.msgWarning(`下载完成，成功 ${successCount} 个，失败 ${totalCount - successCount} 个`);
                }
            }, 500);
        },

        /** 
 * 下载单个文件
 * 使用fetch + blob方式强制下载，解决PDF等文件在浏览器中预览而不下载的问题
 */
        async downloadSingleFile(filePath) {
            if (!filePath) return;

            try {
                const downloadUrl = this.getDownloadUrl(filePath);
                const fileName = this.getFileName(filePath);

                // 使用fetch API强制下载文件，避免PDF、图片等文件在浏览器中打开而不下载
                const response = await fetch(downloadUrl, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();

                // 如果响应中有Content-Disposition header，尝试从中获取文件名
                const contentDisposition = response.headers.get('Content-Disposition');
                let actualFileName = fileName;
                if (contentDisposition && contentDisposition.includes('filename=')) {
                    const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (fileNameMatch) {
                        actualFileName = fileNameMatch[1].replace(/['"]/g, '');
                    }
                }

                // 创建blob URL
                const blobUrl = URL.createObjectURL(blob);

                // 创建临时下载链接
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = actualFileName;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 清理blob URL
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error('下载文件失败:', error, filePath);
                // 如果fetch失败，回退到传统下载方式
                this.fallbackDownload(filePath);
            }
        },

        /** 回退下载方式 */
        fallbackDownload(filePath) {
            try {
                const downloadUrl = this.getDownloadUrl(filePath);
                const fileName = this.getFileName(filePath);

                // 传统下载方式作为备选方案
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fileName;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('回退下载也失败:', error);
                this.$modal.msgError(`文件下载失败: ${this.getFileName(filePath)}`);
            }
        },

        /** 下载表单中的所有背景材料文件 */
        downloadFormMaterialFiles() {
            if (!this.form.materialFile) {
                this.$modal.msgWarning('没有找到背景材料文件');
                return;
            }

            const fileUrls = this.form.materialFile.split(',').map(url => url.trim()).filter(url => url !== '');

            if (fileUrls.length === 0) {
                this.$modal.msgWarning('没有找到有效的背景材料文件');
                return;
            }

            this.$modal.confirm(`共找到 ${fileUrls.length} 个背景材料文件，确定要全部下载吗？`)
                .then(async () => {
                    await this.batchDownloadFiles(fileUrls);
                })
                .catch(() => { });
        },

        /** 下载重新提交表单中的所有背景材料文件 */
        downloadResubmitMaterialFiles() {
            if (!this.resubmitForm.materialFile) {
                this.$modal.msgWarning('没有找到背景材料文件');
                return;
            }

            const fileUrls = this.resubmitForm.materialFile.split(',').map(url => url.trim()).filter(url => url !== '');

            if (fileUrls.length === 0) {
                this.$modal.msgWarning('没有找到有效的背景材料文件');
                return;
            }

            this.$modal.confirm(`共找到 ${fileUrls.length} 个背景材料文件，确定要全部下载吗？`)
                .then(async () => {
                    await this.batchDownloadFiles(fileUrls);
                })
                .catch(() => { });
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
                this.downloadSingleFile(fileUrls[0]);
            } else {
                // 多个文件，询问是否全部下载
                this.$modal.confirm(`该事项共有 ${fileUrls.length} 个背景材料文件，确定要全部下载吗？`)
                    .then(async () => {
                        await this.batchDownloadFiles(fileUrls);
                    })
                    .catch(() => { });
            }
        },

        /** 初始化列设置 */
        initColumnSettings() {
            // 保存原始列顺序
            this.originalColumnOrder = JSON.parse(JSON.stringify(this.allColumns));

            // 从localStorage加载用户自定义设置
            const savedSettings = localStorage.getItem('supervise-column-settings');
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    this.allColumns = settings;
                } catch (error) {
                    console.error('加载列设置失败:', error);
                }
            }
        },

        /** 打开列设置对话框 */
        handleColumnSetting() {
            this.columnSettingVisible = true;
            this.$nextTick(() => {
                this.initSortable();
            });
        },

        /** 初始化拖拽排序 */
        initSortable() {
            const el = this.$refs.columnList;
            if (!el) return;

            // 使用简单的拖拽实现，不依赖外部库
            this.makeDraggable();
        },

        /** 简单拖拽实现 */
        makeDraggable() {
            const container = this.$refs.columnList;
            if (!container) return;

            let draggedElement = null;
            let draggedIndex = null;

            container.addEventListener('dragstart', (e) => {
                if (e.target.closest('.column-item')) {
                    draggedElement = e.target.closest('.column-item');
                    draggedIndex = Array.from(container.children).indexOf(draggedElement);
                    draggedElement.style.opacity = '0.5';
                }
            });

            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            });

            container.addEventListener('dragend', (e) => {
                if (draggedElement) {
                    draggedElement.style.opacity = '';
                    const newIndex = Array.from(container.children).indexOf(draggedElement);

                    if (draggedIndex !== newIndex) {
                        // 更新数据
                        const movedItem = this.allColumns.splice(draggedIndex, 1)[0];
                        this.allColumns.splice(newIndex, 0, movedItem);
                    }

                    draggedElement = null;
                    draggedIndex = null;
                }
            });

            // 为每个拖拽项添加可拖拽属性
            this.$nextTick(() => {
                const items = container.querySelectorAll('.column-item');
                items.forEach(item => {
                    item.draggable = true;
                });
            });
        },

        /** 获取拖拽后的位置 */
        getDragAfterElement(container, y) {
            const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];

            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        },

        /** 处理列可见性变化 */
        handleColumnVisibleChange() {
            // 确保操作列始终可见
            const actionsColumn = this.allColumns.find(col => col.key === 'actions');
            if (actionsColumn && !actionsColumn.visible) {
                actionsColumn.visible = true;
                this.$message.warning('操作列不能隐藏');
            }

            // 确保至少有一列可见
            const visibleCount = this.allColumns.filter(col => col.visible).length;
            if (visibleCount === 0) {
                this.allColumns[0].visible = true;
                this.$message.warning('至少需要显示一列');
            }
        },

        /** 重置列顺序 */
        resetColumnOrder() {
            this.$confirm('确定要恢复默认的列设置吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.allColumns = JSON.parse(JSON.stringify(this.originalColumnOrder));
                this.$message.success('已恢复默认设置');
            }).catch(() => { });
        },

        /** 全选列 */
        selectAllColumns() {
            this.allColumns.forEach(column => {
                column.visible = true;
            });
            this.$message.success('已全选所有列');
        },

        /** 全不选列 */
        clearAllColumns() {
            this.allColumns.forEach(column => {
                if (column.key !== 'actions') { // 操作列不能隐藏
                    column.visible = false;
                }
            });
            // 确保序号列可见
            const indexColumn = this.allColumns.find(col => col.key === 'index');
            if (indexColumn) {
                indexColumn.visible = true;
            }
            this.$message.success('已取消选择（保留序号和操作列）');
        },

        /** 保存列设置 */
        saveColumnSetting() {
            try {
                localStorage.setItem('supervise-column-settings', JSON.stringify(this.allColumns));
                this.columnSettingVisible = false;
                this.$message.success('列设置已保存');
            } catch (error) {
                console.error('保存列设置失败:', error);
                this.$message.error('保存失败');
            }
        },

        /** 取消列设置 */
        cancelColumnSetting() {
            // 恢复到打开对话框前的状态
            this.initColumnSettings();
            this.columnSettingVisible = false;
        },

        /** 督办频次变化处理 */
        handleFrequencyChange(value) {
            if (value && value > 1) {
                // 初始化时间节点数组
                this.initializeFrequencyTimeNodes(value - 1);
            } else {
                this.frequencyTimeNodes = [];
                this.form.frequencyTimeList = [];
            }
        },

        /** 督办日期范围变化处理 */
        handleTimePeriodChange(value) {
            if (value && value.length === 2 && this.form.frequency > 1) {
                // 重新初始化时间节点，清空已选择的中间时间
                this.initializeFrequencyTimeNodes(this.form.frequency - 1);
            }
        },

        /** 初始化时间节点数组 */
        initializeFrequencyTimeNodes(count) {
            this.frequencyTimeNodes = [];
            for (let i = 0; i < count; i++) {
                this.frequencyTimeNodes.push({
                    date: null
                });
            }
            this.updateFrequencyTimeList();
        },

        /** 时间节点选择变化处理 */
        handleTimeNodeChange(index, date) {
            this.frequencyTimeNodes[index].date = date;
            this.updateFrequencyTimeList();
            // 触发表单验证
            this.$nextTick(() => {
                this.$refs.form.validateField('frequencyTimeList');
            });
        },

        /** 更新frequencyTimeList */
        updateFrequencyTimeList() {
            this.form.frequencyTimeList = this.frequencyTimeNodes
                .map(node => node.date)
                .filter(date => date !== null);
        },

        /** 获取时间节点选择器的配置选项 */
        getTimeNodePickerOptions(index) {
            if (!this.form.timePeriod || this.form.timePeriod.length !== 2) {
                return {
                    disabledDate: () => true // 如果没有选择督办日期范围，禁用所有日期
                };
            }

            const startDate = new Date(this.form.timePeriod[0]);
            const endDate = new Date(this.form.timePeriod[1]);

            return {
                disabledDate: (time) => {
                    // 不能选择督办日期范围之外的日期
                    if (time.getTime() <= startDate.getTime() || time.getTime() >= endDate.getTime()) {
                        return true;
                    }

                    // 检查是否与其他已选择的时间节点冲突
                    for (let i = 0; i < this.frequencyTimeNodes.length; i++) {
                        if (i !== index && this.frequencyTimeNodes[i].date) {
                            const selectedDate = new Date(this.frequencyTimeNodes[i].date);
                            if (Math.abs(time.getTime() - selectedDate.getTime()) < 24 * 60 * 60 * 1000) {
                                return true; // 不能选择相同的日期
                            }
                        }
                }

                    return false;
                }
            };
        },

        /** 验证督办时间节点 */
        validateFrequencyTimeList(rule, value, callback) {
            const form = this.resubmitOpen ? this.resubmitForm : this.form;
            if (form.frequency <= 1) {
                // 如果督办频次为1，不需要验证时间节点
                callback();
                return;
            }

            if (!form.timePeriod || form.timePeriod.length !== 2) {
                callback(new Error('请先选择督办日期范围'));
                return;
            }

            const requiredCount = form.frequency - 1;
            const selectedCount = form.frequencyTimeList ? form.frequencyTimeList.length : 0;

            if (selectedCount < requiredCount) {
                callback(new Error(`督办频次为${form.frequency}，需要选择${requiredCount}个中间时间节点，当前只选择了${selectedCount}个`));
                return;
            }

            // 验证时间节点的顺序是否正确
            const allTimes = [form.timePeriod[0], ...form.frequencyTimeList, form.timePeriod[1]];
            for (let i = 1; i < allTimes.length; i++) {
                if (new Date(allTimes[i]) <= new Date(allTimes[i - 1])) {
                    callback(new Error('时间节点顺序不正确，请确保时间节点按时间先后顺序排列'));
                    return;
                }
            }

            callback();
        },

        /** 重新提交表单的督办频次变化处理 */
        handleResubmitFrequencyChange(value) {
            if (value && value > 1) {
                this.initializeResubmitFrequencyTimeNodes(value - 1);
            } else {
                this.resubmitFrequencyTimeNodes = [];
                this.resubmitForm.frequencyTimeList = [];
            }
        },

        /** 重新提交表单的督办日期范围变化处理 */
        handleResubmitTimePeriodChange(value) {
            if (value && value.length === 2 && this.resubmitForm.frequency > 1) {
                this.initializeResubmitFrequencyTimeNodes(this.resubmitForm.frequency - 1);
            }
        },

        /** 初始化重新提交表单的时间节点数组 */
        initializeResubmitFrequencyTimeNodes(count) {
            this.resubmitFrequencyTimeNodes = [];
            for (let i = 0; i < count; i++) {
                this.resubmitFrequencyTimeNodes.push({
                    date: null
                });
            }
            this.updateResubmitFrequencyTimeList();
        },

        /** 重新提交表单的时间节点选择变化处理 */
        handleResubmitTimeNodeChange(index, date) {
            this.resubmitFrequencyTimeNodes[index].date = date;
            this.updateResubmitFrequencyTimeList();
            // 触发表单验证
            this.$nextTick(() => {
                this.$refs.resubmitForm.validateField('frequencyTimeList');
            });
        },

        /** 更新重新提交表单的frequencyTimeList */
        updateResubmitFrequencyTimeList() {
            this.resubmitForm.frequencyTimeList = this.resubmitFrequencyTimeNodes
                .map(node => node.date)
                .filter(date => date !== null);
        },

        /** 获取重新提交表单时间节点选择器的配置选项 */
        getResubmitTimeNodePickerOptions(index) {
            if (!this.resubmitForm.timePeriod || this.resubmitForm.timePeriod.length !== 2) {
                return {
                    disabledDate: () => true
                };
            }

            const startDate = new Date(this.resubmitForm.timePeriod[0]);
            const endDate = new Date(this.resubmitForm.timePeriod[1]);

            return {
                disabledDate: (time) => {
                    if (time.getTime() <= startDate.getTime() || time.getTime() >= endDate.getTime()) {
                        return true;
                    }

                    for (let i = 0; i < this.resubmitFrequencyTimeNodes.length; i++) {
                        if (i !== index && this.resubmitFrequencyTimeNodes[i].date) {
                            const selectedDate = new Date(this.resubmitFrequencyTimeNodes[i].date);
                            if (Math.abs(time.getTime() - selectedDate.getTime()) < 24 * 60 * 60 * 1000) {
                                return true;
                            }
                        }
                    }

                    return false;
                }
            };
        },

        /** 获取查看模式下的时间节点列表 */
        getViewFrequencyTimeList() {
            if (!this.form.frequencyTimeList) {
                return [];
            }

            let timeList = [];

            // 处理新的数据格式：[{frequencyTime: xxxx}, {frequencyTime: xxxx}, ...]
            if (Array.isArray(this.form.frequencyTimeList)) {
                if (this.form.frequencyTimeList.length > 0 && this.form.frequencyTimeList[0].frequencyTime) {
                    // 新格式：数组中每个元素都是对象，包含 frequencyTime 属性
                    timeList = this.form.frequencyTimeList.map(item => this.parseDateTimeString(item.frequencyTime));
                } else {
                    // 旧格式：直接是时间字符串数组
                    timeList = this.form.frequencyTimeList.map(time => this.parseDateTimeString(time));
                }
            } else if (this.form.frequencyTimeList.frequencyTime) {
                // 更旧的格式：{frequencyTime: [时间数组]}
                timeList = this.form.frequencyTimeList.frequencyTime.map(time => this.parseDateTimeString(time));
            }

            return timeList;
        },

        /** 将日期字符串格式化为 ISO 格式 (YYYY-MM-DDTHH:mm:ss) */
        formatDateTimeString(dateStr) {
            if (!dateStr) return '';

            // 如果已经是 ISO 格式，直接返回
            if (dateStr.includes('T')) {
                return dateStr;
            }

            // 将 YYYY-MM-DD 格式转换为 YYYY-MM-DDTHH:mm:ss 格式
            return dateStr + 'T00:00:00';
        },

        /** 将 ISO 格式日期字符串解析为显示格式 (YYYY-MM-DD) */
        parseDateTimeString(dateTimeStr) {
            if (!dateTimeStr) return '';
            // 如果是 ISO 格式，提取日期部分
            if (dateTimeStr.includes('T')) {
                return dateTimeStr.split('T')[0];
            }
            // 如果是 yyyy-mm-dd HH:mm:ss 格式
            if (dateTimeStr.includes(' ')) {
                return dateTimeStr.split(' ')[0];
            }
            // 如果已经是 yyyy-mm-dd 格式，直接返回
            return dateTimeStr;
        }
    },
    watch: {
        // 监听督办部门选择器
        'form.superviseDept': {
            handler(newVal) {
                if (newVal && this.$refs.superviseDeptCascader) {
                    // 关闭级联选择器下拉菜单
                    this.$refs.superviseDeptCascader.toggleDropDownVisible(false);
                }
            }
        },
        // 监听主办部门选择器
        'form.firstBusinessUnit': {
            handler(newVal) {
                if (newVal && this.$refs.mainDeptCascader) {
                    // 关闭级联选择器下拉菜单
                    this.$refs.mainDeptCascader.toggleDropDownVisible(false);
                }
            }
        }
        // 监听协办部门选择器
        // 'form.xbBusinessUnit': {
        //     handler(newVal) {
        //         if (newVal && this.$refs.assistDeptCascader) {
        //             // 关闭级联选择器下拉菜单
        //             this.$refs.assistDeptCascader.toggleDropDownVisible(false);
        //         }
        //     }
        // }
    }
};
</script>

<style scoped>
.content ::v-deep p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}
</style>

<style scoped>
.urgent-row {
    color: #fa1515 !important;
}

.semi-urgent-row {
    color: #e6a23c !important;
}

.normal-row {
    color: #67c23a !important;
}

.content ::v-deep p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

/* 确保表单项标签和内容在同一行 */
.form-item-nowrap {
    display: flex !important;
    align-items: center !important;
}

.form-item-nowrap ::v-deep .el-form-item__label {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    padding-right: 5px !important;
    width: auto !important;
    flex-shrink: 0 !important;
}

.form-item-nowrap ::v-deep .el-form-item__content {
    flex: 1 !important;
    margin-left: 0 !important;
    overflow: hidden !important;
}

/* 针对1200px-1540px宽度范围的特殊处理 */
@media screen and (min-width: 1200px) and (max-width: 1540px) {
    .form-item-nowrap ::v-deep .el-form-item__label {
        font-size: 12px !important;
    }

    .el-input,
    .el-select {
        width: 100% !important;
    }

    .el-form-item {
        margin-bottom: 10px !important;
        margin-right: 0 !important;
    }
}

/* 下拉菜单样式 */
.el-dropdown-link {
    cursor: pointer;
    color: #409eff;
    font-size: 16px;
    padding: 5px;
    border-radius: 3px;
    transition: all 0.3s;
}

.el-dropdown-link:hover {
    background-color: #f5f7fa;
    color: #66b1ff;
}

/* 列设置样式 */
.column-setting-container {
    max-height: 500px;
    overflow-y: auto;
}

.setting-header {
    margin-bottom: 15px;
    text-align: center;
}

.setting-header .el-button {
    margin: 0 5px;
}

.column-list {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
}

.column-item {
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s;
    cursor: move;
}

.column-item:last-child {
    border-bottom: none;
}

.column-item:hover {
    background-color: #f5f7fa;
}

.column-item.disabled {
    opacity: 0.5;
}

.column-item-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.drag-handle {
    cursor: move;
    color: #909399;
    font-size: 16px;
}

.drag-handle:hover {
    color: #409eff;
}

.column-info {
    margin-left: auto;
    font-size: 12px;
    color: #909399;
}

.setting-tip {
    margin-top: 15px;
    padding: 10px;
    background-color: #f0f9ff;
    border-radius: 4px;
    font-size: 13px;
    color: #0066cc;
    display: flex;
    align-items: center;
    gap: 5px;
}

/* 督办时间节点样式 */
.frequency-time-container {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    background-color: #fafafa;
}

.frequency-time-info {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f0f9ff;
    border-radius: 4px;
    font-size: 14px;
}

.frequency-time-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.time-node {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 4px;
    gap: 15px;
    min-height: 50px;
}

.time-node .node-label {
    font-weight: 500;
    min-width: 80px;
    font-size: 14px;
}

.time-node .node-date {
    flex: 1;
    color: #606266;
    font-size: 14px;
}

/* 起始时间节点样式（红色） */
.time-node.start-node,
.time-node.end-node {
    background-color: #fef0f0;
    border: 1px solid #fbc4c4;
}

.time-node.start-node .node-label,
.time-node.end-node .node-label {
    color: #ff4d4f;
}

.time-node.start-node .node-date,
.time-node.end-node .node-date {
    color: #ff4d4f;
    font-weight: 500;
}

/* 中间时间节点样式（绿色） */
.time-node.middle-node {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
}

.time-node.middle-node .node-label {
    color: #52c41a;
}

/* 查看模式下的时间节点样式 */
.view-frequency-time-list {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
    background-color: #fafafa;
}

.view-frequency-time-list .time-node {
    margin-bottom: 8px;
}

.view-frequency-time-list .time-node:last-child {
    margin-bottom: 0;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
    .frequency-time-list {
        gap: 8px;
    }

    .time-node {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
    }

    .time-node .node-label {
        min-width: auto;
    }
}

/* 拖拽排序样式 */
.sortable-ghost {
    opacity: 0.8;
    background-color: #409eff;
    color: white;
}

.sortable-chosen {
    background-color: #ecf5ff;
}
</style>
