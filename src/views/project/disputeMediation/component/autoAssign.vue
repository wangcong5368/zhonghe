<!-- 自动分配表 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="1000px" append-to-body>
    <el-tabs v-model="activeName" :stretch="true">
      <el-tab-pane label="银行" name="bank">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="已指派表" name="assignedList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.bankAssignedList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.bankAssignedList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
          <el-collapse-item title="待指派表" name="toAssignList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.bankToAssignList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.bankToAssignList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
          <el-collapse-item title="优先表" name="priorityList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.bankPriorityList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.bankPriorityList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
          <el-collapse-item title="轮空表" name="passList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.bankPassList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.bankPassList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane label="保险" name="insurance">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="已指派表" name="assignedList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.insuranceAssignedList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.insuranceAssignedList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
          <el-collapse-item title="待指派表" name="toAssignList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.insuranceToAssignList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.insuranceToAssignList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
          <el-collapse-item title="优先表" name="priorityList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.insurancePriorityList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.insurancePriorityList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
          <el-collapse-item title="轮空表" name="passList">
            <el-empty description="暂无数据" :image-size="1" v-if="data.insurancePassList.length === 0" style="padding: 0"/>
            <el-tag v-for="(item, index) in data.insurancePassList" :key="index" style="margin: 5px 5px 5px 5px;">
              {{ item }}
            </el-tag>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { autoAssign } from "@/api/project/disputeMediation";
export default {
  data() {
    return {
      title: "自动分配表",
      visible: false,
      activeName: "bank",
      activeNames: ["assignedList", "toAssignList", "priorityList", "passList"],
      data: {
        bankAssignedList: [],
        bankToAssignList: [],
        bankPriorityList: [],
        bankPassList: [],
        insuranceAssignedList: [],
        insuranceToAssignList: [],
        insurancePriorityList: [],
        insurancePassList: [],
      },
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
    open() {
      autoAssign().then(response => {
        this.data = response.data;
        this.visible = true;
      })
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
</style>
