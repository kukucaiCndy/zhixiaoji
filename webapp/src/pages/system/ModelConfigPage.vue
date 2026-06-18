<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshRight, Edit, Delete } from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

interface IModelConfig {
  id: string
  name: string
  llmProvider: string
  baseUrl: string
  model: string
  apiKey: string
  inputMaxTokens: number | null
  outputMaxTokens: number | null
  thinkingLevel: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface IModelOption {
  label: string
  models: string[]
}

interface IFormData {
  name: string
  llmProvider: string
  baseUrl: string
  model: string
  apiKey: string
  inputMaxTokens: number | null
  outputMaxTokens: number | null
  thinkingLevel: '' | 'low' | 'medium' | 'high'
  status: string
}

const configList = ref<IModelConfig[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const keyword = ref('')
const filterProvider = ref('')
const filterStatus = ref('')

const providerOptions = ref<IModelOption[]>([])
const modelOptions = ref<string[]>([])

const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
]

const thinkingLevelOptions = [
  { label: '关闭', value: '' },
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' }
]

const dialogVisible = ref(false)
const dialogTitle = ref('新增配置')
const isEdit = ref(false)
const editId = ref<string | null>(null)
const submitting = ref(false)

const formRef = ref()

const defaultForm: IFormData = {
  name: '',
  llmProvider: '',
  baseUrl: '',
  model: '',
  apiKey: '',
  inputMaxTokens: 2048000,
  outputMaxTokens: 512000,
  thinkingLevel: '',
  status: 'active'
}

const formData = reactive<IFormData>({ ...defaultForm })

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return key
  const prefix = key.slice(0, 3)
  const suffix = key.slice(-3)
  const stars = '****'
  return `${prefix}${stars}${suffix}`
}

function getThinkingLevelLabel(level: string | null): string {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  if (!level) return '关闭'
  return map[level] || level
}

function getStatusLabel(status: string): string {
  return status === 'active' ? '启用' : '停用'
}

function resetForm() {
  Object.assign(formData, defaultForm)
  modelOptions.value = []
}

function fetchProviderOptions() {
  const options = systemApi.getModelProviderOptions()
  providerOptions.value = options as unknown as IModelOption[]
}

watch(() => formData.llmProvider, async (provider) => {
  if (!provider) {
    modelOptions.value = []
    formData.baseUrl = ''
    return
  }
  const opt = providerOptions.value.find((o) => o.label === provider)
  if (opt) {
    modelOptions.value = opt.models
    if (opt.label === 'OpenAI') formData.baseUrl = 'https://api.openai.com/v1'
    else if (opt.label === '阿里云通义千问') formData.baseUrl = 'https://dashscope.aliyuncs.com/api/v1'
    else if (opt.label === 'DeepSeek') formData.baseUrl = 'https://api.deepseek.com/v1'
    else if (opt.label === '百度文心一言') formData.baseUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom'
    else formData.baseUrl = ''
  } else {
    modelOptions.value = []
    formData.baseUrl = ''
  }
})

function handleOpenCreate() {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增模型配置'
  resetForm()
  dialogVisible.value = true
}

async function handleOpenEdit(row: IModelConfig) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑模型配置'
  try {
    const res = await systemApi.getModelConfig(row.id)
    if (res.code === 0) {
      const data = res.data as IModelConfig
      formData.name = data.name
      formData.llmProvider = data.llmProvider
      const opt = providerOptions.value.find((o) => o.label === data.llmProvider)
      if (opt) {
        modelOptions.value = opt.models
      }
      formData.baseUrl = data.baseUrl
      formData.model = data.model
      formData.apiKey = data.apiKey
      formData.inputMaxTokens = data.inputMaxTokens
      formData.outputMaxTokens = data.outputMaxTokens
      formData.thinkingLevel = (data.thinkingLevel || '') as '' | 'low' | 'medium' | 'high'
      formData.status = data.status
    } else {
      ElMessage.error(res.message || '获取配置详情失败')
      return
    }
  } catch {
    ElMessage.error('获取配置详情失败，请稍后重试')
    return
  }
  dialogVisible.value = true
}

