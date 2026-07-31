<!-- 银行模板1 -->
<template>
  <div style="font-size: 16px; line-height: 48px">
    <p style="text-align:center;font-size: 18px;"><strong>天津市保险业人民调解委员会调解协议书（合议制）</strong></p>

    <p style="justify-content: flex-end;display: flex;">
      <strong>编号</strong>
      <el-input :disabled="disabled" v-model="data.workOrderId" style="width: 200px;"/>
    </p>

    <p>
      <span>当事人：</span>
      <el-input :disabled="disabled" v-model="data.name" style="width: 150px;"/>
      <span>，性别：</span>
      <el-input :disabled="disabled" v-model="data.sex" style="width: 50px;"/>
      <span>，民族：</span>
      <el-input :disabled="disabled" v-model="data.nation" style="width: 100px;"/>
      <span>，身份证号：</span>
      <el-input :disabled="disabled" v-model="data.certNum" style="width: 200px;"/>
      <span>，住址：</span>
      <el-input :disabled="disabled" v-model="data.address" style="width: 500px;"/>
      <span>，联系电话：</span>
      <el-input :disabled="disabled" v-model="data.phone" style="width: 150px;"/>
    </p>

    <p>
      <span>当事人：</span>
      <el-input :disabled="disabled" v-model="data.deptName" style="width: 300px;"/>
    </p>

    <p>
      <span>负责人：</span>
      <el-input :disabled="disabled" v-model="data.responsiblePerson" style="width: 300px;"/>
      <span>，职务：</span>
      <el-input :disabled="disabled" v-model="data.post" style="width: 200px;"/>
    </p>

    <p>
      <span>代理人：</span>
      <el-input :disabled="disabled" v-model="data.deptContact" style="width: 150px; margin-right: 10px;"/>
      <span>，授权级别：</span>
      <el-input :disabled="disabled" v-model="data.level" style="width: 200px; margin-right: 10px;"/>
      <span>，身份证号码：</span>
      <el-input :disabled="disabled" v-model="data.deptContactCertNum" style="width: 200px; margin-right: 10px;"/>
    </p>

    <p>
      <span>住所地：</span>
      <el-input :disabled="disabled" v-model="data.deptAddress" style="width: 500px; margin-right: 10px;"/>
    </p>

    <p>
      <span style="margin-left: 35px;">主要事实：当事人</span>
      <el-input :disabled="disabled" v-model="data.name" style="width: 150px;"/>
      <span>于</span>
      <el-input :disabled="disabled" v-model="data.insureDate" style="width: 200px;"/>
      <span>投保</span>
      <el-input :disabled="disabled" v-model="data.deptName" style="width: 300px;"/>
      <span>保险公司</span>
      <el-input :disabled="disabled" v-model="data.product" style="width: 300px;"/>
      <span>保险，保险单号：</span>
      <el-input :disabled="disabled" v-model="data.contract" style="width: 200px;"/>
      <span>。投保人：</span>
      <el-input :disabled="disabled" v-model="data.policyholder" style="width: 180px;"/>
      <span>，被保险人：</span>
      <el-input :disabled="disabled" v-model="data.insured" style="width: 200px;"/>
      <span>，年交保费：</span>
      <el-input :disabled="disabled" v-model="data.expenses" style="width: 180px;"/>
      <span>元，已交费</span>
      <el-input :disabled="disabled" v-model="data.paid" style="width: 100px;"/>
      <span>年，合计交费：</span>
      <el-input :disabled="disabled" v-model="data.total" style="width: 200px;"/>
      <span>元。保险期间：</span>
      <el-input :disabled="disabled" v-model="data.duration" style="width: 180px;"/>
      <span>。当事人</span>
      <el-input :disabled="disabled" v-model="data.name" style="width: 100px;"/>
      <span>向保险公司申请退保，但不认可保单现金价值，要求保险公司补偿退保损失。</span>
    </p>

    <p>
      <span style="margin-left: 35px;">争议焦点：</span>
      <el-input :disabled="disabled" type="textarea" :autosize="{ minRows: 3}" show-word-limit v-model="data.focus" style="width: calc(100% - 120px)"/>
    </p>

    <p>
      <span style="margin-left: 35px;">现经调解，双方在互谅互让基础上自愿达成如下协议：</span>
    </p>

    <p>
      <el-input :disabled="disabled" type="textarea" :autosize="{ minRows: 3}" show-word-limit v-model=" data.content"
                @blur="addSpaceToTextarea(data,'content')" @change="addSpaceToTextarea(data,'content')"
                style="width: 100%;"/>
    </p>

    <p>
      <span style="margin-left: 35px;">双当事人均承诺：以上协议，系双方出于解决纠纷的目的自愿达成，没有恶意串通、规避法律的行为、无重大误解及显失公平情形；如果因为该协议内容而给他人造成损害的，愿意承担相应的民事责任和其他法律责任。</span>
    </p>

    <p>
      <span style="margin-left: 35px;">上述协议经双方当事人签字后，即具有法律效力。</span>
    </p>

    <p>
      <span style="margin-left: 35px;">本协议一式叁份，申请人双方、调解委员会各持一份。</span>
    </p>


    <p>
      <span style="margin-left: 35px;">当事人：<div style="width: 200px;display: inline-block;"/></span>
      <span>当事人：<div style="width: 200px;display: inline-block;"/></span>
    </p>

    <p>
      <span style="margin-left: 35px;">日　期：<div style="width: 215px;display: inline-block;"/></span>
      <span>日　期：<div style="width: 200px;display: inline-block;"/></span>
    </p>

    <p>
      <span>主持调解员：</span>
    </p>

    <p>
      <span>调　解　员：</span>
    </p>

    <div style="display:flex;flex-direction: column;align-items: flex-end;margin-bottom: 20px;">
      <div style="display: flex;flex-direction: column;align-items: center;">
        <p class="MsoNormal">（天津市保险业人民调解委员会调解专用章）</p>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  props: {
    disabled: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      data: {
        workOrderId: "",

        name: "",
        sex: "",
        nation: "",
        certNum: "",
        address: "",
        phone: "",

        deptName: "",
        responsiblePerson: "",
        post: "",
        deptContact: "",
        level: "",
        deptContactCertNum: "",
        deptAddress: "",

        insureDate: "",
        product: "",
        contract: "",
        policyholder: "",
        insured: "",
        expenses: "",
        paid: "",
        total: "",
        duration: "",

        focus: "",
        content: ""
      },
    }
  },
  computed: {},
  watch: {
    data: {
      handler(newVal, oldVal) {
        this.$emit('changeData', newVal)
      },
      deep: true,
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    reset() {
      this.data = {
        workOrderId: "",

        name: "",
        sex: "",
        nation: "",
        certNum: "",
        address: "",
        phone: "",

        deptName: "",
        responsiblePerson: "",
        post: "",
        deptContact: "",
        level: "",
        deptContactCertNum: "",
        deptAddress: "",

        insureDate: "",
        product: "",
        contract: "",
        policyholder: "",
        insured: "",
        expenses: "",
        paid: "",
        total: "",
        duration: "",

        focus: "",
        content: ""
      };
    },
    init(row, dict) {
      this.reset();
      const sexMap = new Map(dict.type.sys_user_sex.map(item => [item.value, item.label]))
      if (row.agreement && row.agreement.parameter && row.agreement.parameter !== '{}') {
        this.data = JSON.parse(row.agreement.parameter)
      } else {
        // 如果满足条件，则覆盖同名变量
        for (let key in this.data) {
          if (row[key] !== null && row[key] !== undefined) {
            this.data[key] = row[key];
            if (key === 'sex' || key === 'deptContactSex') {
              this.data[key] = sexMap.get(row[key]);
            }
          }
        }
      }
    },
    update(data) {
      this.reset();
      for (let key in data) {
        if (key in this.data) {
          this.data[key] = data[key];
        }
      }
    },
    /** 给textarea文本域段落行首添加空格 */
    addSpaceToTextarea(object, columnName) {
      if (object[columnName]) {
        object[columnName] = object[columnName].replace(/^(\s*)(.*)$/gm, (match, spaces, content) => {
          return spaces.length !== 2 ? '    ' + content : match;
        });
      }
    },
  },
}

</script>
