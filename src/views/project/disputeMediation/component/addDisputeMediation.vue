<!-- 新增纠纷业务工单对话框 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :visible.sync="visible" width="85%" append-to-body :close-on-click-modal="false" :show-close="false"
    class="dispute-dialog" :close-on-press-escape="false">
    <el-row class="add-dispute" :gutter="3">
      <el-col class="dialog-left" :span="14">
        <div class="dialog-title">
          <span>添加纠纷业务工单</span>
          <i class="el-icon-close" @click="cancel" />
        </div>
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <div>
            <div class="min_title">工单信息</div>
            <el-row>
              <el-col :span="12">
                <el-form-item label="进件渠道" prop="entryChannel">
                  <el-cascader v-model="form.entryChannel" :options="dict.type.dm_entry_channel.options"
                    :props="{ expandTrigger: 'hover', emitPath: false }" placeholder="请选择进件渠道" clearable
                    style="width: 100%" @change="changEntryChannel" />
                  <!--              <el-select v-model="form.entryChannel" placeholder="请选择进件渠道" style="width: 100%" :disabled="$store.getters.userInfo.isDMInstitution" clearable>-->
                  <!--                <el-option-->
                  <!--                  v-for="dict in dict.type.dm_entry_channel"-->
                  <!--                  :key="dict.value"-->
                  <!--                  :label="dict.label"-->
                  <!--                  :value="dict.value"-->
                  <!--                ></el-option>-->
                  <!--              </el-select>-->
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel)">
                <el-form-item label="调解员" prop="mediatorUserId">
                  <el-select v-model="form.mediatorUserId" placeholder="请选择调解员" clearable style="width: 100%">
                    <el-option v-for="item in mediatorList" :key="item.mediatorUserId" :label="item.remark"
                      :value="item.mediatorUserId" :disabled="item.disabled"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="图片信息识别">
                  <el-upload
                    ref="ocrUpload"
                    action=""
                    accept="image/*"
                    :limit="5"
                    :http-request="handleOcrUpload"
                    :before-upload="beforeOcrUpload"
                    :on-exceed="handleOcrExceed"
                    :auto-upload="true"
                  >
                    <el-button size="mini" type="primary">上传图片</el-button>
                    <span slot="tip" class="el-upload__tip" style="margin-left: 12px">
                      支持常见图片格式，用于识别工单相关信息
                    </span>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div>
            <div class="min_title">委托人信息</div>
            <el-row>
              <el-col :span="12">
                <el-form-item label="是否消费者本人" prop="isSelf">
                  <el-radio-group v-model="form.isSelf">
                    <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label
                    }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="SYS_YES_NO.sys_no === form.isSelf">
                <el-form-item label="代理人姓名" prop="agentName">
                  <el-input v-model="form.agentName" placeholder="请输入代理人姓名" clearable maxlength="10" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
              <el-col :span="12">
                <el-form-item label="代理人证件类型" prop="agentCertType">
                  <el-select v-model="form.agentCertType" placeholder="请选择代理人证件类型" style="width: 100%" clearable>
                    <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代理人证件号码" prop="agentCertNum"
                  :rules="[{ required: this.form.agentCertType, message: '代理人证件号码为必填项', trigger: 'blur' }, { validator: this.validCertNum(this.form.agentCertType), trigger: 'blur' }]">
                  <el-input v-model="form.agentCertNum" placeholder="请输入代理人证件号码"
                    :maxlength="this.validCertNumLength(this.form.agentCertType)" show-word-limit clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
              <el-col :span="12">
                <el-form-item label="代理人联系方式" prop="agentPhone">
                  <el-input v-model="form.agentPhone" placeholder="请输入代理人联系方式" maxlength="11" show-word-limit clearable
                    oninput="value=value.replace(/[^\d]/g,'')" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代理人性别" prop="agentSex">
                  <el-select v-model="form.agentSex" placeholder="请选择代理人性别" clearable style="width: 100%">
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
                <el-form-item label="消费者姓名" prop="name">
                  <el-input v-model="form.name" placeholder="请输入消费者姓名" clearable maxlength="50" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系方式" prop="phone">
                  <el-input v-model="form.phone" placeholder="请输入联系方式" oninput="value=value.replace(/[^\d]/g,'')"
                    clearable maxlength="11" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="证件类型" prop="certType">
                  <el-select v-model="form.certType" placeholder="请选择证件类型" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="证件号码" prop="certNum" :rules="[
                  { required: true, message: '消费者证件号码为必填项', trigger: 'blur' },
                  { validator: this.validCertNum(this.form.certType), trigger: 'blur' },
                ]">
                  <el-input v-model="form.certNum" placeholder="请输入证件号码"
                    :maxlength="this.validCertNumLength(this.form.certType)" show-word-limit clearable
                    @input="cardNumChange" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="性别" prop="sex">
                  <el-select v-model="form.sex" placeholder="请选择性别" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年龄" prop="age">
                  <el-input v-model="form.age" maxlength="3" show-word-limit placeholder="请输入年龄" clearable
                    oninput="value=value.replace(/[^\d]/g,'')" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="民族" prop="nation">
                  <el-input v-model="form.nation" maxlength="26" show-word-limit clearable placeholder="请输入民族" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职业" prop="profession">
                  <el-input v-model="form.profession" maxlength="20" show-word-limit clearable placeholder="请输入职业" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="单位或住址" prop="address">
                  <el-input v-model="form.address" type="textarea" placeholder="请输入单位或住址" clearable maxlength="50"
                    show-word-limit :autosize="{ minRows: 1 }" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="是否屡投" prop="isRepeatedly">
                  <el-select v-model="form.isRepeatedly" placeholder="请选择是否屡投" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否涉及黑产" prop="isBlackIndustry">
                  <el-select v-model="form.isBlackIndustry" placeholder="请选择是否涉及黑产" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="是否涉及第三方代理" prop="isThirdPartyAgent" label-width="150px">
                  <el-select v-model="form.isThirdPartyAgent" placeholder="请选择是否涉及第三方代理" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否高危客群" prop="isHighRisk">
                  <el-select v-model="form.isHighRisk" placeholder="请选择是否高危客群" clearable style="width: 100%">
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
                    @input="deptChange" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构类型" prop="type">
                  <el-cascader v-model="form.deptType" :options="dict.type.dept_type.options"
                    :props="{ expandTrigger: 'hover', emitPath: false }" disabled style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="住所地" prop="deptAddress">
                  <el-input v-model="form.deptAddress" type="textarea" placeholder="请输入机构住所地" clearable maxlength="100"
                    show-word-limit :autosize="{ minRows: 1 }" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="纠纷发生日期" prop="disputeDate">
                  <el-date-picker clearable v-model="form.disputeDate" type="date" value-format="yyyy-MM-dd"
                    placeholder="请选择纠纷发生日期" style="width: 100%" :picker-options="{
                      disabledDate(time) {
                        // 禁用所有小于当前日期的日期
                        return time.getTime() > Date.now();
                      },
                    }">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机构所在地区" prop="deptArea">
                  <el-input v-model="form.deptArea" placeholder="请输入机构所在地区" clearable maxlength="40" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="业务经办人员" prop="deptHandlerName"
                  :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务经办人员为必填项', trigger: 'blur' }]">
                  <el-input v-model="form.deptHandlerName" placeholder="请输入业务经办人员" clearable maxlength="10"
                    show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="经办人员联系电话" prop="deptHandlerPhone" label-width="140px" :rules="[
                  { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人员联系电话为必填项', trigger: 'blur' },
                  { validator: this.phoneRule, trigger: 'blur' }
                ]">
                  <el-input v-model="form.deptHandlerPhone" placeholder="请输入经办人员联系电话" clearable maxlength="11"
                    show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="经办人身份证号" prop="deptHandlerCertNum" :rules="[
                  { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人身份证号为必填项', trigger: 'blur' },
                  { validator: this.validCertNum(this.CERT_TYPE.CERT_TYPE0), trigger: 'blur' }
                ]">
                  <el-input v-model="form.deptHandlerCertNum" placeholder="请输入经办人身份证号" clearable maxlength="18"
                    show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="被投诉主体层级" prop="level">
                  <el-input v-model="form.level" placeholder="请输入被投诉主体层级" clearable maxlength="10" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="业务类别" prop="businessType1">
                  <el-cascader v-model="form.businessType1" :options="dict.type.dm_business_type.options2"
                    :props="{ emitPath: false, checkStrictly: false }" placeholder="请选择业务类别" clearable
                    style="width: 100%" ref="businessType1Ref" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="级别二" prop="businessType2">
                  <el-input v-model="form.businessType2" placeholder="请输入级别二" clearable maxlength="20"
                    show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="级别三" prop="businessType3">
                  <el-input v-model="form.businessType3" placeholder="请输入级别三" clearable maxlength="20"
                    show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="业务办理渠道" prop="handleChannel"
                  :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务办理渠道为必填项', trigger: 'change' }]">
                  <el-select v-model="form.handleChannel" placeholder="请选择业务办理渠道" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_handle_channel" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="投诉分类" prop="bankComplaintType"
                  :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '投诉分类为必填项', trigger: 'change' }]">
                  <el-select v-model="form.bankComplaintType" placeholder="请选择投诉分类" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_bank_complaint_type" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="险种类别" prop="insuranceType1"
                  :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '险种类别为必填项', trigger: 'change' }]">
                  <el-cascader v-model="form.insuranceType1" :options="dict.type.dm_insurance_type.options2"
                    :props="{ emitPath: false, checkStrictly: false }" placeholder="请选择业务类别" clearable
                    style="width: 100%" ref="insuranceType1Ref" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="险种类别2" prop="insuranceType2">
                  <el-input v-model="form.insuranceType2" placeholder="请输入险种类别2" clearable maxlength="40"
                    show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
              <el-col :span="12">
                <el-form-item label="产品销售渠道" prop="saleChannel">
                  <el-select v-model="form.saleChannel" placeholder="请选择产品销售渠道" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_sale_channel" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="保险消费投诉事由分类" prop="insuranceComplaintType" label-width="165px" :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '必填项', trigger: 'change' }]">
                  <el-select v-model="form.insuranceComplaintType" placeholder="请选择保险消费投诉事由分类" clearable
                    style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_insurance_complaint_type" :key="dict.value"
                      :label="dict.label" :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="投诉内容" prop="complaintContent">
                  <el-input v-model="form.complaintContent" type="textarea" placeholder="请输入内容" clearable
                    maxlength="5000" show-word-limit :autosize="{ minRows: 3 }" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="主要诉求" prop="appeal">
                  <el-input v-model="form.appeal" type="textarea" placeholder="请输入内容" clearable maxlength="400"
                    show-word-limit :autosize="{ minRows: 3 }" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="$store.getters.userInfo.isDMEntryClerk || $store.getters.userInfo.isDMMediator">
              <el-col :span="12">
                <el-form-item label="调解员向当事人电话确认" prop="needCheck" label-width="180px">
                  <el-select v-model="form.needCheck" placeholder="请选择调解员向当事人电话确认" clearable style="width: 100%">
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
              <el-form-item label="委派/委托代表姓名" prop="deptContact" label-width="140px"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '委派/委托代表姓名为必填项', trigger: 'blur' }]">
                <el-input v-model="form.deptContact" placeholder="请输入机构代表姓名" clearable maxlength="10" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="deptContactSex"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '性别为必填项', trigger: 'change' }]">
                <el-select v-model="form.deptContactSex" placeholder="请选择性别" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                    :value="dict.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="所在部门及职务" prop="deptContactPosition"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '所在部门及职务为必填项', trigger: 'blur' }]">
                <el-input v-model="form.deptContactPosition" type="textarea" placeholder="请输入机构代表所在部门及职务" clearable
                  maxlength="30" show-word-limit :autosize="{ minRows: 1 }" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="证件类型" prop="deptContactCertType" label-width="130px"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件类型为必填项', trigger: 'change' }]">
                <el-select v-model="form.deptContactCertType" placeholder="请选择证件类型" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                    :value="dict.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="证件号码" prop="deptContactCertNum" label-width="130px" :rules="[
                { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '机构代表证件号码为必填项', trigger: 'blur' },
                { validator: this.validCertNum(this.form.deptContactCertType), trigger: 'blur' }
              ]">
                <el-input v-model="form.deptContactCertNum" placeholder="请输入机构代表证件号码" clearable
                  :maxlength="this.validCertNumLength(this.form.deptContactCertType)" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系方式" prop="deptContactPhone" label-width="130px" :rules="[
                { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '联系方式为必填项', trigger: 'blur' },
                { validator: this.phoneRule, trigger: 'blur' }
              ]">
                <el-input v-model="form.deptContactPhone" placeholder="请输入机构代表联系方式" maxlength="11" show-word-limit
                  clearable oninput="value=value.replace(/[^\d]/g,'')" />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="min_title">调解信息</div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="涉及产品或服务名称" prop="product" label-width="150px"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务名称为必填项', trigger: 'blur' }]">
                <el-input v-model="form.product" placeholder="请输入涉及产品或服务名称" clearable maxlength="40" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="涉及产品或服务合同号" prop="contract" label-width="170px"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务合同号为必填项', trigger: 'blur' }]">
                <el-input v-model="form.contract" placeholder="请输入涉及产品或服务合同号" clearable maxlength="40"
                  show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="涉案金额（元）" prop="involveAmount"
                :rules='[{ required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: "涉案金额为必填项", trigger: "blur" }]'>
                <el-input v-model="form.involveAmount" placeholder="请输入涉案金额" maxlength="12" show-word-limit
                  @input="validAmount(form.involveAmount, 'involveAmount')" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="诉请金额（元）" prop="appealAmount"
                :rules='[{ required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: "诉请金额为必填项", trigger: "blur" }]'>
                <el-input v-model="form.appealAmount" placeholder="请输入诉请金额" maxlength="12" show-word-limit
                  @input="validAmount(form.appealAmount, 'appealAmount')" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="$store.getters.userInfo.isDMInstitution">
            <!--        <el-col :span="12">-->
            <!--          <el-form-item-->
            <!--            label="金融机构是否接受调解"-->
            <!--            prop="deptAcceptMediate"-->
            <!--            label-width="135px"-->
            <!--          >-->
            <!--            <el-select-->
            <!--              v-model="form.deptAcceptMediate"-->
            <!--              placeholder="请选择金融机构是否接受调解"-->
            <!--              clearable-->
            <!--              style="width: 100%"-->
            <!--            >-->
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
              <el-form-item label="金融消费者是否接受调解" prop="consumerAcceptMediate" label-width="180px"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution, message: '金融消费者是否接受调解为必填项', trigger: 'change' }]">
                <el-select v-model="form.consumerAcceptMediate" placeholder="请选择金融消费者是否接受调解" clearable
                  style="width: 100%">
                  <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                    :value="dict.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="调解方案金额" prop="solutionAmount"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '调解方案金额为必填项', trigger: 'blur' }]">
                <el-input v-model="form.solutionAmount" placeholder="请输入调解方案金额" maxlength="10" show-word-limit clearable
                  @input="validAmount(form.solutionAmount, 'solutionAmount')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row
            v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && $store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="履约类型" prop="enforceAgreementType"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '履约类型为必填项', trigger: 'change' }]">
                <el-select v-model="form.enforceAgreementType" placeholder="请选择履约类型" clearable style="width: 100%">
                  <el-option v-for="dict in dict.type.dm_enforce_agreement_type" :key="dict.value" :label="dict.label"
                    :value="dict.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="自查情况、调解方案及依据" prop="solution" class="endItem"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' }]">
                <el-input v-model="form.solution" type="textarea" placeholder="请输入自查情况、调解方案及依据" clearable
                  maxlength="2000" show-word-limit :autosize="{ minRows: 3 }" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="投保人" prop="policyholder">
                <el-input v-model="form.policyholder" placeholder="请输入投保人" clearable maxlength="10" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="被保险人" prop="insured">
                <el-input v-model="form.insured" placeholder="请输入被保险人" clearable maxlength="10" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="寿险现金价值/产险权益价值" prop="cashValue" label-width="185px">
                <el-input v-model="form.cashValue" placeholder="请输入寿险现金价值/产险权益价值" maxlength="10" show-word-limit
                  clearable @input="validAmount(form.cashValue, 'cashValue')" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="定损金额" prop="lossAssessmentAmount">
                <el-input v-model="form.lossAssessmentAmount" placeholder="请输入定损金额" maxlength="10" show-word-limit
                  clearable @input="validAmount(form.lossAssessmentAmount, 'lossAssessmentAmount')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="理赔金额" prop="claimAmount">
                <el-input v-model="form.claimAmount" placeholder="请输入理赔金额" maxlength="10" show-word-limit clearable
                  @input="validAmount(form.claimAmount, 'claimAmount')" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="业务所属支公司" prop="businessCompany" :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '必填项', trigger: 'change' }]">
                <el-input v-model="form.businessCompany" placeholder="请输入业务所属支公司" clearable maxlength="100"
                  show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="销售人员（网点、理赔人员）" prop="salesman" label-width="200px" :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '必填项', trigger: 'change' }]">
                <el-input v-model="form.salesman" placeholder="请输入销售人员" clearable maxlength="10" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
            <el-col :span="12">
              <el-form-item label="销售、网点、理赔工号" prop="salesmanJobNum" label-width="160px" :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '必填项', trigger: 'change' }]">
                <el-input v-model="form.salesmanJobNum" placeholder="请输入销售、网点、理赔工号" clearable maxlength="20"
                  show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="销售人员、理赔人员证件号码" prop="salesmanCertNum" label-width="200px" :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '必填项', trigger: 'change' }]">
                <el-input v-model="form.salesmanCertNum" placeholder="请输入销售人员、理赔人员证件号码" clearable maxlength="18"
                  show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="$store.getters.userInfo.isDMInstitution">
            <el-col :span="24">
              <el-form-item label="人民调解申请书" prop="applicationAttachment"
                :rules="[{ required: this.$store.getters.userInfo.isDMInstitution && SYS_YES_NO.sys_yes === this.form.consumerAcceptMediate, message: '请上传《人民调解申请书》或其他金融消费者同意调解作证材料', trigger: 'change' }]">
                <file-upload v-model="form.applicationAttachment"
                  :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg', 'cd', 'wave', 'aiff', 'mp3', 'wav',]"
                  :limit="3" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="已盖章反馈单" prop="stampedFeedbackAttachment">
                <file-upload v-model="form.stampedFeedbackAttachment"
                  :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg', 'cd', 'wave', 'aiff', 'mp3', 'wav',]"
                  :limit="1" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="$store.getters.userInfo.isDMInstitution || $store.getters.userInfo.isDMEntryClerk">
            <el-col :span="24">
              <el-form-item label="当事人资料" prop="consumerAttachment" v-if="!$store.getters.userInfo.isDMInstitution">
                <file-upload v-model="form.consumerAttachment" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav', 'm4a',]" :limit="5"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="附件" prop="attachment">
                <file-upload v-model="form.attachment" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg', 'cd', 'wave', 'aiff', 'mp3', 'wav', 'm4a',]" :limit="5" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="身份证复印件、工作证复印件" prop="photocopyAttachment">
                <file-upload v-model="form.photocopyAttachment"
                  :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg', 'cd', 'wave', 'aiff', 'mp3', 'wav',]"
                  :limit="3" />
              </el-form-item>
            </el-col>
          </el-row>
          <div v-if="$store.getters.userInfo.isDMEntryClerk || $store.getters.userInfo.isDMMediator">
            <div class="min_title">受理信息</div>
            <el-row>
              <el-col :span="12">
                <el-form-item label="受理状态" prop="acceptStatus">
                  <el-select v-model="form.acceptStatus" placeholder="请选择受理状态" style="width: 100%" clearable
                    @change="form.rejectReason = null">
                    <el-option v-for="dict in dict.type.dm_accept_status" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="DM_ACCEPT_STATUS.reject === form.acceptStatus">
                <el-form-item label="不予受理原因" prop="rejectReason">
                  <el-select v-model="form.rejectReason" placeholder="请选择不予受理原因" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_reject_reason" :key="dict.value" :label="dict.label"
                      :value="dict.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-col>
      <el-col class="dialog-right" :span="10">
        <div class="right-t">
          <el-form ref="diaputeForm" :model="diaputeForm" label-width="120px" hide-required-asterisk>
            <div>
              <div class="region-title">*消费者信息</div>
              <el-row class="line-row">
                <el-col :span="24">
                  <el-form-item label="是否消费者本人" prop="isSelf" label-width="200px">
                    <el-radio-group v-model="diaputeForm.isSelf">
                      <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label
                      }}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="12">
                  <el-form-item label="消费者姓名" prop="name">
                    <el-input v-model="diaputeForm.name" placeholder="请输入消费者姓名" maxlength="50" show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系方式" prop="phone">
                    <el-input v-model="diaputeForm.phone" placeholder="请输入联系方式" type="tel" maxlength="11"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="12">
                  <el-form-item label="证件类型" prop="certType">
                    <el-select v-model="diaputeForm.certType" placeholder="请选择证件类型" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                        :value="dict.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="证件号码" prop="certNum">
                    <el-input v-model="diaputeForm.certNum" placeholder="请输入证件号码"
                      :maxlength="this.validCertNumLength(this.form.certType)" show-word-limit clearable
                      @input="cardNumChange" />
                  </el-form-item>
                </el-col>
              </el-row>
              <!-- <el-row class="line-row">
                <el-col :span="12">
                  <el-form-item label="性别" prop="sex">
                    <el-select v-model="diaputeForm.sex" placeholder="请选择性别" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                        :value="dict.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="年龄" prop="age">
                    <el-input v-model="diaputeForm.age" maxlength="3" show-word-limit placeholder="请输入年龄" clearable
                      oninput="value=value.replace(/[^\d]/g,'')" />
                  </el-form-item>
                </el-col>
              </el-row> -->
              <el-row class="line-row">
                <el-col :span="12">
                  <el-form-item label="民族" prop="nation">
                    <el-input v-model="diaputeForm.nation" maxlength="26" show-word-limit clearable
                      placeholder="请输入民族" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="职业" prop="profession">
                    <el-input v-model="diaputeForm.profession" maxlength="20" show-word-limit clearable
                      placeholder="请输入职业" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="24">
                  <el-form-item label="单位或住址" prop="address">
                    <el-input v-model="diaputeForm.address" type="textarea" placeholder="请输入单位或住址" clearable
                      maxlength="50" show-word-limit :autosize="{ minRows: 1 }" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <div>
              <div class="region-title">*机构信息</div>
              <el-row class="line-row">
                <el-col :span="24">
                  <el-form-item label="住所地" prop="deptAddress">
                    <el-input v-model="diaputeForm.deptAddress" type="textarea" placeholder="请输入机构住所地" clearable
                      maxlength="100" show-word-limit :autosize="{ minRows: 1 }" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="12">
                  <el-form-item label="纠纷发生日期" prop="disputeDate">
                    <el-date-picker clearable v-model="diaputeForm.disputeDate" type="date" value-format="yyyy-MM-dd"
                      placeholder="请选择纠纷发生日期" style="width: 100%" :picker-options="{
                        disabledDate(time) {
                          // 禁用所有小于当前日期的日期
                          return time.getTime() > Date.now();
                        },
                      }">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="机构所在地区" prop="deptArea">
                    <el-input v-model="diaputeForm.deptArea" placeholder="请输入机构所在地区" clearable maxlength="40"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="24">
                  <el-form-item label="投诉内容" prop="complaintContent">
                    <el-input v-model="diaputeForm.complaintContent" type="textarea" placeholder="请输入内容" clearable
                      maxlength="5000" show-word-limit :autosize="{ minRows: 3 }" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="24">
                  <el-form-item label="主诉内容" prop="appeal">
                    <el-input v-model="diaputeForm.appeal" type="textarea" placeholder="请输入内容" clearable maxlength="400"
                      show-word-limit :autosize="{ minRows: 3 }" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            <div>
              <div class="region-title">*调解信息</div>
              <el-row class="line-row">
                <el-col :span="20">
                  <el-form-item label="涉及产品或服务名称" prop="product" label-width="150px">
                    <el-input v-model="diaputeForm.product" placeholder="请输入涉及产品或服务名称" clearable maxlength="40"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="20">
                  <el-form-item label="涉及产品或服务合同号" prop="contract" label-width="170px">
                    <el-input v-model="diaputeForm.contract" placeholder="请输入涉及产品或服务合同号" clearable maxlength="40"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row class="line-row">
                <el-col :span="12">
                  <el-form-item label="涉案金额（元）" prop="involveAmount">
                    <el-input v-model="diaputeForm.involveAmount" placeholder="请输入涉案金额"
                      oninput="value=value.replace(/[^\d]/g,'')" clearable maxlength="12" show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="诉请金额（元）" prop="appealAmount">
                    <el-input v-model="diaputeForm.appealAmount" placeholder="请输入诉请金额"
                      oninput="value=value.replace(/[^\d]/g,'')" clearable maxlength="12" show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
          <div class="confirm-btn">
            <el-button @click="handelCoverForm">确认信息，自动覆盖</el-button>
          </div>
        </div>
        <div class="right-b">
          <div v-for="(item, index) in sseList" :key="index" class="socket-item">
            <div class="socket-l" v-if="item.role === '调解员'">
              <div class="person-info">
                <p class="name">调解员</p>
                <img class="avatar" src="@/assets/images/form-avatar.png" alt="">
              </div>
              <div class="person-message">
                <span>{{ item.message }}</span>
              </div>
            </div>
            <div class="socket-r" v-if="item.role === '投诉人'">
              <div class="person-message">
                <span>{{ item.message }}</span>
              </div>
              <div class="person-info">
                <p class="name">客户</p>
                <img class="avatar" src="@/assets/images/form-avatar.png" />
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { addDisputeMediation, mediatorList, SSEGetFromData } from "@/api/project/disputeMediation";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  DEPT_TYPE,
  SYS_YES_NO,
  SYS_SEX,
  DM_ACCEPT_STATUS,
  DM_ENTRY_CHANNEL,
  CERT_TYPE,
} from "@/views/constant/CommonConstant.js";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import conf from '@/conf';
import { getToken } from '@/utils/auth';