function handleDialogClose() {
  dialogVisible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data = {
      name: formData.name,
      llmProvider: formData.llmProvider,
      baseUrl: formData.baseUrl,
      model: formData.model,
      apiKey: formData.apiKey,
      inputMaxTokens: formData.inputMaxTokens ?? undefined,
      outputMaxTokens: formData.outputMaxTokens ?? undefined,
      thinkingLevel: formData.thinkingLevel || undefined,
      status: formData.status
    }

    let res
    if (isEdit.value && editId.value !== null) {
      res = await systemApi.updateModelConfig(editId.value, data)
    } else {
      res = await systemApi.createModelConfig(data)
    }

    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '配置更新成功' : '配置创建成功')
      dialogVisible.value = false
      await fetchConfigs()
    } else {
      ElMessage.error(res.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: IModelConfig) {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置「${row.name}」吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await systemApi.deleteModelConfig(row.id)
    if (res.code === 0) {
      ElMessage.success('配置已删除')
      if (configList.value.length === 1 && page.value > 1) {
        page.value--
      }
      await fetchConfigs()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function fetchConfigs() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (keyword.value) params.keyword = keyword.value
    if (filterProvider.value) params.llmProvider = filterProvider.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await systemApi.listModelConfigs(params as {
      page: number
      pageSize: number
      llmProvider?: string
      status?: string
      keyword?: string
    })
    if (res.code === 0) {
      const data = res.data as { list: IModelConfig[]; total: number }
      configList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取配置列表失败')
    }
  } catch {
    ElMessage.error('获取配置列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchConfigs()
}

function handleReset() {
  keyword.value = ''
  filterProvider.value = ''
  filterStatus.value = ''
  page.value = 1
  fetchConfigs()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchConfigs()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchConfigs()
}

onMounted(() => {
  fetchProviderOptions()
  fetchConfigs()
})
</script>

<template>
  <div class="model-config-page">
    <el-breadcrumb class="model-config-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>大模型配置</el-breadcrumb-item>
    </el-breadcrumb>

    <h2 class="model-config-page__title">大模型配置</h2>

    <div class="model-config-page__filter-card">
      <div class="model-config-page__filter-row">
        <el-input
          v-model="keyword"
          placeholder="搜索配置名称 / 模型"
          clearable
          class="model-config-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="filterProvider"
          placeholder="模型供应商"
          clearable
          class="model-config-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in providerOptions"
            :key="opt.label"
            :label="opt.label"
            :value="opt.label"
          />
        </el-select>
        <el-select
          v-model="filterStatus"
          placeholder="状态"
          clearable
          class="model-config-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        <div class="model-config-page__filter-spacer" />
        <el-button type="primary" :icon="Plus" @click="handleOpenCreate">新增配置</el-button>
      </div>
    </div>

    <div class="model-config-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="configList"
        row-key="id"
        class="model-config-page__table"
      >
        <el-table-column prop="name" label="配置名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="llmProvider" label="模型供应商" width="130" />
        <el-table-column prop="baseUrl" label="BASE URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="model" label="模型" width="150" />
        <el-table-column label="API Key" width="130">
          <template #default="{ row }: { row: IModelConfig }">
            <span class="model-config-page__api-key">{{ maskApiKey(row.apiKey) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="inputMaxTokens" label="输入 Token" width="100" align="center">
          <template #default="{ row }: { row: IModelConfig }">
            {{ row.inputMaxTokens ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="outputMaxTokens" label="输出 Token" width="100" align="center">
          <template #default="{ row }: { row: IModelConfig }">
            {{ row.outputMaxTokens ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="思考程度" width="90" align="center">
          <template #default="{ row }: { row: IModelConfig }">
            {{ getThinkingLevelLabel(row.thinkingLevel) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }: { row: IModelConfig }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }: { row: IModelConfig }">
            <el-button type="primary" link size="small" :icon="Edit" @click="handleOpenEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!tableLoading && configList.length === 0" class="model-config-page__empty">
        <div class="model-config-page__empty-icon">
          <svg viewBox="0 0 80 80" width="48" height="48">
            <rect width="80" height="80" rx="40" fill="#F5EDE3"/>
            <path d="M36 28h8v24h-8zM36 56h8v4h-8z" fill="#DAD0C0"/>
          </svg>
        </div>
        <p class="model-config-page__empty-text">暂无大模型配置</p>
      </div>
    </div>

    <div class="model-config-page__pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="640px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="120px"
        label-position="left"
        class="model-config-page__form"
      >
        <el-form-item
          label="配置名称"
          prop="name"
          :rules="[{ required: true, message: '请输入配置名称', trigger: 'blur' }]"
        >
          <el-input v-model="formData.name" placeholder="例如：GPT-4o 生产配置" />
        </el-form-item>
        <el-form-item
          label="模型供应商"
          prop="llmProvider"
          :rules="[{ required: true, message: '请选择模型供应商', trigger: 'change' }]"
        >
          <el-select v-model="formData.llmProvider" placeholder="请选择模型供应商" class="model-config-page__form-select">
            <el-option
              v-for="opt in providerOptions"
              :key="opt.label"
              :label="opt.label"
              :value="opt.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="API Key"
          prop="apiKey"
          :rules="[{ required: true, message: '请输入 API Key', trigger: 'blur' }]"
        >
          <el-input
            v-model="formData.apiKey"
            type="password"
            show-password
            placeholder="请输入 API Key"
          />
        </el-form-item>
        <el-form-item
          label="BASE URL"
          prop="baseUrl"
          :rules="[{ required: true, message: '请输入 BASE URL', trigger: 'blur' }]"
        >
          <el-input v-model="formData.baseUrl" placeholder="例如：https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item
          label="模型"
          prop="model"
          :rules="[{ required: true, message: '请选择或输入模型名称', trigger: 'blur' }]"
        >
          <el-select
            v-model="formData.model"
            filterable
            allow-create
            default-first-option
            placeholder="选择模型或自定义输入"
            class="model-config-page__form-select"
          >
            <el-option
              v-for="m in modelOptions"
              :key="m"
              :label="m"
              :value="m"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="输入 Token 数" prop="inputMaxTokens">
          <el-input-number
            v-model="formData.inputMaxTokens"
            :min="0"
            :max="9999999"
            :step="1000"
            controls-position="right"
            class="model-config-page__form-number"
          />
        </el-form-item>
        <el-form-item label="输出 Token 数" prop="outputMaxTokens">
          <el-input-number
            v-model="formData.outputMaxTokens"
            :min="0"
            :max="9999999"
            :step="1000"
            controls-position="right"
            class="model-config-page__form-number"
          />
        </el-form-item>
        <el-form-item label="思考程度" prop="thinkingLevel">
          <el-select v-model="formData.thinkingLevel" placeholder="请选择思考程度" class="model-config-page__form-select">
            <el-option
              v-for="opt in thinkingLevelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.model-config-page {
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

  &__filter-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px 24px;
  }

  &__filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__filter-input {
    width: 220px;
  }

  &__filter-select {
    width: 150px;
  }

  &__filter-spacer {
    flex: 1;
  }

  &__table-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__table {
    :deep(.el-table__header-wrapper) {
      .el-table__cell {
        background-color: #FDFBF7;
        color: var(--app-text-secondary);
        font-weight: 500;
        font-size: 13px;
        border-bottom: 1px solid var(--app-border-color);
        padding: 12px 0;

        &::before {
          display: none;
        }
      }
    }

    :deep(.el-table__body-wrapper) {
      .el-table__cell {
        border-bottom: 1px solid var(--app-border-light);
        padding: 14px 0;
      }
    }

    :deep(.el-table__empty-text) {
      color: var(--app-text-secondary);
    }
  }

  &__api-key {
    font-family: monospace;
    font-size: 13px;
    color: var(--app-text-secondary);
    letter-spacing: 0.5px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    gap: 16px;
  }

  &__empty-icon {
    opacity: 0.6;
  }

  &__empty-text {
    font-size: 14px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;

    :deep(.el-pagination) {
      --el-pagination-bg-color: var(--app-bg-card);
      --el-pagination-button-bg-color: var(--app-bg-card);
    }
  }

  &__form {
    padding: 8px 0;
  }

  &__form-select {
    width: 100%;
  }

  &__form-number {
    width: 100%;
  }
}
</style>