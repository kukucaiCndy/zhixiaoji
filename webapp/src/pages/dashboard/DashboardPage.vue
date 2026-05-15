<script setup lang="ts">
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { ArrowUp, ArrowDown, User, Reading, DataLine, Connection } from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/modules/dashboard'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// --- Metric cards data ---
interface IMetricCard {
  label: string
  value: string
  trend: number
  trendUp: boolean
  color: string
}

const metrics = ref<IMetricCard[]>([
  { label: '总用户数', value: '12,580', trend: 12.5, trendUp: true, color: '#4A90D9' },
  { label: '日活用户', value: '2,340', trend: 8.3, trendUp: true, color: '#7BA87F' },
  { label: '新增用户', value: '156', trend: 5.2, trendUp: true, color: '#D4916E' },
  { label: '今日学习', value: '3,892', trend: 15.8, trendUp: true, color: '#8B7BA8' }
])

// --- Chart: 用户增长趋势 ---
const userTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: '#fff',
    borderColor: '#E8DED0',
    textStyle: { color: '#3D3D3D' }
  },
  grid: { top: 24, right: 24, bottom: 36, left: 52 },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#E8DED0' } },
    axisTick: { show: false },
    axisLabel: { color: '#A89880', fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F3EBE2', type: 'dashed' } },
    axisLabel: { color: '#A89880', fontSize: 12 }
  },
  series: [
    {
      type: 'bar',
      data: [120, 180, 200, 240, 220, 260, 310],
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#D4916E' },
            { offset: 1, color: '#F0D5C3' }
          ]
        }
      },
      barWidth: 32,
      emphasis: {
        itemStyle: { color: '#D4916E' }
      }
    }
  ]
}))

// --- Chart: 活跃用户留存 ---
const retentionOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: '#fff',
    borderColor: '#E8DED0',
    textStyle: { color: '#3D3D3D' },
    formatter: (params: { name: string, value: number }[]) =>
      `${params[0].name}: ${params[0].value}%`
  },
  grid: { top: 10, right: 40, bottom: 24, left: 60 },
  xAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F3EBE2', type: 'dashed' } },
    axisLabel: { color: '#A89880', fontSize: 12, formatter: '{value}%' }
  },
  yAxis: {
    type: 'category',
    data: ['第1天', '第2天', '第3天', '第7天', '第14天', '第30天'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#A89880', fontSize: 12 }
  },
  series: [
    {
      type: 'bar',
      data: [92, 75, 58, 42, 28, 18],
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#7BA87F' },
            { offset: 1, color: '#B8D4BB' }
          ]
        }
      },
      barWidth: 22,
      label: {
        show: true,
        position: 'right',
        color: '#7BA87F',
        fontSize: 12,
        fontWeight: 500,
        formatter: '{c}%'
      }
    }
  ]
}))

// --- Chart: 内容消费分布 ---
const contentDistributionOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: '#fff',
    borderColor: '#E8DED0',
    textStyle: { color: '#3D3D3D' },
    formatter: (params: { name: string, value: number }[]) =>
      `${params[0].name}: ${params[0].value}%`
  },
  legend: {
    orient: 'horizontal',
    bottom: 6,
    textStyle: { color: '#A89880', fontSize: 12 },
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 20
  },
  grid: { top: 24, right: 24, bottom: 48, left: 52 },
  xAxis: {
    type: 'category',
    data: ['Python', 'JavaScript', '算法', '数据结构', '其他'],
    axisLine: { lineStyle: { color: '#E8DED0' } },
    axisTick: { show: false },
    axisLabel: { color: '#A89880', fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F3EBE2', type: 'dashed' } },
    axisLabel: { color: '#A89880', fontSize: 12, formatter: '{value}%' }
  },
  color: ['#4A90D9', '#7BA87F', '#D4916E', '#8B7BA8', '#C0AE9E'],
  series: [
    {
      name: '内容占比',
      type: 'bar',
      data: [40, 30, 15, 10, 5],
      barWidth: 36,
      itemStyle: {
        borderRadius: [6, 6, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        color: '#A89880',
        fontSize: 12,
        formatter: '{c}%'
      }
    }
  ]
}))

