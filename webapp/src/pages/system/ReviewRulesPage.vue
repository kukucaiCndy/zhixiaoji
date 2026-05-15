<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

interface IReviewNode {
  reviewTimes: number
  defaultInterval: number
  range: string
  current: number | null
}

interface IReviewParam {
  name: string
  label: string
  default: number
  range: string
  current: number | null
}

interface IPreviewReview {
  times: number
  date: string
}

interface IPreviewData {
  learnDate: string
  reviews: IPreviewReview[]
}

const pageLoading = ref(true)
const saving = ref(false)

// Review nodes
const reviewNodes = ref<IReviewNode[]>([])

// Review params
const reviewParams = ref<IReviewParam[]>([])

// Preview dialog
const previewVisible = ref(false)
const previewLoading = ref(false)
const previewData = ref<IPreviewData | null>(null)

// Parameter name mappings
const paramLabels: Record<string, string> = {
  masteryExtendFactor: '掌握良好延长系数',
  poorShortenFactor: '掌握较差缩短系数',
  fastCorrectTime: '快速正确判定时间',
  maxInterval: '最大复习间隔'
}

async function fetchRules() {
  pageLoading.value = true
  try {
    const res = await systemApi.getReviewRules()
    if (res.code === 0) {
      const data = res.data as {
        nodes: { reviewTimes: number; defaultInterval: number; range: string; current: number }[]
        params: Record<string, { default: number; range: string; current: number }>
      }

      // Map nodes
      reviewNodes.value = data.nodes.map((node) => ({
        reviewTimes: node.reviewTimes,
        defaultInterval: node.defaultInterval,
        range: node.range,
        current: node.current
      }))

      // Map params
      reviewParams.value = Object.entries(data.params).map(([key, val]) => ({
        name: key,
        label: paramLabels[key] || key,
        default: val.default,
        range: val.range,
        current: val.current
      }))
    } else {
      ElMessage.error(res.message || '获取复习规则失败')
    }
  } catch {
    ElMessage.error('获取复习规则失败，请稍后重试')
  } finally {
    pageLoading.value = false
  }
}

function validateNodes(): boolean {
  for (let i = 1; i < reviewNodes.value.length; i++) {
    const prev = reviewNodes.value[i - 1].current
    const curr = reviewNodes.value[i].current
    if (prev !== null && curr !== null && curr < prev) {
      ElMessage.warning(`第${i + 1}次复习的间隔不能小于第${i}次复习的间隔`)
      return false
    }
  }
  return true
}

function validateParams(): boolean {
  for (const param of reviewParams.value) {
    if (param.current === null) {
      ElMessage.warning(`请填写${param.label}的当前值`)
      return false
    }
    const [minStr, maxStr] = param.range.split('-')
    const min = parseFloat(minStr)
    const max = parseFloat(maxStr)
    if (param.current < min || param.current > max) {
      ElMessage.warning(`${param.label}的值必须在 ${param.range} 范围内`)
      return false
    }
  }
  return true
}

