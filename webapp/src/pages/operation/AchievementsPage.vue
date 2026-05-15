<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Upload } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IAchievement {
  id: number
  name: string
  icon: string
  category: string
  condition: string
  reward: string
  unlockCount: number
  unlockRate: number
  status: string
}

interface IAchievementForm {
  name: string
  description: string
  icon: string
  category: string
  conditionType: string
  conditionValue: number
  rewardType: string
  rewardStationery: string
  rewardCount: number
  status: string
}

const ACHIEVEMENT_CATEGORIES = ['学习数量', '连续学习', '答题能手', '完美答题', '探索者', '社交达人', '文具收集', '特殊行为']
const REWARD_TYPES = ['文具', '装饰道具']

const CONDITION_TYPE_MAP: Record<string, string[]> = {
  '学习数量': ['完成卡片学习数'],
  '连续学习': ['连续打卡天数', '累计学习天数'],
  '答题能手': ['累计答题数', '每日挑战完成次数'],
  '完美答题': ['连续正确答题数'],
  '探索者': ['解锁章节数', '学习不同类别卡片数'],
  '社交达人': ['邀请好友数'],
  '文具收集': ['收集文具数'],
  '特殊行为': ['分享次数', '观看广告次数']
}

const achievements = ref<IAchievement[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const saving = ref(false)
const selectedIds = ref<number[]>([])

// filters
const filterCategory = ref('全部')
const filterStatus = ref<string[]>([])

// dialog
const dialogVisible = ref(false)
const dialogTitle = ref('新增成就')
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: IAchievementForm = {
  name: '',
  description: '',
  icon: '',
  category: '学习数量',
  conditionType: '完成卡片学习数',
  conditionValue: 1,
  rewardType: '文具',
  rewardStationery: '',
  rewardCount: 1,
  status: '已上架'
}
const form = reactive<IAchievementForm>({ ...defaultForm })

const filteredList = computed(() => {
  let list = [...achievements.value]
  if (filterCategory.value !== '全部') {
    list = list.filter((a) => a.category === filterCategory.value)
  }
  if (filterStatus.value.length > 0) {
    list = list.filter((a) => filterStatus.value.includes(a.status))
  }
  return list
})

const conditionTypeOptions = computed(() => {
  return CONDITION_TYPE_MAP[form.category] || []
})

function getStatusTagType(status: string): 'success' | 'info' {
  return status === '已上架' ? 'success' : 'info'
}

function getCategoryTagType(category: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const idx = ACHIEVEMENT_CATEGORIES.indexOf(category)
  const types: ('primary' | 'success' | 'warning' | 'info' | 'danger')[] = ['info', 'success', 'warning', 'danger', 'info', 'primary', 'info', 'info']
  return types[idx] || 'info'
}

function handleSelectionChange(rows: IAchievement[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getAchievements()
    const data = res.data as { list: IAchievement[]; categories: string[] }
    achievements.value = data.list
    categories.value = data.categories
  } catch {
    ElMessage.error('获取成就数据失败')
  } finally {
    loading.value = false
  }
}

function onCategoryChange() {
  form.conditionType = conditionTypeOptions.value[0] || ''
  form.conditionValue = 1
}

function openCreateDialog() {
  dialogTitle.value = '新增成就'
  isEditing.value = false
  editingId.value = null
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

function openEditDialog(row: IAchievement) {
  dialogTitle.value = '编辑成就'
  isEditing.value = true
  editingId.value = row.id
  form.name = row.name
  form.description = row.condition
  form.icon = row.icon
  form.category = row.category
  form.conditionType = row.category
  form.conditionValue = 1
  form.rewardType = '文具'
  form.rewardStationery = row.reward
  form.rewardCount = 1
  form.status = row.status
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      await operationApi.updateAchievement(editingId.value, { ...form })
      ElMessage.success('成就更新成功')
    } else {
      await operationApi.createAchievement({ ...form })
      ElMessage.success('成就创建成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: IAchievement) {
  try {
    await ElMessageBox.confirm(`确定要删除成就「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await operationApi.deleteAchievement(row.id)
    ElMessage.success('成就已删除')
    await fetchData()
  } catch {
    // cancelled
  }
}

async function handleBatchOperation(action: string) {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择成就')
    return
  }
  const actionNames: Record<string, string> = {
    online: '上架', offline: '下架', delete: '删除'
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量${actionNames[action]}选中的${selectedIds.value.length}个成就吗？`,
      '批量操作确认',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
    await operationApi.batchAchievementOperation(selectedIds.value, action)
    ElMessage.success(`批量${actionNames[action]}成功`)
    selectedIds.value = []
    await fetchData()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="achievements-page">
    <el-breadcrumb class="achievements-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>成就系统</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="achievements-page__header">
      <h2 class="achievements-page__title">成就系统</h2>
      <p class="achievements-page__desc">管理成就配置，包括成就类别、解锁条件和奖励</p>
    </div>

    <!-- Toolbar -->
    <div class="achievements-page__toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        新增成就
      </el-button>
      <div class="achievements-page__filters">
        <span class="achievements-page__filter-label">成就类别：</span>
        <el-select v-model="filterCategory" size="small" style="width: 140px" clearable>
          <el-option label="全部" value="全部" />
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
        <span class="achievements-page__filter-label">状态：</span>
        <el-select v-model="filterStatus" size="small" style="width: 160px" multiple clearable collapse-tags>
          <el-option label="已上架" value="已上架" />
          <el-option label="已下架" value="已下架" />
          <el-option label="草稿" value="草稿" />
        </el-select>
      </div>
    </div>

    <!-- Batch bar -->
    <div v-if="selectedIds.length > 0" class="achievements-page__batch-bar">
      <span>已选 {{ selectedIds.length }} 项</span>
      <el-button size="small" type="primary" @click="handleBatchOperation('online')">批量上架</el-button>
      <el-button size="small" type="warning" @click="handleBatchOperation('offline')">批量下架</el-button>
      <el-button size="small" type="danger" @click="handleBatchOperation('delete')">批量删除</el-button>
    </div>

    <!-- Table -->
    <div v-loading="loading" class="achievements-page__table-wrap">
      <el-empty v-if="!loading && filteredList.length === 0" description="暂无成就数据" />
      <el-table
        v-else
        :data="filteredList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="成就图标" width="90" align="center">
          <template #default="{ row }">
            <div class="achievements-page__icon-wrap">
              <span v-if="row.icon" class="achievements-page__icon">{{ row.icon }}</span>
              <span v-else class="achievements-page__icon-placeholder">🏆</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成就名称" prop="name" min-width="120" />
        <el-table-column label="类别" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="解锁条件描述" prop="condition" min-width="180" />
        <el-table-column label="奖励" prop="reward" min-width="130" />
        <el-table-column label="解锁人数" width="100" align="center" prop="unlockCount" />
        <el-table-column label="解锁率" width="160">
          <template #default="{ row }">
            <div class="achievements-page__rate">
              <el-progress
                :percentage="row.unlockRate"
                :stroke-width="8"
                :color="'#D4916E'"
              />
              <span class="achievements-page__rate-text">{{ row.unlockRate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="Edit" size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button text type="danger" :icon="Delete" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <el-form-item label="成就名称">
          <el-input v-model="form.name" placeholder="请输入成就名称" />
        </el-form-item>
        <el-form-item label="成就描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入成就描述" />
        </el-form-item>
        <el-form-item label="成就图标">
          <el-upload list-type="picture-card" :auto-upload="false" :limit="1">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="成就类别">
          <el-radio-group v-model="form.category" @change="onCategoryChange">
            <el-radio v-for="cat in ACHIEVEMENT_CATEGORIES" :key="cat" :value="cat">{{ cat }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="条件类型">
          <el-select v-model="form.conditionType" style="width: 100%" placeholder="选择条件类型">
            <el-option
              v-for="ct in conditionTypeOptions"
              :key="ct"
              :label="ct"
              :value="ct"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="条件值">
          <el-input-number v-model="form.conditionValue" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="奖励类型">
          <el-radio-group v-model="form.rewardType">
            <el-radio v-for="rt in REWARD_TYPES" :key="rt" :value="rt">{{ rt }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="奖励文具">
          <el-select v-model="form.rewardStationery" style="width: 100%" placeholder="选择奖励文具" clearable>
            <el-option label="铅笔" value="铅笔" />
            <el-option label="钢笔" value="钢笔" />
            <el-option label="编程键盘" value="编程键盘" />
            <el-option label="AI芯片" value="AI芯片" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖励数量">
          <el-input-number v-model="form.rewardCount" :min="1" :max="99" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-value="已上架"
            inactive-value="草稿"
            active-text="已上架"
            inactive-text="草稿"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.achievements-page {
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
    justify-content: space-between;
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__filter-label {
    font-size: 13px;
    color: var(--app-text-secondary);
    white-space: nowrap;
    margin-left: 8px;
  }

  &__batch-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--app-primary-light);
    border: 1px solid var(--app-primary-color);
    border-radius: 8px;
    font-size: 13px;
    color: var(--app-text-primary);
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

  &__icon-wrap {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  &__icon {
    font-size: 24px;
  }

  &__icon-placeholder {
    font-size: 24px;
    opacity: 0.5;
  }

  &__rate {
    display: flex;
    align-items: center;
    gap: 8px;

    :deep(.el-progress) {
      flex: 1;
    }
  }

  &__rate-text {
    font-size: 12px;
    color: var(--app-text-secondary);
    min-width: 42px;
  }
}
</style>
