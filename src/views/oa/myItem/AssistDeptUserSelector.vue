<template>
    <div class="assist-dept-user-selector">
        <el-form label-width="130px" label-position="right" :rules="rules" ref="assistDeptUserForm">
            <el-row>
                <el-col :span="24">
                    <el-form-item label="协办部门" prop="xbBusinessUnit">
                        <el-cascader
                            v-model="deptIds"
                            :options="sectionList"
                            :props="{ ...deptProps, multiple: true }"
                            clearable
                            @change="handleAssistDeptChange"
                            ref="assistDeptCascader"
                        ></el-cascader>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    <el-form-item label="协办人" prop="organizerIds">
                        <el-select v-model="userIds" multiple>
                            <el-option v-if="!isView && assistDeptUserList.length === 0" label="请先选择协办部门" value="" disabled></el-option>
                            <el-option v-if="!isView && assistDeptUserList.length > 0" label="全选该部门人员" :value="'all'" @click.native="selectAllAssistUsers"></el-option>
                            <el-option v-for="item in assistDeptUserList" :key="item.userId" :label="item.nickName" :value="item.userId" :disabled="isUserSelected(item.userId)"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
import { listPerson } from '@/api/oa/affairsApply';
import { listDeptTree } from '@/api/oa/publicApi';

export default {
    name: 'AssistDeptUserSelector',
    props: {
        value: {
            type: Object,
            default: () => ({
                deptIds: [],
                userIds: []
            })
        },
        isView: {
            type: Boolean,
            default: false
        },
        excludeUserIds: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            deptIds: [],
            userIds: [],
            id: null,
            // 协办部门用户列表
            assistDeptUserList: [],
            // 部门树配置
            deptProps: {
                value: 'id',
                label: 'label',
                children: 'children',
                checkStrictly: true,
                emitPath: false
            },
            // 部门列表
            sectionList: [],
            rules: {
              xbBusinessUnit: [{ required: true, message: '请选择协办部门', trigger: 'change' }],
              organizerIds: [{ required: true, message: '请选择协办人', trigger: 'change' }]
            }
        };
    },
    created() {
        this.getDeptList();
        // 初始化值
        if (this.value) {
            this.deptIds = this.value.deptIds || [];
            this.userIds = this.value.userIds || [];

            // 如果有部门ID，加载对应的用户列表
            if (this.deptIds && this.deptIds.length > 0) {
                this.handleAssistDeptChange(this.deptIds);
            }
        }
    },
    methods: {
        changeId(id) {
            this.id = id;
            console.log(this.id, '>>>');
        },
        // 获取部门列表
        getDeptList() {
            listDeptTree().then(response => {
                // 将返回的树形结构转换为适合级联选择器的格式
                this.sectionList = this.formatDeptTree(response.data);
            });
        },
        // 格式化部门树数据
        formatDeptTree(data) {
            if (!data) return [];
            return data.map(item => {
                const node = {
                    id: item.id,
                    label: item.label,
                    children: this.formatDeptTree(item.children)
                };
                // 如果没有子节点，则删除children属性
                if (node.children.length === 0) {
                    delete node.children;
                }
                return node;
            });
        },
        // 协办部门变更处理
        handleAssistDeptChange(deptIds) {
            if (!deptIds || deptIds.length === 0) {
                this.assistDeptUserList = [];
                this.userIds = [];
                this.emitChange();
                return;
            }

            // 使用Promise.all同时请求所有部门的人员
            const promises = deptIds.map(deptId => {
                return listPerson({ deptId: deptId });
            });

            Promise.all(promises).then(responses => {
                // 合并所有部门的人员列表
                this.assistDeptUserList = [];
                responses.forEach(response => {
                    if (response && response.data) {
                        this.assistDeptUserList = [...this.assistDeptUserList, ...response.data];
                    }
                });

                // 移除重复的人员（基于userId）
                this.assistDeptUserList = this.removeDuplicateUsers(this.assistDeptUserList);

                // 过滤掉不在新部门的人员
                if (this.userIds && this.userIds.length > 0) {
                    // 检查是否有'all'值，如果有则移除
                    if (this.userIds.includes('all')) {
                        const index = this.userIds.indexOf('all');
                        this.userIds.splice(index, 1);
                    }
                    // 过滤掉不在新部门的人员ID
                    this.userIds = this.userIds.filter(id => this.assistDeptUserList.some(user => user.userId === id));
                }

                this.emitChange();
            });
        },
        // 移除重复用户
        removeDuplicateUsers(userList) {
            const uniqueUsers = {};
            return userList.filter(user => {
                if (uniqueUsers[user.userId]) {
                    return false;
                }
                uniqueUsers[user.userId] = true;
                return true;
            });
        },
        // 全选协办部门人员
        selectAllAssistUsers() {
            // 如果已经有'all'值，则移除它
            if (this.userIds && this.userIds.includes('all')) {
                const index = this.userIds.indexOf('all');
                this.userIds.splice(index, 1);
            }

            // 将所有协办部门人员ID添加到选中列表，排除已被排除的用户
            this.userIds = this.assistDeptUserList.filter(user => !this.excludeUserIds.includes(user.userId)).map(user => user.userId);

            this.emitChange();
        },
        // 判断用户是否已被选择
        isUserSelected(userId) {
            // 检查是否在排除列表中
            return this.excludeUserIds.includes(userId);
        },
        // 向父组件发送变更事件
        emitChange() {
            this.$emit('input', {
                deptIds: this.deptIds,
                userIds: this.userIds
            });
            this.$emit('change', {
                deptIds: this.deptIds,
                userIds: this.userIds
            });
        },
        // 重置选择
        reset() {
            this.deptIds = [];
            this.userIds = [];
            this.assistDeptUserList = [];
            this.emitChange();
        }
    },
    watch: {
        value: {
            handler(newVal) {
                if (newVal) {
                    this.deptIds = newVal.deptIds || [];
                    this.userIds = newVal.userIds || [];

                    // 如果部门ID变化了，重新加载用户列表
                    if (JSON.stringify(this.deptIds) !== JSON.stringify(newVal.deptIds)) {
                        this.handleAssistDeptChange(this.deptIds);
                    }
                }
            },
            deep: true
        },
        userIds: {
            handler() {
                this.emitChange();
            },
            deep: true
        }
    }
};
</script>

<style scoped>
.assist-dept-user-selector {
    width: 100%;
}
</style>
