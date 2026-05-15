<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IEarnRule {
  action: string
  points: number
  dailyLimit: number
  enabled: boolean
}

interface ISpendRule {
  action: string
  points: string
  enabled: boolean
}

interface IProbabilityConfig {
  luckyUnlockRate: number
  directPayRate: number
  insufficientAdOption: boolean
}

const activeTab = ref('earn')

const earnRules = ref<IEarnRule[]>([])
const spendRules = ref<ISpendRule[]>([])
const probabilityConfig = reactive<IProbabilityConfig>({
  luckyUnlockRate: 30,
  directPayRate: 70,
  insufficientAdOption: true
})

const loading = ref(false)
const saving = ref(false)
const earningEditingRows = ref<Record<number, boolean>>({})
const spendEditingRows = ref<Record<number, boolean>>({})
const earnEditCache = ref<Record<number, IEarnRule>>({})
const spendEditCache = ref<Record<number, ISpendRule>>({})

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getPointsRules()
    const data = res.data as {
      earnRules: IEarnRule[]
      spendRules: ISpendRule[]
      probabilityConfig: IProbabilityConfig
    }
    earnRules.value = data.earnRules
    spendRules.value = data.spendRules
    probabilityConfig.luckyUnlockRate = data.probabilityConfig.luckyUnlockRate
    probabilityConfig.directPayRate = data.probabilityConfig.directPayRate
    probabilityConfig.insufficientAdOption = data.probabilityConfig.insufficientAdOption
  } catch {
    ElMessage.error('获取积分规则失败')
  } finally {
    loading.value = false
  }
}

function startEditEarn(index: number) {
  earnEditCache.value[index] = { ...earnRules.value[index] }
  earningEditingRows.value[index] = true
}

function cancelEditEarn(index: number) {
  if (earnEditCache.value[index]) {
    earnRules.value[index] = { ...earnEditCache.value[index] }
    delete earnEditCache.value[index]
  }
  earningEditingRows.value[index] = false
}

function startEditSpend(index: number) {
  spendEditCache.value[index] = { ...spendRules.value[index] }
  spendEditingRows.value[index] = true
}

function cancelEditSpend(index: number) {
  if (spendEditCache.value[index]) {
    spendRules.value[index] = { ...spendEditCache.value[index] }
    delete spendEditCache.value[index]
  }
  spendEditingRows.value[index] = false
}

const showEarnTable = computed(() => earnRules.value.length > 0)
const showSpendTable = computed(() => spendRules.value.length > 0)

async function handleSaveEarnRules() {
  saving.value = true
  try {
    await operationApi.updatePointsRule({ type: 'earn', rules: earnRules.value })
    ElMessage.success('获取规则已保存')
    earningEditingRows.value = {}
    earnEditCache.value = {}
  } catch {
    ElMessage.error('保存获取规则失败')
  } finally {
    saving.value = false
  }
}

async function handleSaveSpendRules() {
  saving.value = true
  try {
    await operationApi.updatePointsRule({ type: 'spend', rules: spendRules.value })
    ElMessage.success('消耗规则已保存')
    spendEditingRows.value = {}
    spendEditCache.value = {}
  } catch {
    ElMessage.error('保存消耗规则失败')
  } finally {
    saving.value = false
  }
}

function onLuckyRateChange(val: number | number[]) {
  const numVal = Array.isArray(val) ? val[0] : val
  probabilityConfig.luckyUnlockRate = numVal
  probabilityConfig.directPayRate = 100 - numVal
}

function onDirectPayRateChange(val: number | number[]) {
  const numVal = Array.isArray(val) ? val[0] : val
  probabilityConfig.directPayRate = numVal
  probabilityConfig.luckyUnlockRate = 100 - numVal
}

