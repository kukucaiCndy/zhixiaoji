<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'

interface IVolume {
  id: number
  name: string
  sortOrder: number
  status: string
  chapterCount: number
}

interface IChapter {
  id: number
  volumeId: number
  volumeName: string
  name: string
  sortOrder: number
  difficulty: string
  needPoints: boolean
  pointsRequired: number
  preChapterId: number
  preChapterName: string
  status: string
  cardCount: number
}

interface IVolumeForm {
  name: string
  sortOrder: number
  status: string
}

interface IChapterForm {
  name: string
  volumeId: number | undefined
  sortOrder: number
  difficulty: string
  needPoints: boolean
  pointsRequired: number
  preChapterId: number | undefined
}

const volumeList = ref<IVolume[]>([])
const chapterList = ref<IChapter[]>([])
const tableLoading = ref(false)

// Volume dialog
const volumeDialogVisible = ref(false)
const volumeDialogTitle = ref('新增篇章')
const volumeFormRef = ref()
const volumeForm = reactive<IVolumeForm>({
  name: '',
  sortOrder: 1,
  status: '草稿'
})
let editingVolumeId: number | null = null

// Chapter dialog
const chapterDialogVisible = ref(false)
const chapterDialogTitle = ref('新增章节')
const chapterFormRef = ref()
const chapterForm = reactive<IChapterForm>({
  name: '',
  volumeId: undefined,
  sortOrder: 1,
  difficulty: '入门',
  needPoints: false,
  pointsRequired: 0,
  preChapterId: undefined
})
let editingChapterId: number | null = null

const volumeDialogRules = {
  name: [{ required: true, message: '请输入篇章名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序序号', trigger: 'blur' }]
}

const chapterDialogRules = {
  name: [{ required: true, message: '请输入章节名称', trigger: 'blur' }],
  volumeId: [{ required: true, message: '请选择所属篇章', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序序号', trigger: 'blur' }]
}

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

const chapterOptions = computed(() => {
  return chapterList.value
    .filter((ch) => ch.volumeId === chapterForm.volumeId)
    .map((ch) => ({ label: ch.name, value: ch.id }))
})

function getStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '已上架': return 'success'
    case '已下架': return 'info'
    case '草稿': return 'warning'
    default: return 'info'
  }
}

function getDifficultyTagType(difficulty: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (difficulty) {
    case '入门': return 'success'
    case '基础': return 'warning'
    case '进阶': return 'danger'
    default: return 'info'
  }
}

