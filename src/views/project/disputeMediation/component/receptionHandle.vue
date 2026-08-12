<!-- 前台处理对话框 -->
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
                :props="{ expandTrigger: 'hover', emitPath: false }" clearable style="width: 100%" disabled />
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
          <el-col :span="12" v-if="
            $store.getters.userInfo.isDMEntryClerk ||
            DEPT_TYPE.insuranceList.includes(form.deptType) ||
            DEPT_TYPE.bankList.includes(form.deptType) ||
            DEPT_TYPE.nonBankList.includes(form.deptType)
          ">
            <el-form-item label="渠道类型" prop="channelType"
              :rules="[{ required: true, message: '渠道类型为必填项', trigger: 'change' }]">
              <el-select disabled v-model="form.channelType" placeholder="请选择渠道类型" clearable style="width: 100%">
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
            <el-form-item label="是否消费者本人" prop="isSelf">
              <el-radio-group v-model="form.isSelf" :disabled="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL">
                <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="SYS_YES_NO.sys_no === form.isSelf">
            <el-form-item label="代理人姓名" prop="agentName"
              :rules="[{ required: form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL, message: '代理人姓名为必填项', trigger: 'blur' }]">
              <el-input v-model="form.agentName" placeholder="请输入代理人姓名" maxlength="10" show-word-limit clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
          <el-col :span="12">
            <el-form-item label="代理人证件类型" prop="agentCertType"
              :rules="[{ required: form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL, message: '代理人证件类型为必填项', trigger: 'change' }]">
              <el-select v-model="form.agentCertType" placeholder="请选择代理人证件类型" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理人证件号码" prop="agentCertNum"
              :rules="[{ required: form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL, message: '代理人证件号码为必填项', trigger: 'blur' }, { validator: this.validCertNum(this.form.agentCertType), trigger: 'blur' }]">
              <el-input v-model="form.agentCertNum" placeholder="请输入代理人证件号码"
                :maxlength="this.validCertNumLength(this.form.agentCertType)" show-word-limit clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
          <el-col :span="12">
            <el-form-item label="代理人联系方式" prop="agentPhone"
              :rules="[{ required: form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL, message: '代理人联系方式为必填项', trigger: 'blur' }]">
              <el-input v-model="form.agentPhone" placeholder="请输入代理人联系方式" maxlength="11" show-word-limit
                oninput="value=value.replace(/[^\d]/g,'')" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="代理人性别" prop="agentSex"
              :rules="[{ required: form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL, message: '代理人性别为必填项', trigger: 'change' }]">
              <el-select v-model="form.agentSex" placeholder="请选择代理人性别" style="width: 100%" clearable>
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
              :rules="[{ required: true, message: '消费者身份类型为必填项', trigger: 'blur' }]">
              <el-select v-model="form.consumerIdentityType" placeholder="请选择消费者身份类型"
                @change="changeConsumerIdentityType">
                <el-option v-for="dict in dict.type.dm_consumer_identity_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '法人或非法人组织' : '消费者姓名'"
              prop="name" :label-width="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '140px' : '120px'">
              <el-input v-model="form.name" placeholder="请输入消费者姓名" maxlength="50" show-word-limit clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="phone" :rules="[
              { required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者联系方式为必填项', trigger: 'blur' },
              { validator: this.phoneRule, trigger: 'blur' }
            ]">
              <el-input v-model="form.phone" placeholder="请输入联系方式" oninput="value=value.replace(/[^\d]/g,'')"
                maxlength="11" show-word-limit clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="证件类型" prop="certType">
              <el-select v-model="form.certType" placeholder="请选择证件类型" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label" :value="dict.value"
                  :disabled="form.consumerIdentityType ? form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? dict.label !== '统一社会信用代码' : dict.label === '统一社会信用代码' : false"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? '统一社会信用代码' : '证件号码'"
              prop="certNum" :rules="[
                { required: true, message: '证件号码为必填项', trigger: 'blur' },
                { validator: this.validCertNum(this.form.certType), trigger: 'blur' }
              ]">
              <el-input v-model="form.certNum" placeholder="请输入证件号码"
                :maxlength="this.validCertNumLength(this.form.certType)" show-word-limit @input="cardNumChange"
                clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex"
              :rules="[{ required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者性别为必填项', trigger: 'change' }]">
              <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age"
              :rules="[{ required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者年龄为必填项', trigger: 'blur' }]">
              <el-input v-model="form.age" maxlength="3" show-word-limit placeholder="请输入年龄"
                oninput="value=value.replace(/[^\d]/g,'')" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" maxlength="26" show-word-limit placeholder="请输入民族" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职业" prop="profession">
              <el-input v-model="form.profession" maxlength="20" show-word-limit placeholder="请输入职业" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" show-word-limit clearable placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
            <el-form-item label="身份类型" prop="identityType"
              :rules="[{ required: DEPT_TYPE.insuranceList.includes(form.deptType), message: '消费者身份类型为必填项', trigger: 'change' }]">
              <el-select v-model="form.identityType" placeholder="请选择身份类型" clearable style="width: 100%">
                <el-option v-for="dict in dict.type.dm_identity_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="单位或住址" prop="address">
              <el-input v-model="form.address" type="textarea" placeholder="请输入单位或住址" maxlength="50" show-word-limit
                clearable :autosize="{ minRows: 1 }" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="其他当事人信息" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入其他当事人信息" clearable maxlength="50"
                show-word-limit :autosize="{ minRows: 1 }" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType) || DEPT_TYPE.insuranceList.includes(form.deptType)) && !$store.getters.userInfo.isDMEntryClerk">
          <el-col :span="12">
            <el-form-item label="是否屡投" prop="isRepeatedly">
              <el-select v-model="form.isRepeatedly" placeholder="请选择是否屡投" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否涉及黑产" prop="isBlackIndustry">
              <el-select v-model="form.isBlackIndustry" placeholder="请选择是否涉及黑产" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && !$store.getters.userInfo.isDMEntryClerk">
          <el-col :span="12">
            <el-form-item label="是否涉及第三方代理" prop="isThirdPartyAgent" label-width="150px">
              <el-select v-model="form.isThirdPartyAgent" placeholder="请选择是否涉及第三方代理" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否高危客群" prop="isHighRisk">
              <el-select v-model="form.isHighRisk" placeholder="请选择是否高危客群" style="width: 100%" clearable>
                <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="min_title">机构信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="机构名称" prop="deptId">
            <treeselect v-model="form.deptId" :options="deptOptions" :normalizer="normalizer" disabled />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="机构类型" prop="type">
            <el-cascader v-model="form.deptType" :options="dict.type.dept_type.options"
              :props="{ expandTrigger: 'hover', emitPath: false }" disabled style="width: 100%" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="机构类型" prop="institutionType">
            <el-cascader v-model="form.institutionType" disabled
              :options="DEPT_TYPE.insuranceList.includes(form.deptType) ? filteredDeptTypeOptions : dict.type.dm_institution_type"
              :props="{ expandTrigger: 'hover', emitPath: false }" placeholder="请选择机构类型" clearable
              style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="住所地" prop="deptAddress">
            <el-input v-model="form.deptAddress" type="textarea" placeholder="请输入机构住所地" maxlength="100" show-word-limit
              clearable :autosize="{ minRows: 1 }" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="纠纷发生日期" prop="disputeDate">
            <el-date-picker v-model="form.disputeDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择纠纷发生日期"
              style="width: 100%" clearable :picker-options="{
                disabledDate(time) {
                  // 禁用所有小于当前日期的日期
                  return time.getTime() > Date.now();
                }
              }"></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构所在地区" prop="deptArea">
            <el-input v-model="form.deptArea" placeholder="请输入机构所在地区" maxlength="40" show-word-limit clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="委派/委托代表姓名" prop="deptContact" label-width="140px"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '委派/委托代表姓名为必填项', trigger: 'blur' }]">
            <el-input v-model="form.deptContact" placeholder="请输入机构代表姓名" maxlength="10" show-word-limit clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="deptContactSex"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '性别为必填项', trigger: 'blur' }]">
            <el-select v-model="form.deptContactSex" placeholder="请选择性别" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="证件类型" prop="deptContactCertType"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件类型为必填项', trigger: 'blur' }]">
            <el-select v-model="form.deptContactCertType" placeholder="请选择证件类型" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件号码" prop="deptContactCertNum" :rules="[
            { validator: this.validCertNum(this.form.deptContactCertType), trigger: 'blur' },
            { required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件号码为必填项', trigger: 'blur' }
          ]">
            <el-input v-model="form.deptContactCertNum" placeholder="请输入机构代表证件号码"
              :maxlength="this.validCertNumLength(this.form.deptContactCertType)" show-word-limit clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="所在部门及职务" prop="deptContactPosition"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '所在部门及职务为必填项', trigger: 'blur' }]">
            <el-input v-model="form.deptContactPosition" type="textarea" placeholder="请输入机构代表所在部门及职务" maxlength="30"
              show-word-limit clearable :autosize="{ minRows: 1 }" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="deptContactPhone"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '联系方式为必填项', trigger: 'blur' }]">
            <el-input v-model="form.deptContactPhone" placeholder="请输入机构代表联系方式" maxlength="11" show-word-limit
              oninput="value=value.replace(/[^\d]/g,'')" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12"
          v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-form-item label="被投诉主体层级" prop="level">
            <el-input v-model="form.level" placeholder="请输入被投诉主体层级" maxlength="10" show-word-limit clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="业务类别" prop="businessType1"
            :rules="[{ required: DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType), message: '业务类别为必填项', trigger: 'change' }]">
            <el-cascader v-model="form.businessType1" :options="dict.type.dm_business_type.options2"
              :props="{ emitPath: false, checkStrictly: false }" placeholder="请选择业务类别" style="width: 100%" clearable
              ref="businessType1Ref" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="级别二" prop="businessType2">
            <el-input v-model="form.businessType2" placeholder="请输入级别二" maxlength="20" show-word-limit clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="级别三" prop="businessType3">
            <el-input v-model="form.businessType3" placeholder="请输入级别三" maxlength="20" show-word-limit clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="业务办理渠道" prop="handleChannel"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务办理渠道为必填项', trigger: 'blur' }]">
            <el-select v-model="form.handleChannel" placeholder="请选择业务办理渠道" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.dm_handle_channel" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="投诉分类" prop="bankComplaintType"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '投诉分类为必填项', trigger: 'blur' }]">
            <el-select v-model="form.bankComplaintType" placeholder="请选择投诉分类" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.dm_bank_complaint_type" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="业务经办人员" prop="deptHandlerName"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务经办人员为必填项', trigger: 'blur' }]">
            <el-input v-model="form.deptHandlerName" placeholder="请输入业务经办人员" maxlength="10" show-word-limit clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经办人员联系电话" prop="deptHandlerPhone" label-width="140px"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人员联系电话为必填项', trigger: 'blur' }]">
            <el-input v-model="form.deptHandlerPhone" placeholder="请输入经办人员联系电话" maxlength="11" show-word-limit
              clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="经办人身份证号" prop="deptHandlerCertNum" :rules="[
            { validator: this.validCertNum(this.CERT_TYPE.CERT_TYPE0), trigger: 'blur' },
            { required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人身份证号为必填项', trigger: 'blur' }
          ]">
            <el-input v-model="form.deptHandlerCertNum" placeholder="请输入经办人身份证号" maxlength="18" show-word-limit
              clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="险种类别" prop="insuranceType1"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '险种类别为必填项', trigger: 'change' }]">
            <el-cascader v-model="form.insuranceType1" :options="dict.type.dm_insurance_type.options2"
              :props="{ emitPath: false, checkStrictly: false }" placeholder="请选择险种类别" clearable style="width: 100%"
              ref="insuranceType1Ref" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="险种类别2" prop="insuranceType2">
            <el-input v-model="form.insuranceType2" placeholder="请输入险种类别2" clearable maxlength="40" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
        <el-col :span="12">
          <el-form-item label="产品销售渠道" prop="saleChannel">
            <el-select v-model="form.saleChannel" placeholder="请选择产品销售渠道" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.dm_sale_channel" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保险消费投诉事由分类" prop="insuranceComplaintType" label-width="165px">
            <el-select v-model="form.insuranceComplaintType" placeholder="请选择保险消费投诉事由分类" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.dm_insurance_complaint_type" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="金融服务发生地" prop="financialServiceArea" :rules="[
            {
              required: true,
              message: '金融服务发生地为必填项',
              trigger: 'blur'
            }
          ]">
            <el-cascader ref="financialServiceAreaRef" v-model="form.financialServiceArea" :options="areaOptions"
              :props="{ expandTrigger: 'hover', emitPath: false }" placeholder="请选择金融服务发生地" clearable
              style="width: 100%" @change="handleAreaChange" @clear="resetAreaData" />
          </el-form-item>
        </el-col>
        <el-col :span="12"
          v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
          <el-form-item label="产品/服务" prop="disputedProductType" :rules="[
            {
              required: DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType),
              message: '产品/服务为必填项',
              trigger: 'change'
            }
          ]">
            <el-select v-model="form.disputedProductType" placeholder="请选择产品/服务" clearable style="width: 100%">
              <el-option v-for="dict in dict.type.dm_disputed_product_type" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="投诉内容" prop="complaintContent">
            <el-input v-model="form.complaintContent" type="textarea" placeholder="请输入内容" maxlength="5000"
              show-word-limit clearable :autosize="{ minRows: 3 }" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="主要诉求" prop="appeal">
            <el-input v-model="form.appeal" type="textarea" placeholder="请输入内容" maxlength="400" show-word-limit
              clearable :autosize="{ minRows: 3 }" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="调解员向当事人电话确认" prop="needCheck" label-width="180px">
            <el-select v-model="form.needCheck" placeholder="请选择调解员向当事人电话确认" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="涉及产品或服务名称" prop="product" label-width="150px"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务名称为必填项', trigger: 'blur' }]">
            <el-input v-model="form.product" placeholder="请输入涉及产品或服务名称" maxlength="40" show-word-limit clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="涉及产品或服务合同号" prop="contract" label-width="170px"
            :rules="[{ required: this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务合同号为必填项', trigger: 'blur' }]">
            <el-input v-model="form.contract" placeholder="请输入涉及产品或服务合同号" maxlength="40" show-word-limit clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="涉案金额（元）" prop="involveAmount"
            :rules="[{ required: this.DEPT_TYPE.bankList.includes(form.deptType) || this.DEPT_TYPE.nonBankList.includes(form.deptType), message: '涉案金额为必填项', trigger: 'blur' }]">
            <el-input v-model="form.involveAmount" placeholder="请输入涉案金额" maxlength="12" show-word-limit
              @input="validAmount(form.involveAmount, 'involveAmount')" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="诉请金额（元）" prop="appealAmount"
            :rules="[{ required: this.DEPT_TYPE.bankList.includes(form.deptType) || this.DEPT_TYPE.nonBankList.includes(form.deptType), message: '诉请金额为必填项', trigger: 'blur' }]">
            <el-input v-model="form.appealAmount" placeholder="请输入诉请金额" maxlength="12" show-word-limit
              @input="validAmount(form.appealAmount, 'appealAmount')" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--        <el-col :span="12">-->
        <!--          <el-form-item label="金融机构是否接受调解" prop="deptAcceptMediate" label-width="160px">-->
        <!--            <el-select v-model="form.deptAcceptMediate" clearable style="width: 100%" disabled>-->
        <!--              <el-option-->
        <!--                v-for="dict in dict.type.sys_yes_no"-->
        <!--                :key="dict.value"-->
        <!--                :label="dict.label"-->
        <!--                :value="dict.value"-->
        <!--              ></el-option>-->
        <!--            </el-select>-->
        <!--          </el-form-item>-->
        <!--        </el-col>-->
        <el-col :span="12">
          <el-form-item label="金融消费者是否接受调解" prop="consumerAcceptMediate" label-width="175px">
            <el-select v-model="form.consumerAcceptMediate" clearable style="width: 100%" disabled>
              <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="人民调解申请书" prop="applicationAttachment">
            <!--            <file-upload v-if="form.applicationAttachment" v-model="form.applicationAttachment" :isShowDele="false" :isShowBtn="false" :isShowTip="false" />-->
            <!--            <span v-else>无</span>-->
            <FileList :fileList="form.applicationAttachment" emptyText="无" />
          </el-form-item>
        </el-col>
      </el-row>
      <div class="min_title">受理信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="受理状态" prop="acceptStatus">
            <el-select v-model="form.acceptStatus" placeholder="请选择受理状态" style="width: 100%"
              @change="form.rejectReason = null" clearable>
              <el-option v-for="dict in dict.type.dm_accept_status" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="DM_ACCEPT_STATUS.reject === form.acceptStatus">
          <el-form-item label="不予受理原因" prop="rejectReason">
            <el-select v-model="form.rejectReason" placeholder="请选择不予受理原因" style="width: 100%" clearable>
              <el-option v-for="dict in dict.type.dm_reject_reason" :key="dict.value" :label="dict.label"
                :value="dict.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button style="float: left" type="danger" @click="reject" :loading="loading">退 回</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  handle, handleReject, saveOrUpdateDisputeMediationExpand, getDisputeMediationExpandInfo, getProvinceCityTree, getByDeptId
} from '@/api/project/disputeMediation';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { DEPT_TYPE, SYS_YES_NO, SYS_SEX, DM_ACCEPT_STATUS, DM_ENTRY_CHANNEL, CERT_TYPE, DM_IDENTITY_TYPE } from '@/views/constant/CommonConstant.js';
import FileList from '@/components/FileList/index.vue';

