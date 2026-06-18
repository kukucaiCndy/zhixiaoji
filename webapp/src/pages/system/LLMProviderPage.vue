<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

interface ILLMProvider {
  id: string
  name: string
  description: string
  endpointUrl: string
  authType: 'api_key' | 'oauth2' | 'bearer_token' | 'custom'
  authConfig: Record<string, string> | null
  status: string
  createdAt: string
  updatedAt: string
}

interface IProviderForm {
  name: string
  description: string
  endpointUrl: string
  authType: 'api_key' | 'oauth2' | 'bearer_token' | 'custom'
  status: string
}

const authTypeLabels: Record<string, string> = {
  api_key: 'API密钥',
  oauth2: 'OAuth2.0',
  bearer_token: 'Bearer Token',
  custom: '自定义'
}

const authTypeOptions = [
  { label: 'API密钥', value: 'api_key' },
  { label: 'OAuth2.0', value: 'oauth2' },
  { label: 'Bearer Token', value: 'bearer_token' },
  { label: '自定义', value: 'custom' }
]

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' }
]

const providerList = ref<ILLMProvider[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const keyword = ref('')
const filterStatus = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingId = ref<string | null>(null)
const formSaving = ref(false)
const formRef = ref()

const formData = reactive<IProviderForm>({
  name: '',
  description: '',
  endpointUrl: '',
  authType: 'api_key',
  status: 'active'
})

async function fetchList() {
  tableLoading.value = true
  try {
    const res = await systemApi.listProviders({
      page: page.value,
      pageSize: pageSize.value,
      status: filterStatus.value || undefined,
      keyword: keyword.value || undefined
    })
    if (res.code === 0) {
      const data = res.data as { list: ILLMProvider[]; total: number }
      providerList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取供应商列表失败')
    }
  } catch {
    ElMessage.error('获取供应商列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  keyword.value = ''
  filterStatus.value = ''
  page.value = 1
  fetchList()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchList()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchList()
}

function resetForm() {
  formData.name = ''
  formData.description = ''
  formData.endpointUrl = ''
  formData.authType = 'api_key'
  formData.status = 'active'
}

function handleAdd() {
  editingId.value = null
  dialogTitle.value = '新增供应商'
  resetForm()
  dialogVisible.value = true
}

async function handleEdit(row: ILLMProvider) {
  editingId.value = row.id
  dialogTitle.value = '编辑供应商'
  formData.name = row.name
  formData.description = row.description
  formData.endpointUrl = row.endpointUrl
  formData.authType = row.authType
  formData.status = row.status
  dialogVisible.value = true
}

async function handleDelete(row: ILLMProvider) {
  try {
    await ElMessageBox.confirm(
      `确定要删除供应商「${row.name}」吗？删除后不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await systemApi.deleteProvider(row.id)
    if (res.code === 0) {
      ElMessage.success('供应商已删除')
      fetchList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleSave() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  formSaving.value = true
  try {
    const data = {
      name: formData.name,
      description: formData.description,
      endpointUrl: formData.endpointUrl,
      authType: formData.authType,
      status: formData.status
    }

    let res
    if (editingId.value !== null) {
      res = await systemApi.updateProvider(editingId.value, data)
    } else {
      res = await systemApi.createProvider(data)
    }

    if (res.code === 0) {
      ElMessage.success(editingId.value !== null ? '供应商已更新' : '供应商已创建')
      dialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    formSaving.value = false
  }
}

function handleDialogClose() {
  dialogVisible.value = false
}

function formatAuthType(authType: string): string {
  return authTypeLabels[authType] || authType
}

function formatStatus(status: string): string {
  return status === 'active' ? '启用' : '停用'
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="llm-provider-page">
    <el-breadcrumb class="llm-provider-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>大模型供应商</el-breadcrumb-item>
    </el-breadcrumb>

    <h2 class="llm-provider-page__title">大模型供应商</h2>

    <div class="llm-provider-page__filter-card">
      <div class="llm-provider-page__filter-row">
        <el-input
          v-model="keyword"
          placeholder="搜索供应商名称"
          clearable
          class="llm-provider-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          class="llm-provider-page__filter-select"
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
        <div class="llm-provider-page__filter-spacer" />
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增供应商</el-button>
      </div>
    </div>

    <div class="llm-provider-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="providerList"
        row-key="id"
        class="llm-provider-page__table"
      >
        <el-table-column prop="name" label="名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="endpointUrl" label="接口地址" min-width="240" show-overflow-tooltip />
        <el-table-column label="鉴权方式" width="130" align="center">
          <template #default="{ row }: { row: ILLMProvider }">
            {{ formatAuthType(row.authType) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }: { row: ILLMProvider }">
            <el-tag
              :type="row.status === 'active' ? 'success' : 'info'"
              size="small"
            >
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }: { row: ILLMProvider }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!tableLoading && providerList.length === 0" class="llm-provider-page__empty">
        <div class="llm-provider-page__empty-icon">
          <svg viewBox="0 0 80 80" width="48" height="48">
            <rect width="80" height="80" rx="40" fill="#F5EDE3"/>
            <path d="M36 28h8v24h-8zM36 56h8v4h-8z" fill="#DAD0C0"/>
          </svg>
        </div>
        <p class="llm-provider-page__empty-text">暂无供应商数据</p>
      </div>
    </div>

    <div class="llm-provider-page__pagination">
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
      width="520px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="90px"
        class="llm-provider-page__form"
      >
        <el-form-item
          label="名称"
          prop="name"
          :rules="[{ required: true, message: '请输入供应商名称', trigger: 'blur' }]"
        >
          <el-input
            v-model="formData.name"
            placeholder="请输入供应商名称"
            maxlength="100"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入供应商描述"
            type="textarea"
            :rows="3"
            maxlength="500"
          />
        </el-form-item>
        <el-form-item
          label="接口地址"
          prop="endpointUrl"
          :rules="[
            { required: true, message: '请输入接口地址', trigger: 'blur' },
            { type: 'url', message: '请输入合法的URL地址', trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="formData.endpointUrl"
            placeholder="请输入接口地址，如 https://api.example.com/v1"
          />
        </el-form-item>
        <el-form-item
          label="鉴权方式"
          prop="authType"
          :rules="[{ required: true, message: '请选择鉴权方式', trigger: 'change' }]"
        >
          <el-select v-model="formData.authType" placeholder="请选择鉴权方式">
            <el-option
              v-for="opt in authTypeOptions"
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
        <el-button type="primary" :loading="formSaving" @click="handleSave">
          确认{{ editingId !== null ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.llm-provider-page {
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
    width: 140px;
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
    .el-select {
      width: 100%;
    }
  }
}
</style>