<template>
    <div class="quick-reply-container">
        <el-popover 
            placement="bottom" 
            :width="popoverWidth" 
            trigger="click" 
            v-model="visible" 
            popper-class="quick-reply-popover">
            <div class="quick-reply-content">
                <div class="quick-reply-header">
                    <el-input v-model="searchText" placeholder="搜索常用词条" prefix-icon="el-icon-search" clearable
                        @clear="searchText = ''"></el-input>
                </div>
                <div class="quick-reply-list">
                    <el-scrollbar :style="{ height: listHeight }">
                        <div v-for="phrase in filteredPhrases" :key="phrase.id" class="quick-reply-item"
                            @click="selectPhrase(phrase)">
                            {{ phrase.content }}
                        </div>
                        <el-empty v-if="filteredPhrases.length === 0" description="暂无数据"></el-empty>
                    </el-scrollbar>
                </div>
                <div class="quick-reply-footer">
                    <el-button size="mini" type="primary" @click="showManageDialog">管理常用词条</el-button>
                </div>
            </div>
            <el-button 
                slot="reference" 
                size="mini" 
                type="primary" 
                icon="el-icon-chat-dot-square"
                :style="{ 
                    width: buttonWidth, 
                    height: buttonHeight 
                }">常用词条</el-button>
        </el-popover>
        
        <!-- 收藏意见按钮 -->
        <el-button 
            size="mini" 
            type="success" 
            icon="el-icon-star-off" 
            @click="collectCurrentInput"
            :disabled="!inputContent || !inputContent.trim()"
            v-if="isShowSave"
            :style="{ 
                width: buttonWidth, 
                height: buttonHeight,
                marginLeft: '8px'
            }">
            收藏
        </el-button>

        <!-- 管理常用词条对话框 -->
        <el-dialog title="管理常用词条" :visible.sync="manageDialogVisible" width="700px" append-to-body>
            <div class="manage-container">
                <div class="phrase-list">
                    <el-table :data="phrases" style="width: 100%" height="350">
                        <el-table-column prop="content" label="常用词条内容" show-overflow-tooltip></el-table-column>
                        <el-table-column label="操作" width="150" align="center">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" @click="editPhrase(scope.row)">编辑</el-button>
                                <el-button size="mini" type="danger" @click="deletePhrase(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="add-phrase">
                        <el-button type="primary" size="small" @click="showAddPhraseForm">添加常用词条</el-button>
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 添加/编辑常用词条表单 -->
        <el-dialog :title="phraseForm.isEdit ? '编辑常用词条' : '添加常用词条'" :visible.sync="phraseFormVisible" width="500px"
            append-to-body>
            <el-form :model="phraseForm" label-width="80px">
                <el-form-item label="常用词条">
                    <el-input v-model="phraseForm.content" type="textarea" :rows="4"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="phraseFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitPhraseForm">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getReplyList, addReply, editReply } from "@/api/oa/publicApi"
