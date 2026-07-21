<!-- 修改纠纷业务工单对话框 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body :close-on-click-modal="false"
    :close-on-press-escape="false">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <div>
        <div class="min_title">工单信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="进件渠道" prop="entryChannel">
              <el-cascader v-model="form.entryChannel" :options="dict.type.dm_entry_channel.options"
                :props="{ expandTrigger: 'hover', emitPath: false }" placeholder="请选择进件渠道" clearable style="width: 100%"
                disabled />
              <!--              <el-select v-model="form.entryChannel" placeholder="请选择进件渠道" style="width: 100%" disabled>-->
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
            <el-form-item label="案件分类" prop="markCaseType">
              <el-select v-model="form.markCaseType" placeholder="请选择案件分类" style="width: 100%">
                <el-option v-for="(label, val) in MARK_CASE_TYPE_LABEL" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="渠道类型" prop="channelType"
              :rules="disabled ? [] : [{ required: true, message: '渠道类型为必填项', trigger: 'change' }]">
              <el-select v-model="form.channelType" disabled placeholder="请选择渠道类型" clearable style="width: 100%">
                <el-option v-for="dict in dict.type.dm_channel_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div>
        <div class="min_title">委托人信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否消费者本人" prop="isSelf"
              :rules="disabled ? [] : [{ required: true, message: '是否消费者本人为必填项', trigger: 'change' }]">
              <el-radio-group v-model="form.isSelf" :disabled="disabled">
                <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="SYS_YES_NO.sys_no === form.isSelf">
            <el-form-item label="代理人姓名" prop="agentName">
              <el-input v-model="form.agentName" :placeholder="disabled ? '' : '请输入代理人姓名'" clearable maxlength="10"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
          <el-col :span="12">
            <el-form-item label="代理人证件类型" prop="agentCertType">
              <el-select v-model="form.agentCertType" :placeholder="disabled ? '' : '请选择代理人证件类型'" style="width: 100%"
                clearable :disabled="disabled">
                <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理人证件号码" prop="agentCertNum" :rules="disabled
              ? []
              : [
                { required: this.form.agentCertType, message: '代理人证件号码为必填项', trigger: 'blur' },
                { validator: this.validCertNum(this.form.agentCertType), trigger: 'blur' }
              ]
              ">
              <el-input v-model="form.agentCertNum" :placeholder="disabled ? '' : '请输入代理人证件号码'"
                :maxlength="this.validCertNumLength(this.form.agentCertType)" show-word-limit clearable
                :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
          <el-col :span="12">
            <el-form-item label="代理人联系方式" prop="agentPhone"
              :rules="disabled ? [] : [{ validator: this.phoneRule, trigger: 'blur' }]">
              <el-input v-model="form.agentPhone" :placeholder="disabled ? '' : '请输入代理人联系方式'" :disabled="disabled"
                maxlength="11" show-word-limit clearable oninput="value=value.replace(/[^\d]/g,'')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理人性别" prop="agentSex">
              <el-select v-model="form.agentSex" :placeholder="disabled ? '' : '请选择代理人性别'" clearable style="width: 100%"
                :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div>
        <div class="min_title">消费者信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="消费者身份类型" prop="consumerIdentityType"
              :rules="disabled ? [] : [{ required: true, message: '消费者身份类型为必填项', trigger: 'blur' }]">
              <el-select v-model="form.consumerIdentityType" :placeholder="disabled ? '' : '请选择消费者身份类型'"
                :disabled="disabled" @change="changeConsumerIdentityType">
                <el-option v-for="dict in dict.type.dm_consumer_identity_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '法人或非法人组织' : '消费者姓名'"
              prop="name" :rules="disabled ? [] : [{ required: true, message: '消费者姓名为必填项', trigger: 'blur' }]"
              :label-width="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '140px' : '120px'">
              <el-input v-model="form.name" :placeholder="disabled ? '' : '请输入消费者姓名'" clearable maxlength="50"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="phone" :rules="disabled
              ? []
              : [
                { required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者联系方式为必填项', trigger: 'blur' },
                { validator: this.phoneRule, trigger: 'blur' }
              ]
              ">
              <el-input v-model="form.phone" :placeholder="disabled ? '' : '请输入联系方式'"
                oninput="value=value.replace(/[^\d]/g,'')" clearable maxlength="11" show-word-limit
                :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="证件类型" prop="certType"
              :rules="disabled ? [] : [{ required: true, message: '消费者证件类型为必填项', trigger: 'change' }]">
              <el-select v-model="form.certType" :placeholder="disabled ? '' : '请选择证件类型'" clearable style="width: 100%"
                :disabled="disabled">
                <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label" :value="dict.value"
                  :disabled="form.consumerIdentityType ? form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? dict.label !== '统一社会信用代码' : dict.label === '统一社会信用代码' : false"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '统一社会信用代码' : '证件号码'"
              prop="certNum" :rules="disabled
                ? []
                : [
                  { required: true, message: '证件号码为必填项', trigger: 'blur' },
                  { validator: this.validCertNum(this.form.certType), trigger: 'blur' }
                ]
                " :label-width="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '140px' : '120px'">
              <el-input v-model="form.certNum" :placeholder="disabled ? '' : '请输入证件号码'"
                :maxlength="this.validCertNumLength(this.form.certType)" show-word-limit clearable :disabled="disabled"
                @input="cardNumChange" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex"
              :rules="disabled ? [] : [{ required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者性别为必填项', trigger: 'change' }]">
              <el-select v-model="form.sex" :placeholder="disabled ? '' : '请选择性别'" clearable style="width: 100%"
                :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age"
              :rules="disabled ? [] : [{ required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者年龄为必填项', trigger: 'blur' }]">
              <el-input v-model="form.age" maxlength="3" show-word-limit :placeholder="disabled ? '' : '请输入年龄'"
                clearable :disabled="disabled" oninput="value=value.replace(/[^\d]/g,'')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" maxlength="26" show-word-limit clearable
                :placeholder="disabled ? '' : '请输入民族'" :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业" prop="profession">
              <el-input v-model="form.profession" maxlength="20" show-word-limit clearable
                :placeholder="disabled ? '' : '请输入职业'" :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" show-word-limit clearable :placeholder="disabled ? '' : '请输入邮箱'"
                :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
            <el-form-item label="身份类型" prop="identityType"
              :rules="disabled ? [] : [{ required: true, message: '消费者身份类型为必填项', trigger: 'change' }]">
              <el-select v-model="form.identityType" :placeholder="disabled ? '' : '请选择身份类型'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.dm_identity_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="调解次数" prop="mediationNumber"
              :rules="disabled ? [] : [{ required: true, message: '调解次数为必填项', trigger: 'blur' }]">
              <el-input v-model="form.mediationNumber" show-word-limit clearable
                :placeholder="disabled ? '' : '请输入调解次数'" :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="单位或住址" prop="address">
              <el-input v-model="form.address" type="textarea" :placeholder="disabled ? '' : '请输入单位或住址'" clearable
                maxlength="50" show-word-limit :disabled="disabled" :autosize="{ minRows: 1 }" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="其他当事人信息" prop="remark">
              <el-input v-model="form.remark" type="textarea" :placeholder="disabled ? '' : '请输入其他当事人信息'" clearable
                maxlength="50" show-word-limit :disabled="disabled" :autosize="{ minRows: 1 }" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType) || DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="是否屡投" prop="isRepeatedly"
              :rules="disabled ? [] : [{ required: true, message: '是否屡投为必填项', trigger: 'change' }]">
              <el-select v-model="form.isRepeatedly" :placeholder="disabled ? '' : '请选择是否屡投'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否涉及黑产" prop="isBlackIndustry"
              :rules="disabled ? [] : [{ required: true, message: '是否涉及黑产为必填项', trigger: 'change' }]">
              <el-select v-model="form.isBlackIndustry" :placeholder="disabled ? '' : '请选择是否涉及黑产'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="是否涉及第三方代理" prop="isThirdPartyAgent" label-width="150px"
              :rules="disabled ? [] : [{ required: true, message: '是否涉及第三方代理为必填项', trigger: 'change' }]">
              <el-select v-model="form.isThirdPartyAgent" :placeholder="disabled ? '' : '请选择是否涉及第三方代理'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否高危客群" prop="isHighRisk"
              :rules="disabled ? [] : [{ required: true, message: '是否高危客群为必填项', trigger: 'change' }]">
              <el-select v-model="form.isHighRisk" :placeholder="disabled ? '' : '请选择是否高危客群'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div>
        <div class="min_title">机构信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="机构名称" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :normalizer="normalizer" placeholder="请选择机构"
                @input="deptChange" disabled @click="deptChangeClick" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
                        <el-form-item label="机构类型" prop="type">
                            <el-cascader v-model="form.deptType" :options="dict.type.dept_type.options" :props="{ expandTrigger: 'hover', emitPath: false }" disabled style="width: 100%" />
                        </el-form-item>
                    </el-col> -->
          <el-col :span="12">
            <el-form-item label="机构类型" prop="institutionType">
              <el-cascader v-model="form.institutionType" disabled
                :options="DEPT_TYPE.insuranceList.includes(form.deptType) ? filteredDeptTypeOptions : dict.type.dm_institution_type"
                :props="{ expandTrigger: 'hover', emitPath: false }" :placeholder="disabled ? '' : '请选择机构类型'" clearable
                style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="住所地" prop="deptAddress">
              <el-input v-model="form.deptAddress" type="textarea" :placeholder="disabled ? '' : '请输入机构住所地'" clearable
                maxlength="100" show-word-limit :autosize="{ minRows: 1 }" :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="纠纷发生日期" prop="disputeDate"
              :rules="disabled ? [] : [{ required: true, message: '纠纷发生日期为必填项', trigger: 'blur' }]">
              <el-date-picker clearable v-model="form.disputeDate" type="date" value-format="yyyy-MM-dd"
                :placeholder="disabled ? '' : '请选择纠纷发生日期'" style="width: 100%" :disabled="disabled" :picker-options="{
                  disabledDate(time) {
                    // 禁用所有小于当前日期的日期
                    return time.getTime() > Date.now();
                  }
                }"></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机构所在地区" prop="deptArea">
              <el-input v-model="form.deptArea" :placeholder="disabled ? '' : '请输入机构所在地区'" clearable maxlength="40"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="业务经办人员" prop="deptHandlerName" :rules="disabled
              ? []
              : [
                {
                  required:
                    this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                  message: '业务经办人员为必填项',
                  trigger: 'blur'
                }
              ]
              ">
              <el-input v-model="form.deptHandlerName" :placeholder="disabled ? '' : '请输入业务经办人员'" clearable
                maxlength="10" show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经办人员联系电话" prop="deptHandlerPhone" label-width="140px" :rules="disabled
              ? []
              : [
                {
                  required:
                    this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                  message: '经办人员联系电话为必填项',
                  trigger: 'blur'
                },
                { validator: this.phoneRule, trigger: 'blur' }
              ]
              ">
              <el-input v-model="form.deptHandlerPhone" :placeholder="disabled ? '' : '请输入经办人员联系电话'" clearable
                maxlength="11" show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="经办人身份证号" prop="deptHandlerCertNum" :rules="disabled
              ? []
              : [
                {
                  required:
                    this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                  message: '经办人身份证号为必填项',
                  trigger: 'blur'
                },
                { validator: this.validCertNum(this.CERT_TYPE.CERT_TYPE0), trigger: 'blur' }
              ]
              ">
              <el-input v-model="form.deptHandlerCertNum" :placeholder="disabled ? '' : '请输入经办人身份证号'" clearable
                maxlength="18" show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="被投诉主体层级" prop="level">
              <el-input v-model="form.level" :placeholder="disabled ? '' : '请输入被投诉主体层级'" clearable maxlength="10"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="业务类别" prop="businessType1">
              <el-cascader v-model="form.businessType1" :options="dict.type.dm_business_type.options2"
                :props="{ emitPath: false, checkStrictly: false }" :placeholder="disabled ? '' : '请选择业务类别'" clearable
                style="width: 100%" :disabled="disabled" ref="businessType1Ref" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="级别二" prop="businessType2">
              <el-input v-model="form.businessType2" :placeholder="disabled ? '' : '请输入级别二'" clearable maxlength="20"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="级别三" prop="businessType3">
              <el-input v-model="form.businessType3" :placeholder="disabled ? '' : '请输入级别三'" clearable maxlength="20"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="业务办理渠道" prop="handleChannel" :rules="disabled
              ? []
              : [
                {
                  required:
                    this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                  message: '业务办理渠道为必填项',
                  trigger: 'change'
                }
              ]
              ">
              <el-select v-model="form.handleChannel" :placeholder="disabled ? '' : '请选择业务办理渠道'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.dm_handle_channel" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="投诉分类" prop="bankComplaintType" :rules="disabled
              ? []
              : [
                {
                  required:
                    this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                  message: '投诉分类为必填项',
                  trigger: 'change'
                }
              ]
              ">
              <el-select v-model="form.bankComplaintType" :placeholder="disabled ? '' : '请选择投诉分类'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.dm_bank_complaint_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="险种类别" prop="insuranceType1" :rules="disabled
              ? []
              : [
                {
                  required:
                    this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                  message: '险种类别为必填项',
                  trigger: 'change'
                }
              ]
              ">
              <el-cascader v-model="form.insuranceType1" :options="dict.type.dm_insurance_type.options2"
                :props="{ emitPath: false, checkStrictly: false }" :placeholder="disabled ? '' : '请选择险种类别'" clearable
                style="width: 100%" :disabled="disabled" ref="insuranceType1Ref" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="险种类别2" prop="insuranceType2">
              <el-input v-model="form.insuranceType2" :placeholder="disabled ? '' : '请输入险种类别2'" clearable maxlength="40"
                show-word-limit :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
          <el-col :span="12">
            <el-form-item label="产品销售渠道" prop="saleChannel">
              <el-select v-model="form.saleChannel" :placeholder="disabled ? '' : '请选择产品销售渠道'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.dm_sale_channel" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保险消费投诉事由分类" prop="insuranceComplaintType" label-width="165px"
              :rules="disabled ? [] : [{ required: form.deptAcceptMediate, message: '保险消费投诉事由分类为必填项', trigger: 'change' }]">
              <el-select v-model="form.insuranceComplaintType" :placeholder="disabled ? '' : '请选择保险消费投诉事由分类'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.dm_insurance_complaint_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="金融服务发生地" prop="financialServiceArea" :rules="disabled
              ? []
              : [{
                required: true,
                trigger: 'blur',
                message: '金融服务发生地为必填项'
              }]">
              <el-cascader :disabled="disabled" ref="financialServiceAreaRef"
                :props="{ expandTrigger: 'hover', emitPath: false }" v-model="form.financialServiceArea"
                :options="areaOptions" :placeholder="disabled ? '' : '请选择金融服务发生地'" clearable style=" width: 100%"
                @change="handleAreaChange" @clear="resetAreaData" />
            </el-form-item>
          </el-col>
          <el-col :span="12"
            v-if="DEPT_TYPE.bankList.includes(this.form.deptType) || DEPT_TYPE.nonBankList.includes(this.form.deptType)">
            <el-form-item label="产品/服务" prop="disputedProductType" :rules="disabled
              ? []
              : [
                {
                  required: DEPT_TYPE.bankList.includes(this.form.deptType) || DEPT_TYPE.nonBankList.includes(this.form.deptType),
                  message: '产品/服务为必填项',
                  trigger: 'change'
                }
              ]">
              <el-select :disabled="disabled" v-model="form.disputedProductType"
                :placeholder="disabled ? '' : '请选择产品/服务'" clearable style="width: 100%">
                <el-option v-for="dict in dict.type.dm_disputed_product_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="投诉内容" prop="complaintContent"
              :rules="disabled ? [] : [{ required: true, message: '投诉内容为必填项', trigger: 'blur' }]">
              <el-input v-model="form.complaintContent" type="textarea" :placeholder="disabled ? '' : '请输入投诉内容'"
                clearable maxlength="5000" show-word-limit :autosize="{ minRows: 3 }" :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="主要诉求" prop="appeal"
              :rules="disabled ? [] : [{ required: true, message: '主要诉求为必填项', trigger: 'blur' }]">
              <el-input v-model="form.appeal" type="textarea" :placeholder="disabled ? '' : '请输入主要诉求'" clearable
                maxlength="400" show-word-limit :autosize="{ minRows: 3 }" :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="调解员向当事人电话确认" prop="needCheck" label-width="180px"
              :rules="disabled ? [] : [{ required: true, message: '调解员向当事人电话确认为必填项', trigger: 'change' }]">
              <el-select v-model="form.needCheck" :placeholder="disabled ? '' : '请选择调解员向当事人电话确认'" clearable
                style="width: 100%" :disabled="disabled">
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="min_title">机构授权调解代理人信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="委派/委托代表姓名" prop="deptContact" label-width="140px" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '委派/委托代表姓名为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.deptContact" :placeholder="disabled ? '' : '请输入机构代表姓名'" clearable maxlength="10"
              show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="deptContactSex" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '性别为必填项',
                trigger: 'change'
              }
            ]
            ">
            <el-select v-model="form.deptContactSex" :placeholder="disabled ? '' : '请选择性别'" clearable
              style="width: 100%" :disabled="disabled">
              <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="所在部门及职务" prop="deptContactPosition" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '所在部门及职务为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.deptContactPosition" type="textarea" :placeholder="disabled ? '' : '请输入机构代表所在部门及职务'"
              clearable maxlength="30" show-word-limit :autosize="{ minRows: 1 }" :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="证件类型" prop="deptContactCertType" label-width="130px" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '证件类型为必填项',
                trigger: 'change'
              }
            ]
            ">
            <el-select v-model="form.deptContactCertType" :placeholder="disabled ? '' : '请选择证件类型'" clearable
              style="width: 100%" :disabled="disabled">
              <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label" :value="dict.value"
                v-if="dict.label !== '统一社会信用代码'"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件号码" prop="deptContactCertNum" label-width="130px" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '机构代表证件号码为必填项',
                trigger: 'blur'
              },
              { validator: this.validCertNum(this.form.deptContactCertType), trigger: 'blur' }
            ]
            ">
            <el-input v-model="form.deptContactCertNum" :placeholder="disabled ? '' : '请输入机构代表证件号码'" clearable
              :maxlength="this.validCertNumLength(this.form.deptContactCertType)" show-word-limit
              :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="deptContactPhone" label-width="130px" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '联系方式为必填项',
                trigger: 'blur'
              },
              { validator: this.phoneRule, trigger: 'blur' }
            ]
            ">
            <el-input v-model="form.deptContactPhone" :placeholder="disabled ? '' : '请输入机构代表联系方式'" maxlength="11"
              show-word-limit clearable :disabled="disabled" oninput="value=value.replace(/[^\d]/g,'')" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="min_title">调解信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="涉及产品或服务名称" prop="product" label-width="150px" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '涉及产品或服务名称为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.product" :placeholder="disabled ? '' : '请输入涉及产品或服务名称'" clearable maxlength="40"
              show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="涉及产品或服务合同号" prop="contract" label-width="170px" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '涉及产品或服务合同号为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.contract" :placeholder="disabled ? '' : '请输入涉及产品或服务合同号'" clearable maxlength="40"
              show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="涉案金额（元）" prop="involveAmount" :rules="disabled
            ? []
            : [
              {
                required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType),
                message: '涉案金额为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.involveAmount" :placeholder="disabled ? '' : '请输入涉案金额'" maxlength="12"
              show-word-limit @input="validAmount(form.involveAmount, 'involveAmount')" clearable
              :disabled="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="诉请金额（元）" prop="appealAmount" :rules="disabled
            ? []
            : [
              {
                required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType),
                message: '诉请金额为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.appealAmount" :placeholder="disabled ? '' : '请输入诉请金额'" maxlength="12"
              show-word-limit @input="validAmount(form.appealAmount, 'appealAmount')" clearable :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.deptAcceptMediate">
        <el-col :span="12">
          <el-form-item label="金融机构是否接受调解" prop="deptAcceptMediate" label-width="135px"
            :rules="disabled ? [] : [{ required: true, message: '金融机构是否接受调解为必填项', trigger: 'change' }]">
            <el-select v-model="form.deptAcceptMediate" :placeholder="disabled ? '' : '请选择金融机构是否接受调解'"
              style="width: 100%" :disabled="disabled">
              <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调解方案金额" prop="solutionAmount" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '调解方案金额为必填项',
                trigger: 'blur'
              }
            ]
            ">
            <el-input v-model="form.solutionAmount" :placeholder="disabled ? '' : '请输入调解方案金额'" maxlength="10"
              show-word-limit clearable :disabled="disabled"
              @input="validAmount(form.solutionAmount, 'solutionAmount')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12"
          v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && form.deptAcceptMediate">
          <el-form-item label="履约类型" prop="enforceAgreementType" :rules="disabled
            ? []
            : [
              {
                required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate && !DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel),
                message: '履约类型为必填项',
                trigger: 'change'
              }
            ]
            ">
            <el-select v-model="form.enforceAgreementType" :placeholder="disabled ? '' : '请选择履约类型'" clearable
              style="width: 100%" :disabled="disabled">
              <el-option v-for="dict in dict.type.dm_enforce_agreement_type" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="案件类型" prop="selfCollectionCaseType" :rules="disabled
            ? []
            : [
              {
                required:
                  (DEPT_TYPE.insuranceList.includes(form.deptType) || DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && form.deptAcceptMediate,
                message: '案件类型为必填项',
                trigger: 'change'
              }
            ]
            ">
            <el-select v-if="DEPT_TYPE.insuranceList.includes(form.deptType)" v-model="form.selfCollectionCaseType"
              :placeholder="disabled ? '' : '请选择案件类型'" clearable style="width: 100%" :disabled="disabled">
              <el-option v-for="dict in dict.type.dm_insurance_self_collection_case_type" :key="dict.value"
                :label="dict.label" :value="dict.value"></el-option>
            </el-select>
            <el-select v-else v-model="form.selfCollectionCaseType" :placeholder="disabled ? '' : '请选择案件类型'" clearable
              style="width: 100%" :disabled="disabled">
              <el-option v-for="dict in dict.type.dm_bank_self_collection_case_type" :key="dict.value"
                :label="dict.label" :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"
          v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && isControversyCaseType(form.selfCollectionCaseType) && form.deptAcceptMediate">
          <el-form-item label="争议事由" prop="controversyCause" :rules="[
            {
              required:
                (DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) &&
                isControversyCaseType(form.selfCollectionCaseType) && form.deptAcceptMediate,
              message: '争议事由为必填项',
              trigger: 'change'
            }
          ]">
            <el-select v-model="form.controversyCause" :disabled="disabled" :placeholder="disabled ? '' : '请选择争议事由'"
              clearable style="width: 100%">
              <el-option v-for="dict in dict.type.dm_controversy_cause_type" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.deptAcceptMediate">
        <el-col :span="24">
          <el-form-item label="自查情况、调解方案及依据" prop="solution" class="endItem" :rules="disabled
            ? []
            : [{ required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' }]
            ">
            <el-input v-model="form.solution" type="textarea" :placeholder="disabled ? '' : '请输入自查情况、调解方案及依据'" clearable
              maxlength="2000" show-word-limit :autosize="{ minRows: 3 }" :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && form.deptAcceptMediate">
        <el-col :span="12">
          <el-form-item label="投保人" prop="policyholder">
            <el-input v-model="form.policyholder" :placeholder="disabled ? '' : '请输入投保人'" clearable maxlength="10"
              show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被保险人" prop="insured">
            <el-input v-model="form.insured" :placeholder="disabled ? '' : '请输入被保险人'" clearable maxlength="10"
              show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && form.deptAcceptMediate">
        <el-col :span="12">
          <el-form-item label="寿险现金价值/产险权益价值" prop="cashValue" label-width="185px">
            <el-input v-model="form.cashValue" :placeholder="disabled ? '' : '请输入寿险现金价值/产险权益价值'" maxlength="10"
              show-word-limit clearable :disabled="disabled" @input="validAmount(form.cashValue, 'cashValue')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="定损金额" prop="lossAssessmentAmount">
            <el-input v-model="form.lossAssessmentAmount" :placeholder="disabled ? '' : '请输入定损金额'" maxlength="10"
              show-word-limit clearable :disabled="disabled"
              @input="validAmount(form.lossAssessmentAmount, 'lossAssessmentAmount')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && form.deptAcceptMediate">
        <el-col :span="12">
          <el-form-item label="理赔金额" prop="claimAmount">
            <el-input v-model="form.claimAmount" :placeholder="disabled ? '' : '请输入理赔金额'" maxlength="10" show-word-limit
              clearable :disabled="disabled" @input="validAmount(form.claimAmount, 'claimAmount')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && form.deptAcceptMediate">
        <el-col :span="12">
          <el-form-item label="业务所属支公司" prop="businessCompany">
            <el-input v-model="form.businessCompany" :placeholder="disabled ? '' : '请输入业务所属支公司'" clearable
              maxlength="100" show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售人员（网点、理赔人员）" prop="salesman" label-width="200px">
            <el-input v-model="form.salesman" :placeholder="disabled ? '' : '请输入销售人员'" clearable maxlength="10"
              show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && form.deptAcceptMediate">
        <el-col :span="12">
          <el-form-item label="销售、网点、理赔工号" prop="salesmanJobNum" label-width="160px">
            <el-input v-model="form.salesmanJobNum" :placeholder="disabled ? '' : '请输入销售、网点、理赔工号'" clearable
              maxlength="20" show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="销售人员、理赔人员证件号码" prop="salesmanCertNum" label-width="200px">
            <el-input v-model="form.salesmanCertNum" :placeholder="disabled ? '' : '请输入销售人员、理赔人员证件号码'" clearable
              maxlength="18" show-word-limit :disabled="disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="form.deptAcceptMediate">
        <el-col :span="24">
          <el-form-item label="已盖章反馈单" prop="stampedFeedbackAttachment">
            <file-upload v-model="form.stampedFeedbackAttachment" :fileType="[
              'bmp',
              'jpg',
              'jpeg',
              'png',
              'tif',
              'gif',
              'pdf',
              'doc',
              'docx',
              'xls',
              'xlsx',
              'csv',
              'mp4',
              'avi',
              'rmvb',
              'flv',
              'm4v',
              'mov',
              '3gp',
              '3g2',
              'wmv',
              'mpg',
              'mpeg',
              'cd',
              'wave',
              'aiff',
              'mp3',
              'wav'
            ]" :limit="1" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件" prop="attachment">
            <file-upload v-model="form.attachment" :fileType="[
              'bmp',
              'jpg',
              'jpeg',
              'png',
              'tif',
              'gif',
              'pdf',
              'doc',
              'docx',
              'xls',
              'xlsx',
              'csv',
              'mp4',
              'avi',
              'rmvb',
              'flv',
              'm4v',
              'mov',
              '3gp',
              '3g2',
              'wmv',
              'mpg',
              'mpeg',
              'cd',
              'wave',
              'aiff',
              'mp3',
              'wav'
            ]" :limit="5" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="身份证复印件、工作证复印件" prop="photocopyAttachment">
            <file-upload v-model="form.photocopyAttachment" :fileType="[
              'bmp',
              'jpg',
              'jpeg',
              'png',
              'tif',
              'gif',
              'pdf',
              'doc',
              'docx',
              'xls',
              'xlsx',
              'csv',
              'mp4',
              'avi',
              'rmvb',
              'flv',
              'm4v',
              'mov',
              '3gp',
              '3g2',
              'wmv',
              'mpg',
              'mpeg',
              'cd',
              'wave',
              'aiff',
              'mp3',
              'wav'
            ]" :limit="3" />
          </el-form-item>
        </el-col>
      </el-row>
      <div>
        <div class="min_title">受理信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="受理状态" prop="acceptStatus">
              <el-select v-model="form.acceptStatus" placeholder="请选择受理状态" style="width: 100%" clearable
                @change="form.rejectReason = null" disabled>
                <el-option v-for="dict in dict.type.dm_accept_status" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="DM_ACCEPT_STATUS.reject === form.acceptStatus">
            <el-form-item label="不予受理原因" prop="rejectReason">
              <el-select v-model="form.rejectReason" placeholder="请选择不予受理原因" clearable style="width: 100%" disabled>
                <el-option v-for="dict in dict.type.dm_reject_reason" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateDisputeMediation, updateDisputeMediationAttachment, getDisputeMediationExpandInfo, saveOrUpdateDisputeMediationExpand, getProvinces, getCities, getByDeptId, getProvinceCityTree } from '@/api/project/disputeMediation';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import {
  DEPT_TYPE,
  SYS_YES_NO,
  SYS_SEX,
  DM_ACCEPT_STATUS,
  DM_ENTRY_CHANNEL,
  CERT_TYPE,
  DM_AGREEMENT_STEP,
  DM_STATUS,
  MARK_CASE_TYPE_LABEL,
  DM_IDENTITY_TYPE
} from '@/views/constant/CommonConstant.js';
import { mapGetters } from 'vuex';

