<!-- 银行模板1 -->
<template>
  <div style="font-size: 16px; line-height: 48px">
    <p style="text-align:center;font-size: 18px;"><strong>人民调解协议书</strong></p>

    <p style="justify-content: flex-end;display: flex;">
      <strong>编号</strong>
      <el-input :disabled="disabled" v-model="data.workOrderId" style="width: 200px;"/>
    </p>

    <p>
      <span style="margin-left: 35px;">当事人姓名</span>
      <el-input :disabled="disabled" v-model="data.name" style="width: 150px; margin-right: 10px;"/>
      <span>性别</span>
      <el-input :disabled="disabled" v-model="data.sex" style="width: 50px; margin-right: 10px;"/>
      <span>民族</span>
      <el-input :disabled="disabled" v-model="data.nation" style="width: 100px; margin-right: 10px;"/>
      <span>年龄</span>
      <el-input :disabled="disabled" v-model="data.age" style="width: 80px; margin-right: 10px;"/>
      <span>联系方式</span>
      <el-input :disabled="disabled" v-model="data.phone" style="width: 150px; margin-right: 10px;"/>
      <span>身份证号</span>
      <el-input :disabled="disabled" v-model="data.certNum" style="width: 200px; margin-right: 10px;"/>
      <span>职业或职务</span>
      <el-input :disabled="disabled" v-model="data.profession" style="width: 200px; margin-right: 10px;"/>
      <span>单位或住址</span>
      <el-input :disabled="disabled" v-model="data.address" style="width: 500px; margin-right: 10px;"/>
    </p>

    <p>
      <span style="margin-left: 35px;">当事人姓名（机构）</span>
      <el-input :disabled="disabled" v-model="data.deptName" style="width: 300px; margin-right: 10px;"/>
      <span>委派/委托代表姓名</span>
      <el-input :disabled="disabled" v-model="data.deptContact" style="width: 150px; margin-right: 10px;"/>
      <span>性别</span>
      <el-input :disabled="disabled" v-model="data.deptContactSex" style="width: 100px; margin-right: 10px;"/>
      <span>民族</span>
      <el-input :disabled="disabled" v-model="data.deptContactNation" style="width: 100px; margin-right: 10px;"/>
      <span>年龄</span>
      <el-input :disabled="disabled" v-model="data.deptContactAge" style="width: 80px; margin-right: 10px;"/>
      <span>身份证号</span>
      <el-input :disabled="disabled" v-model="data.deptContactCertNum" style="width: 200px; margin-right: 10px;"/>
      <span>联系方式</span>
      <el-input :disabled="disabled" v-model="data.deptContactPhone" style="width: 150px; margin-right: 10px;"/>
      <span>职业或职务</span>
      <el-input :disabled="disabled" v-model="data.deptContactPosition" style="width: 200px; margin-right: 10px;"/>
      <span>单位或住址</span>
      <el-input :disabled="disabled" v-model="data.deptContactAddress" style="width: 500px; margin-right: 10px;"/>
    </p>

    <p>
      <span style="margin-left: 35px;">消费者</span>
      <el-input :disabled="disabled" v-model="data.name" style="width: 150px;"/>
      <span>与</span>
      <el-input :disabled="disabled" v-model="data.deptName" style="width: 300px;"/>
      <span>（以下简称“</span>
      <el-input :disabled="disabled" v-model="data.deptShortName" style="width: 200px;"/>
      <span>”） 就消费者</span>
      <el-input :disabled="disabled" v-model="data.business" style="width: 200px;"/>
      <span>产生的纠纷，交由天津市银行业保险业人民调解委员会（以下简称“银保调委”）调解，在人民调解员</span>
      <el-input :disabled="disabled" v-model="data.mediatorName" style="width: 200px;"/>
      <span>主持调解下，争议双方经友好协商，在平等自愿的基础上，达成如下协议：</span>
    </p>

    <p>
      <el-input :disabled="disabled" type="textarea" :autosize="{ minRows: 3}" show-word-limit v-model=" data.content"
                @blur="addSpaceToTextarea(data,'content')" @change="addSpaceToTextarea(data,'content')"
                style="width: 100%;"/>
    </p>

    <p>
      <span style="margin-left: 35px;">履行方式、时限</span>
      <el-input :disabled="disabled" v-model="data.deadline" style="width: 200px;"/>
    </p>

    <p>
      <span>本协议一式<span style="border-bottom: 1px solid"> 叁 </span>份，当事人、人民调解委员会各持一份。</span>
    </p>

    <p>
      <span>当事人（签名盖章或按指印）<div style="width: 200px;border-bottom: 1px solid; display: inline-block; margin-bottom: -5px"/></span>
      <span>人民调解员（签名）<div style="width: 200px;border-bottom: 1px solid; display: inline-block; margin-bottom: -5px"/></span>
    </p>

    <p>
      <span>当事人（签名盖章或按指印）<div style="width: 200px;border-bottom: 1px solid; display: inline-block; margin-bottom: -5px"/></span>
      <span>记录人（签名）<div style="width: 200px;border-bottom: 1px solid; display: inline-block; margin-bottom: -5px"/></span>
    </p>

    <div style="display:flex;flex-direction: column;align-items: flex-end;margin-bottom: 20px;">
      <div style="display: flex;flex-direction: column;align-items: center;">
        <p class="MsoNormal">（天津市银行业协会人民调解委员会印章）</p>
        <div style="display: flex; line-height: 16px">
          <div style="width: 50px;border-bottom: 1px solid;"/>
          年
          <div style="width: 50px;border-bottom: 1px solid;"/>
          月
          <div style="width: 50px;border-bottom: 1px solid;"/>
          日
        </div>
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
        age: "",
        phone: "",
        certNum: "",
        profession: "",
        address: "",

        deptName: "",
        deptContact: "",
        deptContactSex: "",
        deptContactNation: "",
        deptContactAge: "",
        deptContactCertNum: "",
        deptContactPhone: "",
        deptContactPosition: "",
        deptContactAddress: "",

        deptShortName: "",
        business: "",
        mediatorName: "",
        content: "",
        deadline: "",
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
        age: "",
        phone: "",
        certNum: "",
        profession: "",
        address: "",

        deptName: "",
        deptContact: "",
        deptContactSex: "",
        deptContactNation: "",
        deptContactAge: "",
        deptContactCertNum: "",
        deptContactPhone: "",
        deptContactPosition: "",
        deptContactAddress: "",

        deptShortName: "",
        business: "",
        mediatorName: "",
        content: "",
        deadline: "",
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
