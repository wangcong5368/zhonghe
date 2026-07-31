<template>
  <div class="file-list">
    <div v-if="fileList && fileList.length > 0">
      <div v-for="(file, index) in parsedFileList" :key="index" class="file-item">
        <span class="file-name">{{ file.name }}</span>
        <div class="file-actions">
          <el-button
            v-if="showPreview"
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="handlePreview(file)"
          >
            预览
          </el-button>
          <el-button
            v-if="showDownload"
            type="text"
            size="mini"
            icon="el-icon-download"
            @click="handleDownload(file)"
          >
            下载
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="no-files">
      <span>{{ emptyText }}</span>
    </div>
    <ViewFile ref="viewFile" />
  </div>
</template>

<script>
import ViewFile from '@/components/viewFile/index.vue';
import conf from '@/conf.js';

export default {
  name: 'FileList',
  components: {
    ViewFile
  },
  props: {
    fileList: {
      type: [String, Array],
      default: () => []
    },

    emptyText: {
      type: String,
      default: '暂无附件'
    },

    showPreview: {
      type: Boolean,
      default: true
    },

    showDownload: {
      type: Boolean,
      default: true
    },

    nameLength: {
      type: Number,
    },
  },
  computed: {
    parsedFileList() {
      if (!this.fileList) return [];

      let files = [];
      if (typeof this.fileList === 'string') {
        if (this.fileList.includes(',')) {
          files = this.fileList.split(',').map(file => file.trim()).filter(file => file);
        } else if (this.fileList) {
          files = [this.fileList.trim()];
        }
      } else if (Array.isArray(this.fileList)) {
        files = this.fileList;
      }

      return files.map(file => {
        if (typeof file === 'string') {
          return {
            name: this.getFileName(file),
            url: file,
            path: file
          };
        }
        return file;
      });
    }
  },
  methods: {
    getFileName(filePath) {
      if (!filePath) return '未知文件';
      const fileName = filePath.split('/').pop();
      if (this.nameLength && this.nameLength >= 10 && fileName.length > this.nameLength) {
        const ext = fileName.split('.').pop();
        const nameWithoutExt = fileName.substring(0, fileName.length - ext.length - 1);
        return nameWithoutExt.substring(0, this.nameLength - ext.length - 3) + '...' + ext;
      }
      return fileName;
    },

    handlePreview(file) {
      if (!file || !file.url) {
        this.$message.error('文件地址不存在');
        return;
      }
      const baseUrl = conf.server.baseUrl;
      const fileType = file.name.split('.').pop().toLowerCase();

      this.$refs.viewFile.openDialog(baseUrl + file.url, fileType);
    },

    handleDownload(file) {
      if (!file || !file.url) {
        this.$message.error('文件地址不存在');
        return;
      }

      const baseUrl = conf.server.baseUrl;

      const link = document.createElement('a');
      link.href = baseUrl + file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
</script>

<style scoped>
.file-list {
  width: 100%;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  margin-right: 10px;
  color: #333;
  font-size: 14px;
  word-break: break-all;
}

.file-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}

.no-files {
  padding: 20px 0;
  font-size: 14px;
}

.el-button--text {
  padding: 0 5px;
}
</style>
