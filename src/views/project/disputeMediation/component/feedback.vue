<!-- 填写反馈单 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body :close-on-click-modal="false" :close-on-press-escape="false">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <div>
        <div class="min_title">工单信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="工单编号" prop="workOrderId">
              <el-input
                v-model="form.workOrderId"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进件渠道" prop="entryChannel">
              <el-cascader
                v-model="form.entryChannel"
                :options="dict.type.dm_entry_channel.options"
                :props="{ expandTrigger: 'hover', emitPath: false }"
                clearable
                style="width: 100%"
                disabled
              />
<!--              <el-select-->
<!--                v-model="form.entryChannel"-->
<!--                style="width: 100%"-->
<!--                disabled-->
<!--              >-->
<!--                <el-option-->
<!--                  v-for="dict in dict.type.dm_entry_channel"-->
<!--                  :key="dict.value"-->
<!--                  :label="dict.label"-->
<!--                  :value="dict.value"-->
<!--                ></el-option>-->
<!--              </el-select>-->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12" v-if="form.feedbackTime">
            <el-form-item label="反馈时间" prop="feedbackTime">
              <el-date-picker
                clearable
                v-model="form.feedbackTime"
                type="date"
                value-format="yyyy-MM-dd-HH-mm-ss"
                style="width: 100%"
                disabled
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <div class="min_title">委托人信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否消费者本人" prop="isSelf">
              <el-radio-group v-model="form.isSelf" disabled>
                <el-radio
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.value"
                >{{ dict.label }}
                </el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="SYS_YES_NO.sys_no === form.isSelf">
            <el-form-item label="代理人姓名" prop="agentName">
              <el-input
                v-model="form.agentName"
                maxlength="10"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
          <el-col :span="12">
            <el-form-item label="代理人证件类型" prop="agentCertType">
              <el-select
                v-model="form.agentCertType"
                style="width: 100%"
                disabled
              >
                <el-option
                  v-for="dict in dict.type.cert_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理人证件号码" prop="agentCertNum">
              <el-input
                v-model="form.agentCertNum"
                maxlength="18"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
          <el-col :span="12">
            <el-form-item label="代理人联系方式" prop="agentPhone">
              <el-input
                v-model="form.agentPhone"
                maxlength="11"
                oninput="value=value.replace(/[^\d]/g,'')"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理人性别" prop="agentSex">
              <el-select
                v-model="form.agentSex"
                style="width: 100%"
                disabled
              >
                <el-option
                  v-for="dict in dict.type.sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div>
        <div class="min_title">消费者信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="消费者姓名" prop="name">
              <el-input
                v-model="form.name"
                maxlength="50"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="phone">
              <el-input
                v-model="form.phone"
                oninput="value=value.replace(/[^\d]/g,'')"
                maxlength="11"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="证件类型" prop="certType">
              <el-select
                v-model="form.certType"
                style="width: 100%"
                disabled
              >
                <el-option
                  v-for="dict in dict.type.cert_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码" prop="certNum">
              <el-input
                v-model="form.certNum"
                maxlength="18"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="是否屡投" prop="isRepeatedly">
              <el-select
                v-model="form.isRepeatedly"
                style="width: 100%"
                placeholder=""
                disabled
              >
                <el-option
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否涉及黑产" prop="isBlackIndustry">
              <el-select
                v-model="form.isBlackIndustry"
                style="width: 100%"
                placeholder=""
                disabled
              >
                <el-option
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item
              label="是否涉及第三方代理"
              prop="isThirdPartyAgent"
              label-width="150px"
            >
              <el-select
                v-model="form.isThirdPartyAgent"
                style="width: 100%"
                placeholder=""
                disabled
              >
                <el-option
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否高危客群" prop="isHighRisk">
              <el-select
                v-model="form.isHighRisk"
                style="width: 100%"
                placeholder=""
                disabled
              >
                <el-option
                  v-for="dict in dict.type.sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="min_title">机构信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="机构名称" prop="deptId">
            <treeselect
              v-model="form.deptId"
              :options="deptOptions"
              :normalizer="normalizer"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
          v-if="DEPT_TYPE.insuranceList.includes(form.deptType)"
        >
          <el-form-item label="机构类型" prop="type">
            <el-cascader
              v-model="form.deptType"
              :options="dict.type.dept_type.options"
              :props="{ expandTrigger: 'hover', emitPath: false }"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="纠纷发生日期" prop="disputeDate">
            <el-date-picker
              clearable
              v-model="form.disputeDate"
              type="date"
              value-format="yyyy-MM-dd"
              style="width: 100%"
              disabled
              :picker-options="{
                disabledDate(time) {
                  // 禁用所有小于当前日期的日期
                  return time.getTime() > Date.now();
                },
              }"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构所在地区" prop="deptArea">
            <el-input
              v-model="form.deptArea"
              maxlength="40"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="业务经办人员" prop="deptHandlerName" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '业务经办人员为必填项', trigger: 'blur'}]">
            <el-input
              v-model="form.deptHandlerName"
              maxlength="10"
              clearable
              :placeholder="disabled ? '' : '请输入业务经办人员'"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="经办人员联系电话"
            prop="deptHandlerPhone"
            label-width="140px"
            :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '经办人员联系电话为必填项', trigger: 'blur'}]"
          >
            <el-input
              v-model="form.deptHandlerPhone"
              maxlength="11"
              clearable
              :placeholder="disabled ? '' : '请输入经办人员联系电话'"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="经办人身份证号" prop="deptHandlerCertNum" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '经办人身份证号为必填项', trigger: 'blur'}, { validator: validCertNum(CERT_TYPE.CERT_TYPE0), trigger: 'blur' }]">
            <el-input
              v-model="form.deptHandlerCertNum"
              maxlength="18"
              clearable
              :placeholder="disabled ? '' : '请输入经办人身份证号'"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="投诉分类" prop="bankComplaintType" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '投诉分类为必填项', trigger: 'change'}]">
            <el-select
              v-model="form.bankComplaintType"
              style="width: 100%"
              clearable
              :placeholder="disabled ? '' : '请选择投诉分类'"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.dm_bank_complaint_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="被投诉主体层级" prop="level">
            <el-input
              v-model="form.level"
              maxlength="10"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="业务类别"
            prop="businessType1"
          >
            <el-cascader
              v-model="form.businessType1"
              :options="dict.type.dm_business_type.options2"
              :props="{ emitPath: false, checkStrictly: false }"
              style="width: 100%"
              placeholder=""
              disabled
              ref="businessType1Ref"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item
            label="级别二"
            prop="businessType2"
          >
            <el-input
              v-model="form.businessType2"
              maxlength="20"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="级别三"
            prop="businessType3"
          >
            <el-input
              v-model="form.businessType3"
              maxlength="20"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="业务办理渠道" prop="handleChannel" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '业务办理渠道为必填项', trigger: 'change'}]">
            <el-select
              v-model="form.handleChannel"
              style="width: 100%"
              clearable
              :placeholder="disabled ? '' : '请选择业务办理渠道'"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.dm_handle_channel"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item
            label="险种类别"
            prop="insuranceType1"
            :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '险种类别为必填项', trigger: 'change' }]"
          >
            <el-cascader
              v-model="form.insuranceType1"
              :options="dict.type.dm_insurance_type.options2"
              :props="{ emitPath: false, checkStrictly: false }"
              placeholder="请选择业务类别"
              clearable
              style="width: 100%"
              ref="insuranceType1Ref"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="险种类别2" prop="insuranceType2">
            <el-input
              v-model="form.insuranceType2"
              placeholder="请输入险种类别2"
              clearable
              maxlength="40"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="产品销售渠道" prop="saleChannel">
            <el-select
              v-model="form.saleChannel"
              placeholder=""
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="dict in dict.type.dm_sale_channel"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="保险消费投诉事由分类"
            prop="insuranceComplaintType"
            label-width="165px"
          >
            <el-select
              v-model="form.insuranceComplaintType"
              placeholder=""
              style="width: 100%"
              disabled
            >
              <el-option
                v-for="dict in dict.type.dm_insurance_complaint_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="投诉内容" prop="complaintContent">
            <el-input
              v-model="form.complaintContent"
              type="textarea"
              maxlength="5000"
              disabled
              :autosize="{ minRows: 3}"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="主要诉求" prop="appeal">
            <el-input
              v-model="form.appeal"
              type="textarea"
              maxlength="400"
              disabled
              :autosize="{ minRows: 3}"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="min_title">调解信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="涉及产品或服务名称"
            prop="product"
            :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '涉及产品或服务名称为必填项', trigger: 'blur'}]"
          >
            <el-input
              v-model="form.product"
              :placeholder="disabled ? '' : '请输入涉及产品或服务名称'"
              clearable
              maxlength="40"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="涉及产品或服务合同号"
            prop="contract"
            :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '涉及产品或服务合同号为必填项', trigger: 'blur'}]"
          >
            <el-input
              v-model="form.contract"
              :placeholder="disabled ? '' : '请输入涉及产品或服务合同号'"
              clearable
              maxlength="40"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="金融机构是否接受调解" prop="deptAcceptMediate" label-width="165px">
            <el-select
              v-model="form.deptAcceptMediate"
              :placeholder="disabled ? '' : '请选择金融机构是否接受调解'"
              clearable
              style="width: 100%"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.sys_yes_no"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.createType === DM_CREATE_TYPE.TYPE2">
          <el-form-item label="金融消费者是否接受调解" prop="consumerAcceptMediate" label-width="180px" :rules="[{ required: true, message: '金融消费者是否接受调解为必填项', trigger: 'change' }]">
            <el-select
              v-model="form.consumerAcceptMediate"
              :placeholder="disabled ? '' : '请选择金融消费者是否接受调解'"
              clearable
              style="width: 100%"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.sys_yes_no"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="调解方案金额" prop="solutionAmount" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '调解方案金额为必填项', trigger: 'blur' }]">
            <el-input
              v-model="form.solutionAmount"
              :placeholder="disabled ? '' : '请输入调解方案金额'"
              maxlength="10"
              show-word-limit
              clearable
              @input="validAmount(form.solutionAmount, 'solutionAmount')"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-form-item label="履约类型" prop="enforceAgreementType" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '履约类型为必填项', trigger: 'change' }]">
            <el-select
              v-model="form.enforceAgreementType"
              :placeholder="disabled ? '' : '请选择履约类型'"
              clearable
              style="width: 100%"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.dm_enforce_agreement_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="自查情况、调解方案及依据" prop="solution" class="endItem" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' }]">
            <el-input
              v-model="form.solution"
              type="textarea"
              :placeholder="disabled ? '' : '请输入自查情况、调解方案及依据'"
              clearable
              maxlength="2000"
              show-word-limit
              :autosize="{ minRows: 3}"
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="投保人" prop="policyholder">
            <el-input
              v-model="form.policyholder"
              :placeholder="disabled ? '' : '请输入投保人'"
              clearable
              maxlength="10"
              show-word-limit
              :disabled="disabled"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被保险人" prop="insured">
            <el-input
              v-model="form.insured"
              :placeholder="disabled ? '' : '请输入被保险人'"
              clearable
              maxlength="10"
              show-word-limit
              :disabled="disabled"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="涉案金额" prop="involveAmount">
            <el-input
              v-model="form.involveAmount"
              :placeholder="disabled ? '' : '请输入涉案金额'"
              maxlength="10"
              show-word-limit
              clearable
              :disabled="disabled"
              @input="validAmount(form.involveAmount, 'involveAmount')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="寿险现金价值/产险权益价值" prop="cashValue">
            <el-input
              v-model="form.cashValue"
              :placeholder="disabled ? '' : '请输入寿险现金价值/产险权益价值'"
              maxlength="10"
              show-word-limit
              clearable
              :disabled="disabled"
              @input="validAmount(form.cashValue, 'cashValue')"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="定损金额" prop="lossAssessmentAmount">
            <el-input
              v-model="form.lossAssessmentAmount"
              :placeholder="disabled ? '' : '请输入定损金额'"
              maxlength="10"
              show-word-limit
              clearable
              :disabled="disabled"
              @input="validAmount(form.lossAssessmentAmount, 'lossAssessmentAmount')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="理赔金额" prop="claimAmount">
            <el-input
              v-model="form.claimAmount"
              :placeholder="disabled ? '' : '请输入理赔金额'"
              maxlength="10"
              show-word-limit
              clearable
              :disabled="disabled"
              @input="validAmount(form.claimAmount, 'claimAmount')"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="诉请金额" prop="appealAmount">
            <el-input
              v-model="form.appealAmount"
              :placeholder="disabled ? '' : '请输入诉请金额'"
              maxlength="10"
              show-word-limit
              clearable
              :disabled="disabled"
              @input="validAmount(form.appealAmount, 'appealAmount')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务所属支公司" prop="businessCompany">
            <el-input
              v-model="form.businessCompany"
              :placeholder="disabled ? '' : '请输入业务所属支公司'"
              clearable
              maxlength="100"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="销售人员（网点、理赔人员）" prop="salesman">
            <el-input
              v-model="form.salesman"
              :placeholder="disabled ? '' : '请输入销售人员（网点、理赔人员）'"
              clearable
              maxlength="10"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售、网点、理赔工号" prop="salesmanJobNum">
            <el-input
              v-model="form.salesmanJobNum"
              :placeholder="disabled ? '' : '请输入销售、网点、理赔工号'"
              clearable
              maxlength="10"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item
            label="销售人员、理赔人员证件号码"
            prop="salesmanCertNum"
          >
            <el-input
              v-model="form.salesmanCertNum"
              :placeholder="disabled ? '' : '请输入销售人员、理赔人员证件号码'"
              clearable
              maxlength="18"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="min_title">机构授权调解代理人信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名" prop="deptContact" label-width="130px" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '姓名为必填项', trigger: 'blur' }]">
            <el-input
              v-model="form.deptContact"
              :placeholder="disabled ? '' : '请输入姓名'"
              clearable
              maxlength="10"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="deptContactSex" :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '性别为必填项', trigger: 'change' }]">
            <el-select
              v-model="form.deptContactSex"
              :placeholder="disabled ? '' : '请选择性别'"
              clearable
              style="width: 100%"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.sys_user_sex"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="联系方式"
            prop="deptContactPhone"
            label-width="130px"
            :rules="[
              { required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '联系方式为必填项', trigger: 'blur' },
              { validator: phoneRule, trigger: 'blur' }
              ]"
          >
            <el-input
              v-model="form.deptContactPhone"
              :placeholder="disabled ? '' : '请输入联系方式'"
              maxlength="11"
              show-word-limit
              clearable
              :disabled="disabled"
              oninput="value=value.replace(/[^\d]/g,'')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="所在部门及职务"
            prop="deptContactPosition"
            label-width="130px"
            :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '所在部门及职务为必填项', trigger: 'blur' }]"
          >
            <el-input
              v-model="form.deptContactPosition"
              :placeholder="disabled ? '' : '请输入所在部门及职务'"
              clearable
              maxlength="30"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="证件类型"
            prop="deptContactCertType"
            label-width="130px"
            :rules="[{ required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '证件类型为必填项', trigger: 'change'}]"
          >
            <el-select
              v-model="form.deptContactCertType"
              :placeholder="disabled ? '' : '请选择证件类型'"
              clearable
              style="width: 100%"
              :disabled="disabled"
            >
              <el-option
                v-for="dict in dict.type.cert_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="证件号码"
            prop="deptContactCertNum"
            label-width="130px"
            :rules="[
              { required: SYS_YES_NO.sys_no !== form.deptAcceptMediate, message: '证件号码为必填项', trigger: 'blur'},
              { validator: validCertNum(form.deptContactCertType), trigger: 'blur' }
              ]"
          >
            <el-input
              v-model="form.deptContactCertNum"
              :placeholder="disabled ? '' : '请输入证件号码'"
              clearable
              :maxlength="validCertNumLength(form.deptContactCertType)"
              show-word-limit
              :disabled="disabled"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" v-if="form.createType === DM_CREATE_TYPE.TYPE2">
          <el-form-item label="人民调解申请书" prop="applicationAttachment" :rules="[{ required: SYS_YES_NO.sys_yes === form.consumerAcceptMediate, message: '请上传《人民调解申请书》或其他金融消费者同意调解作证材料', trigger: 'change' }]">
            <file-upload v-model="form.applicationAttachment" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]" :limit="3" :oldList="disabled && attachmentForm.applicationAttachment ? attachmentForm.applicationAttachment.split(',') : []"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="已盖章反馈单" prop="stampedFeedbackAttachment">
            <file-upload v-model="form.stampedFeedbackAttachment" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]" :limit="1" :oldList="disabled && attachmentForm.stampedFeedbackAttachment ? attachmentForm.stampedFeedbackAttachment.split(',') : []"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件" prop="attachment">
            <file-upload v-model="form.attachment" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav', 'm4a',]" :limit="5" :oldList="disabled && attachmentForm.attachment ? attachmentForm.attachment.split(',') : []"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="身份证复印件、工作证复印件" prop="photocopyAttachment">
            <file-upload v-model="form.photocopyAttachment" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]" :limit="3" :oldList="disabled && attachmentForm.photocopyAttachment ? attachmentForm.photocopyAttachment.split(',') : []"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {feedback} from "@/api/project/disputeMediation";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  DEPT_TYPE,
  SYS_YES_NO,
  SYS_SEX,
  DM_ACCEPT_STATUS,
  DM_ENTRY_CHANNEL,
  CERT_TYPE,
  DM_AGREEMENT_STEP,
  DM_STATUS,
  DM_CREATE_TYPE
} from '@/views/constant/CommonConstant.js'

