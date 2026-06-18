<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import type { ColorScheme, ColorRef } from '@/mock/knowledge'

const loading = ref(false)
const saving = ref(false)
const schemes = ref<ColorScheme[]>([])
const activeScheme = ref<ColorScheme | null>(null)
const showCreateDialog = ref(false)
const newSchemeName = ref('')

// Pick editable color fields from the scheme
const editableColorFields = computed(() => {
  const s = activeScheme.value
  if (!s) return []
  const fields: { group: string; key: string; color: ColorRef }[] = []
  for (const [key, color] of Object.entries(s.colors)) {
    fields.push({ group: 'colors', key, color })
  }
  for (const [key, color] of Object.entries(s.neutrals)) {
    fields.push({ group: 'neutrals', key, color })
  }
  return fields
})

async function fetchSchemes() {
  loading.value = true
  try {
    const res = await knowledgeApi.listColorSchemes()
    if (res.code === 0 && res.data) {
      schemes.value = res.data as ColorScheme[]
      const defaultRes = await knowledgeApi.getDefaultColorScheme()
      if (defaultRes.code === 0 && defaultRes.data) {
        activeScheme.value = defaultRes.data as ColorScheme
        applyColors(activeScheme.value)
        return
      }
      if (schemes.value.length > 0) {
        activeScheme.value = schemes.value[0]
        applyColors(schemes.value[0])
      }
    }
  } catch {
    ElMessage.error('获取配色方案失败')
  } finally {
    loading.value = false
  }
}

function applyColors(scheme: ColorScheme) {
  const root = document.documentElement
  for (const [key, ref] of Object.entries(scheme.colors)) {
    root.style.setProperty(`--preview-${key}`, ref.hex)
  }
  for (const [key, ref] of Object.entries(scheme.neutrals)) {
    root.style.setProperty(`--preview-${key}`, ref.hex)
  }
  for (const [, val] of Object.entries(scheme.gradients)) {
    if (val && typeof val === 'object' && 'css' in val) {
      root.style.setProperty(`--preview-${val.name}`, val.css)
    }
  }
}

function selectScheme(scheme: ColorScheme) {
  activeScheme.value = scheme
  applyColors(scheme)
}

function updateColor(group: string, key: string, hex: string | null) {
  if (!activeScheme.value || !hex) return
  if (group === 'colors') {
    activeScheme.value.colors[key] = { ...activeScheme.value.colors[key], hex }
  } else {
    activeScheme.value.neutrals[key] = { ...activeScheme.value.neutrals[key], hex }
  }
  applyColors(activeScheme.value)
}

