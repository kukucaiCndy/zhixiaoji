<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, Top, Bottom } from '@element-plus/icons-vue'
import { operationApi } from '@/api/modules/operation'

interface IBanner {
  id: number
  imageUrl: string
  targetType: string
  targetName: string
  sortOrder: number
  status: string
}

interface IBannerForm {
  imageUrl: string
  targetType: string
  targetId: string
  sortOrder: number
  status: string
}

const banners = ref<IBanner[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增Banner')
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const MAX_BANNER_COUNT = 5

const defaultForm: IBannerForm = {
  imageUrl: '',
  targetType: '无跳转',
  targetId: '',
  sortOrder: 1,
  status: '草稿'
}

const form = reactive<IBannerForm>({ ...defaultForm })

const uploadFileList = ref<{ name: string; url: string }[]>([])

const jumpTypeOptions = ['无跳转', '知识卡片', '章节', '每日挑战']

// 模拟跳转目标数据
const knowledgeCards = ref([
  { label: 'Python入门基础', value: 'python-basic' },
  { label: 'JavaScript核心概念', value: 'js-core' },
  { label: '数据结构与算法', value: 'dsa' }
])

const chapters = ref([
  { label: '第1章 编程起步', value: 'ch1' },
  { label: '第2章 变量与类型', value: 'ch2' },
  { label: '第3章 条件判断', value: 'ch3' }
])

const jumpTargets = ref<{ label: string; value: string }[]>([])

function updateJumpTargets() {
  switch (form.targetType) {
    case '知识卡片':
      jumpTargets.value = knowledgeCards.value
      break
    case '章节':
      jumpTargets.value = chapters.value
      break
    default:
      jumpTargets.value = []
      form.targetId = ''
      break
  }
}

function getStatusType(status: string): 'success' | 'info' | 'danger' | 'warning' {
  switch (status) {
    case '已上架': return 'success'
    case '草稿': return 'info'
    default: return 'info'
  }
}

async function fetchBanners() {
  loading.value = true
  try {
    const res = await operationApi.getBanners()
    banners.value = (res.data as IBanner[]).sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    ElMessage.error('获取Banner列表失败')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  if (banners.value.length >= MAX_BANNER_COUNT) {
    ElMessage.warning(`最多配置${MAX_BANNER_COUNT}张Banner`)
    return
  }
  dialogTitle.value = '新增Banner'
  isEditing.value = false
  editingId.value = null
  Object.assign(form, { ...defaultForm, sortOrder: banners.value.length + 1 })
  jumpTargets.value = []
  dialogVisible.value = true
}

function openEditDialog(row: IBanner) {
  dialogTitle.value = '编辑Banner'
  isEditing.value = true
  editingId.value = row.id
  form.imageUrl = row.imageUrl
  form.targetType = row.targetType
  form.targetId = ''
  form.sortOrder = row.sortOrder
  form.status = row.status
  updateJumpTargets()
  dialogVisible.value = true
}

async function handleDelete(row: IBanner) {
  try {
    await ElMessageBox.confirm(`确定要删除Banner「${row.targetName || '未命名'}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await operationApi.deleteBanner(row.id)
    ElMessage.success('Banner已删除')
    await fetchBanners()
  } catch {
    // 取消操作
  }
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value) {
      await operationApi.updateBanner(editingId.value, { ...form })
      ElMessage.success('Banner更新成功')
    } else {
      await operationApi.createBanner({ ...form })
      ElMessage.success('Banner创建成功')
    }
    dialogVisible.value = false
    await fetchBanners()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

function moveUp(index: number) {
  if (index <= 0) return
  const list = [...banners.value]
  const item = list[index]
  list.splice(index, 1)
  list.splice(index - 1, 0, item)
  list.forEach((b, i) => { b.sortOrder = i + 1 })
  banners.value = list
}

function moveDown(index: number) {
  if (index >= banners.value.length - 1) return
  const list = [...banners.value]
  const item = list[index]
  list.splice(index, 1)
  list.splice(index + 1, 0, item)
  list.forEach((b, i) => { b.sortOrder = i + 1 })
  banners.value = list
}

onMounted(() => {
  fetchBanners()
})
</script>

<template>
  <div class="banners-page">
    <!-- 面包屑 -->
    <el-breadcrumb class="banners-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>页面装饰</el-breadcrumb-item>
      <el-breadcrumb-item>Banner管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="banners-page__header">
      <h2 class="banners-page__title">Banner管理</h2>
      <p class="banners-page__desc">管理小程序首页轮播Banner，最多配置{{ MAX_BANNER_COUNT }}张</p>
    </div>

    <!-- 操作栏 -->
    <div class="banners-page__toolbar">
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">
        新增Banner
      </el-button>
      <span class="banners-page__hint">最多配置{{ MAX_BANNER_COUNT }}张Banner，建议尺寸750×300像素</span>
    </div>

    <!-- 表格 -->
    <div v-loading="loading" class="banners-page__table-wrap">
      <el-table
        :data="banners"
        style="width: 100%"
      >
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ $index }">
            <div class="banners-page__sort-handle">
              <el-button
                text
                size="small"
                :disabled="$index === 0"
                @click="moveUp($index)"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button
                text
                size="small"
                :disabled="$index === banners.length - 1"
                @click="moveDown($index)"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="排序序号" width="90" align="center">
          <template #default="{ row }">
            <span class="banners-page__sort-num">{{ row.sortOrder }}</span>
          </template>
        </el-table-column>

        <el-table-column label="图片预览" width="180">
          <template #default="{ row }">
            <div class="banners-page__thumb">
              <template v-if="row.imageUrl">
                <img :src="row.imageUrl" alt="banner" class="banners-page__thumb-img" />
              </template>
              <template v-else>
                <div class="banners-page__thumb-placeholder">
                  <span>暂无图片</span>
                </div>
              </template>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="跳转目标" min-width="200">
          <template #default="{ row }">
            <span v-if="row.targetType === '无跳转'" class="banners-page__target-none">无跳转</span>
            <span v-else>{{ row.targetType }}：{{ row.targetName }}</span>
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
    <el-empty v-if="!loading && banners.length === 0" description="暂无Banner数据" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90px" label-position="right">
        <el-form-item label="Banner图片">
          <el-upload
            :file-list="uploadFileList"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            class="banners-page__upload"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="banners-page__upload-hint">建议尺寸750×300像素，支持jpg/png格式</div>
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-radio-group v-model="form.targetType" @change="updateJumpTargets">
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
          <el-select v-model="form.targetId" placeholder="请选择跳转目标" style="width: 100%">
            <el-option
              v-for="opt in jumpTargets"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序序号">
          <el-input-number
            v-model="form.sortOrder"
            :min="1"
            :max="MAX_BANNER_COUNT"
          />
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
        <el-button type="primary" :loading="saving" @click="handleSave">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.banners-page {
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
    gap: 16px;
  }

  &__hint {
    font-size: 12px;
    color: var(--app-text-secondary);
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

  &__sort-handle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__sort-num {
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__thumb {
    width: 140px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
  }

  &__thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__thumb-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-input-bg);
    color: var(--app-text-placeholder);
    font-size: 12px;
  }

  &__target-none {
    color: var(--app-text-placeholder);
  }

  &__upload {
    :deep(.el-upload--picture-card) {
      width: 140px;
      height: 60px;
    }
  }

  &__upload-hint {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin-top: 4px;
  }
}
</style>
