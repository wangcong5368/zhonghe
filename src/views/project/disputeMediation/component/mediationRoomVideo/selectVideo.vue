<!-- 选择调解室录像  -->
<template>
  <el-dialog title="选择关联调解室录像" :visible.sync="visible" append-to-body width="1000px" @close="handleDialogClose">
    <el-table v-loading="loading" :data="list" highlight-current-row @current-change="handleCurrentChange" :row-class-name="rowClassName">
      <el-table-column label="序号" type="index" align="center" width="50px">
        <template slot-scope="scope">
          <i class="el-icon-success" style="color: lightgreen;margin-right: 3px" v-if="disableIds.includes(scope.row.mediationRoomVideoId)"/>
          <span>{{
              (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1
            }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" property="mediationRoomName" label="调解室名称"/>
      <el-table-column align="center" property="camera" label="摄像头"/>
      <el-table-column align="center" property="startTime" label="起始时间"/>
      <el-table-column align="center" property="endTime" label="结束时间"/>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit" :disabled="!currentRow">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mediationRoomVideoList } from "@/api/project/disputeMediation";

export default {
  name: '',
  props: {
    disableIds: {
      type: Array,
      default: () => []
    },
  },
  components: {},
  data() {
    return {
      visible: false,
      list: null,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        workOrderId: undefined,
      },
      // 总条数
      total: 0,
      loading: true,
      // 当前选中的row
      currentRow: null,
      // 正在播放的video下标
      currentPlayingIndex: null,
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(workOrderId) {
      this.queryParams.workOrderId = workOrderId;
      this.visible = true;
      this.getList();
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    getList() {
      this.onPlay(null);
      this.loading = true;
      mediationRoomVideoList(this.queryParams).then(response => {
        this.list = null;
        this.$nextTick(() => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        })
      });
    },

    // 关闭时清空列表
    handleDialogClose() {
      this.list = null;
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        workOrderId: undefined,
      };
    },

    handleCurrentChange(val) {
      this.currentRow = val;
    },

    onPlay(index) {
      // 如果有视频正在播放，暂停它
      if (this.currentPlayingIndex !== null && this.currentPlayingIndex !== index) {
        const video = this.$refs['videoRef' + this.currentPlayingIndex]
        if (video) {
          video.pause()
        }
      }
      this.currentPlayingIndex = index;
    },

    rowClassName({ row, rowIndex }) {
      // 根据禁用行的条件设置行的样式
      if (this.disableIds.includes(row.mediationRoomVideoId)) {
        return 'disabled-row';  // 添加禁用行的样式类
      }
      return '';
    },

    submit() {
      this.$emit('callback', this.currentRow);
    },

    close() {
      this.visible = false;
    },
  }
}
</script>

<style>
.disabled-row {
  background-color: #f5f5f5;  /* 设置禁用行的背景颜色 */
  color: #ccc;  /* 设置禁用行的字体颜色 */
  pointer-events: none; /* 禁用整个行的选中功能 */
}

.disabled-row span {
  pointer-events: auto; /* 保证播放器可以正常播放 */
}

.disabled-row video {
  pointer-events: auto; /* 保证播放器可以正常播放 */
}
</style>
