<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--机构数据-->
      <!--      <el-col :span="4" :xs="24">-->
      <!--        <div class="head-container">-->
      <!--          <el-input-->
      <!--            v-model="deptName"-->
      <!--            placeholder="请输入机构名称"-->
      <!--            clearable-->
      <!--            size="small"-->
      <!--            prefix-icon="el-icon-search"-->
      <!--            style="margin-bottom: 20px"-->
      <!--          />-->
      <!--        </div>-->
      <!--        <div class="head-container">-->
      <!--          <el-tree-->
      <!--            :data="deptOptions"-->
      <!--            :props="defaultProps"-->
      <!--            :expand-on-click-node="false"-->
      <!--            :filter-node-method="filterNode"-->
      <!--            ref="tree"-->
      <!--            node-key="id"-->
      <!--            default-expand-all-->
      <!--            highlight-current-->
      <!--            @node-click="handleNodeClick"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </el-col>-->
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="登录账号" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入登录账号"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="用户状态"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="dict in dict.type.sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['system:user:add']"
            >新增</el-button>
          </el-col>
          <!--          <el-col :span="1.5">-->
          <!--            <el-button-->
          <!--              type="success"-->
          <!--              plain-->
          <!--              icon="el-icon-edit"-->
          <!--              size="mini"-->
          <!--              :disabled="single"-->
          <!--              @click="handleUpdate"-->
          <!--              v-hasPermi="['system:user:edit']"-->
          <!--            >修改</el-button>-->
          <!--          </el-col>-->
          <!--          <el-col :span="1.5">-->
          <!--            <el-button-->
          <!--              type="danger"-->
          <!--              plain-->
          <!--              icon="el-icon-delete"-->
          <!--              size="mini"-->
          <!--              :disabled="multiple"-->
          <!--              @click="handleDelete"-->
          <!--              v-hasPermi="['system:user:remove']"-->
          <!--            >删除</el-button>-->
          <!--          </el-col>-->
          <!--          <el-col :span="1.5">-->
          <!--            <el-button-->
          <!--              type="info"-->
          <!--              plain-->
          <!--              icon="el-icon-upload2"-->
          <!--              size="mini"-->
          <!--              @click="handleImport"-->
          <!--              v-hasPermi="['system:user:import']"-->
          <!--            >导入</el-button>-->
          <!--          </el-col>-->
          <!--          <el-col :span="1.5">-->
          <!--            <el-button-->
          <!--              type="warning"-->
          <!--              plain-->
          <!--              icon="el-icon-download"-->
          <!--              size="mini"-->
          <!--              @click="handleExport"-->
          <!--              v-hasPermi="['system:user:export']"-->
          <!--            >导出</el-button>-->
          <!--          </el-col>-->
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
          <!--          <el-table-column type="selection" width="50" align="center" />-->
          <el-table-column label="序号" type="index" align="center" v-if="columns.find(i=>i.key==='index').visible">
            <template slot-scope="scope">
              <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
            </template>
          </el-table-column>
          <el-table-column label="登录账号" align="center" key="userName" prop="userName" v-if="columns.find(i=>i.key==='userName').visible" :show-overflow-tooltip="true" />
          <el-table-column label="用户姓名" align="center" key="nickName" prop="nickName" v-if="columns.find(i=>i.key==='nickName').visible" :show-overflow-tooltip="true" />
          <el-table-column label="归属机构" align="center" key="deptName" prop="dept.deptName" v-if="columns.find(i=>i.key==='deptName').visible" :show-overflow-tooltip="true" width="500"/>
          <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber" v-if="columns.find(i=>i.key==='phonenumber').visible" width="120" />
          <el-table-column label="状态" align="center" key="status" v-if="columns.find(i=>i.key==='status').visible">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
                :disabled="scope.row.userId === $store.getters.userInfo.userId"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns.find(i=>i.key==='createTime').visible" width="100">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="160"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.userId !== 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:user:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:user:remove']"
                :disabled="scope.row.userId === $store.getters.userInfo.userId"
              >删除</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-key"
                @click="handleResetPwd(scope.row)"
                v-hasPermi="['system:user:resetPwd']"
              >重置密码</el-button>
              <!--              <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:user:resetPwd', 'system:user:edit']">-->
              <!--                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>-->
              <!--                <el-dropdown-menu slot="dropdown">-->
              <!--                  <el-dropdown-item command="handleResetPwd" icon="el-icon-key"-->
              <!--                    v-hasPermi="['system:user:resetPwd']">重置密码</el-dropdown-item>-->
              <!--                  <el-dropdown-item command="handleAuthRole" icon="el-icon-circle-check"-->
              <!--                    v-hasPermi="['system:user:edit']">分配角色</el-dropdown-item>-->
              <!--                </el-dropdown-menu>-->
              <!--              </el-dropdown>-->
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="归属机构" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择归属机构" :disabled="!!form.userId" @input="deptRoleChange"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="登录账号" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入登录账号" maxlength="30" :disabled="!!form.userId"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户姓名" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户姓名" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber" :rules="[{ required: form.deptId  && (DEPT_TYPE.bankList.includes(deptMap.get(form.deptId).type) || DEPT_TYPE.nonBankList.includes(deptMap.get(form.deptId).type) || DEPT_TYPE.insuranceList.includes(deptMap.get(form.deptId).type) || isMediator), message: '手机号码为必填项', trigger: 'blur' }, {pattern: /^(1[3-9]\d{9}|(0\d{2,3}-)?\d{7,8})$/,message: '请输入正确的手机号码',trigger: 'blur'}]">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择性别" style="width: 100%" clearable>
                <el-option
                  v-for="dict in dict.type.sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                  :disabled="form.userId === $store.getters.userInfo.userId"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="岗位角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择岗位角色" style="width: 100%;" @change="deptRoleChange">
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status === 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="isMediator" label="参与派单" prop="participate">
              <el-switch
                v-model="form.participate"
                active-color="#13ce66"
              >
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.deptId && DEPT_TYPE.centerDept === this.deptMap.get(form.deptId).type" label="教育背景" prop="educationalBackground">
              <el-input v-model="form.educationalBackground" placeholder="请输入教育背景" maxlength="10"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.deptId && DEPT_TYPE.centerDept === this.deptMap.get(form.deptId).type" label="政治面貌" prop="politicalStatus">
              <el-input v-model="form.politicalStatus" placeholder="请输入政治面貌" maxlength="10"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="form.deptId && DEPT_TYPE.centerDept === this.deptMap.get(form.deptId).type" label="工作经历" prop="workExperience">
              <el-input v-model="form.workExperience" placeholder="请输入工作经历" maxlength="100" type="textarea" :autosize="{ minRows: 2, maxRows: 5}"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="form.deptId && DEPT_TYPE.centerDept === this.deptMap.get(form.deptId).type" label="技能特长" prop="specialty">
              <el-input v-model="form.specialty" placeholder="请输入技能特长" maxlength="100" type="textarea" :autosize="{ minRows: 2, maxRows: 5}"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.deptId && DEPT_TYPE.centerDept === this.deptMap.get(form.deptId).type" label="原单位职级" label-width="90px" prop="oldCompanyRank">
              <el-input v-model="form.oldCompanyRank" placeholder="请输入原单位职级" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="isMediator || isDMEntryClerk" label="坐席号" prop="seatNum">
              <el-input v-model="form.seatNum" placeholder="请输入坐席号" @input="handleSeatNumInput"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="isMediator" label="擅长领域" prop="goodAt">
              <el-cascader
                v-model="form.goodAt"
                :options="dict.type.dm_business_type.options"
                placeholder="请选择擅长领域"
                clearable
                :props="{ expandTrigger: 'hover', multiple: true , emitPath: false}"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item v-if="isMediator" label="关联机构" prop="workDeptId">
              <treeselect v-model="form.workDeptId" :noOptionsText="'无关联机构'" clearable :options="associationDeptOptions"
                          :show-count="true" :normalizer="normalizer" placeholder="请选择关联机构"/>
            </el-form-item>
          </el-col>
        </el-row>
        <!--        <el-row>-->
        <!--          <el-col :span="12">-->
        <!--            <el-form-item label="岗位">-->
        <!--              <el-select v-model="form.postIds" multiple placeholder="请选择岗位">-->
        <!--                <el-option-->
        <!--                  v-for="item in postOptions"-->
        <!--                  :key="item.postId"-->
        <!--                  :label="item.postName"-->
        <!--                  :value="item.postId"-->
        <!--                  :disabled="item.status == 1"-->
        <!--                ></el-option>-->
        <!--              </el-select>-->
        <!--            </el-form-item>-->
        <!--          </el-col>-->
        <!--          <el-col :span="12">-->
        <!--            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">-->
        <!--              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password/>-->
        <!--            </el-form-item>-->
        <!--          </el-col>-->
        <!--        </el-row>-->
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser, getUser, delUser, addUser, updateUser, resetUserPwd, changeUserStatus, deptTreeSelect } from "@/api/system/user";
import { getToken } from "@/utils/auth";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { DEPT_TYPE } from "@/views/constant/CommonConstant.js"
import {institutionList} from "@/api/system/dept";

