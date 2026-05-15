<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface IMessageTypeSetting {
  type: string
  enabled: boolean
  startTime: string
  endTime: string
  frequencyLimit: number
  frequencyUnit: string
  paused: boolean
  pauseStart: string
  pauseEnd: string
}

const FREQUENCY_UNITS = ['次/天', '次/周', '次/小时']

const typeSettings = ref<IMessageTypeSetting[]>([])
const loading = ref(false)
const saving = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const res = await operationApi.getMessageSettings()
    typeSettings.value = (res.data as { types: IMessageTypeSetting[] }).types
  } catch {
    ElMessage.error('获取推送设置失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await operationApi.updateMessageSettings({ types: typeSettings.value })
    ElMessage.success('推送设置已保存')
  } catch {
    ElMessage.error('保存推送设置失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="msg-settings-page">
    <el-breadcrumb class="msg-settings-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>消息推送</el-breadcrumb-item>
      <el-breadcrumb-item>推送设置</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="msg-settings-page__header">
      <h2 class="msg-settings-page__title">推送设置</h2>
      <p class="msg-settings-page__desc">管理各消息类型的推送开关、时段和频率限制</p>
    </div>

    <div v-loading="loading" class="msg-settings-page__table-wrap">
      <el-empty v-if="!loading && typeSettings.length === 0" description="暂无推送设置数据" />
      <el-table v-else :data="typeSettings" style="width: 100%">
        <el-table-column label="消息类型" prop="type" width="140" />
        <el-table-column label="推送开关" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="推送时段" width="240" align="center">
          <template #default="{ row }">
            <div class="msg-settings-page__time-range">
              <el-time-select
                v-model="row.startTime"
                :max-time="row.endTime"
                placeholder="开始"
                start="00:00"
                step="00:30"
                end="23:30"
                size="small"
                style="width: 110px"
              />
              <span class="msg-settings-page__time-sep">至</span>
              <el-time-select
                v-model="row.endTime"
                :min-time="row.startTime"
                placeholder="结束"
                start="00:00"
                step="00:30"
                end="23:30"
                size="small"
                style="width: 110px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="频率限制" width="200" align="center">
          <template #default="{ row }">
            <div class="msg-settings-page__freq">
              <el-input-number
                v-model="row.frequencyLimit"
                :min="1"
                :max="99"
                size="small"
                controls-position="right"
                style="width: 90px"
              />
              <el-select v-model="row.frequencyUnit" size="small" style="width: 90px">
                <el-option
                  v-for="u in FREQUENCY_UNITS"
                  :key="u"
                  :label="u"
                  :value="u"
                />
              </el-select>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="暂停推送" width="300" align="center">
          <template #default="{ row }">
            <div class="msg-settings-page__pause">
              <el-switch v-model="row.paused" size="small" />
              <template v-if="row.paused">
                <el-date-picker
                  v-model="row.pauseStart"
                  type="date"
                  placeholder="开始日期"
                  size="small"
                  style="width: 130px"
                  value-format="YYYY-MM-DD"
                />
                <span class="msg-settings-page__time-sep">至</span>
                <el-date-picker
                  v-model="row.pauseEnd"
                  type="date"
                  placeholder="结束日期"
                  size="small"
                  style="width: 130px"
                  value-format="YYYY-MM-DD"
                />
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="typeSettings.length > 0" class="msg-settings-page__save-bar">
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存设置
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.msg-settings-page {
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

  &__time-range {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  &__time-sep {
    font-size: 12px;
    color: var(--app-text-secondary);
  }

  &__freq {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  &__pause {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__save-bar {
    padding: 16px 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid var(--app-border-light);
  }
}
</style>
