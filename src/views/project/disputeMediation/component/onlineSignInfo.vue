<!-- 线上签署详情 -->
<template>
  <el-dialog :title="title" :visible.sync="visible" width="1000px" append-to-body @close="cancel">
    <template slot='title'>
      <div class="title_wrapper" style="display: inline">
        <div class="dialog-title" style="display: inline">
          {{ title }}
        </div>
        <dict-tag :options="dict.type.sign_status" :value="row.sign.status" style="display: inline"/>
        <el-tooltip class="item" effect="dark" content="刷新签署状态" placement="top">
          <el-button icon="el-icon-refresh" size="mini" circle style="float: right;margin-right: 30px"
                     @click="refreshSign" :loading="loading"/>
        </el-tooltip>
<!--        <el-tooltip class="item" effect="dark" content="获取下载链接" placement="top" v-if="row.sign && SIGN_STATUS.finish === row.sign.status">-->
<!--          <el-button icon="el-icon-download" size="mini" circle style="float: right;margin-right: 10px"-->
<!--                     @click="handleGetDownloadUrl" :loading="getUrlLoading" type="primary"/>-->
<!--        </el-tooltip>-->
      </div>
    </template>
    <el-form ref="form" :model="row.sign" :rules="rules" label-width="100px">
      <div class="min_title">签署信息</div>
      <el-row>
        <el-col :span="12">
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker v-model="row.sign.createTime" type="datetime" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="row.sign.finishTime">
          <el-form-item label="签署完成时间" prop="finishTime">
            <el-date-picker v-model="row.sign.finishTime" type="datetime" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-else>
          <el-form-item label="签署截止时间" prop="expireTime">
            <el-date-picker v-model="row.sign.expireTime" type="datetime" readonly/>
            <span style="color: red"
                  v-if="new Date(row.sign.expireTime) - new Date() < 1000 * 3600 * 24 * 5">（即将到期）</span>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="min_title">签署方信息</div>
      <el-row v-for="(item,index) in row.sign.signItemList" :key="index">
        <el-col :span="7">
          <el-form-item :label="getLabel(item.customBizNum)" label-width="150px">
            <el-input v-model="item.name" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="手机号">
            <el-input v-model="item.phone" readonly/>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <dict-tag :options="dict.type.sign_item_status" :value="item.status" style="display: inline"/>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-popover trigger="click" placement="right" width="250">
            <canvas :id="`qrcode_${index}`"/>
            <div style="width: 100%;display: flex;align-items: center;justify-content: center;">
              <el-button type="text" round size="mini" @click="openUrl(item.url)" style="margin-top: 3px">
                打开链接
              </el-button>
            </div>
            <!-- Popover的触发元素 -->
            <el-button slot="reference" type="primary" round size="mini" @click="showQrCode(index, item.url)">显示二维码</el-button>
          </el-popover>
        </el-col>
      </el-row>

