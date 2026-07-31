<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" >
      <el-form-item label="机构名称" prop="deptName">
        <el-input v-model="queryParams.deptName" placeholder="请输入机构名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="机构状态" clearable >
          <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:dept:add']">新增</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>-->
<!--      </el-col>-->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"/>
    </el-row>

    <el-table ref="table" v-if="refreshTable" v-loading="loading" :data="deptList" row-key="deptId"  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" lazy :load="load" @expand-change="handleExpandChange">
      <el-table-column prop="deptName" label="机构名称" width="500px"/>
      <el-table-column prop="shortName" label="机构简称" width="400" v-if="columns.find((i) => i.key === 'shortName').visible" />
      <el-table-column prop="type" align="center" label="类型" v-if="columns.find((i) => i.key === 'type').visible" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.dept_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column prop="level" align="center" label="等级" v-if="columns.find((i) => i.key === 'level').visible" >
        <template slot-scope="scope">
          <dict-tag v-if="DEPT_TYPE.centerDept === scope.row.type" :options="dict.type.center_level" :value="scope.row.level" />
          <dict-tag v-if="DEPT_TYPE.bankList.includes(scope.row.type) || DEPT_TYPE.nonBankList.includes(scope.row.type) || DEPT_TYPE.insuranceList.includes(scope.row.type)" :options="dict.type.dept_level" :value="scope.row.level"/>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" align="center" label="排序" v-if="columns.find((i) => i.key === 'orderNum').visible" width="50px" />
      <el-table-column prop="status" align="center" label="状态" v-if="columns.find((i) => i.key === 'status').visible" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns.find((i) => i.key === 'createTime').visible" width="100px" >
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.createBy" placement="right" v-if="scope.row.createBy" >
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </el-tooltip>
          <span v-if="!scope.row.createBy">{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" v-if="columns.find((i) => i.key === 'updateTime').visible" width="100px" >
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" :content="scope.row.updateBy" placement="right" v-if="scope.row.updateBy">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </el-tooltip>
          <span v-if="!scope.row.updateBy">{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:dept:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:dept:add']"
            v-if="!((scope.row.type === DEPT_TYPE.centerDept && scope.row.level === '3') || (DEPT_TYPE.bankList.includes(scope.row.type) && scope.row.level === '4') || (DEPT_TYPE.insuranceList.includes(scope.row.type) && scope.row.level === '4') || (DEPT_TYPE.nonBankList.includes(scope.row.type) && scope.row.level === '4'))"
          >新增 </el-button >
          <el-button
            v-if="scope.row.parentId !== 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:dept:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改机构对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.deptId !== $store.getters.userInfo.deptId">
            <el-form-item label="上级机构" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="选择上级机构" :disabled="!!form.deptId" @input="deptChange"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="类型" prop="type">
              <el-cascader v-model="form.type" :options="dict.type.dept_type.copy && dict.type.dept_type.copy.options ? dict.type.dept_type.copy.options : []" :props="{ expandTrigger: 'hover', emitPath: false }" placeholder="请选择机构类型" :disabled="!!form.deptId"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="机构名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入机构名称" maxlength="40"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="机构简称" prop="shortName" v-if="form.type !== undefined && ![DEPT_TYPE.area, DEPT_TYPE.center, DEPT_TYPE.centerDept].includes(form.type)">
              <el-input v-model="form.shortName" placeholder="请输入机构简称" maxlength="40" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入联系人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="机构状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild, } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {DEPT_TYPE} from "@/views/constant/CommonConstant.js";

export default {
  name: "Dept",
  dicts: ["sys_normal_disable", "dept_type", "dept_level", "center_level"],
  components: {Treeselect},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [],
      // 机构树选项
      deptOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        deptName: undefined,
        status: undefined,
      },
      // 列信息
      columns: [
        {key: "type", label: `类型`, visible: true},
        {key: "shortName", label: `机构简称`, visible: false},
        {key: "level", label: `等级`, visible: true},
        {key: "orderNum", label: `排序`, visible: true},
        {key: "status", label: `状态`, visible: true},
        {key: "createTime", label: `创建时间`, visible: true},
        {key: "updateTime", label: `修改时间`, visible: true},
      ],
      // 机构字典 {id:机构对象}
      deptMap: new Map(),
      // 用户表格懒加载
      deptIdMap: new Map(),
      expandSet: new Set(),
      scrollPosition: 0,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentId: [
          {required: true, message: "上级机构为必填项", trigger: "blur"},
        ],
        type: [{required: true, message: "类型为必填项", trigger: "blur"}],
        deptName: [
          {required: true, message: "机构名称为必填项", trigger: "blur"},
        ],
        shortName: [
          {required: true, message: "机构简称为必填项", trigger: "blur"},
        ],
        orderNum: [
          {required: true, message: "显示排序为必填项", trigger: "blur"},
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        // phone: [
        //   {
        //     pattern: /^1[3456789][0-9]\d{8}$/,
        //     message: "请输入正确的手机号码",
        //     trigger: "blur",
        //   },
        // ],
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
    };
  },
  created() {
    this.getList();
    window.addEventListener('scroll', () => {
      this.scrollPosition = window.scrollY || document.documentElement.scrollTop;
    });
  },
  methods: {
    /** 查询机构列表 */
    getList() {
      const finalScrollPosition = this.scrollPosition;
      this.loading = true;
      this.refreshTable = false;
      this.deptList = [];
      this.childrenListMap = new Map();
      this.deptIdMap = new Map();
      this.$nextTick(() => {
        this.refreshTable = true;
      });
      listDept(this.queryParams).then((response) => {
        // 第一次循环，初始化deptIdMap(id:dept)和childrenListMap(parentId:children)
        for (let d of response.data) {
          this.deptIdMap.set(d.deptId, d);
          if (!this.childrenListMap.has(d.parentId)) {
            this.childrenListMap.set(d.parentId, []);
          }
          this.childrenListMap.get(d.parentId).push(d);
          // 默认展开机构类型为地区的机构
          if (DEPT_TYPE.area === d.type) {
            this.expandSet.add(d.deptId);
          }
        }
        // 第二次循环，找出parentId没在deptIdMap的机构，将这些机构作为一级，赋值给deptList
        this.deptList = response.data.filter(d => {
          if (this.childrenListMap.has(d.deptId)) {
            d.hasChildren = true;
          }
          return !this.deptIdMap.has(d.parentId);
        })
        // 自动展开，按deptId从小到大排列，可以保证先打开上级，再打开下级(前提是机构不能修改上级机构)
        this.expansion([...this.expandSet].sort((a, b) => a - b), finalScrollPosition);

        // this.deptList = this.handleTree(response.data, "deptId");
        this.loading = false;
      });
    },
    expansion(expandList, finalScrollPosition) {
      if (expandList.length > 0) {
        setTimeout(() => {
          let deptId = expandList.shift();
          const row = this.deptIdMap.get(deptId);
          if (row && row.hasChildren) {
            // 触发展开，走懒加载
            this.$refs.table.store.loadOrToggle(row);
            this.$refs.table.toggleRowExpansion(row, true);
          }
          this.expansion(expandList, finalScrollPosition);
        }, 1);
      } else {
        this.$nextTick(() => {
          window.scrollTo(0, finalScrollPosition)
        })
      }
    },
    load(row, treeNode, resolve) {
      // 触发懒加载，可以走api接口
      resolve(this.childrenListMap.get(row.deptId))
    },
    handleExpandChange(row, expanded) {
      if (expanded) {
        this.expandSet.add(row.deptId);
      } else {
        this.expandSet.delete(row.deptId);
        // 还原懒加载
        this.$refs.table.store.states.treeData[row.deptId].loaded = false;
        this.$refs.table.store.states.treeData[row.deptId].expanded = false;
      }
    },
    /** 转换机构数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        deptId: undefined,
        parentId: undefined,
        type: undefined,
        level: undefined,
        deptName: undefined,
        shortName: undefined,
        orderNum: 1,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: "0",
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row !== undefined) {
        this.form.parentId = row.deptId;
      }
      this.open = true;
      this.title = "添加机构";
      listDept().then((response) => {
        this.deptOptions = this.handleTree(response.data, "deptId");
        this.initDeptMap(this.deptOptions);
        this.deptChange();
      });
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
      // this.isExpandAll = !this.isExpandAll;
      // if (this.isExpandAll) {
      //   console.log("全展开", this.childrenListMap.keys());
      //   console.log(new Set([...this.expandSet, ...this.childrenListMap.keys()]));
      //   this.expansion([...new Set([...this.expandSet, ...this.childrenListMap.keys()])].sort((a, b) => a - b), 0);
      // } else {
      //   console.log("全折叠");
      //   [...this.expandSet].sort((a, b) => b - a).map(deptId => {
      //     this.handleExpandChange(this.deptIdMap.get(deptId), false);
      //   })
      // }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getDept(row.deptId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改机构";
        // listDeptExcludeChild(row.deptId).then(response => {
        //   this.deptOptions = this.handleTree(response.data, "deptId");
        //   if (this.deptOptions.length === 0) {
        //     const noResultsOptions = { deptId: this.form.parentId, deptName: this.form.parentName, children: [] };
        //     this.deptOptions.push(noResultsOptions);
        //   }
        // });
        listDept().then((response) => {
          this.deptOptions = this.handleTree(response.data, "deptId");
          this.initDeptMap(this.deptOptions);
          this.deptChange();
        });
      });
    },
    initDeptMap(array) {
      array.forEach((item) => {
        this.deptMap.set(item.deptId, item);
        if (item.children) {
          this.initDeptMap(item.children);
        }
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.deptId) {
            updateDept(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDept(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.expandSet.add(this.form.parentId);
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal
        .confirm('是否确认删除名称为"' + row.deptName + '"的数据项？')
        .then(function () {
          return delDept(row.deptId);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {
        });
    },
    deptChange() {
      const type = this.form.type
      this.form.type = undefined
      if (this.form && this.form.parentId !== undefined) {
        // 如果有父机构
        if (this.form.parentId === 0 || this.form.parentId === 100) {
          // 顶级机构和父机构是顶级机构，机构类型只能是地区
          this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value === DEPT_TYPE.area))
        } else if (this.deptMap.get(this.form.parentId)) {
          if (this.deptMap.get(this.form.parentId).type === DEPT_TYPE.area) {
            // 父机构的类型是地区
            if (this.$store.getters.userInfo.admin || this.form.deptId !== undefined) {
              // 如果是超管或者修改时，机构类型才有中心，加上银行、保险、非银
              this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value !== DEPT_TYPE.area && item.value !== DEPT_TYPE.centerDept))
            } else {
              // 非超管新增时，机构类型为银行、保险、非银
              this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value !== DEPT_TYPE.area && item.value !== DEPT_TYPE.center && item.value !== DEPT_TYPE.centerDept))
            }
          } else if ((this.deptMap.get(this.form.parentId).type === DEPT_TYPE.center || this.deptMap.get(this.form.parentId).type === DEPT_TYPE.centerDept)) {
            // 父机构的类型是中心，机构类型只能是内部管理机构
            this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value === DEPT_TYPE.centerDept))
          } else if (DEPT_TYPE.bankList.includes(this.deptMap.get(this.form.parentId).type)) {
            // 父机构的类型是银行，机构类型只能是银行
            this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value === this.deptMap.get(this.form.parentId).type))
          } else if (DEPT_TYPE.insuranceList.includes(this.deptMap.get(this.form.parentId).type)) {
            // 父机构的类型是保险，机构类型只能是保险
            this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value === this.deptMap.get(this.form.parentId).type))
          } else if (DEPT_TYPE.nonBankList.includes(this.deptMap.get(this.form.parentId).type)) {
            // 父机构的类型是非银，机构类型只能是非银
            this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value === this.deptMap.get(this.form.parentId).type))
          }
        } else if (!this.deptMap.get(this.form.parentId)) {
          // 管理员修改自己的机构
          this.$set(this.dict.type.dept_type, 'copy', this.dict.type.dept_type.filter((item) => item.value === type))
        }
        this.initDict(this.dict.type.dept_type.copy)
        if (!this.form.deptId) {
          if (this.dict.type.dept_type.copy.length === 1) {
            this.$nextTick(() => this.form.type = this.dict.type.dept_type.copy[0].value)
          }
        } else {
          this.$nextTick(() => this.form.type = type)
        }
      } else {
        // 没有父机构
        this.$set(this.dict.type.dept_type, 'copy', [])
      }
    }
  },
};
</script>
