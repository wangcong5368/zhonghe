<template>
  <section class="party-info">
    <div class="party-info__header">
      <div>
        <i class="el-icon-user-solid" />
        <span>双方信息</span>
      </div>
      <span class="party-info__tip">点击电话按钮可直接发起回访</span>
    </div>

    <el-descriptions :column="2" border size="small" class="party-info__descriptions">
      <el-descriptions-item label="消费者姓名">
        {{ displayValue(row.name) }}
      </el-descriptions-item>
      <el-descriptions-item label="消费者联系方式">
        <span>{{ displayValue(row.phone) }}</span>
        <el-button v-if="row.phone" class="phone-button" type="success" icon="el-icon-phone" circle size="mini"
          @click="dial(row.phone)" />
      </el-descriptions-item>

      <template v-if="row.agentName || row.agentPhone">
        <el-descriptions-item label="消费者代理人姓名">
          {{ displayValue(row.agentName) }}
        </el-descriptions-item>
        <el-descriptions-item label="消费者代理人联系方式">
          <span>{{ displayValue(row.agentPhone) }}</span>
          <el-button v-if="row.agentPhone" class="phone-button" type="success" icon="el-icon-phone" circle size="mini"
            @click="dial(row.agentPhone)" />
        </el-descriptions-item>
      </template>

      <el-descriptions-item label="机构联系人">
        {{ displayValue(row.deptLeader) }}
      </el-descriptions-item>
      <el-descriptions-item label="机构联系电话">
        <span>{{ displayValue(row.deptPhone) }}</span>
        <el-button v-if="row.deptPhone" class="phone-button" type="success" icon="el-icon-phone" circle size="mini"
          @click="dial(row.deptPhone)" />
      </el-descriptions-item>

      <el-descriptions-item label="机构代表姓名">
        {{ displayValue(row.deptContact) }}
      </el-descriptions-item>
      <el-descriptions-item label="机构代表联系方式">
        <span>{{ displayValue(row.deptContactPhone) }}</span>
        <el-button v-if="row.deptContactPhone" class="phone-button" type="success" icon="el-icon-phone" circle size="mini"
          @click="dial(row.deptContactPhone)" />
      </el-descriptions-item>

      <template v-if="row.deptHandlerName || row.deptHandlerPhone">
        <el-descriptions-item label="机构业务经办人员">
          {{ displayValue(row.deptHandlerName) }}
        </el-descriptions-item>
        <el-descriptions-item label="机构业务经办人员联系电话">
          <span>{{ displayValue(row.deptHandlerPhone) }}</span>
          <el-button v-if="row.deptHandlerPhone" class="phone-button" type="success" icon="el-icon-phone" circle size="mini"
            @click="dial(row.deptHandlerPhone)" />
        </el-descriptions-item>
      </template>
    </el-descriptions>
  </section>
</template>

<script>
export default {
  name: 'CallbackPartyInfo',
  props: {
    row: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    displayValue(value) {
      return value || '--';
    },
    dial(dialNumber) {
      this.$store.dispatch('settings/setCallInfoOpen', {
        open: true,
        workOrderId: this.row.workOrderId,
        dialNumber
      });
    }
  }
};
</script>

<style scoped lang="scss">
.party-info {
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.party-info__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;

  i {
    margin-right: 7px;
    color: #409eff;
  }
}

.party-info__tip {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.party-info__descriptions ::v-deep .el-descriptions-item__label {
  width: 170px;
  color: #606266;
  background: #f7f9fc;
}

.party-info__descriptions ::v-deep .el-descriptions-item__content {
  min-width: 180px;
  color: #303133;
}

.phone-button {
  margin-left: 8px;
  vertical-align: middle;
}
</style>
