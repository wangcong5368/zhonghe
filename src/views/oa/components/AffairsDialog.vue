<template>
    <div class="">
        <el-dialog :title="title" :visible.sync="open" :width="form.affairsType === 'travel' ? '80%' : '800px'"
            append-to-body size="medium" :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="130px">
                <el-row>
                    <el-form-item label="标题" prop="title" style="display: none">
                        <el-input v-model="form.title" placeholder="请输入标题" clearable
                            :value="$store.getters.userInfo.nickName + ' ' + new Date().toLocaleDateString()" />
                    </el-form-item>
                    <!--
                    <el-form-item label="事务编号" prop="title">
                        <el-input v-model="form.formData.code" placeholder="请输入事务编号" clearable />
                    </el-form-item> -->

                    <el-col :span="12">
                        <el-form-item label="事务类型" prop="affairsType">
                            <el-select v-model="form.affairsType" placeholder="请选择事务类型" @change="handleTypeChange">
                                <el-option v-for="dict in dict.type.affairs_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="申请人" style="display: none">
                            <el-input v-model="form.applyName" :placeholder="$store.getters.userInfo.nickName" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- 根据事务类型显示不同的表单 -->
                <template v-if="form.affairsType === 'leave'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="申请人姓名" prop="formData.applyName">
                                <el-input v-model="form.formData.applyName"
                                    :placeholder="$store.getters.userInfo.nickName" disabled />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="所在部门" prop="formData.deptName">
                                <el-input v-model="form.formData.deptName"
                                    :placeholder="$store.getters.userInfo.dept.deptName" disabled />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="员工类型" prop="formData.position">
                                <!-- <el-input v-model="form.formData.position" placeholder="输入不超过20字符" maxlength="20"  /> -->
                                <el-select v-model="form.formData.position" placeholder="请选择员工类型">
                                    <el-option label="中心员工" value="中心员工"></el-option>
                                    <el-option label="借聘员工" value="借聘员工"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="参加工作时间" prop="formData.workStartDate">
                                <el-date-picker v-model="form.formData.workStartDate" type="date" placeholder="选择日期"
                                    value-format="yyyy-MM-dd" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="请假类别" prop="formData.leaveType">
                        <el-select v-model="form.formData.leaveType" placeholder="请选择请假类别">
                            <template v-if="dict.type.leave_type.length > 0">
                                <el-option v-for="dict in dict.type.leave_type" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </template>
                            <template v-else>
                                <el-option label="病假" value="sick"></el-option>
                                <el-option label="事假" value="personal"></el-option>
                                <el-option label="年休假" value="annual"></el-option>
                                <el-option label="婚假" value="marriage"></el-option>
                                <el-option label="产假" value="maternity"></el-option>
                                <el-option label="护理假" value="nursing"></el-option>
                                <el-option label="丧假" value="funeral"></el-option>
                                <el-option label="其他" value="other"></el-option>
                            </template>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="请假天数" prop="formData.leaveDays">
                        <el-input v-model="form.formData.leaveDays" placeholder="根据请假时间自动生成" disabled />
                    </el-form-item>
                    <el-form-item label="请假时间" prop="formData.leaveTime">
                        <el-date-picker v-model="form.formData.leaveTime" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"
                            format="yyyy-MM-dd HH:mm" :picker-options="{ format: 'yyyy-MM-dd HH:mm' }"></el-date-picker>
                        <div style="color: #909399; font-size: 12px; margin-top: 5px">
                            休假共计{{ form.formData.totalDays }}，其中工作日
                            <input
                                style="border: none; outline: none; background: transparent; border-bottom: 1px solid #dcdfe6; color: #909399; width: 50px"
                                type="number" v-model="form.formData.workdayCount" :min="0" :precision="1" :step="0.5"
                                placeholder="请手动填写实际工作日天数" />
                            天
                        </div>
                    </el-form-item>

                    <el-form-item label="请假原因" prop="formData.leaveReason">
                        <el-input type="textarea" v-model="form.formData.leaveReason" placeholder="输入不超过500字符"
                            :autosize="{ minRows: 3, maxRows: 6 }" maxlength="500" />
                    </el-form-item>
                    <el-form-item label="附件" prop="formData.fileUrl">
                        <FileUpload v-model="form.formData.fileUrl"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'doc', 'docx', 'xls', 'xlsx']" />
                    </el-form-item>
                </template>
                <!-- 添加其他事务类型的表单 -->

                <!-- 出差类型表单 -->
                <template v-if="form.affairsType === 'away'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="部门名称" prop="formData.deptName">
                                <el-input v-model="form.formData.deptName"
                                    :placeholder="$store.getters.userInfo.dept.deptName" disabled />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="出差人员" prop="formData.applyName">
                                <el-input v-model="form.formData.applyName"
                                    :placeholder="$store.getters.userInfo.nickName" disabled />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="出差事由" prop="formData.awayReason">
                        <el-input type="textarea" v-model="form.formData.awayReason" placeholder="输入不超过500字符"
                            :autosize="{ minRows: 2, maxRows: 4 }" maxlength="500" />
                    </el-form-item>
                    <el-form-item label="出差地点" prop="formData.awayLocation">
                        <el-input v-model="form.formData.awayLocation" placeholder="输入不超过200字符" maxlength="200" />
                    </el-form-item>
                    <el-form-item label="出差时间" prop="formData.awayTime">
                        <el-date-picker v-model="form.formData.awayTime" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="附件" prop="formData.travelExpenseFiles">
                        <FileUpload @upload-success="handleTravelExpenseSuccess" ref="travelExpenseUpload"
                            v-model="form.formData.travelExpenseFiles"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff']" />
                    </el-form-item>
                </template>

                <!-- 拨款类型表单 -->
                <template v-if="form.affairsType === 'grant'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="款项支付公司" prop="formData.payCompany">
                                <el-input v-model="form.formData.payCompany" placeholder="请输入款项支付公司" maxlength="100" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="付款金额" prop="formData.payAmount">
                                <el-input v-model="form.formData.payAmount" placeholder="请输入付款金额" type="number" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="付款类型" prop="formData.payType">
                                <el-select v-model="form.formData.payType" placeholder="请选择付款类型">
                                    <el-option label="合同付款" value="contract"></el-option>
                                    <el-option label="非合同付款" value="nonContract"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="收款方全称" prop="formData.receiverName">
                                <el-input v-model="form.formData.receiverName" placeholder="请输入收款方全称" maxlength="100" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="合同名称" prop="formData.contractName">
                                <el-input v-model="form.formData.contractName" placeholder="请输入合同名称" maxlength="100" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="付款项目分类" prop="formData.payCategory">
                                <el-input v-model="form.formData.payCategory" placeholder="请输入付款项目分类" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="合同累积付款金额" prop="formData.contractTotalPaid">
                                <el-input v-model="form.formData.contractTotalPaid" placeholder="请输入合同累积付款金额"
                                    type="number" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="付款方式" prop="formData.payMethod">
                                <el-input v-model="form.formData.payMethod" value="电汇" disabled />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="计划付款日期" prop="formData.planPayDate">
                                <el-date-picker v-model="form.formData.planPayDate" type="date" placeholder="选择日期"
                                    value-format="yyyy-MM-dd" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="收款方银行账号" prop="formData.receiverBankAccount">
                                <el-input v-model="form.formData.receiverBankAccount" placeholder="请输入收款方银行账号" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="收款方开户行" prop="formData.receiverBank">
                                <el-input v-model="form.formData.receiverBank" placeholder="请输入收款方开户行" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="付款内容描述" prop="formData.payDescription">
                        <el-input type="textarea" v-model="form.formData.payDescription" placeholder="请输入付款内容描述"
                            :autosize="{ minRows: 3, maxRows: 6 }" maxlength="500" />
                    </el-form-item>

                    <!-- 拨款类型的关联申请单选择 -->
                    <el-row v-if="form.affairsType === 'grant'">
                        <el-col :span="12">
                            <el-form-item label="关联申请单" prop="formData.relatedApplication">
                                <el-select v-model="form.formData.relatedApplication" placeholder="请选择关联申请单"
                                    @change="handleRelatedApplicationChange">
                                    <el-option label="合同审批单" value="合同审批单"></el-option>
                                    <el-option label="零星采购申请单" value="零星采购申请单"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" v-if="form.formData.relatedApplication">
                            <el-form-item :label="form.formData.relatedApplication"
                                prop="formData.relatedApplicationId">
                                <el-select v-model="form.formData.relatedApplicationId" placeholder="请选择具体申请单"
                                    @change="handleRelatedApplicationIdChange">
                                    <el-option v-for="item in relatedApplicationList" :key="item.id"
                                        :label="item.applyNo ? `${item.applyNo} - ${item.displayLabel}` : item.displayLabel"
                                        :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="付款凭证照片" prop="formData.payProofFiles">
                        <FileUpload @upload-success="handlePayProofSuccess" ref="payProofUpload"
                            v-model="form.formData.payProofFiles"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff']" />
                    </el-form-item>
                </template>

                <!-- 报销类型表单 -->
                <template v-if="form.affairsType === 'expense'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="付款金额" prop="formData.payAmount">
                                <el-input-number v-model="form.formData.payAmount" :precision="2" :min="0" :step="0.01"
                                    placeholder="请输入金额，保留小数点后两位" style="width: 100%" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="付款方式" prop="formData.payMethod">
                                <el-input v-model="form.formData.payMethod" disabled value="电汇" maxlength="50" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="收款方全称" prop="formData.receiverName">
                                <el-input v-model="form.formData.receiverName" placeholder="请输入收款方全称" maxlength="100" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="收款方银行账号" prop="formData.receiverBankAccount">
                                <el-input v-model="form.formData.receiverBankAccount" placeholder="请输入收款方银行账号" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="收款方开户行" prop="formData.receiverBank">
                                <el-input v-model="form.formData.receiverBank" placeholder="请输入收款方开户行" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="计划付款日期" prop="formData.planPayDate">
                        <el-date-picker v-model="form.formData.planPayDate" type="date" placeholder="选择日期"
                            value-format="yyyy-MM-dd" />
                    </el-form-item>

                    <el-form-item label="付款内容描述" prop="formData.payDescription">
                        <el-input type="textarea" v-model="form.formData.payDescription" placeholder="请输入付款内容描述"
                            :autosize="{ minRows: 3, maxRows: 6 }" maxlength="500" />
                    </el-form-item>

                    <!-- 报销类型的关联申请单选择 -->
                    <el-row v-if="form.affairsType === 'expense'">
                        <el-col :span="12">
                            <el-form-item label="关联申请单" prop="formData.relatedApplication">
                                <el-select v-model="form.formData.relatedApplication" placeholder="请选择关联申请单"
                                    @change="handleRelatedApplicationChange">
                                    <el-option label="业务招待审批" value="业务招待审批"></el-option>
                                    <el-option label="零星采购申请单" value="零星采购申请单"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" v-if="form.formData.relatedApplication">
                            <el-form-item :label="form.formData.relatedApplication"
                                prop="formData.relatedApplicationId">
                                <el-select v-model="form.formData.relatedApplicationId" placeholder="请选择具体申请单"
                                    @change="handleRelatedApplicationIdChange">
                                    <el-option v-for="item in relatedApplicationList" :key="item.id"
                                        :label="item.applyNo ? `${item.applyNo} - ${item.displayLabel}` : item.displayLabel"
                                        :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="付款凭证照片" prop="formData.payProofFiles">
                        <FileUpload @upload-success="handlePayProofSuccess" ref="payProofUpload"
                            v-model="form.formData.payProofFiles"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff']" />
                    </el-form-item>
                </template>

                <!-- 用印申请类型表单 -->
                <template v-if="form.affairsType === 'officialSeal'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="申请部门" prop="formData.applyDept">
                                <el-input v-model="form.formData.applyDept"
                                    :placeholder="$store.getters.userInfo.dept.deptName" disabled />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="印章名称" prop="formData.sealType">
                                <el-checkbox-group v-model="form.formData.sealType">
                                    <el-checkbox label="公章">公章</el-checkbox>
                                    <el-checkbox label="财务章">财务章</el-checkbox>
                                    <el-checkbox label="法人章">法人章</el-checkbox>
                                    <el-checkbox label="其他">其他</el-checkbox>
                                </el-checkbox-group>
                                <el-input v-if="form.formData.sealType && form.formData.sealType.includes('其他')"
                                    v-model="form.formData.otherSealNote" placeholder="请输入其他印章说明"
                                    style="margin-top: 10px" maxlength="50" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="用章类别" prop="formData.usageType">
                        <el-radio-group v-model="form.formData.usageType">
                            <el-radio label="加盖印章">加盖印章</el-radio>
                        </el-radio-group>
                        <div v-if="form.formData.usageType === '加盖印章'" style="margin-top: 10px; margin-left: 20px">
                            <span>材料份数：</span>
                            <el-input-number v-model="form.formData.documentCount" :min="1" :max="100" size="small"
                                style="width: 120px"></el-input-number>
                        </div>
                    </el-form-item>

                    <el-form-item label="用章事由" prop="formData.sealReason">
                        <el-input type="textarea" v-model="form.formData.sealReason" placeholder="请详细说明用章目的和内容"
                            :autosize="{ minRows: 3, maxRows: 6 }" maxlength="500" />
                    </el-form-item>
                    <el-form-item label="附件" prop="formData.fileUrl">
                        <FileUpload v-model="form.formData.fileUrl"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'doc', 'docx', 'xls', 'xlsx']" />
                    </el-form-item>
                </template>

                <!-- 业务招待申请类型表单 -->
                <template v-if="form.affairsType === 'hospitality'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="招待日期及时间" prop="formData.hospitalityDateTime">
                                <el-input v-model="form.formData.hospitalityDateTime" placeholder="招待日期及时间"
                                    maxlength="100" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="招待地点" prop="formData.hospitalityLocation">
                                <el-input v-model="form.formData.hospitalityLocation" placeholder="招待地点"
                                    maxlength="100" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="招待单位" prop="formData.hospitalityUnit">
                                <el-input v-model="form.formData.hospitalityUnit" placeholder="招待单位" maxlength="100" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="招待人数" prop="formData.hospitalityCount">
                                <el-input-number v-model="form.formData.hospitalityCount" :min="1" placeholder="招待人数" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="申请事由" prop="formData.hospitalityReason">
                        <el-input type="textarea" v-model="form.formData.hospitalityReason" placeholder="申请事由"
                            :autosize="{ minRows: 3, maxRows: 6 }" maxlength="500" />
                    </el-form-item>

                    <el-form-item label="我方参与人员" prop="formData.ourParticipants">
                        <el-input type="textarea" v-model="form.formData.ourParticipants" placeholder="我方参与人员"
                            :autosize="{ minRows: 2, maxRows: 4 }" maxlength="200" />
                    </el-form-item>

                    <el-form-item label="预计消费金额" prop="formData.estimatedAmount">
                        <el-input-number v-model="form.formData.estimatedAmount" :precision="2" :min="0" :step="0.01"
                            placeholder="请输入金额" />
                    </el-form-item>
                    <el-form-item label="附件" prop="formData.fileUrl">
                        <FileUpload v-model="form.formData.fileUrl"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'doc', 'docx', 'xls', 'xlsx']" />
                    </el-form-item>
                </template>

                <!-- 其他类型表单 -->
                <template v-if="form.affairsType === 'other'">
                    <el-form-item label="事务标题" prop="formData.title">
                        <el-input v-model="form.formData.title" placeholder="请输入事务标题" />
                    </el-form-item>
                    <el-form-item label="申请事项" prop="formData.applyMatter">
                        <el-input v-model="form.formData.applyMatter" type="textarea" />
                    </el-form-item>
                    <el-form-item label="附件" prop="formData.fileUrl">
                        <FileUpload @upload-success="handlePayProofSuccess" ref="payProofUpload"
                            v-model="form.formData.fileUrl"
                            :fileType="['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff']" />
                    </el-form-item>
                </template>

                <!-- 零星采购申请类型表单 -->
                <template v-if="form.affairsType === 'procurement'">
                    <el-form-item label="购买类型" prop="formData.purchaseType">
                        <el-input v-model="form.formData.purchaseType" placeholder="输入不超过100字符" maxlength="100" />
                    </el-form-item>

                    <el-form-item label="原因及用途说明" prop="formData.applyReason" style="text-align: left">
                        <el-input type="textarea" v-model="form.formData.applyReason" placeholder="输入不超过500字符"
                            :autosize="{ minRows: 3, maxRows: 6 }" maxlength="500" />
                    </el-form-item>

                    <el-form-item label="商品明细" prop="formData.items">
                        <el-table :data="form.formData.items" border style="width: 100%">
                            <el-table-column label="名称" width="180">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.name" placeholder="名称" maxlength="50" />
                                </template>
                            </el-table-column>
                            <el-table-column label="品牌">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.brand" placeholder="品牌" maxlength="50" />
                                </template>
                            </el-table-column>
                            <el-table-column label="型号">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.model" placeholder="型号" maxlength="50" />
                                </template>
                            </el-table-column>
                            <el-table-column label="数量" width="120">
                                <template slot-scope="scope">
                                    <el-input-number style="width: 100%" v-model="scope.row.quantity" :min="1"
                                        @change="calculateSubtotal(scope.$index)" :controls="false" />
                                </template>
                            </el-table-column>
                            <el-table-column label="单位" width="100">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.unit" placeholder="单位" maxlength="10" />
                                </template>
                            </el-table-column>
                            <el-table-column label="单价" width="150">
                                <template slot-scope="scope">
                                    <el-input-number style="width: 100%" v-model="scope.row.price" :precision="2"
                                        :min="0" :step="0.01" @change="calculateSubtotal(scope.$index)"
                                        :controls="false" />
                                </template>
                            </el-table-column>
                            <el-table-column label="小计" width="150">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.subtotal }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="商品购买链接" width="200">
                                <template slot-scope="scope">
                                    <el-input v-model="scope.row.purchaseLink" placeholder="非必填项" />
                                </template>
                            </el-table-column>
                            <el-table-column label="附件" width="200">
                                <template slot-scope="scope">
                                    <FileUpload @upload-success="files => handleItemFileSuccess(files, scope.$index)"
                                        :ref="`itemFileUpload${scope.$index}`" v-model="scope.row.fileUrl"
                                        :fileType="['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']" />
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="80">
                                <template slot-scope="scope">
                                    <el-button type="danger" icon="el-icon-delete" size="mini" circle
                                        @click="removeItem(scope.$index)" />
                                </template>
                            </el-table-column>
                        </el-table>
                        <div style="margin-top: 10px; text-align: right">
                            <el-button type="primary" icon="el-icon-plus" size="mini" @click="addItem">添加商品</el-button>
                        </div>
                    </el-form-item>

                    <el-form-item label="总计金额">
                        <el-input v-model="form.formData.totalAmount" readonly placeholder="系统自动计算">
                            <template slot="append">元</template>
                        </el-input>
                    </el-form-item>
                </template>

                <!-- 合同审批表单 -->
                <template v-if="form.affairsType === 'contract'">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="申请人姓名" prop="formData.applyName">
                                <el-input v-model="form.formData.applyName"
                                    :placeholder="$store.getters.userInfo.nickName" disabled />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="申请人部门" prop="formData.deptName">
                                <el-input v-model="form.formData.deptName"
                                    :placeholder="$store.getters.userInfo.dept.deptName" disabled />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="合同承办部门" prop="formData.contractDepartment">
                                <el-input v-model="form.formData.contractDepartment" placeholder="输入不超过100字符"
                                    maxlength="100" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="合同签订方式" prop="formData.negotiators">
                                <el-input v-model="form.formData.negotiators" placeholder="输入不超过200字符"
                                    maxlength="200" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="合同名称" prop="formData.contractName">
                        <el-input v-model="form.formData.contractName" placeholder="输入不超过200字符" maxlength="200" />
                    </el-form-item>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="甲方单位名称" prop="formData.partyA">
                                <el-input v-model="form.formData.partyA" placeholder="输入不超过100字符" maxlength="100" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="乙方单位名称" prop="formData.partyB">
                                <el-input v-model="form.formData.partyB" placeholder="输入不超过200字符" maxlength="200" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="丙方单位名称" prop="formData.partyC">
                        <el-input v-model="form.formData.partyC" placeholder="输入不超过100字符" maxlength="100" />
                    </el-form-item>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="签约日期" prop="formData.signingDate">
                                <el-date-picker v-model="form.formData.signingDate" type="date" placeholder="选择日期"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="合同开始时间" prop="formData.contractStartDate">
                                <el-date-picker v-model="form.formData.contractStartDate" type="date" placeholder="选择日期"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>

                    </el-row>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="合同终止时间" prop="formData.contractEndDate">
                                <el-date-picker v-model="form.formData.contractEndDate" type="date" placeholder="选择日期"
                                    style="width: 100%" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="合同内容" prop="formData.contractContent">
                        <el-input type="textarea" v-model="form.formData.contractContent" placeholder="输入不超过5000字符"
                            :autosize="{ minRows: 4, maxRows: 10 }" maxlength="5000" />
                    </el-form-item>

                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="合同金额" prop="formData.contractAmount">
                                <el-input-number v-model="form.formData.contractAmount" :precision="2" :min="0"
                                    :step="0.01" placeholder="请输入金额，保留小数点后两位" style="width: 100%" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="合同份数" prop="formData.contractCopies">
                                <el-input-number v-model="form.formData.contractCopies" :min="1" :precision="0"
                                    placeholder="请输入数字" style="width: 100%" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="附件" prop="formData.attachment">
                        <FileUpload @upload-success="handleContractFileSuccess" ref="contractFileUpload"
                            v-model="form.formData.attachment"
                            :fileType="['png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']" :fileSize="5" />
                        <div class="el-upload__tip" slot="tip">文件大小不超过5M</div>
                    </el-form-item>
                </template>

                <!-- 审批人选择部分，只在选择了事务类型后显示 -->
                <template v-if="form.affairsType">
                    <el-divider content-position="left">审批流程</el-divider>
                    <el-form-item label="审批人" prop="checkIds">
                        <ApproverSelector ref="approverSelector" :value="approvers" @change="updateCheckIds"
                            @input="val => (approvers = val)" :affairsType="form.affairsType" 
                            :employeePosition="form.formData.position" />
                    </el-form-item>

                    <!-- 新增抄送人选择 -->
                    <el-form-item label="抄送人" prop="ccList">
                        <el-cascader v-model="form.ccList" :options="deptUserTree"
                            :props="{ multiple: true, checkStrictly: true, value: 'id', label: 'label', children: 'children', emitPath: false }"
                            placeholder="请选择抄送人" style="width: 100%" clearable filterable>
                            <template slot-scope="{ node, data }">
                                <span>{{ data.label }}</span>
                                <span v-if="!data.isUser && data.children && data.children.length > 0"> ({{
                                    data.children.length }}) </span>
                            </template>
                        </el-cascader>
                        <div style="font-size: 12px; color: #909399; margin-top: 5px;">
                            抄送人将收到事务申请的通知，但不参与审批流程
                        </div>
                    </el-form-item>
                </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" v-hasPermi="['project:affairsApply:revoke']" @click="submitForm">确
                    定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { addAffairsApply, updateAffairsApply, getAllUser, listAffairsApply } from '@/api/oa/affairsApply';