export default {
    name: 'QuickReply',
    props: {
        // 接收外部传入的常用词条数据
        externalPhrases: {
            type: Array,
            default: () => []
        },
        // 选中常用词条后的回调
        onSelect: {
            type: Function,
            default: null
        },
        superviseId: {
            type: [Number, String],
            default: null
        },
        // 新增：接收输入框内容
        inputContent: {
            type: String,
            default: ''
        },
        // 按钮宽度
        buttonWidth: {
            type: String,
            default: 'auto'
        },
        // 按钮高度
        buttonHeight: {
            type: String,
            default: 'auto'
        },
        // 弹窗宽度
        popoverWidth: {
            type: String,
            default: '300px'
        },
        // 列表高度
        listHeight: {
            type: String,
            default: '250px'
        },
        isShowSave:{
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            visible: false,
            searchText: '',
            manageDialogVisible: false,
            phraseFormVisible: false,

            // 常用词条表单
            phraseForm: {
                id: '',
                content: '',
                isEdit: false
            },

            // 常用词条数据
            phrases: [

            ],
            userInfo: this.$store.getters.userInfo
        }
    },
    computed: {
        // 根据搜索文本过滤常用词条
        filteredPhrases() {
            const allPhrases = [...this.phrases, ...this.externalPhrases];

            return allPhrases.filter(phrase => {
                // 按搜索文本过滤
                return !this.searchText ||
                    phrase.content.toLowerCase().includes(this.searchText.toLowerCase());
            });
        }
    },
    methods: {
        // 选择常用词条
        selectPhrase(phrase) {
            if (this.onSelect && typeof this.onSelect === 'function') {
                this.onSelect(phrase.content);
            }
            this.$emit('select', phrase.content);

            this.$nextTick(() => {
                this.visible = false;
            });
        },

        // 显示管理对话框
        showManageDialog() {
            this.manageDialogVisible = true;
        },

        // 显示添加常用词条表单
        showAddPhraseForm() {
            this.phraseForm = {
                id: '',
                content: '',
                isEdit: false
            };
            this.phraseFormVisible = true;
        },

        // 编辑常用词条
        editPhrase(phrase) {
            this.phraseForm = {
                id: phrase.id,
                content: phrase.content,
                isEdit: true
            };
            this.phraseFormVisible = true;
        },

        // 删除常用词条
        deletePhrase(phrase) {
            this.$confirm('确定要删除该常用词条吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                console.log(phrase, 'phrase');
                // 调用修改接口，设置delFlag=2表示删除
                editReply({
                    id: phrase.id,
                    superviseId: this.superviseId,
                    userId: this.userInfo.userId,
                    content: phrase.content,
                    delFlag: 2
                }).then(res => {
                    // 删除成功后更新本地数据
                    this.phrases = this.phrases.filter(item => item.id !== phrase.id);
                    this.$message.success('删除成功');
                    this.getReplyList();
                }).catch(err => {
                    this.$message.error('删除失败：' + (err.msg || '未知错误'));
                });
            }).catch(() => {
                // 用户取消删除操作，不做任何处理
            });
        },

        // 获取常用词条列表
        getReplyList() {
            getReplyList({
                superviseId: this.superviseId
            }).then(res => {
                if (res.rows && Array.isArray(res.rows)) {
                    this.phrases = res.rows.map(item => ({
                        id: item.id,
                        content: item.content,
                    }));
                }
            }).catch(err => {
                console.error('获取常用词条列表失败', err);
            });
        },

        // 新增：收藏当前输入内容
        collectCurrentInput() {
            if (!this.inputContent || !this.inputContent.trim()) {
                this.$message.warning('输入框内容为空，无法收藏');
                return;
            }

            if (!this.superviseId) {
                this.$message.error('缺少必要参数：superviseId');
                return;
            }

            // 检查是否已存在相同内容
            const existingPhrase = this.phrases.find(phrase => 
                phrase.content.trim() === this.inputContent.trim()
            );

            if (existingPhrase) {
                this.$message.warning('该内容已存在于常用词条中');
                return;
            }

            const params = {
                superviseId: this.superviseId,
                userId: this.userInfo.userId,
                content: this.inputContent.trim()
            };

            addReply(params).then(res => {
                const newId = res.data || res.id || Date.now();
                this.phrases.push({
                    id: newId,
                    content: this.inputContent.trim()
                });
                this.$message.success('收藏成功');
                this.getReplyList();
                
                // 触发外部事件，通知父组件收藏成功
                this.$emit('collected', this.inputContent.trim());
            }).catch(err => {
                this.$message.error('收藏失败：' + (err.msg || '未知错误'));
            });
        },

        // 提交常用词条表单
        submitPhraseForm() {
            if (!this.phraseForm.content) {
                this.$message.error('常用词条内容不能为空');
                return;
            }

            if (!this.superviseId) {
                this.$message.error('缺少必要参数：superviseId');
                return;
            }

            const params = {
                superviseId: this.superviseId,
                userId: this.userInfo.userId,
                content: this.phraseForm.content
            };

            if (this.phraseForm.isEdit) {
                // 编辑现有常用词条
                editReply({
                    ...params,
                    id: this.phraseForm.id
                }).then(res => {
                    const index = this.phrases.findIndex(item => item.id === this.phraseForm.id);
                    if (index !== -1) {
                        this.phrases[index].content = this.phraseForm.content;
                    }
                    this.phraseFormVisible = false;
                    this.$message.success('编辑成功');
                    this.getReplyList();
                }).catch(err => {
                    this.$message.error('编辑失败：' + (err.msg || '未知错误'));
                });
            } else {
                // 添加新常用词条
                addReply(params).then(res => {
                    const newId = res.data || res.id || Date.now();
                    this.phrases.push({
                        id: newId,
                        content: this.phraseForm.content
                    });
                    this.phraseFormVisible = false;
                    this.$message.success('添加成功');
                    this.getReplyList();
                }).catch(err => {
                    this.$message.error('添加失败：' + (err.msg || '未知错误'));
                });
            }
        }
    },
    mounted() {
        this.getReplyList();
    }
};
</script>

<style scoped lang="scss">
.quick-reply-container {
    display: inline-block;
}

.quick-reply-content {
    display: flex;
    flex-direction: column;
    min-height: 200px;
    max-height: 500px;
}

.quick-reply-header {
    padding-bottom: 10px;
    flex-shrink: 0;

    .el-input {
        margin-bottom: 10px;
    }
}

.quick-reply-list {
    flex: 1;
    overflow: hidden;
    min-height: 0;

    .quick-reply-item {
        padding: 8px 12px;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
            background-color: #f5f7fa;
        }
    }
}

.quick-reply-footer {
    padding-top: 10px;
    text-align: right;
    border-top: 1px solid #ebeef5;
}

.manage-container {
    max-height: 450px;
    overflow: hidden;

    .add-phrase {
        margin-top: 15px;
        text-align: right;
    }
}
</style>

<style>
/* 全局样式，解决无障碍警告问题 */
.quick-reply-popover.el-popper[aria-hidden="true"] {
    visibility: hidden !important;
    pointer-events: none !important;
}
</style>
