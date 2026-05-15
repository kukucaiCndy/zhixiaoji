<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface ILimitedItem {
  id: number
  name: string
  icon: string
  rarity: string
  type: string
  effect: string
  inviteMilestone: string
  holderCount: number
  status: string
}

interface IItemForm {
  name: string
  icon: string
  rarity: string
  type: string
  effect: string
  inviteMilestone: number
  inviteMilestoneText: string
  status: string
}

const RARITY_OPTIONS = ['⭐⭐⭐⭐', '⭐⭐⭐⭐⭐', '⭐⭐⭐⭐⭐⭐']
const TYPE_OPTIONS = ['装饰道具', '功能道具', '徽章道具']
const ICON_OPTIONS = ['🖊️', '🏅', '🎖️', '💎', '👑', '🔮', '⭐', '🌟', '🎁', '🏆']

const items = ref<ILimitedItem[]>([])
const loading = ref(false)
const saving = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('新增限定道具')
const isEditing = ref(false)
const editingId = ref<number | null>(null)

const defaultForm: IItemForm = {
  name: '',
  icon: '🖊️',
  rarity: '⭐⭐⭐⭐',
  type: '装饰道具',
  effect: '',
  inviteMilestone: 1,
  inviteMilestoneText: '首次邀请',
  status: '已上架'
}
const form = reactive<IItemForm>({ ...defaultForm })

function getRarityStars(rarity: string): number {
  return rarity === '⭐⭐⭐⭐⭐⭐' ? 6 : rarity === '⭐⭐⭐⭐⭐' ? 5 : 4
}

function getRarityLabel(rarity: string): string {
  return rarity === '⭐⭐⭐⭐⭐⭐' ? '6星' : rarity === '⭐⭐⭐⭐⭐' ? '5星' : '4星'
}