import { getDeptUserTree } from '@/api/oa/publicApi';
import ApproverSelector from '@/views/oa/components/ApproverSelector.vue';

export default {
    name: 'AffairsDialog',
    dicts: ['affairs_type', 'leave_type'],
    components: {
        ApproverSelector
    },
    props: {
        // 对话框标题
        title: {
            type: String,
            default: ''
        },
        // 是否显示对话框
        open: {
            type: Boolean,
            default: false
        },
        // 表单数据
        formData: {
            type: Object,
            default: () => ({})
        },
        // 事务申请列表（用于关联申请单选择）
        affairsApplyList: {
            type: Array,
            default: () => []
        },
        // 所有用户列表
        allUserList: {
            type: Array,
            default: () => []
        }
    },
    watch: {
        'form.formData.leaveTime': {
            handler(newVal) {
                if (newVal && newVal.length === 2) {
                    // 计算请假天数
                    const startDate = new Date(newVal[0]);
                    const endDate = new Date(newVal[1]);
                    const formattedDays = this.calculateWorkDays(startDate, endDate);
                    this.form.formData.leaveDays = formattedDays;

                    // 设置总天数（包含周末），供用户参考
                    this.form.formData.totalDays = this.calculateTotalDays(startDate, endDate);

                    // 默认将实际工作日数设置为系统计算的天数
                    // 用户可以根据实际情况修改
                    if (!this.form.formData.workdayCount) {
                        // 提取数字部分作为默认的工作日数
                        const numericPart = parseFloat(formattedDays.match(/\d+(\.\d+)?/));
                        this.form.formData.workdayCount = isNaN(numericPart) ? 0 : numericPart;
                    }
                } else {
                    this.form.formData.leaveDays = '';
                    this.form.formData.totalDays = '';
                    this.form.formData.workdayCount = 0;
                }
            },
            immediate: true
        },
        // 添加监听 workdayCount 变化
        'form.formData.workdayCount': {
            handler(newVal) {
                if (newVal !== null && newVal !== undefined && newVal !== '') {
                    // 当 workdayCount 更改时，leaveDays 也更改为相同的值
                    this.form.formData.leaveDays = newVal.toString();
                }
            }
        },
        formData: {
            handler(newVal) {
                if (newVal) {
                    this.form = JSON.parse(JSON.stringify(newVal));

                    // 初始化审批人数组
                    if (this.form.checkIds && typeof this.form.checkIds === 'string') {
                        const checkIdsArray = this.form.checkIds.split(',').filter(id => id);
                        this.approvers = checkIdsArray.map(userId => ({ userId }));
                        if (this.approvers.length === 0) {
                            this.approvers = [{ userId: null }];
                        }
                    } else if (Array.isArray(this.form.checkIds) && this.form.checkIds.length > 0) {
                        this.approvers = this.form.checkIds.map(userId => ({ userId }));
                    } else {
                        this.approvers = [{ userId: null }];
                    }

                    // 初始化抄送人，将 [id] 格式转换为 ['user_' + id] 格式以适配级联选择器
                    if (this.form.ccList && Array.isArray(this.form.ccList)) {
                        this.form.ccList = this.form.ccList.map(userId => `user_${userId}`);
                    } else {
                        this.form.ccList = [];
                    }
                }
            },
            immediate: true,
            deep: true
        },
        'form.formData.expenseItems': {
            handler() {
                this.calculateTotalAmount();
            },
            deep: true
        },
        open(newVal) {
            if (newVal) {
                // 对话框打开时，重置审批人选择器
                this.$nextTick(() => {
                    if (this.$refs.approverSelector) {
                        this.$refs.approverSelector.initApprovers();
                    }
                });
            }
        }
    },
    data() {
        return {
            // 部门用户树
            deptUserTree: [],
            // 审批人列表
            approvers: [{ userId: null }],
            // 部门用户树配置
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
            // 表单参数
            form: {
                id: null,
                title: null,
                affairsType: null,
                applyMatter: null,
                fileUrl: '',
                checkIds: [],
                checkDeptId: null,
                ccList: [], // 新增抄送人列表
                formData: {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptId: this.$store.getters.userInfo.deptId,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    position: '',
                    workStartDate: '',
                    leaveType: '',
                    leaveDays: '',
                    totalDays: '',
                    workdayCount: null,
                    leaveTime: [],
                    leaveReason: '',
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                }
            },
            // 表单校验规则
            rules: {
                'formData.position': [
                    { required: true, message: '请输入职务职级', trigger: 'blur' }, { max: 20, message: '长度不能超过20个字符', trigger: 'blur' }
                ],
                'formData.workStartDate': [{ required: true, message: '请选择参加工作时间', trigger: 'change' }],
                'formData.leaveType': [{ required: true, message: '请选择请假类别', trigger: 'change' }],
                'formData.leaveTime': [{ required: true, message: '请选择请假时间', trigger: 'change' }],
                'formData.leaveReason': [
                    { required: true, message: '请输入请假原因', trigger: 'blur' },
                    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
                ],
                'formData.awayReason': [
                    { required: true, message: '请输入出差事由', trigger: 'blur' },
                    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
                ],
                'formData.awayLocation': [
                    { required: true, message: '请输入出差地点', trigger: 'blur' },
                    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
                ],
                'formData.awayTime': [{ required: true, message: '请选择出差时间', trigger: 'change' }],
                'formData.deptLeaderOpinion': [{ max: 200, message: '长度不能超过200个字符', trigger: 'blur' }],
                'formData.centerLeaderOpinion': [{ max: 200, message: '长度不能超过200个字符', trigger: 'blur' }],
                // 报销类型表单验证规则
                'formData.receiverBankAccount': [{ required: true, message: '请输入收款方银行账号', trigger: 'blur' }],
                'formData.receiverBank': [{ required: true, message: '请输入收款方开户行', trigger: 'blur' }],
                'formData.planPayDate': [{ required: true, message: '请选择计划付款日期', trigger: 'change' }],
                'formData.payDescription': [
                    { required: true, message: '请输入付款内容描述', trigger: 'blur' },
                    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
                ],
                'formData.receiverName': [{ required: true, message: '请输入收款方全称', trigger: 'blur' }],
                'formData.payAmount': [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
                // 'formData.relatedApplication': [{ required: true, message: '请选择关联申请单', trigger: 'change' }],
                'formData.title': [
                    { required: true, message: '事务标题不能为空', trigger: 'blur' },
                    {
                        min: 2,
                        max: 50,
                        message: '标题长度在2-50个字符之间',
                        trigger: 'blur'
                    }
                ],
                checkIds: [{ required: true, message: '请选择审批人', trigger: 'change' }],
                'formData.traveler': [{ required: true, message: '请输入出差人员', trigger: 'blur' }],
                'formData.travelReason': [
                    { required: true, message: '请输入出差事由', trigger: 'blur' },
                    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
                ],
                // 用印申请验证规则
                'formData.sealType': [
                    { required: true, message: '请选择印章名称', trigger: 'change' },
                    { type: 'array', min: 1, message: '至少选择一种印章', trigger: 'change' }
                ],
                'formData.sealReason': [
                    { required: true, message: '请输入用章事由', trigger: 'blur' },
                    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
                ],
                'formData.workdayCount': [{ required: true, message: '请填写实际工作日天数', trigger: 'blur' }],
                'formData.hospitalityDateTime': [
                    { required: true, message: '请输入招待日期及时间', trigger: 'blur' },
                    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
                ],
                'formData.hospitalityLocation': [
                    { required: true, message: '请输入招待地点', trigger: 'blur' },
                    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
                ],
                'formData.hospitalityUnit': [
                    { required: true, message: '请输入招待单位', trigger: 'blur' },
                    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
                ],
                'formData.hospitalityCount': [{ required: true, message: '请输入招待人数', trigger: 'blur' }],
                'formData.hospitalityReason': [
                    { required: true, message: '请输入申请事由', trigger: 'blur' },
                    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
                ],
                'formData.ourParticipants': [
                    { required: true, message: '请输入我方参与人员', trigger: 'blur' },
                    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
                ],
                'formData.estimatedAmount': [{ required: true, message: '请输入预计消费金额', trigger: 'blur' }],
                'formData.purchaseType': [
                    { required: true, message: '请输入购买类型', trigger: 'blur' },
                    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
                ],
                'formData.applyReason': [
                    { required: true, message: '请输入申请原因及用途说明', trigger: 'blur' },
                    { max: 500, message: '长度不能超过500个字符', trigger: 'blur' }
                ],
                'formData.contractDepartment': [
                    { required: true, message: '请输入合同承办部门', trigger: 'blur' },
                    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
                ],
                'formData.negotiators': [
                    { required: true, message: '请输入合同签订方式', trigger: 'blur' },
                    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
                ],
                'formData.contractName': [
                    { required: true, message: '请输入合同名称', trigger: 'blur' },
                    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
                ],
                'formData.partyA': [
                    { required: true, message: '请输入甲方单位名称', trigger: 'blur' },
                    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
                ],
                'formData.partyB': [
                    { required: true, message: '请输入乙方单位名称', trigger: 'blur' },
                    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
                ],
                'formData.partyC': [{ max: 100, message: '长度不能超过100个字符', trigger: 'blur' }],
                'formData.signingDate': [{ required: true, message: '请选择签约日期', trigger: 'change' }],
                'formData.contractStartDate': [{ required: true, message: '请选择合同开始时间', trigger: 'change' }],
                'formData.contractEndDate': [{ required: true, message: '请选择合同终止时间', trigger: 'change' }],
                'formData.contractContent': [
                    { required: true, message: '请输入合同内容', trigger: 'blur' },
                    { max: 5000, message: '长度不能超过5000个字符', trigger: 'blur' }
                ],
                'formData.contractAmount': [{ required: true, message: '请输入合同金额', trigger: 'blur' }],
                'formData.contractCopies': [{ required: true, message: '请输入合同份数', trigger: 'blur' }]
            },
            relatedApplicationList: [], // 关联申请单列表
        };
    },
    created() {
        this.getDeptUserTree();
    },
    methods: {
        // 获取部门用户树
        getDeptUserTree() {
            getDeptUserTree().then(response => {
                // 处理树数据，将userList转换为子节点
                this.deptUserTree = this.processTreeData(response.data);
            });
        },
        // 处理树数据
        processTreeData(treeData) {
            if (!treeData || !treeData.length) return [];

            return treeData.map(node => {
                const processedNode = { ...node };

                // 确保部门节点有正确的label
                if (!node.isUser) {
                    processedNode.label = node.deptName || node.name || node.label;
                }

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
        // 计算工作日天数
        calculateWorkDays(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
            const workHoursPerDay = 8.5; // 每天工作8.5小时（8:30-17:00）

            // 公司工作时间：8:30-17:00
            const workdayStart = 8.5; // 8:30
            const workdayEnd = 17; // 17:00

            // 如果开始时间晚于结束时间，返回0
            if (startDate >= endDate) {
                return this.formatDaysHours(0);
            }

            // 复制日期对象，避免修改原始日期
            const start = new Date(startDate);
            const end = new Date(endDate);

            // 总工作小时数
            let totalWorkHours = 0;

            // 处理同一天的情况
            if (start.toDateString() === end.toDateString()) {
                // 检查是否是工作日（周一至周五）
                const dayOfWeek = start.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;

                    // 计算有效工作时间
                    if (endHour <= workdayStart || startHour >= workdayEnd) {
                        // 完全在工作时间外
                        totalWorkHours = 0;
                    } else {
                        // 计算工作时间
                        const effectiveStart = Math.max(startHour, workdayStart);
                        const effectiveEnd = Math.min(endHour, workdayEnd);
                        totalWorkHours += Math.max(0, effectiveEnd - effectiveStart);
                    }
                }
            } else {
                // 处理跨天情况

                // 1. 处理第一天
                const firstDayOfWeek = start.getDay();
                if (firstDayOfWeek !== 0 && firstDayOfWeek !== 6) {
                    const startHour = start.getHours() + start.getMinutes() / 60;

                    if (startHour < workdayEnd) {
                        const effectiveStart = Math.max(startHour, workdayStart);
                        totalWorkHours += Math.max(0, workdayEnd - effectiveStart);
                    }
                }

                // 2. 处理中间的完整工作日
                const middleStart = new Date(start);
                middleStart.setDate(middleStart.getDate() + 1);
                middleStart.setHours(0, 0, 0, 0);

                const middleEnd = new Date(end);
                middleEnd.setHours(0, 0, 0, 0);

                let currentDate = new Date(middleStart);
                while (currentDate < middleEnd) {
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        // 工作日
                        totalWorkHours += workHoursPerDay;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // 3. 处理最后一天
                const lastDayOfWeek = end.getDay();
                if (lastDayOfWeek !== 0 && lastDayOfWeek !== 6) {
                    const endHour = end.getHours() + end.getMinutes() / 60;

                    if (endHour > workdayStart) {
                        const effectiveEnd = Math.min(endHour, workdayEnd);
                        totalWorkHours += Math.max(0, effectiveEnd - workdayStart);
                    }
                }
            }

            // 将小时转换为天数
            const days = totalWorkHours / workHoursPerDay;

            // 返回格式化的结果
            return this.formatDaysHours(days);
        },

        // 将天数转换为"x天xx小时"格式
        formatDaysHours(days) {
            const workHoursPerDay = 8.5; // 每天工作8.5小时

            const totalHours = days * workHoursPerDay;
            const wholeDays = Math.floor(days);
            const remainingHours = Math.round((totalHours - wholeDays * workHoursPerDay) * 10) / 10;

            if (wholeDays === 0) {
                if (remainingHours === 0) {
                    return '0天0小时';
                }
                return `${remainingHours}小时`;
            } else if (remainingHours === 0) {
                return `${wholeDays}天`;
            } else {
                return `${wholeDays}天${remainingHours}小时`;
            }
        },
        // 计算总天数（包含周末）
        calculateTotalDays(startDate, endDate) {
            // 如果开始时间晚于结束时间，返回0
            if (startDate >= endDate) {
                return '0天';
            }

            // 复制日期对象，避免修改原始日期
            const start = new Date(startDate);
            const end = new Date(endDate);

            // 工作时间定义：8:30-17:00
            const workdayStart = 8.5; // 8:30
            const workdayEnd = 17; // 17:00
            const workHoursPerDay = workdayEnd - workdayStart; // 8.5小时

            let totalWorkHours = 0;

            // 处理同一天的情况
            if (start.toDateString() === end.toDateString()) {
                // 检查是否是工作日（周一至周五）
                const dayOfWeek = start.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;

                    // 计算有效工作时间
                    if (endHour <= workdayStart || startHour >= workdayEnd) {
                        // 完全在工作时间外
                        totalWorkHours = 0;
                    } else {
                        // 计算工作时间
                        const effectiveStart = Math.max(startHour, workdayStart);
                        const effectiveEnd = Math.min(endHour, workdayEnd);
                        totalWorkHours += Math.max(0, effectiveEnd - effectiveStart);
                    }
                }
            } else {
                // 处理跨天情况

                // 1. 处理第一天
                const firstDayOfWeek = start.getDay();
                if (firstDayOfWeek !== 0 && firstDayOfWeek !== 6) {
                    const startHour = start.getHours() + start.getMinutes() / 60;

                    if (startHour < workdayEnd) {
                        const effectiveStart = Math.max(startHour, workdayStart);
                        totalWorkHours += Math.max(0, workdayEnd - effectiveStart);
                    }
                }

                // 2. 处理中间的完整工作日
                const middleStart = new Date(start);
                middleStart.setDate(middleStart.getDate() + 1);
                middleStart.setHours(0, 0, 0, 0);

                const middleEnd = new Date(end);
                middleEnd.setHours(0, 0, 0, 0);

                let currentDate = new Date(middleStart);
                while (currentDate < middleEnd) {
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        // 工作日
                        totalWorkHours += workHoursPerDay;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // 3. 处理最后一天
                const lastDayOfWeek = end.getDay();
                if (lastDayOfWeek !== 0 && lastDayOfWeek !== 6) {
                    const endHour = end.getHours() + end.getMinutes() / 60;

                    if (endHour > workdayStart) {
                        const effectiveEnd = Math.min(endHour, workdayEnd);
                        totalWorkHours += Math.max(0, effectiveEnd - workdayStart);
                    }
                }
            }

            // 将小时转换为天数
            const days = totalWorkHours / workHoursPerDay;

            // 返回格式化的结果
            return this.formatDaysHours(days);
        },
        // 处理事务类型变更
        handleTypeChange(value) {
            // 当事务类型变更时重置审批人
            this.approvers = [];

            // 根据事务类型初始化表单数据
            if (value === 'leave') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    position: '',
                    workStartDate: '',
                    leaveType: '',
                    leaveDays: '',
                    totalDays: '',
                    workdayCount: 0,
                    leaveTime: [],
                    leaveReason: '',
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            } else if (value === 'away') {
                this.form.formData = {
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    applyName: this.$store.getters.userInfo.nickName,
                    awayReason: '',
                    awayLocation: '',
                    awayTime: [],
                    travelExpenseFiles: '',
                    deptLeaderOpinion: '',
                    centerLeaderOpinion: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            } else if (value === 'grant') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    payCompany: '',
                    payAmount: '',
                    payType: '',
                    receiverName: '',
                    contractName: '',
                    payCategory: '',
                    contractTotalPaid: '',
                    payMethod: '电汇', // 默认为电汇
                    planPayDate: '',
                    receiverBankAccount: '',
                    receiverBank: '',
                    payDescription: '',
                    payProofFiles: '',
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
                // 如果需要，可以在这里加载关联的事务审批列表
                this.getRelatedApprovalList();
            } else if (value === 'expense') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    payAmount: null,
                    payMethod: '电汇', // 默认为电汇
                    receiverName: '',
                    receiverBankAccount: '',
                    receiverBank: '',
                    planPayDate: '',
                    payDescription: '',
                    payProofFiles: '',
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
                // 加载关联的事务审批列表
                this.getRelatedApprovalList();
            } else if (value === 'officialSeal') {
                this.form.formData = {
                    applyDept: this.$store.getters.userInfo.dept.deptName,
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    sealType: [],
                    usageType: '加盖印章',
                    documentCount: 1,
                    sealReason: '',
                    otherSealNote: '',
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            } else if (value === 'hospitality') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    hospitalityDateTime: '',
                    hospitalityLocation: '',
                    hospitalityUnit: '',
                    hospitalityCount: null,
                    hospitalityReason: '',
                    ourParticipants: '',
                    estimatedAmount: null,
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            } else if (value === 'other') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    title: '',
                    applyMatter: '',
                    fileUrl: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            } else if (value === 'procurement') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    purchaseType: '',
                    applyReason: '',
                    items: [], // 修改为空数组，默认0个商品明细
                    totalAmount: '0.00',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            } else if (value === 'contract') {
                this.form.formData = {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    deptId: this.$store.getters.userInfo.deptId,
                    contractDepartment: '',
                    negotiators: '',
                    contractName: '',
                    partyA: '',
                    partyB: '',
                    partyC: '',
                    signingDate: null,
                    contractStartDate: null,
                    contractEndDate: null,
                    contractContent: '',
                    contractAmount: null,
                    contractCopies: 1,
                    attachment: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                };
            }
        },
        // 处理付款凭证上传成功
        handlePayProofSuccess(fileList) {
            // 将文件列表转为JSON字符串存储
            this.form.formData.payProofFiles = JSON.stringify(
                fileList.map(file => {
                    return {
                        name: file.name,
                        url: file.url
                    };
                })
            );
        },
        // 获取关联的事务审批列表
        getRelatedApprovalList() {
            // 临时模拟数据
            this.relatedApplicationList = [
                { id: '1', title: '合同审批-合同名称1' },
                { id: '2', title: '专项采购申请-采购物品1' }
            ];
        },
        // 提交表单
        submitForm() {
            // 先验证审批人选择器
            if (this.$refs.approverSelector && !this.$refs.approverSelector.validate()) {
                // 如果审批人未全部选择或有重复，validate方法已经显示错误提示
                return;
            }

            this.$refs['form'].validate(valid => {
                if (valid) {
                    // 创建表单数据的副本
                    const submitData = JSON.parse(JSON.stringify(this.form));

                    // 处理关联申请单数据，确保包含ID和申请编号
                    if (submitData.formData.relatedApplicationId) {
                        // 确保关联申请单信息包含必要字段
                        submitData.formData.relatedApplicationInfo = {
                            id: submitData.formData.relatedApplicationId,
                            applyNo: submitData.formData.relatedApplicationNo || '',
                            relatedApplication: submitData.formData.relatedApplication || '',
                            // 如果有其他需要的字段，可以从relatedApplicationData中获取
                            ...(submitData.formData.relatedApplicationData ? {
                                title: submitData.formData.relatedApplicationData.title || '',
                                displayLabel: submitData.formData.relatedApplicationData.displayLabel || ''
                            } : {})
                        };

                        // 删除完整的关联申请单数据，避免数据过大
                        delete submitData.formData.relatedApplicationData;
                    }

                    // 如果是请假类型，将formData数据处理成字符串
                    if (
                        submitData.affairsType === 'leave' ||
                        submitData.affairsType === 'away' ||
                        submitData.affairsType === 'grant' ||
                        submitData.affairsType === 'expense' ||
                        submitData.affairsType === 'travel' ||
                        submitData.affairsType === 'officialSeal' ||
                        submitData.affairsType === 'hospitality' ||
                        submitData.affairsType === 'other' ||
                        submitData.affairsType === 'procurement' ||
                        submitData.affairsType === 'contract'
                    ) {
                        submitData.formData = JSON.stringify(submitData.formData);
                    }

                    // 处理抄送人列表
                    if (Array.isArray(submitData.ccList) && submitData.ccList.length > 0) {
                        const finalCcList = new Set();

                        const collectUsersInNode = (node) => {
                            if (node.isUser && node.userId) {
                                finalCcList.add(String(node.userId));
                            }
                            if (node.children) {
                                node.children.forEach(collectUsersInNode);
                            }
                        };

                        const findNodeById = (nodes, id) => {
                            for (const node of nodes) {
                                if (node.id === id) {
                                    return node;
                                }
                                if (node.children) {
                                    const found = findNodeById(node.children, id);
                                    if (found) return found;
                                }
                            }
                            return null;
                        };

                        submitData.ccList.forEach(id => {
                            const node = findNodeById(this.deptUserTree, id);
                            if (node) {
                                collectUsersInNode(node);
                            }
                        });

                        submitData.ccList = Array.from(finalCcList).map(id => ({ userId: id }));
                    } else {
                        submitData.ccList = [];
                    }

                    // 确保checkIds是字符串
                    if (Array.isArray(submitData.checkIds)) {
                        submitData.checkIds = submitData.checkIds.join(',');
                    }

                    // 触发提交事件，将数据传递给父组件
                    this.$emit('submit', submitData);
                }
            });
        },
        // 取消按钮
        cancel() {
            this.$emit('cancel');
            this.reset();
        },
        // 重置表单
        reset() {
            this.form = {
                id: null,
                title: null,
                affairsType: null,
                applyMatter: null,
                fileUrl: '',
                checkIds: [],
                checkDeptId: null,
                ccList: [], // 重置抄送人列表
                formData: {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptId: this.$store.getters.userInfo.deptId,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    position: '',
                    workStartDate: '',
                    leaveType: '',
                    leaveDays: '',
                    totalDays: '',
                    workdayCount: 0,
                    leaveTime: [],
                    leaveReason: '',
                    relatedApplication: '',
                    relatedApplicationId: null,
                    relatedApplicationNo: '',
                    relatedApplicationData: null
                }
            };
            this.approvers = [{ userId: null }];
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                // 重置文件上传组件
                if (this.$refs.payProofUpload) {
                    this.$refs.payProofUpload.clearFileList();
                }
                if (this.$refs.travelExpenseUpload) {
                    this.$refs.travelExpenseUpload.clearFileList();
                }
            });
        },
        // 添加费用项目
        addExpenseItem() {
            if (!this.form.formData.expenseItems) {
                this.form.formData.expenseItems = [];
            }
            this.form.formData.expenseItems.push({
                itemName: '',
                receiptCount: 0,
                amount: '',
                location: '',
                dateRange: [],
                days: 0,
                allowanceStandard: '',
                allowance: ''
            });
            this.calculateTotalAmount();
        },

        // 移除费用项目
        removeExpenseItem(index) {
            this.form.formData.expenseItems.splice(index, 1);
            this.calculateTotalAmount();
        },

        // 计算总金额
        calculateTotalAmount() {
            if (!this.form.formData.expenseItems || this.form.formData.expenseItems.length === 0) {
                this.form.formData.totalAmount = '0';
                return;
            }

            let total = 0;
            this.form.formData.expenseItems.forEach(item => {
                if (item.amount) {
                    total += parseFloat(item.amount) || 0;
                }
                if (item.allowance) {
                    total += parseFloat(item.allowance) || 0;
                }
            });

            this.form.formData.totalAmount = total.toFixed(2);
        },

        // 处理上传发票成功
        handleReceiptSuccess(fileList) {
            // 将文件列表转为JSON字符串存储
            this.form.formData.receiptFiles = JSON.stringify(
                fileList.map(file => {
                    return {
                        name: file.name,
                        url: file.url
                    };
                })
            );
        },
        // 处理差旅费报销单上传成功
        handleTravelExpenseSuccess(fileList) {
            // 将文件列表转为JSON字符串存储
            this.form.formData.travelExpenseFiles = JSON.stringify(
                fileList.map(file => {
                    return {
                        name: file.name,
                        url: file.url
                    };
                })
            );
        },
        // 更新checkIds
        updateCheckIds(userIds) {
            this.form.checkIds = userIds;
        },
        // 创建新商品项
        createNewItem() {
            return {
                name: '',
                brand: '',
                model: '',
                quantity: 1,
                unit: '',
                price: 0,
                subtotal: '0.00',
                purchaseLink: '',
                fileUrl: ''
            };
        },
        // 添加商品项
        addItem() {
            this.form.formData.items.push(this.createNewItem());
        },
        // 移除商品项
        removeItem(index) {
            this.form.formData.items.splice(index, 1);
            this.calculateTotalAmount();
        },
        // 计算单个商品小计
        calculateSubtotal(index) {
            const item = this.form.formData.items[index];
            if (item.quantity && item.price) {
                item.subtotal = (item.quantity * item.price).toFixed(2);
            } else {
                item.subtotal = '0.00';
            }
            this.calculateTotalAmount();
        },
        // 计算总金额
        calculateTotalAmount() {
            if (!this.form.formData.items || this.form.formData.items.length === 0) {
                this.form.formData.totalAmount = '0.00';
                return;
            }

            let total = 0;
            this.form.formData.items.forEach(item => {
                total += parseFloat(item.subtotal) || 0;
            });

            this.form.formData.totalAmount = total.toFixed(2);
        },
        // 处理商品附件上传成功
        handleItemFileSuccess(fileList, index) {
            // 将文件列表转为JSON字符串存储
            this.form.formData.items[index].fileUrl = JSON.stringify(
                fileList.map(file => {
                    return {
                        name: file.name,
                        url: file.url
                    };
                })
            );
        },
        // 处理合同附件上传成功
        handleContractFileSuccess(fileList) {
            // 将文件列表转为JSON字符串存储
            this.form.formData.attachment = JSON.stringify(
                fileList.map(file => {
                    return {
                        name: file.name,
                        url: file.url
                    };
                })
            );
        },
        // 处理关联申请单类型变化
        handleRelatedApplicationChange(value) {
            // 重置关联申请单ID
            this.form.formData.relatedApplicationId = null;
            // 清空列表
            this.relatedApplicationList = [];

            if (!value) return;

            // 根据选择的类型查询对应的申请单列表
            let affairsType = '';
            if (value === '零星采购申请单') {
                affairsType = 'procurement';
            } else if (value === '合同审批单') {
                affairsType = 'contract';
            } else if (value === '业务招待审批') {
                affairsType = 'hospitality';
            }

            if (affairsType) {
                // 构建查询参数
                const queryParams = {
                    affairsType: affairsType,
                    status: 2, // 已通过的申请
                    pageNum: 1,
                    pageSize: 100
                };

                // 调用API获取申请单列表
                listAffairsApply(queryParams).then(response => {
                    if (response && response.rows) {
                        this.relatedApplicationList = response.rows.map(item => {
                            // 创建一个新对象，避免修改原始对象
                            const processedItem = { ...item };

                            // 尝试解析formData字段
                            if (processedItem.formData && typeof processedItem.formData === 'string') {
                                try {
                                    processedItem.formData = JSON.parse(processedItem.formData);
                                } catch (e) {
                                    console.error('解析formData失败', e);
                                    processedItem.formData = {}; // 解析失败时设置为空对象
                                }
                            } else if (!processedItem.formData) {
                                processedItem.formData = {}; // 确保formData是一个对象
                            }

                            // 根据不同的申请单类型，设置不同的显示标签
                            if (affairsType === 'contract') {
                                processedItem.displayLabel = processedItem.formData.contractName || `合同申请单${processedItem.id}`;
                            } else if (affairsType === 'procurement') {
                                processedItem.displayLabel = processedItem.formData.purchaseType || `采购申请单${processedItem.id}`;
                            } else if (affairsType === 'hospitality') {
                                processedItem.displayLabel = processedItem.formData.hospitalityUnit
                                    ? `${processedItem.formData.hospitalityUnit}招待申请`
                                    : `招待申请单${processedItem.id}`;
                            } else {
                                processedItem.displayLabel = processedItem.title || `申请单${processedItem.id}`;
                            }

                            return processedItem;
                        });

                        console.log('关联申请单列表:', this.relatedApplicationList);
                    }
                });
            }
        },
        // 处理关联申请单ID变化
        handleRelatedApplicationIdChange(value) {
            console.log('选择的关联申请单ID:', value);

            // 在关联申请单列表中查找选择的项
            const selectedItem = this.relatedApplicationList.find(item => item.id === value);

            if (selectedItem) {
                console.log('选择的关联申请单:', selectedItem);

                // 保存申请编号
                this.form.formData.relatedApplicationNo = selectedItem.applyNo || '';

                // 可以根据需要将选择的申请单的某些字段填充到当前表单中
                if (this.form.formData.relatedApplication === '合同审批单' && selectedItem.formData) {
                    // 自动填充合同相关信息
                    if (selectedItem.formData.contractName) {
                        this.form.formData.contractName = selectedItem.formData.contractName;
                    }

                    if (selectedItem.formData.partyB) {
                        this.form.formData.receiverName = selectedItem.formData.partyB;
                    }

                    // 可以根据需要填充更多字段
                } else if (this.form.formData.relatedApplication === '零星采购申请单' && selectedItem.formData) {
                    // 自动填充采购相关信息
                    if (selectedItem.formData.purchaseType) {
                        // 可以根据需要填充相关字段
                        this.form.formData.payDescription = `零星采购: ${selectedItem.formData.purchaseType}`;
                    }

                    if (selectedItem.formData.totalAmount) {
                        this.form.formData.payAmount = selectedItem.formData.totalAmount;
                    }
                } else if (this.form.formData.relatedApplication === '业务招待审批' && selectedItem.formData) {
                    // 自动填充业务招待相关信息
                    if (selectedItem.formData.hospitalityUnit) {
                        this.form.formData.receiverName = selectedItem.formData.hospitalityUnit;
                    }

                    if (selectedItem.formData.estimatedAmount) {
                        this.form.formData.payAmount = selectedItem.formData.estimatedAmount;
                    }

                    if (selectedItem.formData.hospitalityReason) {
                        this.form.formData.payDescription = `业务招待: ${selectedItem.formData.hospitalityReason}`;
                    }
                }

                // 保存关联申请单的完整信息，以便后续处理
                this.form.formData.relatedApplicationData = selectedItem;

                // 保存关联申请单的简要信息，避免数据过大
                this.form.formData.relatedApplicationInfo = {
                    id: selectedItem.id,
                    title: selectedItem.title || '',
                    applyNo: selectedItem.applyNo || '',
                    // 其他需要的字段
                };
            }
        },
    }
};
</script>

<style scoped>
.approver-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.approver-item .el-select {
    flex: 1;
}

.approver-delete {
    margin-left: 10px;
}

.add-approver {
    margin-top: 10px;
    margin-left: 100px;
}
</style>
