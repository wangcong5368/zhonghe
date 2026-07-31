<!-- 纠纷业务详情 -->
<template xmlns="http://www.w3.org/1999/html">
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body>
      <template #title>
        <div>
          <span class="el-dialog__title">{{ title }}</span>
          <!-- 添加按钮 -->
          <div class="top-right-btn" style="margin-right: 30px; margin-top: -5px">
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <i class="el-icon-minus hover-icon" style="margin-top: 5px" @click="minimize"/>
              </el-col>
            </el-row>
          </div>
        </div>
      </template>

      <el-form ref="form" :model="form" label-width="120px">
        <div>
          <div class="min_title">工单信息</div>
          <el-row>
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
                <!--              <el-select v-model="form.entryChannel" style="width: 100%" disabled>-->
                <!--                <el-option-->
                <!--                  v-for="dict in dict.type.dm_entry_channel"-->
                <!--                  :key="dict.value"-->
                <!--                  :label="dict.label"-->
                <!--                  :value="dict.value"-->
                <!--                ></el-option>-->
                <!--              </el-select>-->
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="案件类型" prop="markCaseType">
                <el-input :value="formatMarkCaseTypeLabel(form.markCaseType)" readonly placeholder="" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div>
          <div class="min_title">委托人信息</div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="是否消费者本人" prop="isSelf">
                <el-radio-group v-model="form.isSelf" disabled>
                  <el-radio
                    v-for="dict in dict.type.sys_yes_no"
                    :key="dict.value"
                    :label="dict.value"
                  >{{ dict.label }}</el-radio
                  >
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="SYS_YES_NO.sys_no === form.isSelf">
              <el-form-item label="代理人姓名" prop="agentName">
                <el-input
                  v-model="form.agentName"
                  readonly
                  maxlength="10"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
            <el-col :span="12">
              <el-form-item label="代理人证件类型" prop="agentCertType">
                <el-select v-model="form.agentCertType" style="width: 100%" disabled placeholder="">
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
                <el-input v-model="form.agentCertNum" maxlength="18" readonly/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
            <el-col :span="12">
              <el-form-item label="代理人联系方式" prop="agentPhone">
                <el-input v-model="form.agentPhone" maxlength="11" readonly oninput="value=value.replace(/[^\d]/g,'')"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="代理人性别" prop="agentSex">
                <el-select
                  v-model="form.agentSex"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  readonly
                  maxlength="50"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系方式" prop="phone">
                <el-input
                  v-model="form.phone"
                  oninput="value=value.replace(/[^\d]/g,'')"
                  readonly
                  maxlength="11"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="certType">
                <el-select
                  v-model="form.certType"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  readonly
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select
                  v-model="form.sex"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
            <el-col :span="12">
              <el-form-item label="年龄" prop="age">
                <el-input
                  v-model="form.age"
                  maxlength="3"
                  readonly
                  oninput="value=value.replace(/[^\d]/g,'')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="民族" prop="nation">
                <el-input
                  v-model="form.nation"
                  maxlength="26"
                  readonly
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职业" prop="profession">
                <el-input
                  v-model="form.profession"
                  maxlength="20"
                  readonly
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="单位或住址" prop="address">
                <el-input
                  v-model="form.address"
                  type="textarea"
                  readonly
                  maxlength="50"
                  :autosize="{ minRows: 1}"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item
                label="是否屡投"
                prop="isRepeatedly"
              >
                <el-select
                  v-model="form.isRepeatedly"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
              <el-form-item
                label="是否涉及黑产"
                prop="isBlackIndustry"
              >
                <el-select
                  v-model="form.isBlackIndustry"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  disabled
                  style="width: 100%"
                  placeholder=""
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
              <el-form-item
                label="是否高危客群"
                prop="isHighRisk"
              >
                <el-select
                  v-model="form.isHighRisk"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
        <div>
          <div class="min_title">机构信息</div>
          <el-row v-if="form.oldDeptId && !$store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="原机构名称" prop="deptId">
                <treeselect
                  v-model="form.oldDeptId"
                  :options="deptOptions"
                  :normalizer="normalizer"
                  disabled
                  @input="deptChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原机构类型" prop="type">
                <el-cascader
                  v-model="form.oldDeptType"
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
              <el-form-item :label="form.oldDeptId && !$store.getters.userInfo.isDMInstitution ? '实际机构名称' : '机构名称'" prop="deptId">
                <treeselect
                  v-model="form.deptId"
                  :options="deptOptions"
                  :normalizer="normalizer"
                  disabled
                  @input="deptChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="form.oldDeptId && !$store.getters.userInfo.isDMInstitution ? '实际机构类型' : '机构类型'" prop="type">
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
            <el-col :span="24">
              <el-form-item label="住所地" prop="deptAddress">
                <el-input
                  v-model="form.deptAddress"
                  type="textarea"
                  readonly
                  maxlength="100"
                  :autosize="{ minRows: 1}"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="纠纷发生日期" prop="disputeDate">
                <el-date-picker
                  readonly
                  v-model="form.disputeDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="机构所在地区" prop="deptArea">
                <el-input
                  v-model="form.deptArea"
                  readonly
                  maxlength="40"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item
                label="业务经办人员"
                prop="deptHandlerName"
              >
                <el-input
                  v-model="form.deptHandlerName"
                  readonly
                  maxlength="10"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="经办人员联系电话"
                prop="deptHandlerPhone"
                label-width="140px"
              >
                <el-input
                  v-model="form.deptHandlerPhone"
                  readonly
                  maxlength="11"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item
                label="经办人身份证号"
                prop="deptHandlerCertNum"
              >
                <el-input
                  v-model="form.deptHandlerCertNum"
                  readonly
                  maxlength="18"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="被投诉主体层级" prop="level">
                <el-input
                  v-model="form.level"
                  readonly
                  maxlength="10"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item
                label="业务类别"
                prop="businessType1"
              >
                <el-cascader
                  v-model="form.businessType1"
                  :options="dict.type.dm_business_type.options2"
                  :props="{ emitPath: false, checkStrictly: false }"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  readonly
                  maxlength="20"
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
                  readonly
                  maxlength="20"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item
                label="业务办理渠道"
                prop="handleChannel"
              >
                <el-select
                  v-model="form.handleChannel"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
            <el-col :span="12">
              <el-form-item
                label="投诉分类"
                prop="bankComplaintType"
              >
                <el-select
                  v-model="form.bankComplaintType"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item label="险种类别" prop="insuranceType1">
                <el-cascader
                  v-model="form.insuranceType1"
                  :options="dict.type.dm_insurance_type.options2"
                  :props="{ emitPath: false, checkStrictly: false }"
                  clearable
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  readonly
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
            <el-col :span="12">
              <el-form-item label="产品销售渠道" prop="saleChannel">
                <el-select
                  v-model="form.saleChannel"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  disabled
                  style="width: 100%"
                  placeholder=""
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
                  readonly
                  maxlength="5000"
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
                  readonly
                  maxlength="400"
                  :autosize="{ minRows: 3}"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="调解员向当事人电话确认"
                prop="needCheck"
                label-width="180px"
              >
                <el-select
                  v-model="form.needCheck"
                  disabled
                  style="width: 100%"
                  placeholder=""
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
        <div class="min_title">机构授权调解代理人信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="委派/委托代表姓名"
              prop="deptContact"
              label-width="130px"
            >
              <el-input
                v-model="form.deptContact"
                readonly
                maxlength="10"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="性别"
              prop="deptContactSex"
            >
              <el-select
                v-model="form.deptContactSex"
                disabled
                style="width: 100%"
                placeholder=""
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
          <el-col :span="24">
            <el-form-item
              label="所在部门及职务"
              prop="deptContactPosition"
            >
              <el-input
                v-model="form.deptContactPosition"
                type="textarea"
                readonly
                maxlength="30"
                :autosize="{ minRows: 1}"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="证件类型"
              prop="deptContactCertType"
            >
              <el-select
                v-model="form.deptContactCertType"
                disabled
                style="width: 100%"
                placeholder=""
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
            >
              <el-input
                v-model="form.deptContactCertNum"
                readonly
                maxlength="18"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="联系方式"
              prop="deptContactPhone"
            >
              <el-input
                v-model="form.deptContactPhone"
                maxlength="11"
                readonly
                oninput="value=value.replace(/[^\d]/g,'')"
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
              label-width="140px"
            >
              <el-input
                v-model="form.product"
                readonly
                maxlength="40"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="涉及产品或服务合同号"
              prop="contract"
              label-width="170px"
            >
              <el-input
                v-model="form.contract"
                readonly
                maxlength="40"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="涉案金额（元）" prop="involveAmount">
              <el-input
                v-model="form.involveAmount"
                maxlength="12"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="诉请金额（元）" prop="appealAmount">
              <el-input
                v-model="form.appealAmount"
                maxlength="12"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="金融消费者是否接受调解"
              prop="consumerAcceptMediate"
              label-width="175px"
            >
              <el-select
                v-model="form.consumerAcceptMediate"
                disabled
                style="width: 100%"
                placeholder=""
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
            <el-form-item
              label="金融机构是否接受调解"
              prop="deptAcceptMediate"
              label-width="160px"
            >
              <el-select
                v-model="form.deptAcceptMediate"
                disabled
                style="width: 100%"
                placeholder=""
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
            <el-form-item label="金融机构拒绝调解原因" prop="deptRejectMediateReason" label-width="160px" v-if="SYS_YES_NO.sys_no === form.deptAcceptMediate">
              <el-select
                v-model="form.deptRejectMediateReason"
                disabled
                style="width: 100%"
                placeholder=""
              >
                <el-option
                  v-for="dict in dict.type.dm_dept_reject_mediate_reason"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="金融机构拒绝调解备注" prop="deptRejectMediateRemark" label-width="160px" v-if="SYS_YES_NO.sys_no === form.deptAcceptMediate">
              <el-input
                v-model="form.deptRejectMediateRemark"
                placeholder=""
                clearable
                maxlength="50"
                show-word-limit
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="调解方案金额" prop="solutionAmount">
              <el-input
                v-model="form.solutionAmount"
                maxlength="10"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
            <el-form-item label="履约类型" prop="enforceAgreementType">
              <el-select
                v-model="form.enforceAgreementType"
                disabled
                style="width: 100%"
                placeholder=""
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
            <el-form-item label="自查情况、调解方案及依据" prop="solution">
              <el-input
                v-model="form.solution"
                type="textarea"
                readonly
                maxlength="2000"
                :autosize="{ minRows: 3}"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="投保人" prop="policyholder">
              <el-input
                v-model="form.policyholder"
                readonly
                maxlength="10"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被保险人" prop="insured">
              <el-input
                v-model="form.insured"
                readonly
                maxlength="10"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item
              label="寿险现金价值/产险权益价值"
              prop="cashValue"
              label-width="185px"
            >
              <el-input
                v-model="form.cashValue"
                maxlength="10"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="定损金额" prop="lossAssessmentAmount">
              <el-input
                v-model="form.lossAssessmentAmount"
                maxlength="10"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="理赔金额" prop="claimAmount">
              <el-input
                v-model="form.claimAmount"
                maxlength="10"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="业务所属支公司" prop="businessCompany">
              <el-input
                v-model="form.businessCompany"
                readonly
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="销售人员（网点、理赔人员）"
              prop="salesman"
              label-width="200px"
            >
              <el-input
                v-model="form.salesman"
                readonly
                maxlength="10"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item
              label="销售、网点、理赔工号"
              prop="salesmanJobNum"
              label-width="160px"
            >
              <el-input
                v-model="form.salesmanJobNum"
                readonly
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="销售人员、理赔人员证件号码"
              prop="salesmanCertNum"
              label-width="200px"
            >
              <el-input
                v-model="form.salesmanCertNum"
                readonly
                maxlength="18"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="当事人资料" prop="consumerAttachment">
              <!--            <file-upload v-if="form.consumerAttachment" v-model="form.consumerAttachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" /> -->
              <!--            <span v-else>无</span>-->
              <FileList :fileList="form.consumerAttachment" emptyText="无"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="人民调解申请书" prop="applicationAttachment">
              <!--            <file-upload v-if="form.applicationAttachment" v-model="form.applicationAttachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" />-->
              <!--            <span v-else>无</span>-->
              <FileList :fileList="form.applicationAttachment" emptyText="无"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="已盖章反馈单" prop="stampedFeedbackAttachment">
              <!--            <file-upload v-if="form.stampedFeedbackAttachment" v-model="form.stampedFeedbackAttachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" />-->
              <!--            <span v-else>无</span>-->
              <FileList :fileList="form.stampedFeedbackAttachment" emptyText="无"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="附件" prop="attachment">
              <!--            <file-upload v-if="form.attachment" v-model="form.attachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" /> -->
              <!--            <span v-else>无</span>-->
              <FileList :fileList="form.attachment" emptyText="无"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="身份证复印件、工作证复印件" prop="photocopyAttachment">
              <!--            <file-upload v-if="form.photocopyAttachment" v-model="form.photocopyAttachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" />-->
              <!--            <span v-else>无</span>-->
              <FileList :fileList="form.photocopyAttachment" emptyText="无"/>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <div class="min_title">受理信息</div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="受理状态" prop="acceptStatus">
                <el-select
                  v-model="form.acceptStatus"
                  style="width: 100%"
                  disabled
                  placeholder=""
                  @change="form.rejectReason = null"
                >
                  <el-option
                    v-for="dict in dict.type.dm_accept_status"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              :span="12"
              v-if="DM_ACCEPT_STATUS.reject === form.acceptStatus"
            >
              <el-form-item label="不予受理原因" prop="rejectReason">
                <el-select
                  v-model="form.rejectReason"
                  disabled
                  style="width: 100%"
                  placeholder=""
                >
                  <el-option
                    v-for="dict in dict.type.dm_reject_reason"
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
          <div class="min_title">其他信息</div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="调解员" prop="mediatorName">
                <el-input v-model="form.mediatorName" readonly></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="助理调解员" prop="assistantName">
                <el-input v-model="form.assistantName" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="签约方式" prop="signWay" v-if="form.signWay">
                <el-select
                  v-model="form.signWay"
                  disabled
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in dict.type.dm_sign_way"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="调解结果" prop="mediationResult" v-if="form.mediationResult">
                <el-select
                  v-model="form.mediationResult"
                  disabled
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in dict.type.dm_mediation_result"
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
              <el-form-item label="办结类型" prop="finishType" v-if="form.finishType">
                <el-select v-model="form.finishType" disabled style="width: 100%">
                  <el-option
                    v-for="dict in dict.type.dm_finish_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="办结时间" prop="finishTime" v-if="form.finishTime">
                <el-date-picker
                  readonly
                  v-model="form.finishTime"
                  type="date"
                  value-format="yyyy-MM-dd"
                  style="width: 100%"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="终止受理原因" prop="terminateReason" v-if="form.terminateReason && DM_FINISH_TYPE.terminateAccept === form.finishType">
                <el-select v-model="form.terminateReason" disabled style="width: 100%">
                  <el-option
                    v-for="dict in dict.type.dm_terminate_accept_reason"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="终止受理备注" prop="terminateRemark" v-if="DM_FINISH_TYPE.terminateAccept === form.finishType">
                <el-input v-model="form.terminateRemark" readonly/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="终止调解原因" prop="terminateReason" v-if="form.terminateReason && DM_FINISH_TYPE.terminateMediate === form.finishType">
                <el-select v-model="form.terminateReason" disabled style="width: 100%">
                  <el-option
                    v-for="dict in dict.type.dm_terminate_mediate_reason"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="终止调解备注" prop="terminateRemark" v-if="DM_FINISH_TYPE.terminateMediate === form.finishType">
                <el-input v-model="form.terminateRemark" readonly/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" v-if="form.agreementAttachment">
              <el-form-item label="协议附件" prop="agreementAttachment">
                <!--              <file-upload v-if="form.agreementAttachment" v-model="form.agreementAttachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" />-->
                <!--              <span v-else>无</span>-->
                <FileList :fileList="form.agreementAttachment" emptyText="无"/>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  DEPT_TYPE,
  SYS_YES_NO,
  SYS_SEX,
  DM_ACCEPT_STATUS,
  DM_ENTRY_CHANNEL,
  CERT_TYPE, DM_FINISH_TYPE, formatMarkCaseTypeLabel,
} from "@/views/constant/CommonConstant.js";
import FileList from "@/components/FileList/index.vue";
import { getDisputeMediationExpandInfo } from "@/api/project/disputeMediation";

