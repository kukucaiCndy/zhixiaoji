<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface IThemeConfig {
  primaryColor: string
  accentColor: string
  navbarBgColor: string
  navbarTextColor: string
}

const loading = ref(false)
const saving = ref(false)

const defaultTheme: IThemeConfig = {
  primaryColor: '#D4916E',
  accentColor: '#4A90D9',
  navbarBgColor: '#FAF7F2',
  navbarTextColor: '#1A1A1A'
}

const form = reactive<IThemeConfig>({ ...defaultTheme })

const colorFields = [
  { key: 'primaryColor' as keyof IThemeConfig, label: '主题色', desc: '按钮、标签、高亮等主色调' },
  { key: 'accentColor' as keyof IThemeConfig, label: '强调色', desc: '链接、图标、进度条等强调色' },
  { key: 'navbarBgColor' as keyof IThemeConfig, label: '导航栏背景色', desc: '小程序顶部导航栏背景' },
  { key: 'navbarTextColor' as keyof IThemeConfig, label: '导航栏文字色', desc: '小程序顶部导航栏文字' }
]

async function fetchConfig() {
  loading.value = true
  try {
    const res = await operationApi.getThemeConfig()
    const data = res.data as IThemeConfig
    form.primaryColor = data.primaryColor
    form.accentColor = data.accentColor
    form.navbarBgColor = data.navbarBgColor
    form.navbarTextColor = data.navbarTextColor
  } catch {
    ElMessage.error('获取主题配置失败')
  } finally {
    loading.value = false
  }
}

function resetDefault() {
  form.primaryColor = defaultTheme.primaryColor
  form.accentColor = defaultTheme.accentColor
  form.navbarBgColor = defaultTheme.navbarBgColor
  form.navbarTextColor = defaultTheme.navbarTextColor
}

async function handleSave() {
  saving.value = true
  try {
    await operationApi.updateThemeConfig({ ...form })
    ElMessage.success('主题色配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 判断文字颜色（深色背景用白色，浅色背景用深色）
function textColorFor(bgColor: string): string {
  if (!bgColor || bgColor.length < 7) return '#333'
  const r = parseInt(bgColor.slice(1, 3), 16)
  const g = parseInt(bgColor.slice(3, 5), 16)
  const b = parseInt(bgColor.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#333' : '#fff'
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <div class="theme-config-page" v-loading="loading">
    <!-- 面包屑 -->
    <el-breadcrumb class="theme-config-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>页面装饰</el-breadcrumb-item>
      <el-breadcrumb-item>主题色配置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="theme-config-page__header">
      <h2 class="theme-config-page__title">主题色配置</h2>
    </div>

    <div class="theme-config-page__content">
      <!-- 左侧：颜色配置 -->
      <div class="theme-config-page__panel">
        <div class="theme-config-page__panel-title">颜色设置</div>
        <div
          v-for="field in colorFields"
          :key="field.key"
          class="theme-config-page__color-row"
        >
          <div class="theme-config-page__color-info">
            <span class="theme-config-page__color-label">{{ field.label }}</span>
            <span class="theme-config-page__color-desc">{{ field.desc }}</span>
          </div>
          <div class="theme-config-page__color-picker">
            <el-color-picker
              v-model="form[field.key]"
              show-alpha
              :predefine="['#D4916E', '#4A90D9', '#7BA87F', '#C4726F', '#8B7BA8', '#FAF7F2', '#1A1A1A', '#FFFFFF']"
            />
            <span class="theme-config-page__color-value">{{ form[field.key] }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：预览区域 -->
      <div class="theme-config-page__panel theme-config-page__panel--preview">
        <div class="theme-config-page__panel-title">预览效果</div>
        <div class="theme-config-page__preview-wrap">
          <!-- 模拟小程序手机框 -->
          <div class="theme-config-page__phone">
            <!-- 手机状态栏 -->
            <div
              class="theme-config-page__phone-status"
              :style="{ backgroundColor: form.navbarBgColor }"
            >
              <span
                class="theme-config-page__phone-time"
                :style="{ color: form.navbarTextColor }"
              >9:41</span>
            </div>
            <!-- 手机导航栏 -->
            <div
              class="theme-config-page__phone-navbar"
              :style="{
                backgroundColor: form.navbarBgColor,
                color: form.navbarTextColor
              }"
            >
              <span class="theme-config-page__phone-nav-title">知晓记</span>
            </div>
            <!-- 手机内容区 -->
            <div class="theme-config-page__phone-body">
              <!-- 轮播Banner占位 -->
              <div
                class="theme-config-page__phone-banner"
                :style="{ backgroundColor: form.accentColor + '20' }"
              >
                <span :style="{ color: form.accentColor }">Banner 区域</span>
              </div>
              <!-- 快捷入口 -->
              <div class="theme-config-page__phone-shortcuts">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="theme-config-page__phone-shortcut"
                  :style="{ backgroundColor: form.primaryColor + '15', color: form.primaryColor }"
                >
                  入口{{ n }}
                </div>
              </div>
              <!-- 按钮 -->
              <div class="theme-config-page__phone-buttons">
                <div
                  class="theme-config-page__phone-btn theme-config-page__phone-btn--primary"
                  :style="{
                    backgroundColor: form.primaryColor,
                    color: textColorFor(form.primaryColor)
                  }"
                >
                  开始学习
                </div>
                <div
                  class="theme-config-page__phone-btn theme-config-page__phone-btn--outline"
                  :style="{
                    borderColor: form.primaryColor,
                    color: form.primaryColor
                  }"
                >
                  查看详情
                </div>
              </div>
              <!-- 链接 -->
              <div
                class="theme-config-page__phone-link"
                :style="{ color: form.accentColor }"
              >
                查看更多内容 &rarr;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="theme-config-page__footer">
      <el-button @click="resetDefault">重置默认</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存配置
      </el-button>
    </div>
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