function getStatusTagType(status: string): 'success' | 'info' {
  return status === '已上架' ? 'success' : 'info'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getLimitedItems()
    items.value = res.data as ILimitedItem[]
  } catch {
    ElMessage.error('获取限定道具数据失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  dialogTitle.value = '新增限定道具'
  isEditing.value = false
  editingId.value = null
  Object.assign(form, { ...defaultForm })
  dialogVisible.value = true
}

function openEditDialog(item: ILimitedItem) {
  dialogTitle.value = '编辑限定道具'
  isEditing.value = true
  editingId.value = item.id
  form.name = item.name
  form.icon = item.icon
  form.rarity = item.rarity
  form.type = item.type
  form.effect = item.effect
  form.inviteMilestoneText = item.inviteMilestone
  form.inviteMilestone = 1
  form.status = item.status
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      await operationApi.updateLimitedItem(editingId.value, { ...form })
      ElMessage.success('限定道具更新成功')
    } else {
      await operationApi.createLimitedItem({ ...form })
      ElMessage.success('限定道具创建成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(item: ILimitedItem) {
  try {
    await ElMessageBox.confirm(`确定要删除限定道具「${item.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await operationApi.deleteLimitedItem(item.id)
    ElMessage.success('限定道具已删除')
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
  <div class="limited-items-page">
    <el-breadcrumb class="limited-items-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>限定道具</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="limited-items-page__header">
      <h2 class="limited-items-page__title">限定道具</h2>
      <p class="limited-items-page__desc">管理邀请好友获得的限定道具配置</p>
    </div>

    <div class="limited-items-page__toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        新增限定道具
      </el-button>
    </div>

    <div v-loading="loading" class="limited-items-page__grid">
      <el-empty v-if="!loading && items.length === 0" description="暂无限定道具数据" />
      <div v-else class="limited-items-page__grid-inner">
        <div
          v-for="item in items"
          :key="item.id"
          class="limited-items-page__card"
        >
          <div class="limited-items-page__card-head">
            <div class="limited-items-page__card-icon">{{ item.icon }}</div>
            <div class="limited-items-page__card-head-info">
              <div class="limited-items-page__card-name-row">
                <span class="limited-items-page__card-name">{{ item.name }}</span>
                <el-tag :type="getStatusTagType(item.status)" size="small">
                  {{ item.status }}
                </el-tag>
              </div>
              <div class="limited-items-page__card-rarity-row">
                <span class="limited-items-page__stars">{{ item.rarity }}</span>
                <span class="limited-items-page__rarity-label">{{ getRarityLabel(item.rarity) }}</span>
              </div>
            </div>
          </div>

          <div class="limited-items-page__card-body">
            <div class="limited-items-page__card-field">
              <span class="limited-items-page__card-field-label">类型</span>
              <span>{{ item.type }}</span>
            </div>
            <div class="limited-items-page__card-field">
              <span class="limited-items-page__card-field-label">效果/用途</span>
              <span class="limited-items-page__card-effect">{{ item.effect }}</span>
            </div>
            <div class="limited-items-page__card-field">
              <span class="limited-items-page__card-field-label">邀请里程碑</span>
              <span>{{ item.inviteMilestone }}</span>
            </div>
            <div class="limited-items-page__card-field">
              <span class="limited-items-page__card-field-label">持有用户</span>
              <span>{{ item.holderCount.toLocaleString() }} 人</span>
            </div>
          </div>

          <div class="limited-items-page__card-footer">
            <el-button :icon="Edit" size="small" @click="openEditDialog(item)">
              编辑
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <el-form-item label="道具名称">
          <el-input v-model="form.name" placeholder="请输入道具名称" />
        </el-form-item>
        <el-form-item label="道具图标">
          <div class="limited-items-page__icon-selector">
            <span
              v-for="icon in ICON_OPTIONS"
              :key="icon"
              class="limited-items-page__icon-option"
              :class="{ 'limited-items-page__icon-option--active': form.icon === icon }"
              @click="form.icon = icon"
            >
              {{ icon }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="稀有度">
          <el-radio-group v-model="form.rarity">
            <el-radio
              v-for="r in RARITY_OPTIONS"
              :key="r"
              :value="r"
            >
              {{ r }} {{ getRarityLabel(r) }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="道具类型">
          <el-radio-group v-model="form.type">
            <el-radio v-for="t in TYPE_OPTIONS" :key="t" :value="t">{{ t }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="效果/用途">
          <el-input v-model="form.effect" type="textarea" :rows="3" placeholder="请输入效果或用途描述" />
        </el-form-item>
        <el-form-item label="邀请里程碑">
          <div class="limited-items-page__milestone">
            <el-input-number
              v-model="form.inviteMilestone"
              :min="1"
              :max="99"
              size="small"
              style="width: 120px"
            />
            <span class="limited-items-page__milestone-hint">
              累计邀请 {{ form.inviteMilestone }} 人时获得
            </span>
          </div>
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
.limited-items-page {
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

  &__grid {
    min-height: 200px;
  }

  &__grid-inner {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }
  }

  &__card-head {
    display: flex;
    gap: 12px;
  }

  &__card-icon {
    font-size: 40px;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-primary-light);
    border-radius: 12px;
    flex-shrink: 0;
  }

  &__card-head-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  &__card-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__card-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__card-rarity-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__stars {
    font-size: 12px;
  }

  &__rarity-label {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__card-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__card-field {
    display: flex;
    gap: 8px;
    font-size: 13px;
    color: var(--app-text-regular);
  }

  &__card-field-label {
    font-weight: 500;
    color: var(--app-text-secondary);
    min-width: 70px;
    flex-shrink: 0;
  }

  &__card-effect {
    flex: 1;
  }

  &__card-footer {
    padding-top: 12px;
    border-top: 1px solid var(--app-border-light);
    display: flex;
    justify-content: flex-end;
  }

  &__icon-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__icon-option {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--app-border-color);
    border-radius: 8px;
    font-size: 24px;
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

  &__milestone {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__milestone-hint {
    font-size: 13px;
    color: var(--app-text-secondary);
  }
}
</style>
