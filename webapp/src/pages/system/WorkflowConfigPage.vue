<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshRight, Plus, Delete, Edit, View } from '@element-plus/icons-vue'
import { systemApi } from '@/api/modules/system'

type WorkflowType = 'chapter_generation' | 'section_content_generation' | 'image_generation' | 'video_generation' | 'questions_generation'
type ProviderType = 'coze' | 'private'
type OutputMode = 'streaming' | 'non_streaming'

interface ILLMNodeConfig {
  nodeIndex: number
  nodeName: string
  modelConfigId: string
  systemPrompt?: string
  userPrompt?: string
}

interface IWorkflowConfig {
  id: string
  providerType: ProviderType
  providerId: number | null
  providerName: string
  type: WorkflowType
  name: string
  remoteWorkflowId: string | null
  outputMode: OutputMode
  nodeCount: number
  nodesConfig: ILLMNodeConfig[]
  status: string
  createdAt: string
  updatedAt: string
}

interface IWorkflowProvider {
  id: string
  name: string
}

interface IWorkflowModelConfig {
  id: string
  name: string
  llmProvider: string
  model: string
}

const workflowTypeOptions = [
  { label: '章节生成', value: 'chapter_generation' },
  { label: '小节内容生成', value: 'section_content_generation' },
  { label: '生图', value: 'image_generation' },
  { label: '生成视频', value: 'video_generation' },
  { label: '生成题目', value: 'questions_generation' },
]

const providerTypeOptions = [
  { label: 'COZE', value: 'coze' },
  { label: '私有', value: 'private' },
]

const outputModeOptions = [
  { label: '流式', value: 'streaming' },
  { label: '非流式', value: 'non_streaming' },
]

const statusFilterOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const workflowTypeFilterOptions = [
  { label: '全部', value: '' },
  ...workflowTypeOptions,
]

const providerTypeFilterOptions = [
  { label: '全部', value: '' },
  ...providerTypeOptions,
]

