<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface ILeaderboard {
  id: number
  name: string
  criteria: string
  enabled: boolean
  updateFrequency: string
  displayCount: number
  period: string | null
}

const FREQUENCY_OPTIONS = ['实时更新', '每小时更新', '每天更新', '每周一重置']
const PERIOD_OPTIONS = ['本周', '本月', '本季度', '全部']

const leaderboards = ref<ILeaderboard[]>([])
const loading = ref(false)
const saving = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getLeaderboards()
    leaderboards.value = res.data as ILeaderboard[]
  } catch {
    ElMessage.error('获取排行榜数据失败')
  } finally {
    loading.value = false
  }
}

function isStudyBoard(board: ILeaderboard): boolean {
  return board.name === '学习达人榜'
}

function onPeriodChange(board: ILeaderboard, val: string) {
  board.period = val
}

async function handleSaveAll() {
  saving.value = true
  try {
    await operationApi.saveAllLeaderboards(
      leaderboards.value as unknown as Record<string, unknown>[]
    )
    ElMessage.success('排行榜配置已全部保存')
  } catch {
    ElMessage.error('保存排行榜配置失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="leaderboard-page">
    <el-breadcrumb class="leaderboard-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>排行榜</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="leaderboard-page__header">
      <h2 class="leaderboard-page__title">排行榜</h2>
      <p class="leaderboard-page__desc">管理各榜单的启用状态、更新频率和展示配置</p>
    </div>

    <div v-loading="loading" class="leaderboard-page__cards">
      <el-empty v-if="!loading && leaderboards.length === 0" description="暂无排行榜数据" />
      <div v-else class="leaderboard-page__cards-inner">
        <div
          v-for="board in leaderboards"
          :key="board.id"
          class="leaderboard-page__card"
        >
          <div class="leaderboard-page__card-head">
            <div class="leaderboard-page__card-info">
              <h4 class="leaderboard-page__card-name">{{ board.name }}</h4>
              <p class="leaderboard-page__card-criteria">{{ board.criteria }}</p>
            </div>
            <el-switch v-model="board.enabled" size="small" />
          </div>

          <div class="leaderboard-page__card-body">
            <div class="leaderboard-page__card-field">
              <label class="leaderboard-page__card-label">更新频率</label>
              <el-select
                v-model="board.updateFrequency"
                size="small"
                style="width: 100%"
              >
                <el-option
                  v-for="freq in FREQUENCY_OPTIONS"
                  :key="freq"
                  :label="freq"
                  :value="freq"
                />
              </el-select>
            </div>

            <div class="leaderboard-page__card-field">
              <label class="leaderboard-page__card-label">展示人数</label>
              <el-input-number
                v-model="board.displayCount"
                :min="10"
                :max="200"
                size="small"
                :step="10"
                style="width: 100%"
              />
            </div>

            <div v-if="isStudyBoard(board)" class="leaderboard-page__card-field">
              <label class="leaderboard-page__card-label">统计周期</label>
              <el-select
                :model-value="board.period"
                size="small"
                style="width: 100%"
                @update:model-value="(val: string) => onPeriodChange(board, val)"
              >
                <el-option
                  v-for="p in PERIOD_OPTIONS"
                  :key="p"
                  :label="p"
                  :value="p"
                />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="leaderboards.length > 0" class="leaderboard-page__save-bar">
      <el-button type="primary" :loading="saving" @click="handleSaveAll">
        保存全部
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.leaderboard-page {
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

  &__cards {
    min-height: 200px;
  }

  &__cards-inner {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }

  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }
  }

  &__card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__card-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__card-criteria {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__card-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__card-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text-secondary);
  }

  &__save-bar {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