// --- Chart: 学习转化漏斗 ---
const funnelOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: '#fff',
    borderColor: '#E8DED0',
    textStyle: { color: '#3D3D3D' }
  },
  grid: { top: 20, right: 80, bottom: 20, left: 100 },
  xAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#F3EBE2', type: 'dashed' } },
    axisLabel: { color: '#A89880', fontSize: 12 }
  },
  yAxis: {
    type: 'category',
    data: ['续学下章', '完成课程', '开始学习', '访问课程'],
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#A89880', fontSize: 13 }
  },
  series: [
    {
      type: 'bar',
      data: [
        { value: 2890, itemStyle: { color: '#8B7BA8' } },
        { value: 4560, itemStyle: { color: '#D4916E' } },
        { value: 8920, itemStyle: { color: '#7BA87F' } },
        { value: 12580, itemStyle: { color: '#4A90D9' } }
      ],
      barWidth: 28,
      itemStyle: {
        borderRadius: [0, 6, 6, 0]
      },
      label: {
        show: true,
        position: 'right',
        color: '#A89880',
        fontSize: 12,
        formatter: '{c}'
      }
    }
  ]
}))

// --- 热门内容 TOP6 ---
interface IHotContent {
  rank: number
  name: string
  count: number
}

const hotContent = ref<IHotContent[]>([
  { rank: 1, name: 'Python入门基础', count: 3200 },
  { rank: 2, name: 'JavaScript核心概念', count: 2800 },
  { rank: 3, name: '数据结构与算法', count: 2500 },
  { rank: 4, name: 'AI编程入门', count: 2100 },
  { rank: 5, name: 'Web开发实践', count: 1900 },
  { rank: 6, name: '数据库基础', count: 1600 }
])

// --- 本周数据概览 ---
interface IWeeklySummary {
  label: string
  value: string
  icon: string
}

const weeklySummary = ref<IWeeklySummary[]>([
  { label: '本周新增用户', value: '1,280', icon: 'user' },
  { label: '本周学习总次数', value: '24,560', icon: 'reading' },
  { label: '平均正确率', value: '78.5%', icon: 'dataLine' },
  { label: '活跃用户数', value: '8,560', icon: 'connection' }
])

function getRankClass(rank: number): string {
  switch (rank) {
    case 1: return 'dashboard-page__rank--gold'
    case 2: return 'dashboard-page__rank--silver'
    case 3: return 'dashboard-page__rank--bronze'
    default: return 'dashboard-page__rank--normal'
  }
}

function formatCount(count: number): string {
  return count.toLocaleString()
}
</script>

