<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { systemApi } from '@/api/modules/system'

// Bound state
const isPhoneBound = ref(false)
const boundPhoneDisplay = ref('')
const pageLoading = ref(true)

// Form state
const formData = reactive({
  phone: '',
  code: ''
})

const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const formRef = ref()
let countdownTimer: ReturnType<typeof setInterval> | null = null

// Validation
const validatePhone = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入手机号'))
    return
  }
  if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的11位手机号'))
    return
  }
  callback()
}

const rules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

function sendCode() {
  if (sendingCode.value || countdown.value > 0) return

  // Validate phone first
  if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
    ElMessage.warning('请先输入正确的手机号')
    return
  }

  sendingCode.value = true
  // Simulate sending
  setTimeout(() => {
    ElMessage.success('验证码已发送')
    sendingCode.value = false
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }
    }, 1000)
  }, 500)
}

async function fetchBindStatus() {
  pageLoading.value = true
  try {
    // Simulate checking bound phone status
    // In production, this would call a dedicated API
    const savedPhone = localStorage.getItem('boundPhone')
    if (savedPhone) {
      isPhoneBound.value = true
      boundPhoneDisplay.value = savedPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      formData.phone = savedPhone
    }
  } catch {
    // Not bound
  } finally {
    pageLoading.value = false
  }
}

async function handleBind() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const res = await systemApi.bindPhone({
      phone: formData.phone,
      code: formData.code
    })
    if (res.code === 0) {
      ElMessage.success('手机号绑定成功')
      isPhoneBound.value = true
      boundPhoneDisplay.value = formData.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      localStorage.setItem('boundPhone', formData.phone)
    } else {
      ElMessage.error(res.message || '绑定失败')
    }
  } catch {
    ElMessage.error('绑定失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function handleChangeBind() {
  isPhoneBound.value = false
  formData.code = ''
  countdown.value = 0
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  localStorage.removeItem('boundPhone')
}

onMounted(() => {
  fetchBindStatus()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<template>
  <div class="bind-phone-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="bind-phone-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>账号设置</el-breadcrumb-item>
      <el-breadcrumb-item>绑定手机号</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <h2 class="bind-phone-page__title">绑定手机号</h2>

    <!-- Loading -->
    <div v-if="pageLoading" class="bind-phone-page__card">
      <div class="bind-phone-page__loading">
        <el-icon class="is-loading" :size="24" color="var(--app-text-secondary)">
          <svg viewBox="0 0 1024 1024"><path d="M512 64a448 448 0 1 0 448 448h-64a384 384 0 1 1-384-384V64z" fill="currentColor"/></svg>
        </el-icon>
      </div>
    </div>

    <!-- Bound State -->
    <div v-else-if="isPhoneBound" class="bind-phone-page__card">
      <div class="bind-phone-page__bound-info">
        <div class="bind-phone-page__bound-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--app-success-color)" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="bind-phone-page__bound-label">已绑定手机号</div>
        <div class="bind-phone-page__bound-phone">{{ boundPhoneDisplay }}</div>
        <el-button
          type="primary"
          plain
          class="bind-phone-page__change-btn"
          @click="handleChangeBind"
        >
          更换绑定
        </el-button>
      </div>
    </div>

    <!-- Bind Form -->
    <div v-else class="bind-phone-page__card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="right"
        class="bind-phone-page__form"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入11位手机号"
            maxlength="11"
            class="bind-phone-page__input"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="bind-phone-page__code-row">
            <el-input
              v-model="formData.code"
              placeholder="请输入验证码"
              maxlength="6"
              class="bind-phone-page__code-input"
            />
            <el-button
              :disabled="countdown > 0 || sendingCode"
              :loading="sendingCode"
              class="bind-phone-page__code-btn"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="bind-phone-page__submit-btn"
            @click="handleBind"
          >
            绑定
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bind-phone-page {
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

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 32px 40px;
    max-width: 600px;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  &__form {
    :deep(.el-form-item__label) {
      color: var(--app-text-regular);
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__input {
    width: 320px;
  }

  &__code-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__code-input {
    width: 200px;
  }

  &__code-btn {
    min-width: 120px;
    white-space: nowrap;
  }

  &__submit-btn {
    margin-top: 8px;
    min-width: 100px;
  }

  // Bound State
  &__bound-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px 0;
    text-align: center;
  }

  &__bound-icon {
    margin-bottom: 8px;
  }

  &__bound-label {
    font-size: 14px;
    color: var(--app-text-secondary);
  }

  &__bound-phone {
    font-family: var(--app-font-heading);
    font-size: 24px;
    font-weight: 700;
    color: var(--app-text-primary);
    letter-spacing: 2px;
  }

  &__change-btn {
    margin-top: 8px;
  }
}
</style>
