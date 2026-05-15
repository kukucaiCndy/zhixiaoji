<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Coin, WarningFilled } from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'

interface IUserDetail {
  id: number
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
  studyDays: number
  totalAnswers: number
  correctRate: number
  streakDays: number
  inviteCount: number
  deviceInfo: string
}

interface IStudyRecord {
  id: number
  studyTime: string
  cardName: string
  chapterName: string
  status: string
  duration: number
}

interface IPointsRecord {
  id: number
  time: string
  action: string
  pointsChange: number
  balance: number
}

interface IStationeryItem {
  id: number
  name: string
  icon: string
  rarity: number
  quantity: number
}

interface ILevelRecord {
  id: number
  time: string
  fromLevel: number
  fromTitle: string
  toLevel: number
  toTitle: string
  reason: string
}

const router = useRouter()
const route = useRoute()

const userId = Number(route.params.id)

const userDetail = ref<IUserDetail | null>(null)
const detailLoading = ref(false)
const activeTab = ref('basic')

const studyRecords = ref<IStudyRecord[]>([])
const pointsRecords = ref<IPointsRecord[]>([])
const stationeryItems = ref<IStationeryItem[]>([])
const levelRecords = ref<ILevelRecord[]>([])

const tabLoading = ref(false)

const studyTimeRange = ref<[string, string] | []>([])
const pointsTimeRange = ref<[string, string] | []>([])
const pointsActionFilter = ref('')

const pointsDialogVisible = ref(false)
const pointsForm = ref({
  type: '补发积分',
  amount: 100,
  reason: ''
})
const pointsSubmitting = ref(false)

const pointsChangeConfirmVisible = ref(false)

function getLevelBadgeClass(level: number): string {
  if (level >= 8) return 'user-detail-page__level-badge--gold'
  if (level >= 5) return 'user-detail-page__level-badge--silver'
  if (level >= 3) return 'user-detail-page__level-badge--bronze'
  return ''
}

function getStatusTagType(status: string) {
  return status === '正常' ? 'success' : 'danger'
}

function getStudyStatusTagType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  switch (status) {
    case '已完成': return 'success'
    case '学习中': return 'warning'
    case '未开始': return 'info'
    default: return 'info'
  }
}

async function fetchUserDetail() {
  detailLoading.value = true
  try {
    const res = await userApi.getUserDetail(userId)
    if (res.code === 0) {
      userDetail.value = res.data as IUserDetail
    } else {
      ElMessage.error(res.message || '获取用户详情失败')
      router.back()
    }
  } catch {
    ElMessage.error('获取用户详情失败，请稍后重试')
  } finally {
    detailLoading.value = false
  }
}

function handleBack() {
  router.push('/user/list')
}

function handleTabChange(tabName: string | number) {
  const tab = String(tabName)
  activeTab.value = tab
  switch (tab) {
    case 'study': fetchStudyRecords()
      break
    case 'points': fetchPointsRecords()
      break
    case 'stationery': fetchStationeryItems()
      break
    case 'level': fetchLevelRecords()
      break
  }
}

async function fetchStudyRecords() {
  tabLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    studyRecords.value = [
      { id: 1, studyTime: '2026-05-13 10:30', cardName: 'Python变量与数据类型', chapterName: 'Python基础', status: '已完成', duration: 15 },
      { id: 2, studyTime: '2026-05-13 09:15', cardName: 'Python条件判断', chapterName: 'Python基础', status: '已完成', duration: 12 },
      { id: 3, studyTime: '2026-05-12 20:00', cardName: '数组排序算法', chapterName: '算法入门', status: '学习中', duration: 8 },
      { id: 4, studyTime: '2026-05-12 16:30', cardName: 'JavaScript变量作用域', chapterName: 'JavaScript基础', status: '已完成', duration: 10 },
      { id: 5, studyTime: '2026-05-11 14:00', cardName: '循环结构深入', chapterName: 'Python基础', status: '已完成', duration: 20 }
    ]
  } finally {
    tabLoading.value = false
  }
}

