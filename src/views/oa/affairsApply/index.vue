<template>
    <div class="app-container">

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['project:affairsApply:apply']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-download" size="mini" @click="handleExportCurrentPage" :loading="exportLoading">导出当前页</el-button>
            </el-col>
            <right-toolbar @queryTable="getList" :columns="columns" />
        </el-row>

        <el-table v-loading="loading" :data="affairsApplyList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column label="申请人" align="center" prop="applyName" />
            <!-- <el-table-column label="标题" align="center" prop="title" /> -->
            <el-table-column label="类型" align="center" prop="affairsType">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.affairs_type" :value="scope.row.affairsType" />
                </template>
            </el-table-column>
            <el-table-column label="申请时间" align="center" prop="createTime" width="150px" />
            <!-- <el-table-column label="申请事项" align="center" prop="applyMatter">
                <template slot-scope="scope">
                    <div style="max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap" v-html="scope.row.applyMatter"></div>
                </template>
            </el-table-column> -->
            <el-table-column label="申请状态" align="center" prop="status">
                <template slot-scope="scope">
                    {{ statusText[scope.row.status] }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['project:affairsApply:revoke']" v-if="scope.row.status == 0">撤销</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)">详情</el-button>
                    <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadAttachments(scope.row)">下载附件</el-button>
                    <el-button size="mini" type="text" icon="el-icon-document" @click="handleDownloadWord(scope.row)" style="color: #67C23A">下载申请书</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改事务申请对话框 -->
        <AffairsDialog :title="title" :open="open" :formData="form" :allUserList="allUserList" @submit="handleDialogSubmit" @cancel="handleDialogCancel" />
        <!-- 详情对话框 -->
        <el-dialog title="详情" :visible.sync="detailOpen" max-width="600px" append-to-body @closed="resetDetailData" :close-on-click-modal="false" size="medium">
            <div style="max-height: 600px; overflow-y: auto">
                <!-- <Detail :detailData="detailData" :userList="userList" :typeList="typeList" :deptList="deptList" :allUserList="allUserList" /> -->
                <AffairsDetail :detailData="detailData" :userList="userList" :typeList="typeList" :deptList="deptList" :allUserList="allUserList" />
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { listAffairsApply, getAffairsApply, delAffairsApply, addAffairsApply, updateAffairsApply, listPerson, uploadFile, affairsDetail, getAffairsTypeList } from '@/api/oa/affairsApply';
// import { listAffairsType } from '@/api/oa/affairsType';
import { getAllUser } from '@/api/oa/publicApi';
import { getDeptUserTree } from '@/api/oa/publicApi';
import AffairsDetail from '../components/AffairsDetail.vue';
import AffairsDialog from '../components/AffairsDialog.vue';
// Word文档生成相关导入
import { saveAs } from 'file-saver';
import { WordGenerator } from '@/utils/wordGenerator';
// 注意：需要安装 npm install docxtemplater pizzip

export default {
    name: 'AffairsApply',
    components: {
        AffairsDialog,
        AffairsDetail
    },
    dicts: ['affairs_type'],
    data() {
        return {
            deptUserTree: [],
            approvers: [{ userId: null }],
            deptUserTreeProps: {
                label: function (data) {
                    // 用户节点显示用户名
                    if (data.isUser) {
                        return data.nickName || data.userName || data.name;
                    }
                    // 部门节点显示部门名
                    return data.deptName || data.depName || data.name || data.label;
                },
                children: 'children',
                id: function (data) {
                    // 确保即使属性为 null 或 undefined 也能返回有效字符串
                    if (data.isUser) {
                        return 'user_' + (data.userId || 'unknown');
                    }
                    return 'dept_' + (data.deptId || 'unknown');
                }
            },
            // 时间范围
            queryParamsTime: null,
            // 部门列表
            deptList: [],
            // 部门用户列表
            deptUserList: [],
            // 部门树配置
            deptProps: {
                value: 'id',
                label: 'label',
                children: 'children',
                checkStrictly: true,
                emitPath: false
            },

            // 所有用户列表
            allUserList: [],

            statusText: {
                0: '待审核',
                1: '审核中',
                2: '已通过',
                3: '已拒绝',
                4: '已撤回'
            },
            // 上传文件路径
            uploadUrl: this._baseUrl + '/common/upload',
            // 用户列表
            userList: [],
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,
            showSearch: true, // 初始化为true
            // 总条数
            total: 0,
            // 事务申请表格数据
            affairsApplyList: [],
            // 弹出层标题
            title: '',
            // 是否显示弹出层
            open: false,
            // 详情显示
            detailOpen: false,
            // 详情数据
            detailData: {},
            // 默认排序
            defaultSort: { prop: 'createTime', order: 'descending' },
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                title: null,
                type: null,
                applyMatter: null,
                status: null,
                fileUrl: null
            },
            // 表单参数
            form: {
                id: null,
                title: null,
                affairsType: null,
                applyMatter: null,
                fileUrl: '',
                checkIds: [],
                checkDeptId: null,
                formData: {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptId: this.$store.getters.userInfo.deptId,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    position: '',
                    workStartDate: '',
                    leaveType: '',
                    leaveDays: '',
                    leaveTime: [],
                    leaveReason: '',
                    leaveDays: undefined
                }
            },
            // 列信息
            columns: [
                { label: `$comment`, visible: true },
                { label: `标题`, visible: true },
                { label: `类型`, visible: true },
                { label: `申请事项`, visible: true },
                { label: `是否多人审批0否1是`, visible: true },
                {
                    label: `状态，0待审核，1审核中 ，2已通过，3已拒绝，4已撤回`,
                    visible: true
                },
                { label: `文件`, visible: true },
                { label: `备注`, visible: true },
                { label: `删除标志`, visible: true }
            ],
            typeList: [],
            exportLoading: false
        };
    },
    created() {
        this.getList();
        this.getUserList();
        this.getDeptList();
        this.getAllUserList();
    },
    methods: {
        // 添加审批人
        addApprover() {
            this.approvers.push({ userId: null });
        },
        // 移除审批人
        removeApprover(index) {
            if (this.approvers.length > 1) {
                this.approvers.splice(index, 1);
                this.handleApproverChange();
            }
        },
        // 处理审批人变更
        handleApproverChange() {
            // 收集所有有效的审批人ID
            this.form.checkIds = this.approvers.filter(approver => approver.userId).map(approver => approver.userId);
        },
        // 获取所有用户列表
        getAllUserList() {
            getAllUser().then(response => {
                this.allUserList = response.data;
            });
        },
        // 获取部门列表
        getDeptList() {
            import('@/api/oa/publicApi').then(module => {
                module.listDeptTree().then(response => {
                    // 将返回的树形结构转换为适合级联选择器的格式
                    this.deptList = this.formatDeptTree(response.data);
                });
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
        resetDetailData() {
            this.detailData = {};
        },
        /** 查询事务申请列表 */
        getList() {
            this.loading = true;
            listAffairsApply(this.queryParams).then(response => {
                this.affairsApplyList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
        },
        // 获取人员列表
        getUserList() {
            listPerson().then(response => {
                this.userList = response.data;
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
                id: null,
                title: null,
                affairsType: null,
                applyMatter: null,
                fileUrl: '',
                checkIds: [],
                checkDeptId: null,
                ccList: [], // 新增抄送人列表重置
                formData: {
                    applyName: this.$store.getters.userInfo.nickName,
                    deptId: this.$store.getters.userInfo.deptId,
                    deptName: this.$store.getters.userInfo.dept.deptName,
                    position: '',
                    workStartDate: '',
                    leaveType: '',
                    leaveDays: '',
                    leaveTime: [],
                    leaveReason: '',
                    leaveDays: undefined
                }
            };
            this.resetForm('form');
        },


        // 多选框选中数据
        handleSelectionChange(selection) {
            this.ids = selection.map(item => item.id);
            this.single = selection.length !== 1;
            this.multiple = !selection.length;
        },
        /** 排序触发事件 */
        handleSortChange(column, prop, order) {
            this.queryParams.orderByColumn = column.prop;
            this.queryParams.isAsc = column.order;
            this.getList();
        },
        /** 新增按钮操作 */
        handleAdd() {
            this.reset(); // 先重置表单
            this.open = true;
            this.title = '添加事务申请';
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.reset();
            const id = row.id || this.ids;
            getAffairsApply(id).then(response => {
                this.form = response.data;
                this.open = true;
                this.title = '修改事务申请';
            });
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$modal
                .confirm('是否确认撤销此事务申请？')
                .then(function () {
                    return delAffairsApply({ id: ids });
                })
                .then(() => {
                    this.getList();
                    this.$modal.msgSuccess('撤销成功');
                })
                .catch(() => {});
        },
        /** 详情按钮操作 */
        handleDetail(row) {
            affairsDetail(row.id).then(res => {
                this.detailData = res.data;
                if (res.data.checkDeptId && !res.data.checkDeptName) {
                    // 查找部门名称
                    this.findDeptNameById(res.data.checkDeptId);
                }
                this.detailOpen = true;
            });
        },
        // 根据部门ID查找部门名称
        findDeptNameById(deptId) {
            // 递归查找部门
            const findDept = (list, id) => {
                for (const item of list) {
                    if (item.id === id) {
                        return item.label;
                    }
                    if (item.children && item.children.length > 0) {
                        const found = findDept(item.children, id);
                        if (found) return found;
                    }
                }
                return null;
            };

            const deptName = findDept(this.deptList, deptId);
            if (deptName) {
                this.detailData.checkDeptName = deptName;
            }
        },
        // 处理对话框提交
        handleDialogSubmit(formData) {
            if (formData.id != null) {
                // 修改操作
                updateAffairsApply(formData).then(response => {
                    this.$modal.msgSuccess('修改成功');
                    this.open = false;
                    this.getList();
                });
            } else {
                console.log('formData', formData);

                // 新增操作
                addAffairsApply(formData).then(response => {
                    this.$modal.msgSuccess('新增成功');
                    this.open = false;
                    this.getList();
                    this.reset();
                });
            }
        },
        // 处理对话框取消
        handleDialogCancel() {
            this.open = false;
            this.reset();
        },
        /** 下载所有附件 */
        handleDownloadAttachments(row) {
            // 显示加载提示
            const loading = this.$loading({
                lock: true,
                text: '正在获取附件信息...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            // 调用详情接口获取完整数据
            affairsDetail(row.id).then(res => {
                loading.close();
                const detailData = res.data;
                
                // 解析formData
                let formData = {};
                if (typeof detailData.formData === 'string') {
                    try {
                        formData = JSON.parse(detailData.formData);
                    } catch (e) {
                        console.error('解析formData失败', e);
                        this.$modal.msgError('数据格式错误，无法解析附件信息');
                        return;
                    }
                } else if (typeof detailData.formData === 'object') {
                    formData = detailData.formData;
                }

                // 收集所有附件
                const attachments = [];
                
                // 1. 出差类型的差旅费附件
                if (formData.travelExpenseFiles) {
                    this.extractAttachments(formData.travelExpenseFiles, attachments, '差旅费报销单');
                }
                
                // 2. 拨款/报销类型的付款凭证
                if (formData.payProofFiles) {
                    this.extractAttachments(formData.payProofFiles, attachments, '付款凭证');
                }
                
                // 3. 其他类型的附件
                if (formData.fileUrl) {
                    this.extractAttachments(formData.fileUrl, attachments, '附件');
                }
                
                // 4. 零星采购中每个商品的附件
                if (formData.items && Array.isArray(formData.items)) {
                    formData.items.forEach((item, index) => {
                        if (item.fileUrl) {
                            this.extractAttachments(item.fileUrl, attachments, `商品${index + 1}附件`);
                        }
                    });
                }
                
                // 5. 合同审批的附件
                if (formData.attachment) {
                    this.extractAttachments(formData.attachment, attachments, '合同附件');
                }

                // 下载附件
                if (attachments.length > 0) {
                    this.downloadAllAttachments(attachments);
                } else {
                    this.$modal.msgInfo('该记录没有附件');
                }
            }).catch(error => {
                loading.close();
                console.error('获取详情失败', error);
                this.$modal.msgError('获取附件信息失败');
            });
        },
        
        /** 提取附件信息 */
        extractAttachments(fileData, attachments, category) {
            if (!fileData) return;
            
            let files = [];
            
            // 如果是字符串，尝试解析JSON或按逗号分割
            if (typeof fileData === 'string') {
                try {
                    files = JSON.parse(fileData);
                } catch (e) {
                    // 如果解析失败，检查是否是逗号分隔的URL字符串
                    if (fileData.includes(',')) {
                        // 按逗号分割多个文件URL
                        const urlList = fileData.split(',').map(url => url.trim()).filter(url => url);
                        files = urlList.map((url, index) => ({
                            name: `${category}文件${urlList.length > 1 ? (index + 1) : ''}`,
                            url: url
                        }));
                    } else {
                        // 单个文件URL
                        files = [{ name: `${category}文件`, url: fileData }];
                    }
                }
            } else if (Array.isArray(fileData)) {
                files = fileData;
            } else if (typeof fileData === 'object') {
                files = [fileData];
            }
            
            // 确保files是数组
            if (!Array.isArray(files)) {
                files = [files];
            }
            
            // 添加到附件列表
            files.forEach((file, index) => {
                if (file && (file.url || file.name || file)) {
                    // 处理不同的文件格式
                    let fileName, fileUrl;
                    
                    if (typeof file === 'string') {
                        // 如果file本身就是URL字符串
                        fileName = `${category}文件${files.length > 1 ? (index + 1) : ''}`;
                        fileUrl = file;
                    } else if (typeof file === 'object') {
                        // 如果file是对象
                        fileName = file.name || `${category}文件${files.length > 1 ? (index + 1) : ''}`;
                        fileUrl = file.url || file.path || file;
                    }
                    
                    if (fileUrl) {
                        attachments.push({
                            name: fileName,
                            url: fileUrl,
                            category: category
                        });
                    }
                }
            });
        },
        
        /** 下载所有附件 */
        downloadAllAttachments(attachments) {
            if (attachments.length === 0) {
                this.$modal.msgInfo('没有可下载的附件');
                return;
            }
            
            this.$modal.msgSuccess(`开始下载 ${attachments.length} 个附件`);
            
            // 批量下载附件
            attachments.forEach((attachment, index) => {
                setTimeout(() => {
                    this.downloadSingleFile(attachment);
                }, index * 200); // 每个文件间隔200ms下载，避免浏览器限制
            });
        },
        
        /** 下载单个文件 */
        downloadSingleFile(attachment) {
            try {
                let fileUrl = attachment.url;
                const fileName = attachment.name || `附件_${Date.now()}`;
                
                // 如果URL是相对路径，补充完整路径
                if (fileUrl && !fileUrl.startsWith('http')) {
                    fileUrl = this._baseUrl + fileUrl;
                }
                
                // 检查是否为PDF文件或其他需要强制下载的文件类型
                const isPDF = fileName.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().includes('.pdf');
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff)$/i.test(fileName);
                
                if (isPDF || isImage) {
                    // 对于PDF和图片文件，使用fetch方式下载以确保强制下载
                    this.forceDownloadFile(fileUrl, fileName);
                } else {
                    // 对于其他文件类型，使用传统方式
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = fileUrl;
                    link.download = fileName;
                    
                    // 添加额外属性确保下载
                    link.setAttribute('target', '_blank');
                    link.setAttribute('rel', 'noopener noreferrer');
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                console.log(`正在下载: ${fileName}`);
            } catch (error) {
                console.error('下载文件失败:', attachment.name, error);
                this.$modal.msgError(`下载文件失败: ${attachment.name}`);
            }
        },
        
        /** 强制下载文件（适用于PDF、图片等浏览器可能直接打开的文件） */
        forceDownloadFile(url, filename) {
            // 使用fetch下载文件并创建blob来强制下载
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    // 创建下载链接
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = filename;
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // 清理URL对象
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('强制下载失败，尝试传统方式:', error);
                    // 如果fetch失败，回退到传统下载方式
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = url;
                    link.download = filename;
                    link.setAttribute('target', '_blank');
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
                 },
         
         /** 下载事务申请Word文档 */
         async handleDownloadWord(row) {
             try {
                 // 显示加载提示
                 const loading = this.$loading({
                     lock: true,
                     text: '正在生成Word文档...',
                     spinner: 'el-icon-loading',
                     background: 'rgba(0, 0, 0, 0.7)'
                 });

                 // 获取详细数据
                 const response = await affairsDetail(row.id);
                 const detailData = response.data;
                 
                 // 解析formData
                 let formData = {};
                 if (typeof detailData.formData === 'string') {
                     try {
                         formData = JSON.parse(detailData.formData);
                     } catch (e) {
                         formData = {};
                     }
                 } else if (typeof detailData.formData === 'object') {
                     formData = detailData.formData || {};
                 }

                 // 生成Word文档
                 await this.generateWordDocument(detailData, formData, row);
                 
                 loading.close();
                 this.$modal.msgSuccess('Word文档生成成功');
                 
             } catch (error) {
                 console.error('生成Word文档失败:', error);
                 this.$modal.msgError('生成Word文档失败');
             }
         },

         /** 生成Word文档 */
         async generateWordDocument(detailData, formData, row) {
             // 使用WordGenerator工具类生成Word文档，传递部门列表和用户列表
             await WordGenerator.generateAffairsApplyWord(detailData, formData, row, this.deptList, this.allUserList);
         },

         /** 导出当前页按钮操作 */
         async handleExportCurrentPage() {
             if (this.affairsApplyList.length === 0) {
                 this.$modal.msgInfo('当前页面没有数据可以导出');
                 return;
             }

             this.exportLoading = true;
             try {
                 // 动态导入JSZip
                 const JSZip = await import('jszip').then(module => module.default);
                 
                 // 创建zip实例
                 const zip = new JSZip();
                 
                 // 显示进度
                 const loading = this.$loading({
                     lock: true,
                     text: '正在生成Word文档压缩包...',
                     spinner: 'el-icon-loading',
                     background: 'rgba(0, 0, 0, 0.7)'
                 });

                 // 获取当前页数据
                 const currentPageData = this.affairsApplyList;
                 const totalCount = currentPageData.length;
                 let processedCount = 0;

                 // 为每个申请单生成Word文档
                 for (const row of currentPageData) {
                     try {
                         processedCount++;
                         loading.text = `正在生成Word文档... (${processedCount}/${totalCount})`;
                         
                         // 获取详细数据
                         const response = await affairsDetail(row.id);
                         const detailData = response.data;
                         
                         // 解析formData
                         let formData = {};
                         if (typeof detailData.formData === 'string') {
                             try {
                                 formData = JSON.parse(detailData.formData);
                             } catch (e) {
                                 formData = {};
                             }
                         } else if (typeof detailData.formData === 'object') {
                             formData = detailData.formData || {};
                         }
                  
                         const wordBlob = await this.generateWordDocumentForBatch(detailData, formData, row);
                         
                         // 生成文件名
                         const fileName = this.getFileNameForBatch(detailData.affairsType, formData, detailData, row.id);
                         
                         // 添加到zip
                         zip.file(fileName, wordBlob);
                         
                         // 延时避免请求过于频繁
                         await new Promise(resolve => setTimeout(resolve, 100));
                         
                     } catch (error) {
                         console.error(`生成申请单${row.id}的Word文档失败:`, error);
                         // 继续处理下一个，不中断整个流程
                     }
                 }

                 loading.text = '正在打包压缩文件...';
                 
                 // 生成zip文件
                 const zipBlob = await zip.generateAsync({ type: 'blob' });
                 
                 // 下载zip文件
                 const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '');
                 const zipFileName = `天津众和金融消费者权益保护中心申请单批量导出_${currentDate}.zip`;
                 this.downloadBlob(zipBlob, zipFileName);
                 
                 loading.close();
                 this.$modal.msgSuccess(`成功导出 ${processedCount} 个申请单的Word文档`);
                 
             } catch (error) {
                 console.error('批量导出失败:', error);
                 this.$modal.msgError('批量导出失败，请检查网络连接或联系管理员');
             } finally {
                 this.exportLoading = false;
             }
         },

         /** 生成Word文档（批量导出用） */
         async generateWordDocumentForBatch(detailData, formData, row) {
             // 动态导入docx相关模块
             const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, HeadingLevel, BorderStyle, VerticalAlign, TableLayoutType, Packer } = await import('docx');
             
             // 复用WordGenerator的逻辑生成docx格式文档
             return await this.createDocxDocument(detailData, formData, row, { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, HeadingLevel, BorderStyle, VerticalAlign, TableLayoutType, Packer });
         },

         /** 创建docx文档（与WordGenerator逻辑一致） */
         async createDocxDocument(detailData, formData, row, docxModules) {
             // 直接使用WordGenerator的方法，但返回Blob而不是下载
             const WordGenerator = (await import('@/utils/wordGenerator')).WordGenerator;
             
             // 解析数据（与WordGenerator.generateAffairsApplyWord保持一致）
             let parsedData = {};
             if (detailData && detailData.formData) {
                 try {
                     if (typeof detailData.formData === 'string') {
                         parsedData = JSON.parse(detailData.formData);
                     } else {
                         parsedData = detailData.formData;
                     }
                 } catch (error) {
                     console.error('解析formData失败:', error);
                     parsedData = formData || {};
                 }
             } else {
                 parsedData = formData || {};
             }

             // 查找部门名称
             if (parsedData.deptId && this.deptList.length > 0) {
                 const deptName = WordGenerator.findDeptNameById(parsedData.deptId, this.deptList);
                 if (deptName) {
                     parsedData.deptName = deptName;
                 }
             }

             // 获取基础信息
             const now = new Date();
             const currentDate = now.toLocaleDateString('zh-CN');
             const approvalNumber = detailData.applyNo || `KQSP${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${row.id.toString().padStart(3, '0')}`;
             const documentTitle = WordGenerator.getDocumentTitle(detailData.affairsType);
             const { leaveTypeMap, statusMap, approvalStatusMap } = WordGenerator.getDataMaps();
             const timeData = WordGenerator.processTimeData(parsedData);
             const contractDates = {
                 signingDate: WordGenerator.formatContractDate(parsedData.signingDate),
                 contractStartDate: WordGenerator.formatContractDate(parsedData.contractStartDate),
                 contractEndDate: WordGenerator.formatContractDate(parsedData.contractEndDate)
             };

             // 使用docx模块创建文档
             const { Document, Paragraph, TextRun, AlignmentType, Header, BorderStyle, WidthType, VerticalAlign, TableLayoutType, Packer } = docxModules;
             
             // 创建页眉（与WordGenerator一致）
             const header = new Header({
                 children: [
                     new Paragraph({
                         alignment: AlignmentType.RIGHT,
                         spacing: { before: 200, after: 200 },
                         border: {
                             bottom: {
                                 color: "000000",
                                 space: 1,
                                 style: BorderStyle.SINGLE,
                                 size: 6
                             }
                         },
                         children: [
                             new TextRun({
                                 text: "天津众和金融消保中心",
                                 font: "宋体",
                                 size: 18,
                                 bold: true,
                                 color: "000000"
                             })
                         ]
                     })
                 ]
             });

             // 创建文档（与WordGenerator一致）
             const doc = new Document({
                 styles: WordGenerator.getDocumentStyles(),
                 sections: [{
                     properties: {
                         page: {
                             margin: {
                                 top: 1440,
                                 right: 720,
                                 bottom: 720,
                                 left: 720
                             }
                         }
                     },
                     headers: {
                         default: header
                     },
                     children: [
                         // 文档标题
                         new Paragraph({
                             alignment: AlignmentType.CENTER,
                             spacing: { after: 400 },
                             children: [
                                 new TextRun({
                                     text: documentTitle,
                                     font: "宋体",
                                     size: 36,
                                     bold: true
                                 })
                             ]
                         }),
                         
                         // 审批编号和申请日期
                         new Paragraph({
                             spacing: { after: 200 },
                             children: [
                                 new TextRun({
                                     text: `审批编号：${approvalNumber}`,
                                     font: "宋体",
                                     size: 20
                                 }),
                                 new TextRun({
                                     text: `                                                         申请日期：${detailData.createTime ? detailData.createTime.split(' ')[0] : ''}`,
                                     font: "宋体",
                                     size: 20
                                 })
                             ]
                         }),

                         // 基本信息表格
                         ...WordGenerator.createBasicInfoTables(detailData, parsedData, currentDate),
                         
                         // 根据事务类型创建特定内容
                         ...WordGenerator.createSpecificContent(detailData, parsedData, timeData, contractDates, leaveTypeMap),
                         
                         // 审批流程
                         ...WordGenerator.createApprovalFlow(detailData, approvalStatusMap),
                         
                         // 抄送信息
                         ...WordGenerator.createCopyToInfo(detailData, this.allUserList),
                         
                         // 备注和状态信息
                         ...WordGenerator.createFooterInfo(detailData, parsedData, statusMap)
                     ]
                 }]
             });

             // 生成并返回Blob
             return await Packer.toBlob(doc);
         },

         /** 生成Word HTML内容（复用WordGenerator的逻辑） */
         async generateWordHtmlContent(detailData, formData, row) {
             // 从WordGenerator中复制逻辑，但返回HTML内容而不是下载文件
             const now = new Date();
             const currentDate = now.toLocaleDateString('zh-CN');
             
             // 使用applyNo字段作为审批编号，如果没有则生成一个
             const approvalNumber = detailData.applyNo || `KQSP${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${row.id.toString().padStart(3, '0')}`;
             
             // 解析 formData（使用与 WordGenerator 相同的逻辑）
             let parsedData = {};
             if (detailData && detailData.formData) {
                 try {
                     if (typeof detailData.formData === 'string') {
                         parsedData = JSON.parse(detailData.formData);
                     } else {
                         parsedData = detailData.formData;
                     }
                 } catch (error) {
                     console.error('解析formData失败:', error);
                     parsedData = formData || {};
                 }
             } else {
                 parsedData = formData || {};
             }

             // 查找部门名称（与WordGenerator逻辑完全一致）
             if (parsedData.deptId && this.deptList.length > 0) {
                 const deptName = this.findDeptNameByIdForExport(parsedData.deptId, this.deptList);
                 if (deptName) {
                     parsedData.deptName = deptName;
                 }
             }
             
             // 如果parsedData中没有部门信息，尝试从detailData中获取
             if (!parsedData.deptName && detailData.deptId && this.deptList.length > 0) {
                 const deptName = this.findDeptNameByIdForExport(detailData.deptId, this.deptList);
                 if (deptName) {
                     parsedData.deptName = deptName;
                 }
             }
             
             // 最后回退到detailData.deptName
             if (!parsedData.deptName && detailData.deptName) {
                 parsedData.deptName = detailData.deptName;
             }

             // 处理请假类型映射
             const leaveTypeMap = {
                 '1': '病假', '2': '事假', '3': '年假', '4': '婚假', '5': '产假',
                 '6': '护理假', '7': '育儿假', '8': '陪护假', '9': '丧假','10': '其他',
                 'sick': '病假', 'personal': '事假', 'annual': '年休假', 
                 'marriage': '婚假', 'maternity': '产假', 'nursing': '护理假', 'funeral': '丧假', 'other': '其他'
             };
             
             // 审批状态映射（与 WordGenerator 一致）
             const approvalStatusMap = {
                 0: '未审核', 1: '通过', 2: '拒绝', 3: '申请被撤销', 4: '审核已被拒绝'
             };

             // 申请状态映射
             const statusMap = {
                 0: '待审核', 1: '审核中', 2: '已通过', 3: '已拒绝', 4: '已撤回'
             };
             
             // 处理请假时间和天数
             let leaveTimeStr = '';
             let leaveDays = parsedData.leaveDays || 0;
             
             // 处理请假时间数组
             if (parsedData.leaveTime && Array.isArray(parsedData.leaveTime) && parsedData.leaveTime.length >= 2) {
                 try {
                     const startTime = new Date(parsedData.leaveTime[0]).toLocaleString('zh-CN');
                     const endTime = new Date(parsedData.leaveTime[1]).toLocaleString('zh-CN');
                     leaveTimeStr = `${startTime} 至 ${endTime}`;
                     
                     // 重新计算请假天数
                     const startDate = new Date(parsedData.leaveTime[0]);
                     const endDate = new Date(parsedData.leaveTime[1]);
                     const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                     if (days > 0) {
                         leaveDays = days;
                     }
                 } catch (error) {
                     console.error('处理请假时间失败:', error);
                 }
             }
             
             // 如果没有解析到有效的天数，尝试从其他字段获取
             if (!leaveDays && (parsedData.totalDays || parsedData.days)) {
                 leaveDays = parsedData.totalDays || parsedData.days;
             }

             // 获取事务类型名称
             const affairsTypeName = this.getAffairsTypeNameForWordGenerator(detailData.affairsType);
             
             // 获取文档标题
             const documentTitle = this.getDocumentTitleForExport(detailData.affairsType);

             // 处理出差时间
             let awayTimeStr = '';
             if (parsedData.awayTime && Array.isArray(parsedData.awayTime) && parsedData.awayTime.length >= 2) {
                 try {
                     const startTime = new Date(parsedData.awayTime[0]).toLocaleString('zh-CN');
                     const endTime = new Date(parsedData.awayTime[1]).toLocaleString('zh-CN');
                     awayTimeStr = `${startTime} 至 ${endTime}`;
                 } catch (error) {
                     console.error('处理出差时间失败:', error);
                 }
             }

             // 处理合同日期
             const contractDates = {
                 signingDate: this.formatContractDateForWordGenerator(parsedData.signingDate),
                 contractStartDate: this.formatContractDateForWordGenerator(parsedData.contractStartDate),
                 contractEndDate: this.formatContractDateForWordGenerator(parsedData.contractEndDate)
             };

             // 创建完整的HTML文档模板（使用与WordGenerator相同的模板）
             const htmlContent = this.createWordGeneratorHtmlTemplate({
                 approvalNumber,
                 currentDate,
                 parsedData,
                 detailData,
                 leaveTypeMap,
                 statusMap,
                 approvalStatusMap,
                 leaveTimeStr,
                 leaveDays,
                 affairsTypeName,
                 awayTimeStr,
                 documentTitle,
                 contractDates
             });

             return htmlContent;
         },

         /** 获取事务类型名称（与WordGenerator保持一致） */
         getAffairsTypeNameForWordGenerator(affairsType) {
             const typeMap = {
                 'leave': '请假申请',
                 'away': '出差申请',
                 'grant': '拨款申请',
                 'expense': '费用报销申请',
                 'travel': '差旅费报销',
                 'other': '其他事务',
                 'officialSeal': '用印申请',
                 'hospitality': '业务招待申请',
                 'procurement': '零星采购申请',
                 'contract': '合同审批'
             };
             return typeMap[affairsType] || affairsType || '事务申请';
         },

         /** 格式化合同日期（与WordGenerator保持一致） */
         formatContractDateForWordGenerator(dateString) {
             if (!dateString) return '';

             let date;
             if (typeof dateString === 'object') {
                 date = dateString;
             } else {
                 date = new Date(dateString);
             }

             if (isNaN(date.getTime())) {
                 return dateString;
             }

             const year = date.getFullYear();
             const month = String(date.getMonth() + 1).padStart(2, '0');
             const day = String(date.getDate()).padStart(2, '0');

             return `${year}-${month}-${day}`;
         },

         /** 查找部门名称（导出用） */
         findDeptNameByIdForExport(deptId, deptList) {
             const findDept = (list, id) => {
                 for (const item of list) {
                     if (item.id === id) {
                         return item.label;
                     }
                     if (item.children && item.children.length > 0) {
                         const found = findDept(item.children, id);
                         if (found) return found;
                     }
                 }
                 return null;
             };
             return findDept(deptList, deptId);
         },



         /** 获取文档标题（导出用） */
         getDocumentTitleForExport(affairsType) {
             const titleMap = {
                 'leave': '天津众和金融消费者权益保护中心员工请休假申批表',
                 'away': '天津众和金融消费者权益保护中心员工出差申请表',
                 'grant': '天津众和金融消费者权益保护中心员工拨款申请表',
                 'expense': '天津众和金融消费者权益保护中心员工费用报销申请表',
                 'travel': '天津众和金融消费者权益保护中心员工差旅费报销申请表',
                 'other': '天津众和金融消费者权益保护中心员工事务申请表',
                 'officialSeal': '天津众和金融消费者权益保护中心员工用印申请表',
                 'hospitality': '天津众和金融消费者权益保护中心员工业务招待申请表',
                 'procurement': '天津众和金融消费者权益保护中心员工零星采购申请表',
                 'contract': '天津众和金融消费者权益保护中心员工合同审批表'
             };
             return titleMap[affairsType] || '天津众和金融消费者权益保护中心员工事务申请表';
         },

         /** 创建与WordGenerator完全一致的HTML模板 */
         createWordGeneratorHtmlTemplate(data) {
             // 直接使用WordGenerator的完整模板逻辑
             return this.generateWordGeneratorTemplate(data);
         },

         /** 生成与WordGenerator完全一致的HTML模板 */
         generateWordGeneratorTemplate(data) {
             const { approvalNumber, currentDate, parsedData, detailData, leaveTypeMap, statusMap, approvalStatusMap, leaveTimeStr, leaveDays, affairsTypeName, awayTimeStr, documentTitle, contractDates } = data;
             
             // 动态生成审批流程HTML
             let approvalFlowHtml = '';
             if (detailData.detailList && Array.isArray(detailData.detailList) && detailData.detailList.length > 0) {
                 detailData.detailList.forEach((item, index) => {
                     const statusText = approvalStatusMap[item.status] || '未知状态';
                     const checkTime = item.checkTime ? new Date(item.checkTime).toLocaleString('zh-CN') : '';
                     
                     approvalFlowHtml += `
                         <tr>
                             <td class="center node-cell" style="width: 150px !important;">审批节点${index + 1}</td>
                             <td class="dept-cell">${item.deptName || ''}</td>
                             <td class="person-cell">${item.checkName || '待处理'}</td>
                             <td class="opinion-cell">${statusText}${checkTime ? '<br><small>时间：' + checkTime + '</small>' : ''}${item.opinion ? '<br>意见：' + item.opinion : ''}</td>
                         </tr>
                     `;
                 });
             } else {
                 // 如果没有审批记录，显示默认结构
                 approvalFlowHtml = `
                     <tr>
                         <td class="center node-cell" style="width: 150px !important;">待审批</td>
                         <td class="dept-cell">-</td>
                         <td class="person-cell">待分配审批人</td>
                         <td class="opinion-cell">待审批</td>
                     </tr>
                 `;
             }
             
             return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <meta name="Originator" content="Microsoft Word 15">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentTitle}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
            <w:ValidateAgainstSchemas/>
            <w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid>
            <w:IgnoreMixedContent>false</w:IgnoreMixedContent>
            <w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <!--[if gte mso 9]>
    <xml>
        <o:DocumentProperties>
            <o:Title>${documentTitle}</o:Title>
            <o:Subject>${affairsTypeName}</o:Subject>
            <o:Author>系统生成</o:Author>
            <o:Keywords>${detailData.affairsType === 'leave' ? '请假' : detailData.affairsType === 'away' ? '出差' : '事务'},申请,审批</o:Keywords>
            <o:Description>${documentTitle}</o:Description>
            <o:LastAuthor>系统</o:LastAuthor>
            <o:Revision>1</o:Revision>
            <o:Created>${new Date().toISOString()}</o:Created>
            <o:LastSaved>${new Date().toISOString()}</o:LastSaved>
            <o:Pages>1</o:Pages>
            <o:Company>天津众和金融消费者权益保护中心</o:Company>
        </o:DocumentProperties>
    </xml>
    <![endif]-->
    <style>
        @page Section1 { 
            size: 595.3pt 841.9pt; /* A4尺寸 */
            margin: 56.7pt 42.5pt 56.7pt 56.7pt; /* 20mm 15mm 20mm 20mm */
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
        }
        div.Section1 { page: Section1; }
        
        @media print {
            @page {
                size: A4 portrait;
                margin: 20mm 15mm 20mm 20mm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
        body { 
            font-family: "SimSun", "宋体", serif; 
            font-size: 11pt; 
            line-height: 1.3; 
            margin: 0; 
            padding: 0;
            width: 595.3pt; /* A4宽度 */
            background: white;
            mso-layout-grid-align: none;
            text-justify-trim: punctuation;
        }
        
        .Section1 {
            width: 595.3pt;
            margin: 0 auto;
            background: white;
            min-height: 841.9pt; /* A4高度 */
            padding: 56.7pt 42.5pt 56.7pt 56.7pt; /* 页边距 */
            box-sizing: border-box;
        }
        .header { 
            text-align: center; 
            font-size: 20pt; 
            font-weight: bold; 
            margin-bottom: 25px; 
            padding: 15px 0;
            border-bottom: 2px solid #000;
            page-break-inside: avoid;
        }
        .form-info { 
            margin-bottom: 15px; 
            font-size: 10pt; 
            text-align: left;
        }
        .form-info span {
            margin-right: 40px;
            display: inline-block;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px; 
            font-size: 10pt; 
            table-layout: fixed;
            page-break-inside: avoid;
        }
        td, th { 
            border: 1px solid #000; 
            padding: 6px 8px; 
            text-align: left; 
            vertical-align: middle; 
            word-wrap: break-word;
            line-height: 1.4;
        }
        .center { text-align: center; }
        .label-cell { 
            background-color: #f5f5f5; 
            font-weight: bold; 
            text-align: center; 
            width: 150px !important; 
            white-space: nowrap;
        }
        .red-text { color: red; }
        .approval-section { 
            margin-top: 20px; 
            page-break-inside: avoid;
        }
        .approval-section .section-title {
            text-align: center; 
            font-weight: bold; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #000; 
            padding-bottom: 5px;
            font-size: 12pt;
        }
        .approval-table {
            font-size: 10pt;
            page-break-inside: avoid;
        }
        .approval-table .node-cell {
            width: 150px !important;
            text-align: center;
            font-weight: bold;
        }
        .approval-table .person-cell {
            width: 18%;
        }
        .approval-table .dept-cell {
            width: 15%;
        }
        .approval-table .opinion-cell {
            width: 55%;
        }
        .info-table .first-col { width: 12%; }
        .info-table .second-col { width: 38%; }
        .info-table .third-col { width: 12%; }
        .info-table .fourth-col { width: 38%; }
        small { font-size: 8pt; color: #666; }
        
        /* Word文档兼容性优化 */
        .document-container {
            width: 100%;
            margin: 0;
            background: white;
            position: relative;
            text-align: left;
        }
        
        /* 避免分页时断开的元素 */
        .no-break {
            page-break-inside: avoid;
        }
        
        /* A4纸张模拟 */
        html {
            background: white;
            padding: 0;
        }
        
        /* 表格宽度调整 */
        table {
            width: 100% !important;
        }
        
        /* 字体大小微调以适应固定宽度 */
        .info-table .first-col { 
            width: 50pt; 
            min-width: 50pt;
        }
        .info-table .third-col { 
            width: 50pt; 
            min-width: 50pt;
        }
    </style>
  </head>
  <body lang="zh-CN" style="tab-interval:21.0pt">
      <div class="Section1">
          <div class="document-container">
              <div class="header no-break" style="text-align: center; font-size: 20pt; font-weight: bold; margin-bottom: 25px; padding: 15px 0; border-bottom: 2px solid #000;">${documentTitle}</div>
    
        <div class="form-info">
            <span>审批编号：${approvalNumber}</span>
            <span>申请日期：${detailData.createTime ? detailData.createTime.split(' ')[0] : ''}</span>
        </div>

    <!-- 根据事务类型显示不同的基本信息 -->
    ${detailData.affairsType === 'other' ? `
    <table class="info-table">
        <tr>
            <td class="label-cell" style="width: 150px !important;">申请人姓名</td>
            <td class="second-col">${parsedData.applyName || detailData.applyName || detailData.userName || ''}</td>
            <td class="label-cell" style="width: 150px !important;">申请时间</td>
            <td class="fourth-col">${detailData.createTime || currentDate}</td>
        </tr>
    </table>` : ['away', 'contract', 'procurement', 'hospitality', 'officialSeal', 'grant', 'expense'].includes(detailData.affairsType) ? `
    <table class="info-table">
        <tr>
            <td class="label-cell" style="width: 150px !important;">${detailData.affairsType === 'contract' ? '申请人' : '申请人姓名'}</td>
            <td class="second-col">${parsedData.applyName || detailData.applyName || detailData.userName || ''}</td>
            <td class="label-cell" style="width: 150px !important;">${detailData.affairsType === 'contract' ? '申请人部门' : '所在部门'}</td>
            <td class="fourth-col">${parsedData.deptName || detailData.deptName || ''}</td>
        </tr>
    </table>` : `
    <table class="info-table">
        <tr>
            <td class="label-cell" style="width: 150px !important;">申请人姓名</td>
            <td class="second-col">${parsedData.applyName || detailData.applyName || detailData.userName || ''}</td>
            <td class="label-cell" style="width: 150px !important;">所在部门</td>
            <td class="fourth-col">${parsedData.deptName || detailData.deptName || ''}</td>
        </tr>
        <tr>
            <td class="label-cell" style="width: 150px !important;">职务职级</td>
            <td class="second-col">${parsedData.position || ''}</td>
            <td class="label-cell" style="width: 150px !important;">参加工作时间</td>
            <td class="fourth-col">${parsedData.workStartDate || ''}</td>
        </tr>
    </table>`}

         <!-- 请假类型特有信息 -->
     ${detailData.affairsType === 'leave' ? `
     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;" rowspan="2">请休假类别</td>
             <td class="center" style="width: 50%;">
                 <strong>${leaveTypeMap[parsedData.leaveType] || '年假'}</strong>
             </td>
             <td class="label-cell" style="width: 150px !important;">请假天数</td>
             <td class="center" style="width: 27%;"><strong>${leaveDays}</strong>天</td>
         </tr>
         <tr>
             <td colspan="3" style="padding: 8px;">
                 请假原因：${parsedData.leaveReason || ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">请休假时间</td>
             <td colspan="3">
                 ${leaveTimeStr || ''}
                 <br>
                 （休假共计 <strong>${leaveDays}</strong> 天，其中工作日 <strong>${parsedData.workdayCount || leaveDays}</strong> 天）
             </td>
         </tr>
     </table>` : detailData.affairsType === 'away' ? `
     <!-- 出差类型特有信息 -->
     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">部门名称</td>
             <td colspan="3">${parsedData.deptName || detailData.deptName || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">出差事由</td>
             <td colspan="3">${parsedData.awayReason || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">出差人员</td>
             <td colspan="3">${parsedData.applyName || detailData.applyName || detailData.userName || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">出差地点</td>
             <td colspan="3">${parsedData.awayLocation || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">出差时间</td>
             <td colspan="3">
                 ${awayTimeStr || ''}
             </td>
         </tr>
     </table>` : detailData.affairsType === 'other' ? `
     <!-- 其他事务类型特有信息 -->
     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
         <tr>
             <td class="label-cell" style="width: 150px !important;">事务标题</td>
             <td colspan="3" style="font-weight: bold; color: #2c3e50;">
                 ${parsedData.title || detailData.title || ''}
             </td>
         </tr>
         <tr>
             <td class="label-cell" style="width: 150px !important;">申请事项</td>
             <td colspan="3" style="padding: 12px; min-height: 100px; vertical-align: top; line-height: 1.6;">
                 ${parsedData.applyMatter || ''}
             </td>
         </tr>
         ${parsedData.amount || parsedData.payAmount ? `<tr>
             <td class="label-cell" style="width: 150px !important;">涉及金额</td>
             <td class="second-col">${parsedData.amount || parsedData.payAmount || ''} 元</td>
             <td class="label-cell" style="width: 150px !important;">金额类型</td>
             <td class="fourth-col">${parsedData.amountType || '其他费用'}</td>
         </tr>` : ''}
         ${parsedData.reason || parsedData.applyReason ? `<tr>
             <td class="label-cell" style="width: 150px !important;">申请理由</td>
             <td colspan="3" style="padding: 12px; min-height: 80px; vertical-align: top; line-height: 1.6;">
                 ${parsedData.reason || parsedData.applyReason || ''}
             </td>
         </tr>` : ''}
         ${parsedData.urgencyLevel ? `<tr>
             <td class="label-cell" style="width: 150px !important;">紧急程度</td>
             <td class="second-col">${parsedData.urgencyLevel === 'urgent' ? '紧急' : parsedData.urgencyLevel === 'normal' ? '一般' : parsedData.urgencyLevel === 'low' ? '不紧急' : parsedData.urgencyLevel}</td>
             <td class="label-cell" style="width: 150px !important;">期望处理时间</td>
             <td class="fourth-col">${parsedData.expectedTime || ''}</td>
         </tr>` : ''}
         ${parsedData.relatedDept || parsedData.cooperationDept ? `<tr>
             <td class="label-cell" style="width: 150px !important;">${parsedData.relatedDept ? '涉及部门' : '配合部门'}</td>
             <td colspan="3">${parsedData.relatedDept || parsedData.cooperationDept || ''}</td>
         </tr>` : ''}
         <tr>
             <td class="label-cell" style="width: 150px !important;">附件材料</td>
             <td colspan="3">
                 ${parsedData.fileUrl ? '已上传相关附件材料' : '无附件'}
                 ${parsedData.attachmentNote ? '<br><small style="color: #666;">备注：' + parsedData.attachmentNote + '</small>' : ''}
             </td>
         </tr>
         ${parsedData.remark || parsedData.additionalInfo ? `<tr>
             <td class="label-cell" style="width: 150px !important;">补充说明</td>
             <td colspan="3" style="padding: 12px; min-height: 60px; vertical-align: top; line-height: 1.6; font-style: italic; color: #555;">
                 ${parsedData.remark || parsedData.additionalInfo || ''}
             </td>
         </tr>` : ''}
     </table>` : detailData.affairsType === 'contract' ? `
     <!-- 合同审批类型特有信息 -->
     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">提交时间</td>
             <td class="second-col">${detailData.createTime || currentDate}</td>
             <td class="label-cell" style="width: 150px !important;">当前审批状态</td>
             <td class="fourth-col">${statusMap[detailData.status] || '待审核'}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">合同承办部门</td>
             <td class="second-col">${parsedData.contractDepartment || ''}</td>
             <td class="label-cell" style="width: 150px !important;">合同签订方式</td>
             <td class="fourth-col">${parsedData.negotiators || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">合同名称</td>
             <td colspan="3">${parsedData.contractName || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">甲方单位名称</td>
             <td class="second-col">${parsedData.partyA || ''}</td>
             <td class="label-cell" style="width: 150px !important;">乙方单位名称</td>
             <td class="fourth-col">${parsedData.partyB || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">丙方单位名称</td>
             <td colspan="3">${parsedData.partyC || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">签约日期</td>
             <td class="second-col">${contractDates.signingDate || ''}</td>
             <td class="label-cell" style="width: 150px !important;">合同开始时间</td>
             <td class="fourth-col">${contractDates.contractStartDate || ''}</td>
         </tr>
         <tr>
             <td class="label-cell" style="width: 150px !important;">合同终止时间</td>
             <td colspan="3">${contractDates.contractEndDate || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">合同内容</td>
             <td colspan="3" style="padding: 12px; min-height: 100px; vertical-align: top;">
                 ${parsedData.contractContent || ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">合同金额</td>
             <td class="second-col">${parsedData.contractAmount || ''} 元</td>
             <td class="label-cell" style="width: 150px !important;">合同份数</td>
             <td class="fourth-col">${parsedData.contractCopies || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">附件</td>
             <td colspan="3">${parsedData.attachment ? '已上传附件' : '无附件'}</td>
         </tr>
     </table>` : detailData.affairsType === 'procurement' ? `
     <!-- 零星采购类型特有信息 -->
     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">购买渠道</td>
             <td colspan="3">${parsedData.purchaseType || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">申请原因及用途说明</td>
             <td colspan="3" style="padding: 12px; min-height: 80px; vertical-align: top;">
                 ${parsedData.applyReason || ''}
             </td>
         </tr>
     </table>

     <!-- 商品明细表格 -->
     <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9pt;">
         <tr>
             <td rowspan="${(parsedData.items && parsedData.items.length > 0) ? parsedData.items.length + 1 : 2}" style="border: 1px solid #000; text-align: center; vertical-align: middle; width: 50px; background-color: #f0f0f0; font-weight: bold; padding: 8px;">
                 商品明细
             </td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 80px;">名称</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 60px;">品牌</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 60px;">型号</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 40px;">数量</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 35px;">单位</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 60px;">单价</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 100px;">商品购买链接</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 60px;">附件</td>
             <td class="center" style="border: 1px solid #000; background-color: #f5f5f5; padding: 6px; font-weight: bold; width: 70px;">小计</td>
         </tr>
         ${parsedData.items && parsedData.items.length > 0 ? 
             parsedData.items.map((item, index) => `
                 <tr>
                     <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">${item.name || ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">${item.brand || ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">${item.model || ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">${item.quantity || ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; vertical-align: top;">${item.unit || ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; text-align: right; vertical-align: top;">${item.price ? parseFloat(item.price).toFixed(2) : ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; vertical-align: top; word-break: break-all;">${item.purchaseLink || ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; text-align: center; vertical-align: top;">${item.fileUrl ? '已上传' : ''}</td>
                     <td style="border: 1px solid #000; padding: 6px; text-align: right; vertical-align: top;">${item.subtotal ? parseFloat(item.subtotal).toFixed(2) : ''}</td>
                 </tr>
             `).join('') : 
             `<tr>
                 <td style="border: 1px solid #000; padding: 20px; text-align: center;" colspan="9">暂无商品明细</td>
             </tr>`
         }
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">总小计</td>
             <td colspan="3" class="center" style="font-weight: bold; font-size: 12pt;">
                 ${parsedData.totalAmount || '0.00'} 元
             </td>
         </tr>
     </table>` : detailData.affairsType === 'hospitality' ? `
     <!-- 业务招待类型特有信息 -->
     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">招待日期及时间</td>
             <td class="second-col">${parsedData.hospitalityDateTime || ''}</td>
             <td class="label-cell" style="width: 150px !important;">招待地点</td>
             <td class="fourth-col">${parsedData.hospitalityLocation || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">招待单位</td>
             <td class="second-col">${parsedData.hospitalityUnit || ''}</td>
             <td class="label-cell" style="width: 150px !important;">招待人数</td>
             <td class="fourth-col">${parsedData.hospitalityCount || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">申请事由</td>
             <td colspan="3" style="padding: 12px; min-height: 80px; vertical-align: top;">
                 ${parsedData.hospitalityReason || ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">我方参与人员</td>
             <td colspan="3" style="padding: 12px; min-height: 60px; vertical-align: top;">
                 ${parsedData.ourParticipants || ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">预计消费金额</td>
             <td colspan="3" class="center" style="font-weight: bold; font-size: 12pt;">
                 ${parsedData.estimatedAmount ? parseFloat(parsedData.estimatedAmount).toFixed(2) : '0.00'} 元
             </td>
         </tr>
     </table>` : detailData.affairsType === 'officialSeal' ? `
     <!-- 用印申请类型特有信息 -->
     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">印章名称</td>
             <td colspan="3">
                 <strong>${parsedData.sealType && Array.isArray(parsedData.sealType) ? parsedData.sealType.join('、') : (parsedData.sealType || '')}</strong>
                 ${parsedData.sealType && parsedData.sealType.includes && parsedData.sealType.includes('其他') && parsedData.otherSealNote ? 
                     `<br/><span style="color: red;">${parsedData.otherSealNote}</span>` : ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">用章类别</td>
             <td colspan="3">
                 加盖印章（材料份数：<strong>${parsedData.documentCount || 1}</strong>）
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">用章事由</td>
             <td colspan="3" style="padding: 12px; min-height: 120px; vertical-align: top;">
                 ${parsedData.sealReason || ''}
             </td>
         </tr>
     </table>` : detailData.affairsType === 'grant' ? `
     <!-- 拨款申请类型特有信息 -->
     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">款项支付公司</td>
             <td class="second-col">${parsedData.payCompany || ''}</td>
             <td class="label-cell" style="width: 150px !important;">付款金额</td>
             <td class="fourth-col">${parsedData.payAmount ? parseFloat(parsedData.payAmount).toFixed(2) : ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">收款方全称</td>
             <td class="second-col">${parsedData.receiverName || ''}</td>
             <td class="label-cell" style="width: 150px !important;">付款类型</td>
             <td class="fourth-col">${parsedData.payType === 'contract' ? '合同类' : parsedData.payType === 'nonContract' ? '非合同类' : parsedData.payType || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">付款项目分类</td>
             <td class="second-col">${parsedData.payCategory || ''}</td>
             <td class="label-cell" style="width: 150px !important;">合同名称</td>
             <td class="fourth-col">${parsedData.contractName || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">合同累积付款金额</td>
             <td class="second-col">${parsedData.contractTotalPaid ? parseFloat(parsedData.contractTotalPaid).toFixed(2) : ''}</td>
             <td class="label-cell" style="width: 150px !important;">付款方式</td>
             <td class="fourth-col">${parsedData.payMethod || '电汇'}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">收款方银行账号</td>
             <td class="second-col">${parsedData.receiverBankAccount || ''}</td>
             <td class="label-cell" style="width: 150px !important;">收款方开户行</td>
             <td class="fourth-col">${parsedData.receiverBank || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">计划付款日期</td>
             <td colspan="3">${parsedData.planPayDate || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">付款内容概述</td>
             <td colspan="3" style="padding: 12px; min-height: 100px; vertical-align: top;">
                 ${parsedData.payDescription || ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">付款凭证照片</td>
             <td class="second-col">${parsedData.payProofFiles ? '已上传附件' : ''}</td>
             <td class="label-cell" style="width: 150px !important;">关联申请单</td>
             <td class="fourth-col">${parsedData.relatedApplication || ''}</td>
         </tr>
     </table>` : detailData.affairsType === 'expense' ? `
     <!-- 费用报销类型特有信息 -->
     <table class="info-table">
         <tr>
             <td colspan="4" class="center" style="background-color: #f0f0f0; font-weight: bold; padding: 8px;">申请内容</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">计划付款日期</td>
             <td class="second-col">${parsedData.planPayDate || ''}</td>
             <td class="label-cell" style="width: 150px !important;">付款金额</td>
             <td class="fourth-col">${parsedData.payAmount ? parseFloat(parsedData.payAmount).toFixed(2) : ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">收款方全称</td>
             <td class="second-col">${parsedData.receiverName || ''}</td>
             <td class="label-cell" style="width: 150px !important;">付款方式</td>
             <td class="fourth-col">${parsedData.payMethod || '电汇'}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">收款方银行账号</td>
             <td class="second-col">${parsedData.receiverBankAccount || ''}</td>
             <td class="label-cell" style="width: 150px !important;">收款方开户行</td>
             <td class="fourth-col">${parsedData.receiverBank || ''}</td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">付款内容概述</td>
             <td colspan="3" style="padding: 12px; min-height: 100px; vertical-align: top;">
                 ${parsedData.payDescription || ''}
             </td>
         </tr>
     </table>

     <table class="info-table">
         <tr>
             <td class="label-cell" style="width: 150px !important;">付款凭证照片</td>
             <td class="second-col">${parsedData.payProofFiles ? '已上传附件' : ''}</td>
             <td class="label-cell" style="width: 150px !important;">关联申请单</td>
             <td class="fourth-col">${parsedData.relatedApplication || ''}</td>
         </tr>
     </table>` : ''}

    <div class="approval-section">
        <div class="section-title">审批流程</div>
        
        <table class="approval-table">
            <tr>
                <td class="center node-cell" style="background-color: #f0f0f0; width: 150px !important;">审批节点</td>
                <td class="center dept-cell" style="background-color: #f0f0f0;">部门</td>
                <td class="center person-cell" style="background-color: #f0f0f0;">处理人</td>
                <td class="center opinion-cell" style="background-color: #f0f0f0;">审批意见</td>
            </tr>
            ${approvalFlowHtml}
        </table>
    </div>

    ${this.generateCcInfoHtml(detailData)}

    <table class="info-table">
        <tr>
            <td class="label-cell" style="width: 150px !important;">备注信息</td>
            <td colspan="3">${detailData.remark || parsedData.remark || ''}</td>
        </tr>
        <tr>
            <td class="label-cell" style="width: 150px !important;">申请状态</td>
            <td colspan="3">${statusMap[detailData.status] || '待审核'}</td>
        </tr>
    </table>
          </div>
      </div>
  </body>
  </html>`;
         },

         /** 下载Blob文件 */
         downloadBlob(blob, filename) {
             const link = document.createElement('a');
             link.style.display = 'none';
             link.href = window.URL.createObjectURL(blob);
             link.download = filename;
             
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             
             // 清理URL对象
             window.URL.revokeObjectURL(link.href);
         },

         /** 获取批量导出文件名 */
         getFileNameForBatch(affairsType, formData, detailData, id) {
             const typeNameMap = {
                 'leave': '请假申请单',
                 'away': '出差申请单',
                 'grant': '拨款申请单',
                 'expense': '费用报销申请单',
                 'travel': '差旅费报销申请单',
                 'other': '事务申请单',
                 'officialSeal': '用印申请单',
                 'hospitality': '业务招待申请单',
                 'procurement': '零星采购申请单',
                 'contract': '合同审批申请单'
             };
             
             const typeName = typeNameMap[affairsType] || '事务申请单';
             return `天津众和金融消费者权益保护中心${typeName}_${id}.docx`;
         },

         /** 生成抄送人信息HTML */
         generateCcInfoHtml(detailData) {
             // 如果没有抄送人，返回空字符串
             if (!detailData.ccList || !Array.isArray(detailData.ccList) || detailData.ccList.length === 0) {
                 return '';
             }

             // 获取抄送人信息
             const ccUsers = detailData.ccList.map(item => {
                 const user = this.allUserList.find(u => u.userId === item.userId);
                 if (user) {
                     const deptName = user.dept ? user.dept.deptName : '';
                     return deptName ? `${user.nickName}(${deptName})` : user.nickName;
                 }
                 return `用户${item.userId}`;
             }).filter(Boolean);

             if (ccUsers.length === 0) {
                 return '';
             }

             return `
                 <div class="approval-section" style="margin-top: 20px;">
                     <div class="section-title">抄送信息</div>
                     <table class="info-table">
                         <tr>
                             <td class="label-cell" style="width: 150px !important;">抄送人</td>
                             <td colspan="3">${ccUsers.join('、')}</td>
                         </tr>
                     </table>
                 </div>
             `;
         }
    }
};
</script>

<style scope>
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
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}

.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>

<style scope>
.line-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.line {
    flex: 1;
    border-top: 1px solid #6f6f6f;
    /* 设置横线 */
}

.text {
    margin: 0 10px;
    /* 控制文字与横线之间的距离 */
    font-size: 16px;
    /* 设置文字大小 */
}
</style>
