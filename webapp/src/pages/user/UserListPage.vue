<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshRight, Download, View } from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'

interface IUserItem {
  id: number | string
  nickname: string
  avatar: string
  level: number
  levelTitle: string
  registerTime: string
  lastActiveTime: string
  cardCount: number
  points: number
  stationeryCount: number
  status: string
}

const router = useRouter()

const userList = ref<IUserItem[]>([])
const tableLoading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selectedIds = ref<(number | string)[]>([])

const searchUserId = ref('')
const searchNickname = ref('')
const filterLevel = ref<number[]>([])
const filterStatus = ref('')

const hasSelection = computed(() => selectedIds.value.length > 0)

const levelOptions = Array.from({ length: 10 }, (_, i) => ({ label: `Lv.${i + 1}`, value: i + 1 }))

const statusOptions = [
  { label: '正常', value: '正常' },
  { label: '已禁用', value: '已禁用' }
]

function getLevelBadgeClass(level: number): string {
  if (level >= 8) return 'user-list-page__level-badge--gold'
  if (level >= 5) return 'user-list-page__level-badge--silver'
  if (level >= 3) return 'user-list-page__level-badge--bronze'
  return ''
}

function getStatusTagType(status: string) {
  return status === '正常' ? 'success' : 'danger'
}

function formatId(id: number | string): string {
  if (typeof id === 'number') return String(id)
  return id.slice(-8)
}