<!--      <div class="min_title" v-if="files">协议(链接有效期为60分钟)</div>-->
<!--      <transition-group v-if="files" class="upload-file-list el-upload-list el-upload-list&#45;&#45;text" name="el-fade-in-linear" tag="ul">-->
<!--        <li :key="file.downloadUrl" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in files">-->
<!--&lt;!&ndash;          &lt;!&ndash; 客户端有外网，直接访问 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          <el-link :href="file.downloadUrl" :underline="false" target="_blank">&ndash;&gt;-->
<!--&lt;!&ndash;            <span class="el-icon-document">{{ file.downloadUrl }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;          </el-link>&ndash;&gt;-->
<!--&lt;!&ndash;          &lt;!&ndash; 通过nginx转发 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          <el-link :href="file.downloadUrl.replace('https://esignoss.esign.cn','/esign')" :underline="false" target="_blank">&ndash;&gt;-->
<!--&lt;!&ndash;            <span class="el-icon-document">{{ file.downloadUrl }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;          </el-link>&ndash;&gt;-->
<!--          &lt;!&ndash; 通过server转发 &ndash;&gt;-->
<!--          <el-link :underline="false" target="_blank">-->
<!--            <span class="el-icon-document" @click="handleDownload(file.downloadUrl)">{{ file.downloadUrl }}</span>-->
<!--          </el-link>-->
<!--        </li>-->
<!--      </transition-group>-->
<!--      <div class="min_title" v-if="attachments">附件(链接有效期为60分钟)</div>-->
<!--      <transition-group v-if="attachments" class="upload-file-list el-upload-list el-upload-list&#45;&#45;text" name="el-fade-in-linear" tag="ul">-->
<!--        <li :key="file.downloadUrl" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in attachments">-->
<!--&lt;!&ndash;          &lt;!&ndash; 客户端有外网，直接访问 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          <el-link :href="file.downloadUrl" :underline="false" target="_blank">&ndash;&gt;-->
<!--&lt;!&ndash;            <span class="el-icon-document">{{ file.downloadUrl }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;          </el-link>&ndash;&gt;-->
<!--&lt;!&ndash;          &lt;!&ndash; 通过nginx转发 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          <el-link :href="file.downloadUrl.replace('https://oss.esign.cn','/esign')" :underline="false" target="_blank">&ndash;&gt;-->
<!--&lt;!&ndash;            <span class="el-icon-document">{{ file.downloadUrl }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;          </el-link>&ndash;&gt;-->
<!--          &lt;!&ndash; 通过server转发 &ndash;&gt;-->
<!--          <el-link :underline="false" target="_blank">-->
<!--            <span class="el-icon-document" @click="handleDownload(file.downloadUrl)">{{ file.downloadUrl }}</span>-->
<!--          </el-link>-->
<!--        </li>-->
<!--      </transition-group>-->
    </el-form>
  </el-dialog>
</template>

<script>
import {getDisputeMediation, refreshSign, getDownloadUrl} from "@/api/project/disputeMediation";
import {SIGN_ITEM_STATUS, SIGN_STATUS} from '@/views/constant/CommonConstant.js';
import QRCode from 'qrcode'
export default {
  dicts: ["dm_agreement_step", "sign_status", "sign_item_status"],
  props: ["title"],
  watch: {},
  components: {},
  data() {
    return {
      row: {
        sign: {
          status: null,
          createTime: null,
          startTime: null,
          finishTime: null,
          expireTime: null,
          signItemList: []
        }
      },
      // files: null,
      // attachments: null,
      rules: {},
      loading: false,
      getUrlLoading: false,
      visible: false,
      SIGN_STATUS: SIGN_STATUS, // 签署状态
      SIGN_ITEM_STATUS: SIGN_ITEM_STATUS, // 签署任务状态
    };
  },
  created() {
  },
  mounted() {
  },
  methods: {
    open(row) {
      getDisputeMediation(row.workOrderId).then(response => {
        this.row = response.data;
        // this.files = null;
        // this.attachments = null;
        this.visible = true;
      })
    },
    refreshSign() {
      this.loading = true;
      refreshSign({workOrderId: this.row.workOrderId}).then((response) => {
        this.$modal.msgSuccess("操作成功");
        this.loading = false;
        this.open(this.row)
      }).catch(() => {
        this.loading = false;
      })
    },
    // handleGetDownloadUrl() {
    //   if (this.row.sign && SIGN_STATUS.finish === this.row.sign.status) {
    //     this.getUrlLoading = true;
    //     getDownloadUrl({ workOrderId: this.row.workOrderId }).then(response => {
    //       this.files = response.data.files;
    //       this.attachments = response.data.attachments;
    //       this.getUrlLoading = false;
    //     }).catch(() => {
    //       this.getUrlLoading = false;
    //     })
    //   }
    // },
    // handleDownload(downloadUrlStr) {
    //   this.download("eSign/download", { downloadUrl: encodeURIComponent(downloadUrlStr) }, `${this.row.workOrderId}.` + new URL(downloadUrlStr).pathname.split('.').pop());
    // },
    cancel() {
      this.visible = false;
    },
    getLabel(customBizNum) {
      switch (customBizNum) {
        case "consumer":
          return "当事人姓名";
        case "dept":
          return "机构委托代表姓名";
        case "mediator":
          return "调解员姓名";
        case "assistant":
          return "助理调解员姓名";
        case "zh":
          return "中心盖章人员";
      }
    },
    // 处理地址
    openUrl(url) {
      // 新建标签页跳转
      window.open(url, '_blank');
      // 复制
      // navigator.clipboard.writeText(url).then(
      //   () => {
      //     this.$modal.msgSuccess('复制成功');
      //   },
      //   (err) => {
      //     this.$modal.msgError('复制失败！', err);
      //   }
      // );
    },
    // 生成二维码
    showQrCode(index, url) {
      const qrcode = document.getElementById(`qrcode_${index}`)
      QRCode.toCanvas(qrcode, url, {width: 220}, (error) => {
        if (error) {
          console.error(error)
        } else {
          console.log('二维码生成成功！')
        }
      })
    },
  },
  computed: {},
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