export default {
  components: { FileList, Treeselect },
  dicts: [
    'dept_type',
    'dm_status',
    'dm_sale_channel',
    'dm_bank_complaint_type',
    'dm_insurance_complaint_type',
    'dm_accept_status',
    'dm_reject_reason',
    'dm_self_reject_reason',
    'dm_business_type',
    'cert_type',
    'sys_yes_no',
    'sys_user_sex',
    'dm_handle_channel',
    'dm_enforce_agreement_type',
    'dm_entry_channel',
    'dm_insurance_type',
    'dm_consumer_identity_type',
    'dm_channel_type',
    'dm_identity_type',
    'dm_institution_type',
    'dm_disputed_product_type',
  ],
  props: ['title', 'deptOptions', 'deptMap'],
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      // 表单校验
      rules: {
        entryChannel: [{ required: true, message: '进件渠道为必填项', trigger: 'change' }],
        isSelf: [{ required: true, message: '是否消费者本人为必填项', trigger: 'change' }],
        institutionType: [{ required: true, message: '机构类型为必填项', trigger: 'change' }],
        // agentCertNum: [
        //   { validator: , trigger: "blur" },
        // ],
        agentPhone: [{ validator: this.phoneRule, trigger: 'blur' }],
        name: [{ required: true, message: '消费者姓名为必填项', trigger: 'blur' }],
        // phone: [
        //   { required: true, message: '消费者联系方式为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' }
        // ],
        certType: [{ required: true, message: '消费者证件类型为必填项', trigger: 'change' }],
        // certNum: [
        //   { required: true, message: "消费者证件号码为必填项", trigger: "blur" },
        //   { validator: , trigger: "blur" },
        // ],
        // sex: [{ required: true, message: '消费者性别为必填项', trigger: 'blur' }],
        // age: [{ required: true, message: '消费者年龄为必填项', trigger: 'blur' }],
        // isRepeatedly: [{ required: true, message: '是否屡投为必填项', trigger: 'change' }],
        // isBlackIndustry: [{ required: true, message: '是否涉及黑产为必填项', trigger: 'change' }],
        // isThirdPartyAgent: [{ required: true, message: '是否涉及第三方代理为必填项', trigger: 'change' }],
        // isHighRisk: [{ required: true, message: '是否高危客群为必填项', trigger: 'change' }],
        disputeDate: [{ required: true, message: '纠纷发生日期为必填项', trigger: 'blur' }],
        // deptContactCertNum: [
        //   { validator: , trigger: 'blur' }
        // ],
        deptContactPhone: [{ validator: this.phoneRule, trigger: 'blur' }],
        // businessType1: [
        //   { required: true, message: "业务类别为必填项", trigger: "change" },
        // ],
        complaintContent: [{ required: true, message: '投诉内容为必填项', trigger: 'blur' }],
        appeal: [{ required: true, message: '主要诉求为必填项', trigger: 'blur' }],
        acceptStatus: [{ required: true, message: '受理状态为必填项', trigger: 'change' }],
        needCheck: [{ required: true, message: '调解员向当事人电话确认为必填项', trigger: 'change' }],
        // involveAmount: [
        //   { required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: '涉案金额为必填项', trigger: 'blur' }
        // ],
        // appealAmount: [
        //   { required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: "诉请金额为必填项", trigger: "blur" },
        // ],
        deptAcceptMediate: [{ required: true, message: '金融机构是否接受调解为必填项', trigger: 'blur' }],
        enforceAgreementType: [{ required: true, message: '履约类型为必填项', trigger: 'blur' }],
        solutionAmount: [{ required: true, message: '调解方案金额为必填项', trigger: 'blur' }],
        solution: [{ required: true, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' }]
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      CERT_TYPE: CERT_TYPE,// 身份证类型
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
      ]
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
  created() {
    // console.log(this.$store.getters.userInfo);
  },
  computed: {
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
          if (val.charAt(16) % 2 == 0) {
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
        consumerIdentityType: null,
        email: null,
        remark: null,
        channelType: null,
        identityType: null,
        financialServiceArea: null,
        institutionType: null,
        provinceCode: null,
        provinceName: null,
        cityCode: null,
        cityName: null,
        disputedProductType: null,

      };
      this.resetForm('form');
    },
    async open(row) {
      this.reset();
      this.form = { ...row };
      this.loadProvinces();
      getDisputeMediationExpandInfo(row.workOrderId)
        .then(res => {
          if (res.data != null && res.data.markCaseType != null && res.data.markCaseType !== '') {
            this.$set(this.form, 'markCaseType', String(res.data.markCaseType));
          }
          if (res.data != null && res.data.email != null && res.data.email !== '') {
            this.$set(this.form, 'email', String(res.data.email));
          }
          if (res.data != null && res.data.consumerIdentityType != null && res.data.consumerIdentityType !== '') {
            this.$set(this.form, 'consumerIdentityType', String(res.data.consumerIdentityType));
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
          if (res.data != null && res.data.institutionType != null && res.data.institutionType !== '') {
            this.$set(this.form, 'institutionType', String(res.data.institutionType));
          }
          if (res.data != null && res.data.identityType != null && res.data.identityType !== '') {
            this.$set(this.form, 'identityType', String(res.data.identityType));
          }
          if (res.data != null && res.data.disputedProductType != null && res.data.disputedProductType !== '') {
            this.$set(this.form, 'disputedProductType', String(res.data.disputedProductType));
          }
          if (res.data != null && res.data.consumerIdentityType != null && res.data.consumerIdentityType !== '') {
            this.$set(this.form, 'consumerIdentityType', String(res.data.consumerIdentityType));
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

          if (res.data != null && res.data.mediationNumber != null && res.data.mediationNumber !== '') {
            this.$set(this.form, 'mediationNumber', String(res.data.mediationNumber));
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
      this.visible = true;
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true;
          const {
            email,
            consumerIdentityType,
            channelType,
            identityType,
            financialServiceArea,
            provinceCode,
            provinceName,
            cityCode,
            cityName,
            disputedProductType,
            remark,
            institutionType,
            mediationNumber,
            selfCollectionCaseType,
            controversyCause,
            ...restForm
          } = this.form;
          handle(restForm)
            .then(async response => {
              await saveOrUpdateDisputeMediationExpand({
                workOrderId: this.form.workOrderId,
                email,
                consumerIdentityType,
                channelType,
                identityType,
                provinceCode,
                provinceName,
                cityCode,
                cityName,
                remark,
                disputedProductType,
                institutionType,
                controversyCause,
                mediationNumber,
                selfCollectionCaseType,
              });
              this.loading = false;
              this.$modal.msgSuccess('前台处理成功');
              this.visible = false;
              this.$emit('callback');
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
    reject() {
      this.loading = true;
      handleReject(this.form)
        .then(response => {
          this.loading = false;
          this.$modal.msgSuccess('已退回');
          this.visible = false;
          this.$emit('callback');
        })
        .catch(() => {
          this.loading = false;
        });
    },
    cancel() {
      this.visible = false;
      this.reset();
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
    // 3. 处理级联选择器的 change 事件
    handleAreaChange(value) {
      this.form.financialServiceArea = value;
      const selectedNode = this.findAreaInfo(value);
      if (selectedNode) {
        this.form.provinceCode = selectedNode.provinceCode;
        this.form.provinceName = selectedNode.provinceName;
        this.form.cityCode = selectedNode.cityCode || '';
        this.form.cityName = selectedNode.cityName || '';
      }
      if (this.$refs && this.$refs.form) {
        this.$refs.form.clearValidate('financialServiceArea');
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
    // 5. 检查是否为争议案件
    isControversyCaseType(caseType) {
      if (!caseType) return false;
      return this.controversyCaseTypes.includes(caseType);
    }
  }
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
</style>