function formatTime(time: string): string {
  if (!time) return '-'
  const d = new Date(time)
  if (isNaN(d.getTime())) return time.slice(0, 10)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function fetchUsers() {
  tableLoading.value = true
  try {
    const params: Record<string, unknown> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (searchUserId.value) {
      params.userId = searchUserId.value
    }
    if (searchNickname.value) {
      params.nickname = searchNickname.value
    }
    if (filterLevel.value.length > 0) {
      params.level = filterLevel.value[0]
    }
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    const res = await userApi.getUsers(params as {
      page: number
      pageSize: number
      nickname?: string
      level?: number
      status?: string
    })
    if (res.code === 0) {
      const data = res.data as { list: IUserItem[]; total: number }
      userList.value = data.list
      total.value = data.total
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch {
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchUsers()
}

function handleReset() {
  searchUserId.value = ''
  searchNickname.value = ''
  filterLevel.value = []
  filterStatus.value = ''
  page.value = 1
  fetchUsers()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  fetchUsers()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchUsers()
}

function handleSelectionChange(selection: IUserItem[]) {
  selectedIds.value = selection.map((item) => item.id)
}

function handleViewDetail(row: IUserItem) {
  router.push({ path: `/user/${row.id}/detail`, state: { user: JSON.parse(JSON.stringify(row)) } })
}

function handleRowClick(row: IUserItem) {
  router.push({ path: `/user/${row.id}/detail`, state: { user: JSON.parse(JSON.stringify(row)) } })
}

async function handleDisableUser(row: IUserItem) {
  try {
    await ElMessageBox.prompt(
      `确定禁用用户「${row.nickname}」吗？禁用后该用户将无法使用小程序。`,
      '禁用用户确认',
      {
        confirmButtonText: '确认禁用',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '请输入"确认禁用"以继续',
        inputValidator: (value: string) => {
          if (value !== '确认禁用') {
            return '请输入"确认禁用"以确认操作'
          }
          return true
        }
      }
    )
    const res = await userApi.updateUserStatus(row.id, '已禁用')
    if (res.code === 0) {
      ElMessage.success('用户已禁用')
      fetchUsers()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleEnableUser(row: IUserItem) {
  try {
    await ElMessageBox.confirm(
      `确定要启用用户「${row.nickname}」吗？启用后该用户将恢复小程序使用权限。`,
      '启用用户确认',
      {
        confirmButtonText: '确认启用',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    const res = await userApi.updateUserStatus(row.id, '正常')
    if (res.code === 0) {
      ElMessage.success('用户已启用')
      fetchUsers()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleBatchDisable() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量禁用选中的 ${selectedIds.value.length} 名用户吗？禁用后这些用户将无法使用小程序。`,
      '批量禁用确认',
      {
        confirmButtonText: '确认禁用',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await userApi.batchUpdateStatus(selectedIds.value, '已禁用')
    if (res.code === 0) {
      ElMessage.success('批量禁用成功')
      selectedIds.value = []
      fetchUsers()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleBatchEnable() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量启用选中的 ${selectedIds.value.length} 名用户吗？启用后将恢复小程序使用权限。`,
      '批量启用确认',
      {
        confirmButtonText: '确认启用',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    const res = await userApi.batchUpdateStatus(selectedIds.value, '正常')
    if (res.code === 0) {
      ElMessage.success('批量启用成功')
      selectedIds.value = []
      fetchUsers()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    // user cancelled
  }
}

function handleBatchExport() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  ElMessage.info(`正在导出 ${selectedIds.value.length} 名用户数据...`)
}

function getDefaultAvatar(nickname: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' rx='20' fill='%23D4916E'%3E%3C/rect%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-family='sans-serif'%3E${encodeURIComponent(nickname.charAt(0))}%3C/text%3E%3C/svg%3E`
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="user-list-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="user-list-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <div class="user-list-page__top-bar">
      <h2 class="user-list-page__title">用户列表</h2>
    </div>

    <!-- Filter Card -->
    <div class="user-list-page__filter-card">
      <div class="user-list-page__filter-row">
        <el-input
          v-model="searchUserId"
          placeholder="用户ID"
          clearable
          class="user-list-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-input
          v-model="searchNickname"
          placeholder="昵称搜索"
          :prefix-icon="Search"
          clearable
          class="user-list-page__filter-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="filterLevel"
          placeholder="等级"
          clearable
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          class="user-list-page__filter-select"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in levelOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="filterStatus"
          placeholder="状态"
          clearable
          class="user-list-page__filter-select user-list-page__filter-select--small"
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
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="hasSelection" class="user-list-page__batch-bar">
      <span class="user-list-page__batch-info">已选 {{ selectedIds.length }} 项</span>
      <el-button @click="handleBatchDisable">批量禁用</el-button>
      <el-button @click="handleBatchEnable">批量启用</el-button>
      <el-button :icon="Download" plain @click="handleBatchExport">导出用户</el-button>
    </div>

    <!-- Table -->
    <div class="user-list-page__table-card">
      <el-table
        v-loading="tableLoading"
        :data="userList"
        row-key="id"
        class="user-list-page__table"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="50" />

        <el-table-column label="用户ID" width="100" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <span :title="String(row.id)">{{ formatId(row.id) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="头像" width="70" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <el-avatar
              :size="36"
              :src="row.avatar || getDefaultAvatar(row.nickname)"
              class="user-list-page__avatar"
            />
          </template>
        </el-table-column>

        <el-table-column prop="nickname" label="昵称" min-width="130" show-overflow-tooltip />

        <el-table-column label="注册时间" width="150" align="center">
          <template #default="{ row }: { row: IUserItem }">
            {{ formatTime(row.registerTime) }}
          </template>
        </el-table-column>

        <el-table-column label="最后活跃时间" width="150" align="center">
          <template #default="{ row }: { row: IUserItem }">
            {{ formatTime(row.lastActiveTime) }}
          </template>
        </el-table-column>

        <el-table-column label="学习卡片数" width="110" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <span class="user-list-page__stat-number">{{ row.cardCount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="当前等级" width="120" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <div
              class="user-list-page__level-badge"
              :class="getLevelBadgeClass(row.level)"
            >
              Lv.{{ row.level }} {{ row.levelTitle }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="积分余额" width="100" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <span class="user-list-page__stat-number">{{ row.points.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column label="文具数量" width="90" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <span class="user-list-page__stat-number">{{ row.stationeryCount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }: { row: IUserItem }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }: { row: IUserItem }">
            <div class="user-list-page__actions">
              <el-button link type="primary" size="small" :icon="View" @click.stop="handleViewDetail(row)">
                查看详情
              </el-button>
              <template v-if="row.status === '正常'">
                <el-button link type="danger" size="small" @click.stop="handleDisableUser(row)">
                  禁用
                </el-button>
              </template>
              <template v-else>
                <el-button link type="success" size="small" @click.stop="handleEnableUser(row)">
                  启用
                </el-button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!tableLoading && userList.length === 0" class="user-list-page__empty">
        <div class="user-list-page__empty-icon">
          <el-icon :size="48" color="#DAD0C0"><svg viewBox="0 0 1024 1024"><path d="M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z" fill="#F5EDE3"/></svg></el-icon>
        </div>
        <p class="user-list-page__empty-text">暂无用户数据</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="user-list-page__pagination">
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
  </div>
</template>

<style scoped lang="scss">
.user-list-page {
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

  // Filter
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
    width: 180px;
  }

  &__filter-select {
    width: 160px;

    &--small {
      width: 120px;
    }
  }

  // Batch Bar
  &__batch-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: var(--app-primary-light);
    border: 1px solid var(--app-primary-color);
    border-radius: 10px;
  }

  &__batch-info {
    font-size: 14px;
    color: var(--app-primary-color);
    font-weight: 500;
    margin-right: 8px;
  }

  // Table
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
        cursor: pointer;

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

  &__avatar {
    flex-shrink: 0;
  }

  &__stat-number {
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__level-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--app-info-color);

    &--gold {
      background: linear-gradient(135deg, #D4916E, #E8B84B);
    }

    &--silver {
      background: linear-gradient(135deg, #A8A8A8, #C0C0C0);
    }

    &--bronze {
      background: linear-gradient(135deg, #C4726F, #D4916E);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
    flex-wrap: wrap;
  }

  // Empty State
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

  // Pagination
  &__pagination {
    display: flex;
    justify-content: flex-end;

    :deep(.el-pagination) {
      --el-pagination-bg-color: var(--app-bg-card);
      --el-pagination-button-bg-color: var(--app-bg-card);
    }
  }
}
</style>
