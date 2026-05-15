<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, Search } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IStationery {
  id: number
  name: string
  icon: string
  rarity: string
  category: string
  story: string
  usage: string
  dropCount: number
  holderCount: number
  status: string
}

interface IDropRule {
  action: string
  normal: number
  advanced: number
  senior: number
  legendary: number
  guarantee: number
  guaranteeRarity: string
}

interface IStationeryForm {
  name: string
  icon: string
  rarity: string
  category: string
  story: string
  usage: string
  status: string
}

const RARITY_OPTIONS = ['普通', '进阶', '高级', '传说']
const CATEGORY_OPTIONS = ['装饰道具', '功能道具', '徽章道具']
const ICON_OPTIONS = ['✏️', '🖊️', '⌨️', '💾', '📎', '📐', '🎨', '🧲', '🔬', '📖', '🏆', '⭐']

const activeTab = ref('list')
const stationeryList = ref<IStationery[]>([])
const dropRules = ref<IDropRule[]>([])
const loading = ref(false)
const saving = ref(false)
const searchKeyword = ref('')

// dialog
const dialogVisible = ref(false)
const dialogTitle = ref('新增文具')
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: IStationeryForm = {
  name: '',
  icon: '✏️',
  rarity: '普通',
  category: '装饰道具',
  story: '',
  usage: '',
  status: '已上架'
}
const form = reactive<IStationeryForm>({ ...defaultForm })

// selection
const selectedIds = ref<number[]>([])
const dropRuleEditCache = ref<Record<number, IDropRule>>({})
const dropRuleEditingRows = ref<Record<number, boolean>>({})

const filteredList = ref<IStationery[]>([])

function getRarityStars(rarity: string): number {
  const map: Record<string, number> = { '普通': 1, '进阶': 2, '高级': 3, '传说': 4 }
  return map[rarity] || 1
}

function getRarityTagType(rarity: string): 'info' | 'success' | 'warning' | 'danger' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    '普通': 'info', '进阶': 'success', '高级': 'warning', '传说': 'danger'
  }
  return map[rarity] || 'info'
}

function onSearch() {
  if (!searchKeyword.value.trim()) {
    filteredList.value = [...stationeryList.value]
  } else {
    const kw = searchKeyword.value.trim().toLowerCase()
    filteredList.value = stationeryList.value.filter(
      (item) => item.name.toLowerCase().includes(kw) || item.category.includes(kw)
    )
  }
}