const configList = ref<IWorkflowConfig[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filterKeyword = ref('')
const filterType = ref('')
const filterProviderType = ref('')
const filterStatus = ref('')

const providerList = ref<IWorkflowProvider[]>([])
const modelConfigList = ref<IWorkflowModelConfig[]>([])
const modelConfigOptions = computed(() =>
  modelConfigList.value.map((m) => ({
    label: `${m.name} (${m.llmProvider}/${m.model})`,
    value: String(m.id),
  }))
)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const editingId = ref('')
const formLoading = ref(false)

const formData = ref({
  name: '',
  providerType: '' as ProviderType | '',
  providerId: null as number | null,
  type: '' as WorkflowType | '',
  remoteWorkflowId: '',
  outputMode: 'streaming' as OutputMode,
  nodeCount: 1,
  nodesConfig: [] as ILLMNodeConfig[],
  status: 'active' as string,
})

const detailDialogVisible = ref(false)
const detailData = ref<IWorkflowConfig | null>(null)

const typeLabelMap: Record<string, string> = {
  chapter_generation: '章节生成',
  section_content_generation: '小节内容生成',
  image_generation: '生图',
  video_generation: '生成视频',
  questions_generation: '生成题目',
}

const providerTypeLabelMap: Record<string, string> = {
  coze: 'COZE',
  private: '私有',
}

const outputModeLabelMap: Record<string, string> = {
  streaming: '流式',
  non_streaming: '非流式',
}

const isCozeMode = computed(() => formData.value.providerType === 'coze')

function syncNodesConfig() {
  const currentLength = formData.value.nodesConfig.length
  const targetLength = formData.value.nodeCount
  if (targetLength > currentLength) {
    for (let i = currentLength; i < targetLength; i++) {
      formData.value.nodesConfig.push({
        nodeIndex: i + 1,
        nodeName: '',
        modelConfigId: '',
        systemPrompt: '',
        userPrompt: '',
      })
    }
  } else if (targetLength < currentLength) {
    formData.value.nodesConfig = formData.value.nodesConfig.slice(0, targetLength)
    formData.value.nodesConfig.forEach((node, index) => {
      node.nodeIndex = index + 1
    })
  }
}

watch(() => formData.value.nodeCount, () => {
  syncNodesConfig()
})

watch(() => formData.value.providerType, (val) => {
  if (val === 'coze') {
    formData.value.providerId = null
  } else if (val === 'private') {
    formData.value.remoteWorkflowId = ''
  }
})

async function fetchProviderList() {
  try {
    const res = await systemApi.listProviders({ page: 1, pageSize: 999 })
    if (res.code === 0) {
      const data = res.data as { list: IWorkflowProvider[]; total: number }
      providerList.value = data.list
    }
  } catch {
    // ignore
  }
}

async function fetchModelConfigList() {
  try {
    const res = await systemApi.listModelConfigs({ page: 1, pageSize: 999 })
    if (res.code === 0) {
      const data = res.data as { list: IWorkflowModelConfig[]; total: number }
      modelConfigList.value = data.list
    }
  } catch {
    // ignore
  }
}

async function fetchConfigList() {
  tableLoading.value = true
  try {
    const params: {
      page: number
      pageSize: number
      keyword?: string
      type?: string
      providerType?: string
      status?: string
    } = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (filterKeyword.value) params.keyword = filterKeyword.value
    if (filterType.value) params.type = filterType.value
    if (filterProviderType.value) params.providerType = filterProviderType.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await systemApi.listConfigs(params)
    if (res.code === 0) {
      const data = res.data as { list: IWorkflowConfig[]; total: number }
      configList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取工作流配置失败')
    }
  } catch {
    ElMessage.error('获取工作流配置失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchConfigList()
}

function handleReset() {
  filterKeyword.value = ''
  filterType.value = ''
  filterProviderType.value = ''
  filterStatus.value = ''
  page.value = 1
  fetchConfigList()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchConfigList()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchConfigList()
}

function resetForm() {
  formData.value = {
    name: '',
    providerType: '',
    providerId: null,
    type: '',
    remoteWorkflowId: '',
    outputMode: 'streaming',
    nodeCount: 1,
    nodesConfig: [
      { nodeIndex: 1, nodeName: '', modelConfigId: '', systemPrompt: '', userPrompt: '' },
    ],
    status: 'active',
  }
}

function openCreateDialog() {
  isEdit.value = false
  editingId.value = ''
  dialogTitle.value = '新增工作流配置'
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(row: IWorkflowConfig) {
  isEdit.value = true
  editingId.value = row.id
  dialogTitle.value = '编辑工作流配置'
  formLoading.value = true
  try {
    const res = await systemApi.getConfig(row.id)
    if (res.code === 0) {
      const data = res.data as IWorkflowConfig
      formData.value = {
        name: data.name,
        providerType: data.providerType,
        providerId: data.providerId,
        type: data.type,
        remoteWorkflowId: data.remoteWorkflowId || '',
        outputMode: data.outputMode,
        nodeCount: data.nodeCount,
        nodesConfig: data.nodesConfig.map((node) => ({ ...node })),
        status: data.status,
      }
    } else {
      ElMessage.error(res.message || '获取配置详情失败')
    }
  } catch {
    ElMessage.error('获取配置详情失败')
  } finally {
    formLoading.value = false
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formData.value.name) {
    ElMessage.warning('请输入配置名称')
    return
  }
  if (!formData.value.providerType) {
    ElMessage.warning('请选择供应商类型')
    return
  }
  if (formData.value.providerType === 'coze' && !formData.value.remoteWorkflowId) {
    ElMessage.warning('请输入工作流 ID')
    return
  }
  if (formData.value.providerType === 'private' && !formData.value.providerId) {
    ElMessage.warning('请选择大模型供应商')
    return
  }
  if (!formData.value.type) {
    ElMessage.warning('请选择工作流类型')
    return
  }
  if (!isCozeMode.value) {
    const hasInvalidNode = formData.value.nodesConfig.some(
      (node) => !node.nodeName || !node.modelConfigId
    )
    if (hasInvalidNode) {
      ElMessage.warning('请完善节点配置信息')
      return
    }
  }

  if (formData.value.status === 'active' && formData.value.type) {
    const sameTypeActive = configList.value.find(
      (c) => c.type === formData.value.type && c.status === 'active' && c.id !== (isEdit.value ? editingId.value : '')
    )
    if (sameTypeActive) {
      try {
        await ElMessageBox.confirm(
          `同一工作流类型只能启用一个配置。当前「${typeLabelMap[sameTypeActive.type] || sameTypeActive.type}」类型下已有「${sameTypeActive.name}」处于启用状态，是否将其切换为停用并将当前配置启用？`,
          '确认切换默认工作流',
          {
            confirmButtonText: '确认切换',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
      } catch {
        return
      }
    }
  }

  try {
    const payload = {
      providerType: formData.value.providerType as ProviderType,
      providerId: formData.value.providerId,
      type: formData.value.type as WorkflowType,
      name: formData.value.name,
      remoteWorkflowId: formData.value.remoteWorkflowId || undefined,
      outputMode: formData.value.outputMode,
      nodeCount: formData.value.nodeCount,
      nodesConfig: formData.value.nodesConfig,
      status: formData.value.status,
    }
    let res: { code: number; message?: string }
    if (isEdit.value) {
      res = await systemApi.updateConfig(editingId.value, payload)
    } else {
      res = await systemApi.createConfig(payload)
    }
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '工作流配置更新成功' : '工作流配置创建成功')
      dialogVisible.value = false
      fetchConfigList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

function handleDialogClose() {
  dialogVisible.value = false
}

function handleDelete(row: IWorkflowConfig) {
  ElMessageBox.confirm(
    `确定要删除工作流配置「${row.name}」吗？`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await systemApi.deleteConfig(row.id)
      if (res.code === 0) {
        ElMessage.success('工作流配置已删除')
        fetchConfigList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch {
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {
    // cancel
  })
}

function showDetailDialog(row: IWorkflowConfig) {
  detailData.value = row
  detailDialogVisible.value = true
}

function handleDetailDialogClose() {
  detailDialogVisible.value = false
  detailData.value = null
}

function getStatusTagType(status: string): 'success' | 'danger' | 'info' {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'info'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: '启用',
    inactive: '停用',
  }
  return map[status] || status
}

onMounted(() => {
  fetchConfigList()
  fetchProviderList()
  fetchModelConfigList()
})
</script>

<template>
  <div class="workflow-config-page">
    <el-breadcrumb class="workflow-config-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>工作流配置</el-breadcrumb-item>
    </el-breadcrumb>

    <h2 class="workflow-config-page__title">工作流配置</h2>

    <div class="workflow-config-page__filter-card">
      <div class="workflow-config-page__filter-row">
        <el-input
          v-model="filterKeyword"
          placeholder="配置名称"
          clearable
          class="workflow-config-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="filterType"
          placeholder="工作流类型"
          clearable
          class="workflow-config-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in workflowTypeFilterOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="filterProviderType"
          placeholder="供应商类型"
          clearable
          class="workflow-config-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in providerTypeFilterOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="filterStatus"
          placeholder="状态"
          clearable
          class="workflow-config-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in statusFilterOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        <div class="workflow-config-page__filter-spacer" />
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增配置</el-button>
      </div>
    </div>

    <div class="workflow-config-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="configList"
        row-key="id"
        class="workflow-config-page__table"
      >
        <el-table-column prop="name" label="配置名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="供应商类型" width="100" align="center">
          <template #default="{ row }: { row: IWorkflowConfig }">
            {{ providerTypeLabelMap[row.providerType] || row.providerType }}
          </template>
        </el-table-column>
        <el-table-column prop="providerName" label="供应商" width="130" show-overflow-tooltip />
        <el-table-column label="工作流类型" width="130" align="center">
          <template #default="{ row }: { row: IWorkflowConfig }">
            {{ typeLabelMap[row.type] || row.type }}
          </template>
        </el-table-column>
        <el-table-column prop="remoteWorkflowId" label="工作流 ID" width="140" show-overflow-tooltip>
          <template #default="{ row }: { row: IWorkflowConfig }">
            {{ row.remoteWorkflowId || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="输出模式" width="100" align="center">
          <template #default="{ row }: { row: IWorkflowConfig }">
            {{ outputModeLabelMap[row.outputMode] || row.outputMode }}
          </template>
        </el-table-column>
        <el-table-column prop="nodeCount" label="节点数" width="80" align="center" />
        <el-table-column label="状态" width="130" align="center">
          <template #default="{ row }: { row: IWorkflowConfig }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
            <el-tag
              v-if="row.status === 'active'"
              type="warning"
              size="small"
              effect="plain"
              class="workflow-config-page__default-tag"
            >默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }: { row: IWorkflowConfig }">
            <el-button link type="primary" size="small" :icon="View" @click="showDetailDialog(row)">查看</el-button>
            <el-button link type="primary" size="small" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!tableLoading && configList.length === 0" class="workflow-config-page__empty">
        <div class="workflow-config-page__empty-icon">
          <svg viewBox="0 0 80 80" width="48" height="48">
            <rect width="80" height="80" rx="40" fill="#F5EDE3"/>
            <path d="M36 28h8v24h-8zM36 56h8v4h-8z" fill="#DAD0C0"/>
          </svg>
        </div>
        <p class="workflow-config-page__empty-text">暂无工作流配置</p>
      </div>
    </div>

    <div class="workflow-config-page__pagination">
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
      width="800px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        v-loading="formLoading"
        :model="formData"
        label-position="top"
        class="workflow-config-page__form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="配置名称" required>
              <el-input v-model="formData.name" placeholder="请输入配置名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工作流类型" required>
              <el-select v-model="formData.type" placeholder="请选择工作流类型" style="width: 100%">
                <el-option
                  v-for="opt in workflowTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="供应商类型" required>
              <el-select v-model="formData.providerType" placeholder="请选择供应商类型" style="width: 100%">
                <el-option
                  v-for="opt in providerTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="formData.providerType === 'private'" label="大模型供应商" required>
              <el-select v-model="formData.providerId" placeholder="请选择大模型供应商" style="width: 100%">
                <el-option
                  v-for="item in providerList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="formData.providerType === 'coze'" label="工作流 ID" required>
              <el-input v-model="formData.remoteWorkflowId" placeholder="请输入 COZE 工作流 ID" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="输出模式">
              <el-radio-group v-model="formData.outputMode">
                <el-radio
                  v-for="opt in outputModeOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-switch
                v-model="formData.status"
                active-value="active"
                inactive-value="inactive"
                active-text="启用"
                inactive-text="停用"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="workflow-config-page__form-section">
          <span class="workflow-config-page__form-section-title">节点配置</span>
        </div>

        <el-alert
          v-if="isCozeMode"
          :closable="false"
          type="info"
          show-icon
          class="workflow-config-page__coze-notice"
          title="COZE 工作流的 LLM 节点由 COZE 平台配置，无需在此设置"
        />

        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="LLM 节点数">
              <el-input-number
                v-model="formData.nodeCount"
                :min="1"
                :max="20"
                :disabled="isCozeMode"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div
          v-for="(node, index) in formData.nodesConfig"
          :key="index"
          class="workflow-config-page__node-card"
          :class="{ 'workflow-config-page__node-card--disabled': isCozeMode }"
        >
          <div class="workflow-config-page__node-header">
            <span class="workflow-config-page__node-title">节点 {{ node.nodeIndex }}</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="节点名称" :required="!isCozeMode">
                <el-input v-model="node.nodeName" placeholder="例如：内容分析节点" :disabled="isCozeMode" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="大模型配置" :required="!isCozeMode">
                <el-select v-model="node.modelConfigId" placeholder="请选择大模型配置" style="width: 100%" filterable :disabled="isCozeMode">
                  <el-option
                    v-for="opt in modelConfigOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="System Prompt">
                <el-input
                  v-model="node.systemPrompt"
                  type="textarea"
                  :rows="3"
                  placeholder="系统级提示词，定义角色和行为"
                  :disabled="isCozeMode"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="User Prompt">
                <el-input
                  v-model="node.userPrompt"
                  type="textarea"
                  :rows="3"
                  placeholder="用户提示词，定义具体任务"
                  :disabled="isCozeMode"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="工作流配置详情"
      width="680px"
      :close-on-click-modal="false"
      @close="handleDetailDialogClose"
    >
      <template v-if="detailData">
        <div class="workflow-config-page__detail">
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">配置名称</span>
            <span class="workflow-config-page__detail-value">{{ detailData.name }}</span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">供应商类型</span>
            <span class="workflow-config-page__detail-value">{{ providerTypeLabelMap[detailData.providerType] || detailData.providerType }}</span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">供应商</span>
            <span class="workflow-config-page__detail-value">{{ detailData.providerName }}</span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">工作流类型</span>
            <span class="workflow-config-page__detail-value">{{ typeLabelMap[detailData.type] || detailData.type }}</span>
          </div>
          <div v-if="detailData.remoteWorkflowId" class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">工作流 ID</span>
            <span class="workflow-config-page__detail-value">{{ detailData.remoteWorkflowId }}</span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">输出模式</span>
            <span class="workflow-config-page__detail-value">{{ outputModeLabelMap[detailData.outputMode] || detailData.outputMode }}</span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">节点数</span>
            <span class="workflow-config-page__detail-value">{{ detailData.nodeCount }}</span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">状态</span>
            <span class="workflow-config-page__detail-value">
              <el-tag :type="getStatusTagType(detailData.status)" size="small">
                {{ getStatusLabel(detailData.status) }}
              </el-tag>
            </span>
          </div>
          <div class="workflow-config-page__detail-row">
            <span class="workflow-config-page__detail-label">创建时间</span>
            <span class="workflow-config-page__detail-value">{{ detailData.createdAt }}</span>
          </div>

          <div class="workflow-config-page__detail-divider" />

          <div class="workflow-config-page__detail-section-title">节点配置</div>
          <div
            v-for="node in detailData.nodesConfig"
            :key="node.nodeIndex"
            class="workflow-config-page__detail-node"
          >
            <div class="workflow-config-page__detail-node-header">节点 {{ node.nodeIndex }} - {{ node.nodeName }}</div>
            <div class="workflow-config-page__detail-node-row">
              <span class="workflow-config-page__detail-node-label">大模型配置ID</span>
              <span class="workflow-config-page__detail-node-value">{{ node.modelConfigId }}</span>
            </div>
            <div v-if="node.systemPrompt" class="workflow-config-page__detail-node-row workflow-config-page__detail-node-row--block">
              <span class="workflow-config-page__detail-node-label">System Prompt</span>
              <span class="workflow-config-page__detail-node-value workflow-config-page__detail-node-value--block">{{ node.systemPrompt }}</span>
            </div>
            <div v-if="node.userPrompt" class="workflow-config-page__detail-node-row workflow-config-page__detail-node-row--block">
              <span class="workflow-config-page__detail-node-label">User Prompt</span>
              <span class="workflow-config-page__detail-node-value workflow-config-page__detail-node-value--block">{{ node.userPrompt }}</span>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.workflow-config-page {
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
    width: 200px;
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
    padding-top: 8px;

    :deep(.el-form-item__label) {
      font-size: 13px;
      color: var(--app-text-secondary);
      font-weight: 500;
      padding-bottom: 4px;
    }
  }

  &__form-section {
    display: flex;
    align-items: center;
    margin: 16px 0 12px;
    padding-top: 12px;
    border-top: 1px solid var(--app-border-light);
  }

  &__form-section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__node-card {
    background: var(--app-bg-color);
    border: 1px solid var(--app-border-light);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__coze-notice {
    margin-bottom: 8px;
  }

  &__default-tag {
    margin-left: 4px;
  }

  &__node-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  &__node-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__detail {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__detail-row {
    display: flex;
    align-items: center;
  }

  &__detail-label {
    font-size: 13px;
    color: var(--app-text-secondary);
    width: 90px;
    flex-shrink: 0;
  }

  &__detail-value {
    font-size: 14px;
    color: var(--app-text-regular);
  }

  &__detail-divider {
    height: 1px;
    background: var(--app-border-light);
    margin: 4px 0;
  }

  &__detail-section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-top: 4px;
  }

  &__detail-node {
    background: var(--app-bg-color);
    border: 1px solid var(--app-border-light);
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__detail-node-header {
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text-primary);
    padding-bottom: 6px;
    border-bottom: 1px solid var(--app-border-light);
  }

  &__detail-node-row {
    display: flex;
    align-items: center;

    &--block {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }
  }

  &__detail-node-label {
    font-size: 12px;
    color: var(--app-text-secondary);
    width: 110px;
    flex-shrink: 0;
  }

  &__detail-node-value {
    font-size: 13px;
    color: var(--app-text-regular);

    &--block {
      width: 100%;
      padding: 8px 12px;
      background: var(--app-bg-card);
      border-radius: 6px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>