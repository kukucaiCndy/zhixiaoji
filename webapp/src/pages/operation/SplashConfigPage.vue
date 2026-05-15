<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface ISplashConfig {
  logoUrl: string
  slogan: string
  bgColor: string
}

const loading = ref(false)
const saving = ref(false)

const defaultConfig: ISplashConfig = {
  logoUrl: '',
  slogan: '轻松学编程，从这里开始',
  bgColor: '#D4916E'
}

const form = reactive<ISplashConfig>({ ...defaultConfig })

const sloganMaxLength = 20

async function fetchConfig() {
  loading.value = true
  try {
    const res = await operationApi.getSplashConfig()
    const data = res.data as ISplashConfig
    form.logoUrl = data.logoUrl
    form.slogan = data.slogan
    form.bgColor = data.bgColor
  } catch {
    ElMessage.error('获取开屏配置失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await operationApi.updateSplashConfig({ ...form })
    ElMessage.success('开屏页配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function textColorFor(bgColor: string): string {
  if (!bgColor || bgColor.length < 7) return '#fff'
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
  <div class="splash-config-page" v-loading="loading">
    <!-- 面包屑 -->
    <el-breadcrumb class="splash-config-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>页面装饰</el-breadcrumb-item>
      <el-breadcrumb-item>开屏页配置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="splash-config-page__header">
      <h2 class="splash-config-page__title">开屏页配置</h2>
      <p class="splash-config-page__desc">配置小程序启动时的开屏展示内容</p>
    </div>

    <div class="splash-config-page__content">
      <!-- 左侧：配置表单 -->
      <div class="splash-config-page__panel">
        <div class="splash-config-page__panel-title">配置项</div>

        <el-form label-width="100px" label-position="right">
          <el-form-item label="Logo图片">
            <el-upload
              list-type="picture-card"
              :auto-upload="false"
              :limit="1"
              class="splash-config-page__upload"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="splash-config-page__upload-hint">
              建议使用透明背景PNG图片，尺寸200×200像素
            </div>
          </el-form-item>

          <el-form-item label="Slogan文字">
            <el-input
              v-model="form.slogan"
              :maxlength="sloganMaxLength"
              show-word-limit
              placeholder="请输入开屏Slogan"
            />
          </el-form-item>

          <el-form-item label="背景色">
            <el-color-picker
              v-model="form.bgColor"
              :predefine="['#D4916E', '#4A90D9', '#7BA87F', '#8B7BA8', '#C4726F', '#1A1A1A', '#FAF7F2']"
            />
            <span class="splash-config-page__color-value">{{ form.bgColor }}</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：预览 -->
      <div class="splash-config-page__panel splash-config-page__panel--preview">
        <div class="splash-config-page__panel-title">预览效果</div>
        <div class="splash-config-page__preview-wrap">
          <div
            class="splash-config-page__preview"
            :style="{ backgroundColor: form.bgColor }"
          >
            <!-- Logo 区域 -->
            <div class="splash-config-page__preview-logo">
              <template v-if="form.logoUrl">
                <img :src="form.logoUrl" alt="logo" class="splash-config-page__preview-logo-img" />
              </template>
              <template v-else>
                <div
                  class="splash-config-page__preview-logo-placeholder"
                  :style="{
                    borderColor: textColorFor(form.bgColor),
                    color: textColorFor(form.bgColor)
                  }"
                >
                  Logo
                </div>
              </template>
            </div>

            <!-- Slogan -->
            <div
              class="splash-config-page__preview-slogan"
              :style="{ color: textColorFor(form.bgColor) }"
            >
              {{ form.slogan || '请输入Slogan' }}
            </div>

            <!-- 底部提示 -->
            <div
              class="splash-config-page__preview-footer"
              :style="{ color: textColorFor(form.bgColor) }"
            >
              知晓记 · 轻松学编程
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部保存 -->
    <div class="splash-config-page__footer">
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.splash-config-page {
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

  &__upload {
    :deep(.el-upload--picture-card) {
      width: 120px;
      height: 120px;
      border-radius: 12px;
    }
  }

  &__upload-hint {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin-top: 4px;
  }

  &__color-value {
    font-size: 13px;
    color: var(--app-text-secondary);
    font-family: monospace;
    margin-left: 10px;
  }

  // --- Preview ---
  &__preview-wrap {
    display: flex;
    justify-content: center;
  }

  &__preview {
    width: 240px;
    aspect-ratio: 9 / 16;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    transition: background-color 0.3s;
  }

  &__preview-logo {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__preview-logo-img {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  &__preview-logo-placeholder {
    width: 80px;
    height: 80px;
    border: 2px dashed;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    opacity: 0.6;
  }

  &__preview-slogan {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    padding: 0 32px;
    line-height: 1.5;
  }

  &__preview-footer {
    position: absolute;
    bottom: 24px;
    font-size: 11px;
    opacity: 0.6;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }
}
</style>
