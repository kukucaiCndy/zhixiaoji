<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, ArrowDown, ArrowUp, Plus, Delete } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface ILevel {
  level: number
  title: string
  icon: string
  conditions: string[]
  privileges: string[]
  userCount: number
  percentage: string
  editable: boolean
  status: string
}

interface IConditionItem {
  type: string
  value: string
}

interface ILevelForm {
  level: number
  title: string
  icon: string
  conditions: IConditionItem[]
  privileges: string
  status: string
}

const LEVEL_ICONS = ['🌱', '📝', '🧠', '⚡', '🔥', '💎', '👑']
const CONDITION_TYPES = ['累计学习卡片数', '收集文具数', '通过章节测验次数', '注册即获得', '累计积分']

const levels = ref<ILevel[]>([])
const loading = ref(false)
const saving = ref(false)
const distributionExpanded = ref(false)

// dialog
const dialogVisible = ref(false)
const editingLevel = ref<ILevel | null>(null)

const defaultForm: ILevelForm = {
  level: 0,
  title: '',
  icon: '🌱',
  conditions: [{ type: '累计学习卡片数', value: '' }],
  privileges: '',
  status: '启用'
}
const form = reactive<ILevelForm>({ ...defaultForm })

const distributionBars = ref<{ label: string; count: number; percentage: string }[]>([])

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getLevels()
    levels.value = res.data as ILevel[]
    distributionBars.value = levels.value.map((lv) => ({
      label: `Lv.${lv.level}`,
      count: lv.userCount,
      percentage: lv.percentage
    }))
  } catch {
    ElMessage.error('获取等级数据失败')
  } finally {
    loading.value = false
  }
}

function getMaxCount(): number {
  const max = Math.max(...distributionBars.value.map((d) => d.count), 1)
  return max
}

function getStatusTagType(status: string): 'success' | 'info' {
  return status === '启用' ? 'success' : 'info'
}

function openEditDialog(level: ILevel) {
  editingLevel.value = level
  form.level = level.level
  form.title = level.title
  form.icon = level.icon
  form.conditions = level.conditions.map((c) => {
    const parts = c.split(/^(.+?)(\d+.*)$/)
    const type = CONDITION_TYPES.find((t) => c.includes(t)) || '累计学习卡片数'
    const value = c.replace(type, '').trim()
    return { type, value }
  })
  form.privileges = level.privileges.join('\n')
  form.status = level.status
  dialogVisible.value = true
}

function addCondition() {
  form.conditions.push({ type: '累计学习卡片数', value: '' })
}

function removeCondition(index: number) {
  if (form.conditions.length > 1) {
    form.conditions.splice(index, 1)
  }
}