export default {
  components: {Treeselect},
  dicts: [
    "dept_type",
    "dm_status",
    "dm_sale_channel",
    "dm_bank_complaint_type",
    "dm_insurance_complaint_type",
    "dm_accept_status",
    "dm_reject_reason",
    "dm_business_type",
    "cert_type",
    "sys_yes_no",
    "sys_user_sex",
    "dm_handle_channel",
    "dm_enforce_agreement_type",
    "dm_entry_channel",
    "dm_insurance_type",
  ],
  props: ["title", "deptOptions", "deptMap"],
  data() {
    return {
      visible: false,
      form: {},
      attachmentForm: {},
      loading: false,
      // 表单校验
      rules: {
        // isSelf: [{ required: true, message: '是否消费者本人为必填项', trigger: 'change' }],
        // agentCertNum: [{ validator: , trigger: 'blur' }],
        // agentPhone: [{ validator: this.phoneRule, trigger: 'blur' }],
        // phone: [{ validator: this.phoneRule, trigger: 'blur' }],
        // certNum: [{ validator: , trigger: 'blur' }],
        // acceptStatus: [{ required: true, message: '受理状态为必填项', trigger: 'change'}],
        deptAcceptMediate: [{ required: true, message: '金融机构是否接受调解为必填项', trigger: 'change' }],
        // consumerAcceptMediate: [{ required: true, message: '金融消费者是否接受调解为必填项', trigger: 'change' }],

        // enforceAgreementType: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '履约类型为必填项', trigger: 'change' }],
        // solutionAmount: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '调解方案金额为必填项', trigger: 'blur' }],
        // solution: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' }],
        // deptContact: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '姓名为必填项', trigger: 'blur' }],
        // deptContactSex: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '性别为必填项', trigger: 'change' }],
        // deptContactPosition: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '所在部门及职务为必填项', trigger: 'blur' }],
        // deptContactPhone: [
        //   { required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '联系方式为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' },
        // ],
        // deptContactCertType: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件类型为必填项', trigger: 'change'}],
        // deptContactCertNum: [
        //   { required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件号码为必填项', trigger: 'blur'},
        //   { validator: , trigger: 'blur' },
        // ],
        // product: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务名称为必填项', trigger: 'blur'}],
        // contract: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务合同号为必填项', trigger: 'blur'}],
        // deptHandlerName: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务经办人员为必填项', trigger: 'blur'}],
        // deptHandlerPhone: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人员联系电话为必填项', trigger: 'blur'}],
        // deptHandlerCertNum: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人身份证号为必填项', trigger: 'blur'}],
        // bankComplaintType: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '投诉分类为必填项', trigger: 'change'}],
        // handleChannel: [{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务办理渠道为必填项', trigger: 'change'}],
      },
      disabled: false,
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      CERT_TYPE: CERT_TYPE, // 身份证类型,
      DM_AGREEMENT_STEP: DM_AGREEMENT_STEP, // 纠纷业务协议阶段
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      DM_CREATE_TYPE: DM_CREATE_TYPE, // 纠纷业务创建类型
    };
  },
  watch: {
    // 初始化字典，用于层级选择器
    "dict.type.dept_type"(newV, oldV) {
      this.initDict(newV, oldV);
    },
    "dict.type.dm_business_type"(newV, oldV) {
      this.initDict(newV, oldV);
    },
    "dict.type.dm_insurance_type"(newV, oldV) {
      this.initDict(newV, oldV);
    },
    "dict.type.dm_entry_channel"(newV, oldV) {
      this.initDict(newV, oldV);
    },
    // "form.businessType1"(newV, oldV) {
    //   if(newV && this.$refs.businessType1Ref){
    //     //关闭级联选择器下拉菜单
    //     this.$refs.businessType1Ref.toggleDropDownVisible(false);
    //   }
    // },
    // "form.insuranceType1"(newV, oldV) {
    //   if(newV && this.$refs.insuranceType1Ref){
    //     //关闭级联选择器下拉菜单
    //     this.$refs.insuranceType1Ref.toggleDropDownVisible(false);
    //   }
    // },
  },
  created() {
  },
  methods: {
    /** 校验数字并且小数点后两位 */
    validAmount(value, str) {
      // 使用正则表达式限制输入
      this.form[str] = value.replace(/[^\d.]/g, ""); // 只允许输入数字和小数点
      if (this.form[str].split(".").length > 2) {
        // 限制只能有一个小数点
        this.form[str] = this.form[str]
          .split(".")
          .slice(0, 2)
          .join(".");
      }
      if (this.form[str].split(".")[1] && this.form[str].split(".")[1].length > 2) {
        // 限制小数点后最多两位
        this.form[str] = this.form[str].slice(0, this.form[str].indexOf('.') + 3);
      }
    },
    validCertNumLength(certType) {
      if (certType === CERT_TYPE.CERT_TYPE0) {
        return 18;
      } else if (certType === CERT_TYPE.CERT_TYPE1) {
        return 9;
      } else if (certType === CERT_TYPE.CERT_TYPE2) {
        return 10;
      } else if (certType === CERT_TYPE.CERT_TYPE3) {
        return 15;
      } else {
        return 18;
      }
    },
    /** 证件号码校验 */
    validCertNum(certType) {
      return (rule, value, callback) => {
        if (value) {
          if (certType === CERT_TYPE.CERT_TYPE0) {
            let regex = /^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
            if (regex.test(value)) {
              callback();
            } else {
              callback(new Error("请输入正确的身份证"));
            }
          } else if (certType === CERT_TYPE.CERT_TYPE1) {
            if (value.length === 9) {
              callback();
            } else {
              callback(new Error("请输入正确的护照"));
            }
          } else if (certType === CERT_TYPE.CERT_TYPE2) {
            if (value.length === 10) {
              callback();
            } else {
              callback(new Error("请输入正确的军警证"));
            }
          } else if (certType === CERT_TYPE.CERT_TYPE3) {
            if (value.length === 15) {
              callback();
            } else {
              callback(new Error("请输入正确的外国人永久居留证"));
            }
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
    },
    // 联系方式校验
    phoneRule(rule, value, callback) {
      if (!value) {
        callback();
      } else {
        const regex = /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/;
        if (regex.test(value)) {
          callback();
        } else {
          callback(new Error("请输入正确的联系方式"));
        }
      }
    },
    // 表单重置
    reset() {
      this.form = {};
      // (this.form.deptAcceptMediate = null),
      //   (this.form.product = this.DEPT_TYPE.insuranceList.includes(this.form.deptType) ? null : this.form.product),
      //   (this.form.contract = this.DEPT_TYPE.insuranceList.includes(this.form.deptType) ? null : this.form.contract),
      //   (this.form.solutionAmount = null),
      //   (this.form.enforceAgreementType = null),
      //   (this.form.solution = null),
      //   (this.form.policyholder = null),
      //   (this.form.insured = null),
      //   (this.form.involveAmount = null),
      //   (this.form.cashValue = null),
      //   (this.form.lossAssessmentAmount = null),
      //   (this.form.claimAmount = null),
      //   (this.form.appealAmount = null),
      //   (this.form.businessCompany = null),
      //   (this.form.salesman = null),
      //   (this.form.salesmanJobNum = null),
      //   (this.form.salesmanCertNum = null),
      //   (this.form.certNum = null),
      this.resetForm("form");
    },
    /** 转换机构数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    open(row) {
      this.reset();
      this.form = { ...row };

      if (!this.form.solution) {
        this.form.solution = `一、自查情况:
二、调解方案:
三、调解依据:

纠纷调解要素式信息表
一、调解请求
（保险机构填写如下：）
1.1支付利息/保险/理赔款 （支付利息/支付保费/支付理赔款）
1.1.1类型:
1.1.2金额:   元 （诉求金额）
1.1.3计算期间:    年  月  日至   年  月  日 （保险期间/诉求期间，如从哪年至今的保费）
1.1.4依据: （销售误导/夸大收益/违规行为/理赔金额不合理/满期金收益未达到预期等）
1.2其他请求
1.2.1请求内容： （如尽快理赔、恢复保单效力、给予续保等）
（银行机构填写如下，根据当事人具体调解请求事项对应填写，举例内容仅供填写参考，具体填写以实际业务为准：）
1.1返还资金/本金（退费）
1.1.1金额： 元（当事人诉求金额）
1.1.2依据： 如客户诉求、双方合意、人文关怀等）
1.2变更合同条款（调整还款/缴费计划、一次性结清减免、申请降低保额等）
1.2.1原条款/计划：
1.2.2申请变更/调整为：                （当事人诉求）
1.2.3理由：                （如客户诉求、还款困难等）
1.3赔偿损失
1.3.1损失类型：                （如资金亏损、电诈盗刷、车马费、人文关怀金等）
1.3.2金额：        元（含等值礼品，当事人诉求金额）
1.3.3计算依据：                （如中国人民银行发布的同期同类存款基准利率、客户诉求、双方合意、人文关怀等）
1.4其他请求
1.4.1请求类型：                （如其他服务及增值活动类、催收及征信异议、账户使用及管理等）
1.4.2请求内容：
二、纠纷事实与理由
2.1合同/协议情况
2.1.1□是□否签订相关合同/协议合同/协议名称:         （险种名称、业务名称、合同或协议名称等）
2.1.2签订时间:   年  月  日（投保时间、业务办理时间、合同或协议时间等）
2.1.3合同编号:         （保险合同编号、业务流水号、借款合同编号等）
2.1.4核心条款:         （险种名称+第X条+条款名称、业务名称+第X条+条款名称；例如：《XX重大疾病保险》第十一条除外责任、《个人借款抵押合同》第十四条 违约责任）
2.2事实经过(时间线):
（请按时间顺序简述案件前期发生时间及处理过程；例如当事人于XX年XX月通过XX方式进行投诉+公司处理过程）


2.3争议焦点（如：保险责任认定争议、合同条款理解争议、利息计算标准争议、征信异议、催收行为争议、银行制度及流程争议、服务争议等）
2.3.1:
2.3.2:
2.3.3:
2.4理由依据
2.4.1合同依据:  (引用合同具体条款)
2.4.2法律依据:  (如<<民法典>><<保险法>>等相关条款)
2.4.3其他依据:  (如行业规范、交易习惯等)
2.5前期沟通情况
2.5.1 是 否与被申请人协商过 ，协商结果：
                                    （前期协商方案及结果）
2.5.2 是 否向监管部门投诉 投诉结果：
                                    （前期监管投诉处理方案及结果）
三、证据材料清单(请就现有证据进行列明，例如：投保单影像、回访/销售录音、业务员调查笔录、付款凭证、理赔调取的证据/保司赔款记录、借款合同、双录影像、厅堂录像等）
注：证据材料复印件需注明"与原件核对一致"，如有补充证据可另附页
3.1序号1:
3.1.1证据名称:
3.1.2证据来源:
3.1.3证据目的:
3.1.4份数
3.2序号2：
3.2.1证据名称:
3.2.2证据来源:
3.2.3证据目的:
3.2.4份数`;
      }

      this.attachmentForm = {...row};
      this.disabled = DM_STATUS.DM_STATUS4 === this.form.status && this.form.agreementStep != null && DM_AGREEMENT_STEP.AR !== this.form.agreementStep || DM_STATUS.DM_STATUS10 === this.form.status;
      this.visible = true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          feedback(this.form).then((response) => {
            this.loading = false;
            this.$modal.msgSuccess("操作成功");
            this.visible = false;
            this.$emit('callback')
          }).catch(() => {
            this.loading = false;
          })
        }
      });
    },
    cancel() {
      this.visible = false;
      this.reset();
    },
  },
};
</script>

<style lang="scss" scoped>
.endItem ::v-deep .el-textarea__inner {
  padding-bottom: 36px;
}

.min_title {
  position: relative;
  width: 100%;
  height: 30px;
  line-height: 35px;
  background: #4682b4;
  color: #fff;
  padding-left: 5px;
  box-sizing: inherit;
  text-align: left;
  // margin-top: 10px;
  margin-bottom: 10px;
}
</style>
