<!-- 导入对话框 -->
<template xmlns="http://www.w3.org/1999/html">
  <el-dialog :title="title" :visible.sync="visible" width="400px" append-to-body>
<!--    <el-form ref="form" :model="form" :rules="rules" label-width="80px">-->
<!--      <el-form-item label="行业" prop="industry">-->
<!--        <el-select v-model="form.industry" placeholder="请选择行业" clearable>-->
<!--          <el-option-->
<!--            v-for="item in [{label: '银行业', value: '银行业'}, {label: '保险业', value: '保险业'}]"-->
<!--            :key="item.value"-->
<!--            :label="item.label"-->
<!--            :value="item.value">-->
<!--          </el-option>-->
<!--        </el-select>-->
<!--      </el-form-item>-->
<!--    </el-form>-->
    <el-upload
      ref="upload"
      :limit="1"
      accept=".xlsx, .xls"
      :headers="upload.headers"
      :action="upload.url + '?updateSupport=' + upload.updateSupport"
      :disabled="upload.isUploading"
      :on-progress="handleFileUploadProgress"
      :on-success="handleFileSuccess"
      :on-error="handleFileError"
      :auto-upload="false"
      :before-upload="beforeUpload"
      drag
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip text-center" slot="tip">
        <!--          <div class="el-upload__tip" slot="tip">-->
        <!--            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的数据-->
        <!--          </div>-->
        <span>仅允许导入xls、xlsx格式文件。</span>
        <div>
          <div style="display: inline-block; margin-right: 10px">
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate('bank')">银行模板</el-link>
          </div>
          <div style="display: inline-block; margin-left: 10px">
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate('insurance')">保险模板</el-link>
          </div>
        </div>
      </div>
    </el-upload>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>

import {getToken} from "@/utils/auth";

export default {
  data() {
    return {
      title: "消保平台转办导入",
      visible: false,
      // 导入参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: this._baseUrl + "/project/disputeMediation/import"
      },
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
    open() {
      this.visible = true;
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.visible = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
      this.$modal.closeLoading();
      this.$emit('callback');
    },
    handleFileError() {
      this.upload.isUploading = false;
      this.$modal.closeLoading();
    },
    // 下载模板
    importTemplate(type) {
      if (type === "bank") {
        this.download('/project/disputeMediation/importTemplate?type=bank', {}, `银行模板.xlsx`);
      } else if (type === "insurance") {
        this.download('/project/disputeMediation/importTemplate?type=insurance', {}, `保险模板.xlsx`);
      }
    },
    beforeUpload(file) {
      // 判断是否已经选择文件
      if (file) {
        this.$modal.loading("导入中，请稍后……！");
        return true; // 继续上传文件
      } else {
        return false; // 返回 false 可以阻止文件上传
      }
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
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
