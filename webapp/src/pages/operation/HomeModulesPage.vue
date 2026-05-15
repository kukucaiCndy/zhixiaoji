<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Top, Bottom } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IHomeModule {
  id: number
  name: string
  description: string
  enabled: boolean
  sortOrder: number
}

const modules = ref<IHomeModule[]>([])
const loading = ref(false)
const saving = ref(false)

async function fetchModules() {
  loading.value = true
  try {
    const res = await operationApi.getHomeModules()
    modules.value = (res.data as IHomeModule[]).sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    ElMessage.error('获取首页模块失败')
  } finally {
    loading.value = false
  }
}

function moveUp(index: number) {
  if (index <= 0) return
  const list = [...modules.value]
  const item = list[index]
  list.splice(index, 1)
  list.splice(index - 1, 0, item)
  list.forEach((m, i) => { m.sortOrder = i + 1 })
  modules.value = list
}

function moveDown(index: number) {
  if (index >= modules.value.length - 1) return
  const list = [...modules.value]
  const item = list[index]
  list.splice(index, 1)
  list.splice(index + 1, 0, item)
  list.forEach((m, i) => { m.sortOrder = i + 1 })
  modules.value = list
}

async function handleSave() {
  saving.value = true
  try {
    await operationApi.updateHomeModules(
      modules.value.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        enabled: m.enabled,
        sortOrder: m.sortOrder
      }))
    )
    ElMessage.success('首页模块排序已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchModules()
})
</script>

<template>
  <div class="home-modules-page">
    <!-- 面包屑 -->
    <el-breadcrumb class="home-modules-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>页面装饰</el-breadcrumb-item>
      <el-breadcrumb-item>首页模块排序</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="home-modules-page__header">
      <h2 class="home-modules-page__title">首页模块排序</h2>
      <p class="home-modules-page__desc">拖拽调整小程序首页各模块的展示顺序及开关</p>
    </div>

    <!-- 模块列表 -->
    <div v-loading="loading" class="home-modules-page__list">
      <div
        v-for="(mod, index) in modules"
        :key="mod.id"
        class="home-modules-page__item"
        :class="{ 'home-modules-page__item--disabled': !mod.enabled }"
      >
        <!-- 排序手柄 -->
        <div class="home-modules-page__sort">
          <el-button
            text
            size="small"
            :disabled="index === 0"
            @click="moveUp(index)"
          >
            <el-icon><Top /></el-icon>
          </el-button>
          <el-button
            text
            size="small"
            :disabled="index === modules.length - 1"
            @click="moveDown(index)"
          >
            <el-icon><Bottom /></el-icon>
          </el-button>
        </div>

        <!-- 排序序号 -->
        <div class="home-modules-page__order">{{ mod.sortOrder }}</div>

        <!-- 模块信息 -->
        <div class="home-modules-page__info">
          <div class="home-modules-page__name">{{ mod.name }}</div>
          <div class="home-modules-page__desc">{{ mod.description }}</div>
        </div>

        <!-- 开关 -->
        <div class="home-modules-page__toggle">
          <el-switch v-model="mod.enabled" />
          <span class="home-modules-page__toggle-label">
            {{ mod.enabled ? '已启用' : '已关闭' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && modules.length === 0" description="暂无模块数据" />

    <!-- 底部保存按钮 -->
    <div class="home-modules-page__footer">
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存排序
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-modules-page {
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

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 10px;
    transition: opacity 0.2s;

    &--disabled {
      opacity: 0.55;
    }
  }

  &__sort {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
  }

  &__order {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--app-bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: var(--app-text-secondary);
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__toggle-label {
    font-size: 12px;
    color: var(--app-text-secondary);
    min-width: 36px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }
}
</style>
