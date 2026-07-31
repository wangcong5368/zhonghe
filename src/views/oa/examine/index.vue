<template>
    <div class="app-container">
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="info" plain icon="el-icon-setting" size="mini" @click="handleColumnSetting">
                    列设置
                </el-button>
            </el-col>
            <right-toolbar @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="myExamineList" @selection-change="handleSelectionChange"
            :row-class-name="tableRowClassName" @row-click="handleRowClick"
            ref="examineTable">

            <!-- 动态生成表格列 -->
            <template v-for="column in visibleColumns">
                <!-- 序号列 -->
                <el-table-column v-if="column.key === 'index'" type="index" :label="column.label" :width="column.width"
                    align="center" :key="'index-' + column.key" />

                <!-- 事项名称列（特殊处理） -->
                <el-table-column v-else-if="column.key === 'name'" :label="column.label" align="center"
                    :prop="column.prop" :width="column.width" :key="'name-' + column.key">
                    <template slot-scope="scope">
                        <div style="max-height: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
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
                        <el-tag :type="scope.row.overdue == 1 ? 'danger' : ''">
                            {{ scope.row.overdue == 1 ? '超期' : '正常' }}
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
                                <!-- 审核事项按钮，仅在特定条件下显示 -->
                                <el-dropdown-item :command="{ type: 'examine', row: scope.row }"
                                    v-if="scope.row.checkStatus === 1">
                                    <i class="el-icon-tickets"></i> 审核事项
                                </el-dropdown-item>

                                <!-- 查看详情按钮 -->
                                <el-dropdown-item :command="{ type: 'detail', row: scope.row }">
                                    <i class="el-icon-view"></i> 详情
                                </el-dropdown-item>

                                <!-- 下载背景材料按钮，仅在有背景材料时显示 -->
                                <el-dropdown-item :command="{ type: 'downloadMaterial', row: scope.row }"
                                    v-if="scope.row.materialFile">
                                    <i class="el-icon-download"></i> 下载背景材料
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

        <!--查看事项进度信息对话框 -->
        <el-dialog :title="viewTitle" :visible.sync="viewOpen" width="900px" append-to-body
            :close-on-click-modal="false">
            <el-timeline>
                <el-timeline-item v-for="(item, index) in scheduleData" :key="index" placement="top"
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
                <el-button type="warning" @click="downloadAllAttachments" v-if="hasAttachments" :loading="downloadingAttachments">
                    <i class="el-icon-download"></i>
                    {{ downloadingAttachments ? '下载中...' : '一键下载所有附件' }}
                </el-button>
                <el-button type="primary" @click="hanldeExamine">审核事项</el-button>
                <el-button type="primary" @click="() => (viewOpen = false)">关闭</el-button>
            </div>
        </el-dialog>

        <!-- 事项审核dialog -->
        <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="审核结果" prop="status">
                    <el-radio v-model="form.status" :label="1">通过</el-radio>
                    <el-radio v-model="form.status" :label="2">拒绝</el-radio>
                </el-form-item>
                <el-form-item label="审核意见" prop="remark">
                    <!-- <editor v-model="form.remark" :min-height="192" /> -->
                    <el-input type="textarea" v-model="form.remark" :rows="3" />
                    <quick-reply :onSelect="handleSelectPhrase" :superviseId="currentSuperviseId"></quick-reply>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">提交</el-button>
                <el-button type="primary" @click="() => (open = false)">关闭</el-button>
            </div>
        </el-dialog>

        <!-- 查看督办事项信息对话框 -->
        <el-dialog :title="'查看督办事项信息'" :visible.sync="detailViewOpen" width="900px" append-to-body
            :close-on-click-modal="false">
            <el-form label-width="130px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="事项编号" prop="code">
                            <el-input v-model="form.code" placeholder="无" :disabled="true" 
                                maxlength="50"></el-input>
                        </el-form-item>
                    </el-col>

                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="事项来源" prop="source">
                            <!-- <el-input v-model="form.source" placeholder="请输入事项来源" /> -->
                            <el-select v-model="form.source" placeholder="无" :disabled="true">
                                <el-option v-for="item in sourceList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="业务分类" prop="source">
                            <el-select v-model="form.type" placeholder="无" :disabled="true">
                                <el-option v-for="item in typeList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="8">
                        <el-form-item label="紧急程度" prop="urgency">
                            <el-select v-model="form.urgency" placeholder="无" :disabled="true">
                                <el-option v-for="item in urgencyList" :key="item.dictCode" :label="item.dictLabel"
                                    :value="item.dictValue" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="督办部门" prop="superviseDept">
                            <el-cascader v-model="form.superviseDept" :options="sectionList" :props="deptProps"
                                placeholder="无" :disabled="true" clearable
                                @change="handleSuperviseDeptChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="督办人" prop="leadLeader">
                            <el-select v-model="form.leadLeader" placeholder="无" :disabled="true">
                                <el-option v-if="superviseDeptUserList.length === 0" label="请先选择督办部门" value=""
                                    disabled></el-option>
                                <el-option v-for="item in superviseDeptUserList" :key="item.userId"
                                    :label="item.nickName" :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="主办部门" prop="firstBusinessUnit">
                            <el-cascader v-model="form.firstBusinessUnit" :options="sectionList" :props="deptProps"
                                placeholder="无" :disabled="true" clearable @change="handleMainDeptChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="协办部门" prop="xbBusinessUnit">
                            <el-cascader v-model="form.xbBusinessUnit" :options="sectionList"
                                :props="{ ...deptProps, multiple: true }" placeholder="无" :disabled="true" clearable
                                @change="handleAssistDeptChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="主办人" prop="sponsorId">
                            <el-select v-model="form.sponsorId" placeholder="无" :disabled="true">
                                <el-option v-if="mainDeptUserList.length === 0" label="请先选择主办部门" value=""
                                    disabled></el-option>
                                <el-option v-for="item in mainDeptUserList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="协办人" prop="organizerIds">
                            <el-select v-model="form.organizerIds" multiple placeholder="无" :disabled="true">
                                <el-option v-if="assistDeptUserList.length === 0" label="请先选择协办部门" value=""
                                    disabled></el-option>
                                <el-option v-if="assistDeptUserList.length > 0" label="全选该部门人员" :value="'all'"
                                    @click.native="selectAllAssistUsers"></el-option>
                                <el-option v-for="item in assistDeptUserList" :key="item.userId" :label="item.nickName"
                                    :value="item.userId"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="事项名称" prop="name">
                    <el-input v-model="form.name" placeholder="无" :disabled="true"  maxlength="200" />
                </el-form-item>
                <el-form-item label="事项内容" prop="content">
                    <!-- <editor v-if="detailViewOpen" v-model="form.content" :min-height="192" :readOnly="true" :key="true ? 'view-editor' : 'edit-editor'" /> -->
                    <el-input type="textarea" v-model="form.content" :placeholder="'无'" :rows="3" :disabled="true" />
                </el-form-item>

                <!-- 新增字段：督办频次 -->
                <el-form-item label="督办频次" prop="frequency">
                    <el-input v-model="form.frequency" :disabled="true" placeholder="无"></el-input>
                </el-form-item>

                <el-row>
                    <!-- <el-col :span="12">
                        <el-form-item label="督办开始日期" prop="startTime">
                            <el-date-picker clearable v-model="form.startTime" type="date" value-format="yyyy-MM-dd" :disabled="true" placeholder="请选择督办开始日期"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="督办截止日期" prop="endTime">
                            <el-date-picker clearable v-model="form.endTime" type="date" value-format="yyyy-MM-dd" :disabled="true" placeholder="请选择督办截止日期"></el-date-picker>
                        </el-form-item>
                    </el-col> -->
                    <el-col :span="12">
                        <el-form-item label="督办日期" prop="timePeriod">
                            <el-date-picker v-model="timePeriod" type="daterange" range-separator="至"
                                start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"
                                :disabled="true"
                                :picker-options="{ disabledDate: time => time.getTime() < Date.now() - 8.64e7 }"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 新增字段：已办次数 -->
                <el-form-item label="已办次数" prop="processFrequency">
                    <div>
                        {{ form.processFrequency || '无' }}
                    </div>
                </el-form-item>

                <!-- 新增字段：督办背景材料 -->
                <el-form-item label="督办背景材料" prop="materialFile">
                    <div>
                        <div v-if="form.materialFile" class="attachment">
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
                    <div>
                        <el-link v-if="form.materialLink" type="primary" :href="form.materialLink" target="_blank">
                            {{ form.materialLink }}
                        </el-link>
                        <span v-else>无</span>
                    </div>
                </el-form-item>

                <!-- 新增字段：抄送领导 -->
                <el-form-item label="抄送领导" prop="copyLeaderNames">
                    <div>
                        {{ form.copyLeaderNames || '无' }}
                    </div>
                </el-form-item>

                <el-form-item label="审核权" prop="reviewAuthority">
                    <div>
                        {{ form.reviewAuthority === 0 ? '创建人' : (form.reviewAuthority === 1 ? '督办人' : '未设置') }}
                    </div>
                </el-form-item>

                <!-- 新增字段：备注 -->
                <el-form-item label="备注" prop="remark">
                    <el-input type="textarea" v-model="form.remark" :disabled="true" :rows="3" />
                </el-form-item>
            </el-form>
            <h1 style="text-align: center">事项进度</h1>
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
                <el-button type="warning" @click="downloadAllAttachments" v-if="hasAttachments" :loading="downloadingAttachments">
                    <i class="el-icon-download"></i>
                    {{ downloadingAttachments ? '下载中...' : '一键下载所有附件' }}
                </el-button>
                <el-button type="primary" @click="() => (detailViewOpen = false)">关闭</el-button>
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

        <ViewFile ref="viewFileRef" />
    </div>
