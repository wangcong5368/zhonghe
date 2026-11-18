<!-- 终止办结 -->
<template xmlns="http://www.w3.org/1999/html">
    <el-dialog :title="title" :visible.sync="visible" width="800px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="110px">
            <!--      <el-form-item :label="DM_STATUS.DM_STATUS2 === this.row.status ? '终止受理原因' : (DM_STATUS.DM_STATUS4 === this.row.status ? '终止调解原因' : '终止原因')" prop="terminateReason">-->
            <!--        <el-select v-model="form.terminateReason" placeholder="请选择" clearable style="width: 100%">-->
            <!--          <el-option-->
            <!--            v-for="dict in dict.type.dm_terminate_reason"-->
            <!--            :key="dict.value"-->
            <!--            :label="dict.label"-->
            <!--            :value="dict.value"-->
            <!--          />-->
            <!--        </el-select>-->
            <!--      </el-form-item>-->
            <el-form-item
                :rules="[{ required: DM_STATUS.DM_STATUS2 === this.row.status, message: '终止受理原因为必填项', trigger: 'blur' }]"
                label="终止受理原因"
                prop="selfRejectReason"
                v-if="DM_STATUS.DM_STATUS2 === this.row.status"
            >
                <el-select v-model="form.selfRejectReason" placeholder="请选择终止受理原因" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_self_reject_reason" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item
                v-if="DM_STATUS.DM_STATUS2 === row.status"
                label="案件类型"
                prop="selfCollectionCaseType"
                :rules="[{ required: true, message: '案件类型为必填项', trigger: 'change' }]"
            >
                <el-select v-model="form.selfCollectionCaseType" placeholder="请选择案件类型" clearable style="width: 100%">
                    <el-option v-for="dict in caseTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item
                :rules="[{ required: DM_STATUS.DM_STATUS4 === this.row.status, message: '终止调解原因为必填项', trigger: 'blur' }]"
                label="终止调解原因"
                prop="terminateReason"
                v-if="DM_STATUS.DM_STATUS4 === this.row.status"
            >
                <el-select v-model="form.terminateReason" placeholder="请选择终止调解原因" clearable style="width: 100%">
                    <el-option v-for="dict in dict.type.dm_terminate_mediate_reason" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="终止备注" prop="terminateRemark">
                <el-input v-model="form.terminateRemark" placeholder="请输入" clearable maxlength="50" show-word-limit />
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { terminate, saveOrUpdateDisputeMediationExpand, getDisputeMediationExpandInfo } from '@/api/project/disputeMediation';
import { DEPT_TYPE, DM_STATUS } from '@/views/constant/CommonConstant';

export default {
    name: '',
    computed: {
        DM_STATUS() {
            return DM_STATUS;
        },
        caseTypeOptions() {
            const insurance = this.row.industry === 'insurance' || (!this.row.industry && DEPT_TYPE.insuranceList.includes(this.row.deptType));
            return insurance ? this.dict.type.dm_insurance_self_collection_case_type : this.dict.type.dm_bank_self_collection_case_type;
        }
    },
    props: ['title'],
    dicts: ['dm_self_reject_reason', 'dm_terminate_mediate_reason', 'dm_bank_self_collection_case_type', 'dm_insurance_self_collection_case_type'],
    data() {
        return {
            row: {},
            loading: false,
            visible: false,
            form: {},
            rules: {
                // terminateReason: [{ required: true, message: '必填项', trigger: 'blur' }]
            }
        };
    },
    methods: {
        open(row) {
            this.row = row;
            this.resetForm('form');
            this.form = {
                workOrderId: row.workOrderId,
                terminateReason: undefined,
                selfRejectReason: undefined,
                selfCollectionCaseType: undefined,
                terminateRemark: undefined
            };
            const openedForm = this.form;
            getDisputeMediationExpandInfo(row.workOrderId)
                .then(res => {
                    if (this.form !== openedForm || !this.visible) return;
                    if (res.data != null && res.data.selfRejectReason != null && res.data.selfRejectReason !== '') {
                        this.$set(this.form, 'selfRejectReason', String(res.data.selfRejectReason));
                    }
                    if (DM_STATUS.DM_STATUS2 === row.status && !this.form.selfCollectionCaseType
                        && res.data != null && res.data.selfCollectionCaseType != null && res.data.selfCollectionCaseType !== '') {
                        this.$set(this.form, 'selfCollectionCaseType', String(res.data.selfCollectionCaseType));
                    }
                })
                .catch(() => {});
            this.visible = true;
        },
        submitForm() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    this.loading = true;
                    const { selfRejectReason, ...restForm } = this.form;
                    const saveReason = DM_STATUS.DM_STATUS2 === this.row.status
                        ? saveOrUpdateDisputeMediationExpand({
                            workOrderId: this.form.workOrderId,
                            selfRejectReason
                        })
                        : Promise.resolve();

                    saveReason
                        .then(() => terminate({ ...restForm }))
                        .then(() => {
                    const { selfRejectReason, selfCollectionCaseType, ...restForm } = this.form;
                    if (DM_STATUS.DM_STATUS2 === this.row.status) {
                        restForm.selfCollectionCaseType = selfCollectionCaseType;
                    }

                    terminate({ ...restForm })
                        .then(async res => {
                            if (res.code === 200) {
                                await saveOrUpdateDisputeMediationExpand({
                                    workOrderId: this.form.workOrderId,
                                    selfRejectReason
                                });
                            }
                            this.$modal.msgSuccess('操作成功');
                            this.loading = false;
                            this.visible = false;
                            this.$emit('callback');
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                }
            });
        },
        cancel() {
            this.visible = false;
        }
    }
};
</script>
