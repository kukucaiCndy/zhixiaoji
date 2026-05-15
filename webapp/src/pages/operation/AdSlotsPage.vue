<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface IAdSlot {
  id: number
  name: string
  enabled: boolean
  frequency: number
  frequencyUnit: string
  startTime: string
  endTime: string
  targetUsers: string
  exposure: number
  clicks: number
  ctr: string
}

const slots = ref<IAdSlot[]>([])
const loading = ref(false)
const savingIds = ref<Set<number>>(new Set())
const expandedIds = ref<Set<number>>(new Set())

const frequencyUnitOptions = ['每次', '每N次', '每天']
const targetUserOptions = ['全部', '仅新用户', '仅活跃用户']

async function fetchSlots() {
  loading.value = true
  try {
    const res = await operationApi.getAdSlots()
    slots.value = res.data as IAdSlot[]
  } catch {
    ElMessage.error('获取广告位列表失败')
  } finally {
    loading.value = false
  }
}

function toggleExpand(id: number) {
  const newSet = new Set(expandedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedIds.value = newSet
}

function isExpanded(id: number): boolean {
  return expandedIds.value.has(id)
}

async function saveSlot(slot: IAdSlot) {
  savingIds.value.add(slot.id)
  try {
    await operationApi.updateAdSlot(slot.id, {
      enabled: slot.enabled,
      frequency: slot.frequency,
      frequencyUnit: slot.frequencyUnit,
      startTime: slot.startTime,
      endTime: slot.endTime,
      targetUsers: slot.targetUsers
    })
    ElMessage.success('配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    savingIds.value.delete(slot.id)
  }
}

onMounted(() => {
  fetchSlots()
})
</script>

<template>
  <div class="ad-slots-page">
    <!-- 面包屑 -->
    <el-breadcrumb class="ad-slots-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>广告位管理</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="ad-slots-page__header">
      <h2 class="ad-slots-page__title">广告位管理</h2>
      <p class="ad-slots-page__desc">管理小程序中各广告位的开关、频次及展示规则</p>
    </div>

    <!-- 广告位卡片列表 -->
    <div v-loading="loading" class="ad-slots-page__list">
      <div
        v-for="slot in slots"
        :key="slot.id"
        class="ad-slots-page__card"
      >
        <!-- 卡片头部：名称、开关、今日数据 -->
        <div class="ad-slots-page__card-header" @click="toggleExpand(slot.id)">
          <div class="ad-slots-page__card-left">
            <span
              class="ad-slots-page__collapse-icon"
              :class="{ 'ad-slots-page__collapse-icon--expanded': isExpanded(slot.id) }"
            >
              &#9654;
            </span>
            <span class="ad-slots-page__card-name">{{ slot.name }}</span>
          </div>
          <div class="ad-slots-page__card-right" @click.stop>
            <div class="ad-slots-page__data-row">
              <span class="ad-slots-page__data-item">
                曝光 <strong>{{ slot.exposure }}</strong>
              </span>
              <span class="ad-slots-page__data-item">
                点击 <strong>{{ slot.clicks }}</strong>
              </span>
              <span class="ad-slots-page__data-item">
                点击率 <strong>{{ slot.ctr }}</strong>
              </span>
            </div>
            <el-switch v-model="slot.enabled" />
          </div>
        </div>

        <!-- 卡片内容：配置区域 -->
        <div v-show="isExpanded(slot.id)" class="ad-slots-page__card-body">
          <div class="ad-slots-page__form-row">
            <div class="ad-slots-page__form-item">
              <label class="ad-slots-page__label">展示频次</label>
              <div class="ad-slots-page__frequency">
                <span class="ad-slots-page__frequency-prefix">每</span>
                <el-input-number
                  v-model="slot.frequency"
                  :min="1"
                  :max="99"
                  size="default"
                  class="ad-slots-page__frequency-input"
                />
                <span class="ad-slots-page__frequency-suffix">次</span>
                <el-select
                  v-model="slot.frequencyUnit"
                  size="default"
                  class="ad-slots-page__frequency-unit"
                >
                  <el-option
                    v-for="opt in frequencyUnitOptions"
                    :key="opt"
                    :label="opt"
                    :value="opt"
                  />
                </el-select>
              </div>
            </div>

            <div class="ad-slots-page__form-item">
              <label class="ad-slots-page__label">展示时段</label>
              <div class="ad-slots-page__time-range">
                <el-time-picker
                  v-model="slot.startTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="开始时间"
                  size="default"
                />
                <span class="ad-slots-page__time-sep">至</span>
                <el-time-picker
                  v-model="slot.endTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="结束时间"
                  size="default"
                />
              </div>
            </div>
          </div>

          <div class="ad-slots-page__form-row">
            <div class="ad-slots-page__form-item ad-slots-page__form-item--full">
              <label class="ad-slots-page__label">展示用户</label>
              <el-radio-group v-model="slot.targetUsers">
                <el-radio
                  v-for="opt in targetUserOptions"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </el-radio>
              </el-radio-group>
            </div>
          </div>

          <div class="ad-slots-page__actions">
            <el-button
              type="primary"
              :loading="savingIds.has(slot.id)"
              @click="saveSlot(slot)"
            >
              保存
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && slots.length === 0" description="暂无广告位数据" />
  </div>
</template>

<style scoped lang="scss">
.ad-slots-page {
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

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--app-bg-color);
    }
  }

  &__card-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__collapse-icon {
    font-size: 10px;
    color: var(--app-text-secondary);
    transition: transform 0.2s;
    display: inline-block;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__card-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__card-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__data-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__data-item {
    font-size: 12px;
    color: var(--app-text-secondary);

    strong {
      color: var(--app-text-primary);
      font-weight: 600;
      margin-left: 2px;
    }
  }

  &__card-body {
    padding: 0 20px 20px;
    border-top: 1px solid var(--app-border-light);
    padding-top: 20px;
  }

  &__form-row {
    display: flex;
    gap: 32px;
    margin-bottom: 16px;
  }

  &__form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--full {
      flex: 1;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text-regular);
  }

  &__frequency {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__frequency-prefix,
  &__frequency-suffix {
    font-size: 13px;
    color: var(--app-text-secondary);
    white-space: nowrap;
  }

  &__frequency-input {
    width: 100px;
  }

  &__frequency-unit {
    width: 120px;
  }

  &__time-range {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__time-sep {
    font-size: 13px;
    color: var(--app-text-secondary);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }
}
</style>
