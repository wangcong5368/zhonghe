<!-- 证据比对报告 -->
<template>
  <el-dialog :visible.sync="visible" width="1200px" append-to-body :close-on-click-modal="false" :show-close="false"
    custom-class="evidence-comparison-dialog" @closed="handleClosed">
    <div class="ec-report">
      <!-- 顶部标题栏 -->
      <header class="ec-header">
        <div class="ec-header__left">
          <i class="el-icon-s-data ec-header__icon" />
          <span class="ec-header__title">证据比对报告</span>
        </div>
        <i class="el-icon-close ec-header__close" @click="visible = false" />
      </header>

      <div class="ec-body" v-loading="loading">
        <p class="ec-case-no">案件编号：{{ reportData.caseNo }}</p>

        <!-- 一、最终比对结果 -->
        <section class="ec-section">
          <h3 class="ec-section__title">
            <span class="ec-section__bar" />
            一、最终比对结果
          </h3>

          <div class="ec-result-hero">
            <div class="ec-result-hero__badge">
              <i class="el-icon-medal" />
              {{ reportData.finalResult.conclusion }}
            </div>
            <p class="ec-result-hero__summary">{{ reportData.finalResult.summary }}</p>

            <div class="ec-result-hero__main">
              <div class="ec-advantage-block">
                <div class="ec-advantage-labels">
                  <span class="ec-label ec-label--inst">
                    <i class="ec-dot ec-dot--inst" />
                    机构方占优
                    <em>{{ reportData.finalResult.institutionAdvantage }}%</em>
                  </span>
                  <span class="ec-label ec-label--cons">
                    <em>{{ reportData.finalResult.consumerAdvantage }}%</em>
                    消费者方占优
                    <i class="ec-dot ec-dot--cons" />
                  </span>
                </div>
                <div class="ec-advantage-bar">
                  <div class="ec-advantage-bar__inst"
                    :style="{ width: reportData.finalResult.institutionAdvantage + '%' }" />
                  <div class="ec-advantage-bar__cons"
                    :style="{ width: reportData.finalResult.consumerAdvantage + '%' }" />
                </div>
              </div>

              <div class="ec-metrics">
                <div class="ec-metric-card">
                  <i class="el-icon-document ec-metric-card__icon ec-metric-card__icon--blue" />
                  <div class="ec-metric-card__value">{{ reportData.finalResult.metrics.evidenceCompleteness }}%</div>
                  <div class="ec-metric-card__label">证据完整度</div>
                </div>
                <div class="ec-metric-card">
                  <i class="el-icon-circle-check ec-metric-card__icon ec-metric-card__icon--green" />
                  <div class="ec-metric-card__value">{{ reportData.finalResult.metrics.analysisConfidence }}%</div>
                  <div class="ec-metric-card__label">分析置信度</div>
                </div>
                <div class="ec-metric-card">
                  <i class="el-icon-s-order ec-metric-card__icon ec-metric-card__icon--purple" />
                  <div class="ec-metric-card__value">{{ reportData.finalResult.metrics.disputePointCount }}项</div>
                  <div class="ec-metric-card__label">争议焦点</div>
                </div>
              </div>
            </div>

            <p class="ec-disclaimer">
              <i class="el-icon-info" />
              {{ reportData.finalResult.disclaimer }}
            </p>
          </div>
        </section>

        <!-- 二、争议焦点对比 -->
        <section class="ec-section">
          <h3 class="ec-section__title">
            <span class="ec-section__bar" />
            二、争议焦点对比
          </h3>

          <div class="ec-dispute-summary">
            <span class="ec-dispute-summary__inst">
              <i class="ec-dot ec-dot--inst" />
              机构方占优 {{ reportData.disputeSummary.institutionWinCount }} 项
            </span>
            <span class="ec-dispute-summary__divider">|</span>
            <span class="ec-dispute-summary__cons">
              <i class="ec-dot ec-dot--cons" />
              消费者方占优 {{ reportData.disputeSummary.consumerWinCount }} 项
            </span>
          </div>

          <div v-for="point in reportData.disputePoints" :key="point.index" class="ec-dispute-card">
            <div class="ec-dispute-card__head">
              <span class="ec-dispute-card__index">{{ point.index }}</span>
              <span class="ec-dispute-card__title">{{ point.title }}</span>
              <span class="ec-advantage-tag" :class="'ec-advantage-tag--' + point.advantageType">
                {{ point.advantageTag }}
              </span>
            </div>

            <div class="ec-dispute-card__claims">
              <div class="ec-claim ec-claim--inst">
                <div class="ec-claim__label">
                  <i class="ec-dot ec-dot--inst" />
                  机构方主张
                </div>
                <p class="ec-claim__text">{{ point.institutionClaim }}</p>
              </div>
              <div class="ec-claim ec-claim--cons">
                <div class="ec-claim__label">
                  <i class="ec-dot ec-dot--cons" />
                  消费者方主张
                </div>
                <p class="ec-claim__text">{{ point.consumerClaim }}</p>
              </div>
              <div class="ec-claim ec-claim--ai">
                <div class="ec-claim__label">
                  <i class="el-icon-cpu" />
                  AI比对结果
                </div>
                <p class="ec-claim__text ec-claim__text--ai">{{ point.aiResult }}</p>
                <div class="ec-ratio-row">
                  <span class="ec-ratio-label ec-ratio-label--inst">机构方 {{ point.institutionRatio }}%</span>
                  <div class="ec-ratio-bar">
                    <div class="ec-ratio-bar__inst" :style="{ width: point.institutionRatio + '%' }" />
                    <div class="ec-ratio-bar__cons" :style="{ width: point.consumerRatio + '%' }" />
                  </div>
                  <span class="ec-ratio-label ec-ratio-label--cons">消费者方 {{ point.consumerRatio }}%</span>
                </div>
              </div>
            </div>

            <div class="ec-key-evidence">
              <i class="el-icon-paperclip" />
              <span class="ec-key-evidence__label">关键依据：</span>
              {{ point.keyEvidence }}
            </div>
          </div>
        </section>

        <!-- 三、最终结论依据 -->
        <section class="ec-section">
          <h3 class="ec-section__title">
            <span class="ec-section__bar" />
            三、最终结论依据
          </h3>

          <div class="ec-dimension-chart">
            <div class="ec-dimension-chart__legend">
              <span><i class="ec-dot ec-dot--inst" />机构方</span>
              <span><i class="ec-dot ec-dot--cons" />消费者方</span>
            </div>
            <div v-for="dim in reportData.conclusionBasis.dimensions" :key="dim.name" class="ec-dimension-row">
              <span class="ec-dimension-row__name">{{ dim.name }}</span>
              <div class="ec-dimension-row__bars">
                <div class="ec-dimension-bar-wrap">
                  <div class="ec-dimension-bar ec-dimension-bar--inst" :style="{ width: dim.institution + '%' }" />
                  <span class="ec-dimension-bar__score">{{ dim.institution }}</span>
                </div>
                <div class="ec-dimension-bar-wrap">
                  <div class="ec-dimension-bar ec-dimension-bar--cons" :style="{ width: dim.consumer + '%' }" />
                  <span class="ec-dimension-bar__score">{{ dim.consumer }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="ec-basis-columns">
            <div class="ec-basis-box ec-basis-box--inst">
              <h4 class="ec-basis-box__title">
                <i class="ec-dot ec-dot--inst" />
                支持机构方的主要依据
              </h4>
              <ol class="ec-basis-box__list">
                <li v-for="(item, idx) in reportData.conclusionBasis.institutionBasis" :key="'inst-' + idx">
                  {{ item }}
                </li>
              </ol>
            </div>
            <div class="ec-basis-box ec-basis-box--cons">
              <h4 class="ec-basis-box__title">
                <i class="ec-dot ec-dot--cons" />
                支持消费者方的主要依据
              </h4>
              <ol class="ec-basis-box__list">
                <li v-for="(item, idx) in reportData.conclusionBasis.consumerBasis" :key="'cons-' + idx">
                  {{ item }}
                </li>
              </ol>
            </div>
          </div>

          <div class="ec-conclusion-summary">
            <i class="el-icon-s-opportunity" />
            {{ reportData.conclusionBasis.summary }}
          </div>
        </section>

        <!-- 四、AI调解建议 -->
        <section class="ec-section ec-section--last">
          <h3 class="ec-section__title">
            <span class="ec-section__bar" />
            四、AI调解建议
          </h3>
          <ol class="ec-suggestion-list">
            <li v-for="(item, idx) in reportData.mediationSuggestions" :key="'sug-' + idx">
              {{ item }}
            </li>
          </ol>
        </section>
      </div>

      <footer class="ec-footer">
        <el-button :loading="regenerating" @click="handleRegenerate">重新生成</el-button>
        <el-button type="primary" :loading="confirming" @click="handleConfirm">确认</el-button>
      </footer>
    </div>
  </el-dialog>
</template>

<script>
import { getCompare } from '@/api/project/disputeMediation';
export default {
  name: 'EvidenceComparison',
  data() {
    return {
      visible: false,
      loading: false,
      regenerating: false,
      confirming: false,
      row: {},
      reportData: {
        caseNo: '',
        finalResult: {
          conclusion: '',
          summary: '',
          institutionAdvantage: 0,
          consumerAdvantage: 0,
          metrics: {
            evidenceCompleteness: 0,
            analysisConfidence: 0,
            disputePointCount: 0
          },
          disclaimer: ''
        },
        disputeSummary: {
          institutionWinCount: 0,
          consumerWinCount: 0
        },
        disputePoints: [],
        conclusionBasis: {
          dimensions: [],
          institutionBasis: [],
          consumerBasis: [],
          summary: ''
        },
        mediationSuggestions: []
      }
    };
  },
  methods: {
    open(row) {
      this.row = row || {};
      this.visible = true;
      this.loadReport();
    },
    loadReport() {
      this.loading = true;
      getCompare(this.row.workOrderId).then(res => {
        if (res.code == 200 && res.data) {
          this.reportData = res.data;
          this.$message.success('报告已生成');
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    handleRegenerate() {
      this.regenerating = true;
      getCompare(this.row.workOrderId).then(res => {
        if (res.code == 200 && res.data) {
          this.reportData = res.data;
          this.$message.success('报告已重新生成');
        }
      }).finally(() => {
        this.regenerating = false;
      });
    },
    handleConfirm() {
      this.confirming = true;
      this.visible = false;
      this.confirming = false;
      this.$message.success('证据比对报告已确认');
      this.$emit('callback');
    },
    handleClosed() {
      this.loading = false;
      this.regenerating = false;
      this.confirming = false;
    }
  }
};
</script>

<style scoped lang="scss">
$inst-color: #3b82f6;
$inst-light: #dbeafe;
$cons-color: #14b8a6;
$cons-light: #ccfbf1;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border-color: #e2e8f0;
$bg-page: #f8fafc;

.ec-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &--inst {
    background: $inst-color;
  }

  &--cons {
    background: $cons-color;
  }
}

.ec-report {
  display: flex;
  flex-direction: column;
  max-height: 88vh;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.ec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  color: #fff;
  flex-shrink: 0;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    font-size: 20px;
    opacity: 0.9;
  }

  &__title {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  &__close {
    font-size: 20px;
    cursor: pointer;
    opacity: 0.85;
    transition: opacity 0.2s;
    padding: 4px;

    &:hover {
      opacity: 1;
    }
  }
}

.ec-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px 8px;
  background: $bg-page;
}

.ec-case-no {
  margin: 0 0 14px;
  font-size: 13px;
  color: $text-secondary;
  font-weight: 500;
}

.ec-section {
  margin-bottom: 18px;

  &--last {
    margin-bottom: 4px;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
  }

  &__bar {
    display: inline-block;
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg, #3b82f6, #60a5fa);
  }
}

/* 最终比对结果 */
.ec-result-hero {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    color: #fff;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);

    i {
      font-size: 18px;
    }
  }

  &__summary {
    margin: 0 0 16px;
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.7;
  }

  &__main {
    display: flex;
    gap: 16px;
    align-items: stretch;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
}

.ec-advantage-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ec-advantage-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.ec-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: $text-secondary;

  em {
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
  }

  &--inst em {
    color: $inst-color;
  }

  &--cons em {
    color: $cons-color;
  }
}

.ec-advantage-bar {
  display: flex;
  height: 16px;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;

  &__inst {
    background: linear-gradient(90deg, #2563eb, #3b82f6);
    transition: width 0.6s ease;
  }

  &__cons {
    background: linear-gradient(90deg, #14b8a6, #2dd4bf);
    transition: width 0.6s ease;
  }
}

.ec-metrics {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.ec-metric-card {
  width: 88px;
  padding: 10px 8px;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 8px;
  text-align: center;

  &__icon {
    font-size: 22px;
    margin-bottom: 4px;

    &--blue {
      color: $inst-color;
    }

    &--green {
      color: #22c55e;
    }

    &--purple {
      color: #8b5cf6;
    }
  }

  &__value {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
  }

  &__label {
    margin-top: 2px;
    font-size: 11px;
    color: $text-secondary;
  }
}

.ec-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin: 14px 0 0;
  padding: 8px 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  font-size: 11px;
  color: #92400e;
  line-height: 1.6;

  i {
    margin-top: 2px;
    flex-shrink: 0;
  }
}

/* 争议焦点 */
.ec-dispute-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;

  &__inst {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: $inst-color;
  }

  &__cons {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: $cons-color;
  }

  &__divider {
    color: #cbd5e1;
  }
}

.ec-dispute-card {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);

  &:last-child {
    margin-bottom: 0;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  &__index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: $inst-color;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    min-width: 0;
  }
}

.ec-advantage-tag {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;

  &--institution {
    background: $inst-light;
    color: $inst-color;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  &--institution_relative {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  &--consumer_relative {
    background: #fff7ed;
    color: #ea580c;
    border: 1px solid rgba(234, 88, 12, 0.25);
  }
}

.ec-dispute-card__claims {
  display: grid;
  grid-template-columns: 1fr 1fr 1.1fr;
  gap: 10px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
}

.ec-claim {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid $border-color;

  &--inst {
    background: linear-gradient(180deg, #f8fbff 0%, #fff 100%);
    border-color: rgba(59, 130, 246, 0.15);
  }

  &--cons {
    background: linear-gradient(180deg, #f0fdfa 0%, #fff 100%);
    border-color: rgba(20, 184, 166, 0.15);
  }

  &--ai {
    background: linear-gradient(180deg, #faf5ff 0%, #fff 100%);
    border-color: rgba(139, 92, 246, 0.15);
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
  }

  &__text {
    margin: 0;
    font-size: 12px;
    color: $text-primary;
    line-height: 1.65;

    &--ai {
      color: #7c3aed;
      font-weight: 500;
    }
  }
}

.ec-ratio-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.ec-ratio-label {
  font-size: 10px;
  white-space: nowrap;
  flex-shrink: 0;

  &--inst {
    color: $inst-color;
  }

  &--cons {
    color: $cons-color;
  }
}

.ec-ratio-bar {
  flex: 1;
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: #f1f5f9;
  min-width: 40px;

  &__inst {
    background: $inst-color;
  }

  &__cons {
    background: $cons-color;
  }
}

.ec-key-evidence {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 10px;
  padding: 8px 10px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 12px;
  color: $text-secondary;
  line-height: 1.6;

  i {
    margin-top: 2px;
    color: #94a3b8;
  }

  &__label {
    font-weight: 600;
    color: $text-primary;
    white-space: nowrap;
  }
}

/* 结论依据 */
.ec-dimension-chart {
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;

  &__legend {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-bottom: 10px;
    font-size: 12px;
    color: $text-secondary;

    span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }
}

.ec-dimension-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  &__name {
    width: 148px;
    flex-shrink: 0;
    font-size: 12px;
    color: $text-primary;
    text-align: right;
  }

  &__bars {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.ec-dimension-bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 18px;
}

.ec-dimension-bar {
  height: 100%;
  border-radius: 3px;
  min-width: 2px;
  transition: width 0.6s ease;

  &--inst {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
  }

  &--cons {
    background: linear-gradient(90deg, #14b8a6, #5eead4);
  }

  &__score {
    font-size: 11px;
    font-weight: 600;
    color: $text-secondary;
    width: 22px;
    flex-shrink: 0;
  }
}

.ec-basis-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

.ec-basis-box {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid $border-color;

  &--inst {
    background: linear-gradient(135deg, #f8fbff 0%, #fff 100%);
    border-color: rgba(59, 130, 246, 0.2);
  }

  &--cons {
    background: linear-gradient(135deg, #f0fdfa 0%, #fff 100%);
    border-color: rgba(20, 184, 166, 0.2);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
  }

  &__list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.75;

    li {
      margin-bottom: 2px;
    }
  }
}

.ec-conclusion-summary {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 8px;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.7;

  i {
    font-size: 18px;
    margin-top: 1px;
    flex-shrink: 0;
    color: #3b82f6;
  }
}

/* AI调解建议 */
.ec-suggestion-list {
  margin: 0;
  padding: 14px 16px 14px 32px;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 10px;
  font-size: 13px;
  color: $text-primary;
  line-height: 1.85;

  li {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.ec-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid $border-color;
  background: #fff;
  flex-shrink: 0;
}
</style>

<style lang="scss">
.evidence-comparison-dialog {
  border-radius: 10px;
  overflow: hidden;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0;
  }
}
</style>
