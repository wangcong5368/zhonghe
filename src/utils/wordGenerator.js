import {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    Header,
    Footer,
    HeadingLevel,
    BorderStyle,
    VerticalAlign,
    TableLayoutType,
    Packer,
    HeightRule
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * Word文档生成器
 * 使用docx包生成真正的Word文档
 */
export class WordGenerator {
    /**
     * 生成事务申请表Word文档
     * @param {Object} detailData 详细数据
     * @param {Object} formData 表单数据
     * @param {Object} row 行数据
     * @param {Array} deptList 部门列表（可选）
     * @param {Array} allUserList 所有用户列表（可选）
     */
    static async generateAffairsApplyWord(detailData, formData, row, deptList = [], allUserList = []) {
        const now = new Date();
        const currentDate = now.toLocaleDateString('zh-CN');

        // 使用applyNo字段作为审批编号，如果没有则生成一个
        const approvalNumber =
            detailData.applyNo || `KQSP${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${row.id.toString().padStart(3, '0')}`;

        // 解析 formData（使用与 AffairsDetail.vue 相同的逻辑）
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
        if (parsedData.deptId && deptList.length > 0) {
            const deptName = this.findDeptNameById(parsedData.deptId, deptList);
            if (deptName) {
                parsedData.deptName = deptName;
            }
        }

        // 获取文档标题和其他基础信息
        const documentTitle = this.getDocumentTitle(detailData.affairsType);
        const affairsTypeName = this.getAffairsTypeName(detailData.affairsType);

        // 处理各种数据映射
        const { leaveTypeMap, statusMap, approvalStatusMap } = this.getDataMaps();

        // 处理时间相关数据
        const timeData = this.processTimeData(parsedData);

        // 处理合同日期
        const contractDates = {
            signingDate: this.formatContractDate(parsedData.signingDate),
            contractStartDate: this.formatContractDate(parsedData.contractStartDate),
            contractEndDate: this.formatContractDate(parsedData.contractEndDate)
        };

        // 创建页眉
        const header = new Header({
            children: [
                new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: {
                        before: 200,
                        after: 200
                    },
                    border: {
                        bottom: {
                            color: '000000',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 6
                        }
                    },
                    children: [
                        new TextRun({
                            text: '天津众和金融消保中心',
                            font: '宋体',
                            size: 15, // 小五字号（9pt）
                            color: '000000'
                        })
                    ]
                })
            ]
        });

        // 创建文档
        const doc = new Document({
            styles: this.getDocumentStyles(),
            sections: [
                {
                    properties: {
                        page: {
                            margin: {
                                top: 1440, // 1英寸 = 1440 twips，为页眉留出空间
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
                                    font: '宋体',
                                    size: 36, // 18pt
                                    bold: true
                                })
                            ]
                        }),

                        new Paragraph({
                            spacing: { after: 200 },
                            children: [
                                new TextRun({
                                    text: `审批编号：${approvalNumber}`,
                                    font: '宋体',
                                    size: 18
                                }),
                                new TextRun({
                                    text: `                                                             申请日期：${detailData.createTime ? detailData.createTime.split(' ')[0] : ''}`,
                                    font: '宋体',
                                    size: 18
                                })
                            ]
                        }),

                        // 基本信息表格
                        ...this.createBasicInfoTables(detailData, parsedData, currentDate),

                        // 根据事务类型创建特定内容
                        ...this.createSpecificContent(detailData, parsedData, timeData, contractDates, leaveTypeMap),

                        // 审批流程
                        ...this.createApprovalFlow(detailData, approvalStatusMap),

                        // 抄送人信息
                        ...this.createCopyToInfo(detailData, allUserList),

                        // 备注和状态信息
                        ...this.createFooterInfo(detailData, parsedData, statusMap)
                    ]
                }
            ]
        });

        // 生成并下载文档（浏览器环境使用toBlob方法）
        const blob = await Packer.toBlob(doc);

        const fileName = this.getFileName(detailData.affairsType, parsedData, detailData);
        saveAs(blob, fileName);
    }

    /**
     * 获取文档样式配置
     */
    static getDocumentStyles() {
        return {
            paragraphStyles: [
                {
                    id: 'Normal',
                    name: 'Normal',
                    basedOn: 'Normal',
                    next: 'Normal',
                    quickFormat: true,
                    paragraph: {
                        spacing: { line: 276 } // 1.15倍行距
                    },
                    run: {
                        font: '宋体',
                        size: 22 // 11pt
                    }
                }
            ]
        };
    }

    /**
     * 查找部门名称
     * @param {Number} deptId 部门ID
     * @param {Array} deptList 部门列表
     * @returns {String} 部门名称
     */
    static findDeptNameById(deptId, deptList) {
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
    }

    /**
     * 获取事务类型名称
     * @param {String} affairsType 事务类型代码
     * @returns {String} 事务类型名称
     */
    static getAffairsTypeName(affairsType) {
        const typeMap = {
            leave: '请假申请',
            away: '出差申请',
            grant: '拨款申请',
            expense: '费用报销申请',
            travel: '差旅费报销',
            other: '其他事务',
            officialSeal: '用印申请',
            hospitality: '业务招待申请',
            procurement: '零星采购申请',
            contract: '合同审批'
        };
        return typeMap[affairsType] || affairsType || '事务申请';
    }

    /**
     * 获取文档标题
     * @param {String} affairsType 事务类型代码
     * @returns {String} 文档标题
     */
    static getDocumentTitle(affairsType) {
        const titleMap = {
            leave: '请休假申批表',
            away: '出差申请表',
            grant: '拨款申请表',
            expense: '费用报销申请表',
            travel: '差旅费报销申请表',
            other: '事务申请表',
            officialSeal: '用印申请表',
            hospitality: '业务招待申请表',
            procurement: '零星采购申请表',
            contract: '合同审批表'
        };
        return titleMap[affairsType] || '事务申请表';
    }

    /**
     * 获取文件名
     * @param {String} affairsType 事务类型代码
     * @param {Object} parsedData 解析后的数据
     * @param {Object} detailData 详细数据
     * @returns {String} 文件名
     */
    static getFileName(affairsType, parsedData, detailData) {
        const typeNameMap = {
            leave: '请假申请单',
            away: '出差申请单',
            grant: '拨款申请单',
            expense: '费用报销申请单',
            travel: '差旅费报销申请单',
            other: '事务申请单',
            officialSeal: '用印申请单',
            hospitality: '业务招待申请单',
            procurement: '零星采购申请单',
            contract: '合同审批申请单'
        };

        const typeName = typeNameMap[affairsType] || '事务申请单';
        return `天津众和金融消费者权益保护中心${typeName}.docx`;
    }

    /**
     * 格式化合同日期
     * @param {String|Date} dateString 日期字符串或日期对象
     * @returns {String} 格式化后的日期
     */
    static formatContractDate(dateString) {
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
    }

    /**
     * 获取数据映射
     */
    static getDataMaps() {
        const leaveTypeMap = {
            1: '病假',
            2: '事假',
            3: '年假',
            4: '婚假',
            5: '产假',
            6: '护理假',
            7: '育儿假',
            8: '陪护假',
            9: '丧假',
            sick: '病假',
            personal: '事假',
            annual: '年休假',
            marriage: '婚假',
            maternity: '产假',
            nursing: '护理假',
            funeral: '丧假'
        };

        const approvalStatusMap = {
            0: '未审核',
            1: '通过',
            2: '拒绝',
            3: '申请被撤销',
            4: '审核已被拒绝'
        };

        const statusMap = {
            0: '待审核',
            1: '审核中',
            2: '已通过',
            3: '已拒绝',
            4: '已撤回'
        };

        return { leaveTypeMap, approvalStatusMap, statusMap };
    }

    /**
     * 处理时间相关数据
     */
    static processTimeData(parsedData) {
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

        return { leaveTimeStr, leaveDays, awayTimeStr };
    }

    /**
     * 创建表格的通用方法
     */
    static createTable(rows, customColumnWidths = null) {
        const tableRows = rows.map(row => {
            const cells = row.map((cell, cellIndex) => {
                const cellConfig = {
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER, // 统一居中
                            children: [
                                new TextRun({
                                    text: cell.text || '',
                                    font: '宋体',
                                    size: 24, // 字号加大到 12pt (24 half-points)
                                    bold: cell.bold || cell.isHeader || false
                                })
                            ]
                        })
                    ],
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                        top: 200, // 加大上下边距以提升行高
                        bottom: 200,
                        left: 150,
                        right: 150
                    }
                    // 移除单元格级别的宽度设置，让表格的columnWidths控制布局
                };

                if (cell.isHeader) {
                    cellConfig.shading = {
                        fill: 'E6E6E6',
                        type: 'clear'
                    };
                }

                if (cell.colSpan) {
                    cellConfig.columnSpan = cell.colSpan;
                }

                if (cell.rowSpan) {
                    cellConfig.rowSpan = cell.rowSpan;
                }

                if (cell.minHeight) {
                    cellConfig.margins = {
                        top: cell.minHeight / 4,
                        bottom: cell.minHeight / 4
                    };
                }

                return new TableCell(cellConfig);
            });

            return new TableRow({
                children: cells,
                height: {
                    value: 600, // 600 twips ≈ 30pt
                    rule: HeightRule.ATLEAST
                }
            });
        });

        // 强制使用4列布局，确保所有表格的列宽一致
        const columnCount = 4;

        // 定义固定的列宽：第一列（标签列）200px，其他列平均分配
        const labelWidth = 2040; // 200px转换为twips (200 * 7.2 = 1440)
        const contentWidth = 2520; // 调整剩余宽度 ((9000 - 1440) / 3 = 2520)

        let columnWidths = [
            labelWidth, // 第一列：标签列，固定200px
            contentWidth, // 第二列：内容列
            contentWidth, // 第三列：内容列
            contentWidth // 第四列：内容列
        ];

        // 如提供自定义列宽且长度匹配 4 列，则覆盖默认值
        if (Array.isArray(customColumnWidths) && customColumnWidths.length === columnCount) {
            columnWidths = customColumnWidths;
        }

        return new Table({
            rows: tableRows,
            width: {
                size: 100,
                type: WidthType.PERCENTAGE
            },
            columnWidths: columnWidths,
            borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: '000000' },
                insideVertical: { style: BorderStyle.SINGLE, size: 3, color: '000000' }
            },
            layout: TableLayoutType.FIXED
        });
    }

    /**
     * 创建自定义列数的表格（用于零星采购商品明细等场景）
     * @param {Array} rows 行数据（同 createTable 格式，但列数可变）
     * @param {Array<number>} columnWidths 列宽数组（twips）
     */
    static createCustomTable(rows, columnWidths) {
        const tableRows = rows.map(r => {
            const cells = r.map(c => {
                return new TableCell({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: c.text || '',
                                    font: '宋体',
                                    size: 24,
                                    bold: c.bold || c.isHeader || false
                                })
                            ]
                        })
                    ],
                    shading: c.isHeader ? { fill: 'E6E6E6', type: 'clear' } : undefined,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { top: 200, bottom: 200, left: 100, right: 100 }
                });
            });
            return new TableRow({
                children: cells,
                height: { value: 600, rule: HeightRule.ATLEAST }
            });
        });

        return new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths,
            borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: '000000' },
                insideVertical: { style: BorderStyle.SINGLE, size: 3, color: '000000' }
            },
            layout: TableLayoutType.FIXED
        });
    }

    /**
     * 创建基本信息表格
     */
    static createBasicInfoTables(detailData, parsedData, currentDate) {
        const tables = [];

        if (detailData.affairsType === 'other') {
            // 其他事务类型的基本信息表格
            tables.push(
                this.createTable([
                    [
                        { text: '申请人姓名', isHeader: true },
                        { text: parsedData.applyName || detailData.applyName || detailData.userName || '' },
                        { text: '申请时间', isHeader: true },
                        { text: detailData.createTime || currentDate }
                    ]
                ])
            );
        } else if (['away', 'contract', 'procurement', 'hospitality', 'officialSeal', 'grant', 'expense'].includes(detailData.affairsType)) {
            // 出差、合同等类型的基本信息表格
            tables.push(
                this.createTable([
                    [
                        { text: detailData.affairsType === 'contract' ? '申请人' : '申请人姓名', isHeader: true },
                        { text: parsedData.applyName || detailData.applyName || detailData.userName || '' },
                        { text: detailData.affairsType === 'contract' ? '申请人部门' : '所在部门', isHeader: true },
                        { text: parsedData.deptName || detailData.deptName || '' }
                    ]
                ])
            );
        } else {
            // 请假等类型的基本信息表格
            tables.push(
                this.createTable([
                    [
                        { text: '申请人姓名', isHeader: true },
                        { text: parsedData.applyName || detailData.applyName || detailData.userName || '' },
                        { text: '所在部门', isHeader: true },
                        { text: parsedData.deptName || detailData.deptName || '' }
                    ],
                    [{ text: '职务职级', isHeader: true }, { text: parsedData.position || '' }, { text: '参加工作时间', isHeader: true }, { text: parsedData.workStartDate || '' }]
                ])
            );
        }

        return tables;
    }

    /**
     * 创建特定事务内容
     */
    static createSpecificContent(detailData, parsedData, timeData, contractDates, leaveTypeMap) {
        const content = [];

        switch (detailData.affairsType) {
            case 'leave':
                content.push(...this.createLeaveContent(parsedData, timeData, leaveTypeMap));
                break;
            case 'away':
                content.push(...this.createAwayContent(parsedData, timeData, detailData));
                break;
            case 'contract':
                content.push(...this.createContractContent(parsedData, detailData, contractDates));
                break;
            case 'procurement':
                content.push(...this.createProcurementContent(parsedData));
                break;
            case 'hospitality':
                content.push(...this.createHospitalityContent(parsedData));
                break;
            case 'officialSeal':
                content.push(...this.createOfficialSealContent(parsedData));
                break;
            case 'grant':
                content.push(...this.createGrantContent(parsedData));
                break;
            case 'expense':
                content.push(...this.createExpenseContent(parsedData));
                break;
            case 'other':
                content.push(...this.createOtherContent(parsedData));
                break;
            default:
                // 其他类型暂时不实现，后续可以添加
                break;
        }

        return content;
    }

    /**
     * 创建请假内容
     */
    static createLeaveContent(parsedData, timeData, leaveTypeMap) {
        return [
            // 请假类别表格
            this.createTable([
                [
                    { text: '请休假类别', isHeader: true },
                    { text: leaveTypeMap[parsedData.leaveType] || '年假', bold: true, center: true },
                    { text: '请假天数', isHeader: true },
                    { text: `${timeData.leaveDays}天`, bold: true, center: true }
                ],
                [
                    { text: '请假原因', isHeader: true },
                    { text: parsedData.leaveReason || '', colSpan: 3 }
                ]
            ]),

            // 请假时间表格
            this.createTable([
                [
                    { text: '请休假时间', isHeader: true },
                    {
                        text: `${timeData.leaveTimeStr || ''}\n（休假共计 ${timeData.leaveDays} 天，其中工作日 ${parsedData.workdayCount || timeData.leaveDays} 天）`,
                        colSpan: 3
                    }
                ]
            ])
        ];
    }

    /**
     * 创建出差内容
     */
    static createAwayContent(parsedData, timeData, detailData) {
        return [
            this.createTable([
                [
                    { text: '部门名称', isHeader: true },
                    { text: parsedData.deptName || detailData.deptName || '', colSpan: 3 }
                ]
            ]),
            this.createTable([
                [
                    { text: '出差事由', isHeader: true },
                    { text: parsedData.awayReason || '', colSpan: 3 }
                ]
            ]),
            this.createTable([
                [
                    { text: '出差人员', isHeader: true },
                    { text: parsedData.applyName || detailData.applyName || detailData.userName || '', colSpan: 3 }
                ]
            ]),
            this.createTable([
                [
                    { text: '出差地点', isHeader: true },
                    { text: parsedData.awayLocation || '', colSpan: 3 }
                ]
            ]),
            this.createTable([
                [
                    { text: '出差时间', isHeader: true },
                    { text: timeData.awayTimeStr || '', colSpan: 3 }
                ]
            ])
        ];
    }

    /**
     * 创建合同内容
     */
    static createContractContent(parsedData, detailData, contractDates) {
        const { statusMap } = this.getDataMaps();

        return [
            // 状态信息
            this.createTable([
                [{ text: '提交时间', isHeader: true }, { text: detailData.createTime || '' }, { text: '当前审批状态', isHeader: true }, { text: statusMap[detailData.status] || '待审核' }]
            ]),

            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 合同基本信息
            this.createTable([
                [{ text: '合同承办部门', isHeader: true }, { text: parsedData.contractDepartment || '' }, { text: '合同签订方式', isHeader: true }, { text: parsedData.negotiators || '' }]
            ]),
            this.createTable([
                [
                    { text: '合同名称', isHeader: true },
                    { text: parsedData.contractName || '', colSpan: 3 }
                ]
            ]),
            this.createTable([[{ text: '甲方单位名称', isHeader: true }, { text: parsedData.partyA || '' }, { text: '乙方单位名称', isHeader: true }, { text: parsedData.partyB || '' }]]),
            this.createTable([
                [
                    { text: '丙方单位名称', isHeader: true },
                    { text: parsedData.partyC || '', colSpan: 3 }
                ]
            ]),
            this.createTable([
                [{ text: '签约日期', isHeader: true }, { text: contractDates.signingDate || '' }, { text: '合同开始时间', isHeader: true }, { text: contractDates.contractStartDate || '' }],
                [
                    { text: '合同终止时间', isHeader: true },
                    { text: contractDates.contractEndDate || '', colSpan: 3 }
                ]
            ]),
            this.createTable([
                [
                    { text: '合同内容', isHeader: true },
                    { text: parsedData.contractContent || '', colSpan: 3, minHeight: 800 }
                ]
            ]),
            this.createTable([
                [
                    { text: '合同金额', isHeader: true },
                    { text: `${parsedData.contractAmount || ''} 元` },
                    { text: '合同份数', isHeader: true },
                    { text: parsedData.contractCopies !== undefined && parsedData.contractCopies !== null ? `${parsedData.contractCopies}份` : '' }
                ]
            ]),
            this.createTable([
                [
                    { text: '附件', isHeader: true },
                    { text: parsedData.attachment ? '已上传附件' : '无附件', colSpan: 3 }
                ]
            ])
        ];
    }

    /**
     * 创建其他事务内容
     */
    static createOtherContent(parsedData) {
        const content = [
            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 事务标题
            this.createTable([
                [
                    { text: '事务标题', isHeader: true },
                    { text: parsedData.title || '', colSpan: 3, bold: true }
                ]
            ]),

            // 申请事项
            this.createTable([
                [
                    { text: '申请事项', isHeader: true },
                    { text: parsedData.applyMatter || '', colSpan: 3, minHeight: 800 }
                ]
            ])
        ];

        // 金额信息（如果有）
        if (parsedData.amount || parsedData.payAmount) {
            content.push(
                this.createTable([
                    [
                        { text: '涉及金额', isHeader: true },
                        { text: `${parsedData.amount || parsedData.payAmount || ''} 元` },
                        { text: '金额类型', isHeader: true },
                        { text: parsedData.amountType || '其他费用' }
                    ]
                ])
            );
        }

        // 申请理由（如果有）
        if (parsedData.reason || parsedData.applyReason) {
            content.push(
                this.createTable([
                    [
                        { text: '申请理由', isHeader: true },
                        { text: parsedData.reason || parsedData.applyReason || '', colSpan: 3, minHeight: 600 }
                    ]
                ])
            );
        }

        // 紧急程度（如果有）
        if (parsedData.urgencyLevel) {
            const urgencyMap = {
                urgent: '紧急',
                normal: '一般',
                low: '不紧急'
            };
            content.push(
                this.createTable([
                    [
                        { text: '紧急程度', isHeader: true },
                        { text: urgencyMap[parsedData.urgencyLevel] || parsedData.urgencyLevel },
                        { text: '期望处理时间', isHeader: true },
                        { text: parsedData.expectedTime || '' }
                    ]
                ])
            );
        }

        // 涉及部门（如果有）
        if (parsedData.relatedDept || parsedData.cooperationDept) {
            content.push(
                this.createTable([
                    [
                        { text: parsedData.relatedDept ? '涉及部门' : '配合部门', isHeader: true },
                        { text: parsedData.relatedDept || parsedData.cooperationDept || '', colSpan: 3 }
                    ]
                ])
            );
        }

        // 附件材料
        content.push(
            this.createTable([
                [
                    { text: '附件材料', isHeader: true },
                    {
                        text: parsedData.fileUrl ? '已上传相关附件材料' : '无附件' + (parsedData.attachmentNote ? `\n备注：${parsedData.attachmentNote}` : ''),
                        colSpan: 3
                    }
                ]
            ])
        );

        // 补充说明（如果有）
        if (parsedData.remark || parsedData.additionalInfo) {
            content.push(
                this.createTable([
                    [
                        { text: '补充说明', isHeader: true },
                        { text: parsedData.remark || parsedData.additionalInfo || '', colSpan: 3, minHeight: 400 }
                    ]
                ])
            );
        }

        return content;
    }

    /**
     * 创建零星采购内容
     */
    static createProcurementContent(parsedData) {
        const content = [
            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 购买渠道
            this.createTable([
                [
                    { text: '购买渠道', isHeader: true },
                    { text: parsedData.purchaseType || '', colSpan: 3 }
                ]
            ]),

            // 申请原因及用途说明
            this.createTable([
                [
                    {
                        text: `申请原因
                        及用途说明`,
                        isHeader: true
                    },
                    { text: parsedData.applyReason || '', colSpan: 3, minHeight: 600 }
                ]
            ])
        ];

        // 商品明细表格
        if (parsedData.items && parsedData.items.length > 0) {
            const itemRows = [
                [
                    { text: '名称', isHeader: true },
                    { text: '品牌', isHeader: true },
                    { text: '型号', isHeader: true },
                    { text: '数量', isHeader: true },
                    { text: '单位', isHeader: true },
                    { text: '单价', isHeader: true },
                    { text: '商品购买链接', isHeader: true },
                    { text: '附件', isHeader: true },
                    { text: '小计', isHeader: true }
                ]
            ];

            parsedData.items.forEach(item => {
                itemRows.push([
                    { text: item.name || '' },
                    { text: item.brand || '' },
                    { text: item.model || '' },
                    { text: item.quantity || '', center: true },
                    { text: item.unit || '' },
                    { text: item.price ? parseFloat(item.price).toFixed(2) : '', center: true },
                    { text: item.purchaseLink || '' },
                    { text: item.fileUrl ? '已上传' : '', center: true },
                    { text: item.subtotal ? parseFloat(item.subtotal).toFixed(2) : '', center: true }
                ]);
            });

            // 使总宽度与其他表格一致（9600 twips）
            content.push(this.createCustomTable(itemRows, [1120, 1060, 1060, 1060, 1060, 1060, 1060, 1060, 1060]));
        }

        // 总小计
        content.push(
            this.createTable([
                [
                    { text: '总小计', isHeader: true },
                    { text: `${parsedData.totalAmount || '0.00'} 元`, colSpan: 3, center: true, bold: true }
                ]
            ])
        );

        return content;
    }

    /**
     * 创建业务招待内容
     */
    static createHospitalityContent(parsedData) {
        return [
            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 招待基本信息
            this.createTable([
                [{ text: '招待日期及时间', isHeader: true }, { text: parsedData.hospitalityDateTime || '' }, { text: '招待地点', isHeader: true }, { text: parsedData.hospitalityLocation || '' }]
            ]),

            this.createTable([[{ text: '招待单位', isHeader: true }, { text: parsedData.hospitalityUnit || '' }, { text: '招待人数', isHeader: true }, { text: parsedData.hospitalityCount || '' }]]),

            // 申请事由
            this.createTable([
                [
                    { text: '申请事由', isHeader: true },
                    { text: parsedData.hospitalityReason || '', colSpan: 3, minHeight: 600 }
                ]
            ]),

            // 我方参与人员
            this.createTable([
                [
                    { text: '我方参与人员', isHeader: true },
                    { text: parsedData.ourParticipants || '', colSpan: 3, minHeight: 400 }
                ]
            ]),

            // 预计消费金额
            this.createTable([
                [
                    { text: '预计消费金额', isHeader: true },
                    { text: `${parsedData.estimatedAmount ? parseFloat(parsedData.estimatedAmount).toFixed(2) : '0.00'} 元`, colSpan: 3, center: true, bold: true }
                ]
            ])
        ];
    }

    /**
     * 创建用印申请内容
     */
    static createOfficialSealContent(parsedData) {
        return [
            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 印章名称
            this.createTable([
                [
                    { text: '印章名称', isHeader: true },
                    {
                        text:
                            (parsedData.sealType && Array.isArray(parsedData.sealType) ? parsedData.sealType.join('、') : parsedData.sealType || '') +
                            (parsedData.sealType && parsedData.sealType.includes && parsedData.sealType.includes('其他') && parsedData.otherSealNote ? `\n${parsedData.otherSealNote}` : ''),
                        colSpan: 3,
                        bold: true
                    }
                ]
            ]),

            // 用章类别
            this.createTable([
                [
                    { text: '用章类别', isHeader: true },
                    { text: `加盖印章（材料份数：${parsedData.documentCount || 1}）`, colSpan: 3 }
                ]
            ]),

            // 用章事由
            this.createTable([
                [
                    { text: '用章事由', isHeader: true },
                    { text: parsedData.sealReason || '', colSpan: 3, minHeight: 1000 }
                ]
            ])
        ];
    }

    /**
     * 创建拨款申请内容
     */
    static createGrantContent(parsedData) {
        return [
            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 基本信息
            this.createTable([
                [
                    { text: '款项支付公司', isHeader: true },
                    { text: parsedData.payCompany || '' },
                    { text: '付款金额', isHeader: true },
                    { text: parsedData.payAmount ? parseFloat(parsedData.payAmount).toFixed(2) : '' }
                ]
            ]),

            this.createTable([
                [
                    { text: '收款方全称', isHeader: true },
                    { text: parsedData.receiverName || '' },
                    { text: '付款类型', isHeader: true },
                    { text: parsedData.payType === 'contract' ? '合同类' : parsedData.payType === 'nonContract' ? '非合同类' : parsedData.payType || '' }
                ]
            ]),

            this.createTable([[{ text: '付款项目分类', isHeader: true }, { text: parsedData.payCategory || '' }, { text: '合同名称', isHeader: true }, { text: parsedData.contractName || '' }]]),

            this.createTable([
                [
                    { text: '合同累积付款金额', isHeader: true },
                    { text: parsedData.contractTotalPaid ? parseFloat(parsedData.contractTotalPaid).toFixed(2) : '' },
                    { text: '付款方式', isHeader: true },
                    { text: parsedData.payMethod || '电汇' }
                ]
            ]),

            this.createTable([
                [{ text: '收款方银行账号', isHeader: true }, { text: parsedData.receiverBankAccount || '' }, { text: '收款方开户行', isHeader: true }, { text: parsedData.receiverBank || '' }]
            ]),

            this.createTable([
                [
                    { text: '计划付款日期', isHeader: true },
                    { text: parsedData.planPayDate || '', colSpan: 3 }
                ]
            ]),

            // 付款内容概述
            this.createTable([
                [
                    { text: '付款内容概述', isHeader: true },
                    { text: parsedData.payDescription || '', colSpan: 3, minHeight: 800 }
                ]
            ]),

            this.createTable([
                [
                    { text: '付款凭证照片', isHeader: true },
                    { text: parsedData.payProofFiles ? '已上传附件' : '' },
                    { text: '关联申请单', isHeader: true },
                    { text: parsedData.relatedApplication || '' }
                ]
            ])
        ];
    }

    /**
     * 创建费用报销内容
     */
    static createExpenseContent(parsedData) {
        return [
            // 申请内容标题
            this.createTable([[{ text: '申请内容', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 基本信息
            this.createTable([
                [
                    { text: '计划付款日期', isHeader: true },
                    { text: parsedData.planPayDate || '' },
                    { text: '付款金额', isHeader: true },
                    { text: parsedData.payAmount ? parseFloat(parsedData.payAmount).toFixed(2) : '' }
                ]
            ]),

            this.createTable([[{ text: '收款方全称', isHeader: true }, { text: parsedData.receiverName || '' }, { text: '付款方式', isHeader: true }, { text: parsedData.payMethod || '电汇' }]]),

            this.createTable([
                [{ text: '收款方银行账号', isHeader: true }, { text: parsedData.receiverBankAccount || '' }, { text: '收款方开户行', isHeader: true }, { text: parsedData.receiverBank || '' }]
            ]),

            // 付款内容概述
            this.createTable([
                [
                    { text: '付款内容概述', isHeader: true },
                    { text: parsedData.payDescription || '', colSpan: 3, minHeight: 800 }
                ]
            ]),

            this.createTable([
                [
                    { text: '付款凭证照片', isHeader: true },
                    { text: parsedData.payProofFiles ? '已上传附件' : '' },
                    { text: '关联申请单', isHeader: true },
                    { text: parsedData.relatedApplication || '' }
                ]
            ])
        ];
    }

    /**
     * 创建审批流程
     */
    static createApprovalFlow(detailData, approvalStatusMap) {
        const content = [
            // 审批流程标题
            this.createTable([[{ text: '审批流程', center: true, bold: true, colSpan: 4, isHeader: true }]])
        ];

        // 审批流程表格头
        const approvalRows = [
            [
                { text: '审批部门', isHeader: true, center: true },
                { text: '处理人', isHeader: true, center: true },
                { text: '审批意见', isHeader: true, center: true, colSpan: 2 }
            ]
        ];

        // 自定义列宽：根据总宽度 9600twip 调整
        // 审批部门 3200, 处理人 1536, 审批意见两列各 2432
        const approvalColumnWidths = [3200, 1536, 2432, 2432];

        // 添加审批记录
        if (detailData.detailList && Array.isArray(detailData.detailList) && detailData.detailList.length > 0) {
            detailData.detailList.forEach((item, index) => {
                const statusText = approvalStatusMap[item.status] || '未知状态';
                const checkTime = item.checkTime ? new Date(item.checkTime).toLocaleString('zh-CN') : '';

                let opinionText = statusText;
                if (checkTime) {
                    opinionText += `\n时间：${checkTime}`;
                }
                if (item.opinion) {
                    opinionText += `\n意见：${item.opinion}`;
                }

                approvalRows.push([{ text: item.deptName || '' }, { text: item.checkName || '待处理' }, { text: opinionText, colSpan: 2 }]);
            });
        } else {
            // 如果没有审批记录，显示默认结构
            approvalRows.push([{ text: '-' }, { text: '待分配审批人' }, { text: '待审批', colSpan: 2 }]);
        }

        content.push(this.createTable(approvalRows, approvalColumnWidths));

        return content;
    }

    /**
     * 创建抄送人信息
     */
    static createCopyToInfo(detailData, allUserList = []) {
        // 如果没有抄送人，返回空数组
        if (!detailData.ccList || !Array.isArray(detailData.ccList) || detailData.ccList.length === 0) {
            return [];
        }

        // 获取抄送人信息
        const ccUsers = detailData.ccList
            .map(item => {
                const uid = typeof item === 'object' && item !== null && 'userId' in item ? item.userId : item;
                const user = allUserList.find(u => u.userId === uid);
                if (user) {
                    const deptName = user.dept ? user.dept.deptName : '';
                    return deptName ? `${user.nickName}(${deptName})` : user.nickName;
                }
                return `用户${uid}`;
            })
            .filter(Boolean);

        if (ccUsers.length === 0) {
            return [];
        }

        return [
            // 抄送信息标题
            this.createTable([[{ text: '抄送信息', center: true, bold: true, colSpan: 4, isHeader: true }]]),

            // 抄送人列表
            this.createTable([
                [
                    { text: '抄送人', isHeader: true },
                    { text: ccUsers.join('、'), colSpan: 3 }
                ]
            ])
        ];
    }

    /**
     * 创建备注和状态信息
     */
    static createFooterInfo(detailData, parsedData, statusMap) {
        return [
            this.createTable([
                [
                    { text: '备注信息', isHeader: true },
                    { text: detailData.remark || parsedData.remark || '', colSpan: 3 }
                ],
                [
                    { text: '申请状态', isHeader: true },
                    { text: statusMap[detailData.status] || '待审核', colSpan: 3 }
                ]
            ])
        ];
    }
}

export default WordGenerator;