<template>
  <div class="dashboard-page">
    <!-- 面包屑 -->
    <el-breadcrumb class="dashboard-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据看板</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 指标卡片行 -->
    <div class="dashboard-page__metrics">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="dashboard-page__metric-card"
        :style="{ '--accent-color': metric.color }"
      >
        <div class="dashboard-page__metric-label">{{ metric.label }}</div>
        <div class="dashboard-page__metric-value">{{ metric.value }}</div>
        <div class="dashboard-page__metric-trend">
          <el-icon :size="16" :color="metric.trendUp ? '#7BA87F' : '#C4726F'">
            <ArrowUp v-if="metric.trendUp" />
            <ArrowDown v-else />
          </el-icon>
          <span
            class="dashboard-page__metric-trend-text"
            :class="{ 'dashboard-page__metric-trend-text--up': metric.trendUp }"
          >
            {{ metric.trend }}%
          </span>
          <span class="dashboard-page__metric-trend-label">较昨日</span>
        </div>
      </div>
    </div>

    <!-- 图表 2x2 网格 -->
    <div class="dashboard-page__charts-grid">
      <div class="dashboard-page__chart-card">
        <div class="dashboard-page__chart-title">用户增长趋势</div>
        <VChart
          class="dashboard-page__chart-canvas"
          :option="userTrendOption"
          autoresize
        />
      </div>

      <div class="dashboard-page__chart-card">
        <div class="dashboard-page__chart-title">活跃用户留存</div>
        <VChart
          class="dashboard-page__chart-canvas"
          :option="retentionOption"
          autoresize
        />
      </div>

      <div class="dashboard-page__chart-card">
        <div class="dashboard-page__chart-title">内容消费分布</div>
        <VChart
          class="dashboard-page__chart-canvas"
          :option="contentDistributionOption"
          autoresize
        />
      </div>

      <div class="dashboard-page__chart-card">
        <div class="dashboard-page__chart-title">学习转化漏斗</div>
        <VChart
          class="dashboard-page__chart-canvas"
          :option="funnelOption"
          autoresize
        />
      </div>
    </div>

    <!-- 底部行：热门内容 + 本周数据 -->
    <div class="dashboard-page__bottom-row">
      <!-- 热门内容 TOP6 -->
      <div class="dashboard-page__hot-card">
        <div class="dashboard-page__section-title">热门内容 TOP6</div>
        <div class="dashboard-page__hot-list">
          <div
            v-for="item in hotContent"
            :key="item.rank"
            class="dashboard-page__hot-item"
          >
            <div
              class="dashboard-page__rank"
              :class="getRankClass(item.rank)"
            >
              {{ item.rank }}
            </div>
            <div class="dashboard-page__hot-name">{{ item.name }}</div>
            <div class="dashboard-page__hot-count">{{ formatCount(item.count) }}次学习</div>
          </div>
        </div>
      </div>

      <!-- 本周数据概览 -->
      <div class="dashboard-page__week-card">
        <div class="dashboard-page__section-title">本周数据概览</div>
        <div class="dashboard-page__week-grid">
          <div
            v-for="item in weeklySummary"
            :key="item.label"
            class="dashboard-page__week-item"
          >
            <div class="dashboard-page__week-icon">
              <el-icon :size="22">
                <User v-if="item.icon === 'user'" />
                <Reading v-if="item.icon === 'reading'" />
                <DataLine v-if="item.icon === 'dataLine'" />
                <Connection v-if="item.icon === 'connection'" />
              </el-icon>
            </div>
            <div class="dashboard-page__week-label">{{ item.label }}</div>
            <div class="dashboard-page__week-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-page {
  --card-radius: 12px;
  --card-border: 1px solid var(--app-border-color);
  --card-bg: var(--app-bg-card);

  display: flex;
  flex-direction: column;
  gap: 20px;

  // --- Breadcrumb ---
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

  // --- Metric Cards Row ---
  &__metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  &__metric-card {
    position: relative;
    overflow: hidden;
    background: var(--card-bg);
    border: var(--card-border);
    border-radius: var(--card-radius);
    padding: 20px 24px 18px;

    // Accent color bar on top
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent-color);
      border-radius: var(--card-radius) var(--card-radius) 0 0;
    }
  }

  &__metric-label {
    font-size: 13px;
    color: var(--app-text-secondary);
    margin-bottom: 8px;
  }

  &__metric-value {
    font-family: var(--app-font-heading);
    font-size: 32px;
    font-weight: 700;
    color: var(--app-text-primary);
    line-height: 1.2;
    margin-bottom: 10px;
  }

  &__metric-trend {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__metric-trend-text {
    font-size: 13px;
    font-weight: 600;

    &--up {
      color: var(--app-success-color);
    }
  }

  &__metric-trend-label {
    font-size: 12px;
    color: var(--app-text-secondary);
    margin-left: 2px;
  }

  // --- Chart Grid ---
  &__charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  &__chart-card {
    background: var(--card-bg);
    border: var(--card-border);
    border-radius: var(--card-radius);
    padding: 20px 24px 16px;
  }

  &__chart-title {
    font-family: var(--app-font-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 8px;
  }

  &__chart-canvas {
    width: 100%;
    height: 280px;
  }

  // --- Bottom Row ---
  &__bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  &__section-title {
    font-family: var(--app-font-heading);
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--app-border-light);
  }

  // --- Hot Content ---
  &__hot-card {
    background: var(--card-bg);
    border: var(--card-border);
    border-radius: var(--card-radius);
    padding: 20px 24px;
  }

  &__hot-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__hot-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 0;

    &:not(:last-child) {
      border-bottom: 1px solid var(--app-border-light);
    }
  }

  &__rank {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    background: #F3EBE2;
    color: var(--app-text-secondary);

    &--gold {
      background: #FFF7E0;
      color: #D4916E;
    }

    &--silver {
      background: #F0F4F8;
      color: #7B8CA8;
    }

    &--bronze {
      background: #FDF0EF;
      color: #C4726F;
    }

    &--normal {
      background: #F3EBE2;
      color: var(--app-text-secondary);
    }
  }

  &__hot-name {
    flex: 1;
    font-size: 14px;
    color: var(--app-text-regular);
  }

  &__hot-count {
    font-size: 13px;
    color: var(--app-text-secondary);
    white-space: nowrap;
  }

  // --- Weekly Summary ---
  &__week-card {
    background: var(--card-bg);
    border: var(--card-border);
    border-radius: var(--card-radius);
    padding: 20px 24px;
  }

  &__week-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  &__week-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 16px;
    background: var(--app-bg-color);
    border-radius: 10px;
    text-align: center;
  }

  &__week-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--app-primary-light);
    color: var(--app-primary-color);
    margin-bottom: 4px;
  }

  &__week-label {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__week-value {
    font-family: var(--app-font-heading);
    font-size: 24px;
    font-weight: 700;
    color: var(--app-text-primary);
  }
}
</style>