async function fetchPointsRecords() {
  tabLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    pointsRecords.value = [
      { id: 1, time: '2026-05-13 10:30', action: '完成学习', pointsChange: 10, balance: 1580 },
      { id: 2, time: '2026-05-13 09:15', action: '完成答题', pointsChange: 5, balance: 1570 },
      { id: 3, time: '2026-05-12 20:00', action: '连续打卡', pointsChange: 20, balance: 1565 },
      { id: 4, time: '2026-05-12 16:30', action: '兑换文具', pointsChange: -50, balance: 1545 },
      { id: 5, time: '2026-05-11 14:00', action: '完成学习', pointsChange: 10, balance: 1595 }
    ]
  } finally {
    tabLoading.value = false
  }
}

async function fetchStationeryItems() {
  tabLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    stationeryItems.value = [
      { id: 1, name: '代码笔记本', icon: '📓', rarity: 1, quantity: 3 },
      { id: 2, name: '金色钢笔', icon: '🖊️', rarity: 3, quantity: 1 },
      { id: 3, name: '橡皮擦', icon: '🧹', rarity: 1, quantity: 5 },
      { id: 4, name: '键盘贴纸', icon: '⌨️', rarity: 2, quantity: 2 },
      { id: 5, name: '程序员马克杯', icon: '☕', rarity: 4, quantity: 1 },
      { id: 6, name: '书签', icon: '🔖', rarity: 1, quantity: 8 },
      { id: 7, name: '限定鼠标垫', icon: '🖱️', rarity: 5, quantity: 0 }
    ]
  } finally {
    tabLoading.value = false
  }
}

async function fetchLevelRecords() {
  tabLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    levelRecords.value = [
      { id: 1, time: '2026-05-10', fromLevel: 4, fromTitle: '算法新手', toLevel: 5, toTitle: '程序达人', reason: '累计学习卡片数达到200张' },
      { id: 2, time: '2026-04-20', fromLevel: 3, fromTitle: '逻辑思考者', toLevel: 4, toTitle: '算法新手', reason: '累计积分达到1000分' },
      { id: 3, time: '2026-04-05', fromLevel: 2, fromTitle: '代码学徒', toLevel: 3, toTitle: '逻辑思考者', reason: '连续打卡30天' },
      { id: 4, time: '2026-03-20', fromLevel: 1, fromTitle: '编程小白', toLevel: 2, toTitle: '代码学徒', reason: '完成新手引导' }
    ]
  } finally {
    tabLoading.value = false
  }
}

function openPointsDialog() {
  pointsForm.value = { type: '补发积分', amount: 100, reason: '' }
  pointsDialogVisible.value = true
}

async function handlePointsAdjust() {
  if (!userDetail.value) return
  if (pointsForm.value.amount < 1 || pointsForm.value.amount > 10000) {
    ElMessage.warning('调整数量应在1到10000之间')
    return
  }
  if (!pointsForm.value.reason.trim()) {
    ElMessage.warning('请填写调整原因')
    return
  }
  pointsChangeConfirmVisible.value = true
}

async function confirmPointsAdjust() {
  if (!userDetail.value) return
  pointsSubmitting.value = true
  try {
    const res = await userApi.adjustPoints({
      userId: userDetail.value.id,
      type: pointsForm.value.type,
      amount: pointsForm.value.type === '扣除积分' ? -pointsForm.value.amount : pointsForm.value.amount,
      reason: pointsForm.value.reason
    })
    if (res.code === 0) {
      ElMessage.success('积分调整成功')
      pointsDialogVisible.value = false
      pointsChangeConfirmVisible.value = false
      fetchUserDetail()
      if (activeTab.value === 'points') fetchPointsRecords()
    } else {
      ElMessage.error(res.message || '积分调整失败')
    }
  } catch {
    ElMessage.error('积分调整失败，请稍后重试')
  } finally {
    pointsSubmitting.value = false
  }
}

