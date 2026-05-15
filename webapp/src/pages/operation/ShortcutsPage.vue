<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IShortcut {
  id?: number
  icon: string
  name: string
  targetType: string
  targetId: string
  sortOrder: number
}

const shortcuts = ref<IShortcut[]>([])
const loading = ref(false)
const saving = ref(false)

const MAX_SHORTCUTS = 8

const iconOptions = [
  { label: '书本', value: 'Reading' },
  { label: '编辑', value: 'EditPen' },
  { label: '星标', value: 'Star' },
  { label: '奖杯', value: 'Trophy' },
  { label: '礼物', value: 'Present' },
  { label: '设置', value: 'Setting' },
  { label: '搜索', value: 'Search' },
  { label: '消息', value: 'Message' },
  { label: '用户', value: 'User' },
  { label: '闹钟', value: 'AlarmClock' },
  { label: '购物车', value: 'ShoppingCart' },
  { label: '指南针', value: 'Compass' }
]

const targetTypeOptions = [
  { label: '知识卡片', value: 'knowledge' },
  { label: '章节', value: 'chapter' },
  { label: '每日挑战', value: 'daily-challenge' },
  { label: '成就', value: 'achievements' },
  { label: '文具', value: 'stationery' },
  { label: '排行榜', value: 'leaderboard' }
]

const knowledgeCards = ref([
  { label: 'Python入门基础', value: 'python-basic' },
  { label: 'JavaScript核心概念', value: 'js-core' },
  { label: '数据结构与算法', value: 'dsa' }
])

const chapters = ref([
  { label: '第1章 编程起步', value: 'ch1' },
  { label: '第2章 变量与类型', value: 'ch2' },
  { label: '第3章 条件判断', value: 'ch3' }
])

function getTargetOptions(targetType: string): { label: string; value: string }[] {
  switch (targetType) {
    case 'knowledge': return knowledgeCards.value
    case 'chapter': return chapters.value
    default: return []
  }
}

async function fetchShortcuts() {
  loading.value = true
  try {
    const res = await operationApi.getShortcuts()
    shortcuts.value = (res.data as IShortcut[]).sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    ElMessage.error('获取快捷入口失败')
  } finally {
    loading.value = false
  }
}

function addShortcut() {
  if (shortcuts.value.length >= MAX_SHORTCUTS) {
    ElMessage.warning(`最多配置${MAX_SHORTCUTS}个快捷入口`)
    return
  }
  shortcuts.value.push({
    icon: 'Star',
    name: '',
    targetType: 'knowledge',
    targetId: '',
    sortOrder: shortcuts.value.length + 1
  })
}

async function removeShortcut(index: number) {
  const item = shortcuts.value[index]
  if (item.id) {
    try {
      await ElMessageBox.confirm('确定要删除该快捷入口吗？', '删除确认', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      await operationApi.deleteShortcut(item.id)
    } catch {
      return
    }
  }
  shortcuts.value.splice(index, 1)
  shortcuts.value.forEach((s, i) => { s.sortOrder = i + 1 })
}

async function handleSave() {
  saving.value = true
  try {
    for (const item of shortcuts.value) {
      if (item.id) {
        await operationApi.updateShortcut(item.id, {
          icon: item.icon,
          name: item.name,
          targetType: item.targetType,
          targetId: item.targetId,
          sortOrder: item.sortOrder
        })
      } else {
        const res = await operationApi.createShortcut({
          icon: item.icon,
          name: item.name,
          targetType: item.targetType,
          targetId: item.targetId,
          sortOrder: item.sortOrder
        })
        item.id = (res.data as { id: number }).id
      }
    }
    ElMessage.success('快捷入口已保存')
    await fetchShortcuts()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchShortcuts()
})
</script>

<template>
  <div class="shortcuts-page">
    <!-- 面包屑 -->
    <el-breadcrumb class="shortcuts-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>页面装饰</el-breadcrumb-item>
      <el-breadcrumb-item>快捷入口配置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="shortcuts-page__header">
      <h2 class="shortcuts-page__title">快捷入口配置</h2>
      <p class="shortcuts-page__desc">
        配置小程序首页快捷入口，最多{{ MAX_SHORTCUTS }}个（当前{{ shortcuts.length }}/{{ MAX_SHORTCUTS }}）
      </p>
    </div>

    <!-- 添加快捷入口按钮 -->
    <div v-if="shortcuts.length < MAX_SHORTCUTS" class="shortcuts-page__toolbar">
      <el-button type="primary" :icon="Plus" @click="addShortcut">
        添加快捷入口
      </el-button>
    </div>

    <!-- 快捷入口卡片网格 -->
    <div v-loading="loading" class="shortcuts-page__grid">
      <div
        v-for="(item, index) in shortcuts"
        :key="index"
        class="shortcuts-page__card"
      >
        <div class="shortcuts-page__card-header">
          <span class="shortcuts-page__card-num">{{ index + 1 }}</span>
          <el-button
            text
            type="danger"
            :icon="Delete"
            size="small"
            @click="removeShortcut(index)"
          />
        </div>

        <div class="shortcuts-page__card-body">
          <!-- 图标选择 -->
          <div class="shortcuts-page__field">
            <label class="shortcuts-page__label">图标</label>
            <el-select v-model="item.icon" placeholder="选择图标">
              <el-option
                v-for="opt in iconOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>

          <!-- 名称 -->
          <div class="shortcuts-page__field">
            <label class="shortcuts-page__label">名称</label>
            <el-input
              v-model="item.name"
              placeholder="请输入入口名称"
              maxlength="6"
              show-word-limit
            />
          </div>

          <!-- 跳转类型 -->
          <div class="shortcuts-page__field">
            <label class="shortcuts-page__label">跳转目标</label>
            <el-select
              v-model="item.targetType"
              placeholder="选择跳转类型"
              @change="item.targetId = ''"
            >
              <el-option
                v-for="opt in targetTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>

          <!-- 跳转具体目标（知识卡片/章节有下级选择） -->
          <div
            v-if="getTargetOptions(item.targetType).length > 0"
            class="shortcuts-page__field"
          >
            <label class="shortcuts-page__label">具体目标</label>
            <el-select v-model="item.targetId" placeholder="请选择具体目标">
              <el-option
                v-for="opt in getTargetOptions(item.targetType)"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && shortcuts.length === 0"
      description="暂无快捷入口，点击上方按钮添加"
    />

    <!-- 底部保存按钮 -->
    <div v-if="shortcuts.length > 0" class="shortcuts-page__footer">
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.shortcuts-page {
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

  &__toolbar {
    display: flex;
    align-items: center;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--app-bg-color);
    border-bottom: 1px solid var(--app-border-light);
  }

  &__card-num {
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text-secondary);
  }

  &__card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    :deep(.el-select) {
      width: 100%;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }
}
</style>
