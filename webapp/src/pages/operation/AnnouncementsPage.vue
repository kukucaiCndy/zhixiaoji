<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IAnnouncement {
  id: number
  title: string
  content: string
  jumpType: string
  jumpTarget: string
  publishTime: string
  expireTime: string
  status: string
}

interface IAnnouncementForm {
  title: string
  content: string
  jumpType: string
  jumpTarget: string
  publishTime: string
  expireTime: string
  status: string
}

const announcements = ref<IAnnouncement[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增公告')
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const defaultForm: IAnnouncementForm = {
  title: '',
  content: '',
  jumpType: '无跳转',
  jumpTarget: '',
  publishTime: '',
  expireTime: '',
  status: '草稿'
}

const form = reactive<IAnnouncementForm>({ ...defaultForm })

const jumpTypeOptions = ['无跳转', '知识卡片', '每日挑战', '章节']

const knowledgeCards = ref([
  { label: 'Python入门基础', value: 'python-basic' },
  { label: 'JavaScript核心概念', value: 'js-core' },
  { label: '数据结构与算法', value: 'dsa' }
])

const chapters = ref([
  { label: '第1章 编程起步', value: 'ch1' },
  { label: '第2章 变量与类型', value: 'ch2' }
])

const jumpTargets = ref<{ label: string; value: string }[]>([])

function updateJumpTargets() {
  switch (form.jumpType) {
    case '知识卡片':
      jumpTargets.value = knowledgeCards.value
      break
    case '章节':
      jumpTargets.value = chapters.value
      break
    default:
      jumpTargets.value = []
      form.jumpTarget = ''
      break
  }
}

function getStatusType(status: string): 'success' | 'info' | 'danger' | 'warning' {
  switch (status) {
    case '已发布': return 'success'
    case '草稿': return 'info'
    case '已过期': return 'warning'
    default: return 'info'
  }
}

async function fetchAnnouncements() {
  loading.value = true
  try {
    const res = await operationApi.getAnnouncements()
    announcements.value = res.data as IAnnouncement[]
  } catch {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogTitle.value = '新增公告'
  isEditing.value = false
  editingId.value = null
  Object.assign(form, { ...defaultForm })
  jumpTargets.value = []
  dialogVisible.value = true
}

function openEditDialog(row: IAnnouncement) {
  dialogTitle.value = '编辑公告'
  isEditing.value = true
  editingId.value = row.id
  form.title = row.title
  form.content = row.content
  form.jumpType = row.jumpType
  form.jumpTarget = row.jumpTarget
  form.publishTime = row.publishTime
  form.expireTime = row.expireTime
  form.status = row.status
  updateJumpTargets()
  dialogVisible.value = true
}

async function handleDelete(row: IAnnouncement) {
  try {
    await ElMessageBox.confirm(`确定要删除公告「${row.title}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await operationApi.deleteAnnouncement(row.id)
    ElMessage.success('公告已删除')
    await fetchAnnouncements()
  } catch {
    // 取消操作
  }
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await operationApi.updateAnnouncement(editingId.value, { ...form })
      ElMessage.success('公告更新成功')
    } else {
      await operationApi.createAnnouncement({ ...form })
      ElMessage.success('公告创建成功')
    }
    dialogVisible.value = false
    await fetchAnnouncements()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

function formatTime(time: string): string {
  return time || '-'
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<template>
  <div class="announcements-page">
    <!-- 面包屑 -->
    <el-breadcrumb class="announcements-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>页面装饰</el-breadcrumb-item>
      <el-breadcrumb-item>公告管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="announcements-page__header">
      <h2 class="announcements-page__title">公告管理</h2>
      <p class="announcements-page__desc">管理小程序公告栏展示内容及发布周期</p>
    </div>

    <!-- 操作栏 -->
    <div class="announcements-page__toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        新增公告
      </el-button>
    </div>

    <!-- 表格 -->
    <div v-loading="loading" class="announcements-page__table-wrap">
      <el-table
        :data="announcements"
        style="width: 100%"
      >
        <el-table-column label="公告标题" min-width="200">
          <template #default="{ row }">
            <span class="announcements-page__title-text">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.publishTime) }}
          </template>
        </el-table-column>

        <el-table-column label="过期时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.expireTime) }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Edit" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button text type="danger" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && announcements.length === 0" description="暂无公告数据" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <el-form-item label="公告标题">
          <el-input
            v-model="form.title"
            placeholder="请输入公告标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="公告内容">
          <el-input
            v-model="form.content"
            type="textarea"
            placeholder="请输入公告内容"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-radio-group v-model="form.jumpType" @change="updateJumpTargets">
            <el-radio
              v-for="opt in jumpTypeOptions"
              :key="opt"
              :value="opt"
            >
              {{ opt }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="jumpTargets.length > 0" label="跳转目标">
          <el-select v-model="form.jumpTarget" placeholder="请选择跳转目标" style="width: 100%">
            <el-option
              v-for="opt in jumpTargets"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发布时间">
          <el-date-picker
            v-model="form.publishTime"
            type="datetime"
            placeholder="选择发布时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="过期时间">
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-value="已发布"
            inactive-value="草稿"
            active-text="已发布"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.announcements-page {
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

  &__toolbar {
    display: flex;
    align-items: center;
  }

  &__table-wrap {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;

    :deep(.el-table) {
      --el-table-border-color: var(--app-border-light);
      --el-table-header-bg-color: var(--app-bg-color);
      --el-table-row-hover-bg-color: #FDFAF5;
    }

    :deep(.el-table th.el-table__cell) {
      font-size: 13px;
      font-weight: 600;
      color: var(--app-text-regular);
    }
  }

  &__title-text {
    font-weight: 500;
    color: var(--app-text-primary);
  }
}
</style>
