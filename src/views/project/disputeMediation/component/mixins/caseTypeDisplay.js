import { getByDeptId } from '@/api/project/disputeMediation';
import { DEPT_TYPE, DM_ENTRY_CHANNEL } from '@/views/constant/CommonConstant.js';

function normalize(value) {
  return value == null ? '' : String(value).trim();
}

function findDepartment(options, deptId, deptName) {
  for (const option of options || []) {
    if ((deptId && normalize(option.deptId) === deptId) || (deptName && normalize(option.deptName) === deptName)) {
      return option;
    }
    const child = findDepartment(option.children, deptId, deptName);
    if (child) {
      return child;
    }
  }
  return undefined;
}

export default {
  data() {
    return {
      caseTypeInstitutionLabel: ''
    };
  },
  computed: {
    caseTypeDepartment() {
      const deptId = normalize(this.form.deptId);
      const mappedDepartment = deptId && this.deptMap && (
        this.deptMap.get(this.form.deptId) ||
        this.deptMap.get(Number(deptId)) ||
        this.deptMap.get(deptId)
      );
      const department = mappedDepartment || findDepartment(this.deptOptions, deptId, normalize(this.form.deptName));
      return {
        id: department ? normalize(department.deptId) : deptId,
        type: (department && department.type) || this.form.deptType
      };
    },
    displayChannelType() {
      const channelType = normalize(this.form.channelType);
      if (channelType) {
        return channelType;
      }
      const entryChannel = normalize(this.form.entryChannel);
      if (!entryChannel) {
        return '';
      }
      return [DM_ENTRY_CHANNEL.C, DM_ENTRY_CHANNEL.G].includes(entryChannel) ? '0' : '1';
    },
    displayInstitutionType() {
      const institutionType = normalize(this.form.institutionType);
      if (institutionType) {
        return institutionType;
      }
      if (DEPT_TYPE.insuranceList.includes(this.caseTypeDepartment.type)) {
        return this.caseTypeDepartment.type;
      }
      if (!this.caseTypeInstitutionLabel) {
        return '';
      }
      const options = this.dict.type.dm_institution_type || [];
      const matched = options.find(item => normalize(item.label) === this.caseTypeInstitutionLabel);
      return matched ? normalize(matched.value) : '';
    },
    displayInstitutionTypeOptions() {
      if (!DEPT_TYPE.insuranceList.includes(this.caseTypeDepartment.type)) {
        return this.dict.type.dm_institution_type || [];
      }
      const options = this.dict.type.dept_type || [];
      const insuranceGroup = (options.options || []).find(item => item.label === '保险机构');
      return insuranceGroup ? [insuranceGroup] : options.filter(item => DEPT_TYPE.insuranceList.includes(item.value));
    },
    caseTypeInstitutionLookupId() {
      if (normalize(this.form.institutionType) || DEPT_TYPE.insuranceList.includes(this.caseTypeDepartment.type)) {
        return '';
      }
      return this.caseTypeDepartment.id;
    }
  },
  watch: {
    caseTypeInstitutionLookupId: {
      immediate: true,
      handler(deptId) {
        this.caseTypeInstitutionLabel = '';
        const requestId = (this._caseTypeRequestId || 0) + 1;
        this._caseTypeRequestId = requestId;
        this._caseTypeLookup = deptId
          ? getByDeptId(deptId)
            .then(response => {
              if (requestId === this._caseTypeRequestId && response && response.code === 200 && response.data) {
                this.caseTypeInstitutionLabel = normalize(response.data.departLable);
              }
            })
            .catch(() => {})
          : Promise.resolve();
      }
    }
  },
  methods: {
    validateDisplayedChannelType(rule, value, callback) {
      callback(this.displayChannelType ? undefined : new Error(rule.message));
    },
    validateDisplayedInstitutionType(rule, value, callback) {
      callback(this.displayInstitutionType ? undefined : new Error(rule.message));
    },
    async prepareCaseTypesForSubmit() {
      await this.$nextTick();
      await this._caseTypeLookup;
      if (!normalize(this.form.channelType)) {
        this.$set(this.form, 'channelType', this.displayChannelType || null);
      }
      if (!normalize(this.form.institutionType)) {
        this.$set(this.form, 'institutionType', this.displayInstitutionType || null);
      }
    }
  }
};
