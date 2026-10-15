<!-- 实时提示与话术推荐 -->
<template>
    <div class="smart-script-panel">
        <div class="panel-header">
            <span class="panel-title">实时提示与话术推荐</span>
            <i class="el-icon-close panel-close" @click="$emit('close')" />
        </div>

        <div ref="panelBody" class="panel-body">
            <div
                v-for="(module, index) in displayedPanelHistory"
                :key="module.id"
                class="recommendation-module"
                :class="{ 'is-latest': index === displayedPanelHistory.length - 1 }"
            >
                <div class="recommendation-module__head">
                    <span>{{ panelHistory.length ? `第 ${index + 1} 次推荐` : '等待生成' }}</span>
                </div>

                <!-- 制度条款推荐 -->
                <section class="panel-section">
                    <div class="section-head">
                        <h4 class="section-title">【制度条款推荐】</h4>
                        <span class="section-action" @click="handleViewClauseDetail(module)">[查看详情]</span>
                    </div>
                    <p class="clause-meta">{{ getClauseData(module).title }}</p>
                </section>

                <!-- 案例/判例摘要推荐 -->
                <section class="panel-section">
                    <div class="section-head">
                        <div class="summary-switch" role="tablist" aria-label="摘要推荐类型">
                            <button
                                type="button"
                                role="tab"
                                class="summary-tab"
                                :class="{ 'is-active': module.activeSummaryType === 'case' }"
                                :aria-selected="module.activeSummaryType === 'case'"
                                @click="module.activeSummaryType = 'case'"
                            >
                                【案例摘要推荐】
                            </button>
                            <span class="summary-divider">/</span>
                            <button
                                type="button"
                                role="tab"
                                class="summary-tab"
                                :class="{ 'is-active': module.activeSummaryType === 'judgment' }"
                                :aria-selected="module.activeSummaryType === 'judgment'"
                                @click="module.activeSummaryType = 'judgment'"
                            >
                                【判例摘要推荐】
                            </button>
                        </div>
                        <span class="section-action" @click="handleViewSummaryDetail(module)">[查看详情]</span>
                    </div>
                    <p class="section-content">{{ getActiveSummary(module).title }}</p>
                </section>

                <!-- 风险提示 -->
                <section class="panel-section panel-section--risk">
                    <h4 class="section-title">【风险提示】</h4>
                    <p class="risk-content">
                        <i class="el-icon-warning-outline risk-icon" />
                        {{ module.data.risk_warning || '暂无风险提示' }}
                    </p>
                </section>

                <!-- 话术推荐 -->
                <section class="panel-section panel-section--script">
                    <div class="section-head">
                        <h4 class="section-title">
                            【话术推荐】
                            <span class="section-sub">(根据语境生成)</span>
                        </h4>
                        <span
                            v-if="index === displayedPanelHistory.length - 1"
                            class="section-action"
                            :class="{ 'is-loading': scriptRegenerating }"
                            @click="handleRegenerate"
                        >
                            [{{ scriptRegenerating ? '生成中...' : '重新生成' }}]
                        </span>
                    </div>
                    <div class="script-box">
                        <p class="script-label">建议话术内容 (中立/合规)</p>
                        <p class="script-text">{{ module.data.suggested_script || '暂无推荐话术' }}</p>
                    </div>
                </section>
            </div>
        </div>

        <!-- 条款详情弹窗 -->
        <el-dialog
            title="制度条款详情"
            :visible.sync="clauseDetailVisible"
            width="520px"
            append-to-body
            class="clause-detail-dialog"
        >
            <div class="clause-detail">
                <h5>{{ clauseDetailData.title }}</h5>
                <p class="detail-source">来源: {{ clauseDetailData.source }}</p>
                <div class="detail-body" v-html="formattedClauseDetail" />
            </div>
            <span slot="footer">
                <el-button type="primary" size="small" @click="clauseDetailVisible = false">知道了</el-button>
            </span>
        </el-dialog>

        <!-- 案例/判例详情弹窗 -->
        <el-dialog
            :title="summaryDetailData.dialogTitle"
            :visible.sync="summaryDetailVisible"
            width="620px"
            append-to-body
            class="clause-detail-dialog"
        >
            <div class="clause-detail">
                <h5>{{ summaryDetailData.title }}</h5>
                <p class="detail-source">来源: {{ summaryDetailData.source }}</p>
                <div class="detail-body" v-html="formattedSummaryDetail" />
            </div>
            <span slot="footer">
                <el-button type="primary" size="small" @click="summaryDetailVisible = false">知道了</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
