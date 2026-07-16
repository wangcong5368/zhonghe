<!-- 新增纠纷业务工单对话框 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog ref="disputeDialog" :visible.sync="visible" width="92%" append-to-body :close-on-click-modal="false"
    :show-close="false" class="dispute-dialog" :class="{ 'dispute-dialog--script-open': smartScriptVisible }"
    :close-on-press-escape="false">
    <div class="dispute-wrapper">
      <div class="dispute-main">
        <el-row class="add-dispute" :gutter="3">
          <el-col ref="dialogLeft" class="dialog-left" :span="14">
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

                  <el-col :span="12" v-if="
                    $store.getters.userInfo.isDMEntryClerk ||
                    DEPT_TYPE.insuranceList.includes(form.deptType) ||
                    DEPT_TYPE.bankList.includes(form.deptType) ||
                    DEPT_TYPE.nonBankList.includes(form.deptType)
                  ">
                    <el-form-item label="渠道类型" prop="channelType">
                      <el-select disabled v-model="form.channelType" placeholder="请选择渠道类型" clearable
                        style="width: 100%">
                        <el-option v-for="dict in dict.type.dm_channel_type" :key="dict.value" :label="dict.label"
                          :value="dict.value"></el-option>
                      </el-select>
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
                <el-row v-if="form.entryChannel && form.entryChannel !== DM_ENTRY_CHANNEL.E">
                  <el-col :span="24">
                    <el-form-item label="图片/文件信息识别">
                      <el-upload ref="ocrUpload" action="" accept=".docx,.xlsx,image/*,.pdf,application/pdf" multiple
                        :show-file-list="false" :limit="5" :http-request="handleOcrUpload"
                        :before-upload="beforeOcrUpload" :on-exceed="handleOcrExceed" :auto-upload="true">
                        <el-button size="mini" type="primary">上传图片/文件</el-button>
                        <span slot="tip" class="el-upload__tip"
                          style="margin-left: 12px">支持一次选择多个图片/文件（Word、Excel、PDF），批量识别工单相关信息</span>
                      </el-upload>
                      <ul v-if="ocrRecognizeRecords.length" class="recognize-records-list">
                        <li v-for="(record, index) in ocrRecognizeRecords" :key="record.id"
                          class="recognize-record-item" :class="{ active: activeOcrRecordId === record.id }"
                          @click="applyOcrRecord(record)">
                          <span class="record-label">{{ record.label }}</span>
                          <span class="record-time">{{ record.time }}</span>
                          <el-button type="text" class="record-delete"
                            @click.stop="removeOcrRecord(index)">删除</el-button>
                        </li>
                      </ul>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-if="form.entryChannel && form.entryChannel === DM_ENTRY_CHANNEL.D">
                  <el-col :span="24">
                    <el-form-item label="表格信息识别">
                      <el-upload ref="excelUpload" action=""
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        :show-file-list="false" :limit="1" :http-request="handleExcelUpload"
                        :before-upload="beforeExcelUpload" :on-exceed="handleExcelExceed" :auto-upload="true">
                        <el-button size="mini" type="primary">上传Excel</el-button>
                        <span slot="tip" class="el-upload__tip" style="margin-left: 12px">仅支持 Excel
                          文件，识别后自动填入左侧表单</span>
                      </el-upload>
                      <ul v-if="excelRecognizeRecords.length" class="recognize-records-list">
                        <li v-for="(record, index) in excelRecognizeRecords" :key="record.id"
                          class="recognize-record-item" :class="{ active: activeExcelRecordId === record.id }"
                          @click="applyExcelRecord(record)">
                          <span class="record-label">{{ record.label }}</span>
                          <span class="record-time">{{ record.time }}</span>
                          <el-button type="text" class="record-delete"
                            @click.stop="removeExcelRecord(index)">删除</el-button>
                        </li>
                      </ul>
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
                        <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{
                          dict.label }}</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="SYS_YES_NO.sys_no === form.isSelf">
                    <el-form-item label="代理人姓名" prop="agentName">
                      <el-input v-model="form.agentName" placeholder="请输入代理人姓名" clearable maxlength="10"
                        show-word-limit />
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
                    <el-form-item label="代理人证件号码" prop="agentCertNum" :rules="[
                      { required: this.form.agentCertType, message: '代理人证件号码为必填项', trigger: 'blur' },
                      { validator: this.validCertNum(this.form.agentCertType), trigger: 'blur' }
                    ]">
                      <el-input v-model="form.agentCertNum" placeholder="请输入代理人证件号码"
                        :maxlength="this.validCertNumLength(this.form.agentCertType)" show-word-limit clearable />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-if="SYS_YES_NO.sys_no === form.isSelf">
                  <el-col :span="12">
                    <el-form-item label="代理人联系方式" prop="agentPhone">
                      <el-input v-model="form.agentPhone" placeholder="请输入代理人联系方式" maxlength="11" show-word-limit
                        clearable oninput="value=value.replace(/[^\d]/g,'')" />
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

                <el-row v-if="
                  $store.getters.userInfo.isDMEntryClerk ||
                  DEPT_TYPE.insuranceList.includes(form.deptType) ||
                  DEPT_TYPE.bankList.includes(form.deptType) ||
                  DEPT_TYPE.nonBankList.includes(form.deptType)
                ">
                  <el-col :span="12">
                    <el-form-item label="消费者身份类型" prop="consumerIdentityType">
                      <el-select v-model="form.consumerIdentityType" placeholder="请选择消费者身份类型" clearable
                        style="width: 100%" @change="form.certType = null">
                        <el-option v-for="dict in dict.type.dm_consumer_identity_type" :key="dict.value"
                          :label="dict.label" :value="dict.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item v-if="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL" label="法人或非法人组织"
                      prop="name" label-width="140px">
                      <el-input v-model="form.name" placeholder="请输入法人或非法人组织" clearable maxlength="50"
                        show-word-limit />
                    </el-form-item>
                    <el-form-item v-else label="消费者姓名" prop="name">
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
                          :value="dict.value"
                          :disabled="form.consumerIdentityType ? form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? dict.label !== '统一社会信用代码' : dict.label === '统一社会信用代码' : false"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item v-if="form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL" label="统一社会信用代码"
                      prop="certNum" :rules="[{ required: true, message: '统一社会信用代码为必填项', trigger: 'blur' }]"
                      label-width="140px">
                      <el-input v-model="form.certNum" placeholder="请输入统一社会信用代码"
                        :maxlength="this.validCertNumLength(this.form.certType)" show-word-limit clearable
                        @input="cardNumChange" />
                    </el-form-item>
                    <el-form-item v-else label="证件号码" prop="certNum" :rules="[
                      { required: true, message: '消费者证件号码为必填项', trigger: 'blur' },
                      { validator: this.validCertNum(this.form.certType), trigger: 'blur' }
                    ]">
                      <el-input v-model="form.certNum" placeholder="请输入证件号码"
                        :maxlength="this.validCertNumLength(this.form.certType)" show-word-limit clearable
                        @input="cardNumChange" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="性别" prop="sex"
                      :rules="[{ required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者性别为必填项', trigger: 'change' }]">
                      <el-select v-model="form.sex" placeholder="请选择性别" clearable style="width: 100%">
                        <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                          :value="dict.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="年龄" prop="age"
                      :rules="[{ required: form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者年龄为必填项', trigger: 'blur' }]">
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
                      <el-input v-model="form.profession" maxlength="20" show-word-limit clearable
                        placeholder="请输入职业" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-if="
                  $store.getters.userInfo.isDMEntryClerk ||
                  DEPT_TYPE.insuranceList.includes(form.deptType) ||
                  DEPT_TYPE.bankList.includes(form.deptType) ||
                  DEPT_TYPE.nonBankList.includes(form.deptType)
                ">
                  <el-col :span="12">
                    <el-form-item label="邮箱" prop="email">
                      <el-input v-model="form.email" show-word-limit placeholder="请输入邮箱" clearable />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
                    <el-form-item label="身份类型" prop="identityType">
                      <el-select v-model="form.identityType" placeholder="请选择身份类型" clearable style="width: 100%">
                        <el-option v-for="dict in dict.type.dm_identity_type" :key="dict.value" :label="dict.label"
                          :value="dict.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12" v-if="!$store.getters.userInfo.isDMEntryClerk">
                    <el-form-item label="调解次数" prop="mediationNumber" :rules="[
                      {
                        required:
                          !$store.getters.userInfo.isDMEntryClerk &&
                          !DEPT_TYPE.insuranceList.includes(form.deptType) &&
                          !DEPT_TYPE.bankList.includes(form.deptType) &&
                          !DEPT_TYPE.nonBankList.includes(form.deptType),
                        message: '调解次数为必填项',
                        trigger: 'blur'
                      }
                    ]">
                      <el-input v-model="form.mediationNumber" show-word-limit placeholder="请输入调解次数" clearable />
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
                <el-row
                  v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && !$store.getters.userInfo.isDMEntryClerk">
                  <el-col :span="12">
                    <el-form-item label="是否涉及第三方代理" prop="isThirdPartyAgent" label-width="150px">
                      <el-select v-model="form.isThirdPartyAgent" placeholder="请选择是否涉及第三方代理" clearable
                        style="width: 100%">
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
                      <treeselect v-model="form.deptId" :options="deptOptions" :normalizer="normalizer"
                        placeholder="请选择机构" @input="deptChange" @change="deptChangeClick" />
                    </el-form-item>
                  </el-col>
                  <!-- <el-col :span="12">
                                <el-form-item label="机构类型" prop="type">
                                    <el-cascader v-model="form.deptType" :options="dict.type.dept_type.options" disabled :props="{ expandTrigger: 'hover', emitPath: false }" style="width: 100%" />
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
                      <el-input v-model="form.deptAddress" type="textarea" placeholder="请输入机构住所地" clearable
                        maxlength="100" show-word-limit :autosize="{ minRows: 1 }" />
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
                          }
                        }"></el-date-picker>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="机构所在地区" prop="deptArea">
                      <el-input v-model="form.deptArea" placeholder="请输入机构所在地区" clearable maxlength="40"
                        show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row
                  v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
                  <el-col :span="12">
                    <el-form-item label="业务经办人员" prop="deptHandlerName" :rules="[
                      {
                        required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                        message: '业务经办人员为必填项',
                        trigger: 'blur'
                      }
                    ]">
                      <el-input v-model="form.deptHandlerName" placeholder="请输入业务经办人员" clearable maxlength="10"
                        show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="经办人员联系电话" prop="deptHandlerPhone" label-width="140px" :rules="[
                      {
                        required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                        message: '经办人员联系电话为必填项',
                        trigger: 'blur'
                      },
                      { validator: this.phoneRule, trigger: 'blur' }
                    ]">
                      <el-input v-model="form.deptHandlerPhone" placeholder="请输入经办人员联系电话" clearable maxlength="11"
                        show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row
                  v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
                  <el-col :span="12">
                    <el-form-item label="经办人身份证号" prop="deptHandlerCertNum" :rules="[
                      {
                        required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                        message: '经办人身份证号为必填项',
                        trigger: 'blur'
                      },
                      { validator: this.validCertNum(this.CERT_TYPE.CERT_TYPE0), trigger: 'blur' }
                    ]">
                      <el-input v-model="form.deptHandlerCertNum" placeholder="请输入经办人身份证号" clearable maxlength="18"
                        show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="被投诉主体层级" prop="level">
                      <el-input v-model="form.level" placeholder="请输入被投诉主体层级" clearable maxlength="10"
                        show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row
                  v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
                  <el-col :span="12">
                    <el-form-item label="业务类别" prop="businessType1">
                      <el-cascader v-model="form.businessType1" :options="dict.type.dm_business_type.options2"
                        :props="{ emitPath: false, checkStrictly: false }" placeholder="请选择业务类别" clearable
                        style="width: 100%" ref="businessType1Ref" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row
                  v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
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
                <el-row
                  v-if="DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)">
                  <el-col :span="12">
                    <el-form-item label="业务办理渠道" prop="handleChannel" :rules="[
                      {
                        required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                        message: '业务办理渠道为必填项',
                        trigger: 'change'
                      }
                    ]">
                      <el-select v-model="form.handleChannel" placeholder="请选择业务办理渠道" clearable style="width: 100%">
                        <el-option v-for="dict in dict.type.dm_handle_channel" :key="dict.value" :label="dict.label"
                          :value="dict.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="投诉分类" prop="bankComplaintType" :rules="[
                      {
                        required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                        message: '投诉分类为必填项',
                        trigger: 'change'
                      }
                    ]">
                      <el-select v-model="form.bankComplaintType" placeholder="请选择投诉分类" clearable style="width: 100%">
                        <el-option v-for="dict in dict.type.dm_bank_complaint_type" :key="dict.value"
                          :label="dict.label" :value="dict.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType)">
                  <el-col :span="12">
                    <el-form-item label="险种类别" prop="insuranceType1" :rules="[
                      {
                        required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                        message: '险种类别为必填项',
                        trigger: 'change'
                      }
                    ]">
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
                    <el-form-item label="保险消费投诉事由分类" prop="insuranceComplaintType" label-width="165px" :rules="[
                      {
                        required: !$store.getters.userInfo.isDMEntryClerk && DEPT_TYPE.insuranceList.includes(form.deptType),
                        message: '保险消费投诉事由分类为必填项',
                        trigger: 'change'
                      }
                    ]">
                      <el-select v-model="form.insuranceComplaintType" placeholder="请选择保险消费投诉事由分类" clearable
                        style="width: 100%">
                        <el-option v-for="dict in dict.type.dm_insurance_complaint_type" :key="dict.value"
                          :label="dict.label" :value="dict.value"></el-option>
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
                        trigger: 'change'
                      }
                    ]">
                      <el-cascader ref="financialServiceAreaRef" v-model="form.financialServiceArea"
                        :options="areaOptions" :props="{ expandTrigger: 'hover', emitPath: false }"
                        placeholder="请选择金融服务发生地" clearable style="width: 100%" @change="handleAreaChange"
                        @clear="resetAreaData" />
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
                      <el-select v-model="form.disputedProductType" placeholder="请选择产品/服务" clearable
                        style="width: 100%">
                        <el-option v-for="dict in dict.type.dm_disputed_product_type" :key="dict.value"
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
                  <el-form-item label="委派/委托代表姓名" prop="deptContact" label-width="140px" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '委派/委托代表姓名为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.deptContact" placeholder="请输入机构代表姓名" clearable maxlength="10"
                      show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="性别" prop="deptContactSex" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '性别为必填项',
                      trigger: 'change'
                    }
                  ]">
                    <el-select v-model="form.deptContactSex" placeholder="请选择性别" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                        :value="dict.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="所在部门及职务" prop="deptContactPosition" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '所在部门及职务为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.deptContactPosition" type="textarea" placeholder="请输入机构代表所在部门及职务" clearable
                      maxlength="30" show-word-limit :autosize="{ minRows: 1 }" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="证件类型" prop="deptContactCertType" label-width="130px" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '证件类型为必填项',
                      trigger: 'change'
                    }
                  ]">
                    <el-select v-model="form.deptContactCertType" placeholder="请选择证件类型" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                        :value="dict.value" v-if="dict.label !== '统一社会信用代码'"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="证件号码" prop="deptContactCertNum" label-width="130px" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '机构代表证件号码为必填项',
                      trigger: 'blur'
                    },
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
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '联系方式为必填项',
                      trigger: 'blur'
                    },
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
                  <el-form-item label="涉及产品或服务名称" prop="product" label-width="150px" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '涉及产品或服务名称为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.product" placeholder="请输入涉及产品或服务名称" clearable maxlength="40"
                      show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="涉及产品或服务合同号" prop="contract" label-width="170px" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '涉及产品或服务合同号为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.contract" placeholder="请输入涉及产品或服务合同号" clearable maxlength="40"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="涉案金额（元）" prop="involveAmount" :rules="[
                    {
                      required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType),
                      message: '涉案金额为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.involveAmount" placeholder="请输入涉案金额" maxlength="12" show-word-limit
                      @input="validAmount(form.involveAmount, 'involveAmount')" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="诉请金额（元）" prop="appealAmount" :rules="[
                    {
                      required: this.DEPT_TYPE.bankList.includes(this.form.deptType) || this.DEPT_TYPE.nonBankList.includes(this.form.deptType),
                      message: '诉请金额为必填项',
                      trigger: 'blur'
                    }
                  ]">
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
                  <el-form-item label="调解方案金额" prop="solutionAmount" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '调解方案金额为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.solutionAmount" placeholder="请输入调解方案金额" maxlength="10" show-word-limit
                      clearable @input="validAmount(form.solutionAmount, 'solutionAmount')" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row
                v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && $store.getters.userInfo.isDMInstitution">
                <el-col :span="12">
                  <el-form-item label="履约类型" prop="enforceAgreementType" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '履约类型为必填项',
                      trigger: 'change'
                    }
                  ]">
                    <el-select v-model="form.enforceAgreementType" placeholder="请选择履约类型" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.dm_enforce_agreement_type" :key="dict.value"
                        :label="dict.label" :value="dict.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="
                !$store.getters.userInfo.isDMEntryClerk &&
                (DEPT_TYPE.insuranceList.includes(form.deptType) || DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType))
              ">
                <el-col :span="12">
                  <el-form-item label="案件类型" prop="selfCollectionCaseType" :rules="[
                    {
                      required:
                        DEPT_TYPE.insuranceList.includes(form.deptType) || DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType),
                      message: '案件类型为必填项',
                      trigger: 'change'
                    }
                  ]">
                    <el-select v-if="DEPT_TYPE.insuranceList.includes(form.deptType)"
                      v-model="form.selfCollectionCaseType" placeholder="请选择案件类型" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.dm_insurance_self_collection_case_type" :key="dict.value"
                        :label="dict.label" :value="dict.value"></el-option>
                    </el-select>
                    <el-select v-else v-model="form.selfCollectionCaseType" placeholder="请选择案件类型" clearable
                      style="width: 100%">
                      <el-option v-for="dict in dict.type.dm_bank_self_collection_case_type" :key="dict.value"
                        :label="dict.label" :value="dict.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12"
                  v-if="(DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) && isControversyCaseType(form.selfCollectionCaseType)">
                  <el-form-item label="争议事由" prop="controversyCause" :rules="[
                    {
                      required:
                        (!$store.getters.userInfo.isDMEntryClerk &&
                          (DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) &&
                          isControversyCaseType(form.selfCollectionCaseType)) ||
                        ($store.getters.userInfo.isDMEntryClerk.isMediator &&
                          (DEPT_TYPE.bankList.includes(form.deptType) || DEPT_TYPE.nonBankList.includes(form.deptType)) &&
                          isControversyCaseType(form.selfCollectionCaseType)),
                      message: '争议事由为必填项',
                      trigger: 'change'
                    }
                  ]">
                    <el-select v-model="form.controversyCause" placeholder="请选择争议事由" clearable style="width: 100%">
                      <el-option v-for="dict in dict.type.dm_controversy_cause_type" :key="dict.value"
                        :label="dict.label" :value="dict.value"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="自查情况、调解方案及依据" prop="solution" class="endItem" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate,
                      message: '自查情况、调解方案及依据为必填项',
                      trigger: 'blur'
                    }
                  ]">
                    <el-input v-model="form.solution" type="textarea" placeholder="请输入自查情况、调解方案及依据" clearable
                      maxlength="2000" show-word-limit :autosize="{ minRows: 3 }" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
                <el-col :span="12">
                  <el-form-item label="投保人" prop="policyholder">
                    <el-input v-model="form.policyholder" placeholder="请输入投保人" clearable maxlength="10"
                      show-word-limit />
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
                  <el-form-item label="业务所属支公司" prop="businessCompany">
                    <el-input v-model="form.businessCompany" placeholder="请输入业务所属支公司" clearable maxlength="100"
                      show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="销售人员（网点、理赔人员）" prop="salesman" label-width="200px">
                    <el-input v-model="form.salesman" placeholder="请输入销售人员" clearable maxlength="10" show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="DEPT_TYPE.insuranceList.includes(form.deptType) && $store.getters.userInfo.isDMInstitution">
                <el-col :span="12">
                  <el-form-item label="销售、网点、理赔工号" prop="salesmanJobNum" label-width="160px">
                    <el-input v-model="form.salesmanJobNum" placeholder="请输入销售、网点、理赔工号" clearable maxlength="20"
                      show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="销售人员、理赔人员证件号码" prop="salesmanCertNum" label-width="200px">
                    <el-input v-model="form.salesmanCertNum" placeholder="请输入销售人员、理赔人员证件号码" clearable maxlength="18"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="$store.getters.userInfo.isDMInstitution">
                <el-col :span="24">
                  <el-form-item label="人民调解申请书" prop="applicationAttachment" :rules="[
                    {
                      required: this.$store.getters.userInfo.isDMInstitution && SYS_YES_NO.sys_yes === this.form.consumerAcceptMediate,
                      message: '请上传《人民调解申请书》或其他金融消费者同意调解作证材',
                      trigger: 'change'
                    }
                  ]">
                    <file-upload v-model="form.applicationAttachment" :fileType="[
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
              </el-row>
              <el-row v-if="$store.getters.userInfo.isDMInstitution || $store.getters.userInfo.isDMEntryClerk">
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
              <div v-if="$store.getters.userInfo.isDMEntryClerk || $store.getters.userInfo.isDMMediator">
                <div class="min_title">受理信息</div>
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="受理状态" prop="acceptStatus">
                      <el-select v-model="form.acceptStatus" placeholder="请选择受理状态" style="width: 100%" clearable
                        @change="form.selfRejectReason = null">
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
            <div ref="rightT" class="right-t">
              <el-form ref="diaputeFormRef" :model="diaputeForm" label-width="120px" hide-required-asterisk>
                <div class="consumer-info-wrap">
                  <el-row class="is-self-row">
                    <el-col :span="24">
                      <el-form-item label="是否消费者本人" prop="isSelf" label-width="200px">
                        <el-radio-group v-model="diaputeForm.isSelf">
                          <el-radio v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.value">{{
                            dict.label }}</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <div v-if="SYS_YES_NO.sys_no === diaputeForm.isSelf" class="right-section-block agent-section-block">
                    <div class="region-title">*委托人信息</div>
                    <div class="agent-fields-grid">
                      <el-row class="line-row agent-field-row">
                        <el-col :span="11">
                          <el-form-item label="代理人姓名" prop="agentName">
                            <el-input v-model="diaputeForm.agentName" placeholder="请输入代理人姓名" clearable maxlength="10"
                              show-word-limit />
                          </el-form-item>
                        </el-col>
                        <el-col :span="13">
                          <el-form-item label="联系方式" prop="agentPhone" class="agent-phone-item">
                            <el-input v-model="diaputeForm.agentPhone" placeholder="请输入联系方式" type="tel" maxlength="11"
                              show-word-limit clearable oninput="value=value.replace(/[^\d]/g,'')" />
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row class="line-row agent-field-row">
                        <el-col :span="12">
                          <el-form-item label="代理人性别" prop="agentSex">
                            <el-select v-model="diaputeForm.agentSex" placeholder="请选择代理人性别" clearable>
                              <el-option v-for="dict in dict.type.sys_user_sex" :key="dict.value" :label="dict.label"
                                :value="dict.value"></el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="12">
                          <el-form-item label="代理人证件类型" prop="agentCertType">
                            <el-select v-model="diaputeForm.agentCertType" placeholder="请选择代理人证件类型" clearable>
                              <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                                :value="dict.value"></el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row class="line-row agent-field-row agent-field-row-last">
                        <el-col :span="24">
                          <el-form-item label="代理人证件号码" prop="agentCertNum">
                            <el-input v-model="diaputeForm.agentCertNum" placeholder="请输入代理人证件号码"
                              :maxlength="validCertNumLength(diaputeForm.agentCertType)" show-word-limit clearable />
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </div>
                  </div>
                  <div class="right-section-block">
                    <div class="region-title">*消费者信息</div>
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
                    <div class="cert-column-fields">
                      <el-form-item label="证件类型" prop="certType">
                        <el-select v-model="diaputeForm.certType" placeholder="请选择证件类型" clearable>
                          <el-option v-for="dict in dict.type.cert_type" :key="dict.value" :label="dict.label"
                            :value="dict.value"
                            :disabled="form.consumerIdentityType ? form.consumerIdentityType === DM_IDENTITY_TYPE.LEGAL ? dict.label !== '统一社会信用代码' : dict.label === '统一社会信用代码' : false"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="证件号码" prop="certNum">
                        <el-input v-model="diaputeForm.certNum" placeholder="请输入证件号码"
                          :maxlength="validCertNumLength(diaputeForm.certType)" show-word-limit clearable />
                      </el-form-item>
                    </div>
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
                </div>
                <div>
                  <div class="region-title">*机构信息</div>
                  <!-- 暂时注释：住所地
              <el-row class="line-row">
                <el-col :span="24">
                  <el-form-item label="住所地" prop="deptAddress">
                    <el-input v-model="diaputeForm.deptAddress" type="textarea" placeholder="请输入机构住所地" clearable
                      maxlength="100" show-word-limit :autosize="{ minRows: 1 }" />
                  </el-form-item>
                </el-col>
              </el-row>
              -->
                  <el-row class="line-row">
                    <el-col :span="24">
                      <el-form-item label="纠纷发生日期" prop="disputeDate" class="dispute-date-form-item">
                        <el-date-picker clearable v-model="diaputeForm.disputeDate" type="date"
                          value-format="yyyy-MM-dd" placeholder="请选择纠纷发生日期" class="dispute-date-picker" :picker-options="{
                            disabledDate(time) {
                              return time.getTime() > Date.now();
                            }
                          }" />
                      </el-form-item>
                    </el-col>
                    <!-- 暂时注释：机构所在地区
                <el-col :span="12">
                  <el-form-item label="机构所在地区" prop="deptArea">
                    <el-input v-model="diaputeForm.deptArea" placeholder="请输入机构所在地区" clearable maxlength="40"
                      show-word-limit />
                  </el-form-item>
                </el-col>
                -->
                  </el-row>
                  <el-row class="line-row">
                    <el-col :span="12">
                      <el-form-item label="调解员向当事人电话确认" prop="needCheck" label-width="180px">
                        <el-select v-model="diaputeForm.needCheck" placeholder="请选择调解员向当事人电话确认" clearable
                          style="width: 100%">
                          <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label"
                            :value="dict.value"></el-option>
                        </el-select>
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
                      <el-form-item label="主要诉求" prop="appeal">
                        <el-input v-model="diaputeForm.appeal" type="textarea" placeholder="请输入内容" clearable
                          maxlength="400" show-word-limit :autosize="{ minRows: 3 }" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
                <!-- 暂时注释：调解信息
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
            -->
                <div>
                  <div class="region-title">*受理信息</div>
                  <el-row class="line-row">
                    <el-col :span="12">
                      <el-form-item label="受理状态" prop="acceptStatus">
                        <el-select v-model="diaputeForm.acceptStatus" placeholder="请选择受理状态" style="width: 100%"
                          clearable @change="diaputeForm.rejectReason = null">
                          <el-option v-for="dict in dict.type.dm_accept_status" :key="dict.value" :label="dict.label"
                            :value="dict.value"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="DM_ACCEPT_STATUS.reject === diaputeForm.acceptStatus">
                      <el-form-item label="不予受理原因" prop="rejectReason">
                        <el-select v-model="diaputeForm.rejectReason" placeholder="请选择不予受理原因" clearable
                          style="width: 100%">
                          <el-option v-for="dict in dict.type.dm_reject_reason" :key="dict.value" :label="dict.label"
                            :value="dict.value"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </el-form>
              <ul v-if="asrRecognizeRecords.length" class="recognize-records-list asr-records">
                <li class="recognize-records-title">识别记录</li>
                <li v-for="(record, index) in asrRecognizeRecords" :key="record.id" class="recognize-record-item"
                  :class="{ active: activeAsrRecordId === record.id }" @click="applyAsrRecord(record)">
                  <span class="record-label">记录 {{ index + 1 }}</span>
                  <span class="record-time">{{ record.time }}</span>
                </li>
              </ul>
              <div class="confirm-btn">
                <el-button @click="handelCoverForm">确认信息，自动覆盖</el-button>
              </div>
              <div v-if="!smartScriptSessionEnded" class="smart-script-trigger">
                <el-button size="small" :type="smartScriptVisible ? 'info' : 'primary'" icon="el-icon-chat-dot-round"
                  @click="toggleSmartScript">智能话术</el-button>
              </div>
            </div>
            <div ref="rightB" class="right-b">
              <div class="right-b-chat">
                <div v-for="(item, index) in sseList" :key="index" class="socket-item">
                  <div class="socket-l" v-if="item.role === '调解员'">
                    <div class="person-info">
                      <p class="name">调解员</p>
                      <img class="avatar" src="@/assets/images/form-avatar.png" alt="" />
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
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-if="smartScriptVisible" class="dialog-script">
        <smart-script-panel :panel-data="smartScriptData" :loading="smartScriptLoading"
          :script-regenerating="smartScriptRegenerating" @regenerate="handleSmartScriptRegenerate"
          @close="closeSmartScriptPanel" />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {
  addDisputeMediation,
  mediatorList,
  SSEGetFromData,
  getExcelAnalysisInfo,
  getAsrStreamUrl,
  saveCallQualityWorkOrder,
  saveCallTranscriptDetail,
  updateCallQualityWorkOrder,
  saveOrUpdateDisputeMediationExpand,
  getByDeptId,
  getProvinceCityTree
} from '@/api/project/disputeMediation';
import { uploadOcr } from '@/api/ocr';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { DEPT_TYPE, SYS_YES_NO, SYS_SEX, DM_ACCEPT_STATUS, DM_ENTRY_CHANNEL, CERT_TYPE, DM_IDENTITY_TYPE, DM_CHANNEL_TYPE } from '@/views/constant/CommonConstant.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { analyzeTypicalChat } from '@/api/ocr';
import SmartScriptPanel from './mediationRecord/smartScriptPanel.vue';

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
  salesmanJobNum: 20
};