/** 与左侧表单 el-input 的 maxlength 一致，OCR 映射时超长则截取 */
const OCR_FIELD_MAXLENGTH = {
  agentName: 10,
  agentPhone: 11,
  name: 50,
  phone: 11,
  age: 3,
  nation: 26,
  profession: 20,
  address: 50,
  deptAddress: 100,
  deptArea: 40,
  deptHandlerName: 10,
  deptHandlerPhone: 11,
  level: 10,
  businessType2: 20,
  businessType3: 20,
  insuranceType2: 40,
  complaintContent: 5000,
  appeal: 400,
  deptContact: 10,
  deptContactPosition: 30,
  deptContactPhone: 11,
  product: 40,
  contract: 40,
  involveAmount: 12,
  appealAmount: 12,
  solutionAmount: 10,
  solution: 2000,
  policyholder: 10,
  insured: 10,
  cashValue: 10,
  lossAssessmentAmount: 10,
  claimAmount: 10,
  businessCompany: 100,
  salesman: 10,
  salesmanJobNum: 20,
};

export default {
  components: { Treeselect },
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
  props: ["deptOptions", "deptMap"],
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      mediatorList: [],
      // 表单校验
      rules: {
        entryChannel: [
          { required: true, message: '进件渠道为必填项', trigger: 'change' },
        ],
        mediatorUserId: [
          { required: true, message: '调解员为必填项', trigger: 'change' },
        ],
        isSelf: [
          { required: true, message: '是否消费者本人为必填项', trigger: 'change' },
        ],
        // agentCertNum: [
        //   { required: this.form.agentCertType, message: '代理人证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' },
        // ],
        agentPhone: [
          { validator: this.phoneRule, trigger: 'blur' },
        ],
        name: [
          { required: true, message: '消费者姓名为必填项', trigger: 'blur' },
        ],
        phone: [
          { required: true, message: '消费者联系方式为必填项', trigger: 'blur' },
          { validator: this.phoneRule, trigger: 'blur' },
        ],
        certType: [
          { required: true, message: '消费者证件类型为必填项', trigger: 'change' },
        ],
        // certNum: [
        //   { required: true, message: '消费者证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' },
        // ],
        sex: [
          { required: true, message: '消费者性别为必填项', trigger: 'change' },
        ],
        age: [
          { required: true, message: '消费者年龄为必填项', trigger: 'blur' },
        ],
        isRepeatedly: [
          { required: false, message: '是否屡投为必填项', trigger: 'change' }
        ],
        isBlackIndustry: [
          { required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '是否涉及黑产为必填项', trigger: 'change' }
        ],
        isThirdPartyAgent: [
          { required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '是否涉及第三方代理为必填项', trigger: 'change' }
        ],
        isHighRisk: [
          { required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '是否高危客群为必填项', trigger: 'change' }
        ],
        deptId: [
          { required: true, message: '机构名称为必填项', trigger: 'blur' },
        ],
        disputeDate: [
          { required: true, message: '纠纷发生日期为必填项', trigger: 'blur' },
        ],
        complaintContent: [
          { required: true, message: '投诉内容为必填项', trigger: 'blur' },
        ],
        appeal: [
          { required: true, message: '主要诉求为必填项', trigger: 'blur' },
        ],
        needCheck: [
          { required: true, message: '调解员向当事人电话确认为必填项', trigger: 'change', },
        ],
        // deptHandlerName: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务经办人员为必填项', trigger: 'blur' }
        // ],
        // deptHandlerPhone: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人员联系电话为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' }
        // ],
        // deptHandlerCertNum: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '经办人身份证号为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' }
        // ],
        businessType1: [
          { required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '业务类别为必填项', trigger: 'change' }
        ],
        // handleChannel: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '业务办理渠道为必填项', trigger: 'change' }
        // ],
        // bankComplaintType: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '投诉分类为必填项', trigger: 'change' }
        // ],
        // deptContact: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '委派/委托代表姓名为必填项', trigger: 'blur' }
        // ],
        // deptContactSex: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '性别为必填项', trigger: 'change' }
        // ],
        // deptContactPosition: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '所在部门及职务为必填项', trigger: 'blur' }
        // ],
        // deptContactCertType: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '证件类型为必填项', trigger: 'change' }
        // ],
        // deptContactCertNum: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '机构代表证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' }
        // ],
        // deptContactPhone: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '联系方式为必填项', trigger: 'blur' },
        //   { validator: this.phoneRule, trigger: 'blur' }
        // ],
        // product: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务名称为必填项', trigger: 'blur' }
        // ],
        // contract: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '涉及产品或服务合同号为必填项', trigger: 'blur' }
        // ],
        // involveAmount: [
        //   { required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: '涉案金额为必填项', trigger: 'blur' },
        // ],
        // appealAmount: [
        //   { required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType), message: '诉请金额为必填项', trigger: 'blur' },
        // ],
        deptAcceptMediate: [
          { required: true, message: '金融机构是否接受调解为必填项', trigger: 'change', },
        ],
        // enforceAgreementType: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '履约类型为必填项', trigger: 'change' },
        // ],
        // solutionAmount: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '调解方案金额为必填项', trigger: 'blur' },
        // ],
        // solution: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' },
        // ],
        acceptStatus: [
          { required: true, message: '受理状态为必填项', trigger: 'change' },
        ],
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      CERT_TYPE: CERT_TYPE, // 身份证类型,
      // extn: this.$callWs.state.formData.ola_extn,
      extn: this.$store.getters.userInfo.seatNum ? this.$store.getters.userInfo.seatNum.toString().slice(5, 8) : '',
      diaputeForm: {},
      eventSource: null,
      sseTimeout: null,
      getDataInterval: null,
      sseList: [],
      run: false,
      stopStreams: false,
      formId: null,
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
      this.entryChannelDisable(this.dict.type.dm_entry_channel.options);
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
    "visible"(nVal) {
      if (nVal) {
        this.$nextTick(() => {
          this.calculateRightBHeight();
          this.sseList = [];
          this.formId = uuidv4();
          clearTimeout(this.sseTimeout)
          clearInterval(this.getDataInterval);
          this.getDataInterval = null
          this.run = false
          this.initSSE();
        });
      } else {
        if (this.eventSource) {
          clearTimeout(this.sseTimeout)
          clearInterval(this.getDataInterval);
          if (this.eventSource) {
            this.eventSource.close();
          }
          this.getDataInterval = null
          this.diaputeForm = {}
          this.run = false
          console.log('SSE 连接已关闭');
        }
      }
    }
  },
  created() {
  },
  methods: {
    // 选择器禁用今天之后的日期或时间
    disabledDate(time) {
      return time.getTime() < Date.now();
    },
    // 根据身份证号自动填充年龄性别
    cardNumChange(val) {
      if (this.form.certType === CERT_TYPE.CERT_TYPE0) {
        let hasError = false;
        this.$refs["form"].validateField(["certNum"], (err) => {
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
          if (
            currentDate.getMonth() < birthMonth ||
            (currentDate.getMonth() === birthMonth &&
              currentDate.getDate() < birthDay)
          ) {
            age -= 1;
          }
          this.form.age = age;
        }
      }
    },
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
    beforeOcrUpload(file) {
      const isImg = file.type && file.type.startsWith("image/");
      if (!isImg) {
        this.$modal.msgError("请上传图片文件");
        return false;
      }
      const maxMb = 10;
      if (file.size / 1024 / 1024 >= maxMb) {
        this.$modal.msgError(`图片大小不能超过 ${maxMb} MB`);
        return false;
      }
      return true;
    },
    handleOcrExceed() {
      this.$modal.msgError("上传图片数量不能超过 5 张");
    },
    handleOcrUpload(option) {
      const { file, onSuccess, onError } = option;
      this.$modal.loading("正在上传并识别图片，请稍候...");
      const fd = new FormData();
      fd.append("file", file);
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      const token = getToken();
      if (token) {
        headers.Authorization = "Bearer " + token;
      }
      const url = conf.server.ocrUploadUrl;
      axios
        .post(url, fd, {
          headers,
          timeout: 120000,
        })
        .then((res) => {
          const body = res.data;
          const code = body && typeof body.code !== "undefined" ? body.code : null;
          if (res.status < 200 || res.status >= 300) {
            const msg =
              (body && body.msg) || `上传失败 (${res.status})`;
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            onError(new Error(msg));
            return;
          }
          if (body.status != null && body.status !== "success") {
            const msg = (body && body.msg) || "识别失败";
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            onError(new Error(msg));
            return;
          }
          if (code !== null && code !== 200) {
            const msg = (body && body.msg) || "识别失败";
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            onError(new Error(msg));
            return;
          }
          const mapped = this.applyOcrDataToForm(body);
          this.$modal.closeLoading();
          if (mapped < 0) {
            const msg =
              (body && body.msg) ||
              "识别结果中缺少 data 表单字段对象（需与接口约定字段名一致）";
            this.$modal.msgError(msg);
            onError(new Error(msg));
            return;
          }
          onSuccess(body, file);
          this.$modal.msgSuccess(
            mapped > 0
              ? "图片识别完成，已根据识别结果填入左侧表单"
              : "图片识别完成，未识别到可自动填入的文本项（或均为「无」）"
          );
        })
        .catch((err) => {
          this.$modal.closeLoading();
          const msg =
            (err.response && err.response.data && err.response.data.msg) ||
            err.message ||
            "上传失败";
          this.$modal.msgError(msg);
          onError(err);
        });
    },
    /** OCR 返回中表示“无识别值”、不参与表单映射 */
    isOcrFieldNoneValue(raw) {
      if (raw === undefined || raw === null) {
        return true;
      }
      if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) {
          return true;
        }
        if (t === "无") {
          return true;
        }
        if (t === '["无"]' || t === "['无']") {
          return true;
        }
      }
      if (Array.isArray(raw)) {
        return raw.length === 1 && String(raw[0]).trim() === "无";
      }
      return false;
    },
    /** @returns {string|null} null 表示跳过该字段映射 */
    normalizeOcrNumberInputValue(key, strVal) {
      const s = String(strVal).trim();
      if (!/\d/.test(s)) {
        return null;
      }
      const noCjk = s.replace(/[\u4e00-\u9fff]/g, "");
      if (key === "age") {
        const digits = noCjk.replace(/[^\d]/g, "");
        if (!digits) {
          return null;
        }
        const n = parseInt(digits, 10);
        return Number.isFinite(n) ? String(n) : null;
      }
      let t = noCjk.replace(/[^\d.]/g, "");
      if (!t) {
        return null;
      }
      const dot = t.indexOf(".");
      if (dot === -1) {
        const n = parseInt(t, 10);
        return Number.isFinite(n) ? String(n) : null;
      }
      const intRaw = t.slice(0, dot).replace(/\./g, "");
      const intNum = parseInt(intRaw, 10);
      if (!Number.isFinite(intNum)) {
        return null;
      }
      const intStr = String(intNum);
      const fracRaw = t.slice(dot + 1).replace(/\./g, "");
      const frac = fracRaw.slice(0, 2);
      if (!frac) {
        return intStr;
      }
      return `${intStr}.${frac}`;
    },
    /** 联系方式类：无阿拉伯数字不映射；去掉汉字后仅保留数字（与「元」类字段规则一致） */
    normalizeOcrPhoneInputValue(strVal) {
      const s = String(strVal).trim();
      if (!/\d/.test(s)) {
        return null;
      }
      const noCjk = s.replace(/[\u4e00-\u9fff]/g, "");
      const digits = noCjk.replace(/[^\d]/g, "");
      return digits.length ? digits : null;
    },
    /** 将 OCR 返回的 data 映射到左侧表单；返回值：成功写入的字段数，-1 表示 data 不可用 */
    applyOcrDataToForm(body) {
      if (!body || typeof body !== "object") {
        return -1;
      }
      const data = body.data;
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return -1;
      }
      if (Object.keys(data).length === 0) {
        return -1;
      }
      const numericInputKeys = new Set([
        "age",
        "involveAmount",
        "appealAmount",
        "solutionAmount",
        "cashValue",
        "lossAssessmentAmount",
        "claimAmount",
      ]);
      const contactPhoneKeys = new Set([
        "phone",
        "agentPhone",
        "deptHandlerPhone",
        "deptContactPhone",
      ]);
      const skipKeys = new Set([
        "certNum",
        "agentCertNum",
        "deptContactCertNum",
        "deptHandlerCertNum",
        "salesmanCertNum",
      ]);
      const textFieldKeys = new Set([
        "agentName",
        "agentPhone",
        "name",
        "phone",
        "age",
        "nation",
        "profession",
        "address",
        "deptAddress",
        "deptArea",
        "deptHandlerName",
        "deptHandlerPhone",
        "level",
        "businessType2",
        "businessType3",
        "insuranceType2",
        "complaintContent",
        "appeal",
        "deptContact",
        "deptContactPosition",
        "deptContactPhone",
        "product",
        "contract",
        "involveAmount",
        "appealAmount",
        "solutionAmount",
        "solution",
        "policyholder",
        "insured",
        "cashValue",
        "lossAssessmentAmount",
        "claimAmount",
        "businessCompany",
        "salesman",
        "salesmanJobNum",
      ]);
      let count = 0;
      Object.keys(data).forEach((key) => {
        if (!textFieldKeys.has(key) || skipKeys.has(key)) {
          return;
        }
        const raw = data[key];
        if (this.isOcrFieldNoneValue(raw)) {
          return;
        }
        let strVal;
        if (typeof raw === "string") {
          strVal = raw;
        } else if (typeof raw === "number" && Number.isFinite(raw)) {
          strVal = String(raw);
        } else {
          return;
        }
        if (numericInputKeys.has(key)) {
          const normalized = this.normalizeOcrNumberInputValue(key, strVal);
          if (normalized == null || normalized === "") {
            return;
          }
          strVal = normalized;
        } else if (contactPhoneKeys.has(key)) {
          const normalized = this.normalizeOcrPhoneInputValue(strVal);
          if (normalized == null || normalized === "") {
            return;
          }
          strVal = normalized;
        }
        const cap = OCR_FIELD_MAXLENGTH[key];
        if (typeof cap === "number" && cap > 0 && strVal.length > cap) {
          strVal = strVal.slice(0, cap);
        }
        this.$set(this.form, key, strVal);
        count += 1;
      });
      return count;
    },
    // 表单重置
    reset() {
      this.form = {
        workOrderId: null,
        manageDeptId: null,
        isSelf: "Y",
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
        disputeDate: new Date,
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
        needCheck: !this.$store.getters.userInfo.isDMInstitution ? this.SYS_YES_NO.sys_yes : null,
        product: null,
        contract: null,
        involveAmount: null,
        appealAmount: null,
        deptAcceptMediate: this.$store.getters.userInfo.isDMInstitution ? this.SYS_YES_NO.sys_yes : null,
        consumerAcceptMediate: null,
        acceptStatus: !this.$store.getters.userInfo.isDMInstitution ? this.DM_ACCEPT_STATUS.accept : null,
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
        consumerAttachment: null,
        photocopyAttachment: null,
        applicationAttachment: null,
        mediatorUserId: null,
        assistantUserId: null,
        status: null,
        createId: null,
        createTime: null,
        updateId: null,
        updateTime: null,
      };
      this.resetForm("form");
      this.$nextTick(() => {
        if (this.$refs.ocrUpload) {
          this.$refs.ocrUpload.clearFiles();
        }
      });
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
    open() {
      this.reset();
      if (this.$store.getters.userInfo.isDMInstitution) {
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
      if (this.$store.getters.userInfo.isDMCourtBankEntryClerk || this.$store.getters.userInfo.isDMCourtNonBankEntryClerk || this.$store.getters.userInfo.isDMCourtInsuranceEntryClerk) {
        mediatorList("court").then((res) => {
          if (res && res.code === 200) {
            this.mediatorList = res.data;
            this.refreshMediator();
            this.visible = true;
          }
        });
      }
      this.visible = true;
    },
    // 更新调解员禁用状态
    refreshMediator() {
      this.mediatorList.forEach((item) => {
        if (DEPT_TYPE.bankList.includes(item.workDeptType)) {
          item.remark = item.nickName + "(案件数:" + item.hasNum.length + ";" + "银行" + ")";
        } else if (DEPT_TYPE.nonBankList.includes(item.workDeptType)) {
          item.remark = item.nickName + "(案件数:" + item.hasNum.length + ";" + "非银" + ")";
        } else if (DEPT_TYPE.insuranceList.includes(item.workDeptType)) {
          item.remark = item.nickName + "(案件数:" + item.hasNum.length + ";" + "保险" + ")";
        }
        item.disabled = item.disableDpetIdList.includes(this.form.deptId);
        if (DEPT_TYPE.bankList.includes(this.form.deptType) || DEPT_TYPE.nonBankList.includes(this.form.deptType)) {
          // 银行/非银的单子归到银行调解员
          item.disabled = item.disabled || !DEPT_TYPE.bankList.includes(item.workDeptType) && !DEPT_TYPE.nonBankList.includes(item.workDeptType);
        } else if (DEPT_TYPE.insuranceList.includes(this.form.deptType)) {
          // 保险的单子归保险调解员
          item.disabled = item.disabled || !DEPT_TYPE.insuranceList.includes(item.workDeptType);
        }
        if (item.mediatorUserId === this.form.mediatorUserId && item.disabled) {
          this.form.mediatorUserId = null;
        }
        item.disabled = item.disabled || !item.participate
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        console.log(valid)
        if (valid) {
          this.loading = true;
          addDisputeMediation(this.form).then((response) => {
            this.loading = false;
            this.$modal.msgSuccess("新增成功");
            this.visible = false;
            this.$emit('callback');
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
      this.refreshMediator();
    },
    // 根据用户权限禁用进件渠道
    entryChannelDisable(list) {
      if (list) {
        list.forEach(i => {
          if (Array.isArray(i.value)) {
            i.disabled = true;
            if (i.value.every(j => DM_ENTRY_CHANNEL.CENTER.includes(j)) && (this.$store.getters.userInfo.isDMCenterBankEntryClerk || this.$store.getters.userInfo.isDMCenterNonBankEntryClerk || this.$store.getters.userInfo.isDMCenterInsuranceEntryClerk)) {
              i.disabled = false;
            }
            if (i.value.every(j => DM_ENTRY_CHANNEL.COURT.includes(j)) && (this.$store.getters.userInfo.isDMCourtBankEntryClerk || this.$store.getters.userInfo.isDMCourtNonBankEntryClerk || this.$store.getters.userInfo.isDMCourtInsuranceEntryClerk)) {
              i.disabled = false;
            }
            if (i.value.every(j => DM_ENTRY_CHANNEL.D === j) && this.$store.getters.userInfo.isDMInstitution) {
              i.disabled = false;
            }
          } else {
            i.disabled = true;
            if (DM_ENTRY_CHANNEL.CENTER.includes(i.value) && (this.$store.getters.userInfo.isDMCenterBankEntryClerk || this.$store.getters.userInfo.isDMCenterNonBankEntryClerk || this.$store.getters.userInfo.isDMCenterInsuranceEntryClerk)) {
              i.disabled = false;
            }
            if (DM_ENTRY_CHANNEL.COURT.includes(i.value) && (this.$store.getters.userInfo.isDMCourtBankEntryClerk || this.$store.getters.userInfo.isDMCourtNonBankEntryClerk || this.$store.getters.userInfo.isDMCourtInsuranceEntryClerk)) {
              i.disabled = false;
            }
            if (DM_ENTRY_CHANNEL.D === i.value && this.$store.getters.userInfo.isDMInstitution) {
              i.disabled = false;
            }
          }
          this.entryChannelDisable(i.children);
        })
      }
    },
    // 修改进件渠道
    changEntryChannel() {
      if (!DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel)) {
        this.form.mediatorUserId = null;
      }
    },
    calculateRightBHeight() {
      const dialogLeft = document.querySelector('.dialog-left');
      const rightT = document.querySelector('.right-t');
      const rightB = document.querySelector('.right-b');

      if (dialogLeft && rightT && rightB) {
        const dialogLeftHeight = dialogLeft.clientHeight || dialogLeft.offsetHeight;
        const rightTHeight = rightT.clientHeight || rightT.offsetHeight;

        rightB.style.height = (dialogLeftHeight - rightTHeight) + 'px';
        console.log('计算高度:', dialogLeftHeight, rightTHeight, dialogLeftHeight - rightTHeight);
      }
    },
    completedCount() {
      // 统计已完整的消息条数（兼容字符串/布尔两种 complete 表达）
      return this.sseList.filter(d => d && (d.complete === true || d.complete === 'true')).length;
    },
    initSSE() {
      const nowFormId = this.formId;
      if (typeof (EventSource) !== "undefined" && this.run === false) {
        const source = new EventSource(`/asr/stream/?code=${this.extn}`);
        source.onmessage = (event) => {
          try {
            const resData = JSON.parse(event.data);
            if (resData.event === 'run') {
              const list = [...this.sseList]
              const { direction, complete, data } = resData;
              // 规范 complete 为布尔
              if (direction === '1') {
                const lastIndex = list.findLastIndex(item => item.role === "投诉人" && item.complete === 'false');
                if (lastIndex !== -1) {
                  list[lastIndex] = { role: "投诉人", message: data, complete: complete }
                } else {
                  list[list.length] = { role: "投诉人", message: data, complete: complete }
                }
              } else {
                const lastIndex = list.findLastIndex(item => item.role === "调解员" && item.complete === 'false');
                if (lastIndex !== -1) {
                  list[lastIndex] = { role: "调解员", message: data, complete: complete }
                } else {
                  list[list.length] = { role: "调解员", message: data, complete: complete }
                }
              }
              this.sseList = list
            } else if (resData.event === 'end') {
              console.log(resData.event);
              if (this.getDataInterval) {
                clearInterval(this.getDataInterval);
                this.getDataInterval = null
                source.close();

                if (this.completedCount() >= 2) {
                  SSEGetFromData({ content: this.sseList.filter(d => d.complete), type: 2 }).then(res => {
                    if (res.code === 200 && nowFormId === this.formId) {
                      this.diaputeForm = res.data
                    }
                  })
                } else {
                  this.initSSE();
                }

              }
            }
          } catch (error) {
            console.error('解析 SSE 数据失败:', error);
          }
        };
        source.onopen = () => {
          if (!this.getDataInterval && this.run === false) {
            this.getDataInterval = setInterval(() => {
              if (this.completedCount() >= 2) {
                this.run = true
                SSEGetFromData({ content: this.sseList.filter(d => d.complete), type: 2 }).then(res => {
                  if (res.code === 200 && nowFormId === this.formId) {
                    this.diaputeForm = res.data
                  }
                })
              }
            }, 60000);
          }
        };
        source.onerror = (error) => {
          if (source.readyState === EventSource.CLOSED && this.run === false) {
            clearTimeout(this.sseTimeout);
            this.sseTimeout = setTimeout(() => this.initSSE(), 3000);
          }
        };
        this.eventSource = source;
      } else {
        console.error('当前浏览器不支持 SSE');
      }
    },

    handelCoverForm() {
      this.form = { ...this.form, ...this.diaputeForm }
      this.cardNumChange(this.form.certNum);
    }
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
  margin-bottom: 10px;
}

.dispute-dialog ::v-deep .el-dialog__header {
  padding: 0;
}

.dispute-dialog ::v-deep .el-dialog__body {
  padding-top: 0;
}

.add-dispute {

  // display: flex;
  .dialog-left {
    border-right: 1px solid #ccc;
    padding-right: 10px !important;

    .dialog-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      color: #303133;
      margin: 20px 0;

      .el-icon-close {
        cursor: pointer;
      }
    }
  }

  .dialog-right {
    padding-left: 10px !important;

    .right-t {
      .region-title {
        color: #DCDFE6;
        margin: 20px 0;
        font-size: 18px;
      }

      .confirm-btn {
        display: flex;
        justify-content: center;
        border-bottom: 2px solid #ccc;
        margin-bottom: 10px;
        padding-bottom: 10px;

        button {
          background: #0958d9;
          color: #fff;

          &:hover {
            color: #fff;
          }
        }
      }

      .line-row {
        border-bottom: 1px solid #DCDFE6;
        padding-bottom: 18px;
        margin-bottom: 18px;

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }

    .right-b {
      overflow-y: auto;

      .socket-item {
        margin-top: 10px;
        display: flex;
        flex-direction: column;

        .socket-l {

          display: flex;
          align-items: flex-end;

          .person-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 5px;

            .name {
              color: #999;
              margin-block-start: 0;
              margin-block-end: 0;
            }

            .avatar {
              width: 50px;
              height: 50px;
              margin-top: 5px;
            }
          }

          .person-message {
            max-width: 60%;

            span {
              display: inline-block;
              height: auto;
              background: #999;
              color: #000;
              border-radius: 10px;
              padding: 8px;
            }
          }
        }

        .socket-r {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;

          .person-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-left: 5px;

            .name {
              color: #999;
              margin-block-start: 0;
              margin-block-end: 0;
            }

            .avatar {
              width: 50px;
              height: 50px;
              margin-top: 5px;
            }
          }

          .person-message {
            max-width: 60%;

            span {
              display: inline-block;
              height: auto;
              background: #4096ff;
              color: #fff;
              border-radius: 10px;
              padding: 8px;
            }
          }
        }
      }
    }
  }
}
</style>