async function handleSave() {
  if (!validateNodes() || !validateParams()) return

  saving.value = true
  try {
    // Save nodes
    const nodesData = reviewNodes.value.map((node) => ({
      reviewTimes: node.reviewTimes,
      interval: node.current as number
    }))
    const nodesRes = await systemApi.updateReviewNodes({ nodes: nodesData })
    if (nodesRes.code !== 0) {
      ElMessage.error(nodesRes.message || '保存复习节点失败')
      return
    }

    // Save params
    const paramsData: Record<string, number> = {}
    reviewParams.value.forEach((param) => {
      paramsData[param.name] = param.current as number
    })
    const paramsRes = await systemApi.updateReviewParams(paramsData)
    if (paramsRes.code !== 0) {
      ElMessage.error(paramsRes.message || '保存复习参数失败')
      return
    }

    ElMessage.success('复习规则已保存')
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  try {
    await ElMessageBox.confirm(
      '重置后所有当前值将恢复为系统默认值，此操作不可撤销。确定要继续吗？',
      '确认重置',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await systemApi.resetReviewRules()
    if (res.code === 0) {
      ElMessage.success('已重置为系统默认配置')
      await fetchRules()
    } else {
      ElMessage.error(res.message || '重置失败')
    }
  } catch {
    // user cancelled
  }
}

async function handlePreview() {
  previewVisible.value = true
  previewLoading.value = true
  try {
    const res = await systemApi.previewReview()
    if (res.code === 0) {
      previewData.value = (res.data as { example: IPreviewData }).example
    } else {
      ElMessage.error(res.message || '获取预览数据失败')
    }
  } catch {
    ElMessage.error('获取预览数据失败，请稍后重试')
  } finally {
    previewLoading.value = false
  }
}

function handlePreviewClose() {
  previewVisible.value = false
  previewData.value = null
}

onMounted(() => {
  fetchRules()
})
</script>

<template>
  <div class="review-rules-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="review-rules-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>复习规则配置</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <h2 class="review-rules-page__title">复习规则配置</h2>

    <!-- Loading -->
    <div v-if="pageLoading" class="review-rules-page__card">
      <div class="review-rules-page__loading">
        <el-icon class="is-loading" :size="24" color="var(--app-text-secondary)">
          <svg viewBox="0 0 1024 1024"><path d="M512 64a448 448 0 1 0 448 448h-64a384 384 0 1 1-384-384V64z" fill="currentColor"/></svg>
        </el-icon>
      </div>
    </div>

    <template v-else>
      <!-- Warning Banner -->
      <div class="review-rules-page__warning-banner">
        <el-icon :size="18">
          <WarningFilled />
        </el-icon>
        <span>此处配置仅影响系统默认规则和新注册用户的初始配置。已有用户的个性化参数不会受到影响，如需调整请在用户管理中进行操作。</span>
      </div>

      <!-- Action Bar -->
      <div class="review-rules-page__action-bar">
        <el-button @click="handleReset">重置为系统默认</el-button>
        <div class="review-rules-page__action-right">
          <el-button @click="handlePreview">预览规则</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        </div>
      </div>

      <!-- Section 1: Review Nodes -->
      <div class="review-rules-page__card">
        <h3 class="review-rules-page__section-title">默认复习节点配置</h3>
        <el-table
          :data="reviewNodes"
          row-key="reviewTimes"
          class="review-rules-page__table"
        >
          <el-table-column label="第N次复习" width="120" align="center">
            <template #default="{ row }: { row: IReviewNode }">
              第 {{ row.reviewTimes }} 次
            </template>
          </el-table-column>
          <el-table-column prop="defaultInterval" label="默认间隔(天)" width="140" align="center" />
          <el-table-column prop="range" label="可配置范围" width="140" align="center">
            <template #default="{ row }: { row: IReviewNode }">
              {{ row.range }} 天
            </template>
          </el-table-column>
          <el-table-column label="当前值(天)" min-width="160" align="center">
            <template #default="{ row }: { row: IReviewNode }">
              <el-input-number
                v-model="row.current"
                :min="1"
                :max="30"
                :step="1"
                size="small"
                controls-position="right"
                class="review-rules-page__number-input"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Section 2: Review Params -->
      <div class="review-rules-page__card">
        <h3 class="review-rules-page__section-title">默认个性化参数</h3>
        <el-table
          :data="reviewParams"
          row-key="name"
          class="review-rules-page__table"
        >
          <el-table-column label="参数名" min-width="180">
            <template #default="{ row }: { row: IReviewParam }">
              {{ row.label }}
            </template>
          </el-table-column>
          <el-table-column label="默认值" width="100" align="center">
            <template #default="{ row }: { row: IReviewParam }">
              {{ row.default }}
            </template>
          </el-table-column>
          <el-table-column label="可配置范围" width="130" align="center">
            <template #default="{ row }: { row: IReviewParam }">
              {{ row.range }}
            </template>
          </el-table-column>
          <el-table-column label="当前值" width="160" align="center">
            <template #default="{ row }: { row: IReviewParam }">
              <el-input-number
                v-model="row.current"
                :min="parseFloat(row.range.split('-')[0])"
                :max="parseFloat(row.range.split('-')[1])"
                :step="row.name.includes('Factor') ? 0.1 : 1"
                :precision="row.name.includes('Factor') ? 1 : 0"
                size="small"
                controls-position="right"
                class="review-rules-page__number-input"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Bottom Action Bar -->
      <div class="review-rules-page__bottom-bar">
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button @click="handlePreview">预览规则</el-button>
      </div>
    </template>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="复习计划预览"
      width="520px"
      :close-on-click-modal="false"
      @close="handlePreviewClose"
    >
      <div v-loading="previewLoading" class="review-rules-page__preview">
        <template v-if="previewData">
          <div class="review-rules-page__preview-intro">
            以 <strong>{{ previewData.learnDate }}</strong> 开始学习为例，复习计划如下：
          </div>
          <div class="review-rules-page__preview-list">
            <div
              v-for="item in previewData.reviews"
              :key="item.times"
              class="review-rules-page__preview-item"
            >
              <div class="review-rules-page__preview-badge">
                第{{ item.times }}次
              </div>
              <div class="review-rules-page__preview-date">
                {{ item.date }}
              </div>
            </div>
          </div>
        </template>
        <div v-else-if="!previewLoading" class="review-rules-page__preview-empty">
          暂无预览数据
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.review-rules-page {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__breadcrumb {
    :deep(.el-breadcrumb__inner) {
      color: var(--app-text-secondary);
      font-size: 13px;

      &.is-link {
        color: var(--app-text-secondary);

        &:hover {
          color: var(--app-primary-color);
        }
      }
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: var(--app-text-primary);
      font-weight: 500;
    }
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  // Warning Banner
  &__warning-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 20px;
    background: #FDF5E8;
    border: 1px solid #F0D5A8;
    border-radius: 10px;
    color: #B87A2B;
    font-size: 13px;
    line-height: 1.6;

    .el-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }
  }

  // Action Bar
  &__action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__action-right {
    display: flex;
    gap: 10px;
  }

  // Section Title
  &__section-title {
    font-family: var(--app-font-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--app-border-light);
  }

  // Table
  &__table {
    :deep(.el-table__header-wrapper) {
      .el-table__cell {
        background-color: #FDFBF7;
        color: var(--app-text-secondary);
        font-weight: 500;
        font-size: 13px;
        border-bottom: 1px solid var(--app-border-color);
        padding: 10px 0;

        &::before {
          display: none;
        }
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__cell {
        border-bottom: 1px solid var(--app-border-light);
        padding: 12px 0;
      }
    }

    :deep(.el-table__empty-text) {
      color: var(--app-text-secondary);
    }
  }

  &__number-input {
    width: 120px;
  }

  // Bottom Bar
  &__bottom-bar {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding-top: 4px;
  }

  // Preview Dialog
  &__preview {
    min-height: 120px;
  }

  &__preview-intro {
    font-size: 14px;
    color: var(--app-text-regular);
    margin-bottom: 20px;
    line-height: 1.6;
  }

  &__preview-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__preview-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: var(--app-bg-color);
    border-radius: 8px;
  }

  &__preview-badge {
    width: 64px;
    padding: 4px 0;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--app-primary-color);
    border-radius: 6px;
    text-align: center;
    flex-shrink: 0;
  }

  &__preview-date {
    font-family: var(--app-font-heading);
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-primary);
  }

  &__preview-empty {
    text-align: center;
    padding: 40px 0;
    font-size: 14px;
    color: var(--app-text-secondary);
  }
}
</style>
