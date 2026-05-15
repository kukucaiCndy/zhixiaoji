<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download, UploadFilled } from '@element-plus/icons-vue'
import type { UploadInstance, UploadProps, UploadFile } from 'element-plus'
import { questionApi } from '@/api/modules/content'

const router = useRouter()

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
const importing = ref(false)

const importResult = ref<{
  total: number
  success: number
  fail: number
} | null>(null)

function goBack() {
  router.push('/content/questions')
}

async function handleDownloadTemplate() {
  try {
    const res = await questionApi.getImportTemplate()
    if (res.code === 0) {
      const data = res.data as { url: string }
      if (data.url) {
        window.open(data.url, '_blank')
        ElMessage.success('模板下载已开始')
      }
    } else {
      ElMessage.error(res.message || '获取模板失败')
    }
  } catch {
    ElMessage.error('获取模板失败，请稍后重试')
  }
}

const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('仅支持上传 Excel 文件 (.xlsx / .xls)')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }

  return true
}

const handleUpload: UploadProps['httpRequest'] = async (options) => {
  importing.value = true
  importResult.value = null

  try {
    const file = options.file as File
    const res = await questionApi.importQuestions(file)
    if (res.code === 0) {
      const data = res.data as { total: number; success: number; fail: number }
      importResult.value = data
      if (data.fail === 0) {
        ElMessage.success(`导入成功！共 ${data.total} 条题目全部导入成功`)
      } else {
        ElMessage.warning(`导入完成：成功 ${data.success} 条，失败 ${data.fail} 条`)
      }
    } else {
      ElMessage.error(res.message || '导入失败')
    }
  } catch {
    ElMessage.error('导入失败，请稍后重试')
  } finally {
    importing.value = false
  }
}

function handleExceed() {
  ElMessage.warning('每次只能上传一个文件')
}

function handleFileChange(file: UploadFile) {
  fileList.value = [file]
}

function handleClearFiles() {
  fileList.value = []
  importResult.value = null
}
</script>