async function handleDisableUser() {
  if (!userDetail.value) return
  try {
    await ElMessageBox.prompt(
      `确定禁用用户「${userDetail.value.nickname}」吗？禁用后该用户将无法使用小程序。`,
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
    const res = await userApi.updateUserStatus(userDetail.value.id, '已禁用')
    if (res.code === 0) {
      ElMessage.success('用户已禁用')
      fetchUserDetail()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    // user cancelled
  }
}

async function handleEnableUser() {
  if (!userDetail.value) return
  try {
    await ElMessageBox.confirm(
      `确定要启用用户「${userDetail.value.nickname}」吗？`,
      '启用用户确认',
      {
        confirmButtonText: '确认启用',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    const res = await userApi.updateUserStatus(userDetail.value.id, '正常')
    if (res.code === 0) {
      ElMessage.success('用户已启用')
      fetchUserDetail()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    // user cancelled
  }
}

function getDefaultAvatar(nickname: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='40' fill='%23D4916E'%3E%3C/rect%3E%3Ctext x='40' y='52' text-anchor='middle' fill='white' font-size='32' font-family='sans-serif'%3E${encodeURIComponent(nickname.charAt(0))}%3C/text%3E%3C/svg%3E`
}

function getRarityStars(rarity: number): string {
  return '★'.repeat(rarity) + '☆'.repeat(5 - rarity)
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`
}

onMounted(() => {
  fetchUserDetail()
})
</script>

<template>
  <div class="user-detail-page" v-loading="detailLoading">
    <!-- Breadcrumb -->
    <el-breadcrumb class="user-detail-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/user/list' }">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      <el-breadcrumb-item>{{ userDetail?.nickname || '用户详情' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Back Button -->
    <div class="user-detail-page__top-bar">
      <el-button :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
    </div>

    <template v-if="userDetail">
      <!-- User Info Card -->
      <div class="user-detail-page__info-card">
        <div class="user-detail-page__info-main">
          <el-avatar
            :size="72"
            :src="userDetail.avatar || getDefaultAvatar(userDetail.nickname)"
            class="user-detail-page__info-avatar"
          />
          <div class="user-detail-page__info-text">
            <div class="user-detail-page__info-header">
              <span class="user-detail-page__info-nickname">{{ userDetail.nickname }}</span>
              <div
                class="user-detail-page__level-badge"
                :class="getLevelBadgeClass(userDetail.level)"
              >
                Lv.{{ userDetail.level }} {{ userDetail.levelTitle }}
              </div>
              <el-tag :type="getStatusTagType(userDetail.status)" size="small" class="user-detail-page__info-status">
                {{ userDetail.status }}
              </el-tag>
            </div>
            <div class="user-detail-page__info-meta">
              <span>用户ID: {{ userDetail.id }}</span>
              <span class="user-detail-page__info-divider">|</span>
              <span>注册时间: {{ userDetail.registerTime }}</span>
              <span class="user-detail-page__info-divider">|</span>
              <span>最后活跃: {{ userDetail.lastActiveTime }}</span>
              <span class="user-detail-page__info-divider">|</span>
              <span>积分余额: <strong>{{ userDetail.points.toLocaleString() }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="user-detail-page__tabs-card">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- Basic Info Tab -->
          <el-tab-pane label="基本信息" name="basic">
            <div class="user-detail-page__basic-grid">
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">微信昵称</span>
                <span class="user-detail-page__basic-value">{{ userDetail.nickname }}</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">头像</span>
                <span class="user-detail-page__basic-value">
                  <el-avatar :size="40" :src="userDetail.avatar || getDefaultAvatar(userDetail.nickname)" />
                </span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">注册时间</span>
                <span class="user-detail-page__basic-value">{{ userDetail.registerTime }}</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">最近活跃时间</span>
                <span class="user-detail-page__basic-value">{{ userDetail.lastActiveTime }}</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">当前等级</span>
                <span class="user-detail-page__basic-value">
                  <span class="user-detail-page__level-badge" :class="getLevelBadgeClass(userDetail.level)">
                    Lv.{{ userDetail.level }} {{ userDetail.levelTitle }}
                  </span>
                </span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">积分余额</span>
                <span class="user-detail-page__basic-value user-detail-page__basic-value--highlight">
                  {{ userDetail.points.toLocaleString() }}
                </span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">文具数量</span>
                <span class="user-detail-page__basic-value">{{ userDetail.stationeryCount }}</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">累计学习卡片数</span>
                <span class="user-detail-page__basic-value">{{ userDetail.cardCount }}</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">累计答题数</span>
                <span class="user-detail-page__basic-value">{{ userDetail.totalAnswers }}</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">答题正确率</span>
                <span class="user-detail-page__basic-value">{{ userDetail.correctRate }}%</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">连续打卡天数</span>
                <span class="user-detail-page__basic-value">{{ userDetail.streakDays }} 天</span>
              </div>
              <div class="user-detail-page__basic-item">
                <span class="user-detail-page__basic-label">被邀请人数量</span>
                <span class="user-detail-page__basic-value">{{ userDetail.inviteCount }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="user-detail-page__basic-actions">
              <el-button type="primary" :icon="Coin" @click="openPointsDialog">
                积分调整
              </el-button>
              <template v-if="userDetail.status === '正常'">
                <el-button type="danger" plain @click="handleDisableUser">
                  禁用用户
                </el-button>
              </template>
              <template v-else>
                <el-button type="primary" @click="handleEnableUser">
                  启用用户
                </el-button>
              </template>
            </div>
          </el-tab-pane>

          <!-- Study Records Tab -->
          <el-tab-pane label="学习记录" name="study">
            <div class="user-detail-page__tab-filter">
              <el-date-picker
                v-model="studyTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
              <el-button type="primary" size="small">搜索</el-button>
            </div>
            <el-table
              v-loading="tabLoading"
              :data="studyRecords"
              class="user-detail-page__table"
            >
              <el-table-column prop="studyTime" label="学习时间" width="160" />
              <el-table-column prop="cardName" label="知识卡片名称" min-width="180" show-overflow-tooltip />
              <el-table-column prop="chapterName" label="所属章节" width="140" />
              <el-table-column label="学习状态" width="100" align="center">
                <template #default="{ row }: { row: IStudyRecord }">
                  <el-tag :type="getStudyStatusTagType(row.status)" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="学习时长" width="120" align="center">
                <template #default="{ row }: { row: IStudyRecord }">
                  {{ formatDuration(row.duration) }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!tabLoading && studyRecords.length === 0" class="user-detail-page__tab-empty">
              暂无学习记录
            </div>
          </el-tab-pane>

          <!-- Points Records Tab -->
          <el-tab-pane label="积分记录" name="points">
            <div class="user-detail-page__tab-filter">
              <el-date-picker
                v-model="pointsTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
              <el-select v-model="pointsActionFilter" placeholder="行为类型" clearable class="user-detail-page__tab-filter-select">
                <el-option label="完成学习" value="完成学习" />
                <el-option label="完成答题" value="完成答题" />
                <el-option label="连续打卡" value="连续打卡" />
                <el-option label="兑换文具" value="兑换文具" />
              </el-select>
              <el-button type="primary" size="small">搜索</el-button>
            </div>
            <el-table
              v-loading="tabLoading"
              :data="pointsRecords"
              class="user-detail-page__table"
            >
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="action" label="行为" min-width="120" />
              <el-table-column label="积分变动" width="120" align="center">
                <template #default="{ row }: { row: IPointsRecord }">
                  <span
                    class="user-detail-page__points-change"
                    :class="{
                      'user-detail-page__points-change--positive': row.pointsChange > 0,
                      'user-detail-page__points-change--negative': row.pointsChange < 0
                    }"
                  >
                    {{ row.pointsChange > 0 ? '+' : '' }}{{ row.pointsChange }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="余额" width="100" align="center">
                <template #default="{ row }: { row: IPointsRecord }">
                  {{ row.balance }}
                </template>
              </el-table-column>
            </el-table>
            <div v-if="!tabLoading && pointsRecords.length === 0" class="user-detail-page__tab-empty">
              暂无积分记录
            </div>
          </el-tab-pane>

          <!-- Stationery Tab -->
          <el-tab-pane label="文具持有" name="stationery">
            <div v-loading="tabLoading" class="user-detail-page__stationery-grid">
              <template v-if="stationeryItems.length > 0">
                <div
                  v-for="item in stationeryItems"
                  :key="item.id"
                  class="user-detail-page__stationery-card"
                  :class="{ 'user-detail-page__stationery-card--none': item.quantity === 0 }"
                >
                  <div class="user-detail-page__stationery-icon">{{ item.icon }}</div>
                  <div class="user-detail-page__stationery-info">
                    <span class="user-detail-page__stationery-name">{{ item.name }}</span>
                    <span class="user-detail-page__stationery-rarity">{{ getRarityStars(item.rarity) }}</span>
                  </div>
                  <div class="user-detail-page__stationery-qty">
                    x{{ item.quantity }}
                  </div>
                </div>
              </template>
              <div v-if="!tabLoading && stationeryItems.length === 0" class="user-detail-page__tab-empty">
                暂无文具持有记录
              </div>
            </div>
          </el-tab-pane>

          <!-- Level Records Tab -->
          <el-tab-pane label="等级记录" name="level">
            <div v-loading="tabLoading" class="user-detail-page__level-timeline">
              <template v-if="levelRecords.length > 0">
                <div v-for="record in levelRecords" :key="record.id" class="user-detail-page__level-item">
                  <div class="user-detail-page__level-dot"></div>
                  <div class="user-detail-page__level-content">
                    <div class="user-detail-page__level-time">{{ record.time }}</div>
                    <div class="user-detail-page__level-change">
                      <span class="user-detail-page__level-from">
                        Lv.{{ record.fromLevel }} {{ record.fromTitle }}
                      </span>
                      <span class="user-detail-page__level-arrow">&rarr;</span>
                      <span class="user-detail-page__level-to">
                        Lv.{{ record.toLevel }} {{ record.toTitle }}
                      </span>
                    </div>
                    <div class="user-detail-page__level-reason">{{ record.reason }}</div>
                  </div>
                </div>
              </template>
              <div v-if="!tabLoading && levelRecords.length === 0" class="user-detail-page__tab-empty">
                暂无等级变更记录
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </template>
  </div>

  <!-- Points Adjust Dialog -->
  <el-dialog
    v-model="pointsDialogVisible"
    title="积分调整"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form :model="pointsForm" label-width="100px" class="user-detail-page__points-form">
      <el-form-item label="调整类型">
        <el-radio-group v-model="pointsForm.type">
          <el-radio value="补发积分">补发积分</el-radio>
          <el-radio value="扣除积分">扣除积分</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="调整数量">
        <el-input-number
          v-model="pointsForm.amount"
          :min="1"
          :max="10000"
          :step="10"
          controls-position="right"
          class="user-detail-page__points-amount"
        />
        <span class="user-detail-page__points-hint">1-10000</span>
      </el-form-item>
      <el-form-item label="调整原因">
        <el-input
          v-model="pointsForm.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入积分调整原因..."
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pointsDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handlePointsAdjust">提交调整</el-button>
    </template>
  </el-dialog>

  <!-- Points Adjust Confirm Dialog -->
  <el-dialog
    v-model="pointsChangeConfirmVisible"
    title="确认积分调整"
    width="420px"
    :close-on-click-modal="false"
  >
    <div class="user-detail-page__confirm-body">
      <p>确定要对用户「{{ userDetail?.nickname }}」进行以下积分调整吗？</p>
      <div class="user-detail-page__confirm-detail">
        <div class="user-detail-page__confirm-row">
          <span>调整类型：</span>
          <strong :class="{ 'user-detail-page__text--danger': pointsForm.type === '扣除积分' }">
            {{ pointsForm.type }}
          </strong>
        </div>
        <div class="user-detail-page__confirm-row">
          <span>调整数量：</span>
          <strong>{{ pointsForm.amount }}</strong>
        </div>
        <div class="user-detail-page__confirm-row">
          <span>调整原因：</span>
          <span>{{ pointsForm.reason }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="pointsChangeConfirmVisible = false">取消</el-button>
      <el-button type="primary" :loading="pointsSubmitting" @click="confirmPointsAdjust">
        确认调整
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.user-detail-page {
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
    padding: 28px 32px;
  }

  &__info-main {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__info-avatar {
    flex-shrink: 0;
  }

  &__info-text {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  &__info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__info-nickname {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
  }

  &__info-status {
    flex-shrink: 0;
  }

  &__info-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__info-divider {
    color: var(--app-border-color);
  }

  &__level-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--app-info-color);
    flex-shrink: 0;

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

  // Tabs
  &__tabs-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 4px 24px 24px;
    min-height: 400px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      background-color: var(--app-border-light);
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

  // Basic Info Grid
  &__basic-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px 32px;
  }

  &__basic-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__basic-label {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__basic-value {
    font-size: 15px;
    font-weight: 500;
    color: var(--app-text-primary);

    &--highlight {
      color: var(--app-primary-color);
      font-weight: 600;
    }
  }

  &__basic-actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--app-border-light);
  }

  // Tab Filter
  &__tab-filter {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  &__tab-filter-select {
    width: 140px;
  }

  // Table
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
  }

  // Points Change
  &__points-change {
    font-weight: 600;

    &--positive {
      color: var(--app-success-color);
    }

    &--negative {
      color: var(--app-danger-color);
    }
  }

  // Tab Empty
  &__tab-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    font-size: 14px;
    color: var(--app-text-secondary);
  }

  // Stationery Grid
  &__stationery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    min-height: 100px;
  }

  &__stationery-card {
    background: #FDFBF7;
    border: 1px solid var(--app-border-light);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    &--none {
      opacity: 0.4;
    }
  }

  &__stationery-icon {
    font-size: 28px;
    width: 40px;
    text-align: center;
  }

  &__stationery-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__stationery-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--app-text-primary);
  }

  &__stationery-rarity {
    font-size: 11px;
    color: #D4916E;
    letter-spacing: 1px;
  }

  &__stationery-qty {
    font-size: 16px;
    font-weight: 700;
    color: var(--app-primary-color);
  }

  // Level Timeline
  &__level-timeline {
    padding-left: 8px;
  }

  &__level-item {
    display: flex;
    gap: 16px;
    padding-bottom: 24px;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 14px;
      bottom: 0;
      width: 2px;
      background: var(--app-border-light);
    }
  }

  &__level-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--app-primary-color);
    flex-shrink: 0;
    margin-top: 4px;
    border: 2px solid #F5EDE3;
    z-index: 1;
  }

  &__level-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__level-time {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__level-change {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__level-from {
    font-size: 14px;
    color: var(--app-text-secondary);
  }

  &__level-arrow {
    color: var(--app-primary-color);
    font-weight: 700;
  }

  &__level-to {
    font-size: 14px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__level-reason {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  // Points Dialog
  &__points-form {
    margin-top: 8px;
  }

  &__points-amount {
    width: 200px;
  }

  &__points-hint {
    margin-left: 12px;
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  // Confirm Dialog
  &__confirm-body {
    p {
      margin: 0 0 16px;
      color: var(--app-text-regular);
    }
  }

  &__confirm-detail {
    background: #FDFBF7;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__confirm-row {
    display: flex;
    gap: 8px;
    font-size: 14px;
    color: var(--app-text-regular);
  }

  &__text--danger {
    color: var(--app-danger-color);
  }
}
</style>
