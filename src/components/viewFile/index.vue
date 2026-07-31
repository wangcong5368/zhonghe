<template>
  <el-dialog title="文件预览" :visible.sync="fileOpen" @close="cancel" :z-index="zIndex" append-to-body width="80%"
    top="5vh" :modal="true">
    <div class="file-preview-container">
      <component v-if="currentComponent" :is="currentComponent" :src="fileUrl" :options="options" class="file-component"
        @rendered="renderedHandler" @error="errorHandler" />
      <img v-else-if="isImage" :src="fileUrl" class="image-preview" alt="图片预览" />
      <div v-else-if="loading" class="loading-message">加载中...</div>
      <div v-else class="error-message">不支持的文件类型</div>
    </div>
  </el-dialog>
</template>

<script>
import conf from '@/conf.js';
import { fileToPdf } from '@/api/oa/publicApi';
export default {
  components: {},
  props: {},
  data() {
    return {
      fileUrl: null,
      fileType: null,
      fileOpen: false,
      loading: false,
      currentComponent: null,
      zIndex: 9999,
      baseUrl: conf.server.baseUrl,
      options: {
        xls: false,
        minColLength: 0,
        minRowLength: 0,
        widthOffset: 10,
        heightOffset: 10,
        beforeTransformData: workbookData => {
          return workbookData;
        },
        transformData: workbookData => {
          return workbookData;
        }
      }
    };
  },
  watch: {},
  computed: {
    isImage() {
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
      return imageTypes.includes(this.fileType);
    }
  },
  created() { },
  mounted() { },
  methods: {
    getHighestZIndex() {
      const dialogs = document.querySelectorAll('.el-dialog__wrapper');
      let maxZIndex = 9999;

      dialogs.forEach(dialog => {
        const zIndex = parseInt(window.getComputedStyle(dialog).zIndex) || 0;
        if (zIndex > maxZIndex) {
          maxZIndex = zIndex;
        }
      });

      return maxZIndex + 100;
    },

    async openDialog(url, type) {
      this.zIndex = this.getHighestZIndex();

      this.fileOpen = true;
      this.fileUrl = url;
      this.fileType = type;
      this.loading = true;

      try {
        if (this.isImage) {
          this.currentComponent = null;
          this.loading = false;
          return;
        }

        if (type === 'doc') {
          // 处理 doc 文件，调用转换接口
          await this.handleDocFile();
        } else if (type === 'docx') {
          const module = await import('@vue-office/docx');
          this.currentComponent = module.default;
        } else if (type === 'xls' || type === 'xlsx') {
          const module = await import('@vue-office/excel');
          await import('@vue-office/excel/lib/index.css');
          this.currentComponent = module.default;
        } else if (type === 'pdf') {
          const module = await import('@vue-office/pdf');
          this.currentComponent = module.default;
        } else if (type === 'ppt' || type === 'pptx') {
          const module = await import('@vue-office/pptx');
          this.currentComponent = module.default;
        } else {
          this.currentComponent = null;
        }
      } catch (error) {
        console.error('加载文件预览组件失败:', error);
        console.error('组件加载错误详情:', {
          fileUrl: this.fileUrl,
          fileType: this.fileType,
          error: error,
          errorMessage: error.message,
          errorStack: error.stack
        });
        this.currentComponent = null;
      } finally {
        this.loading = false;
      }
    },
    async handleDocFile() {
      try {
        // 从完整 URL 中截取 profile 及后面的部分
        let filePath = this.fileUrl;
        const profileIndex = this.fileUrl.indexOf('/profile/');
        if (profileIndex !== -1) {
          filePath = this.fileUrl.substring(profileIndex);
        }
        
        console.log('原始 fileUrl:', this.fileUrl);
        console.log('截取后的 filePath:', filePath);
        console.log('调用 doc 转 PDF 接口');
        
        // 使用 fileToPdf 接口
        const response = await fileToPdf(filePath);
        
        // 输出返回结果
        console.log('docToPdf 接口返回结果:', response);
        
        // 将 blob 数据转换为 URL
        const pdfUrl = URL.createObjectURL(response);
        console.log('生成的 PDF URL:', pdfUrl);
        
        // 更新文件 URL 和类型为 PDF
        this.fileUrl = pdfUrl;
        this.fileType = 'pdf';
        
        // 加载 PDF 预览组件
        const module = await import('@vue-office/pdf');
        this.currentComponent = module.default;
        
        console.log('PDF 预览组件加载完成');
      } catch (error) {
        console.error('调用 docToPdf 接口时发生错误:', error);
        this.currentComponent = null;
      }
    },
    cancel() {
      // 如果是 blob URL，需要释放内存
      if (this.fileUrl && this.fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.fileUrl);
      }
      
      this.fileOpen = false;
      this.fileUrl = null;
      this.fileType = null;
      this.currentComponent = null;
    },
    renderedHandler() {
      console.log('渲染完成');
    },
    errorHandler(error) {
      console.error('文件预览渲染失败:', error);
      console.error('错误详情:', {
        fileUrl: this.fileUrl,
        fileType: this.fileType,
        currentComponent: this.currentComponent,
        error: error
      });
    }
  }
};
</script>

<style scoped>
.file-preview-container {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.file-component {
  width: 100%;
  height: 70vh !important;
  min-height: 500px !important;
  overflow: auto !important;
}

.image-preview {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  margin: 0 auto;
  display: block;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
}

/* 处理各种预览组件的样式 */
:deep(.vue-office-pdf-container),
:deep(.vue-office-pdf),
:deep(.vue-office-docx),
:deep(.vue-office-docx-container),
:deep(.el-dialog__body) {
  overflow: auto !important;
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.docx-wrapper) {
  max-width: 100% !important;
  overflow-x: auto !important;
}

:deep(.el-dialog__wrapper) {
  z-index: var(--preview-z-index, 99999) !important;
}

:deep(.el-dialog) {
  z-index: var(--preview-z-index-dialog, 99999) !important;
}

:deep(.el-dialog__wrapper[style*="z-index"]) {
  z-index: 99999 !important;
}
</style>