export default {
  components: { Treeselect },
  dicts: [
    'dept_type',
    'dm_status',
    'dm_sale_channel',
    'dm_bank_complaint_type',
    'dm_insurance_complaint_type',
    'dm_accept_status',
    'dm_self_accept_status',
    'dm_reject_reason',
    'dm_business_type',
    'cert_type',
    'sys_yes_no',
    'sys_user_sex',
    'dm_handle_channel',
    'dm_enforce_agreement_type',
    'dm_entry_channel',
    'dm_insurance_type',
    'dm_bank_self_collection_case_type',
    'dm_insurance_self_collection_case_type',
    'dm_consumer_identity_type',
    'dm_disputed_product_type',
    'dm_channel_type',
    'dm_institution_type',
    'dm_controversy_cause_type',
    'dm_identity_type'
  ],
  props: ['title', 'deptOptions', 'deptMap'],
  computed: {
    ...mapGetters(['permissions', 'userInfo']),

    // 判断用户是否属于纠纷调解部
    isDisputeMediationDept() {
      return this.deptIdList.includes(this.userInfo.deptId);
    },

    // 判断用户是否为调解员
    isMediator() {
      return this.userInfo.isDMCenterMediator === true || this.userInfo.isDMCourtMediator === true;
    },
    filteredDeptTypeOptions() {
      if (!this.dict.type.dept_type?.options) {
        return [];
      }
      const options = this.dict.type.dept_type.options;
      const deptType = this.form.deptType;

      if (DEPT_TYPE.insuranceList.includes(deptType)) {
        // 查找保险机构
        const insuranceNode = options.find(item => {
          return item.label === '保险机构' || item.dictLabel === '保险机构' || (Array.isArray(item.value) && item.value.some(v => String(v).startsWith('insurance')));
        });

        if (insuranceNode) {
          const result = [insuranceNode];
          return result;
        }

        return [];
      }

      return [];
    }
  },
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      // 表单校验
      rules: {
        // entryChannel: [
        //   { required: true, message: '进件渠道为必填项', trigger: 'change' },
        // ],
        // isSelf: [
        //   { required: true, message: '是否消费者本人为必填项', trigger: 'change' },
        // ],
        // agentCertNum: [
        //   { required: this.form.agentCertType, message: '代理人证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' },
        // ],
        // agentPhone: [
        //   { validator: this.phoneRule, trigger: 'blur' },
        // ],
        // name: [
        //   { required: true, message: '消费者姓名为必填项', trigger: 'blur' },
        // ],
        // phone: [
        //   { required: true, message: '消费者联系方式为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' },
        // ],
        // certType: [
        //   { required: true, message: '消费者证件类型为必填项', trigger: 'change' },
        // ],
        // certNum: [
        //   { required: true, message: '消费者证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' },
        // ],
        // sex: [
        //   { required: true, message: '消费者性别为必填项', trigger: 'change' },
        // ],
        // age: [
        //   { required: true, message: '消费者年龄为必填项', trigger: 'blur' },
        // ],
        // isRepeatedly: [
        //   { required: true, message: '是否屡投为必填项', trigger: 'change' }
        // ],
        // isBlackIndustry: [
        //   { required: true, message: '是否涉及黑产为必填项', trigger: 'change' }
        // ],
        // isThirdPartyAgent: [
        //   { required: true, message: '是否涉及第三方代理为必填项', trigger: 'change' }
        // ],
        // isHighRisk: [
        //   { required: true, message: '是否高危客群为必填项', trigger: 'change' }
        // ],
        // deptId: [
        //   { required: true, message: '机构名称为必填项', trigger: 'blur' },
        // ],
        // disputeDate: [
        //   { required: true, message: '纠纷发生日期为必填项', trigger: 'blur' },
        // ],
        // complaintContent: [
        //   { required: true, message: '投诉内容为必填项', trigger: 'blur' },
        // ],
        // appeal: [
        //   { required: true, message: '主要诉求为必填项', trigger: 'blur' },
        // ],
        // needCheck: [
        //   { required: true, message: '调解员向当事人电话确认为必填项', trigger: 'change'},
        // ],
        // deptHandlerName: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务经办人员为必填项', trigger: 'blur' }
        // ],
        // deptHandlerPhone: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人员联系电话为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' }
        // ],
        // deptHandlerCertNum: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人身份证号为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' }
        // ],
        // businessType1: [
        //   { required: true, message: '业务类别为必填项', trigger: 'change' }
        // ],
        // handleChannel: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务办理渠道为必填项', trigger: 'change' }
        // ],
        // bankComplaintType: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '投诉分类为必填项', trigger: 'change' }
        // ],
        // deptContact: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '委派/委托代表姓名为必填项', trigger: 'blur' }
        // ],
        // deptContactSex: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '性别为必填项', trigger: 'change' }
        // ],
        // deptContactPosition: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '所在部门及职务为必填项', trigger: 'blur' }
        // ],
        // deptContactCertType: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件类型为必填项', trigger: 'change' }
        // ],
        // deptContactCertNum: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '机构代表证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' }
        // ],
        // deptContactPhone: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '联系方式为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' }
        // ],
        // product: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务名称为必填项', trigger: 'blur' }
        // ],
        // contract: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务合同号为必填项', trigger: 'blur' }
        // ],
        // involveAmount: [
        //   { required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: '涉案金额为必填项', trigger: 'blur' },
        // ],
        // appealAmount: [
        //   { required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: '诉请金额为必填项', trigger: 'blur' },
        // ],
        // deptAcceptMediate: [
        //   { required: true, message: '金融机构是否接受调解为必填项', trigger: 'change'},
        // ],
        // enforceAgreementType: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '履约类型为必填项', trigger: 'change' },
        // ],
        // solutionAmount: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '调解方案金额为必填项', trigger: 'blur' },
        // ],
        // solution: [
        //   { required: this.form.deptAcceptMediate && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' },
        // ],
        // acceptStatus: [
        //   { required: true, message: '受理状态为必填项', trigger: 'change' },
        // ],
        markCaseType: [{ required: true, message: '案件类型为必填项', trigger: 'change' }],
        institutionType: [{ required: true, message: '机构类型为必填项', trigger: 'change' }]
        // mediationNumber: [{ required: true, message: '调解次数为必填项', trigger: 'change' }]
      },
      disabled: false,
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      CERT_TYPE: CERT_TYPE, // 身份证类型,
      MARK_CASE_TYPE_LABEL: MARK_CASE_TYPE_LABEL,
      DM_IDENTITY_TYPE: DM_IDENTITY_TYPE, // 消费者身份类型,
      areaOptions: [], // 省市数据源
      controversyCaseTypes: [
        'bank_3', // 贷款-房屋抵押贷款（商业/公积金）
        'bank_4', // 贷款-汽车抵押贷款
        'bank_5', // 贷款-质押贷款(大额存单/知识产权)
        'bank_6', // 贷款-个人消费贷款
        'bank_7', // 贷款-个人经营贷款
        'bank_8', // 贷款-固定资产贷款
        'bank_9', // 贷款-流动资金贷款
        'bank_10', // 信用卡-息费、分期
        'bank_11', // 信用卡-调整额度、协商还款
        'bank_12' // 信用卡-催收、盗刷
      ],
    };
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
    }
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
  created() { },
  methods: {
    /** 消费者身份类型改变时，清空证件类型和修改是否消费者 */
    changeConsumerIdentityType() {
      this.form.certType = null
      if (this.form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL) {
        this.form.isSelf = SYS_YES_NO.sys_no
      } else {
        this.form.isSelf = SYS_YES_NO.sys_yes
      }
    },
    // 根据身份证号自动填充年龄性别
    cardNumChange(val) {
      if (this.form.certType === CERT_TYPE.CERT_TYPE0) {
        let hasError = false;
        this.$refs['form'].validateField(['certNum'], err => {
          if (err) {
            hasError = true;
            return;
          }
        });
        if (!hasError) {
          if (val.charAt(16) % 2 === 0) {
            this.form.sex = SYS_SEX.man;
          } else {
            this.form.sex = SYS_SEX.woman;
          }
          let birthDateStr = val.substring(6, 14);
          let birthYear = parseInt(birthDateStr.substring(0, 4), 10);
          let birthMonth = parseInt(birthDateStr.substring(4, 6), 10) - 1;
          let birthDay = parseInt(birthDateStr.substring(6, 8), 10);
          let birthDate = new Date(birthYear, birthMonth, birthDay);
          let currentDate = new Date();
          let age = currentDate.getFullYear() - birthYear;
          if (currentDate.getMonth() < birthMonth || (currentDate.getMonth() === birthMonth && currentDate.getDate() < birthDay)) {
            age -= 1;
          }
          this.form.age = age;
        }
      }
    },
    /** 校验数字并且小数点后两位 */
    validAmount(value, str) {
      // 使用正则表达式限制输入
      this.form[str] = value.replace(/[^\d.]/g, ''); // 只允许输入数字和小数点
      if (this.form[str].split('.').length > 2) {
        // 限制只能有一个小数点
        this.form[str] = this.form[str].split('.').slice(0, 2).join('.');
      }
      if (this.form[str].split('.')[1] && this.form[str].split('.')[1].length > 2) {
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
              callback(new Error('请输入正确的身份证'));
            }
          } else if (certType === CERT_TYPE.CERT_TYPE1) {
            if (value.length === 9) {
              callback();
            } else {
              callback(new Error('请输入正确的护照'));
            }
          } else if (certType === CERT_TYPE.CERT_TYPE2) {
            if (value.length === 10) {
              callback();
            } else {
              callback(new Error('请输入正确的军警证'));
            }
          } else if (certType === CERT_TYPE.CERT_TYPE3) {
            if (value.length === 15) {
              callback();
            } else {
              callback(new Error('请输入正确的外国人永久居留证'));
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
          callback(new Error('请输入正确的联系方式'));
        }
      }
    },
    // 表单重置
    reset() {
      this.form = {
        workOrderId: null,
        manageDeptId: null,
        isSelf: 'Y',
        agentName: null,
        agentCertType: null,
        agentCertNum: null,
        agentSex: null,
        agentPhone: null,
        isRepeatedly: null,
        isBlackIndustry: null,
        isThirdPartyAgent: null,
        isHighRisk: null,
        name: null,
        certType: null,
        certNum: null,
        sex: null,
        age: null,
        nation: null,
        profession: null,
        phone: null,
        address: null,
        disputeDate: null,
        deptId: null,
        deptType: null,
        deptAddress: null,
        deptContact: null,
        deptContactCertType: null,
        deptContactCertNum: null,
        deptContactSex: null,
        deptContactPhone: null,
        deptContactPosition: null,
        entryChannel: null,
        deptArea: null,
        level: null,
        businessType1: null,
        businessType2: null,
        businessType3: null,
        handleChannel: null,
        saleChannel: null,
        bankComplaintType: null,
        insuranceComplaintType: null,
        complaintContent: null,
        appeal: null,
        needCheck: null,
        product: null,
        contract: null,
        involveAmount: null,
        appealAmount: null,
        deptAcceptMediate: null,
        acceptStatus: null,
        rejectReason: null,
        deptHandlerName: null,
        deptHandlerPhone: null,
        deptHandlerCertNum: null,
        // deptHandlerCertType: this.CERT_TYPE.CERT_TYPE0,
        enforceAgreementType: null,
        solution: null,
        solutionAmount: null,
        policyholder: null,
        insured: null,
        cashValue: null,
        lossAssessmentAmount: null,
        claimAmount: null,
        businessCompany: null,
        salesman: null,
        salesmanJobNum: null,
        salesmanCertNum: null,
        stampedFeedbackAttachment: null,
        attachment: null,
        photocopyAttachment: null,
        mediatorUserId: null,
        assistantUserId: null,
        status: null,
        createId: null,
        createTime: null,
        updateId: null,
        updateTime: null,
        markCaseType: '20',
        consumerIdentityType: null,
        identityType: null,
        email: null,
        mediationNumber: null,
        disputedProductType: null,
        channelType: null,
        provinceCode: null,
        provinceName: null,
        cityCode: null,
        cityName: null,
        financialServiceArea: null,
        remark: null,
        institutionType: null
      };
      this.resetForm('form');
      if (
        this.DEPT_TYPE.bankList.includes(this.$store.getters.userInfo.dept.type) ||
        this.DEPT_TYPE.nonBankList.includes(this.$store.getters.userInfo.dept.type) ||
        this.DEPT_TYPE.insuranceList.includes(this.$store.getters.userInfo.dept.type)
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
        children: node.children
      };
    },
    async open(row) {
      this.reset();
      this.form = { ...row, markCaseType: '20' };
      // 法院渠道工单，修改时金融机构是否接受调解必填
      if (DM_ENTRY_CHANNEL.COURT.includes(row.entryChannel) && DM_STATUS.DM_STATUS2 === row.status && row.assistantUserId && !this.form.deptAcceptMediate) {
        this.form.deptAcceptMediate = SYS_YES_NO.sys_yes;
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
      if (this.DEPT_TYPE.insuranceList.includes(this.form.deptType)) {
        this.filteredDeptTypeOptions;
      }

      await this.loadProvinces();


      // isRepeatedly  isBlackIndustry  isThirdPartyAgent  isHighRisk
      if (!this.form.isRepeatedly && (this.DEPT_TYPE.insuranceList.includes(this.form.deptType)) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType) || this.DEPT_TYPE.bankList.includes(this.form.deptType)) {
        this.form.isRepeatedly = SYS_YES_NO.sys_no;
      }
      if (!this.form.isBlackIndustry && (this.DEPT_TYPE.insuranceList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType) || this.DEPT_TYPE.bankList.includes(this.form.deptType))) {
        this.form.isBlackIndustry = SYS_YES_NO.sys_no;
      }
      if (!this.form.isThirdPartyAgent && (this.DEPT_TYPE.nonBankList.includes(this.form.deptType) || this.DEPT_TYPE.bankList.includes(this.form.deptType))) {
        this.form.isThirdPartyAgent = SYS_YES_NO.sys_no;
      }
      if (!this.form.isHighRisk && (this.DEPT_TYPE.nonBankList.includes(this.form.deptType) || this.DEPT_TYPE.bankList.includes(this.form.deptType))) {
        this.form.isHighRisk = SYS_YES_NO.sys_no;
      }

      // 工单进入审核状态或办结
      this.disabled =
        (DM_STATUS.DM_STATUS4 === this.form.status && this.form.agreementStep != null && DM_AGREEMENT_STEP.AR !== this.form.agreementStep) ||
        [DM_STATUS.DM_STATUS10].includes(this.form.status);
      getDisputeMediationExpandInfo(row.workOrderId)
        .then(res => {
          if (res.data != null && res.data.markCaseType != null && res.data.markCaseType !== '') {
            this.$set(this.form, 'markCaseType', String(res.data.markCaseType));
          } else {
            this.$set(this.form, 'markCaseType', '20');
          }
          if (res.data != null && res.data.email != null && res.data.email !== '') {
            this.$set(this.form, 'email', String(res.data.email));
          }
          if (res.data != null && res.data.institutionType != null && res.data.institutionType !== '') {
            this.$set(this.form, 'institutionType', String(res.data.institutionType));
          }
          if (res.data != null && res.data.mediationNumber != null && res.data.mediationNumber !== '') {
            this.$set(this.form, 'mediationNumber', String(res.data.mediationNumber));
          } else {
            this.$set(this.form, 'mediationNumber', '1');
          }
          if (res.data != null && res.data.remark != null && res.data.remark !== '') {
            this.$set(this.form, 'remark', String(res.data.remark));
          }
          if (res.data != null && res.data.selfCollectionCaseType != null && res.data.selfCollectionCaseType !== '') {
            this.$set(this.form, 'selfCollectionCaseType', String(res.data.selfCollectionCaseType));
          }
          if (res.data != null && res.data.controversyCause != null && res.data.controversyCause !== '') {
            this.$set(this.form, 'controversyCause', String(res.data.controversyCause));
          }
          if (res.data != null && res.data.identityType != null && res.data.identityType !== '') {
            this.$set(this.form, 'identityType', String(res.data.identityType));
          }
          if (res.data != null && res.data.consumerIdentityType != null && res.data.consumerIdentityType !== '') {
            this.$set(this.form, 'consumerIdentityType', String(res.data.consumerIdentityType));
          }
          if (res.data != null && res.data.disputedProductType != null && res.data.disputedProductType !== '') {
            this.$set(this.form, 'disputedProductType', String(res.data.disputedProductType));
          }
          if (res.data != null && res.data.channelType != null && res.data.channelType !== '') {
            this.$set(this.form, 'channelType', String(res.data.channelType));
          } else {
            if (this.form.entryChannel && (this.form.entryChannel === DM_ENTRY_CHANNEL.C || this.form.entryChannel === DM_ENTRY_CHANNEL.G)) {
              this.form.channelType = '0';
            } else {
              this.form.channelType = '1';
            }
          }
          if (res.data != null && res.data.provinceCode != null && res.data.provinceCode !== '') {
            // 1. 动态构建级联选择器的回显数组
            // 基础数据一定有省份编码
            this.form.financialServiceArea = res.data.provinceCode;

            // 判断是否有城市编码（兼容只选省份的情况）
            if (res.data.cityCode) {
              this.form.financialServiceArea = res.data.cityCode;
            }
            this.form.provinceCode = res.data.provinceCode;
            this.form.provinceName = res.data.provinceName || '';
            this.form.cityCode = res.data.cityCode || '';
            this.form.cityName = res.data.cityName || '';
          } else {
            // 3. 没有返回省份数据，清空级联选择器和相关字段
            this.form.financialServiceArea = null;
            this.resetAreaData();
          }
        })
        .catch(() => { });

      if (!this.form.institutionType) {
        if (DEPT_TYPE.insuranceList.includes(this.form.deptType)) {
          this.form.institutionType = this.form.deptType;
        }
        if (DEPT_TYPE.nonBankList.includes(this.form.deptType) || DEPT_TYPE.bankList.includes(this.form.deptType)) {
          const res = await getByDeptId(this.form.deptId);
          if (res.code === 200) {
            this.form.institutionType = this.dict.type.dm_institution_type.find(ite => ite.label === res.data.departLable).value
          }
        }
      }
      if (this.$refs && this.$refs.form) {
        this.$refs.form.clearValidate('institutionType');
      }

      this.visible = true;
    },
    /** 扩展服务：保存标记案件类型（主工单接口成功后调用） */
    syncExpandMarkCaseType(markCaseType) {
      if (markCaseType === undefined || markCaseType === null || markCaseType === '') {
        return Promise.resolve();
      }
      return saveOrUpdateDisputeMediationExpand({
        workOrderId: this.form.workOrderId,
        mediatorUserId: this.form.mediatorUserId,
        markCaseType: String(markCaseType)
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true;
          const markCaseType = this.form.markCaseType;
          const payload = { ...this.form };
          delete payload.markCaseType;
          const {
            email,
            mediationNumber,
            identityType,
            consumerIdentityType,
            disputedProductType,
            channelType,
            financialServiceArea,
            provinceCode,
            provinceName,
            cityCode,
            cityName,
            selfCollectionCaseType,
            controversyCause,
            remark,
            institutionType,
            ...restForm
          } = this.form;

          if (this.disabled) {
            updateDisputeMediationAttachment(restForm)
              .then(() => this.syncExpandMarkCaseType(markCaseType))
              .then(async () => {
                await saveOrUpdateDisputeMediationExpand({
                  workOrderId: this.form.workOrderId,
                  email,
                  institutionType,
                  mediationNumber,
                  identityType,
                  consumerIdentityType,
                  disputedProductType,
                  channelType,
                  provinceCode,
                  provinceName,
                  cityCode,
                  cityName,
                  selfCollectionCaseType,
                  controversyCause,
                  remark
                });
                this.loading = false;
                this.$modal.msgSuccess('修改成功');
                this.visible = false;
                this.$emit('callback');
              })
              .catch(() => {
                this.loading = false;
              });
          } else {
            updateDisputeMediation(restForm)
              .then(() => this.syncExpandMarkCaseType(markCaseType))
              .then(async () => {
                await saveOrUpdateDisputeMediationExpand({
                  workOrderId: this.form.workOrderId,
                  email,
                  institutionType,
                  mediationNumber,
                  identityType,
                  consumerIdentityType,
                  disputedProductType,
                  channelType,
                  provinceCode,
                  provinceName,
                  cityCode,
                  cityName,
                  selfCollectionCaseType,
                  controversyCause,
                  remark
                });
                this.loading = false;
                this.$modal.msgSuccess('修改成功');
                this.visible = false;
                this.$emit('callback');
              })
              .catch(() => {
                this.loading = false;
              });
          }
        }
      });
    },
    cancel() {
      this.visible = false;
      this.reset();
    },
    deptChangeClick() {
      if (this.$refs && this.$refs.form) {
        this.$refs.form.clearValidate('institutionType');
      }
    },
    /** 机构发生变化 */
    async deptChange() {
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
        if (DEPT_TYPE.insuranceList.includes(this.form.deptType)) {
          this.form.institutionType = this.form.deptType;
          // 强制重新计算
          this.$nextTick(() => {
            this.filteredDeptTypeOptions;
          });
        }
        if (DEPT_TYPE.nonBankList.includes(this.form.deptType) || DEPT_TYPE.bankList.includes(this.form.deptType)) {
          const res = await getByDeptId(this.form.deptId);
          if (res.code === 200) {
            this.form.institutionType = this.dict.type.dm_institution_type.find(ite => ite.label === res.data.departLable).value
          }
        }
      } else {
        this.form.deptType = null;
      }
      if (this.$refs && this.$refs.form) {
        this.$refs.form.clearValidate('institutionType');
      }
    },

    async loadProvinces() {
      try {
        const res = await getProvinceCityTree();
        if (res.code === 200) {
          this.areaOptions = res.data.map(item => ({
            label: item.provinceName,
            value: item.provinceCode,
            children: item.children && item.children.length > 0
              ? item.children.map(child => ({
                label: child.cityName,
                value: child.cityCode
              }))
              : undefined // 没有子节点时设为 undefined，这样就不会显示展开箭头
          }));
        }
      } catch (error) {
        console.error('获取省份失败:', error);
      }
    },

    handleAreaChange(value) {
      this.form.financialServiceArea = value;
      const selectedNode = this.findAreaInfo(value);
      if (selectedNode) {
        this.form.provinceCode = selectedNode.provinceCode;
        this.form.provinceName = selectedNode.provinceName;
        this.form.cityCode = selectedNode.cityCode || '';
        this.form.cityName = selectedNode.cityName || '';
      }
    },
    findAreaInfo(code) {
      // 如果code为空，返回null
      if (!code) {
        return null;
      }

      // 遍历所有省份
      for (const province of this.areaOptions) {
        // 检查是否匹配省份code
        if (province.value === code) {
          return {
            type: 'province',
            provinceCode: province.value,
            provinceName: province.label,
            cityCode: null,
            cityName: null
          };
        }

        // 检查该省份下是否有匹配的城市
        if (province.children && province.children.length > 0) {
          for (const city of province.children) {
            if (city.value === code) {
              // 找到城市，补齐provinceName并返回完整信息
              return {
                type: 'city',
                provinceCode: city.value,
                provinceName: province.label, // 从父级获取省份名称
                cityCode: city.value,
                cityName: city.label
              };
            }
          }
        }
      }

      // 未找到匹配项
      return null;
    },
    // 4. 重置选择器数据（比如在 open 或 reset 方法里调用）
    resetAreaData() {
      this.form.provinceCode = null;
      this.form.provinceName = null;
      this.form.cityCode = null;
      this.form.cityName = null;
    },
    isControversyCaseType(caseType) {
      if (!caseType) return false;
      return this.controversyCaseTypes.includes(caseType);
    }
  }
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