export default {
  components: { Treeselect, SmartScriptPanel },
  dicts: [
    'dept_type',
    'dm_status',
    'dm_sale_channel',
    'dm_bank_complaint_type',
    'dm_insurance_complaint_type',
    'dm_accept_status',
    'dm_reject_reason',
    'dm_business_type',
    'cert_type',
    'sys_yes_no',
    'sys_user_sex',
    'dm_handle_channel',
    'dm_enforce_agreement_type',
    'dm_entry_channel',
    'dm_insurance_type',
    'dm_channel_type',
    'dm_consumer_identity_type',
    'dm_identity_type',
    'dm_disputed_product_type',
    'dm_bank_self_collection_case_type',
    'dm_insurance_self_collection_case_type',
    'dm_institution_type',
    'dm_controversy_cause_type'
  ],
  props: ['deptOptions', 'deptMap'],
  data() {
    return {
      visible: false,
      form: {},
      loading: false,
      mediatorList: [],
      // 表单校验
      rules: {
        entryChannel: [{ required: true, message: '进件渠道为必填项', trigger: 'change' }],
        channelType: [{ required: true, message: '渠道类型为必填项', trigger: 'change' }],
        mediatorUserId: [{ required: true, message: '调解员为必填项', trigger: 'change' }],
        isSelf: [{ required: true, message: '是否消费者本人为必填项', trigger: 'change' }],
        institutionType: [{ required: true, message: '机构类型为必填项', trigger: 'change' }],
        // agentCertNum: [
        //   { required: this.form.agentCertType, message: '代理人证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' },
        // ],
        agentPhone: [{ validator: this.phoneRule, trigger: 'blur' }],
        name: [{ required: true, message: '消费者姓名为必填项', trigger: 'blur' }],
        consumerIdentityType: [{ required: true, message: '消费者身份类型为必填项', trigger: 'change' }],
        phone: [
          { required: true, message: '消费者联系方式为必填项', trigger: 'blur' },
          { validator: this.phoneRule, trigger: 'blur' }
        ],
        certType: [{ required: true, message: '消费者证件类型为必填项', trigger: 'change' }],
        // certNum: [
        //   { required: true, message: '消费者证件号码为必填项', trigger: 'blur' },
        //   { validator: , trigger: 'blur' },
        // ],
        // sex: [{ required: this.form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者性别为必填项', trigger: 'change' }],
        email: [
          // { required: fa, message: '消费者邮箱为必填项', trigger: 'blur' },
          {
            pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            message: '请输入正确的邮箱格式',
            trigger: 'blur'
          }
        ],
        // mediationNumber: [{ required: true, message: '调解次数为必填项', trigger: 'change' }],
        identityType: [{ required: true, message: '消费者身份类型为必填项', trigger: 'change' }],
        // age: [{ required: this.form.consumerIdentityType !== DM_IDENTITY_TYPE.LEGAL, message: '消费者年龄为必填项', trigger: 'blur' }],
        // isRepeatedly: [{ required: true, message: '是否屡投为必填项', trigger: 'change' }],
        // isBlackIndustry: [{ required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '是否涉及黑产为必填项', trigger: 'change' }],
        // isThirdPartyAgent: [{ required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '是否涉及第三方代理为必填项', trigger: 'change' }],
        // isHighRisk: [{ required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '是否高危客群为必填项', trigger: 'change' }],
        deptId: [{ required: true, message: '机构名称为必填项', trigger: 'blur' }],
        disputeDate: [{ required: true, message: '纠纷发生日期为必填项', trigger: 'blur' }],
        complaintContent: [{ required: true, message: '投诉内容为必填项', trigger: 'blur' }],
        appeal: [{ required: true, message: '主要诉求为必填项', trigger: 'blur' }],
        needCheck: [{ required: true, message: '调解员向当事人电话确认为必填项', trigger: 'change' }],
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
        // businessType1: [{ required: this.$store.getters.userInfo.isDMEntryClerk || this.$store.getters.userInfo.isDMMediator, message: '业务类别为必填项', trigger: 'change' }],
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
        deptAcceptMediate: [{ required: true, message: '金融机构是否接受调解为必填项', trigger: 'change' }],
        // enforceAgreementType: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '履约类型为必填项', trigger: 'change' },
        // ],
        // solutionAmount: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '调解方案金额为必填项', trigger: 'blur' },
        // ],
        // solution: [
        //   { required: this.$store.getters.userInfo.isDMInstitution && this.SYS_YES_NO.sys_no !== this.form.deptAcceptMediate, message: '自查情况、调解方案及依据为必填项', trigger: 'blur' },
        // ],
        acceptStatus: [{ required: true, message: '受理状态为必填项', trigger: 'change' }]
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
      SYS_YES_NO: SYS_YES_NO, // 是否
      SYS_SEX: SYS_SEX, // 性别
      DM_ACCEPT_STATUS: DM_ACCEPT_STATUS, // 纠纷业务受理状态
      DM_ENTRY_CHANNEL: DM_ENTRY_CHANNEL, // 纠纷业务进件渠道
      CERT_TYPE: CERT_TYPE, // 身份证类型,
      DM_IDENTITY_TYPE: DM_IDENTITY_TYPE, // 消费者身份类型,
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
      ocrRecognizeRecords: [],
      activeOcrRecordId: null,
      ocrBatchFiles: [],
      ocrBatchOptions: [],
      ocrBatchTimer: null,
      excelRecognizeRecords: [],
      activeExcelRecordId: null,
      asrRecognizeRecords: [],
      activeAsrRecordId: null,
      callQualityWorkOrderId: null,
      hadCallAttemptFlag: false,
      callAnsweredFlag: false,
      callEndHandled: false,
      callQualityRecordLinked: false,
      callStartPromise: null,
      callTranscriptDetailSaved: false,
      smartScriptVisible: false,
      smartScriptLoading: false,
      smartScriptRegenerating: false,
      smartScriptTimer: null,
      smartScriptSessionEnded: false,
      smartScriptData: null,
      // 消费者身份类型与证件类型的映射关系
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
    visible(nVal) {
      if (nVal) {
        this.$nextTick(() => {
          this.calculateRightBHeight();
          this.sseList = [];
          this.ocrRecognizeRecords = [];
          this.activeOcrRecordId = null;
          this.excelRecognizeRecords = [];
          this.activeExcelRecordId = null;
          this.asrRecognizeRecords = [];
          this.activeAsrRecordId = null;
          this.diaputeForm = this.getDefaultDiaputeForm();
          this.formId = uuidv4();
          clearTimeout(this.sseTimeout);
          clearInterval(this.getDataInterval);
          this.getDataInterval = null;
          this.run = false;
          this.initSSE();
        });
      } else {
        if (this.eventSource) {
          clearTimeout(this.sseTimeout);
          clearInterval(this.getDataInterval);
          if (this.eventSource) {
            this.eventSource.close();
          }
          this.getDataInterval = null;
          this.diaputeForm = this.getDefaultDiaputeForm();
          this.ocrRecognizeRecords = [];
          this.activeOcrRecordId = null;
          this.excelRecognizeRecords = [];
          this.activeExcelRecordId = null;
          this.asrRecognizeRecords = [];
          this.activeAsrRecordId = null;
          this.run = false;
          console.log('SSE 连接已关闭');
        }
        this.callQualityWorkOrderId = null;
        this.hadCallAttemptFlag = false;
        this.callAnsweredFlag = false;
        this.callEndHandled = false;
        this.callQualityRecordLinked = false;
        this.callStartPromise = null;
        this.callTranscriptDetailSaved = false;
        this.smartScriptVisible = false;
        this.smartScriptSessionEnded = false;
        this.smartScriptData = null;
        this.stopSmartScriptPolling();
      }
    },
    smartScriptVisible() {
      this.$nextTick(() => this.calculateRightBHeight());
    },
    '$store.state.settings.callInfo.data': {
      handler(data) {
        this.trackCallAttemptFromPhoneState(data);
      },
      deep: true
    }

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
  created() { },

  methods: {
    // 选择器禁用今天之后的日期或时间
    disabledDate(time) {
      return time.getTime() < Date.now();
    },
    /** 18 位居民身份证解析性别、年龄（与手动输入证件号规则一致） */
    parseIdCardSexAndAge(certType, certNum) {
      if (certType !== CERT_TYPE.CERT_TYPE0 || certNum == null || certNum === '') {
        return null;
      }
      const val = String(certNum).trim().toUpperCase();
      const regex = /^[1-9]\d{5}(18|19|20)?\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/;
      if (!regex.test(val) || val.length < 18) {
        return null;
      }
      const sex = val.charAt(16) % 2 === 0 ? SYS_SEX.man : SYS_SEX.woman;
      const birthDateStr = val.substring(6, 14);
      const birthYear = parseInt(birthDateStr.substring(0, 4), 10);
      const birthMonth = parseInt(birthDateStr.substring(4, 6), 10) - 1;
      const birthDay = parseInt(birthDateStr.substring(6, 8), 10);
      const currentDate = new Date();
      let age = currentDate.getFullYear() - birthYear;
      if (currentDate.getMonth() < birthMonth || (currentDate.getMonth() === birthMonth && currentDate.getDate() < birthDay)) {
        age -= 1;
      }
      if (!Number.isFinite(age) || age < 0) {
        return { sex };
      }
      return { sex, age };
    },
    /** 回填后按证件类型+证件号推导性别、年龄（消费者/代理人/机构代表） */
    applyIdCardDerivedFields() {
      const consumer = this.parseIdCardSexAndAge(this.form.certType, this.form.certNum);
      if (consumer) {
        if (consumer.sex != null) {
          this.$set(this.form, 'sex', consumer.sex);
        }
        if (consumer.age != null) {
          this.$set(this.form, 'age', String(consumer.age));
        }
      }
      const agent = this.parseIdCardSexAndAge(this.form.agentCertType, this.form.agentCertNum);
      if (agent && agent.sex != null) {
        this.$set(this.form, 'agentSex', agent.sex);
      }
      const deptContact = this.parseIdCardSexAndAge(this.form.deptContactCertType, this.form.deptContactCertNum);
      if (deptContact && deptContact.sex != null) {
        this.$set(this.form, 'deptContactSex', deptContact.sex);
      }
    },
    // 根据身份证号自动填充年龄性别
    cardNumChange(val) {
      if (this.form.certType !== CERT_TYPE.CERT_TYPE0) {
        return;
      }
      const parsed = this.parseIdCardSexAndAge(this.form.certType, val);
      if (!parsed) {
        return;
      }
      if (parsed.sex != null) {
        this.form.sex = parsed.sex;
      }
      if (parsed.age != null) {
        this.form.age = parsed.age;
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
    isOcrRecognizeFile(file) {
      if (!file) {
        return false;
      }
      const name = (file.name || '').toLowerCase();
      const type = file.type || '';
      return (type && type.startsWith('image/')) || type === 'application/pdf' || name.endsWith('.pdf') || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || name.endsWith('.docx') || name.endsWith('.xlsx') || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      return;
    },
    beforeOcrUpload(file) {
      if (!this.isOcrRecognizeFile(file)) {
        this.$modal.msgError('请上传图片/文件（Word、Excel、PDF）');
        return false;
      }
      const isPdf = file.type === 'application/pdf' || (file.name || '').toLowerCase().endsWith('.pdf');
      const maxMb = isPdf ? 20 : 10;
      // const maxMb = 20;
      if (file.size / 1024 / 1024 >= maxMb) {
        this.$modal.msgError(`图片/文件大小不能超过 ${maxMb} MB`);
        return false;
      }
      return true;
    },
    handleOcrExceed() {
      this.$modal.msgError('上传文件数量不能超过 5 个');
    },
    /** el-upload 自定义上传：取原生 File（option.file.raw） */
    resolveUploadRawFile(option) {
      const f = option && option.file;
      const raw = f && f.raw != null ? f.raw : f;
      if (raw instanceof File || raw instanceof Blob) {
        return raw;
      }
      return null;
    },
    /** FormData 上传：去掉全局 axios 的 application/json，由浏览器设置 multipart 边界 */
    postFormData(url, formData, timeout = 120000) {
      const token = getToken();
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      return axios.post(url, formData, {
        headers,
        timeout,
        transformRequest: [
          (data, headerConfig) => {
            delete headerConfig['Content-Type'];
            return data;
          }
        ]
      });
    },
    handleOcrUpload(option) {
      const raw = this.resolveUploadRawFile(option);
      if (!raw) {
        this.$modal.msgError('无法读取图片/文件，请重新选择');
        option.onError(new Error('invalid upload file'));
        return;
      }
      this.ocrBatchFiles.push(raw);
      this.ocrBatchOptions.push(option);
      clearTimeout(this.ocrBatchTimer);
      this.ocrBatchTimer = setTimeout(() => this.flushOcrBatchUpload(), 80);
    },
    flushOcrBatchUpload() {
      const files = [...this.ocrBatchFiles];
      const options = [...this.ocrBatchOptions];
      this.ocrBatchFiles = [];
      this.ocrBatchOptions = [];
      if (!files.length) {
        return;
      }
      this.$modal.loading('正在上传并识别，请稍候...');
      const fd = new FormData();
      files.forEach(f => {
        fd.append('file', f, f.name);
      });
      const fileLabel = files.map(f => f.name || '文件').join('、');
      uploadOcr(fd, 120000)
        .then(res => {
          const body = res.data;
          const code = body && typeof body.code !== 'undefined' ? body.code : null;
          if (res.status < 200 || res.status >= 300) {
            const msg = (body && body.msg) || `上传失败 (${res.status})`;
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            options.forEach(opt => opt.onError(new Error(msg)));
            return;
          }
          if (body.status != null && body.status !== 'success') {
            const msg = (body && body.msg) || '识别失败';
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            options.forEach(opt => opt.onError(new Error(msg)));
            return;
          }
          if (code !== null && code !== 200) {
            const msg = (body && body.msg) || '识别失败';
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            options.forEach(opt => opt.onError(new Error(msg)));
            return;
          }
          const data = body.data;
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            const msg = (body && body.msg) || '识别结果中缺少 data 表单字段对象（需与接口约定字段名一致）';
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            options.forEach(opt => opt.onError(new Error(msg)));
            return;
          }
          const mapped = this.applyOcrDataToForm(body);
          const record = this.addOcrRecognizeRecord(data, fileLabel);
          this.uploadRecognizeFilesToAttachment(files, record.id, this.ocrRecognizeRecords);
          this.$modal.closeLoading();
          options.forEach(opt => opt.onSuccess(body, opt.file));
          if (this.$refs.ocrUpload) {
            this.$refs.ocrUpload.clearFiles();
          }
          this.$modal.msgSuccess(mapped > 0 ? '识别完成，已根据识别结果填入左侧表单' : '识别完成，未识别到可自动填入的文本项（或均为「无」）');
        })
        .catch(err => {
          this.$modal.closeLoading();
          const msg = (err.response && err.response.data && err.response.data.msg) || err.message || '上传失败';
          this.$modal.msgError(msg);
          options.forEach(opt => opt.onError(err));
        });
    },
    uploadRecognizeFilesToAttachment(files, recordId, records) {
      const base = (this._baseUrl || '').trim();
      if (!base || !/^https?:\/\//i.test(base) || !recordId || !records) {
        return;
      }
      const uploadUrl = `${base.replace(/\/$/, '')}/common/upload`;
      files.forEach(file => {
        const fd = new FormData();
        const name = file.name || 'file';
        fd.append('file', file, name);
        this.postFormData(uploadUrl, fd, 60000)
          .then(res => {
            const body = res.data;
            if (body && body.code === 200 && body.fileName) {
              const record = records.find(r => r.id === recordId);
              if (!record) {
                return;
              }
              this.appendOcrRecordAttachment(record, body.fileName);
              this.appendAttachmentFile(body.fileName);
            }
          })
          .catch(() => { });
      });
    },
    removeExcelRecognizeAttachments() {
      const oldFiles = this.excelRecognizeRecords.flatMap(r => (r.attachmentFiles && r.attachmentFiles.length ? r.attachmentFiles : []));
      if (oldFiles.length) {
        this.removeAttachmentFiles(oldFiles);
      }
    },
    appendOcrRecordAttachment(record, fileName) {
      if (!record || !fileName) {
        return;
      }
      if (!Array.isArray(record.attachmentFiles)) {
        this.$set(record, 'attachmentFiles', []);
      }
      if (!record.attachmentFiles.includes(fileName)) {
        record.attachmentFiles.push(fileName);
      }
    },
    appendAttachmentFile(fileName) {
      if (!fileName) {
        return;
      }
      const current = this.form.attachment;
      if (current && String(current).split(',').includes(fileName)) {
        return;
      }
      this.form.attachment = current ? `${current},${fileName}` : fileName;
    },
    removeAttachmentFiles(fileNames) {
      if (!fileNames || !fileNames.length || !this.form.attachment) {
        return;
      }
      const removeSet = new Set(fileNames.map(f => String(f).trim()).filter(Boolean));
      const remaining = String(this.form.attachment)
        .split(',')
        .map(f => f.trim())
        .filter(f => f && !removeSet.has(f));
      this.form.attachment = remaining.length ? remaining.join(',') : null;
    },
    /** 仅高亮当前实际回填表单的那条识别记录（图片与 Excel 互斥） */
    setActiveRecognizeRecord(type, recordId) {
      if (type === 'ocr') {
        this.activeOcrRecordId = recordId;
        this.activeExcelRecordId = null;
      } else if (type === 'excel') {
        this.activeExcelRecordId = recordId;
        this.activeOcrRecordId = null;
      } else {
        this.activeOcrRecordId = null;
        this.activeExcelRecordId = null;
      }
    },
    addOcrRecognizeRecord(data, label) {
      const record = {
        id: uuidv4(),
        label: label || `识别记录 ${this.ocrRecognizeRecords.length + 1}`,
        time: this.formatRecordTime(),
        data: JSON.parse(JSON.stringify(data)),
        attachmentFiles: []
      };
      this.ocrRecognizeRecords.push(record);
      this.setActiveRecognizeRecord('ocr', record.id);
      return record;
    },
    applyOcrRecord(record) {
      if (!record || !record.data) {
        return;
      }
      this.setActiveRecognizeRecord('ocr', record.id);
      this.applyOcrDataToForm({ data: record.data });
    },
    removeOcrRecord(index) {
      const removed = this.ocrRecognizeRecords.splice(index, 1)[0];
      if (removed && removed.attachmentFiles && removed.attachmentFiles.length) {
        this.removeAttachmentFiles(removed.attachmentFiles);
      }
      if (removed && removed.id === this.activeOcrRecordId) {
        const last = this.ocrRecognizeRecords[this.ocrRecognizeRecords.length - 1];
        this.setActiveRecognizeRecord(last ? 'ocr' : null, last ? last.id : null);
      }
    },
    beforeExcelUpload(file) {
      if (!this.form.entryChannel) {
        this.$modal.msgError('请先选择进件渠道');
        return false;
      }
      const name = (file.name || '').toLowerCase();
      const isExcel = /\.xlsx?$/i.test(name) || (file.type && (file.type.includes('spreadsheet') || file.type.includes('excel')));
      if (!isExcel) {
        this.$modal.msgError('请上传 Excel 文件（.xls 或 .xlsx）');
        return false;
      }
      const maxMb = 20;
      if (file.size / 1024 / 1024 >= maxMb) {
        this.$modal.msgError(`Excel 文件大小不能超过 ${maxMb} MB`);
        return false;
      }
      return true;
    },
    handleExcelExceed() {
      this.$modal.msgError('仅支持上传一个 Excel 文件');
    },
    handleExcelUpload(option) {
      const raw = this.resolveUploadRawFile(option);
      if (!raw) {
        this.$modal.msgError('无法读取 Excel 文件，请重新选择');
        option.onError(new Error('invalid upload file'));
        return;
      }
      const fd = new FormData();
      fd.append('entryChannel', this.form.entryChannel);
      fd.append('file', raw, raw.name);
      const fileLabel = raw.name || 'Excel';
      this.$modal.loading('正在上传并识别 Excel，请稍候...');
      getExcelAnalysisInfo(fd, 120000)
        .then(res => {
          const body = res.data;
          const code = body && typeof body.code !== 'undefined' ? body.code : null;
          if (res.status < 200 || res.status >= 300) {
            const msg = (body && body.msg) || `上传失败 (${res.status})`;
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            option.onError(new Error(msg));
            return;
          }
          if (body.status != null && body.status !== 'success') {
            const msg = (body && body.msg) || '识别失败';
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            option.onError(new Error(msg));
            return;
          }
          if (code !== null && code !== 200) {
            const msg = (body && body.msg) || '识别失败';
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            option.onError(new Error(msg));
            return;
          }
          const data = body.data;
          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            const msg = (body && body.msg) || '识别结果中缺少 data 表单字段对象（需与接口约定字段名一致）';
            this.$modal.closeLoading();
            this.$modal.msgError(msg);
            option.onError(new Error(msg));
            return;
          }
          const mapped = this.applyExcelDataToForm(body);
          this.removeExcelRecognizeAttachments();
          const record = this.addExcelRecognizeRecord(data, fileLabel);
          this.uploadRecognizeFilesToAttachment([raw], record.id, this.excelRecognizeRecords);
          this.$modal.closeLoading();
          option.onSuccess(body, option.file);
          if (this.$refs.excelUpload) {
            this.$refs.excelUpload.clearFiles();
          }
          this.$modal.msgSuccess(mapped > 0 ? 'Excel 识别完成，已根据识别结果填入左侧表单' : 'Excel 识别完成，未识别到可自动填入的文本项（或均为「无」）');
        })
        .catch(err => {
          this.$modal.closeLoading();
          const msg = (err.response && err.response.data && err.response.data.msg) || err.message || '上传失败';
          this.$modal.msgError(msg);
          option.onError(err);
        });
    },
    addExcelRecognizeRecord(data, label) {
      const record = {
        id: uuidv4(),
        label: label || 'Excel 识别记录',
        time: this.formatRecordTime(),
        data: JSON.parse(JSON.stringify(data)),
        attachmentFiles: []
      };
      this.excelRecognizeRecords = [record];
      this.setActiveRecognizeRecord('excel', record.id);
      return record;
    },
    applyExcelRecord(record) {
      if (!record || !record.data) {
        return;
      }
      this.setActiveRecognizeRecord('excel', record.id);
      this.applyExcelDataToForm({ data: record.data });
    },
    removeExcelRecord(index) {
      const removed = this.excelRecognizeRecords.splice(index, 1)[0];
      if (removed && removed.attachmentFiles && removed.attachmentFiles.length) {
        this.removeAttachmentFiles(removed.attachmentFiles);
      }
      if (removed && removed.id === this.activeExcelRecordId) {
        this.setActiveRecognizeRecord(null);
      }
      if (this.$refs.excelUpload) {
        this.$refs.excelUpload.clearFiles();
      }
    },
    getTodayDateStr() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    },
    getDefaultDiaputeForm() {
      return {
        disputeDate: this.getTodayDateStr(),
        needCheck: SYS_YES_NO.sys_yes,
        acceptStatus: DM_ACCEPT_STATUS.accept,
        isSelf: SYS_YES_NO.sys_yes,
        rejectReason: null
      };
    },
    formatRecordTime() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    applyAsrParseResult(data) {
      if (!data || typeof data !== 'object') {
        return;
      }
      const merged = { ...this.getDefaultDiaputeForm(), ...this.diaputeForm, ...data };
      if (!merged.disputeDate) {
        merged.disputeDate = this.getTodayDateStr();
      }
      if (!merged.needCheck) {
        merged.needCheck = SYS_YES_NO.sys_yes;
      }
      if (!merged.acceptStatus) {
        merged.acceptStatus = DM_ACCEPT_STATUS.accept;
      }
      this.diaputeForm = merged;
      const record = {
        id: uuidv4(),
        time: this.formatRecordTime(),
        data: JSON.parse(JSON.stringify(data))
      };
      this.asrRecognizeRecords.push(record);
      this.activeAsrRecordId = record.id;
      this.stopAsrDataInterval();
      this.$nextTick(() => {
        this.calculateRightBHeight();
        this.releaseDialogPopupLock();
      });
    },
    applyAsrRecord(record) {
      if (!record || !record.data) {
        return;
      }
      this.activeAsrRecordId = record.id;
      this.diaputeForm = { ...this.getDefaultDiaputeForm(), ...record.data };
    },
    /** OCR 返回中表示“无识别值”、不参与表单映射 */
    isOcrFieldNoneValue(raw) {
      if (raw === undefined || raw === null) {
        return true;
      }
      if (typeof raw === 'string') {
        const t = raw.trim();
        if (!t) {
          return true;
        }
        if (t === '无') {
          return true;
        }
        if (t === '["无"]' || t === "['无']") {
          return true;
        }
      }
      if (Array.isArray(raw)) {
        return raw.length === 1 && String(raw[0]).trim() === '无';
      }
      return false;
    },
    /** @returns {string|null} null 表示跳过该字段映射 */
    normalizeOcrNumberInputValue(key, strVal) {
      const s = String(strVal).trim();
      if (!/\d/.test(s)) {
        return null;
      }
      const noCjk = s.replace(/[\u4e00-\u9fff]/g, '');
      if (key === 'age') {
        const digits = noCjk.replace(/[^\d]/g, '');
        if (!digits) {
          return null;
        }
        const n = parseInt(digits, 10);
        return Number.isFinite(n) ? String(n) : null;
      }
      let t = noCjk.replace(/[^\d.]/g, '');
      if (!t) {
        return null;
      }
      const dot = t.indexOf('.');
      if (dot === -1) {
        const n = parseInt(t, 10);
        return Number.isFinite(n) ? String(n) : null;
      }
      const intRaw = t.slice(0, dot).replace(/\./g, '');
      const intNum = parseInt(intRaw, 10);
      if (!Number.isFinite(intNum)) {
        return null;
      }
      const intStr = String(intNum);
      const fracRaw = t.slice(dot + 1).replace(/\./g, '');
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
      const noCjk = s.replace(/[\u4e00-\u9fff]/g, '');
      const digits = noCjk.replace(/[^\d]/g, '');
      return digits.length ? digits : null;
    },
    /** 将 OCR 返回的 data 映射到左侧表单；返回值：成功写入的字段数，-1 表示 data 不可用 */
    applyOcrDataToForm(body) {
      if (!body || typeof body !== 'object') {
        return -1;
      }
      const data = body.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return -1;
      }
      if (Object.keys(data).length === 0) {
        return -1;
      }
      // 系统字段，不参与 OCR 回填
      const systemSkipKeys = new Set([
        'workOrderId',
        'manageDeptId',
        'attachment',
        'applicationAttachment',
        'stampedFeedbackAttachment',
        'photocopyAttachment',
        'mediatorUserId',
        'assistantUserId',
        'status',
        'createId',
        'createTime',
        'updateId',
        'updateTime',
        'entryChannel', // 用户手动选择，OCR 不覆盖
        'deptType', // 由 deptId 变化自动联动，OCR 不覆盖
        'deptId' // 树形选择，OCR 不覆盖
      ]);
      const numericInputKeys = new Set(['age', 'involveAmount', 'appealAmount', 'solutionAmount', 'cashValue', 'lossAssessmentAmount', 'claimAmount']);
      const contactPhoneKeys = new Set(['phone', 'agentPhone', 'deptHandlerPhone', 'deptContactPhone']);
      // Select / Radio 枚举字段：字段名 → 字典类型名
      const enumFieldDictMap = {
        isSelf: 'sys_yes_no',
        agentCertType: 'cert_type',
        agentSex: 'sys_user_sex',
        certType: 'cert_type',
        sex: 'sys_user_sex',
        isRepeatedly: 'sys_yes_no',
        isBlackIndustry: 'sys_yes_no',
        isThirdPartyAgent: 'sys_yes_no',
        isHighRisk: 'sys_yes_no',
        handleChannel: 'dm_handle_channel',
        bankComplaintType: 'dm_bank_complaint_type',
        saleChannel: 'dm_sale_channel',
        insuranceComplaintType: 'dm_insurance_complaint_type',
        consumerAcceptMediate: 'sys_yes_no',
        needCheck: 'sys_yes_no',
        enforceAgreementType: 'dm_enforce_agreement_type',
        acceptStatus: 'dm_accept_status',
        rejectReason: 'dm_reject_reason',
        deptContactSex: 'sys_user_sex',
        deptContactCertType: 'cert_type'
      };
      // Cascader 枚举字段：字段名 → 字典 options2 路径
      const cascaderFieldDictMap = {
        businessType1: 'dm_business_type',
        insuranceType1: 'dm_insurance_type'
      };
      let count = 0;
      Object.keys(data).forEach(key => {
        if (systemSkipKeys.has(key)) {
          return;
        }
        const raw = data[key];
        if (this.isOcrFieldNoneValue(raw)) {
          return;
        }
        // --- Select / Radio 枚举字段：根据 label 或 value 匹配枚举项 ---
        if (enumFieldDictMap[key]) {
          const dictName = enumFieldDictMap[key];
          const dictItems = this.dict && this.dict.type && this.dict.type[dictName];
          if (!dictItems || !dictItems.length) {
            return;
          }
          const rawStr = typeof raw === 'string' ? raw.trim() : String(raw).trim();
          const matched = dictItems.find(d => String(d.value) === rawStr) || dictItems.find(d => d.label === rawStr);
          if (!matched) {
            return;
          }
          this.$set(this.form, key, matched.value);
          count += 1;
          return;
        }
        // --- Cascader 枚举字段：遍历 options2 树匹配 ---
        if (cascaderFieldDictMap[key]) {
          const dictName = cascaderFieldDictMap[key];
          const dictObj = this.dict && this.dict.type && this.dict.type[dictName];
          const options = dictObj && (dictObj.options2 || dictObj.options);
          if (!options || !options.length) {
            return;
          }
          const rawStr = typeof raw === 'string' ? raw.trim() : String(raw).trim();
          const matchedVal = this.findCascaderValue(options, rawStr);
          if (matchedVal === undefined) {
            return;
          }
          this.$set(this.form, key, matchedVal);
          count += 1;
          return;
        }
        // --- 文本 / 数字 / 电话 / 证件号码 等普通输入字段 ---
        let strVal;
        if (typeof raw === 'string') {
          strVal = raw;
        } else if (typeof raw === 'number' && Number.isFinite(raw)) {
          strVal = String(raw);
        } else {
          return;
        }
        if (numericInputKeys.has(key)) {
          const normalized = this.normalizeOcrNumberInputValue(key, strVal);
          if (normalized == null || normalized === '') {
            return;
          }
          strVal = normalized;
        } else if (contactPhoneKeys.has(key)) {
          const normalized = this.normalizeOcrPhoneInputValue(strVal);
          if (normalized == null || normalized === '') {
            return;
          }
          strVal = normalized;
        }
        const cap = OCR_FIELD_MAXLENGTH[key];
        if (typeof cap === 'number' && cap > 0 && strVal.length > cap) {
          strVal = strVal.slice(0, cap);
        }
        this.$set(this.form, key, strVal);
        count += 1;
      });
      // 每次图片/PDF 识别回填后，根据身份证号重新推导消费者性别、年龄（覆盖 OCR 原文返回值）
      this.applyIdCardDerivedFields();
      return count;
    },
    /**
     * 递归遍历 Cascader options 树，按 value 或 label 匹配；
     * 返回匹配到的 value，未匹配时返回 undefined
     */
    findCascaderValue(options, rawStr) {
      if (!options || !rawStr) {
        return undefined;
      }
      for (const opt of options) {
        if (String(opt.value) === rawStr || opt.label === rawStr) {
          return opt.value;
        }
        if (opt.children && opt.children.length) {
          const found = this.findCascaderValue(opt.children, rawStr);
          if (found !== undefined) {
            return found;
          }
        }
      }
      return undefined;
    },
    /** Excel 识别：回填左侧表单全部可映射字段（含 Select、证件号等）；OCR 仍仅用 applyOcrDataToForm */
    applyExcelDataToForm(body) {
      if (!body || typeof body !== 'object') {
        return -1;
      }
      const data = body.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return -1;
      }
      if (Object.keys(data).length === 0) {
        return -1;
      }
      const skipKeys = new Set([
        'workOrderId',
        'manageDeptId',
        'attachment',
        'applicationAttachment',
        'stampedFeedbackAttachment',
        'photocopyAttachment',
        'mediatorUserId',
        'assistantUserId',
        'status',
        'createId',
        'createTime',
        'updateId',
        'updateTime'
      ]);
      const numericInputKeys = new Set(['age', 'involveAmount', 'appealAmount', 'solutionAmount', 'cashValue', 'lossAssessmentAmount', 'claimAmount']);
      const contactPhoneKeys = new Set(['phone', 'agentPhone', 'deptHandlerPhone', 'deptContactPhone']);
      const cascaderKeys = new Set(['entryChannel', 'deptType', 'businessType1', 'insuranceType1']);
      let count = 0;
      let deptIdChanged = false;
      Object.keys(data).forEach(key => {
        if (skipKeys.has(key)) {
          return;
        }
        const raw = data[key];
        if (this.isOcrFieldNoneValue(raw)) {
          return;
        }
        const val = this.normalizeExcelFormValue(key, raw, numericInputKeys, contactPhoneKeys, cascaderKeys);
        if (val === undefined) {
          return;
        }
        this.$set(this.form, key, val);
        if (key === 'deptId') {
          deptIdChanged = true;
        }
        count += 1;
      });
      if (deptIdChanged) {
        this.$nextTick(() => this.deptChange());
      }
      this.applyIdCardDerivedFields();
      return count;
    },
    normalizeExcelFormValue(key, raw, numericInputKeys, contactPhoneKeys, cascaderKeys) {
      if (Array.isArray(raw)) {
        return raw.length ? raw : null;
      }
      if (typeof raw === 'boolean') {
        return raw;
      }
      if (key === 'deptId' && typeof raw === 'number' && Number.isFinite(raw)) {
        return raw;
      }
      if (typeof raw === 'number' && Number.isFinite(raw)) {
        if (cascaderKeys.has(key)) {
          return String(raw);
        }
        raw = String(raw);
      } else if (typeof raw !== 'string') {
        return undefined;
      } else {
        raw = raw.trim();
        if (!raw) {
          return null;
        }
      }
      let strVal = typeof raw === 'string' ? raw : String(raw);
      if (numericInputKeys.has(key)) {
        const normalized = this.normalizeOcrNumberInputValue(key, strVal);
        if (normalized == null || normalized === '') {
          return undefined;
        }
        return normalized;
      }
      if (contactPhoneKeys.has(key)) {
        const normalized = this.normalizeOcrPhoneInputValue(strVal);
        if (normalized == null || normalized === '') {
          return undefined;
        }
        return normalized;
      }
      const cap = OCR_FIELD_MAXLENGTH[key];
      if (typeof cap === 'number' && cap > 0 && strVal.length > cap) {
        strVal = strVal.slice(0, cap);
      }
      return strVal;
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
        deptAcceptMediate: this.$store.getters.userInfo.isDMInstitution ? this.SYS_YES_NO.sys_yes : null,
        consumerAcceptMediate: null,
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
        applicationAttachment: null,
        mediatorUserId: null,
        assistantUserId: null,
        status: null,
        createId: null,
        createTime: null,
        updateId: null,
        updateTime: null,
        consumerIdentityType: null,
        identityType: null,
        email: null,
        mediationNumber: null,
        institutionType: null,
        disputedProductType: null,
        selfCollectionCaseType: null,
        channelType: null,
        provinceCode: null,
        provinceName: null,
        cityCode: null,
        cityName: null,
        financialServiceArea: null,
        remark: null
      };
      this.resetForm('form');
      this.ocrRecognizeRecords = [];
      this.activeOcrRecordId = null;
      this.excelRecognizeRecords = [];
      this.activeExcelRecordId = null;
      this.asrRecognizeRecords = [];
      this.activeAsrRecordId = null;
      this.diaputeForm = this.getDefaultDiaputeForm();
      this.$nextTick(() => {
        if (this.$refs.ocrUpload) {
          this.$refs.ocrUpload.clearFiles();
        }
        if (this.$refs.excelUpload) {
          this.$refs.excelUpload.clearFiles();
        }
      });
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
    open() {
      this.callQualityWorkOrderId = null;
      this.hadCallAttemptFlag = false;
      this.callAnsweredFlag = false;
      this.callEndHandled = false;
      this.callQualityRecordLinked = false;
      this.callStartPromise = null;
      this.callTranscriptDetailSaved = false;
      this.reset();
      this.loadProvinces();
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
        mediatorList('court').then(res => {
          if (res && res.code === 200) {
            this.mediatorList = res.data;
            this.refreshMediator();
            this.visible = true;
          }
        });
      }
      if (this.form.entryChannel) {
        if (this.form.entryChannel && (this.form.entryChannel === DM_ENTRY_CHANNEL.C || this.form.entryChannel === DM_ENTRY_CHANNEL.G)) {
          this.form.channelType = '0';
        } else {
          this.form.channelType = '1';
        }
      }

      this.visible = true;
    },
    // 更新调解员禁用状态
    refreshMediator() {
      this.mediatorList.forEach(item => {
        if (DEPT_TYPE.bankList.includes(item.workDeptType)) {
          item.remark = item.nickName + '(案件数:' + item.hasNum.length + ';' + '银行' + ')';
        } else if (DEPT_TYPE.nonBankList.includes(item.workDeptType)) {
          item.remark = item.nickName + '(案件数:' + item.hasNum.length + ';' + '非银' + ')';
        } else if (DEPT_TYPE.insuranceList.includes(item.workDeptType)) {
          item.remark = item.nickName + '(案件数:' + item.hasNum.length + ';' + '保险' + ')';
        }
        item.disabled = item.disableDpetIdList.includes(this.form.deptId);
        if (DEPT_TYPE.bankList.includes(this.form.deptType) || DEPT_TYPE.nonBankList.includes(this.form.deptType)) {
          // 银行/非银的单子归到银行调解员
          item.disabled = item.disabled || (!DEPT_TYPE.bankList.includes(item.workDeptType) && !DEPT_TYPE.nonBankList.includes(item.workDeptType));
        } else if (DEPT_TYPE.insuranceList.includes(this.form.deptType)) {
          // 保险的单子归保险调解员
          item.disabled = item.disabled || !DEPT_TYPE.insuranceList.includes(item.workDeptType);
        }
        if (item.mediatorUserId === this.form.mediatorUserId && item.disabled) {
          this.form.mediatorUserId = null;
        }
        item.disabled = item.disabled || !item.participate;
      });
    },
    /** 提交按钮 */
    async submitForm() {
      try {
        const valid = await new Promise(resolve => {
          this.$refs['form'].validate(resolve);
        });
        if (!valid) {
          return;
        }
        this.loading = true;
        if (this.isCallAnswered()) {
          await this.finalizeCallOnSubmitIfNeeded();
        }
        const {
          email,
          identityType,
          consumerIdentityType,
          disputedProductType,
          channelType,
          financialServiceArea,
          provinceCode,
          provinceName,
          cityCode,
          cityName,
          remark,
          selfCollectionCaseType,
          mediationNumber,
          institutionType,
          ...restForm
        } = this.form;

        const response = await addDisputeMediation(restForm);
        if (response.code === 200) {
          const recordData = response.data || {};
          await saveOrUpdateDisputeMediationExpand({
            workOrderId: this.form.workOrderId || recordData.workOrderId,
            email,
            identityType,
            consumerIdentityType,
            disputedProductType,
            selfCollectionCaseType,
            channelType,
            provinceCode,
            provinceName,
            cityCode,
            cityName,
            remark,
            institutionType,
            mediationNumber
          });
          if (this.shouldRunCallQualityLogic()) {
            await this.updateCallQualityWorkOrderForAddMediation({
              isSubmit: true,
              workOrderId: recordData.workOrderId
            });
          }
          this.callQualityRecordLinked = true;
        }
        this.$modal.msgSuccess('新增成功');
        this.visible = false;
        this.$emit('callback');
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.visible = false;
      this.reset();
    },
    deptChangeClick() {
      if (this.$refs && this.$refs.form) {
        if (this.form.institutionType) {
          this.$refs.form.clearValidate('institutionType');
        }
      }
    },
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
      this.refreshMediator();
    },
    // 根据用户权限禁用进件渠道
    entryChannelDisable(list) {
      if (list) {
        list.forEach(i => {
          if (Array.isArray(i.value)) {
            i.disabled = true;
            if (
              i.value.every(j => DM_ENTRY_CHANNEL.CENTER.includes(j)) &&
              (this.$store.getters.userInfo.isDMCenterBankEntryClerk ||
                this.$store.getters.userInfo.isDMCenterNonBankEntryClerk ||
                this.$store.getters.userInfo.isDMCenterInsuranceEntryClerk)
            ) {
              i.disabled = false;
            }
            if (
              i.value.every(j => DM_ENTRY_CHANNEL.COURT.includes(j)) &&
              (this.$store.getters.userInfo.isDMCourtBankEntryClerk ||
                this.$store.getters.userInfo.isDMCourtNonBankEntryClerk ||
                this.$store.getters.userInfo.isDMCourtInsuranceEntryClerk)
            ) {
              i.disabled = false;
            }
            if (i.value.every(j => DM_ENTRY_CHANNEL.D === j) && this.$store.getters.userInfo.isDMInstitution) {
              i.disabled = false;
            }
          } else {
            i.disabled = true;
            if (
              DM_ENTRY_CHANNEL.CENTER.includes(i.value) &&
              (this.$store.getters.userInfo.isDMCenterBankEntryClerk ||
                this.$store.getters.userInfo.isDMCenterNonBankEntryClerk ||
                this.$store.getters.userInfo.isDMCenterInsuranceEntryClerk)
            ) {
              i.disabled = false;
            }
            if (
              DM_ENTRY_CHANNEL.COURT.includes(i.value) &&
              (this.$store.getters.userInfo.isDMCourtBankEntryClerk ||
                this.$store.getters.userInfo.isDMCourtNonBankEntryClerk ||
                this.$store.getters.userInfo.isDMCourtInsuranceEntryClerk)
            ) {
              i.disabled = false;
            }
            if (DM_ENTRY_CHANNEL.D === i.value && this.$store.getters.userInfo.isDMInstitution) {
              i.disabled = false;
            }
          }
          this.entryChannelDisable(i.children);
        });
      }
    },
    // 修改进件渠道
    changEntryChannel(val) {
      if (!DM_ENTRY_CHANNEL.COURT.includes(this.form.entryChannel)) {
        this.form.mediatorUserId = null;
      }
      if (!this.form.entryChannel || this.form.entryChannel === DM_ENTRY_CHANNEL.E) {
        this.ocrRecognizeRecords = [];
        this.activeOcrRecordId = null;
        if (this.$refs.ocrUpload) {
          this.$refs.ocrUpload.clearFiles();
        }
      }
      if (!this.form.entryChannel || this.form.entryChannel !== DM_ENTRY_CHANNEL.D) {
        this.removeExcelRecognizeAttachments();
        this.excelRecognizeRecords = [];
        this.activeExcelRecordId = null;
        if (this.$refs.excelUpload) {
          this.$refs.excelUpload.clearFiles();
        }
      }

      if (this.form.entryChannel && (this.form.entryChannel === DM_ENTRY_CHANNEL.C || this.form.entryChannel === DM_ENTRY_CHANNEL.G)) {
        this.form.channelType = '0';
      } else {
        this.form.channelType = '1';
      }
    },
    calculateRightBHeight() {
      const dialogLeftEl = this.$refs.dialogLeft && this.$refs.dialogLeft.$el;
      const rightT = this.$refs.rightT;
      const rightB = this.$refs.rightB;

      if (!dialogLeftEl || !rightT || !rightB) {
        return;
      }
      const dialogLeftHeight = dialogLeftEl.clientHeight || dialogLeftEl.offsetHeight;
      const rightTHeight = rightT.clientHeight || rightT.offsetHeight;
      const height = Math.max(0, dialogLeftHeight - rightTHeight);
      rightB.style.height = height + 'px';
    },
    async toggleSmartScript() {
      if (this.smartScriptSessionEnded) return;
      if (!this.isCallAnswered()) {
        this.$modal.msgWarning('当前暂无通话');
        return;
      }
      this.smartScriptVisible = !this.smartScriptVisible;
      if (this.smartScriptVisible) {
        await this.fetchSmartScriptAnalysis();
        this.startSmartScriptPolling();
      } else {
        this.stopSmartScriptPolling();
      }
    },
    closeSmartScriptPanel() {
      this.smartScriptVisible = false;
      this.stopSmartScriptPolling();
    },
    startSmartScriptPolling() {
      this.stopSmartScriptPolling();
      if (!this.smartScriptVisible || !this.isCallAnswered() || this.smartScriptSessionEnded) return;
      this.smartScriptTimer = setInterval(() => {
        this.fetchSmartScriptAnalysis({ silent: true });
      }, 10000);
    },
    stopSmartScriptPolling() {
      if (this.smartScriptTimer) {
        clearInterval(this.smartScriptTimer);
        this.smartScriptTimer = null;
      }
    },
    buildSmartScriptMessages() {
      return this.sseList
        .filter(d => d && String(d.message || '').trim())
        .map(d => ({
          role: this.mapRoleToTranscriptRole(d.role),
          content: String(d.message || '').trim(),
          timestamp: this.formatTranscriptTimestamp(d.timestamp)
        }));
    },
    async fetchSmartScriptAnalysis({ silent = false } = {}) {
      const messages = this.buildSmartScriptMessages();
      if (!messages.length) {
        if (!silent) {
          this.$modal.msgWarning('当前暂无可分析的通话内容');
        }
        return;
      }
      this.smartScriptLoading = !silent;
      this.smartScriptRegenerating = silent;
      try {
        const res = await analyzeTypicalChat({ messages });
        const body = res && res.data ? res.data : res;
        if (body && body.code === 200 && body.data) {
          this.smartScriptData = body.data;
          return;
        }
        throw new Error((body && (body.message || body.msg)) || '智能话术生成失败');
      } catch (error) {
        if (!silent) {
          this.$modal.msgError(error.message || '智能话术生成失败');
        }
      } finally {
        this.smartScriptLoading = false;
        this.smartScriptRegenerating = false;
      }
    },
    async handleSmartScriptRegenerate() {
      await this.fetchSmartScriptAnalysis();
      if (this.smartScriptVisible && this.isCallAnswered() && !this.smartScriptSessionEnded) {
        this.startSmartScriptPolling();
      }
    },
    /** 语音解析轮询结束后清理，避免重复请求覆盖用户编辑 */
    stopAsrDataInterval() {
      if (this.getDataInterval) {
        clearInterval(this.getDataInterval);
        this.getDataInterval = null;
      }
    },
    /** 批量回填右侧表单后，释放 Element UI 可能残留的透明遮罩 */
    releaseDialogPopupLock() {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      this.$nextTick(() => {
        const dialogWrapper = this.$refs.disputeDialog && this.$refs.disputeDialog.$el ? this.$refs.disputeDialog.$el.parentNode : null;
        if (!dialogWrapper || !dialogWrapper.classList.contains('el-dialog__wrapper')) {
          return;
        }
        const dialogZIndex = parseInt(window.getComputedStyle(dialogWrapper).zIndex, 10) || 2000;
        const hasOpenPopper = Array.from(document.querySelectorAll('.el-select-dropdown, .el-picker-panel, .el-cascader-menus, .el-popover')).some(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
        if (hasOpenPopper) {
          return;
        }
        Array.from(document.body.children).forEach(el => {
          if (!el.classList || !el.classList.contains('v-modal')) {
            return;
          }
          const z = parseInt(window.getComputedStyle(el).zIndex, 10) || 0;
          if (z > dialogZIndex) {
            el.parentNode.removeChild(el);
          }
        });
      });
    },
    completedCount() {
      // 统计已完整的消息条数（兼容字符串/布尔两种 complete 表达）
      return this.sseList.filter(d => d && (d.complete === true || d.complete === 'true')).length;
    },
    initSSE() {
      const nowFormId = this.formId;
      if (typeof EventSource !== 'undefined' && this.run === false) {
        const source = new EventSource(getAsrStreamUrl(this.extn));
        source.onmessage = event => {
          try {
            const resData = JSON.parse(event.data);
            if (resData.event === 'run') {
              if (!this.callAnsweredFlag) {
                this.handleSseCallStart();
              }
              const list = [...this.sseList];
              const { direction, complete, data } = resData;
              const role = String(direction) === '2' ? '投诉人' : '调解员';
              this.appendSseRunMessage(list, role, data, complete);
              this.sseList = list;
            } else if (resData.event === 'end') {
              if (this.isCallAnswered()) {
                this.handleSseCallEnd();
              }
              console.log(resData.event);
              if (this.getDataInterval) {
                clearInterval(this.getDataInterval);
                this.getDataInterval = null;
                source.close();

                if (this.completedCount() >= 2) {
                  SSEGetFromData({ content: this.sseList.filter(d => d.complete), type: 2 }).then(res => {
                    if (res.code === 200 && nowFormId === this.formId) {
                      this.applyAsrParseResult(res.data);
                    }
                  });
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
                this.run = true;
                SSEGetFromData({ content: this.sseList.filter(d => d.complete), type: 2 }).then(res => {
                  if (res.code === 200 && nowFormId === this.formId) {
                    this.applyAsrParseResult(res.data);
                  }
                });
              }
            }, 60000);
          }
        };
        source.onerror = error => {
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
      this.form = { ...this.form, ...this.diaputeForm };
      if (this.form.certNum) {
        this.cardNumChange(this.form.certNum);
      }
    },
    /** 添加纠纷业务工单弹框会话是否有效 */
    isAddMediationCallSessionActive() {
      return this.visible;
    },
    /** 话务状态：弹框期间是否发起/接入过通话（含拨号中、振铃、未接听） */
    trackCallAttemptFromPhoneState(data) {
      if (!this.isAddMediationCallSessionActive()) return;
      if (this.isCallActivityData(data)) {
        this.hadCallAttemptFlag = true;
      }
    },
    isCallActivityData(data) {
      return !!(data && data.state === 'busy');
    },
    /** 弹框期间是否发起/接入过通话（含未接听） */
    hadCallInSession() {
      return this.hadCallAttemptFlag;
    },
    /** 弹框期间是否已接听（ASR 首次 run 表示双方接通） */
    isCallAnswered() {
      return this.callAnsweredFlag;
    },
    /** 是否应执行通话质检接口（已接听且质检工单已创建） */
    shouldRunCallQualityLogic() {
      return this.isCallAnswered() && this.callQualityWorkOrderId != null;
    },
    /** 通话质检接口调解员 id（取当前登录用户 getInfo.userId） */
    getCallQualityMediatorUserId() {
      return this.$store.getters.userInfo && this.$store.getters.userInfo.userId;
    },
    /** ASR 首次 run：通话接通，创建质检工单 */
    handleSseCallStart() {
      if (!this.isAddMediationCallSessionActive() || this.callAnsweredFlag) return;
      this.hadCallAttemptFlag = true;
      this.callAnsweredFlag = true;
      this.callEndHandled = false;
      this.smartScriptSessionEnded = false;
      if (!this.callStartPromise) {
        this.callStartPromise = this.onCallStart().finally(() => {
          this.callStartPromise = null;
        });
      }
    },
    /** ASR end：通话结束，保存转写并更新质检工单 */
    async handleSseCallEnd() {
      if (!this.isAddMediationCallSessionActive() || !this.isCallAnswered()) return;
      if (this.callEndHandled || this.callQualityRecordLinked) return;
      if (this.callStartPromise) {
        await this.callStartPromise;
      }
      this.callEndHandled = true;
      this.smartScriptSessionEnded = true;
      this.stopSmartScriptPolling();
      this.smartScriptVisible = false;
      await Promise.all([this.saveCallTranscriptDetailOnCallEnd(), this.onCallEnd({ isHangUp: true })]);
    },
    /** 提交前若通话未正常结束，补调结束接口 */
    async finalizeCallOnSubmitIfNeeded() {
      if (!this.isCallAnswered()) return;
      if (this.callStartPromise) {
        await this.callStartPromise;
      }
      if (this.callEndHandled || this.callQualityRecordLinked) return;
      this.callEndHandled = true;
      await this.onCallEnd();
    },
    async onCallStart() {
      if (!this.isCallAnswered()) return;
      try {
        const res = await saveCallQualityWorkOrder({
          workOrderId: this.form.workOrderId,
          entryChannel: this.form.entryChannel,
          consumerName: this.form.name,
          mediatorUserName: this.$store.getters.userInfo.nickName,
          mediatorUserId: this.getCallQualityMediatorUserId(),
          consumerPhone: this.form.phone
        });
        if (res && res.code === 200 && res.data && res.data.id != null) {
          this.callQualityWorkOrderId = res.data.id;
        }
      } catch (e) {
        console.error('保存通话质检工单失败:', e);
      }
    },
    /** 更新通话质检工单（仅已接听且有工单 id 时调用） */
    async updateCallQualityWorkOrderForAddMediation({ recordId = '', recordTime = '', isSubmit = false, isHangUp = false, workOrderId } = {}) {
      if (!this.shouldRunCallQualityLogic()) return;
      const id = this.callQualityWorkOrderId;
      try {
        const payload = {
          id,
          mediatorUserId: this.getCallQualityMediatorUserId(),
          recordType: 'addMediation'
        };
        if (isSubmit) {
          payload.workOrderId = workOrderId != null ? String(workOrderId) : '';
          payload.consumerName = this.form.name ?? '';
          payload.consumerPhone = this.form.phone ?? '';
          payload.entryChannel = this.form.entryChannel ?? '';
        } else {
          payload.recordId = recordId != null ? String(recordId) : '';
          payload.recordTime = recordTime != null ? String(recordTime) : '';
          if (isHangUp) {
            payload.callEndFlag = '10';
          }
        }
        await updateCallQualityWorkOrder(payload);
      } catch (e) {
        console.error('更新通话质检工单失败:', e);
      }
    },
    async onCallEnd({ isHangUp = false } = {}) {
      if (!this.shouldRunCallQualityLogic() || this.callQualityRecordLinked) return;
      await this.updateCallQualityWorkOrderForAddMediation({ recordId: '', recordTime: '', isHangUp });
    },
    isMessageComplete(complete) {
      return complete === true || complete === 'true';
    },
    /** 追加 ASR run 消息（未完成条目续写，已完成则新开一条并记录时间） */
    appendSseRunMessage(list, role, message, complete) {
      const now = Date.now();
      let lastIndex = list.findLastIndex(item => item.role === role && !this.isMessageComplete(item.complete));
      if (lastIndex !== -1 && list.slice(lastIndex + 1).some(item => item.role !== role)) {
        lastIndex = -1;
      }
      if (lastIndex !== -1) {
        list[lastIndex] = { ...list[lastIndex], role, message, complete };
      } else {
        list.push({ role, message, complete, timestamp: now });
      }
    },
    getCompletedSseContent() {
      return this.sseList.filter(d => d && (d.complete === true || d.complete === 'true'));
    },
    mapRoleToTranscriptRole(role) {
      return role === '投诉人' ? 'consumer' : 'mediator';
    },
    formatTranscriptTimestamp(ts) {
      const date = ts != null ? new Date(ts) : new Date();
      if (Number.isNaN(date.getTime())) {
        return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      }
      return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    },
    buildCallTranscriptMessages() {
      return this.getCompletedSseContent()
        .filter(d => String(d.message || '').trim())
        .map(d => ({
          role: this.mapRoleToTranscriptRole(d.role),
          content: String(d.message || '').trim(),
          timestamp: this.formatTranscriptTimestamp(d.timestamp)
        }));
    },
    /** 通话结束（ASR end）时保存转写，仅调用一次 */
    async saveCallTranscriptDetailOnCallEnd() {
      if (!this.shouldRunCallQualityLogic() || this.callTranscriptDetailSaved) return;
      const messages = this.buildCallTranscriptMessages();
      if (!messages.length) return;
      this.callTranscriptDetailSaved = true;
      try {
        await saveCallTranscriptDetail({
          callQualityWorkId: this.callQualityWorkOrderId,
          workOrderId: this.form.workOrderId,
          mediatorUserId: this.getCallQualityMediatorUserId(),
          messages
        });
      } catch (e) {
        this.callTranscriptDetailSaved = false;
        console.error('保存通话转写详情失败:', e);
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

    // 3. 处理级联选择器的 change 事件
    handleAreaChange(value) {
      this.financialServiceArea = value;
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
  margin-bottom: 10px;
}

.dispute-dialog ::v-deep .el-dialog__header {
  padding: 0;
}

.dispute-dialog ::v-deep .el-dialog__body {
  padding-top: 0;
}

.dispute-dialog ::v-deep .el-dialog {
  max-width: 1680px;
  transition: width 0.25s ease;
}

.dispute-wrapper {
  display: flex;
  align-items: stretch;
  min-height: 480px;

  .dispute-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    transition: flex 0.25s ease;
  }

  .dialog-script {
    width: 360px;
    flex-shrink: 0;
    margin-left: 12px;
    padding-left: 12px;
    border-left: 1px solid #d9e2ef;
    display: flex;
    flex-direction: column;
    animation: script-column-in 0.28s ease-out;
  }
}

@keyframes script-column-in {
  from {
    opacity: 0;
    transform: translateX(12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.recognize-records-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;

  .recognize-records-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
    cursor: default;
  }

  .recognize-record-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    margin-bottom: 6px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    background: #fff;

    &:hover {
      border-color: #409eff;
    }

    &.active {
      border-color: #0958d9;
      background: #ecf5ff;
    }

    .record-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .record-time {
      color: #909399;
      font-size: 12px;
      flex-shrink: 0;
    }

    .record-delete {
      flex-shrink: 0;
      padding: 0;
    }
  }

  &.asr-records {
    margin: 10px 0;
    padding: 0 4px;
  }
}

.right-t {
  .dispute-date-form-item {
    width: 100%;
  }

  ::v-deep .dispute-date-picker.el-date-editor {
    width: 100%;
  }

  .consumer-info-wrap {
    .is-self-row {
      padding-top: 16px;
      margin-bottom: 12px;

      .el-form-item {
        margin-bottom: 0;
      }
    }

    .right-section-block {
      margin-bottom: 12px;
    }

    .agent-section-block {
      padding-bottom: 18px;
      margin-bottom: 18px;
      border-bottom: 1px solid #dcdfe6;
    }

    .agent-fields-grid {
      .agent-field-row {
        border-bottom: none;
        padding-bottom: 18px;
        margin-bottom: 18px;

        .el-form-item {
          margin-bottom: 0;
        }
      }

      .agent-field-row-last {
        padding-bottom: 0;
        margin-bottom: 0;
      }

      ::v-deep .el-input,
      ::v-deep .el-select,
      ::v-deep .el-date-editor {
        width: 100%;
      }

      ::v-deep .el-input__inner {
        width: 100%;
      }

      .agent-phone-item {
        ::v-deep .el-form-item__content {
          flex: 1;
          min-width: 0;
        }

        ::v-deep .el-input {
          width: 100%;
          max-width: 100%;
        }
      }
    }

    .cert-column-fields {
      margin-bottom: 18px;
      padding-bottom: 18px;
      border-bottom: 1px solid #dcdfe6;

      .el-form-item {
        margin-bottom: 16px;
      }

      .el-form-item:last-child {
        margin-bottom: 0;
      }

      ::v-deep .el-input,
      ::v-deep .el-select {
        width: 100%;
      }
    }
  }
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
    display: flex;
    flex-direction: column;

    .right-t {
      .region-title {
        color: #dcdfe6;
        margin: 20px 0;
        font-size: 18px;
      }

      .confirm-btn {
        display: flex;
        justify-content: center;
        padding-bottom: 8px;

        button {
          background: #0958d9;
          color: #fff;

          &:hover {
            color: #fff;
          }
        }
      }

      .smart-script-trigger {
        display: flex;
        justify-content: flex-end;
        padding: 0 4px 10px;
        margin-bottom: 10px;
        border-bottom: 2px solid #ccc;

        .el-button {
          border-radius: 4px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
      }

      .line-row {
        border-bottom: 1px solid #dcdfe6;
        padding-bottom: 18px;
        margin-bottom: 18px;

        &.agent-field-row {
          border-bottom: none;
        }

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }

    .right-b {
      overflow: hidden;
      flex: 1;
      min-height: 120px;

      .right-b-chat {
        height: 100%;
        overflow-y: auto;
        padding-right: 4px;
      }

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