const DEFAULT_PANEL_DATA = {
    institution_rules: {
        title: '',
        source: '',
        content: '',
        full_text: ''
    },
    similar_case_summary: '',
    similar_case_title: '',
    similar_case_source: '',
    similar_case_full_text: '',
    similar_judgment_summary: '',
    similar_judgment_title: '',
    similar_judgment_source: '',
    similar_judgment_full_text: '',
    risk_warning: '',
    suggested_script: ''
};

function normalizePanelData(panelData) {
    const value = panelData || {};
    return {
        ...DEFAULT_PANEL_DATA,
        ...value,
        institution_rules: {
            ...DEFAULT_PANEL_DATA.institution_rules,
            ...(value.institution_rules || {})
        }
    };
}

function createPanelModule(id, panelData) {
    const data = normalizePanelData(panelData);
    return {
        id,
        data,
        activeSummaryType: 'case'
    };
}

function hasPanelContent(data) {
    return Boolean(
        data.institution_rules.title
        || data.institution_rules.full_text
        || data.similar_case_title
        || data.similar_case_summary
        || data.similar_judgment_title
        || data.similar_judgment_summary
        || data.risk_warning
        || data.suggested_script
    );
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default {
    name: 'SmartScriptPanel',
    props: {
        panelData: {
            type: Object,
            default: () => ({})
        },
        loading: {
            type: Boolean,
            default: false
        },
        scriptRegenerating: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            clauseDetailVisible: false,
            summaryDetailVisible: false,
            panelHistory: [],
            nextPanelHistoryId: 1,
            emptyPanelModule: createPanelModule('empty', null),
            clauseDetailData: {
                title: '暂无制度条款推荐',
                source: '系统分析',
                detail: ''
            },
            summaryDetailData: {
                title: '暂无相关案例推荐',
                source: '案例库',
                detail: '',
                dialogTitle: '案例详情'
            }
        };
    },
    watch: {
        panelData: {
            immediate: true,
            deep: true,
            handler(value) {
                this.capturePanelData(value);
            }
        }
    },
    computed: {
        displayedPanelHistory() {
            return this.panelHistory.length ? this.panelHistory : [this.emptyPanelModule];
        },
        formattedClauseDetail() {
            const detail = String(this.clauseDetailData.detail || '').trim();
            if (!detail) {
                return '<p>暂无条款详情</p>';
            }
            const escapedDetail = escapeHtml(detail).replace(/\n/g, '<br>');
            return `<p>${escapedDetail}</p>`;
        },
        formattedSummaryDetail() {
            const detail = String(this.summaryDetailData.detail || '').trim();
            if (!detail) {
                return '<p>暂无详情内容</p>';
            }
            const escapedDetail = escapeHtml(detail).replace(/\n/g, '<br>');
            return `<p>${escapedDetail}</p>`;
        }
    },
    methods: {
        capturePanelData(panelData) {
            if (!panelData) {
                this.panelHistory = [];
                this.nextPanelHistoryId = 1;
                return;
            }
            const module = createPanelModule(this.nextPanelHistoryId, panelData);
            if (!hasPanelContent(module.data)) return;

            this.nextPanelHistoryId += 1;
            this.panelHistory.push(module);
            this.$nextTick(() => {
                const panelBody = this.$refs.panelBody;
                if (panelBody) {
                    panelBody.scrollTop = panelBody.scrollHeight;
                }
            });
        },
        getClauseData(module) {
            const rules = module.data.institution_rules;
            return {
                title: rules.title || '暂无制度条款推荐',
                source: rules.source || '系统分析',
                detail: rules.full_text || ''
            };
        },
        getActiveSummary(module) {
            if (module.activeSummaryType === 'judgment') {
                return {
                    title: module.data.similar_judgment_title || '暂无相关判例推荐',
                    source: module.data.similar_judgment_source || '判例库',
                    detail: module.data.similar_judgment_full_text || module.data.similar_judgment_summary || '',
                    dialogTitle: '判例详情'
                };
            }
            return {
                title: module.data.similar_case_title || '暂无相关案例推荐',
                source: module.data.similar_case_source || '案例库',
                detail: module.data.similar_case_full_text || module.data.similar_case_summary || '',
                dialogTitle: '案例详情'
            };
        },
        handleViewClauseDetail(module) {
            this.clauseDetailData = this.getClauseData(module);
            this.clauseDetailVisible = true;
        },
        handleViewSummaryDetail(module) {
            this.summaryDetailData = this.getActiveSummary(module);
            this.summaryDetailVisible = true;
        },
        handleRegenerate() {
            if (this.scriptRegenerating || this.loading) return;
            this.$emit('regenerate');
        }
    }
};
</script>

