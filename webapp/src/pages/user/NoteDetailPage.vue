<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { noteApi } from '@/api/modules/user'

interface INoteDetail {
  id: number
  title: string
  content: string
  cardName: string
  authorId: number
  authorName: string
  createdAt: string
  auditStatus: string
  aiConfidence: number
}

const router = useRouter()
const route = useRoute()

const noteId = Number(route.params.id)

const noteDetail = ref<INoteDetail | null>(null)
const detailLoading = ref(false)
const submitting = ref(false)

const auditRemark = ref('')
const showAuditRemark = ref(false)
const pendingAuditAction = ref('')

function getAuditStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '审核通过': return 'success'
    case '审核存疑': return 'warning'
    case '已删除': return 'info'
    default: return 'info'
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return '#7BA87F'
  if (confidence >= 70) return '#E6A23C'
  return '#C4726F'
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return '高'
  if (confidence >= 70) return '中'
  return '低'
}

function getConfidenceTips(confidence: number): string {
  if (confidence >= 90) return 'AI分析认为此笔记内容合规，置信度较高'
  if (confidence >= 70) return 'AI分析存在一定不确定性，建议人工抽查审核'
  return 'AI分析认为内容存在较高风险，建议人工重点审核'
}

async function fetchNoteDetail() {
  detailLoading.value = true
  try {
    const res = await noteApi.getNoteDetail(noteId)
    if (res.code === 0) {
      noteDetail.value = res.data as INoteDetail
    } else {
      ElMessage.error(res.message || '获取笔记详情失败')
      router.back()
    }
  } catch {
    ElMessage.error('获取笔记详情失败，请稍后重试')
  } finally {
    detailLoading.value = false
  }
}

function handleBack() {
  router.push('/user/notes')
}

function handleAuthorClick() {
  if (noteDetail.value) {
    router.push(`/user/${noteDetail.value.authorId}/detail`)
  }
}

function showAuditActionDialog(action: string) {
  pendingAuditAction.value = action
  auditRemark.value = ''
  showAuditRemark.value = true
}

function getActionLabel(action: string): string {
  switch (action) {
    case 'approve': return '通过审核'
    case 'reject': return '标记违规'
    case 'keep': return '保留观察'
    default: return action
  }
}

function getActionType(action: string): 'primary' | 'danger' | 'warning' | '' {
  switch (action) {
    case 'approve': return 'primary'
    case 'reject': return 'danger'
    case 'keep': return 'warning'
    default: return ''
  }
}