<template>
  <div class="question-import-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="question-import-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/questions' }">内容管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/questions' }">题目管理</el-breadcrumb-item>
      <el-breadcrumb-item>批量导入</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="question-import-page__top-bar">
      <h2 class="question-import-page__title">批量导入题目</h2>
      <div class="question-import-page__top-actions">
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- Steps Guide -->
    <div class="question-import-page__steps-card">
      <div class="question-import-page__steps">
        <div class="question-import-page__step">
          <div class="question-import-page__step-number">
            <span>1</span>
          </div>
          <div class="question-import-page__step-content">
            <div class="question-import-page__step-title">下载导入模板</div>
            <div class="question-import-page__step-desc">
              请先下载标准导入模板，按照模板格式准备数据
            </div>
            <el-button
              type="primary"
              :icon="Download"
              plain
              size="small"
              @click="handleDownloadTemplate"
              class="question-import-page__step-action"
            >
              下载模板文件 (.xlsx)
            </el-button>
          </div>
        </div>

        <div class="question-import-page__step-connector">
          <span class="question-import-page__step-arrow">&darr;</span>
        </div>

        <div class="question-import-page__step">
          <div class="question-import-page__step-number">
            <span>2</span>
          </div>
          <div class="question-import-page__step-content">
            <div class="question-import-page__step-title">按模板格式填写数据</div>
            <div class="question-import-page__step-desc">
              按照模板中的表头格式填写题目数据。必填字段：题目内容、题目类型、正确答案。支持单选题、多选题、判断题。
            </div>
            <div class="question-import-page__step-note">
              <span class="question-import-page__step-note-label">提示：</span>
              题目的选项列用竖线 "|" 分隔，例如：选项A内容|选项B内容|选项C内容|选项D内容
            </div>
          </div>
        </div>

        <div class="question-import-page__step-connector">
          <span class="question-import-page__step-arrow">&darr;</span>
        </div>

        <div class="question-import-page__step">
          <div class="question-import-page__step-number">
            <span>3</span>
          </div>
          <div class="question-import-page__step-content">
            <div class="question-import-page__step-title">上传填写完成的文件</div>
            <div class="question-import-page__step-desc">
              选择已填写完成的 Excel 文件上传，系统将自动解析并导入题目数据
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Card -->
    <div class="question-import-page__upload-card">
      <el-upload
        ref="uploadRef"
        class="question-import-page__upload"
        drag
        :auto-upload="false"
        :limit="1"
        :on-exceed="handleExceed"
        :before-upload="handleBeforeUpload"
        :http-request="handleUpload"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".xlsx,.xls"
      >
        <div class="question-import-page__upload-area">
          <el-icon class="question-import-page__upload-icon" :size="48" color="#D4916E">
            <UploadFilled />
          </el-icon>
          <div class="question-import-page__upload-text">
            <span>将 Excel 文件拖到此处，或</span>
            <em>点击选择文件</em>
          </div>
          <div class="question-import-page__upload-hint">
            支持 .xlsx / .xls 格式，文件大小不超过 10MB
          </div>
        </div>
      </el-upload>

      <div v-if="fileList.length > 0" class="question-import-page__upload-actions">
        <el-button
          type="primary"
          :loading="importing"
          :disabled="importing"
          @click="uploadRef?.submit()"
        >
          {{ importing ? '正在导入...' : '开始导入' }}
        </el-button>
        <el-button @click="handleClearFiles" :disabled="importing">
          清除文件
        </el-button>
      </div>
    </div>

    <!-- Import Result -->
    <div v-if="importResult" class="question-import-page__result-card">
      <div class="question-import-page__result-header">
        <span class="question-import-page__result-title">导入结果</span>
      </div>
      <div class="question-import-page__result-grid">
        <div class="question-import-page__result-item">
          <div class="question-import-page__result-value question-import-page__result-value--total">
            {{ importResult.total }}
          </div>
          <div class="question-import-page__result-label">总数</div>
        </div>
        <div class="question-import-page__result-item">
          <div class="question-import-page__result-value question-import-page__result-value--success">
            {{ importResult.success }}
          </div>
          <div class="question-import-page__result-label">成功</div>
        </div>
        <div class="question-import-page__result-item">
          <div class="question-import-page__result-value question-import-page__result-value--fail">
            {{ importResult.fail }}
          </div>
          <div class="question-import-page__result-label">失败</div>
        </div>
      </div>
      <div class="question-import-page__result-footer">
        <el-button type="primary" @click="goBack">返回题目列表</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.question-import-page {
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

  &__top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__top-actions {
    display: flex;
    gap: 12px;
  }

  // Steps Card
  &__steps-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 32px;
  }

  &__steps {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__step {
    display: flex;
    gap: 16px;
  }

  &__step-connector {
    display: flex;
    justify-content: center;
    padding: 4px 0 4px 28px;
  }

  &__step-arrow {
    font-size: 20px;
    color: var(--app-border-color);
    line-height: 1;
  }

  &__step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--app-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;

    span {
      font-size: 15px;
      font-weight: 700;
      color: var(--app-primary-color);
    }
  }

  &__step-content {
    flex: 1;
    padding-bottom: 8px;
  }

  &__step-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 6px;
  }

  &__step-desc {
    font-size: 13px;
    color: var(--app-text-secondary);
    line-height: 1.5;
    margin-bottom: 8px;
  }

  &__step-action {
    margin-top: 4px;
  }

  &__step-note {
    font-size: 12px;
    color: var(--app-text-secondary);
    background: var(--app-bg-color);
    padding: 10px 14px;
    border-radius: 8px;
    line-height: 1.6;
  }

  &__step-note-label {
    color: var(--app-primary-color);
    font-weight: 600;
  }

  // Upload Card
  &__upload-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  &__upload {
    width: 100%;

    :deep(.el-upload-dragger) {
      background: var(--app-bg-color);
      border: 2px dashed var(--app-border-color);
      border-radius: 12px;
      padding: 48px 24px;
      width: 100%;
    }
  }

  &__upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__upload-icon {
    opacity: 0.6;
  }

  &__upload-text {
    font-size: 15px;
    color: var(--app-text-regular);

    em {
      color: var(--app-primary-color);
      font-style: normal;
      cursor: pointer;
    }
  }

  &__upload-hint {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__upload-actions {
    display: flex;
    gap: 12px;
  }

  // Result Card
  &__result-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__result-header {
    padding: 16px 24px;
    background: #FDFBF7;
    border-bottom: 1px solid var(--app-border-color);
  }

  &__result-title {
    font-family: var(--app-font-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__result-grid {
    display: flex;
    padding: 32px 24px;
    gap: 0;
  }

  &__result-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    &:not(:last-child) {
      border-right: 1px solid var(--app-border-light);
    }
  }

  &__result-value {
    font-family: var(--app-font-heading);
    font-size: 36px;
    font-weight: 700;

    &--total {
      color: var(--app-info-color);
    }

    &--success {
      color: var(--app-success-color);
    }

    &--fail {
      color: var(--app-danger-color);
    }
  }

  &__result-label {
    font-size: 14px;
    color: var(--app-text-secondary);
  }

  &__result-footer {
    padding: 16px 24px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--app-border-light);
    background: #FDFBF7;
  }
}
</style>