async function handleSaveProbability() {
  saving.value = true
  try {
    await operationApi.updatePointsRule({ type: 'probability', config: { ...probabilityConfig } })
    ElMessage.success('概率配置已保存')
  } catch {
    ElMessage.error('保存概率配置失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="points-rules-page">
    <el-breadcrumb class="points-rules-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>积分规则</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="points-rules-page__header">
      <h2 class="points-rules-page__title">积分规则</h2>
      <p class="points-rules-page__desc">管理小程序积分获取、消耗规则及概率解锁配置</p>
    </div>

    <el-tabs v-model="activeTab" class="points-rules-page__tabs">
      <el-tab-pane label="获取规则" name="earn">
        <div v-loading="loading" class="points-rules-page__tab-content">
          <el-empty v-if="!loading && !showEarnTable" description="暂无获取规则数据" />
          <div v-else class="points-rules-page__table-wrap">
            <el-table :data="earnRules" style="width: 100%">
              <el-table-column label="行为" prop="action" min-width="160" />
              <el-table-column label="默认积分" width="140" align="center">
                <template #default="{ row, $index }">
                  <template v-if="earningEditingRows[$index]">
                    <el-input-number
                      v-model="row.points"
                      :min="0"
                      :max="9999"
                      size="small"
                      controls-position="right"
                      style="width: 120px"
                    />
                  </template>
                  <template v-else>
                    <span class="points-rules-page__points-val">{{ row.points }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="每日上限" width="140" align="center">
                <template #default="{ row, $index }">
                  <template v-if="earningEditingRows[$index]">
                    <el-input-number
                      v-model="row.dailyLimit"
                      :min="0"
                      :max="9999"
                      size="small"
                      controls-position="right"
                      style="width: 120px"
                    />
                  </template>
                  <template v-else>
                    <span class="points-rules-page__points-val">{{ row.dailyLimit }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row, $index }">
                  <el-switch
                    v-model="row.enabled"
                    :disabled="!earningEditingRows[$index]"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" align="center" fixed="right">
                <template #default="{ $index }">
                  <template v-if="earningEditingRows[$index]">
                    <el-button type="primary" size="small" @click="earningEditingRows[$index] = false">
                      完成
                    </el-button>
                    <el-button size="small" @click="cancelEditEarn($index)">
                      取消
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button text type="primary" :icon="Edit" size="small" @click="startEditEarn($index)">
                      编辑
                    </el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <div class="points-rules-page__save-bar">
              <el-button type="primary" :loading="saving" @click="handleSaveEarnRules">
                保存获取规则
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="消耗规则" name="spend">
        <div v-loading="loading" class="points-rules-page__tab-content">
          <el-empty v-if="!loading && !showSpendTable" description="暂无消耗规则数据" />
          <div v-else class="points-rules-page__table-wrap">
            <el-table :data="spendRules" style="width: 100%">
              <el-table-column label="行为" prop="action" min-width="160" />
              <el-table-column label="消耗积分" width="180" align="center">
                <template #default="{ row, $index }">
                  <template v-if="spendEditingRows[$index]">
                    <el-input
                      v-model="row.points"
                      size="small"
                      placeholder="如：50-150"
                      style="width: 140px"
                    />
                  </template>
                  <template v-else>
                    <span class="points-rules-page__points-val">{{ row.points }}</span>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row, $index }">
                  <el-switch
                    v-model="row.enabled"
                    :disabled="!spendEditingRows[$index]"
                    size="small"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" align="center" fixed="right">
                <template #default="{ $index }">
                  <template v-if="spendEditingRows[$index]">
                    <el-button type="primary" size="small" @click="spendEditingRows[$index] = false">
                      完成
                    </el-button>
                    <el-button size="small" @click="cancelEditSpend($index)">
                      取消
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button text type="primary" :icon="Edit" size="small" @click="startEditSpend($index)">
                      编辑
                    </el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <div class="points-rules-page__save-bar">
              <el-button type="primary" :loading="saving" @click="handleSaveSpendRules">
                保存消耗规则
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="概率解锁" name="probability">
        <div v-loading="loading" class="points-rules-page__tab-content">
          <div class="points-rules-page__prob-section">
            <div class="points-rules-page__prob-card">
              <div class="points-rules-page__prob-header">
                <span class="points-rules-page__prob-label">幸运解锁概率</span>
                <span class="points-rules-page__prob-value">{{ probabilityConfig.luckyUnlockRate }}%</span>
              </div>
              <div class="points-rules-page__prob-row">
                <el-slider
                  v-model="probabilityConfig.luckyUnlockRate"
                  :min="0"
                  :max="100"
                  :step="1"
                  show-input
                  @update:model-value="onLuckyRateChange"
                />
              </div>
            </div>

            <div class="points-rules-page__prob-card">
              <div class="points-rules-page__prob-header">
                <span class="points-rules-page__prob-label">直接扣积分概率</span>
                <span class="points-rules-page__prob-value">{{ probabilityConfig.directPayRate }}%</span>
              </div>
              <div class="points-rules-page__prob-row">
                <el-slider
                  v-model="probabilityConfig.directPayRate"
                  :min="0"
                  :max="100"
                  :step="1"
                  show-input
                  @update:model-value="onDirectPayRateChange"
                />
              </div>
            </div>

            <div class="points-rules-page__prob-card">
              <div class="points-rules-page__prob-row points-rules-page__prob-row--switch">
                <span class="points-rules-page__prob-label">积分不足时显示广告选项</span>
                <el-switch
                  v-model="probabilityConfig.insufficientAdOption"
                  size="small"
                />
              </div>
            </div>

            <div class="points-rules-page__save-bar">
              <el-button type="primary" :loading="saving" @click="handleSaveProbability">
                保存概率配置
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.points-rules-page {
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

  &__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__desc {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      color: var(--app-text-secondary);

      &.is-active {
        color: var(--app-primary-color);
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: var(--app-primary-color);
    }
  }

  &__tab-content {
    min-height: 200px;
  }

  &__table-wrap {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;

    :deep(.el-table) {
      --el-table-border-color: var(--app-border-light);
      --el-table-header-bg-color: var(--app-bg-color);
      --el-table-row-hover-bg-color: #FDFAF5;
    }

    :deep(.el-table th.el-table__cell) {
      font-size: 13px;
      font-weight: 600;
      color: var(--app-text-regular);
    }
  }

  &__points-val {
    font-weight: 600;
    color: var(--app-primary-color);
    font-size: 15px;
  }

  &__save-bar {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--app-border-light);
  }

  &__prob-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__prob-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px;
  }

  &__prob-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__prob-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-primary);
  }

  &__prob-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--app-primary-color);
  }

  &__prob-row {
    &--switch {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    :deep(.el-slider) {
      .el-slider__runway {
        background-color: var(--app-border-light);
      }

      .el-slider__bar {
        background-color: var(--app-primary-color);
      }
    }
  }
}
</style>