</template>

<style scope lang="scss">
.urgent-row {
    color: #fa1515 !important;
}

.semi-urgent-row {
    color: #e6a23c !important;
}

.normal-row {
    color: #67c23a !important;
}

.line-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.line {
    flex: 1;
    border-top: 1px solid #6f6f6f;
    /* 设置横线 */
}

.text {
    margin: 0 10px;
    /* 控制文字与横线之间的距离 */
    font-size: 16px;
    /* 设置文字大小 */
}

.text-content {
    padding: 10px 0;
}

.content {
    margin-bottom: 10px;
    line-height: 1.5;
}

.attachment {
    margin-top: 8px;
}

.box-card {
    margin-bottom: 10px;
}

.file-item {
    margin-bottom: 10px;
    display: flex;
    gap: 10px;
}

.file-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.file-preview-container {
    text-align: center;
    padding: 20px;
}
</style>

<script>
import { getSupervise, postCheck, addProcess, addOrganizer, addProcessCompleted, getProgressList, getCheckList } from '@/api/oa/supervise';
import { listDeptTree, getSourceDict, getTypeDict, getUrgencyDict, getDeptUserTree } from '@/api/oa/publicApi';
import { listPerson } from '@/api/oa/affairsApply';
import conf from '@/conf.js'; // 导入配置文件
import ViewFile from '@/components/viewFile';
import QuickReply from '@/components/quickReply/index.vue'