<style scoped lang="scss">
.smart-script-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(165deg, #f7f9fc 0%, #eef2f8 100%);
    border: 1px solid #d9e2ef;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(9, 88, 217, 0.08);
    animation: panel-in 0.28s ease-out;
}

@keyframes panel-in {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #e4eaf3;
    flex-shrink: 0;

    .panel-title {
        font-size: 15px;
        font-weight: 600;
        color: #1a2b4a;
        letter-spacing: 0.02em;
    }

    .panel-close {
        font-size: 18px;
        color: #909399;
        cursor: pointer;
        padding: 2px;
        transition: color 0.2s;

        &:hover {
            color: #0958d9;
        }
    }
}

.panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 14px 14px;
}

.recommendation-module {
    padding: 10px;
    margin-bottom: 12px;
    background: #f4f7fb;
    border: 1px solid #d7e1ee;
    border-radius: 6px;

    &:last-child {
        margin-bottom: 0;
    }

    &.is-latest {
        border-color: #b8cbed;
    }

    &__head {
        display: flex;
        align-items: center;
        min-height: 20px;
        margin: 0 2px 8px;
        color: #5e6d85;
        font-size: 12px;
        font-weight: 600;
    }
}

.panel-section {
    background: #fff;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 10px;
    border: 1px solid #e8edf4;

    &:last-child {
        margin-bottom: 0;
    }

    &--risk {
        border-color: #fde2e2;
        background: linear-gradient(135deg, #fff 0%, #fff9f9 100%);
    }

    &--script {
        margin-bottom: 0;
    }
}

.section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
}

.section-title {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: #1a2b4a;
    line-height: 1.4;

    .section-sub {
        font-weight: 400;
        font-size: 12px;
        color: #909399;
    }
}

.section-head .section-title {
    margin-bottom: 0;
}

.summary-switch {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 0;
}

.summary-tab {
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: #909399;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0;
    cursor: pointer;
    transition: color 0.2s;

    &:hover,
    &.is-active {
        color: #0958d9;
    }

    &:focus-visible {
        outline: 2px solid rgba(9, 88, 217, 0.25);
        outline-offset: 2px;
    }
}

.summary-divider {
    color: #c0c4cc;
    font-size: 12px;
}

.section-action {
    font-size: 12px;
    color: #0958d9;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: 8px;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.75;
    }

    &.is-loading {
        color: #909399;
        cursor: not-allowed;
    }
}

.clause-meta,
.section-content {
    margin: 0;
    font-size: 12px;
    color: #606266;
    line-height: 1.6;
}

.risk-content {
    margin: 0;
    font-size: 12px;
    color: #c45656;
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 4px;

    .risk-icon {
        margin-top: 2px;
        flex-shrink: 0;
    }
}

.script-box {
    margin-top: 8px;
    padding: 10px 12px;
    background: #f8fafc;
    border: 1px solid #dce3ed;
    border-radius: 6px;
    .script-label {
        margin: 0 0 6px;
        font-size: 11px;
        color: #909399;
    }

    .script-text {
        margin: 0;
        font-size: 12px;
        color: #303133;
        line-height: 1.75;
        text-align: justify;
    }
}

.clause-detail {
    h5 {
        margin: 0 0 6px;
        font-size: 15px;
        color: #303133;
    }

    .detail-source {
        margin: 0 0 12px;
        font-size: 12px;
        color: #909399;
    }

    .detail-body {
        max-height: 60vh;
        overflow-y: auto;
        padding-right: 6px;
        font-size: 13px;
        color: #606266;
        line-height: 1.8;

        ::v-deep p {
            margin: 0 0 10px;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}
</style>
