<template>
    <div>
        <el-card class="box-card custom-card" v-if="deptInfo.ancestors.includes('102') || deptInfo.deptId === 102">
            <el-table v-loading="loading" :data="messageList" style="width: 100%" size="small">
                <el-table-column type="index" label="序号" width="60"></el-table-column>
                <el-table-column prop="content" label="内容">
                    <template slot-scope="scope">
                        <span :class="{ 'read-message': scope.row.reades === 1, 'unread-message': scope.row.reades === 0 }">
                            {{ scope.row.content }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="160"></el-table-column>
                <el-table-column label="操作" width="80">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleView(scope.row)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination
                    small
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryParams.pageNum"
                    :page-sizes="[10, 20, 50, 100]"
                    :page-size="queryParams.pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                ></el-pagination>
            </div>
        </el-card>
    </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup';
import LineChart from './dashboard/LineChart';
import RaddarChart from './dashboard/RaddarChart';
import PieChart from './dashboard/PieChart';
import BarChart from './dashboard/BarChart';
import * as indexApi from '@/api/index';
import store from '@/store';

const lineChartData = {
    newVisitis: {
        expectedData: [100, 120, 161, 134, 105, 160, 165],
        actualData: [120, 82, 91, 154, 162, 140, 145]
    },
    messages: {
        expectedData: [200, 192, 120, 144, 160, 130, 140],
        actualData: [180, 160, 151, 106, 145, 150, 130]
    },
    purchases: {
        expectedData: [80, 100, 121, 104, 105, 90, 100],
        actualData: [120, 90, 100, 138, 142, 130, 130]
    },
    shoppings: {
        expectedData: [130, 140, 141, 142, 145, 150, 160],
        actualData: [120, 82, 91, 154, 162, 140, 130]
    }
};

export default {
    name: 'Index',
    components: {
        PanelGroup,
        LineChart,
        RaddarChart,
        PieChart,
        BarChart
    },
    data() {
        return {
            lineChartData: lineChartData.newVisitis,
            queryParams: {
                pageNum: 1,
                pageSize: 10
            },
            total: 0,
            messageList: [],
            loading: false,
            deptInfo: {
                ancestors: [],
                deptId: ''
            }
        };
    },
    created() {
        this.getMessageList();
        this.getDeptInfo();
    },
    methods: {
        handleSetLineChartData(type) {
            this.lineChartData = lineChartData[type];
        },
        getMessageList() {
            this.loading = true;
            indexApi.getMessageList(this.queryParams).then(res => {
                this.loading = false;
                this.messageList = res.rows || [];
                this.total = res.total || 0;
            });
        },
        // 处理每页显示数量变化
        handleSizeChange(size) {
            this.queryParams.pageSize = size;
            this.getMessageList();
        },
        // 处理页码变化
        handleCurrentChange(page) {
            this.queryParams.pageNum = page;
            this.getMessageList();
        },
        // 查看消息详情
        handleView(row) {
            switch (row.type) {
                case 21:
                    indexApi.readMessageById({ id: row.id });
                    this.$router.push('/supervise/myItem');
                    break;
                case 22:
                    indexApi.readMessageById({ id: row.id });
                    this.$router.push('/supervise/examine');
                    break;
                case 31:
                    indexApi.readMessageById({ id: row.id });
                    this.$router.push('/affairsApply/affairsApply');
                    break;
                case 32:
                    indexApi.readMessageById({ id: row.id });
                    this.$router.push('/affairsApply/affairsCheck');
                    break;
                default:
                    console.warn('未知的消息类型:', row.type);
            }
        },
        getDeptInfo() {
            const deptInfo = store.state.user.deptInfo;
            this.deptInfo = deptInfo;
        }
    }
};
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .chart-wrapper {
        background: #fff;
        padding: 16px 16px 0;
        margin-bottom: 32px;
    }
}

.custom-card {
    width: 90%;
    max-width: 700px;
    margin: 20px 0;
}

.pagination-container {
    margin-top: 15px;
    text-align: right;
}

.unread-message {
    color: #000000;
    font-weight: normal;
}

.read-message {
    color: #909399;
    font-weight: normal;
}

@media (max-width: 1024px) {
    .chart-wrapper {
        padding: 8px;
    }

    .custom-card {
        width: 95%;
    }
}
</style>
