<template>
    <div>
        <el-card>
            <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
                <el-form-item label="选择月份" prop="dataTime">
                    <el-date-picker
                        v-model="queryParams.dataTime"
                        type="month"
                        placeholder="选择月份"
                        value-format="yyyy-MM"
                        @change="handleQuery">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="姓名" prop="empName" v-hasPermi="['attendance:report:all']">
                    <el-input
                        v-model="queryParams.empName"
                        placeholder="请输入姓名"
                        clearable
                        size="small"
                        @keyup.enter.native="handleQuery"
                    />
                </el-form-item>
                <el-form-item label="是否缺勤" prop="absenteeism">
                    <el-select
                        v-model="queryParams.absenteeism"
                        placeholder="请选择"
                        clearable
                        size="small"
                        @change="handleQuery">
                        <el-option label="是" :value="'0'" />
                        <el-option label="否" :value="'1'" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                    <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
                </el-form-item>
            </el-form>

            <el-table :data="attendanceList" border>
                <el-table-column label="姓名" prop="empName" align="center" width="100" fixed />
                <el-table-column label="工号" prop="empNo" align="center" width="100"  />
                <el-table-column label="部门" prop="deptName" align="center" width="150"  />
                <el-table-column label="应出勤(天)" prop="shouldAttendDays" align="center" width="100" />
                <el-table-column label="实际出勤天数" prop="actualAttendDays" align="center" width="110" />
                <el-table-column label="应出勤(小时)" prop="shouldAttendHours" align="center" width="120" />
                <el-table-column label="实际出勤(小时)" prop="actualAttendHours" align="center" width="120" />
                <el-table-column label="计薪时长(小时)" prop="salaryHours" align="center" width="120" />
                <el-table-column label="加班时长-计加班费(小时)" prop="otPayHours" align="center" width="180" />
                <el-table-column label="加班时长-计为调休(小时)" prop="otRestHours" align="center" width="180" />
                <el-table-column label="迟到次数" prop="lateCount" align="center" width="100" />
                <el-table-column label="迟到时长(分钟)" prop="lateMinutes" align="center" width="120" />
                <el-table-column label="早退次数" prop="earlyLeaveCount" align="center" width="100" />
                <el-table-column label="早退时长(分钟)" prop="earlyLeaveMinutes" align="center" width="120" />
                <el-table-column label="上班缺卡次数" prop="missCardInCount" align="center" width="120" />
                <el-table-column label="下班缺卡次数" prop="missCardOutCount" align="center" width="120" />
                <el-table-column label="旷工天数" prop="absentDays" align="center" width="100" />
                <el-table-column label="打卡数据" align="center">
                    <el-table-column
                        v-if="dateColumns.length > 0"
                        v-for="date in dateColumns"
                        :key="date"
                        :label="date"
                        align="center"
                        width="120">
                        <template slot-scope="scope">
                            <span>{{ formatTime(scope.row.parsedFullDateJson[date]) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="dateColumns.length === 0"
                        label="无数据"
                        align="center">
                    </el-table-column>
                </el-table-column>
            </el-table>

            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
        </el-card>
    </div>
</template>

<script>
import { getAttendanceReportList } from '@/api/oa/attendance';
export default {
    name: '',
    data() {
        return {
            loading: true,
            total: 0,
            attendanceList: [],
            dateColumns: [],
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                nickName: null,
                deptName: null,
                empName: null,
                absenteeism: null,
                dataTime: null
            }
        };
    },
    created() {
        this.setDefaultDataTime();
        this.getList();
    },
    methods: {
        setDefaultDataTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            this.queryParams.dataTime = `${year}-${month}`;
        },
        getList() {
            this.loading = true;
            getAttendanceReportList(this.queryParams).then(response => {
                const apiRows = response.rows || [];
                this.total = response.total || 0;

                const dateSet = new Set();
                apiRows.forEach(row => {
                    let parsedJson = {};
                    if (row.fullDateJson && typeof row.fullDateJson === 'string') {
                        try {
                            parsedJson = JSON.parse(row.fullDateJson);
                            row.parsedFullDateJson = parsedJson;
                            Object.keys(parsedJson).forEach(date => dateSet.add(date));
                        } catch (e) {
                            console.error('Failed to parse fullDateJson for row:', row);
                            row.parsedFullDateJson = {};
                        }
                    } else {
                        row.parsedFullDateJson = {};
                    }
                });

                this.attendanceList = apiRows;
                this.dateColumns = Array.from(dateSet).sort((a, b) => `20${a}`.localeCompare(`20${b}`));
                this.loading = false;
            }).catch(error => {
                console.error('getAttendanceReportList error:', error);
                this.loading = false;
            });
        },

        formatTime(timeStr) {
            if (!timeStr || timeStr === 'null-null' || timeStr === '---') {
                return '-';
            }
            return timeStr;
        },

        /** 搜索按钮操作 */
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.getList();
        },

        /** 重置按钮操作 */
        resetQuery() {
            this.queryParams.pageNum = 1;
            this.queryParams.empName = null;
            this.queryParams.absenteeism = null;
            this.setDefaultDataTime();
            this.getList();
        }
    }
};
</script>

<style scoped>
</style>