async function handleSave() {
  if (!activeScheme.value) return
  saving.value = true
  try {
    const res = await knowledgeApi.updateColorScheme(activeScheme.value.id, {
        colors: activeScheme.value.colors,
        neutrals: activeScheme.value.neutrals,
        gradients: activeScheme.value.gradients,
        shadows: activeScheme.value.shadows,
        workflowInput: activeScheme.value.workflowInput,
      })
    if (res.code === 0) {
      ElMessage.success('主题色配置已保存')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

async function handleCreateScheme() {
  if (!newSchemeName.value.trim()) {
    ElMessage.warning('请输入方案名称')
    return
  }
  try {
    const defaultScheme = activeScheme.value || schemes.value[0]
    if (!defaultScheme) {
      ElMessage.warning('暂无参考方案')
      return
    }
    const res = await knowledgeApi.createColorScheme({
      schema: newSchemeName.value.trim(),
      theme: 'light',
      description: '',
      colors: defaultScheme.colors,
      neutrals: defaultScheme.neutrals,
      gradients: defaultScheme.gradients,
      shadows: defaultScheme.shadows,
      isDefault: false,
    })
    if (res.code === 0) {
      ElMessage.success('配色方案已创建')
      showCreateDialog.value = false
      newSchemeName.value = ''
      await fetchSchemes()
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch {
    ElMessage.error('创建失败')
  }
}

async function handleDeleteScheme(scheme: ColorScheme) {
  if (scheme.isDefault) {
    ElMessage.warning('默认方案不能删除')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除配色方案「${scheme.schema}」吗？`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await knowledgeApi.deleteColorScheme(scheme.id)
    if (res.code === 0) {
      ElMessage.success('已删除')
      await fetchSchemes()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // cancelled
  }
}

function textColorFor(bgColor: string): string {
  if (!bgColor || bgColor.length < 7) return '#333'
  const r = parseInt(bgColor.slice(1, 3), 16)
  const g = parseInt(bgColor.slice(3, 5), 16)
  const b = parseInt(bgColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#333' : '#fff'
}

onMounted(() => {
  fetchSchemes()
})
</script>

<template>
  <div class="theme-config-page" v-loading="loading">
    <el-breadcrumb class="theme-config-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>主题色配置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="theme-config-page__header">
      <h2 class="theme-config-page__title">主题色配置</h2>
      <div class="theme-config-page__header-actions">
        <el-button :icon="Plus" @click="showCreateDialog = true">新建方案</el-button>
      </div>
    </div>

    <!-- Scheme Tabs -->
    <div v-if="schemes.length > 0" class="theme-config-page__tabs">
      <div
        v-for="scheme in schemes"
        :key="scheme.id"
        class="theme-config-page__tab"
        :class="{ 'theme-config-page__tab--active': activeScheme?.id === scheme.id }"
        @click="selectScheme(scheme)"
      >
        <span class="theme-config-page__tab-name">{{ scheme.schema }}</span>
        <el-tag v-if="scheme.isDefault" size="small" type="success">默认</el-tag>
        <el-button
          v-if="!scheme.isDefault && activeScheme?.id === scheme.id"
          text
          type="danger"
          size="small"
          @click.stop="handleDeleteScheme(scheme)"
        >
          删除
        </el-button>
      </div>
    </div>

    <div v-if="activeScheme" class="theme-config-page__content">
      <!-- Left: Color Settings -->
      <div class="theme-config-page__panel">
        <div class="theme-config-page__panel-title">颜色设置</div>
        <div class="theme-config-page__color-group" v-for="group in ['colors', 'neutrals']" :key="group">
          <div class="theme-config-page__group-label">{{ group === 'colors' ? '主题色' : '中性色' }}</div>
          <div
            v-for="field in editableColorFields.filter(f => f.group === group)"
            :key="field.key"
            class="theme-config-page__color-row"
          >
            <div class="theme-config-page__color-info">
              <span class="theme-config-page__color-label">{{ field.color.name }}</span>
              <span class="theme-config-page__color-desc">{{ field.color.usage }}</span>
            </div>
            <div class="theme-config-page__color-picker">
              <el-color-picker
                :model-value="field.color.hex"
                show-alpha
                @update:model-value="updateColor(field.group, field.key, $event)"
                :predefine="['#D4916E', '#4A90D9', '#7BA87F', '#C4726F', '#8B7BA8', '#FAF7F2', '#1A1A1A', '#FFFFFF']"
              />
              <span class="theme-config-page__color-value">{{ field.color.hex }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="theme-config-page__panel theme-config-page__panel--preview">
        <div class="theme-config-page__panel-title">预览效果</div>
        <div class="theme-config-page__preview-wrap">
          <div class="theme-config-page__phone">
            <div
              class="theme-config-page__phone-status"
              :style="{ backgroundColor: activeScheme.neutrals.background?.hex || '#F8FAFC' }"
            >
              <span
                class="theme-config-page__phone-time"
                :style="{ color: activeScheme.neutrals.textPrimary?.hex || '#1A1A1A' }"
              >9:41</span>
            </div>
            <div
              class="theme-config-page__phone-navbar"
              :style="{
                backgroundColor: activeScheme.neutrals.background?.hex || '#F8FAFC',
                color: activeScheme.neutrals.textPrimary?.hex || '#1A1A1A'
              }"
            >
              <span class="theme-config-page__phone-nav-title">知晓记</span>
            </div>
            <div class="theme-config-page__phone-body" :style="{ backgroundColor: activeScheme.neutrals.card?.hex || '#FFFFFF' }">
              <div
                class="theme-config-page__phone-banner"
                :style="{ backgroundColor: (activeScheme.colors.secondary?.hex || '#F97316') + '20' }"
              >
                <span :style="{ color: activeScheme.colors.secondary?.hex || '#F97316' }">Banner 区域</span>
              </div>
              <div class="theme-config-page__phone-shortcuts">
                <div
                  v-for="n in 4" :key="n"
                  class="theme-config-page__phone-shortcut"
                  :style="{
                    backgroundColor: (activeScheme.colors.primary?.hex || '#D4916E') + '15',
                    color: activeScheme.colors.primary?.hex || '#D4916E'
                  }"
                >
                  入口{{ n }}
                </div>
              </div>
              <div class="theme-config-page__phone-buttons">
                <div
                  class="theme-config-page__phone-btn theme-config-page__phone-btn--primary"
                  :style="{
                    backgroundColor: activeScheme.colors.primary?.hex || '#D4916E',
                    color: textColorFor(activeScheme.colors.primary?.hex || '#D4916E')
                  }"
                >
                  开始学习
                </div>
                <div
                  class="theme-config-page__phone-btn theme-config-page__phone-btn--outline"
                  :style="{
                    borderColor: activeScheme.colors.primary?.hex || '#D4916E',
                    color: activeScheme.colors.primary?.hex || '#D4916E'
                  }"
                >
                  查看详情
                </div>
              </div>
              <div
                class="theme-config-page__phone-link"
                :style="{ color: activeScheme.colors.accent?.hex || '#4A90D9' }"
              >
                查看更多内容 &rarr;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="activeScheme" class="theme-config-page__footer">
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存方案
      </el-button>
    </div>

    <!-- Create Scheme Dialog -->
    <el-dialog v-model="showCreateDialog" title="新建配色方案" width="400px">
      <el-form>
        <el-form-item label="方案名称">
          <el-input v-model="newSchemeName" placeholder="请输入方案名称" maxlength="20" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateScheme">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.theme-config-page {
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

  &__header-actions {
    display: flex;
    gap: 8px;
  }

  &__tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--app-border-color);
    background: var(--app-bg-card);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 14px;

    &:hover {
      border-color: var(--app-primary-color);
    }

    &--active {
      border-color: var(--app-primary-color);
      background: var(--app-primary-color) + '08';
    }
  }

  &__tab-name {
    font-weight: 500;
    color: var(--app-text-primary);
  }

  &__color-group {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__group-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  &__panel {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px;

    &--preview {
      position: sticky;
      top: 20px;
    }
  }

  &__panel-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--app-border-light);
  }

  &__color-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--app-border-light);
    }
  }

  &__color-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__color-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  &__color-desc {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__color-picker {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__color-value {
    font-size: 13px;
    color: var(--app-text-secondary);
    font-family: monospace;
  }

  // --- Preview ---
  &__preview-wrap {
    display: flex;
    justify-content: center;
  }

  &__phone {
    width: 220px;
    border: 2px solid #E0D6C8;
    border-radius: 20px;
    overflow: hidden;
    background: #F5F0EB;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  &__phone-status {
    display: flex;
    justify-content: center;
    padding: 6px 0 4px;
    font-size: 11px;
    font-weight: 600;
  }

  &__phone-time {
    font-size: 11px;
  }

  &__phone-navbar {
    display: flex;
    justify-content: center;
    padding: 8px 0 6px;
    font-size: 13px;
    font-weight: 600;
  }

  &__phone-nav-title {
    font-size: 13px;
  }

  &__phone-body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__phone-banner {
    height: 80px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }

  &__phone-shortcuts {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  &__phone-shortcut {
    aspect-ratio: 1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }

  &__phone-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__phone-btn {
    text-align: center;
    padding: 8px 0;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;

    &--outline {
      border: 1.5px solid;
      background: transparent;
    }
  }

  &__phone-link {
    text-align: center;
    font-size: 11px;
    padding: 2px 0;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 8px;
  }
}
</style>
