<template>
    <div class="app-container">

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="success" plain icon="el-icon-download" size="mini" @click="handleExportCurrentPage" :loading="exportLoading">导出当前页</el-button>
            </el-col>
            <right-toolbar @queryTable="getList" :columns="columns" />
        </el-row>

        <el-table v-loading="loading" :data="affairsCheckList" @selection-change="handleSelectionChange"
            :default-sort="defaultSort" @sort-change="handleSortChange">
            <el-table-column type="index" label="序号" width="50" align="center" />
            <el-table-column label="申请人" align="center" prop="applyName" width="180" />
            <el-table-column label="事务编号" align="center" prop="applyNo">
                <template slot-scope="scope">
                    {{ scope.row.applyNo || '-' }}
                </template>
            </el-table-column>
            <!-- <el-table-column label="标题" align="center" prop="title" /> -->
            <el-table-column label="类型" align="center" prop="affairsType">
                <template slot-scope="scope">
                    <dict-tag :options="dict.type.affairs_type" :value="scope.row.affairsType" />
                </template>
            </el-table-column>
            <el-table-column label="申请时间" align="center" prop="createTime" width="150px" />
            <!-- <el-table-column label="申请事项" align="center" prop="applyMatter">
                <template slot-scope="scope">
                    <div style="max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap" v-html="scope.row.applyMatter" class="content"></div>
                </template>
            </el-table-column> -->

            <el-table-column fixed="right" label="操作" align="center" width="200px" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button size="mini" type="text" :disabled="scope.row.checkStatus !== '0'" icon="el-icon-edit"
                        @click="handleUpdate(scope.row)" v-hasPermi="['project:affairsCheck:check']">
                        审核事务
                    </el-button>
                    <el-button size="mini" type="text" icon="el-icon-view"
                        @click="handleDetail(scope.row)">详情</el-button>
                    <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadWord(scope.row)">下载申请书</el-button>
                    <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadAttachments(scope.row)">下载附件</el-button>
                </template>
            </el-table-column>
            <el-table-column label="申请状态" align="center" prop="status">
                <template slot-scope="scope">
                    {{ statusText[scope.row.status] }}
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改事务审核对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="是否通过" prop="status">
                    <el-radio v-model="form.status" :label="1">通过</el-radio>
                    <el-radio v-model="form.status" :label="2">拒绝</el-radio>
                </el-form-item>
                <el-form-item label="审核意见" prop="opinion">
                    <el-input v-model="form.opinion" type="textarea" placeholder="请输入审核意见"
                        :autosize="{ minRows: 3, maxRows: 6 }" maxlength="200"  />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <!-- 详情对话框 -->
        <el-dialog title="详情" :visible.sync="detailOpen" max-width="600px" append-to-body size="medium"
            :close-on-click-modal="false" @closed="resetDetailData">
            <div style="max-height: 600px; overflow-y: auto">
                <!-- <Detail :detailData="detailData" :userList="userList" :typeList="typeList" :deptList="deptList" /> -->
                <AffairsDetail :detailData="detailData" :userList="userList" :typeList="typeList"
                    :deptList="deptList" :allUserList="allUserList" />
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { listAffairsCheck, AffairsCheck, delAffairsCheck } from '@/api/oa/affairsCheck';
import { listPerson, affairsDetail } from '@/api/oa/affairsApply';
import { getAllUser } from '@/api/oa/publicApi';
import AffairsDetail from '../components/AffairsDetail.vue';
import { WordGenerator } from '@/utils/wordGenerator';
export default {
    name: 'AffairsCheck',
    components: {
        AffairsDetail
    },
    dicts: ['affairs_type'],
    data() {
        return {
            // 时间范围
            queryParamsTime: null,
            statusText: {
                0: '待审核',
                1: '审核中',
                2: '已通过',
                3: '已拒绝',
                4: '已撤回'
            },
            // 所有用户列表
            allUserList: [],
            // 遮罩层
            loading: true,
            // 选中数组
            ids: [],
            // 非单个禁用
            single: true,
            // 非多个禁用
            multiple: true,

            deptList: [],
            // 总条数
            total: 0,
            // 事务审核表格数据
            affairsCheckList: [],
            // 弹出层标题
            title: '',
            // 详情显示
            detailOpen: false,
            // 详情数据
            detailData: {},
            userList: [],
            // 是否显示弹出层
            open: false,
            // 默认排序
            defaultSort: { prop: 'createTime', order: 'descending' },
            // 查询参数
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                applyId: null,
                checkId: null,
                status: null,
                checkTime: null,
                opinion: null
            },
            // 表单参数
            form: {},
            // 列信息
            columns: [
                { label: `$comment`, visible: true },
                { label: `申请表id`, visible: true },
                { label: `审核人id`, visible: true },
                { label: `状态1通过，2拒绝`, visible: true },
                { label: `审核时间`, visible: true },
                { label: `审核意见`, visible: true }
            ],
            // 表单校验
            rules: {
                status: [{ required: true, message: '请选择是否通过', trigger: 'blur' }]
            },
            typeList: [],
            exportLoading: false
        };
    },
    created() {
        // this.queryParams.orderByColumn = this.defaultSort.prop;
        // this.queryParams.isAsc = this.defaultSort.order;
        this.getList();
        this.getUserList();
        this.getDeptList();
        this.getAllUserList();
    },
    methods: {
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
        /** 查询事务审核列表 */
        getList() {
            this.loading = true;
            listAffairsCheck(this.queryParams).then(response => {
                this.affairsCheckList = response.rows;
                this.total = response.total;
                this.loading = false;
            });
        },
        /** 详情按钮操作 */
        handleDetail(row) {
            affairsDetail(row.id).then(res => {
                this.detailData = res.data;
                this.detailData.typeName = this.typeList.find(item => item.type == this.detailData.type)?.name || '';
                // console.log(res.data);

                this.detailOpen = true;
            });
        },
        /** 下载申请书 */
        handleDownloadWord(row) {
            // 显示加载提示
            const loading = this.$loading({
                lock: true,
                text: '正在生成申请书...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            // 调用详情接口获取完整数据
            affairsDetail(row.id).then(res => {
                try {
                    const detailData = res.data;
                    
                    // 解析formData
                    let formData = {};
                    if (typeof detailData.formData === 'string') {
                        try {
                            formData = JSON.parse(detailData.formData);
                        } catch (e) {
                            console.error('解析formData失败', e);
                            formData = {};
                        }
                    } else if (typeof detailData.formData === 'object') {
                        formData = detailData.formData;
                    }

                    // 调用WordGenerator生成Word文档
                    WordGenerator.generateAffairsApplyWord(detailData, formData, row, this.deptList);
                    
                    loading.close();
                    this.$modal.msgSuccess('申请书生成成功！');
                } catch (error) {
                    loading.close();
                    console.error('生成申请书失败:', error);
                    this.$modal.msgError('生成申请书失败，请重试');
                }
            }).catch(error => {
                loading.close();
                console.error('获取详情失败:', error);
                this.$modal.msgError('获取数据失败，无法生成申请书');
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
                opinion: null,
                status: null
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
            this.reset();
            this.open = true;
            this.title = '添加事务审核';
        },
        /** 审核按钮操作 */
        handleUpdate(row) {
            const id = row.id || this.ids;
            this.open = true;
            this.title = '事务审核';
            this.reset();
            this.form.id = id;
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs['form'].validate(valid => {
                if (valid) {
                    console.log(this.form, 'submitForm');

                    if (this.form.id != null) {
                        AffairsCheck(this.form).then(response => {
                            this.$modal.msgSuccess('审核成功');
                            this.open = false;
                            this.getList();
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        handleDelete(row) {
            const ids = row.id || this.ids;
            this.$modal
                .confirm('是否确认删除事务审核编号为"' + ids + '"的数据项？')
                .then(function () {
                    return delAffairsCheck(ids);
                })
                .then(() => {
                    this.getList();
                    this.$modal.msgSuccess('删除成功');
                })
                .catch(() => { });
        },
        /** 导出按钮操作 */
        handleExport() {
            this.download(
                'project/affairsCheck/export',
                {
                    ...this.queryParams
                },
                `affairsCheck_${new Date().getTime()}.xlsx`
            );
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

        /** 导出当前页按钮操作 */
        async handleExportCurrentPage() {
            if (this.affairsCheckList.length === 0) {
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
                const currentPageData = this.affairsCheckList;
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
        }
    }
};
</script>
