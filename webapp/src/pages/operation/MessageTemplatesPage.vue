<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface ITemplate {
  id: number
  type: string
  title: string
  content: string
  variables: string[]
  status: string
}

const MESSAGE_TYPE_VARIABLES: Record<string, string[]> = {
  '学习提醒': ['用户名', '今日待复习数', '连续打卡天数', '本周学习卡片数'],
  '复习提醒': ['用户名', '待复习卡片数', '遗忘风险卡片数', '上次学习时间'],
  '活动通知': ['用户名', '活动名称', '活动时间', '活动奖励'],
  '积分变动': ['用户名', '变动积分', '变动原因', '当前积分'],
  '成就解锁': ['用户名', '成就名称', '成就描述', '获得奖励'],
  '文具掉落': ['用户名', '文具名称', '稀有度', '获得方式']
}

const MESSAGE_TYPES = Object.keys(MESSAGE_TYPE_VARIABLES)

const templates = ref<ITemplate[]>([])
const loading = ref(false)
const saving = ref(false)
const activeType = ref('学习提醒')

const editForm = reactive({
  title: '',
  content: ''
})
const currentTemplateId = ref<number | null>(null)
const editDirty = ref(false)

const currentVariables = computed(() => {
  return MESSAGE_TYPE_VARIABLES[activeType.value] || []
})

const filteredTemplates = computed(() => {
  return templates.value.filter((t) => t.type === activeType.value)
})

const currentTemplate = computed(() => {
  return filteredTemplates.value[0] || null
})

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getMessageTemplates()
    templates.value = res.data as ITemplate[]
    loadCurrentTemplate()
  } catch {
    ElMessage.error('获取模板数据失败')
  } finally {
    loading.value = false
  }
}

function loadCurrentTemplate() {
  const tmpl = currentTemplate.value
  if (tmpl) {
    editForm.title = tmpl.title
    editForm.content = tmpl.content
    currentTemplateId.value = tmpl.id
    editDirty.value = false
  }
}

function onTabChange() {
  loadCurrentTemplate()
}

function insertVariable(variable: string) {
  editForm.content += `{${variable}}`
  editDirty.value = true
}

function onContentInput() {
  editDirty.value = true
}

async function handleSave() {
  if (!currentTemplateId.value) return
  saving.value = true
  try {
    await operationApi.updateMessageTemplate(currentTemplateId.value, {
      title: editForm.title,
      content: editForm.content
    })
    ElMessage.success('模板保存成功')
    editDirty.value = false
    // update local
    const tmpl = currentTemplate.value
    if (tmpl) {
      tmpl.title = editForm.title
      tmpl.content = editForm.content
    }
  } catch {
    ElMessage.error('保存模板失败')
  } finally {
    saving.value = false
  }
}

async function handleReset() {
  if (!currentTemplateId.value) return
  saving.value = true
  try {
    await operationApi.resetMessageTemplate(currentTemplateId.value)
    ElMessage.success('模板已恢复默认')
    await fetchData()
  } catch {
    ElMessage.error('恢复默认失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="msg-templates-page">
    <el-breadcrumb class="msg-templates-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>消息推送</el-breadcrumb-item>
      <el-breadcrumb-item>模板管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="msg-templates-page__header">
      <h2 class="msg-templates-page__title">模板管理</h2>
      <p class="msg-templates-page__desc">管理各消息类型的推送模板内容和变量</p>
    </div>

    <div v-loading="loading" class="msg-templates-page__body">
      <!-- Message type tabs -->
      <el-tabs v-model="activeType" class="msg-templates-page__tabs" @tab-change="onTabChange">
        <el-tab-pane
          v-for="msgType in MESSAGE_TYPES"
          :key="msgType"
          :label="msgType"
          :name="msgType"
        />
      </el-tabs>

      <el-empty
        v-if="!loading && !currentTemplate"
        description="该类型暂无模板数据"
      />

      <div v-else class="msg-templates-page__editor">
        <div class="msg-templates-page__form">
          <div class="msg-templates-page__form-item">
            <label class="msg-templates-page__label">模板标题</label>
            <el-input
              v-model="editForm.title"
              placeholder="请输入模板标题"
              @input="onContentInput"
            />
          </div>

          <div class="msg-templates-page__form-item">
            <label class="msg-templates-page__label">模板内容</label>
            <el-input
              v-model="editForm.content"
              type="textarea"
              :rows="6"
              placeholder="请输入模板内容，点击下方变量可快速插入"
              @input="onContentInput"
            />
          </div>

          <div class="msg-templates-page__variables">
            <span class="msg-templates-page__variables-label">可用变量：</span>
            <el-tag
              v-for="v in currentVariables"
              :key="v"
              class="msg-templates-page__variable-tag"
              type="info"
              size="small"
              @click="insertVariable(v)"
            >
              {{ '{' + v + '}' }}
            </el-tag>
          </div>

          <div class="msg-templates-page__actions">
            <el-button @click="handleReset" :disabled="saving">
              恢复默认
            </el-button>
            <el-button
              type="primary"
              :loading="saving"
              :disabled="!editDirty"
              @click="handleSave"
            >
              保存
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.msg-templates-page {
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

  &__body {
    min-height: 300px;
  }

  &__tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      color: var(--app-text-secondary);

      &.is-active {
        color: var(--app-primary-color);
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      background-color: var(--app-primary-color);
    }
  }

  &__editor {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-primary);
  }

  &__variables {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__variables-label {
    font-size: 13px;
    color: var(--app-text-secondary);
    white-space: nowrap;
  }

  &__variable-tag {
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      transform: scale(1.05);
      border-color: var(--app-primary-color);
      color: var(--app-primary-color);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 8px;
  }
}
</style>