export default {
  name: "User",
  dicts: ['sys_normal_disable', 'sys_user_sex','dm_business_type'],
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 机构树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 机构名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 登录用于拥有的角色map
      roleMap: new Map(),
      // 机构map
      deptMap: new Map(),
      // 关联机构
      associationDeptOptions: [],
      // 是否中心内部管理机构
      isCenterDept: false,
      // 是否调解员
      isMediator: false,
      // 是否接线员
      isDMEntryClerk: false,
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: "Bearer " + getToken()},
        // 上传的地址
        url: this._baseUrl + "/system/user/importData"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
      },
      // 列信息
      columns: [
        {key: 'index', label: `序号`, visible: true},
        {key: 'userName', label: `登录账号`, visible: true},
        {key: 'nickName', label: `用户姓名`, visible: true},
        {key: 'deptName', label: `归属机构`, visible: true},
        {key: 'phonenumber', label: `手机号码`, visible: true},
        {key: 'status', label: `状态`, visible: true},
        {key: 'createTime', label: `创建时间`, visible: true}
      ],
      // 表单校验
      rules: {
        userName: [
          {required: true, message: "登录账号为必填项", trigger: "blur"},
          {min: 2, max: 20, message: '登录账号长度必须介于 2 和 20 之间', trigger: 'blur'}
        ],
        deptId: [
          {required: true, message: "归属机构称为必填项", trigger: "blur"},
        ],
        nickName: [
          {required: true, message: "用户姓名为必填项", trigger: "blur"}
        ],
        password: [
          {required: true, message: "用户密码为必填项", trigger: "blur"},
          {pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur"},
          {
            pattern: /^(?![\s\S]*[\u4e00-\u9fa5])\S{8,16}$/,
            message: '密码长度8~16位，须包含字母、数字，不允许有空格及中文',
            trigger: 'blur'
          }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          {
            pattern: /^1[3456789][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        goodAt: [
          {required: true, message: "擅长领域为必填项", trigger: "change"},
        ],
        workDeptId: [
          {required: true, message: "关联机构为必填项", trigger: "input"},
        ],
        seatNum: [
          {required: true, message: "坐席号为必填项", trigger: "input"},
        ],
        participate: [
          {required: true, message: "参与派单为必填项", trigger: "change"},
        ],
      },
      // 常量
      DEPT_TYPE: DEPT_TYPE, // 机构类型
    };
  },
  watch: {
    // // 根据名称筛选机构树
    // deptName(val) {
    //   this.$refs.tree.filter(val);
    // },
    'dict.type.dm_business_type'(newV, oldV) {
      this.initDict(newV, oldV);
    },
  },
  created() {
    this.getList();
    this.getDeptTree();
    this.getConfigKey("sys.user.initPassword").then(response => {
      this.initPassword = response.msg;
    });
    institutionList().then(response => {
      this.associationDeptOptions = this.handleTree(response.data, "deptId");
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询机构下拉树结构 */
    getDeptTree() {
      deptTreeSelect().then(response => {
        this.deptOptions = response.data;
        this.initDeptMap(response.data);
        // this.initAssociationDeptOptions(response.data);
      });
    },
    initDeptMap(array) {
      array.forEach(item => {
        this.deptMap.set(item.id, item);
        if (item.children) {
          this.initDeptMap(item.children)
        }
      })
    },
    // initAssociationDeptOptions(array){
    //   array.forEach(item => {
    //     if (item.type === this.DEPT_TYPE.area){
    //       if (item.children) {
    //         this.initAssociationDeptOptions(item.children)
    //       }
    //     } else if (item.type !== this.DEPT_TYPE.center && item.type !== this.DEPT_TYPE.centerDept) {
    //       this.associationDeptOptions.push(item);
    //     }
    //   })
    // },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.handleQuery();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.userName + '"用户吗？').then(function () {
        return changeUserStatus(row.userId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
        educationalBackground: undefined,
        workExperience: undefined,
        specialty: undefined,
        oldCompanyRank: undefined,
        politicalStatus: undefined,
        goodAt: undefined,
        seatNum: undefined,
        workDeptId: undefined,
        participate: true,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.deptId = undefined;
      // this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleAuthRole":
          this.handleAuthRole(row);
          break;
        default:
          break;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      getUser().then(response => {
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.roleMap = this.roleOptions.reduce((map, role) => {
          map.set(role.roleId, role);
          return map;
        }, new Map());
        this.open = true;
        this.title = "添加用户";
        this.form.password = this.initPassword;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const userId = row.userId || this.ids;
      getUser(userId).then(response => {
        response.data.goodAt = response.data.goodAt && response.data.goodAt.split(","); // 将擅长领域字符串转为数组
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.roleMap = this.roleOptions.reduce((map, role) => {
          map.set(role.roleId, role);
          return map;
        }, new Map());
        this.$set(this.form, "postIds", response.postIds);
        this.$set(this.form, "roleIds", response.data.roleIds.filter(i => response.roles.map(role => role.roleId).includes(i)));
        this.deptRoleChange();
        this.open = true;
        this.title = "修改用户";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      // this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   closeOnClickModal: false,
      //   // inputPattern: /^.{8,20}$/,
      //   // inputErrorMessage: "用户密码长度必须介于 8 和 20 之间",
      //   inputValidator: (value) => {
      //     if (/<|>|"|'|\||\\/.test(value)) {
      //       return "不能包含非法字符：< > \" ' \\\ |";
      //     }
      //     if (!(value && /^(?![\s\S]*[\u4e00-\u9fa5])\S{8,16}$/.test(value))) {
      //       return "密码长度8~16位，须包含字母、数字，不允许有空格及中文";
      //     }
      //   },
      // }).then(({ value }) => {
      //   resetUserPwd(row.userId, value).then(response => {
      //     this.$modal.msgSuccess("修改成功，新密码是：" + value);
      //   });
      // }).catch(() => {});
      this.$confirm('是否重置"' + row.userName + '"的密码?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetUserPwd(row.userId).then(response => {
          this.$modal.msgSuccess("成功重置为系统默认密码");
        });
      }).catch(() => {
      });
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.userId;
      this.$router.push("/system/user-auth/role/" + userId);
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.goodAt && Array.isArray(this.form.goodAt)) {
            this.form.goodAt = this.form.goodAt.join(",");
          }
          if (this.form.userId) {
            updateUser(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$modal.confirm('是否确认删除登录账号为"' + row.userName + '"的用户？').then(function () {
        return delUser(userIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/user/export', {
        ...this.queryParams
      }, `user_${new Date().getTime()}.xlsx`)
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      this.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    // 数字输入框
    handleSeatNumInput(value) {
      // 使用正则表达式，只允许数字整数
      this.form.seatNum = value.replace(/[^\d]/g, '');
    },
    deptRoleChange() {
      this.isCenterDept = this.form.deptId && this.DEPT_TYPE.centerDept === this.deptMap.get(this.form.deptId).type;
      this.isMediator = this.isCenterDept && this.form.roleIds.some(roleId => this.roleMap.get(roleId).permissions.includes('project:disputeMediation:mediate'));
      this.isDMEntryClerk = this.isCenterDept && this.form.roleIds.some(roleId => this.roleMap.get(roleId).permissions.includes('project:disputeMediation:add'));
    },
    /** 转换机构数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    },
  }
};
</script>
