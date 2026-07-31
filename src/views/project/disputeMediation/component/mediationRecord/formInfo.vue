<template>
  <div>
    <el-form :model="formInfo" :rules="rules" ref="ruleForm" label-width="135px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="地点" prop="place" :rules="[{required: !this.isEdit && true, message: '请选择地点', trigger: 'change'}]">
            <el-select v-model="formInfo.place" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请选择地点'" style="width: 100%" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" clearable>
              <el-option v-for="dict in dict.type.dm_investigation_place" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调解时间" prop="time"
                        :rules="[{required: !this.isEdit && true, message: '请选择调解时间', trigger: 'change'}]">
            <el-date-picker
              v-model="formInfo.time"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请选择调解时间'"
              :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit"
              style="width: 100%"
              clearable
              :picker-options="{
                disabledDate(time) {
                  // 禁用所有小于当前日期的日期
                  return time.getTime() > Date.now();
                }
              }"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="当事人" prop="dsr">
            <el-input v-model="dsr" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消费者姓名" prop="name">
            <el-input v-model="row.name" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="phone">
            <el-input v-model="row.phone" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构名称" prop="deptName">
            <el-input v-model="row.deptName" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机构委托代表姓名" prop="deptContact">
            <el-input v-model="row.deptContact" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所在部门及职务" prop="deptContactPosition">
            <el-input v-model="row.deptContactPosition" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="deptContactPhone">
            <el-input v-model="row.deptContactPhone" disabled/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="参加人" prop="participant" :rules="[{required: !this.isEdit && true, message: '请输入参加人', trigger: 'blur'}]">
            <el-input :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请输入参加人'" v-model="formInfo.participant" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" maxlength="50" show-word-limit clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="调解记录" prop="record" :rules="[{required: !this.isEdit && true, message: '请输入调解记录', trigger: 'blur'}]">
            <el-input type="textarea" v-model="formInfo.record" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请输入调解记录'" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" :autosize="{ minRows: 3}" maxlength="2000" show-word-limit clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调解结果" prop="result" :rules="[{required: !this.isEdit && true, message: '请选择调解结果', trigger: 'change'}]">
            <el-select v-model="formInfo.result" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请选择调解结果'" style="width: 100%" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" clearable>
              <el-option v-for="dict in dict.type.dm_mediation_result" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调解金额" prop="mediationAmount">
            <el-input
              v-model="formInfo.mediationAmount"
              :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit ? '' : '请输入调解金额'"
              :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit"
              oninput="value=value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/^(\d*\.\d{0,2}).*$/g, '$1')"
              clearable
            >
              <template slot="append">元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否回访" prop="needReturnVisit" v-if="formInfo.result === DM_MEDIATION_RESULT.success" clearable :rules="[{required: !this.isEdit && true, message: '请选择是否回访', trigger: 'change'}]">
            <el-select v-model="formInfo.needReturnVisit" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请选择是否回访'" style="width: 100%" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit">
              <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="调解失败原因" prop="failReason" v-if="formInfo.result === DM_MEDIATION_RESULT.fail" :rules="[{required: !this.isEdit && true, trigger: 'blur', message: '请填写调解失败原因'}]">
            <el-input type="textarea" v-model="formInfo.failReason" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请输入调解失败原因'" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" :autosize="{ minRows: 3}" maxlength="2000" show-word-limit clearable/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否申请司法确认" prop="isApplyJudicialCheck" :rules="[{required: !this.isEdit && true, message: '请选择是否申请司法确认', trigger: 'change'}]">
            <el-select v-model="formInfo.isApplyJudicialCheck" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请选择是否申请司法确认'" style="width: 100%" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" clearable>
              <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否获得司法确认" prop="isGetJudicialCheck" :rules="[{ required: formInfo.isApplyJudicialCheck === SYS_YES_NO.sys_yes, trigger: 'change', message: '请选择是否获得司法确认'}]">
            <el-select v-model="formInfo.isGetJudicialCheck" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请选择是否获得司法确认'" style="width: 100%" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" clearable>
              <el-option v-for="dict in dict.type.sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="调解过程中发现的其他问题" prop="otherProblem">
            <el-input type="textarea" v-model="formInfo.otherProblem" :placeholder="DM_STATUS.DM_STATUS10 === this.row.status || isEdit?'':'请输入调解过程中发现的其他问题'" :disabled="DM_STATUS.DM_STATUS10 === this.row.status || isEdit" :autosize="{ minRows: 3}" maxlength="1000" show-word-limit clearable/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="消费者证件正反照" prop="consumerIdentificationPhoto">
        <file-upload v-if="!isEdit || formInfo.consumerIdentificationPhoto" v-model="formInfo.consumerIdentificationPhoto" :isShowDele="!isEdit" :isShowBtn="!isEdit" :isShowTip="!isEdit" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]" :limit="2"/>
        <span v-else>无</span>
      </el-form-item>

      <el-form-item label="机构证件正反照" prop="institutionIdentificationPhoto">
        <file-upload v-if="!isEdit || formInfo.institutionIdentificationPhoto" v-model="formInfo.institutionIdentificationPhoto" :isShowDele="!isEdit" :isShowBtn="!isEdit" :isShowTip="!isEdit" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]" :limit="2"/>
        <span v-else>无</span>
      </el-form-item>

      <el-form-item label="现场照片" prop="scenePhoto">
        <file-upload v-if="!isEdit || formInfo.scenePhoto" v-model="formInfo.scenePhoto" :isShowDele="!isEdit" :isShowBtn="!isEdit" :isShowTip="!isEdit" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]"/>
        <span v-else>无</span>
      </el-form-item>

      <el-form-item label="附件" prop="attachment">
        <file-upload v-if="!isEdit || formInfo.attachment" v-model="formInfo.attachment" :isShowDele="!isEdit" :isShowBtn="!isEdit" :isShowTip="!isEdit" :fileType="['bmp', 'jpg', 'jpeg', 'png', 'tif', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'mp4', 'avi', 'rmvb', 'flv', 'm4v', 'mov', '3gp', '3g2', 'wmv', 'mpg', 'mpeg','cd', 'wave', 'aiff', 'mp3', 'wav',]"/>
        <span v-else>无</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {DM_MEDIATION_RESULT, DM_STATUS, SYS_YES_NO} from '@/views/constant/CommonConstant.js';