export default {
    name: 'Supervise',
    components: {
        ViewFile,
        QuickReply
    },
    computed: {
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
            timePeriod: null,
            // 主办部门用户列表
            mainDeptUserList: [],
            // 协办部门用户列表
            assistDeptUserList: [],
            // 督办部门用户列表
            superviseDeptUserList: [],
            detailViewOpen: null,
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
            // 查看进度对话框标题
            viewTitle: null,
            // 查看进度对话框是否显示
            viewOpen: false,
            // 进度数据
            scheduleData: [],
            // 是否是主办人
            isMainOrganizer: true,
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
            myExamineList: [],
            // 弹出层标题
            title: '',
            // 是否显示弹出层
            open: false,
            // 查询参数
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
                typeName: null,
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
            form: {
                remark: ""
            },
            // 主办人 or 协办人表单参数
            organizerForm: {},
            // 表单校验
            rules: {
                status: [{ required: true, message: '请选择审核结果', trigger: 'change' }],
                createId: [{ required: true, message: '创建者不能为空', trigger: 'blur' }],
                createTime: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }]
            },
            // 部门与用户树
            deptUserTree: [],
            deptProps: {
                value: 'id',
                label: 'label',
                children: 'children',
                checkStrictly: true,
                emitPath: false
            },
            currentSuperviseId: null,
            // 下载相关
            downloadingAttachments: false,
            _baseUrl: conf.server.baseUrl, // 添加基础URL
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
                { key: 'sponsorName', label: '主办人', width: null, visible: true, prop: 'sponsorName', fixed: false },
                { key: 'endTime', label: '督办截止日期', width: 180, visible: true, prop: 'endTime', fixed: false },
                { key: 'status', label: '督办状态', width: null, visible: true, prop: null, fixed: false },
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
        handleSelectPhrase(phrase) {
            this.form.remark = this.form.remark + phrase
        },
        // 获取部门与用户树
        getDeptUser() {
            getDeptUserTree().then(res => {
                this.deptUserTree = res.data;
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
        handleDetail(row) {
            this.reset();
            const id = row.id || this.ids;
            getProgressList(id).then(response => {
                this.scheduleData = response.data;
            });
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

                this.form = response.data;
                this.timePeriod = [this.form.startTime, this.form.endTime];

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

                console.log(this.form, '详情');
                this.detailViewOpen = true;
            });
        },
        // 事项办结方法
        handleProcessCompleted() {
            addProcessCompleted(this.organizerForm).then(response => {
                this.$modal.msgSuccess('事项办结成功');
                this.open = false;
                this.getList();
            });
        },
        /** 事项转发方法 */
        handleOrganizer() {
            this.organizerForm.organizerIds = this.form.organizerIds;
            if (this.organizerForm.organizerIds && Array.isArray(this.organizerForm.organizerIds)) {
                this.organizerForm.organizerIds = this.organizerForm.organizerIds.join(',');
            }

            addOrganizer(this.organizerForm).then(response => {
                this.$modal.msgSuccess('事项转发成功');
                this.open = false;
                this.getList();
            });
        },
        // 进度更新方法
        handleProcess() {
            addProcess(this.organizerForm).then(response => {
                this.$modal.msgSuccess('进度更新成功');
                this.open = false;
                this.getList();
            });
        },

        // 获得上传文件信息
        handleUploadSuccess(fileList) {
            console.log('上传成功的文件列表：', fileList[0].url);
            this.organizerForm.url = fileList[0].url;
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
        /** 查询事项信息列表 */
        getList() {
            this.loading = true;
            getCheckList(this.queryParams).then(response => {
                this.myExamineList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
        },
        // 获取部门列表
        getDeptList() {
            this.sectionList = listDeptTree().then(response => {
                this.sectionList = response.data;
            });
        },
        // 获取人员列表
        getUserList() {
            listPerson().then(response => {
                this.userList = response.data;
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
                superviseId: null,
                status: null,
                remark: ""
            };
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
            this.title = '添加督办事项信息';
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            if (row.organizerStatus === 1) {
                this.isMainOrganizer === false;
            }
            getSupervise(id).then(response => {
                // 将相关字段转换为number类型
                response.data.leadLeader = Number(response.data.leadLeader);
                response.data.superviseDept = Number(response.data.superviseDept);
                response.data.firstBusinessUnit = Number(response.data.firstBusinessUnit);
                response.data.xbBusinessUnit = Number(response.data.xbBusinessUnit);

                // 将organizerIds字符串转换为数组
                if (response.data.organizerIds) {
                    response.data.organizerIds = response.data.organizerIds.split(',').map(item => Number(item));
                }
                this.form = response.data;
                this.open = true;
                this.title = '办理督办事项信息';
                this.organizerForm.superviseId = id;
            });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    postCheck(this.form).then(response => {
                        this.$modal.msgSuccess('提交成功');
                        this.open = false;
                        this.viewOpen = false;
                        this.getList();
                    });
                }
            });
        },
        /** 查看进度按钮操作 */
        handleView(row) {
            this.currentSuperviseId = row.id;
            getProgressList(row.id).then(res => {
                this.viewTitle = `${row.name}事项办理信息`;
                this.viewOpen = true;
                this.scheduleData = res.data;
                this.reset();
                this.form.superviseId = row.id;
                this.title = row.name + '审核';
            });
        },
        // 点击审核按钮操作
        hanldeExamine() {
            this.open = true;
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
        // 根据备注内容返回时间线节点类型
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
        // 处理下拉菜单命令
        handleCommand(command) {
            const { type, row } = command;
            switch (type) {
                case 'examine':
                    this.handleView(row);
                    break;
                case 'detail':
                    this.handleDetail(row);
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

        /** 初始化列设置 */
        initColumnSettings() {
            // 保存原始列顺序
            this.originalColumnOrder = JSON.parse(JSON.stringify(this.allColumns));

            // 从localStorage加载用户自定义设置
            const savedSettings = localStorage.getItem('examine-column-settings');
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
                localStorage.setItem('examine-column-settings', JSON.stringify(this.allColumns));
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
        }
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
    color: #409EFF;
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