async function fetchData() {
  tableLoading.value = true
  try {
    const volRes = await knowledgeApi.getVolumes()
    if (volRes.code === 0) {
      volumeList.value = volRes.data as IVolume[]
    }
    const chRes = await knowledgeApi.getChapters()
    if (chRes.code === 0) {
      chapterList.value = chRes.data as IChapter[]
    }
  } catch {
    ElMessage.error('获取知识体系数据失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function getChaptersByVolume(volumeId: number): IChapter[] {
  return chapterList.value.filter((ch) => ch.volumeId === volumeId)
}

// Volume CRUD
function handleAddVolume() {
  editingVolumeId = null
  volumeDialogTitle.value = '新增篇章'
  volumeForm.name = ''
  volumeForm.sortOrder = volumeList.value.length + 1
  volumeForm.status = '草稿'
  volumeDialogVisible.value = true
}

function handleEditVolume(volume: IVolume) {
  editingVolumeId = volume.id
  volumeDialogTitle.value = '编辑篇章'
  volumeForm.name = volume.name
  volumeForm.sortOrder = volume.sortOrder
  volumeForm.status = volume.status
  volumeDialogVisible.value = true
}

async function handleDeleteVolume(volume: IVolume) {
  try {
    await ElMessageBox.confirm(
      `确定要删除篇章「${volume.name}」吗？删除后该篇章下的所有章节也将被删除，此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await knowledgeApi.deleteVolume(volume.id)
    if (res.code === 0) {
      ElMessage.success('篇章删除成功')
      await fetchData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleVolumeSubmit() {
  const valid = await volumeFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const data = { ...volumeForm }
    if (editingVolumeId !== null) {
      const res = await knowledgeApi.updateVolume(editingVolumeId, data)
      if (res.code === 0) {
        ElMessage.success('篇章更新成功')
        volumeDialogVisible.value = false
        await fetchData()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await knowledgeApi.createVolume(data)
      if (res.code === 0) {
        ElMessage.success('篇章新增成功')
        volumeDialogVisible.value = false
        await fetchData()
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

// Chapter CRUD
function handleAddChapter(volume?: IVolume) {
  editingChapterId = null
  chapterDialogTitle.value = '新增章节'
  chapterForm.name = ''
  chapterForm.volumeId = volume ? volume.id : undefined
  chapterForm.sortOrder = 1
  chapterForm.difficulty = '入门'
  chapterForm.needPoints = false
  chapterForm.pointsRequired = 0
  chapterForm.preChapterId = undefined
  chapterDialogVisible.value = true
}

function handleEditChapter(chapter: IChapter) {
  editingChapterId = chapter.id
  chapterDialogTitle.value = '编辑章节'
  chapterForm.name = chapter.name
  chapterForm.volumeId = chapter.volumeId
  chapterForm.sortOrder = chapter.sortOrder
  chapterForm.difficulty = chapter.difficulty
  chapterForm.needPoints = chapter.needPoints
  chapterForm.pointsRequired = chapter.pointsRequired
  chapterForm.preChapterId = chapter.preChapterId || undefined
  chapterDialogVisible.value = true
}

async function handleDeleteChapter(chapter: IChapter) {
  try {
    await ElMessageBox.confirm(
      `确定要删除章节「${chapter.name}」吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    const res = await knowledgeApi.deleteChapter(chapter.id)
    if (res.code === 0) {
      ElMessage.success('章节删除成功')
      await fetchData()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleChapterSubmit() {
  const valid = await chapterFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const volume = volumeList.value.find((v) => v.id === chapterForm.volumeId)

  try {
    const data = {
      ...chapterForm,
      volumeName: volume ? volume.name : '',
      status: '草稿'
    }
    if (editingChapterId !== null) {
      const res = await knowledgeApi.updateChapter(editingChapterId, data)
      if (res.code === 0) {
        ElMessage.success('章节更新成功')
        chapterDialogVisible.value = false
        await fetchData()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await knowledgeApi.createChapter(data)
      if (res.code === 0) {
        ElMessage.success('章节新增成功')
        chapterDialogVisible.value = false
        await fetchData()
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="knowledge-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="knowledge-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      <el-breadcrumb-item>知识体系</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="knowledge-page__top-bar">
      <h2 class="knowledge-page__title">知识体系管理</h2>
      <div class="knowledge-page__top-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddVolume()">
          新增篇章
        </el-button>
      </div>
    </div>

    <!-- Tree Table -->
    <div class="knowledge-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="volumeList"
        row-key="id"
        class="knowledge-page__table"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        empty-text="暂无知识体系数据"
      >
        <!-- Volume columns -->
        <el-table-column prop="name" label="名称" min-width="240">
          <template #default="{ row }: { row: IVolume }">
            <div class="knowledge-page__volume-cell">
              <span class="knowledge-page__volume-icon">&#9670;</span>
              <span class="knowledge-page__volume-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序序号" width="100" align="center" />

        <el-table-column label="难度" width="100" align="center">
          <template #default="{ row }: { row: IVolume }">
            <span v-if="getChaptersByVolume(row.id).length" class="knowledge-page__difficulty-text">
              {{ getChaptersByVolume(row.id)[0]?.difficulty || '-' }}
            </span>
            <span v-else class="knowledge-page__text-placeholder">-</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }: { row: IVolume }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }: { row: IVolume }">
            <div class="knowledge-page__actions">
              <el-button link type="primary" size="small" @click="handleAddChapter(row)">
                新增章节
              </el-button>
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEditVolume(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteVolume(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Chapters nested under volumes -->
      <div class="knowledge-page__chapters">
        <div
          v-for="volume in volumeList"
          :key="'ch-' + volume.id"
        >
          <div
            v-for="chapter in getChaptersByVolume(volume.id)"
            :key="chapter.id"
            class="knowledge-page__chapter-row"
          >
            <div class="knowledge-page__chapter-name-cell">
              <span class="knowledge-page__chapter-indent"></span>
              <span class="knowledge-page__chapter-icon">&#8226;</span>
              <span class="knowledge-page__chapter-name">{{ chapter.name }}</span>
            </div>
            <div class="knowledge-page__chapter-cell knowledge-page__chapter-cell--sort">
              {{ chapter.sortOrder }}
            </div>
            <div class="knowledge-page__chapter-cell knowledge-page__chapter-cell--difficulty">
              <el-tag :type="getDifficultyTagType(chapter.difficulty)" size="small">
                {{ chapter.difficulty }}
              </el-tag>
            </div>
            <div class="knowledge-page__chapter-cell knowledge-page__chapter-cell--status">
              <el-tag :type="getStatusTagType(chapter.status)" size="small">
                {{ chapter.status }}
              </el-tag>
            </div>
            <div class="knowledge-page__chapter-cell knowledge-page__chapter-cell--actions">
              <el-button link type="primary" size="small" :icon="Edit" @click="handleEditChapter(chapter)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" :icon="Delete" @click="handleDeleteChapter(chapter)">
                删除
              </el-button>
            </div>
          </div>
          <div
            v-if="getChaptersByVolume(volume.id).length === 0"
            class="knowledge-page__chapter-empty"
          >
            <span class="knowledge-page__chapter-indent"></span>
            <span class="knowledge-page__empty-hint">暂未添加章节，点击上方"新增章节"添加</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Volume Dialog -->
    <el-dialog
      v-model="volumeDialogVisible"
      :title="volumeDialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="volumeFormRef"
        :model="volumeForm"
        :rules="volumeDialogRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="篇章名称" prop="name">
          <el-input v-model="volumeForm.name" placeholder="请输入篇章名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="排序序号" prop="sortOrder">
          <el-input-number
            v-model="volumeForm.sortOrder"
            :min="1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="volumeForm.status"
            active-value="已上架"
            inactive-value="草稿"
            active-text="已上架"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="volumeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleVolumeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Chapter Dialog -->
    <el-dialog
      v-model="chapterDialogVisible"
      :title="chapterDialogTitle"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="chapterFormRef"
        :model="chapterForm"
        :rules="chapterDialogRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="章节名称" prop="name">
          <el-input v-model="chapterForm.name" placeholder="请输入章节名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="所属篇章" prop="volumeId">
          <el-select v-model="chapterForm.volumeId" placeholder="请选择所属篇章" style="width: 100%">
            <el-option
              v-for="vol in volumeList"
              :key="vol.id"
              :label="vol.name"
              :value="vol.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序序号" prop="sortOrder">
          <el-input-number
            v-model="chapterForm.sortOrder"
            :min="1"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="难度">
          <el-radio-group v-model="chapterForm.difficulty">
            <el-radio-button
              v-for="opt in difficultyOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="前置章节">
          <el-select
            v-model="chapterForm.preChapterId"
            placeholder="请选择前置章节（可选）"
            style="width: 100%"
            clearable
            :disabled="!chapterForm.volumeId"
          >
            <el-option
              v-for="opt in chapterOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="积分解锁">
          <el-switch v-model="chapterForm.needPoints" />
        </el-form-item>
        <el-form-item v-if="chapterForm.needPoints" label="所需积分">
          <el-input-number
            v-model="chapterForm.pointsRequired"
            :min="0"
            :max="99999"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="chapterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChapterSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.knowledge-page {
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
      .el-table__row {
        &:hover > td {
          background-color: #FDFBF7;
        }
      }

      .el-table__cell {
        border-bottom: 1px solid var(--app-border-light);
        padding: 14px 0;
      }
    }

    :deep(.el-table__empty-text) {
      color: var(--app-text-secondary);
    }
  }

  &__volume-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 4px;
  }

  &__volume-icon {
    color: var(--app-primary-color);
    font-size: 10px;
  }

  &__volume-name {
    font-weight: 600;
    color: var(--app-text-primary);
    font-size: 14px;
  }

  &__difficulty-text {
    color: var(--app-text-regular);
    font-size: 13px;
  }

  &__text-placeholder {
    color: var(--app-text-placeholder);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
  }

  // Chapters section
  &__chapters {
    border-top: none;
  }

  &__chapter-row {
    display: flex;
    align-items: center;
    background-color: #FDFBF7;
    border-bottom: 1px solid var(--app-border-light);
    font-size: 13px;
    transition: background-color 0.2s;

    &:hover {
      background-color: #F8F4ED;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  &__chapter-name-cell {
    flex: 1;
    min-width: 240px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
  }

  &__chapter-indent {
    width: 32px;
    flex-shrink: 0;
  }

  &__chapter-icon {
    color: var(--app-text-secondary);
    font-size: 18px;
    line-height: 1;
  }

  &__chapter-name {
    color: var(--app-text-regular);
  }

  &__chapter-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;

    &--sort {
      width: 100px;
      color: var(--app-text-secondary);
    }

    &--difficulty {
      width: 100px;
    }

    &--status {
      width: 100px;
    }

    &--actions {
      width: 200px;
      gap: 4px;
    }
  }

  &__chapter-empty {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #FDFBF7;
    border-bottom: 1px solid var(--app-border-light);
  }

  &__empty-hint {
    color: var(--app-text-placeholder);
    font-size: 13px;
  }
}
</style>