async function handleSaveLevel() {
  if (!editingLevel.value) return
  saving.value = true
  try {
    const data = {
      level: form.level,
      title: form.title,
      icon: form.icon,
      conditions: form.conditions
        .filter((c) => c.value.trim())
        .map((c) => `${c.type}${c.value}`),
      privileges: form.privileges
        .split('\n')
        .filter((p) => p.trim()),
      status: form.status
    }
    await operationApi.updateLevel(editingLevel.value.level, data as unknown as Record<string, unknown>)
    ElMessage.success('等级配置已保存')
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error('保存等级配置失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="levels-page">
    <el-breadcrumb class="levels-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>等级体系</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="levels-page__header">
      <h2 class="levels-page__title">等级体系</h2>
      <p class="levels-page__desc">管理各等级配置、升级条件与等级特权</p>
    </div>

    <!-- 等级分布 -->
    <div class="levels-page__distribution">
      <div
        class="levels-page__distribution-header"
        @click="distributionExpanded = !distributionExpanded"
      >
        <span class="levels-page__distribution-title">等级分布</span>
        <el-icon class="levels-page__distribution-arrow">
          <ArrowDown v-if="!distributionExpanded" />
          <ArrowUp v-else />
        </el-icon>
      </div>
      <div v-show="distributionExpanded" class="levels-page__distribution-body">
        <div v-if="loading" class="levels-page__distribution-loading">
          <el-skeleton :rows="5" animated />
        </div>
        <div v-else class="levels-page__chart">
          <div
            v-for="bar in distributionBars"
            :key="bar.label"
            class="levels-page__chart-row"
          >
            <span class="levels-page__chart-label">{{ bar.label }}</span>
            <div class="levels-page__chart-bar-wrap">
              <div
                class="levels-page__chart-bar"
                :style="{ width: (bar.count / getMaxCount() * 100) + '%' }"
              />
            </div>
            <span class="levels-page__chart-value">{{ bar.count.toLocaleString() }}</span>
            <span class="levels-page__chart-pct">{{ bar.percentage }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 等级卡片 Grid -->
    <div v-loading="loading" class="levels-page__grid">
      <el-empty v-if="!loading && levels.length === 0" description="暂无等级数据" />
      <div v-else class="levels-page__grid-inner">
        <div
          v-for="level in levels"
          :key="level.level"
          class="levels-page__card"
        >
          <div class="levels-page__card-head">
            <div class="levels-page__card-icon">{{ level.icon }}</div>
            <div class="levels-page__card-level-info">
              <span class="levels-page__card-level">Lv.{{ level.level }}</span>
              <span class="levels-page__card-title">{{ level.title }}</span>
            </div>
            <el-tag :type="getStatusTagType(level.status)" size="small" class="levels-page__card-status">
              {{ level.status }}
            </el-tag>
          </div>

          <div class="levels-page__card-body">
            <div class="levels-page__card-section">
              <span class="levels-page__card-section-title">升级条件</span>
              <ul class="levels-page__card-list">
                <li v-for="(cond, ci) in level.conditions" :key="ci">{{ cond }}</li>
              </ul>
            </div>

            <div class="levels-page__card-section">
              <span class="levels-page__card-section-title">等级特权</span>
              <ul class="levels-page__card-list">
                <li v-for="(priv, pi) in level.privileges" :key="pi">{{ priv }}</li>
              </ul>
            </div>
          </div>

          <div class="levels-page__card-footer">
            <div class="levels-page__card-stats">
              <span class="levels-page__card-stat">
                {{ level.userCount.toLocaleString() }} 人
              </span>
              <span class="levels-page__card-stat-divider">|</span>
              <span class="levels-page__card-stat">{{ level.percentage }}</span>
            </div>
            <el-button
              v-if="level.editable"
              :icon="Edit"
              size="small"
              @click="openEditDialog(level)"
            >
              编辑
            </el-button>
            <el-button
              v-else
              disabled
              size="small"
            >
              Lv.1 不可编辑
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑等级配置"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <el-form-item label="等级序号">
          <el-input :model-value="form.level" disabled />
        </el-form-item>
        <el-form-item label="等级称号">
          <el-input v-model="form.title" placeholder="请输入等级称号" />
        </el-form-item>
        <el-form-item label="等级图标">
          <div class="levels-page__icon-selector">
            <span
              v-for="icon in LEVEL_ICONS"
              :key="icon"
              class="levels-page__icon-option"
              :class="{ 'levels-page__icon-option--active': form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="升级条件">
          <div class="levels-page__conditions">
            <div
              v-for="(cond, idx) in form.conditions"
              :key="idx"
              class="levels-page__condition-row"
            >
              <el-select v-model="cond.type" style="width: 180px" size="small">
                <el-option
                  v-for="ct in CONDITION_TYPES"
                  :key="ct"
                  :label="ct"
                  :value="ct"
                />
              </el-select>
              <el-input
                v-if="cond.type !== '注册即获得'"
                v-model="cond.value"
                placeholder="输入条件值"
                size="small"
                style="width: 140px"
              />
              <el-button
                text
                type="danger"
                :icon="Delete"
                size="small"
                :disabled="form.conditions.length <= 1"
                @click="removeCondition(idx)"
              />
            </div>
            <el-button type="primary" link :icon="Plus" size="small" @click="addCondition">
              添加条件
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="解锁特权">
          <el-input
            v-model="form.privileges"
            type="textarea"
            :rows="4"
            placeholder="每行一个特权描述"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-value="启用"
            inactive-value="停用"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveLevel">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.levels-page {
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

  &__distribution {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__distribution-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: #FDFAF5;
    }
  }

  &__distribution-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__distribution-arrow {
    color: var(--app-text-secondary);
    font-size: 14px;
  }

  &__distribution-body {
    padding: 0 20px 20px;
  }

  &__distribution-loading {
    padding: 20px 0;
  }

  &__chart {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__chart-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__chart-label {
    width: 50px;
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text-regular);
    text-align: right;
  }

  &__chart-bar-wrap {
    flex: 1;
    height: 24px;
    background: var(--app-border-light);
    border-radius: 4px;
    overflow: hidden;
  }

  &__chart-bar {
    height: 100%;
    background: var(--app-primary-color);
    border-radius: 4px;
    transition: width 0.5s ease;
    min-width: 4px;
  }

  &__chart-value {
    width: 70px;
    font-size: 13px;
    color: var(--app-text-regular);
    text-align: right;
  }

  &__chart-pct {
    width: 50px;
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__grid {
    min-height: 200px;
  }

  &__grid-inner {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
    align-items: center;
    gap: 12px;
  }

  &__card-icon {
    font-size: 32px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-primary-light);
    border-radius: 10px;
  }

  &__card-level-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__card-level {
    font-size: 13px;
    color: var(--app-primary-color);
    font-weight: 600;
  }

  &__card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__card-status {
    flex-shrink: 0;
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__card-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__card-section-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__card-list {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    color: var(--app-text-regular);
    line-height: 1.8;
  }

  &__card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--app-border-light);
  }

  &__card-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__card-stat-divider {
    color: var(--app-border-color);
  }

  &__icon-selector {
    display: flex;
    gap: 8px;
  }

  &__icon-option {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--app-border-color);
    border-radius: 8px;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--app-bg-card);

    &:hover {
      border-color: var(--app-primary-color);
      background: var(--app-primary-light);
    }

    &--active {
      border-color: var(--app-primary-color);
      background: var(--app-primary-light);
    }
  }

  &__conditions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  &__condition-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