async function confirmAuditAction() {
  if (!auditRemark.value.trim()) {
    ElMessage.warning('请填写审核备注')
    return
  }
  if (!noteDetail.value) return

  const actionLabel = getActionLabel(pendingAuditAction.value)

  try {
    await ElMessageBox.confirm(
      `确定对笔记「${noteDetail.value.title || '无标题'}」执行「${actionLabel}」操作吗？`,
      '操作确认',
      {
        confirmButtonText: `确认${actionLabel}`,
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await executeAuditAction()
  } catch {
    // user cancelled
  }
}

async function executeAuditAction() {
  if (!noteDetail.value) return

  submitting.value = true
  try {
    const res = await noteApi.auditNote(noteId, pendingAuditAction.value, auditRemark.value)
    if (res.code === 0) {
      const actionLabel = getActionLabel(pendingAuditAction.value)
      ElMessage.success(`${actionLabel}操作成功`)
      showAuditRemark.value = false
      fetchNoteDetail()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

function getDefaultAvatar(nickname: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' rx='24' fill='%23D4916E'%3E%3C/rect%3E%3Ctext x='24' y='31' text-anchor='middle' fill='white' font-size='20' font-family='sans-serif'%3E${encodeURIComponent(nickname.charAt(0))}%3C/text%3E%3C/svg%3E`
}

onMounted(() => {
  fetchNoteDetail()
})
</script>

<template>
  <div class="note-detail-page" v-loading="detailLoading">
    <!-- Breadcrumb -->
    <el-breadcrumb class="note-detail-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/user/notes' }">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/user/notes' }">笔记管理</el-breadcrumb-item>
      <el-breadcrumb-item>笔记详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Back Button -->
    <div class="note-detail-page__top-bar">
      <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
    </div>

    <template v-if="noteDetail">
      <!-- Note Info Card -->
      <div class="note-detail-page__info-card">
        <div class="note-detail-page__info-header">
          <div class="note-detail-page__author" @click="handleAuthorClick">
            <el-avatar :size="44" :src="getDefaultAvatar(noteDetail.authorName)" />
            <span class="note-detail-page__author-name">{{ noteDetail.authorName }}</span>
          </div>
          <div class="note-detail-page__info-meta">
            <span>创建时间: {{ noteDetail.createdAt }}</span>
            <span class="note-detail-page__info-divider">|</span>
            <span>所属卡片: <strong>{{ noteDetail.cardName }}</strong></span>
          </div>
          <el-tag :type="getAuditStatusTagType(noteDetail.auditStatus)" class="note-detail-page__info-status">
            {{ noteDetail.auditStatus }}
          </el-tag>
        </div>
      </div>

      <!-- Note Content -->
      <div class="note-detail-page__content-card">
        <div class="note-detail-page__content-title">{{ noteDetail.title || '(无标题)' }}</div>
        <div class="note-detail-page__content-body">{{ noteDetail.content }}</div>
      </div>

      <!-- AI Audit Result Card (only for pending) -->
      <div v-if="noteDetail.auditStatus === '审核存疑'" class="note-detail-page__ai-card">
        <div class="note-detail-page__ai-header">
          <span class="note-detail-page__ai-label">AI 审核结果</span>
        </div>
        <div class="note-detail-page__ai-content">
          <div class="note-detail-page__ai-confidence">
            <div class="note-detail-page__ai-confidence-ring">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#F3EBE2" stroke-width="6" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  :stroke="getConfidenceColor(noteDetail.aiConfidence)"
                  stroke-width="6"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(noteDetail.aiConfidence / 100) * 213.6} 213.6`"
                  transform="rotate(-90 40 40)"
                />
                <text x="40" y="36" text-anchor="middle" fill="#3D3D3D" font-size="18" font-weight="700">
                  {{ noteDetail.aiConfidence }}%
                </text>
                <text x="40" y="52" text-anchor="middle" :fill="getConfidenceColor(noteDetail.aiConfidence)" font-size="11" font-weight="500">
                  {{ getConfidenceLabel(noteDetail.aiConfidence) }}置信度
                </text>
              </svg>
            </div>
            <div class="note-detail-page__ai-tips">
              <p>{{ getConfidenceTips(noteDetail.aiConfidence) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Audit Actions -->
      <div class="note-detail-page__audit-card">
        <div class="note-detail-page__audit-label">审核操作</div>
        <div class="note-detail-page__audit-actions">
          <el-tooltip
            v-if="noteDetail.auditStatus === '审核存疑'"
            content="标记笔记为审核通过"
            placement="top"
          >
            <el-button type="primary" @click="showAuditActionDialog('approve')">
              通过审核
            </el-button>
          </el-tooltip>
          <el-tooltip
            v-if="noteDetail.auditStatus !== '已删除'"
            content="标记笔记为违规内容"
            placement="top"
          >
            <el-button type="danger" plain @click="showAuditActionDialog('reject')">
              标记违规
            </el-button>
          </el-tooltip>
          <el-tooltip
            v-if="noteDetail.auditStatus === '审核存疑'"
            content="暂时保留，等待进一步观察"
            placement="top"
          >
            <el-button plain @click="showAuditActionDialog('keep')">
              保留观察
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>
  </div>

  <!-- Audit Remark Dialog -->
  <el-dialog
    v-model="showAuditRemark"
    :title="`${getActionLabel(pendingAuditAction)} - 审核备注`"
    width="480px"
    :close-on-click-modal="false"
  >
    <div class="note-detail-page__remark-body">
      <el-input
        v-model="auditRemark"
        type="textarea"
        :rows="4"
        placeholder="请输入审核备注，说明审核依据和处理意见..."
        maxlength="500"
        show-word-limit
      />
    </div>
    <template #footer>
      <el-button @click="showAuditRemark = false">取消</el-button>
      <el-button
        :type="getActionType(pendingAuditAction)"
        :loading="submitting"
        @click="confirmAuditAction"
      >
        确认{{ getActionLabel(pendingAuditAction) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.note-detail-page {
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
  }

  // Info Card
  &__info-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px 28px;
  }

  &__info-header {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    &:hover .note-detail-page__author-name {
      color: var(--app-primary-color);
    }
  }

  &__author-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
    transition: color 0.2s;
  }

  &__info-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__info-divider {
    color: var(--app-border-color);
  }

  &__info-status {
    flex-shrink: 0;
  }

  // Content Card
  &__content-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 28px 32px;
  }

  &__content-title {
    font-family: var(--app-font-heading);
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--app-border-light);
  }

  &__content-body {
    font-size: 14px;
    color: var(--app-text-regular);
    line-height: 1.8;
    white-space: pre-wrap;
    word-break: break-word;
  }

  // AI Audit Card
  &__ai-card {
    background: #FDFBF7;
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px 28px;
  }

  &__ai-header {
    margin-bottom: 16px;
  }

  &__ai-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__ai-content {
    display: flex;
    align-items: center;
  }

  &__ai-confidence {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  &__ai-confidence-ring {
    flex-shrink: 0;
  }

  &__ai-tips {
    p {
      margin: 0;
      font-size: 14px;
      color: var(--app-text-secondary);
      line-height: 1.6;
    }
  }

  // Audit Actions Card
  &__audit-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__audit-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__audit-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  // Remark Dialog
  &__remark-body {
    margin-top: 8px;
  }
}
</style>
