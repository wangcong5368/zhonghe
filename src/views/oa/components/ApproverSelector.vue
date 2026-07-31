<template>
    <div class="approver-selector">
        <div v-for="(approver, index) in approvers" :key="index" class="approver-item">
            <span class="approver-label">{{ getApproverLabel(index) }}</span>
            <el-select v-model="approver.userId" placeholder="请选择审批人" @change="handleApproverChange" filterable
                :class="{ 'is-error': showError && !approver.userId }" required>
                <el-option v-for="user in getApproverOptions(index)" :key="user.userId"
                    :label="user.nickName || user.userName" :value="user.userId"></el-option>
            </el-select>
            <span class="error-message" v-if="showError && !approver.userId">请选择审批人</span>
            <el-button type="text" icon="el-icon-delete" @click="removeApprover(index)" class="approver-delete"
                v-if="canRemoveApprover"></el-button>
        </div>
        <!-- 其他事务申请时才显示添加审批人按钮 -->
        <div class="add-approver" v-if="affairsType === 'other' && canAddApprover">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="addApprover" plain>添加审批人</el-button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getQueryDeptOrPermission, listDeptTree, getAllUser, getUserJurisdiction } from '@/api/oa/publicApi';
import { deptTreeSelect } from '@/api/system/user';

export default {
    name: 'ApproverSelector',
    props: {
        // 用户列表
        // userList: {
        //     type: Array,
        //     required: true,
        //     default: () => []
        // },
        // 初始审批人
        value: {
            type: Array,
            default: () => []
        },
        // 事务类型
        affairsType: {
            type: String,
            default: ''
        },
        // 员工类型（用于请假审批时判断是否为借聘员工）
        employeePosition: {
            type: String,
            default: ''
        }
    },
    computed: {
        ...mapGetters(['permissions', 'userInfo']),

        // 判断用户是否属于纠纷调解部
        isDisputeMediationDept() {
            return this.deptIdList.includes(this.userInfo.deptId);
        },

        // 判断用户是否为调解员
        isMediator() {
            return this.userInfo.isDMCenterMediator === true || this.userInfo.isDMCourtMediator === true;
        },

        // 判断是否为借聘员工（请假审批时不需要中心领导）
        isBorrowedEmployee() {
            return this.affairsType === 'leave' && this.employeePosition === '借聘员工';
        },

        // 根据权限和事务类型确定最大审批人数
        maxApprovers() {
            // 其他类型允许无限制添加审批人
            if (this.affairsType === 'other') {
                return 10; // 设置一个较高的上限，实际可根据需要调整
            }

            // 调解员用户的特殊处理
            if (this.isMediator) {
                if (this.affairsType === 'officialSeal') {
                    return 4; // 组长、部门负责人、中心领导、综合部（印章管理人）
                } else if (this.affairsType === 'contract') {
                    return 5; // 组长、部门负责人、法审、综合部、中心领导
                } else {
                    return 4; // 组长、部门负责人、综合部、中心领导
                }
            }

            // 检查当前用户是否为部门经理
            const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');

            // 用印审批类型的特殊处理
            if (this.affairsType === 'officialSeal') {
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        return 2; // 综合部部门经理：中心领导、综合部（印章管理人）
                    } else {
                        return 3; // 普通综合部人员：部门负责人、中心领导、综合部（印章管理人）
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    return 2; // 纠纷调解部部门经理：中心领导、综合部（印章管理人）
                } else if (this.permissions.includes('system:user:manager')) {
                    return 2; // 其他部门经理：中心领导、综合部（印章管理人）
                } else if (this.permissions.includes('system:user:group')) {
                    return 3; // 组长级别：部门负责人、中心领导、综合部（印章管理人）
                } else {
                    // 普通员工：组长（仅纠纷调解部）、部门负责人、中心领导、综合部（印章管理人）
                    if (!this.isDisputeMediationDept) {
                        return 3; // 部门负责人、中心领导、综合部（印章管理人）
                    }
                    return 4; // 组长、部门负责人、中心领导、综合部（印章管理人）
                }
            } else if (this.affairsType === 'contract') {
                // 合同审批类型的特殊处理
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        return 2; // 综合部部门经理：法审、中心领导
                    } else {
                        return 3; // 普通综合部人员：部门负责人、法审、中心领导
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    return 3; // 纠纷调解部部门经理：法审、综合部、中心领导
                } else if (this.permissions.includes('system:user:manager')) {
                    return 3; // 其他部门经理：法审、综合部、中心领导
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、法审、综合部、中心领导
                    return 4; // 部门负责人、法审、综合部、中心领导
                } else {
                    // 普通员工：组长（仅纠纷调解部）、部门负责人、法审、综合部、中心领导
                    if (!this.isDisputeMediationDept) {
                        return 4; // 部门负责人、法审、综合部、中心领导
                    }
                    return 5; // 组长、部门负责人、法审、综合部、中心领导
                }
            } else {
                // 其他类型的默认处理（包括请假审批）
                // 如果是借聘员工请假，不需要中心领导，所有情况都减1
                const borrowedAdjustment = this.isBorrowedEmployee ? -1 : 0;
                
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        return Math.max(0, 1 + borrowedAdjustment); // 综合部部门经理：中心领导（借聘员工时为0）
                    } else {
                        return Math.max(1, 2 + borrowedAdjustment); // 普通综合部人员：部门负责人、中心领导（借聘员工时只有部门负责人）
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    return Math.max(1, 2 + borrowedAdjustment); // 纠纷调解部部门经理：综合部、中心领导（借聘员工时只有综合部）
                } else if (this.permissions.includes('system:user:manager')) {
                    return Math.max(1, 2 + borrowedAdjustment); // 其他部门经理：综合部、中心领导（借聘员工时只有综合部）
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、综合部、中心领导
                    return Math.max(2, 3 + borrowedAdjustment); // 部门负责人、综合部、中心领导（借聘员工时只有部门负责人、综合部）
                } else {
                    // 普通员工：组长（仅纠纷调解部）、部门负责人、综合部、中心领导
                    if (!this.isDisputeMediationDept) {
                        return Math.max(2, 3 + borrowedAdjustment); // 部门负责人、综合部、中心领导（借聘员工时只有部门负责人、综合部）
                    }
                    return Math.max(3, 4 + borrowedAdjustment); // 组长、部门负责人、综合部、中心领导（借聘员工时只有组长、部门负责人、综合部）
                }
            }
        },

        // 是否可以添加审批人
        canAddApprover() {
            // 其他类型总是可以添加审批人（除非达到上限）
            if (this.affairsType === 'other') {
                return this.approvers.length < this.maxApprovers;
            }
            return this.approvers.length < this.maxApprovers;
        },

        // 是否可以删除审批人
        canRemoveApprover() {
            // 只有其他类型才可以删除审批人（只要有超过一个）
            if (this.affairsType === 'other') {
                return this.approvers.length > 1;
            }
            return false;
        }
    },
    data() {
        return {
            approvers: [],
            approverLabels: ['组长', '部门负责人', '综合部', '中心领导'],
            centerLeaders: [], // 中心领导列表
            managers: [], // 部门负责人列表（纠纷调解部）
            otherManagers: [], // 部门负责人列表（其他部门）
            groups: [], // 组长列表
            anyLeaves: [], // 综合管理部列表
            sealManagers: [], // 印章管理人列表
            legalUsers: [], // 法务岗列表
            allUsers: [], // 所有用户列表（用于other类型）
            dataLoaded: false, // 标记数据是否已加载
            pendingApiCalls: 6, // 跟踪待完成的API调用数量（增加一个API调用）
            showError: false, // 控制是否显示错误信息
            deptIdList: [] // 部门ID列表
        };
    },
    watch: {
        value: {
            handler(newVal) {
                if (newVal && newVal.length) {
                    this.approvers = JSON.parse(JSON.stringify(newVal));
                    // 确保审批人数量不超过最大限制
                    if (this.approvers.length > this.maxApprovers) {
                        this.approvers = this.approvers.slice(0, this.maxApprovers);
                    }
                } else {
                    // 根据权限初始化审批人
                    this.initApprovers();
                }
            },
            immediate: true,
            deep: true
        },

        // 监听对话框的打开状态
        '$parent.open': {
            handler(isOpen) {
                if (isOpen) {
                    // 对话框打开时，加载数据（如果尚未加载）
                    if (!this.dataLoaded) {
                        this.loadApproverData();
                    } else {
                        // 数据已加载，直接执行自动选择
                        this.$nextTick(() => {
                            this.autoSelectSingleUsers();
                        });
                    }
                }
            },
            immediate: true
        },

        // 监听事务类型变化
        affairsType: {
            handler(newType, oldType) {
                this.initApprovers();

                // 如果新类型是other，且之前没有加载过所有用户数据，则加载
                if (newType === 'other' && this.allUsers.length === 0) {
                    getAllUser().then(res => {
                        console.log('切换到other类型，加载所有用户:', res);
                        this.allUsers = res.data || [];
                        // 强制更新组件
                        this.$forceUpdate();
                    }).catch(err => {
                        console.error('获取所有用户失败:', err);
                        this.allUsers = [];
                    });
                }

                // 类型变化后，重新自动选择唯一用户
                this.$nextTick(() => {
                    this.autoSelectSingleUsers();
                });
            }
        },

        // 监听部门ID列表变化
        deptIdList: {
            handler() {
                // 只有在数据加载完成后才重新初始化审批人，避免在初始加载期间重复初始化
                if (this.dataLoaded && this.pendingApiCalls <= 0) {
                    this.initApprovers();
                }
            },
            deep: true
        },

        // 监听员工类型变化（请假审批时，借聘员工不需要中心领导）
        employeePosition: {
            handler(newVal, oldVal) {
                // 如果是请假审批，重新初始化审批人
                if (this.affairsType === 'leave' && newVal !== oldVal) {
                    console.log('员工类型变化:', { 
                        newVal, 
                        oldVal, 
                        isBorrowedEmployee: this.isBorrowedEmployee,
                        affairsType: this.affairsType,
                        dataLoaded: this.dataLoaded,
                        pendingApiCalls: this.pendingApiCalls,
                        currentApprovers: this.approvers.length
                    });
                    
                    // 如果数据已加载完成，立即重新初始化
                    if (this.dataLoaded && this.pendingApiCalls <= 0) {
                        // 先清空当前审批人
                        this.approvers = [];
                        // 重新初始化
                        this.initApprovers();
                        console.log('重新初始化后的审批人:', this.approvers);
                        
                        // 双重保险：如果借聘员工，确保移除中心领导审批人
                        if (this.isBorrowedEmployee && this.approvers.length > 0) {
                            // 检查每个审批人的标签，移除中心领导
                            const labelsToRemove = [];
                            this.approvers.forEach((approver, index) => {
                                const label = this.getApproverLabel(index);
                                if (label.includes('中心领导')) {
                                    labelsToRemove.push(index);
                                }
                            });
                            // 从后往前删除，避免索引变化
                            labelsToRemove.reverse().forEach(index => {
                                this.approvers.splice(index, 1);
                            });
                            console.log('移除中心领导后的审批人:', this.approvers);
                        }
                        
                        this.$nextTick(() => {
                            this.autoSelectSingleUsers();
                            // 强制更新组件
                            this.$forceUpdate();
                        });
                    }
                }
            }
        }
    },
    methods: {
        // 初始化审批人列表
        initApprovers() {
            this.approvers = [];

            // 其他类型的特殊处理 - 允许自定义审批人
            if (this.affairsType === 'other') {
                // 默认添加一个空的审批人
                this.approvers = [{ userId: null }];
                return;
            }

            // 调解员用户的特殊处理
            if (this.isMediator) {
                if (this.affairsType === 'officialSeal') {
                    // 调解员用印审批：组长、部门负责人、中心领导、综合部（印章管理人）
                    this.approvers = [
                        { userId: null }, // 组长
                        { userId: null }, // 部门负责人
                        { userId: null }, // 中心领导
                        { userId: null } // 综合部（印章管理人）
                    ];
                } else if (this.affairsType === 'contract') {
                    // 调解员合同审批：组长、部门负责人、法审、综合部、中心领导
                    this.approvers = [
                        { userId: null }, // 组长
                        { userId: null }, // 部门负责人
                        { userId: null }, // 法审
                        { userId: null }, // 综合部
                        { userId: null } // 中心领导
                    ];
                } else {
                    // 调解员其他类型：组长、部门负责人、综合部、中心领导
                    this.approvers = [
                        { userId: null }, // 组长
                        { userId: null }, // 部门负责人
                        { userId: null }, // 综合部
                        { userId: null } // 中心领导
                    ];
                }
                return;
            }

            // 用印审批类型的特殊处理
            if (this.affairsType === 'officialSeal') {
                // 检查当前用户是否为部门经理
                const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');
                
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        // 如果综合部人员同时是部门经理，跳过部门负责人层级：中心领导、综合部（印章管理人）
                        this.approvers = [
                            { userId: null }, // 中心领导
                            { userId: null } // 综合部（印章管理人）
                        ];
                    } else {
                        // 普通综合部人员：部门负责人、中心领导、综合部（印章管理人）
                        this.approvers = [
                            { userId: null }, // 部门负责人
                            { userId: null }, // 中心领导
                            { userId: null } // 综合部（印章管理人）
                        ];
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    // 纠纷调解部部门经理：中心领导、综合部（印章管理人）
                    this.approvers = [
                        { userId: null }, // 中心领导
                        { userId: null } // 综合部（印章管理人）
                    ];
                } else if (this.permissions.includes('system:user:manager')) {
                    // 其他部门经理：中心领导、综合部（印章管理人）
                    this.approvers = [
                        { userId: null }, // 中心领导
                        { userId: null } // 综合部（印章管理人）
                    ];
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、中心领导、综合部（印章管理人）
                    this.approvers = [
                        { userId: null }, // 部门负责人
                        { userId: null }, // 中心领导
                        { userId: null } // 综合部（印章管理人）
                    ];
                } else {
                    // 普通员工
                    const tempApprovers = [];

                    // 只有当用户属于纠纷调解部时，才添加组长
                    if (this.isDisputeMediationDept && this.groups && this.groups.length > 0) {
                        tempApprovers.push({ userId: null }); // 组长
                    }

                    // 添加部门负责人、中心领导、综合部（印章管理人）
                    tempApprovers.push({ userId: null }, { userId: null }, { userId: null });
                    this.approvers = tempApprovers;
                }
            } else if (this.affairsType === 'contract') {
                // 合同审批类型的处理
                // 检查当前用户是否为部门经理
                const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');
                
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        // 如果综合部人员同时是部门经理，跳过部门负责人层级：法审、中心领导
                        this.approvers = [
                            { userId: null }, // 法审
                            { userId: null } // 中心领导
                        ];
                    } else {
                        // 普通综合部人员：部门负责人、法审、中心领导
                        this.approvers = [
                            { userId: null }, // 部门负责人
                            { userId: null }, // 法审
                            { userId: null } // 中心领导
                        ];
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    // 纠纷调解部部门经理：法审、综合部、中心领导
                    this.approvers = [
                        { userId: null }, // 法审
                        { userId: null }, // 综合部
                        { userId: null } // 中心领导
                    ];
                } else if (this.permissions.includes('system:user:manager')) {
                    // 其他部门经理：法审、综合部、中心领导
                    this.approvers = [
                        { userId: null }, // 法审
                        { userId: null }, // 综合部
                        { userId: null } // 中心领导
                    ];
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、法审、综合部、中心领导
                    this.approvers = [
                        { userId: null }, // 部门负责人
                        { userId: null }, // 法审
                        { userId: null }, // 综合部
                        { userId: null } // 中心领导
                    ];
                } else {
                    // 普通员工
                    const tempApprovers = [];

                    // 只有当用户属于纠纷调解部时，才添加组长
                    if (this.isDisputeMediationDept && this.groups && this.groups.length > 0) {
                        tempApprovers.push({ userId: null }); // 组长
                    }

                    // 添加部门负责人、法审、综合部、中心领导
                    tempApprovers.push({ userId: null }, { userId: null }, { userId: null }, { userId: null });
                    this.approvers = tempApprovers;
                }
            } else {
                // 其他类型的默认处理（包括请假审批）
                // 检查当前用户是否为部门经理
                const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');
                
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        // 如果综合部人员同时是部门经理，跳过部门负责人层级：中心领导
                        // 借聘员工不需要中心领导
                        if (this.isBorrowedEmployee) {
                            this.approvers = []; // 借聘员工且是部门经理，不需要审批人
                        } else {
                            this.approvers = [
                                { userId: null } // 中心领导
                            ];
                        }
                    } else {
                        // 普通综合部人员：部门负责人、中心领导
                        // 借聘员工不需要中心领导
                        if (this.isBorrowedEmployee) {
                            this.approvers = [
                                { userId: null } // 部门负责人
                            ];
                        } else {
                            this.approvers = [
                                { userId: null }, // 部门负责人
                                { userId: null } // 中心领导
                            ];
                        }
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    // 纠纷调解部部门经理：综合部、中心领导
                    // 借聘员工不需要中心领导
                    if (this.isBorrowedEmployee) {
                        this.approvers = [
                            { userId: null } // 综合部
                        ];
                    } else {
                        this.approvers = [{ userId: null }, { userId: null }];
                    }
                } else if (this.permissions.includes('system:user:manager')) {
                    // 其他部门经理：综合部、中心领导
                    // 借聘员工不需要中心领导
                    if (this.isBorrowedEmployee) {
                        this.approvers = [
                            { userId: null } // 综合部
                        ];
                    } else {
                        this.approvers = [
                            { userId: null }, // 综合部
                            { userId: null } // 中心领导
                        ];
                    }
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、综合部、中心领导
                    // 借聘员工不需要中心领导
                    if (this.isBorrowedEmployee) {
                        this.approvers = [
                            { userId: null }, // 部门负责人
                            { userId: null } // 综合部
                        ];
                    } else {
                        this.approvers = [
                            { userId: null }, // 部门负责人
                            { userId: null }, // 综合部
                            { userId: null } // 中心领导
                        ];
                    }
                } else {
                    // 普通员工
                    const tempApprovers = [];

                    // 只有当用户属于纠纷调解部时，才添加组长
                    if (this.isDisputeMediationDept && this.groups && this.groups.length > 0) {
                        tempApprovers.push({ userId: null }); // 组长
                    }

                    // 添加部门负责人、综合部
                    tempApprovers.push({ userId: null }, { userId: null });
                    
                    // 借聘员工不需要中心领导
                    if (!this.isBorrowedEmployee) {
                        tempApprovers.push({ userId: null }); // 中心领导
                    }
                    
                    this.approvers = tempApprovers;
                }
            }
        },

        // 获取当前用户对应的部门负责人列表
        getCurrentManagers() {
            // 调解员用户和纠纷调解部用户都使用部门负责人列表
            if (this.isMediator || this.isDisputeMediationDept) {
                return this.managers;
            }
            return this.otherManagers;
        },

        // 获取审批人标签
        getApproverLabel(index) {
            // 其他类型的简单标签处理
            if (this.affairsType === 'other') {
                return `第${index + 1}级审批人：`;
            }

            // 调解员用户的特殊标签处理
            if (this.isMediator) {
                if (this.affairsType === 'officialSeal') {
                    // 调解员用印审批：组长、部门负责人、中心领导、综合部（印章管理人）
                    const labels = ['组长', '部门负责人', '中心领导', '综合部（印章管理人）'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else if (this.affairsType === 'contract') {
                    // 调解员合同审批：组长、部门负责人、法审（法务岗）、综合部、中心领导
                    const labels = ['组长', '部门负责人', '法审（法务岗）', '综合部', '中心领导'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else {
                    // 调解员其他类型：组长、部门负责人、综合部、中心领导
                    const labels = ['组长', '部门负责人', '综合部', '中心领导'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                }
            }

            // 用印审批类型的特殊标签处理
            if (this.affairsType === 'officialSeal') {
                // 检查当前用户是否为部门经理
                const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');
                
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        // 综合部部门经理：中心领导、综合部（印章管理人）
                        const labels = ['中心领导', '综合部（印章管理人）'];
                        return `第${index + 1}审批人（${labels[index]}）：`;
                    } else {
                        // 普通综合部人员：部门负责人、中心领导、综合部（印章管理人）
                        const labels = ['部门负责人', '中心领导', '综合部（印章管理人）'];
                        return `第${index + 1}审批人（${labels[index]}）：`;
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    // 纠纷调解部部门经理：中心领导、综合部（印章管理人）
                    const labels = ['中心领导', '综合部（印章管理人）'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else if (this.permissions.includes('system:user:manager')) {
                    // 其他部门经理：中心领导、综合部（印章管理人）
                    const labels = ['中心领导', '综合部（印章管理人）'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、中心领导、综合部（印章管理人）
                    const labels = ['部门负责人', '中心领导', '综合部（印章管理人）'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else {
                    // 普通员工
                    let labels = [];

                    // 只有当用户属于纠纷调解部时，才添加组长标签
                    if (this.isDisputeMediationDept && this.groups && this.groups.length > 0) {
                        labels.push('组长');
                    }

                    labels.push('部门负责人', '中心领导', '综合部（印章管理人）');
                    return `第${index + 1}审批人（${labels[index]}）：`;
                }
            } else if (this.affairsType === 'contract') {
                // 合同审批类型的标签处理
                // 检查当前用户是否为部门经理
                const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');
                
                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        // 综合部部门经理：法审、中心领导
                        const labels = ['法审（法务岗）', '中心领导'];
                        return `第${index + 1}审批人（${labels[index]}）：`;
                    } else {
                        // 普通综合部人员：部门负责人、法审、中心领导
                        const labels = ['部门负责人', '法审（法务岗）', '中心领导'];
                        return `第${index + 1}审批人（${labels[index]}）：`;
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    // 纠纷调解部部门经理：法审、综合部、中心领导
                    const labels = ['法审（法务岗）', '综合部', '中心领导'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else if (this.permissions.includes('system:user:manager')) {
                    // 其他部门经理：法审、综合部、中心领导
                    const labels = ['法审（法务岗）', '综合部', '中心领导'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、法审、综合部、中心领导
                    const labels = ['部门负责人', '法审（法务岗）', '综合部', '中心领导'];
                    return `第${index + 1}审批人（${labels[index]}）：`;
                } else {
                    // 普通员工
                    let labels = [];

                    // 只有当用户属于纠纷调解部时，才添加组长标签
                    if (this.isDisputeMediationDept && this.groups && this.groups.length > 0) {
                        labels.push('组长');
                    }

                    labels.push('部门负责人', '法审（法务岗）', '综合部', '中心领导');
                    return `第${index + 1}审批人（${labels[index]}）：`;
                }
            } else {
                // 其他类型默认处理（包括请假审批）
                // 检查当前用户是否为部门经理
                const isManager = this.permissions.includes('system:user:mediationManager') || this.permissions.includes('system:user:manager');
                let labels = [];

                if (this.permissions.includes('system:user:anyLeave') || this.permissions.includes('system:user:anyFinance')) {
                    // 综合部人员
                    if (isManager) {
                        // 综合部部门经理：中心领导（借聘员工不需要）
                        if (this.isBorrowedEmployee) {
                            labels = []; // 借聘员工且是部门经理，不需要审批人
                        } else {
                            labels = ['中心领导'];
                        }
                    } else {
                        // 普通综合部人员：部门负责人、中心领导（借聘员工不需要中心领导）
                        if (this.isBorrowedEmployee) {
                            labels = ['部门负责人'];
                        } else {
                            labels = ['部门负责人', '中心领导'];
                        }
                    }
                } else if (this.permissions.includes('system:user:mediationManager')) {
                    // 纠纷调解部部门经理：综合部、中心领导（借聘员工不需要中心领导）
                    if (this.isBorrowedEmployee) {
                        labels = ['综合部'];
                    } else {
                        labels = ['综合部', '中心领导'];
                    }
                } else if (this.permissions.includes('system:user:manager')) {
                    // 其他部门经理：综合部、中心领导（借聘员工不需要中心领导）
                    if (this.isBorrowedEmployee) {
                        labels = ['综合部'];
                    } else {
                        labels = ['综合部', '中心领导'];
                    }
                } else if (this.permissions.includes('system:user:group')) {
                    // 组长级别：部门负责人、综合部、中心领导（借聘员工不需要中心领导）
                    if (this.isBorrowedEmployee) {
                        labels = ['部门负责人', '综合部'];
                    } else {
                        labels = ['部门负责人', '综合部', '中心领导'];
                    }
                } else {
                    // 普通员工
                    labels = [];

                    // 只有当用户属于纠纷调解部时，才添加组长标签
                    if (this.isDisputeMediationDept && this.groups && this.groups.length > 0) {
                        labels.push('组长');
                    }

                    labels.push('部门负责人', '综合部');
                    
                    // 借聘员工不需要中心领导
                    if (!this.isBorrowedEmployee) {
                        labels.push('中心领导');
                    }
                }

                return `第${index + 1}审批人（${labels[index]}）：`;
            }
        },

        // 获取最小审批人数
        getMinApprovers() {
            return this.maxApprovers > 1 ? 1 : this.maxApprovers;
        },

        // 添加审批人
        addApprover() {
            if (this.canAddApprover) {
                this.approvers.push({ userId: null });
                this.emitChange();
            }
        },

        // 移除审批人
        removeApprover(index) {
            if (this.approvers.length > 1) {
                this.approvers.splice(index, 1);
                this.emitChange();
            }
        },

        // 处理审批人变更
        handleApproverChange() {
            // 取消重复校验
            // this.checkDuplicateApprovers();
            this.emitChange();
        },
        
        // 检查重复的审批人
        checkDuplicateApprovers() {
            const userIds = this.approvers
                .filter(approver => approver.userId)
                .map(approver => approver.userId);
            const uniqueUserIds = [...new Set(userIds)];
            const hasDuplicates = userIds.length !== uniqueUserIds.length;
            
            if (hasDuplicates) {
                this.$message.warning('审批人不能重复选择');
            }
        },
        
        // 检查特定审批人是否重复
        isDuplicateApprover(userId, currentIndex) {
            if (!userId) return false;
            
            for (let i = 0; i < this.approvers.length; i++) {
                if (i !== currentIndex && this.approvers[i].userId === userId) {
                    return true;
                }
            }
            return false;
        },

        // 验证所有审批人是否已选择
        validate() {
            // 检查是否所有审批人都已选择
            const allSelected = this.approvers.every(approver => approver.userId);
            
            // 取消重复校验
            // const userIds = this.approvers
            //     .filter(approver => approver.userId)
            //     .map(approver => approver.userId);
            // const uniqueUserIds = [...new Set(userIds)];
            // const hasDuplicates = userIds.length !== uniqueUserIds.length;
            
            this.showError = !allSelected;
            
            if (!allSelected) {
                this.$message.error('请选择所有必要的审批人');
            }
            // else if (hasDuplicates) {
            //     this.$message.error('审批人不能重复选择');
            // }
            
            return allSelected;
        },

        // 发送变更事件
        emitChange() {
            const validApprovers = this.approvers.filter(approver => approver.userId);
            this.$emit('input', this.approvers);
            this.$emit(
                'change',
                validApprovers.map(approver => approver.userId)
            );
            // 重置错误状态
            this.showError = false;
        },

        // 获取对应位置的审批人选项
        getApproverOptions(index) {
            // 其他类型返回所有用户列表
            if (this.affairsType === 'other') {
                console.log('获取other类型审批人选项，allUsers长度:', this.allUsers.length);
                console.log('allUsers数据:', this.allUsers);
                return this.allUsers;
            }

            const label = this.getApproverLabel(index);

            if (label.includes('中心领导')) {
                return this.centerLeaders;
            } else if (label.includes('部门负责人')) {
                return this.getCurrentManagers() || [];
            } else if (label.includes('组长')) {
                return this.groups;
            } else if (label.includes('法审') || label.includes('法务岗')) {
                return this.legalUsers;
            } else if (label.includes('综合部') || label.includes('综合管理部')) {
                return this.anyLeaves;
            } else if (label.includes('印章管理人')) {
                // 如果印章管理人与综合部是同一组人，则返回综合部列表
                return this.sealManagers.length ? this.sealManagers : this.anyLeaves;
            }

            // 默认返回空数组
            return [];
        },

        // 自动选择审批人
        autoSelectApprover(roleName, user) {
            // 查找包含指定角色名称的审批人索引
            for (let i = 0; i < this.approvers.length; i++) {
                const label = this.getApproverLabel(i);
                if (label.includes(roleName)) {
                    // 设置userId并触发变更
                    this.approvers[i].userId = user.userId;
                    this.emitChange();
                    break;
                }
            }
        },

        // 自动选择所有只有一个用户的角色
        autoSelectSingleUsers() {
            // 为中心领导自动选择
            if (this.centerLeaders && this.centerLeaders.length === 1) {
                this.autoSelectApprover('中心领导', this.centerLeaders[0]);
            }

            // if (this.anyLeaves && this.anyLeaves.length === 1) {
            //     this.autoSelectApprover('综合部', this.anyLeaves[0]);
            // }

            // 为部门负责人自动选择
            const currentManagers = this.getCurrentManagers();
            if (currentManagers && currentManagers.length === 1) {
                this.autoSelectApprover('部门负责人', currentManagers[0]);
            }

            // 为组长自动选择
            if (this.groups && this.groups.length === 1) {
                this.autoSelectApprover('组长', this.groups[0]);
            }

            // 为法务岗自动选择
            if (this.legalUsers && this.legalUsers.length === 1) {
                this.autoSelectApprover('法审', this.legalUsers[0]);
            }
        },

        // 加载审批人数据
        loadApproverData() {
            // 重置计数器 - 为other类型增加一个API调用，为其他部门负责人增加一个API调用
            this.pendingApiCalls = this.affairsType === 'other' ? 7 : 6;

            // 如果是other类型，获取所有用户
            if (this.affairsType === 'other') {
                getAllUser().then(res => {
                    console.log('所有用户:', res);
                    this.allUsers = res.data || [];
                    this.apiCallCompleted();
                }).catch(err => {
                    console.error('获取所有用户失败:', err);
                    this.allUsers = [];
                    this.apiCallCompleted();
                });
            }

            // 对于非other类型，也获取常用的角色数据，因为用户可能会切换类型
            // 获取中心领导
            getQueryDeptOrPermission('system:user:center').then(res => {
                console.log('中心领导:', res);
                this.centerLeaders = res.data || [];
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取中心领导失败:', err);
                this.centerLeaders = [];
                this.apiCallCompleted();
            });

            // 获取综合管理部 - 需要整合两个权限的用户
            const anyLeaveUsers = new Map();

            // 获取 anyLeave 权限用户
            getQueryDeptOrPermission('system:user:anyLeave').then(res => {
                console.log('综合管理部(anyLeave):', res);
                if (res.data && res.data.length) {
                    res.data.forEach(user => {
                        anyLeaveUsers.set(user.userId, user);
                    });
                    // 设置临时列表
                    this.anyLeaves = Array.from(anyLeaveUsers.values());
                }
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取anyLeave用户失败:', err);
                this.apiCallCompleted();
            });

            // 获取 anyFinance 权限用户并合并
            getQueryDeptOrPermission('system:user:anyFinance').then(res => {
                console.log('综合管理部(anyFinance):', res);
                if (res.data && res.data.length) {
                    res.data.forEach(user => {
                        anyLeaveUsers.set(user.userId, user);
                    });
                }

                // 将合并后的用户列表设置为综合部用户
                this.anyLeaves = Array.from(anyLeaveUsers.values());
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取anyFinance用户失败:', err);
                // 即使anyFinance失败，也要设置anyLeaves
                this.anyLeaves = Array.from(anyLeaveUsers.values());
                this.apiCallCompleted();
            });

            // 获取部门负责人
            getQueryDeptOrPermission('system:user:mediationManager').then(res => {
                console.log('部门负责人:', res);
                this.managers = res.data || [];
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取部门负责人失败:', err);
                this.managers = [];
                this.apiCallCompleted();
            });

            // 获取组长
            getUserJurisdiction('system:user:group').then(res => {
                console.log('组长:', res);
                this.groups = res.data || [];
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取组长失败:', err);
                this.groups = [];
                this.apiCallCompleted();
            });

            // 获取法务岗
            getQueryDeptOrPermission('system:user:legal').then(res => {
                console.log('法务岗:', res);
                this.legalUsers = res.data || [];
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取法务岗失败:', err);
                this.legalUsers = [];
                this.apiCallCompleted();
            });

            // 获取其他部门负责人
            getQueryDeptOrPermission('system:user:manager').then(res => {
                console.log('其他部门负责人:', res);
                this.otherManagers = res.data || [];
                this.apiCallCompleted();
            }).catch(err => {
                console.error('获取其他部门负责人失败:', err);
                this.otherManagers = [];
                this.apiCallCompleted();
            });
            
            // 标记数据已加载
            this.dataLoaded = true;
        },
        // API调用完成处理
        apiCallCompleted() {
            this.pendingApiCalls--;

            // 当所有API调用都完成时，初始化审批人列表并自动选择
            if (this.pendingApiCalls <= 0) {
                console.log('所有API调用已完成，初始化审批人列表');
                this.initApprovers();
                this.autoSelectSingleUsers();

                // 强制更新组件
                this.$forceUpdate();
            }
        },
        filterDisputeMediationIds(data) {
            const result = [];
            
            // 递归添加指定节点及其所有子节点的ID
            const addAllChildrenIds = (node) => {
                result.push(node.id);
                if (node.children && node.children.length > 0) {
                    node.children.forEach(child => {
                        addAllChildrenIds(child); // 递归添加所有子节点
                    });
                }
            };
            
            // 遍历树形结构，找到纠纷调解部节点
            const traverse = (nodes) => {
                nodes.forEach((node) => {
                    if (node.label === "纠纷调解部") {
                        // 找到纠纷调解部，递归添加它及其所有子节点的ID
                        addAllChildrenIds(node);
                    }
                    if (node.children) {
                        traverse(node.children); // 继续遍历其他节点
                    }
                });
            };
            
            traverse(data);
            return result;
        }
    },
    mounted() {
        console.log('当前用户权限:', this.permissions);
        console.log('当前事务类型:', this.affairsType);
        console.log('当前用户信息:', this.userInfo);
        // deptTreeSelect().then(res => {
        //     this.deptIdList = this.filterDisputeMediationIds(res.data);
        // });
        listDeptTree().then(res => {
            console.log('树:', res);
            this.deptIdList = this.filterDisputeMediationIds(res.data);
            console.log('纠纷调解部部门ID列表:', this.deptIdList);
        });

        // 加载审批人数据（数据加载完成后会自动调用initApprovers）
        this.loadApproverData();

        // 如果初始类型是other，确保加载所有用户数据
        if (this.affairsType === 'other' && this.allUsers.length === 0) {
            console.log('初始类型为other，加载所有用户数据');
            getAllUser().then(res => {
                console.log('初始加载所有用户:', res);
                this.allUsers = res.data || [];
                this.$forceUpdate();
            }).catch(err => {
                console.error('初始加载所有用户失败:', err);
                this.allUsers = [];
            });
        }
    }
};
</script>

<style scoped>
.approver-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.approver-item .el-select {
    flex: 1;
}

.approver-delete {
    margin-left: 10px;
}

.add-approver {
    margin-top: 10px;
    margin-left: 100px;
}

.is-error .el-input__inner {
    border-color: #F56C6C;
}

.error-message {
    color: #F56C6C;
    font-size: 12px;
    margin-left: 8px;
}
</style>