export default {
  name: "Detail",
  components: {
    Treeselect,
    FileList
  },
  computed: {
    DM_FINISH_TYPE() {
      return DM_FINISH_TYPE
    }
  },
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
    "dm_mediation_result",
    "dm_sign_way",
    "dm_finish_type",
    "dm_terminate_accept_reason",
    "dm_terminate_mediate_reason",
    "dm_insurance_type",
    "dm_dept_reject_mediate_reason",
  ],
  props: ["title", "deptOptions", "deptMap"],
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      CERT_TYPE: CERT_TYPE, // 身份证类型,
      formatMarkCaseTypeLabel: formatMarkCaseTypeLabel,
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
  },
  methods: {
    // 表单重置
    reset() {
      if (
        this.DEPT_TYPE.bankList.includes(
          this.$store.getters.userInfo.dept.type
        ) ||
        this.DEPT_TYPE.nonBankList.includes(
          this.$store.getters.userInfo.dept.type
        ) ||
        this.DEPT_TYPE.insuranceList.includes(
          this.$store.getters.userInfo.dept.type
        )
      ) {
        this.form.deptId = this.$store.getters.userInfo.dept.deptId;
        this.form.entryChannel = DM_ENTRY_CHANNEL.D;
        this.deptChange();
      }
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
      this.form = { ...row };
      this.visible = true;
      getDisputeMediationExpandInfo(row.workOrderId)
        .then((res) => {
          if (res.data != null && res.data.markCaseType != null && res.data.markCaseType !== "") {
            this.$set(this.form, "markCaseType", String(res.data.markCaseType));
          }
        })
        .catch(() => {});
    },
    cancel() {
      this.visible = false;
      this.reset();
    },
    minimize(event) {
      this.$emit('minimize', "工单详情:" + this.form.workOrderId, this.form, "工单详情", "info", event.clientX, event.clientY);
      this.visible = false;
      this.reset();
    },
    /** 机构发生变化 */
    deptChange() {
      if (this.form.deptId) {
        this.form.deptType = this.deptMap.get(this.form.deptId).type;
        // if (DEPT_TYPE.bankList.includes(this.form.deptType) || DEPT_TYPE.nonBankList.includes(this.form.deptType)) {
        //   this.form.saleChannel = null;
        //   this.form.insuranceComplaintType = null;
        // } else if (DEPT_TYPE.insuranceList.includes(this.form.deptType)) {
        //   this.form.businessType1 = null;
        //   this.form.businessType2 = null;
        //   this.form.businessType3 = null;
        //   this.form.handleChannel = null;
        //   this.form.bankComplaintType = null;
        //   this.form.level = null;
        //   this.form.deptHandlerName = null;
        //   this.form.deptHandlerPhone = null;
        //   this.form.deptHandlerCertNum = null;
        // }
      } else {
        this.form.deptType = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
.hover-icon:hover {
  color: #1872ff; /* 鼠标悬停时图标变成蓝色 */
  cursor: pointer; /* 鼠标悬停时变成点击手势 */
}
</style>
