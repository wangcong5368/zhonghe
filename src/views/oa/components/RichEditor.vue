<template>
    <div :class="['rich-editor', { 'rich-editor-disabled': disabled }]">
        <div ref="editor"></div>
    </div>
</template>

<script>
// 检查是否已安装 wangeditor
let E;
try {
    E = require('wangeditor');
} catch (e) {
    console.warn('wangeditor not installed, please run: npm install wangeditor --save');
    // 创建一个空对象避免报错
    E = function () {
        this.config = {};
        this.create = function () {};
        this.disable = function () {};
        this.enable = function () {};
        this.destroy = function () {};
        this.txt = {
            html: function () {
                return '';
            }
        };
    };
}

export default {
    name: 'RichEditor',
    props: {
        value: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            editor: null
        };
    },
    mounted() {
        this.initEditor();
    },
    watch: {
        value(val) {
            if (!this.editor) return;
            if (val !== this.editor.txt.html()) {
                this.editor.txt.html(val || '');
            }
        },
        disabled(val) {
            if (!this.editor) return;
            if (val) {
                this.editor.disable();
            } else {
                this.editor.enable();
            }
        }
    },
    beforeDestroy() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    },
    methods: {
        initEditor() {
            if (!this.$refs.editor) return;

            try {
                const editor = new E(this.$refs.editor);
                editor.config.zIndex = 100;
                editor.config.onchange = html => {
                    this.$emit('input', html);
                    this.$emit('change', html);
                };
                editor.create();
                this.editor = editor;
                editor.txt.html(this.value || '');
                if (this.disabled) {
                    editor.disable();
                }
            } catch (error) {
                console.error('初始化富文本编辑器失败:', error);
            }
        }
    }
};
</script>

<style scoped>
.rich-editor {
    width: 100%;
}
.rich-editor-disabled {
    cursor: not-allowed !important;
}
::v-deep .w-e-toolbar {
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
}
::v-deep .w-e-text-container {
    border: none !important;
}
::v-deep .w-e-menu {
    border: none !important;
}
::v-deep .w-e-text-container--disabled {
    cursor: not-allowed !important;
}
</style>