export default {
  name: '',
  dicts: ['dm_investigation_place', 'dm_mediation_result', 'sys_yes_no'],
  props: {
    initialData: {
      type: Object,
      default: () => {
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => {
      }
    },
  },
  data() {
    return {
      DM_STATUS: DM_STATUS, // 纠纷业务状态
      DM_MEDIATION_RESULT: DM_MEDIATION_RESULT, // 纠纷业务调解结果
      SYS_YES_NO: SYS_YES_NO, // 纠纷业务调解结果
      dsr: null,
      formInfo: {
        time: null,
        // 参加人
        participant: null,
        // 地点
        place: null,
        // 调解记录
        record: null,
        // 调解结果
        result: null,
        // 是否回访
        needReturnVisit: null,
        // 调解金额
        mediationAmount: null,
        // 是否获得司法确认
        isGetJudicialCheck: null,
        // 是否申请司法确认
        isApplyJudicialCheck: null,
        // 调解失败原因
        failReason: null,
        // 其他问题
        otherProblem: null,
        // 消费者证件照片
        consumerIdentificationPhoto: null,
        // 机构证件照片
        institutionIdentificationPhoto: null,
        // 现场照片
        scenePhoto: null,
        // 附件
        attachment: null,
      },

      dialogImgVisible: false,
      dialogImageUrl: null,
      rules: {
      }
    };
  },

  watch: {
    row: {
      handler(newVal) {
        this.dsr = newVal.deptContact ? newVal.name + ',' + newVal.deptContact : newVal.name;
      },
      immediate: true,
      deep: true
    },
    initialData: {
      handler(newVal) {
        this.formInfo = {
          ...this.formInfo,
          ...newVal
        };

        // if (!this.formInfo.mediationRecordId && !this.formInfo.time) {
        //   this.formInfo.time = new Date();
        // }

        this.formInfo.dsr = newVal.deptContact ? newVal.name + ',' + newVal.deptContact : newVal.name;
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // 表单验证
    validateForm() {
      return this.$refs.ruleForm.validate();
    },

    // 取消验证结果
    resetValidateForm(){
      this.$refs.ruleForm.clearValidate();
    },

    // 重置表单
    resetForm() {
      this.$refs.ruleForm.resetFields();
    },

    // 获取表单数据
    getFormData() {
      return this.formInfo;
    },

    setFormInfo(data) {
      this.formInfo = { ...this.formInfo, ...data };
    },

    // 刷新时间
    refreshTime() {
      this.formInfo.time = new Date();
    },
  }
};
</script>

<style scoped lang="scss">
.respondentSelect ::v-deep .el-input {
  width: 100px;
}

.input-with-select ::v-deep .el-input-group__prepend {
  background-color: #fff;
}

.image-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .images {
    width: 150px;
    height: 150px;
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
  }
}
</style>
