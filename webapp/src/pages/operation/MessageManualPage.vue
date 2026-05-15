<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { operationApi } from '@/api/modules/operation'

interface IPushForm {
  messageType: string
  title: string
  content: string
  jumpType: string
  jumpTarget: string
  targetUsers: string[]
  pushTimeType: string
  scheduledTime: string
}

const MESSAGE_TYPES = ['学习提醒', '复习提醒', '活动通知', '积分变动', '成就解锁', '文具掉落', '系统公告']
const JUMP_TYPES = ['无跳转', '知识卡片', '章节', '每日挑战', '学习主页']
const USER_GROUPS = ['全部用户', '活跃用户', '新注册用户', '流失用户', '自定义用户组']

const pushTargets = ref<{ label: string; value: string }[]>([])

const defaultForm: IPushForm = {
  messageType: '活动通知',
  title: '',
  content: '',
  jumpType: '无跳转',
  jumpTarget: '',
  targetUsers: ['全部用户'],
  pushTimeType: 'immediate',
  scheduledTime: ''
}
const form = reactive<IPushForm>({ ...defaultForm })
const saving = ref(false)
const previewVisible = ref(false)

function onJumpTypeChange() {
  form.jumpTarget = ''
  switch (form.jumpType) {
    case '知识卡片':
      pushTargets.value = [
        { label: 'Python入门基础', value: 'python-basic' },
        { label: 'JavaScript核心概念', value: 'js-core' }
      ]
      break
    case '章节':
      pushTargets.value = [
        { label: '第1章 编程起步', value: 'ch1' },
        { label: '第2章 变量与类型', value: 'ch2' }
      ]
      break
    case '每日挑战':
      pushTargets.value = [
        { label: '今日挑战', value: 'today' }
      ]
      break
    default:
      pushTargets.value = []
      break
  }
}

function handlePreview() {
  if (!form.title.trim() && !form.content.trim()) {
    ElMessage.warning('请先填写推送标题和内容')
    return
  }
  previewVisible.value = true
}

async function handleSend() {
  if (!form.title.trim()) {
    ElMessage.warning('请输入推送标题')
    return
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入推送内容')
    return
  }
  saving.value = true
  try {
    await operationApi.sendManualPush({ ...form })
    ElMessage.success('推送任务已创建')
    Object.assign(form, { ...defaultForm })
    form.jumpType = '无跳转'
    form.targetUsers = ['全部用户']
    form.pushTimeType = 'immediate'
    form.scheduledTime = ''
  } catch {
    ElMessage.error('创建推送任务失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="msg-manual-page">
    <el-breadcrumb class="msg-manual-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>运营管理</el-breadcrumb-item>
      <el-breadcrumb-item>消息推送</el-breadcrumb-item>
      <el-breadcrumb-item>手动推送</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="msg-manual-page__header">
      <h2 class="msg-manual-page__title">手动推送</h2>
      <p class="msg-manual-page__desc">创建并发送一次性消息推送给指定用户群体</p>
    </div>

    <div class="msg-manual-page__form-card">
      <el-form label-width="100px" label-position="right" class="msg-manual-page__form">
        <el-form-item label="消息类型">
          <el-select v-model="form.messageType" style="width: 240px">
            <el-option
              v-for="t in MESSAGE_TYPES"
              :key="t"
              :label="t"
              :value="t"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="推送标题">
          <el-input v-model="form.title" placeholder="请输入推送标题" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="推送内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="请输入推送内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="跳转类型">
          <el-radio-group v-model="form.jumpType" @change="onJumpTypeChange">
            <el-radio v-for="jt in JUMP_TYPES" :key="jt" :value="jt">{{ jt }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="pushTargets.length > 0" label="跳转目标">
          <el-select v-model="form.jumpTarget" placeholder="请选择跳转目标" style="width: 240px">
            <el-option
              v-for="pt in pushTargets"
              :key="pt.value"
              :label="pt.label"
              :value="pt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标用户">
          <el-select v-model="form.targetUsers" multiple style="width: 100%" placeholder="选择目标用户群">
            <el-option v-for="ug in USER_GROUPS" :key="ug" :label="ug" :value="ug" />
          </el-select>
        </el-form-item>

        <el-form-item label="推送时间">
          <el-radio-group v-model="form.pushTimeType">
            <el-radio value="immediate">立即推送</el-radio>
            <el-radio value="scheduled">定时推送</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.pushTimeType === 'scheduled'" label="定时时间">
          <el-date-picker
            v-model="form.scheduledTime"
            type="datetime"
            placeholder="选择推送时间"
            style="width: 280px"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item>
          <div class="msg-manual-page__actions">
            <el-button @click="handlePreview">预览</el-button>
            <el-button type="primary" :loading="saving" @click="handleSend">
              发送推送
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- Preview Dialog -->
    <el-dialog v-model="previewVisible" title="推送预览" width="480px">
      <div class="msg-manual-page__preview">
        <div class="msg-manual-page__preview-item">
          <span class="msg-manual-page__preview-label">消息类型：</span>
          <span>{{ form.messageType }}</span>
        </div>
        <div class="msg-manual-page__preview-item">
          <span class="msg-manual-page__preview-label">推送标题：</span>
          <span>{{ form.title }}</span>
        </div>
        <div class="msg-manual-page__preview-item">
          <span class="msg-manual-page__preview-label">推送内容：</span>
          <span>{{ form.content }}</span>
        </div>
        <div class="msg-manual-page__preview-item">
          <span class="msg-manual-page__preview-label">目标用户：</span>
          <span>{{ form.targetUsers.join('、') || '全部用户' }}</span>
        </div>
        <div class="msg-manual-page__preview-item">
          <span class="msg-manual-page__preview-label">推送时间：</span>
          <span>{{ form.pushTimeType === 'immediate' ? '立即' : form.scheduledTime }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.msg-manual-page {
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

  &__form-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 24px;
  }

  &__form {
    max-width: 700px;
  }

  &__actions {
    display: flex;
    gap: 12px;
  }

  &__preview {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__preview-item {
    display: flex;
    font-size: 14px;

    .msg-manual-page__preview-label {
      min-width: 80px;
      color: var(--app-text-secondary);
      flex-shrink: 0;
    }
  }
}
</style>