function handleSelectionChange(rows: IStationery[]) {
  selectedIds.value = rows.map((r) => r.id)
}

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getStationeries()
    const data = res.data as { list: IStationery[]; dropRules: IDropRule[] }
    stationeryList.value = data.list
    dropRules.value = data.dropRules
    filteredList.value = [...data.list]
  } catch {
    ElMessage.error('获取文具数据失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogTitle.value = '新增文具'
  isEditing.value = false
  editingId.value = null
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

function openEditDialog(row: IStationery) {
  dialogTitle.value = '编辑文具'
  isEditing.value = true
  editingId.value = row.id
  form.name = row.name
  form.icon = row.icon
  form.rarity = row.rarity
  form.category = row.category
  form.story = row.story
  form.usage = row.usage
  form.status = row.status
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      await operationApi.updateStationery(editingId.value, { ...form })
      ElMessage.success('文具更新成功')
    } else {
      await operationApi.createStationery({ ...form })
      ElMessage.success('文具创建成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: IStationery) {
  try {
    await ElMessageBox.confirm(`确定要删除文具「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await operationApi.deleteStationery(row.id)
    ElMessage.success('文具已删除')
    await fetchData()
  } catch {
    // cancelled
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的文具')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedIds.value.length}件文具吗？`, '批量删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await operationApi.batchDeleteStationery(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    await fetchData()
  } catch {
    // cancelled
  }
}

// drop rules
function startDropRuleEdit(index: number) {
  dropRuleEditCache.value[index] = { ...dropRules.value[index] }
  dropRuleEditingRows.value[index] = true
}

function cancelDropRuleEdit(index: number) {
  if (dropRuleEditCache.value[index]) {
    dropRules.value[index] = { ...dropRuleEditCache.value[index] }
    delete dropRuleEditCache.value[index]
  }
  dropRuleEditingRows.value[index] = false
}

async function handleSaveDropRules() {
  saving.value = true
  try {
    await operationApi.updateDropRules(dropRules.value as unknown as Record<string, unknown>[])
    ElMessage.success('掉落规则已保存')
    dropRuleEditingRows.value = {}
    dropRuleEditCache.value = {}
  } catch {
    ElMessage.error('保存掉落规则失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="stationery-page">
    <el-breadcrumb class="stationery-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>文具管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="stationery-page__header">
      <h2 class="stationery-page__title">文具管理</h2>
      <p class="stationery-page__desc">管理文具库和掉落规则配置</p>
    </div>

    <el-tabs v-model="activeTab" class="stationery-page__tabs">
      <el-tab-pane label="文具列表" name="list">
        <div class="stationery-page__toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索文具名称或类别"
            :prefix-icon="Search"
            style="width: 260px"
            clearable
            @input="onSearch"
            @clear="onSearch"
          />
          <div class="stationery-page__toolbar-right">
            <el-button
              v-if="selectedIds.length > 0"
              type="danger"
              :icon="Delete"
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedIds.length }})
            </el-button>
            <el-button type="primary" :icon="Plus" @click="openCreateDialog">
              新增文具
            </el-button>
          </div>
        </div>

        <div v-loading="loading" class="stationery-page__table-wrap">
          <el-empty v-if="!loading && filteredList.length === 0" description="暂无文具数据" />
          <el-table
            v-else
            :data="filteredList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="文具图标" width="90" align="center">
              <template #default="{ row }">
                <span class="stationery-page__icon">{{ row.icon }}</span>
              </template>
            </el-table-column>
            <el-table-column label="文具名称" prop="name" min-width="120" />
            <el-table-column label="稀有度" width="120" align="center">
              <template #default="{ row }">
                <div class="stationery-page__rarity">
                  <span class="stationery-page__stars">{{ '⭐'.repeat(getRarityStars(row.rarity)) }}</span>
                  <el-tag :type="getRarityTagType(row.rarity)" size="small">{{ row.rarity }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="类别" width="100" align="center" prop="category" />
            <el-table-column label="故事背景" min-width="160">
              <template #default="{ row }">
                <span class="stationery-page__story">{{ row.story || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="掉落次数" width="100" align="center" prop="dropCount">
              <template #default="{ row }">
                {{ row.dropCount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="持有用户数" width="110" align="center" prop="holderCount">
              <template #default="{ row }">
                {{ row.holderCount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上架' ? 'success' : 'info'" size="small">
                  {{ row.status }}
                </el-tag>
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
      </el-tab-pane>

      <el-tab-pane label="掉落规则配置" name="drop">
        <div v-loading="loading" class="stationery-page__table-wrap">
          <el-empty v-if="!loading && dropRules.length === 0" description="暂无掉落规则数据" />
          <el-table v-else :data="dropRules" style="width: 100%">
            <el-table-column label="行为" prop="action" min-width="140" />
            <el-table-column label="普通%" width="100" align="center">
              <template #default="{ row, $index }">
                <template v-if="dropRuleEditingRows[$index]">
                  <el-input-number v-model="row.normal" :min="0" :max="100" size="small" controls-position="right" style="width: 90px" />
                </template>
                <template v-else>{{ row.normal }}%</template>
              </template>
            </el-table-column>
            <el-table-column label="进阶%" width="100" align="center">
              <template #default="{ row, $index }">
                <template v-if="dropRuleEditingRows[$index]">
                  <el-input-number v-model="row.advanced" :min="0" :max="100" size="small" controls-position="right" style="width: 90px" />
                </template>
                <template v-else>{{ row.advanced }}%</template>
              </template>
            </el-table-column>
            <el-table-column label="高级%" width="100" align="center">
              <template #default="{ row, $index }">
                <template v-if="dropRuleEditingRows[$index]">
                  <el-input-number v-model="row.senior" :min="0" :max="100" size="small" controls-position="right" style="width: 90px" />
                </template>
                <template v-else>{{ row.senior }}%</template>
              </template>
            </el-table-column>
            <el-table-column label="传说%" width="100" align="center">
              <template #default="{ row, $index }">
                <template v-if="dropRuleEditingRows[$index]">
                  <el-input-number v-model="row.legendary" :min="0" :max="100" size="small" controls-position="right" style="width: 90px" />
                </template>
                <template v-else>{{ row.legendary }}%</template>
              </template>
            </el-table-column>
            <el-table-column label="保底次数" width="100" align="center">
              <template #default="{ row, $index }">
                <template v-if="dropRuleEditingRows[$index]">
                  <el-input-number v-model="row.guarantee" :min="0" :max="999" size="small" controls-position="right" style="width: 90px" />
                </template>
                <template v-else>{{ row.guarantee }}</template>
              </template>
            </el-table-column>
            <el-table-column label="保底奖励" prop="guaranteeRarity" min-width="130" />
            <el-table-column label="操作" width="140" align="center" fixed="right">
              <template #default="{ $index }">
                <template v-if="dropRuleEditingRows[$index]">
                  <el-button type="primary" size="small" @click="dropRuleEditingRows[$index] = false">
                    完成
                  </el-button>
                  <el-button size="small" @click="cancelDropRuleEdit($index)">
                    取消
                  </el-button>
                </template>
                <template v-else>
                  <el-button text type="primary" :icon="Edit" size="small" @click="startDropRuleEdit($index)">
                    编辑
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="dropRules.length > 0" class="stationery-page__save-bar">
            <el-button type="primary" :loading="saving" @click="handleSaveDropRules">
              保存全部掉落规则
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90px" label-position="right">
        <el-form-item label="文具名称">
          <el-input v-model="form.name" placeholder="请输入文具名称" />
        </el-form-item>
        <el-form-item label="文具图标">
          <div class="stationery-page__icon-selector">
            <span
              v-for="icon in ICON_OPTIONS"
              :key="icon"
              class="stationery-page__icon-option"
              :class="{ 'stationery-page__icon-option--active': form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="稀有度">
          <el-radio-group v-model="form.rarity">
            <el-radio v-for="r in RARITY_OPTIONS" :key="r" :value="r">{{ r }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类别">
          <el-radio-group v-model="form.category">
            <el-radio v-for="c in CATEGORY_OPTIONS" :key="c" :value="c">{{ c }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="故事背景">
          <el-input v-model="form.story" type="textarea" :rows="3" placeholder="请输入故事背景" />
        </el-form-item>
        <el-form-item label="用途说明">
          <el-input v-model="form.usage" type="textarea" :rows="3" placeholder="请输入用途说明" />
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
.stationery-page {
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

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
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

  &__icon {
    font-size: 24px;
  }

  &__rarity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  &__stars {
    font-size: 11px;
    letter-spacing: 2px;
  }

  &__story {
    color: var(--app-text-secondary);
    font-size: 13px;
  }

  &__save-bar {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--app-border-light);
  }

  &__icon-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__icon-option {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--app-border-color);
    border-radius: 8px;
    font-size: 22px;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--app-bg-card);

    &:hover {
      border-color: var(--app-primary-color);
      background: var(--app-primary-light);
    }

    &--active {
      border-color: var(--app-primary-color);
      background: var(--app-primary-light);
    }
  }
}
</style>
