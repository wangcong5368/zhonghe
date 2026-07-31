<template>
    <div>
        <el-form label-width="130px" disabled>
            <el-row>
                <el-col :span="12">
                    <!-- <el-form-item label="标题：">
                    <el-input v-model="detailData.title" readonly></el-input>
                </el-form-item> -->
                    <el-form-item label="事务编号" prop="applyNo" v-if="detailData.applyNo">
                        <el-input v-model="detailData.applyNo" placeholder="请输入事务编号" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="事务类型：">
                        <el-select v-model="affairsTypeName" @keyup.enter.native="handleQuery" placeholder="请选择事务类型">
                            <el-option v-for="dict in dict.type.affairs_type" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="申请人：">
                        <el-input v-model="detailData.applyName" readonly></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="申请时间：">
                        <el-input v-model="detailData.createTime" readonly></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 具体表单数据，根据事务类型显示不同内容 -->
            <!-- 请假类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'leave'">
                <el-divider content-position="left">请假详情</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="申请人姓名：">
                            <el-input v-model="parsedData.applyName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="所在部门：">
                            <el-input v-model="parsedData.deptName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="职务职级：">
                            <el-input v-model="parsedData.position" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="参加工作时间：">
                            <el-input v-model="parsedData.workStartDate" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="请假类别：">
                            <el-input :value="getLeaveTypeName(parsedData.leaveType)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="请假天数：">
                            <el-input v-model="parsedData.leaveDays" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="请假时间：">
                            <el-input :value="formatTimeRange(parsedData.leaveTime)" readonly></el-input>
                            <div style="color: #909399; font-size: 12px; margin-top: 5px">
                                休假共计{{ parsedData.totalDays }}，其中工作日
                                {{ parsedData.workdayCount }}
                                天
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="请假原因：">
                            <el-input type="textarea" v-model="parsedData.leaveReason"
                                :autosize="{ minRows: 2, maxRows: 6 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="parsedData.fileUrl">
                    <el-col :span="24">
                        <el-form-item label="附件：">
                            <div v-for="(file, index) in parseFileJson(parsedData.fileUrl)" :key="index">
                                <a :href="_baseUrl + (file.url || file)" target="_blank">{{ (file.name) || ((file.url ||
                                    file).split('/').pop()) }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 出差类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'away'">
                <el-divider content-position="left">出差详情</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="部门名称：">
                            <el-input v-model="parsedData.deptName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="出差人员：">
                            <el-input v-model="parsedData.applyName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="出差事由：">
                            <el-input type="textarea" v-model="parsedData.awayReason"
                                :autosize="{ minRows: 2, maxRows: 4 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="出差地点：">
                            <el-input v-model="parsedData.awayLocation" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="出差时间：">
                            <el-input :value="formatTimeRange(parsedData.awayTime)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="parsedData.travelExpenseFiles">
                    <el-col :span="24">
                        <el-form-item label="附件：">
                            <div v-for="(file, index) in getPayProofFiles(parsedData.travelExpenseFiles)" :key="index">
                                <a :href="_baseUrl + file.url" target="_blank">{{ file.name }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- <el-row>
                <el-col :span="24">
                    <el-form-item label="部门负责人意见：">
                        <el-input type="textarea" v-model="parsedData.deptLeaderOpinion" :autosize="{ minRows: 2, maxRows: 4 }" readonly></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="中心领导意见：">
                        <el-input type="textarea" v-model="parsedData.centerLeaderOpinion" :autosize="{ minRows: 2, maxRows: 4 }" readonly></el-input>
                    </el-form-item>
                </el-col>
            </el-row> -->
            </template>

            <!-- 拨款类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'grant'">
                <el-divider content-position="left">拨款详情</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="款项支付公司：">
                            <el-input v-model="parsedData.payCompany" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="付款金额：">
                            <el-input v-model="parsedData.payAmount" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="付款类型：">
                            <el-input :value="getPayTypeName(parsedData.payType)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="收款方全称：">
                            <el-input v-model="parsedData.receiverName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合同名称：">
                            <el-input v-model="parsedData.contractName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="付款项目分类：">
                            <el-input v-model="parsedData.payCategory" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合同累积付款金额：">
                            <el-input v-model="parsedData.contractTotalPaid" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="付款方式：">
                            <el-input v-model="parsedData.payMethod" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="计划付款日期：">
                            <el-input v-model="parsedData.planPayDate" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="收款方银行账号：">
                            <el-input v-model="parsedData.receiverBankAccount" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="收款方开户行：">
                            <el-input v-model="parsedData.receiverBank" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="付款内容描述：">
                            <el-input type="textarea" v-model="parsedData.payDescription"
                                :autosize="{ minRows: 3, maxRows: 6 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="parsedData.relatedApplication || parsedData.relatedApplicationNo">
                    <el-col :span="24">
                        <el-form-item label="关联申请单：">
                            <div @click.stop="viewRelatedApplication(parsedData.relatedApplicationId || parsedData.relatedApplyId)"
                                class="clickable-link">
                                {{ formatRelatedApplication(parsedData) }}
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="parsedData.payProofFiles">
                    <el-col :span="24">
                        <el-form-item label="付款凭证照片：">
                            <div v-for="(file, index) in getPayProofFiles(parsedData.payProofFiles)" :key="index">
                                <a :href="_baseUrl + file.url" target="_blank">{{ file.name }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 报销类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'expense'">
                <el-divider content-position="left">报销详情</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="付款金额：">
                            <el-input v-model="parsedData.payAmount" readonly>
                                <template slot="append">元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="付款方式：">
                            <el-input v-model="parsedData.payMethod" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="收款方全称：">
                            <el-input v-model="parsedData.receiverName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="收款方银行账号：">
                            <el-input v-model="parsedData.receiverBankAccount" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="收款方开户行：">
                            <el-input v-model="parsedData.receiverBank" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="计划付款日期：">
                            <el-input v-model="parsedData.planPayDate" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="付款内容描述：">
                            <el-input type="textarea" v-model="parsedData.payDescription"
                                :autosize="{ minRows: 3, maxRows: 6 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row v-if="parsedData.relatedApplication || parsedData.relatedApplicationNo">
                    <el-col :span="24">
                        <el-form-item label="关联申请单：">
                            <div @click.stop="viewRelatedApplication(parsedData.relatedApplicationId || parsedData.relatedApplyId)"
                                class="clickable-link">
                                {{ formatRelatedApplication(parsedData) }}
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row v-if="parsedData.payProofFiles">
                    <el-col :span="24">
                        <el-form-item label="付款凭证照片：">
                            <div v-for="(file, index) in getPayProofFiles(parsedData.payProofFiles)" :key="index">
                                <a :href="_baseUrl + file.url" target="_blank">{{ file.name }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 差旅费报销类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'travel'">
                <el-divider content-position="left">差旅费报销详情</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="出差人员：">
                            <el-input v-model="parsedData.traveler" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="出差事由：">
                            <el-input v-model="parsedData.travelReason" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="费用明细：">
                    <el-table :data="parsedData.expenseItems" border>
                        <el-table-column label="项目" prop="itemName" width="120"></el-table-column>
                        <el-table-column label="单据张数" prop="receiptCount" width="100"></el-table-column>
                        <el-table-column label="金额" prop="amount" width="120"></el-table-column>
                        <el-table-column label="出差地区" prop="location"></el-table-column>
                        <el-table-column label="起讫日期" width="220">
                            <template slot-scope="scope">
                                {{ formatDateRange(scope.row.dateRange) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="天数" prop="days" width="80"></el-table-column>
                        <el-table-column label="补助标准" prop="allowanceStandard" width="120"></el-table-column>
                        <el-table-column label="补助金额" prop="allowance" width="120"></el-table-column>
                    </el-table>
                </el-form-item>

                <el-form-item label="总计金额：">
                    <el-input v-model="parsedData.totalAmount" readonly></el-input>
                </el-form-item>

                <el-row v-if="parsedData.receiptFiles">
                    <el-col :span="24">
                        <el-form-item label="发票凭证：">
                            <div v-for="(file, index) in getPayProofFiles(parsedData.receiptFiles)" :key="index">
                                <a :href="_baseUrl + file.url" target="_blank">{{ file.name }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <template v-if="parsedData && detailData.affairsType === 'other'">
                <el-divider content-position="left">申请事项</el-divider>
                <el-form-item label="标题：">
                    <el-input v-model="parsedData.title" readonly></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="申请事项：">
                            <el-input type="textarea" v-model="parsedData.applyMatter"
                                :autosize="{ minRows: 2, maxRows: 6 }" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row v-if="parsedData.fileUrl">
                    <el-col :span="24">
                        <el-form-item label="附件内容：">
                            <a :href="_baseUrl + parsedData.fileUrl">{{ parsedData.fileUrl ?
                                parsedData.fileUrl.split('/').pop() : '' }}</a>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 用印申请类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'officialSeal'">
                <el-divider content-position="left">用印申请详情</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="申请部门：">
                            <el-input v-model="parsedData.applyDept" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="印章名称：">
                            <el-input :value="formatSealTypes(parsedData.sealType)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row v-if="parsedData.sealType && parsedData.sealType.includes('其他') && parsedData.otherSealNote">
                    <el-col :span="24">
                        <el-form-item label="其他印章说明：">
                            <el-input v-model="parsedData.otherSealNote" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="用章类别：">
                            <el-input v-model="parsedData.usageType" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="parsedData.usageType === '加盖印章'">
                        <el-form-item label="材料份数：">
                            <el-input v-model="parsedData.documentCount" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="用章事由：">
                            <el-input type="textarea" v-model="parsedData.sealReason"
                                :autosize="{ minRows: 2, maxRows: 6 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="parsedData.fileUrl">
                    <el-col :span="24">
                        <el-form-item label="附件：">
                            <div v-for="(file, index) in parseFileJson(parsedData.fileUrl)" :key="index">
                                <a :href="_baseUrl + (file.url || file)" target="_blank">{{ (file.name) || ((file.url ||
                                    file).split('/').pop()) }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 业务招待申请类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'hospitality'">
                <el-divider content-position="left">业务招待详情</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="招待日期及时间：">
                            <el-input v-model="parsedData.hospitalityDateTime" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="招待地点：">
                            <el-input v-model="parsedData.hospitalityLocation" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="招待单位：">
                            <el-input v-model="parsedData.hospitalityUnit" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="招待人数：">
                            <el-input v-model="parsedData.hospitalityCount" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="申请事由：">
                            <el-input type="textarea" v-model="parsedData.hospitalityReason"
                                :autosize="{ minRows: 2, maxRows: 6 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="我方参与人员：">
                            <el-input type="textarea" v-model="parsedData.ourParticipants"
                                :autosize="{ minRows: 2, maxRows: 4 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="预计消费金额：">
                            <el-input v-model="parsedData.estimatedAmount" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="parsedData.fileUrl">
                    <el-col :span="24">
                        <el-form-item label="附件：">
                            <div v-for="(file, index) in parseFileJson(parsedData.fileUrl)" :key="index">
                                <a :href="_baseUrl + (file.url || file)" target="_blank">{{ (file.name) || ((file.url ||
                                    file).split('/').pop()) }}</a>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 零星采购申请类型表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'procurement'">
                <el-divider content-position="left">零星采购申请详情</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="购买类型：">
                            <el-input v-model="parsedData.purchaseType" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="申请原因及用途说明：">
                            <el-input type="textarea" v-model="parsedData.applyReason"
                                :autosize="{ minRows: 2, maxRows: 6 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="商品明细：">
                            <el-table :data="parsedData.items || []" border style="width: 100%">
                                <el-table-column label="名称" prop="name"></el-table-column>
                                <el-table-column label="品牌" prop="brand"></el-table-column>
                                <el-table-column label="型号" prop="model"></el-table-column>
                                <el-table-column label="数量" prop="quantity" width="80"></el-table-column>
                                <el-table-column label="单位" prop="unit" width="80"></el-table-column>
                                <el-table-column label="单价" prop="price" width="100">
                                    <template slot-scope="scope">{{ scope.row.price }} 元</template>
                                </el-table-column>
                                <el-table-column label="小计" prop="subtotal" width="120">
                                    <template slot-scope="scope">{{ scope.row.subtotal }} 元</template>
                                </el-table-column>
                                <el-table-column label="商品购买链接" prop="purchaseLink">
                                    <template slot-scope="scope">
                                        <el-link v-if="scope.row.purchaseLink" :href="scope.row.purchaseLink"
                                            target="_blank" type="primary">查看链接</el-link>
                                    </template>
                                </el-table-column>
                                <el-table-column label="附件" width="150">
                                    <template slot-scope="scope">
                                        <template v-if="scope.row.fileUrl">
                                            <div v-for="(file, fIndex) in parseFileJson(scope.row.fileUrl)"
                                                :key="fIndex">
                                                <el-link :href="_baseUrl + file.url" target="_blank" type="primary">{{
                                                    file.name }}</el-link>
                                            </div>
                                        </template>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="总计金额：">
                            <el-input v-model="parsedData.totalAmount" readonly>
                                <template slot="append">元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- 合同审批表单详情 -->
            <template v-if="parsedData && detailData.affairsType === 'contract'">
                <el-divider content-position="left">合同审批详情</el-divider>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="申请人姓名：">
                            <el-input v-model="parsedData.applyName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="申请人部门：">
                            <el-input v-model="parsedData.deptName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="合同承办部门：">
                            <el-input v-model="parsedData.contractDepartment" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合同签订方式：">
                            <el-input v-model="parsedData.negotiators" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="合同名称：">
                            <el-input v-model="parsedData.contractName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="甲方单位名称：">
                            <el-input v-model="parsedData.partyA" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="乙方单位名称：">
                            <el-input v-model="parsedData.partyB" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="丙方单位名称：">
                            <el-input v-model="parsedData.partyC" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="8">
                        <el-form-item label="签约日期：">
                            <el-input :value="formatDate(parsedData.signingDate)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="合同开始时间：">
                            <el-input :value="formatDate(parsedData.contractStartDate)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="合同终止时间：">
                            <el-input :value="formatDate(parsedData.contractEndDate)" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="合同内容：">
                            <el-input type="textarea" v-model="parsedData.contractContent"
                                :autosize="{ minRows: 3, maxRows: 8 }" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="合同金额：">
                            <el-input v-model="parsedData.contractAmount" readonly>
                                <template slot="append">元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="合同份数：">
                            <el-input v-model="parsedData.contractCopies" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="24">
                        <el-form-item label="附件：">
                            <template v-if="parsedData.attachment">
                                <div v-for="(file, fIndex) in parseFileJson(parsedData.attachment)" :key="fIndex">
                                    <el-link :href="_baseUrl + file.url" target="_blank" type="primary">{{ file.name
                                        }}</el-link>
                                </div>
                            </template>
                            <span v-else>无附件</span>
                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <!-- <el-row>
            <el-col :span="12">
                <el-form-item label="是否多人审批：">
                    <el-radio-group v-model="detailData.manyCheck" disabled>
                        <el-radio :label="1">是</el-radio>
                        <el-radio :label="0">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="申请状态：">
                    <el-select v-model="detailData.status" disabled>
                        <el-option v-for="item in statusText" :key="item.val" :label="item.label" :value="item.val"></el-option>
                    </el-select>
                </el-form-item>
            </el-col>
        </el-row> -->

            <!-- 抄送人信息显示 -->
            <template v-if="detailData.ccList && detailData.ccList.length > 0">
                <el-divider content-position="left">抄送信息</el-divider>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="抄送人：">
                            <el-tag v-for="ccUser in getCcUserList()" :key="ccUser.userId"
                                style="margin-right: 8px; margin-bottom: 4px;" type="info">
                                {{ ccUser.deptName ? `${ccUser.nickName} (${ccUser.deptName})` : ccUser.nickName }}

                            </el-tag>
                            <span v-if="getCcUserList().length === 0" style="color: #909399;">暂无抄送人员</span>

                        </el-form-item>
                    </el-col>
                </el-row>
            </template>

            <el-divider content-position="left">审核记录</el-divider>
            <el-table :data="detailData.detailList">
                <!-- <el-table-column label="审批节点" align="center" width="120">
                    <template slot-scope="scope">
                        审批节点{{ scope.$index + 1 }}
                    </template>
                </el-table-column> -->
                <el-table-column label="审核部门" align="center" prop="deptName" />
                <el-table-column label="审核人" align="center" prop="checkName" />
                <el-table-column label="审核状态" align="center" prop="status" width="100">
                    <template slot-scope="scope">
                        {{ statusText1[scope.row.status] }}
                    </template>
                </el-table-column>
                <el-table-column label="审核时间" align="center" prop="checkTime" width="150" />
                <el-table-column label="审核意见" align="center" prop="opinion" />
            </el-table>
        </el-form>
        <!-- 添加关联申请单详情对话框 -->
        <el-dialog title="关联申请单详情" :visible.sync="relatedApplicationDetailOpen" width="80%" append-to-body>
            <el-form label-width="130px" disabled v-if="relatedApplicationDetail">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="事务编号" prop="applyNo" v-if="relatedApplicationDetail.applyNo">
                            <el-input v-model="relatedApplicationDetail.applyNo" placeholder="请输入事务编号" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="事务类型：">
                            <el-select v-model="relatedApplicationTypeName" placeholder="请选择事务类型">
                                <el-option v-for="dict in dict.type.affairs_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="申请人：">
                            <el-input v-model="relatedApplicationDetail.applyName" readonly></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="申请时间：">
                            <el-input v-model="relatedApplicationDetail.createTime" readonly></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 关联申请单的表单数据内容 -->
                <div v-if="relatedApplicationParsedData">
                    <!-- 根据不同的事务类型显示不同的内容 -->
                    <!-- 合同审批类型 -->
                    <template v-if="relatedApplicationDetail.affairsType === 'contract'">
                        <el-divider content-position="left">合同审批详情</el-divider>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="申请人姓名：">
                                    <el-input v-model="relatedApplicationParsedData.applyName" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="申请人部门：">
                                    <el-input v-model="relatedApplicationParsedData.deptName" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="合同承办部门：">
                                    <el-input v-model="relatedApplicationParsedData.contractDepartment"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="合同签订方式：">
                                    <el-input v-model="relatedApplicationParsedData.negotiators" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="合同名称：">
                                    <el-input v-model="relatedApplicationParsedData.contractName" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="甲方单位名称：">
                                    <el-input v-model="relatedApplicationParsedData.partyA" readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="乙方单位名称：">
                                    <el-input v-model="relatedApplicationParsedData.partyB" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="丙方单位名称：">
                                    <el-input v-model="relatedApplicationParsedData.partyC" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="8">
                                <el-form-item label="签约日期：">
                                    <el-input :value="formatDate(relatedApplicationParsedData.signingDate)"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="合同开始时间：">
                                    <el-input :value="formatDate(relatedApplicationParsedData.contractStartDate)"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="合同终止时间：">
                                    <el-input :value="formatDate(relatedApplicationParsedData.contractEndDate)"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="合同内容：">
                                    <el-input type="textarea" v-model="relatedApplicationParsedData.contractContent"
                                        :autosize="{ minRows: 3, maxRows: 8 }" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="合同金额：">
                                    <el-input v-model="relatedApplicationParsedData.contractAmount" readonly>
                                        <template slot="append">元</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="合同份数：">
                                    <el-input v-model="relatedApplicationParsedData.contractCopies" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="附件：">
                                    <template v-if="relatedApplicationParsedData.attachment">
                                        <div v-for="(file, fIndex) in parseFileJson(relatedApplicationParsedData.attachment)"
                                            :key="fIndex">
                                            <el-link :href="_baseUrl + file.url" target="_blank" type="primary">{{
                                                file.name }}</el-link>
                                        </div>
                                    </template>
                                    <span v-else>无附件</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </template>

                    <!-- 零星采购审批类型 -->
                    <template v-if="relatedApplicationDetail.affairsType === 'procurement'">
                        <el-divider content-position="left">零星采购申请详情</el-divider>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="购买类型：">
                                    <el-input v-model="relatedApplicationParsedData.purchaseType" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="申请原因及用途说明：">
                                    <el-input type="textarea" v-model="relatedApplicationParsedData.applyReason"
                                        :autosize="{ minRows: 2, maxRows: 6 }" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="商品明细：">
                                    <el-table :data="relatedApplicationParsedData.items || []" border
                                        style="width: 100%">
                                        <el-table-column label="名称" prop="name"></el-table-column>
                                        <el-table-column label="品牌" prop="brand"></el-table-column>
                                        <el-table-column label="型号" prop="model"></el-table-column>
                                        <el-table-column label="数量" prop="quantity" width="80"></el-table-column>
                                        <el-table-column label="单位" prop="unit" width="80"></el-table-column>
                                        <el-table-column label="单价" prop="price" width="100">
                                            <template slot-scope="scope">{{ scope.row.price }} 元</template>
                                        </el-table-column>
                                        <el-table-column label="小计" prop="subtotal" width="120">
                                            <template slot-scope="scope">{{ scope.row.subtotal }} 元</template>
                                        </el-table-column>
                                        <el-table-column label="商品购买链接" prop="purchaseLink">
                                            <template slot-scope="scope">
                                                <el-link v-if="scope.row.purchaseLink" :href="scope.row.purchaseLink"
                                                    target="_blank" type="primary">查看链接</el-link>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="附件" width="150">
                                            <template slot-scope="scope">
                                                <template v-if="scope.row.fileUrl">
                                                    <div v-for="(file, fIndex) in parseFileJson(scope.row.fileUrl)"
                                                        :key="fIndex">
                                                        <el-link :href="_baseUrl + file.url" target="_blank"
                                                            type="primary">{{ file.name }}</el-link>
                                                    </div>
                                                </template>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="总计金额：">
                                    <el-input v-model="relatedApplicationParsedData.totalAmount" readonly>
                                        <template slot="append">元</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </template>

                    <!-- 业务招待审批类型 -->
                    <template v-if="relatedApplicationDetail.affairsType === 'hospitality'">
                        <el-divider content-position="left">业务招待详情</el-divider>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="招待日期及时间：">
                                    <el-input v-model="relatedApplicationParsedData.hospitalityDateTime"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="招待地点：">
                                    <el-input v-model="relatedApplicationParsedData.hospitalityLocation"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="招待单位：">
                                    <el-input v-model="relatedApplicationParsedData.hospitalityUnit"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="招待人数：">
                                    <el-input v-model="relatedApplicationParsedData.hospitalityCount"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="申请事由：">
                                    <el-input type="textarea" v-model="relatedApplicationParsedData.hospitalityReason"
                                        :autosize="{ minRows: 2, maxRows: 6 }" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="我方参与人员：">
                                    <el-input type="textarea" v-model="relatedApplicationParsedData.ourParticipants"
                                        :autosize="{ minRows: 2, maxRows: 4 }" readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="预计消费金额：">
                                    <el-input v-model="relatedApplicationParsedData.estimatedAmount"
                                        readonly></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </template>
                </div>

                <!-- 审核记录 -->
                <el-divider content-position="left">审核记录</el-divider>
                <el-table :data="relatedApplicationDetail.detailList">
                    <!-- <el-table-column label="审批节点" align="center" width="120">
                        <template slot-scope="scope">
                            审批节点{{ scope.$index + 1 }}
                        </template>
                    </el-table-column> -->
                    <el-table-column label="审核部门" align="center" prop="deptName" />
                    <el-table-column label="审核人" align="center" prop="checkName" />
                    <el-table-column label="审核状态" align="center" prop="status" width="100">
                        <template slot-scope="scope">
                            {{ statusText1[scope.row.status] }}
                        </template>
                    </el-table-column>
                    <el-table-column label="审核时间" align="center" prop="checkTime" width="150" />
                    <el-table-column label="审核意见" align="center" prop="opinion" />
                </el-table>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import { affairsDetail } from "@/api/oa/affairsApply";

export default {
    props: ['detailData', 'userList', 'typeList', 'deptList', 'allUserList'],
    dicts: ['affairs_type', 'leave_type'],
    data() {
        return {
            statusText: [
                {
                    val: 0,
                    label: '待审核'
                },
                {
                    val: 1,
                    label: '审核中'
                },
                {
                    val: 2,
                    label: '已通过'
                },
                {
                    val: 3,
                    label: '已拒绝'
                },
                {
                    val: 4,
                    label: '已撤回'
                }
            ],
            statusText1: {
                0: '未审核',
                1: '通过',
                2: '拒绝',
                3: '申请被撤销',
                4: '审核已被拒绝'
            },
            affairsTypeName: '',
            parsedData: null,
            leaveTypes: {
                sick: '病假',
                personal: '事假',
                annual: '年休假',
                marriage: '婚假',
                maternity: '产假',
                nursing: '护理假',
                funeral: '丧假',
                other: '其他'
            },
            payTypes: {
                contract: '合同付款',
                nonContract: '非合同付款'
            },
            relatedApplicationDetailOpen: false,
            relatedApplicationDetail: null,
            relatedApplicationParsedData: null,
            relatedApplicationTypeName: ''
        };
    },
    computed: {
        // 不再需要这个计算属性
        // getRelatedApplicationComponent() {
        //     if (!this.relatedApplicationDetail || !this.relatedApplicationDetail.affairsType) {
        //         return null;
        //     }
        //     return null;
        // }
    },
    watch: {
        detailData: {
            handler(newVal) {
                if (newVal) {
                    this.getAffairsTypeName();
                    this.parseFormData();
                }
            },
            immediate: true,
            deep: true
        },
        relatedApplicationDetail: {
            handler(newVal) {
                if (newVal) {
                    this.getRelatedApplicationTypeName();
                    this.parseRelatedApplicationFormData();
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        getAffairsTypeName() {
            if (this.detailData && this.detailData.affairsType) {
                const typeObj = this.typeList.find(item => item.value === this.detailData.affairsType);
                this.affairsTypeName = typeObj ? typeObj.label : this.detailData.affairsType;
            }
        },

        getRelatedApplicationTypeName() {
            if (this.relatedApplicationDetail && this.relatedApplicationDetail.affairsType) {
                const typeObj = this.typeList.find(item => item.value === this.relatedApplicationDetail.affairsType);
                this.relatedApplicationTypeName = typeObj ? typeObj.label : this.relatedApplicationDetail.affairsType;
            }
        },

        parseFormData() {
            if (this.detailData && this.detailData.formData) {
                try {
                    if (typeof this.detailData.formData === 'string') {
                        this.parsedData = JSON.parse(this.detailData.formData);
                    } else {
                        this.parsedData = this.detailData.formData;
                    }

                    if (this.parsedData.deptId) {
                        this.findDeptNameById(this.parsedData.deptId);
                    }

                    console.log('解析后的表单数据:', this.parsedData);
                } catch (error) {
                    console.error('解析formData失败:', error);
                    this.parsedData = null;
                }
            } else {
                this.parsedData = null;
            }
        },

        parseRelatedApplicationFormData() {
            if (this.relatedApplicationDetail && this.relatedApplicationDetail.formData) {
                try {
                    if (typeof this.relatedApplicationDetail.formData === 'string') {
                        this.relatedApplicationParsedData = JSON.parse(this.relatedApplicationDetail.formData);
                    } else {
                        this.relatedApplicationParsedData = this.relatedApplicationDetail.formData;
                    }

                    if (this.relatedApplicationParsedData.deptId) {
                        this.findDeptNameByIdForRelated(this.relatedApplicationParsedData.deptId);
                    }

                    console.log('关联申请单解析后的表单数据:', this.relatedApplicationParsedData);
                } catch (error) {
                    console.error('解析关联申请单formData失败:', error);
                    this.relatedApplicationParsedData = null;
                }
            } else {
                this.relatedApplicationParsedData = null;
            }
        },

        viewRelatedApplication(id) {
            console.log('点击查看关联申请单，ID:', id);

            if (!id) {
                // 尝试从其他可能的字段获取ID
                if (this.parsedData.relatedApplyId) {
                    id = this.parsedData.relatedApplyId;
                } else if (this.parsedData.relatedApplicationId) {
                    id = this.parsedData.relatedApplicationId;
                }
            }

            if (!id) {
                this.$message({
                    message: '未找到关联申请单ID',
                    type: 'warning'
                });
                return;
            }

            // 调用查看申请单详情的接口
            affairsDetail(id).then(response => {
                this.relatedApplicationDetail = response.data;
                this.relatedApplicationDetailOpen = true;
                console.log('关联申请单详情:', this.relatedApplicationDetail);
            }).catch(error => {
                console.error('获取关联申请单详情失败:', error);
                this.$message.error('获取关联申请单详情失败');
            });
        },

        findDeptNameById(deptId) {
            const findDept = (list, id) => {
                for (const item of list) {
                    if (item.id === id) {
                        return item.label;
                    }
                    if (item.children && item.children.length > 0) {
                        const found = findDept(item.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const deptName = findDept(this.deptList, deptId);

            if (deptName) {
                this.parsedData.deptName = deptName;
                console.log(this.detailData, 'this.detailData');
            }
        },

        findDeptNameByIdForRelated(deptId) {
            const findDept = (list, id) => {
                for (const item of list) {
                    if (item.id === id) {
                        return item.label;
                    }
                    if (item.children && item.children.length > 0) {
                        const found = findDept(item.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const deptName = findDept(this.deptList, deptId);

            if (deptName) {
                this.relatedApplicationParsedData.deptName = deptName;
            }
        },

        formatRelatedApplication(data) {
            if (!data.relatedApplication) return '';

            let displayText = data.relatedApplication;

            if (data.relatedApplicationNo) {
                displayText = `${data.relatedApplicationNo} - ${displayText}`;
            }

            return displayText;
        },

        formatTimeRange(timeRange) {
            if (!timeRange || !Array.isArray(timeRange) || timeRange.length !== 2) return '';
            return `${timeRange[0]} 至 ${timeRange[1]}`;
        },

        getLeaveTypeName(type) {
            if (this.dict.type.leave_type.length > 0) {
                return this.dict.type.leave_type.find(item => item.value === type)?.label || type;
            } else {
                return this.leaveTypes[type] || type;
            }
        },

        getPayTypeName(type) {
            return this.payTypes[type] || type;
        },

        getPayProofFiles(payProofFiles) {
            if (!payProofFiles) return [];

            try {
                if (typeof payProofFiles === 'string') {
                    const filesList = payProofFiles.split(',').filter(item => item && item.trim());

                    return filesList.map(file => {
                        const fileName = file.split('/').pop();
                        return {
                            name: fileName,
                            url: file.trim()
                        };
                    });
                }
                if (Array.isArray(payProofFiles)) {
                    return payProofFiles;
                }
                return [];
            } catch (error) {
                console.error('解析付款凭证文件失败:', error);
                return [];
            }
        },

        formatDateRange(dateRange) {
            if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
                return '';
            }
            return `${dateRange[0]} 至 ${dateRange[1]}`;
        },

        formatDate(dateString) {
            if (!dateString) return '';

            let date;
            if (typeof dateString === 'object') {
                date = dateString;
            } else {
                date = new Date(dateString);
            }

            if (isNaN(date.getTime())) {
                return dateString;
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        },

        formatSealTypes(sealTypes) {
            if (!sealTypes || !Array.isArray(sealTypes)) return '';
            return sealTypes.join('、');
        },

        parseFileJson(fileJsonStr) {
            if (!fileJsonStr) return [];

            try {
                if (typeof fileJsonStr === 'object') {
                    return Array.isArray(fileJsonStr) ? fileJsonStr : [fileJsonStr];
                }

                const fileData = JSON.parse(fileJsonStr);
                return Array.isArray(fileData) ? fileData : [fileData];
            } catch (error) {
                console.error('解析文件JSON失败:', error);
                return [
                    {
                        name: fileJsonStr.split('/').pop(),
                        url: fileJsonStr
                    }
                ];
            }
        },

        getCcUserList() {
            // 获取抄送人信息
            if (!this.detailData.ccList || !Array.isArray(this.detailData.ccList) || this.detailData.ccList.length === 0) {
                return [];
            }

            // 如果没有全部用户列表，直接返回空数组
            if (!this.allUserList || !Array.isArray(this.allUserList)) {
                return [];
            }

            // 根据抄送人ID查找对应的用户信息
            return this.detailData.ccList.map(item => {
                const user = this.allUserList.find(u => u.userId === item.userId);
                if (user) {
                    return {
                        userId: user.userId,
                        nickName: user.nickName,
                        deptName: user.dept ? user.dept.deptName : ''
                    };
                }
                return { userId: item.userId, nickName: `用户${item.userId}`, deptName: '' };
            });
        }
    },
    mounted() {
        this.getAffairsTypeName();
        this.parseFormData();
    }
};
</script>

<style scoped>
.el-divider {
    margin: 16px 0;
}

.clickable-link {
    color: #409EFF;
    cursor: pointer;
    text-decoration: underline;
}

.clickable-link:hover {
    color: #66b1ff;
}
</style>
