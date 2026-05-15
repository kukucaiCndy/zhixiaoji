<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { systemApi } from '@/api/modules/system'

const router = useRouter()

interface IFormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const formData = reactive<IFormData>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)

// Form ref for validation
const formRef = ref()

// Password validation rules
const validateNewPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入新密码'))
    return
  }
  if (value.length < 8 || value.length > 20) {
    callback(new Error('密码长度必须为 8-20 位'))
    return
  }
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
    return
  }
  callback()
}

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
    return
  }
  if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// Password strength calculation
interface IStrengthInfo {
  level: number
  text: string
  color: string
  width: string
}

const passwordStrength = computed<IStrengthInfo>(() => {
  const pwd = formData.newPassword
  if (!pwd) {
    return { level: 0, text: '', color: '', width: '0%' }
  }

  let score = 0

  // Length score
  if (pwd.length >= 8) score += 1
  if (pwd.length >= 12) score += 1

  // Character variety
  if (/[a-z]/.test(pwd)) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^a-zA-Z0-9]/.test(pwd)) score += 1

  if (score <= 2) {
    return { level: 1, text: '弱', color: '#C4726F', width: '33%' }
  }
  if (score <= 4) {
    return { level: 2, text: '中等', color: '#D4916E', width: '66%' }
  }
  return { level: 3, text: '强', color: '#7BA87F', width: '100%' }
})

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const res = await systemApi.changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    })
    if (res.code === 0) {
      ElMessage.success('密码修改成功，请重新登录')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      ElMessage.error(res.message || '修改密码失败')
    }
  } catch {
    ElMessage.error('修改密码失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="change-password-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="change-password-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统配置</el-breadcrumb-item>
      <el-breadcrumb-item>账号设置</el-breadcrumb-item>
      <el-breadcrumb-item>修改密码</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Title -->
    <h2 class="change-password-page__title">修改密码</h2>

    <!-- Form Card -->
    <div class="change-password-page__card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="right"
        class="change-password-page__form"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="formData.oldPassword"
            type="password"
            placeholder="请输入原密码"
            maxlength="20"
            show-password
            class="change-password-page__input"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <div class="change-password-page__password-field">
            <el-input
              v-model="formData.newPassword"
              type="password"
              placeholder="8-20位，包含字母和数字"
              maxlength="20"
              show-password
              class="change-password-page__input"
            />
            <div v-if="formData.newPassword" class="change-password-page__strength">
              <div class="change-password-page__strength-bar">
                <div
                  class="change-password-page__strength-fill"
                  :style="{
                    width: passwordStrength.width,
                    backgroundColor: passwordStrength.color
                  }"
                />
              </div>
              <span
                class="change-password-page__strength-text"
                :style="{ color: passwordStrength.color }"
              >
                {{ passwordStrength.text }}
              </span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            maxlength="20"
            show-password
            class="change-password-page__input"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="change-password-page__submit-btn"
            @click="handleSubmit"
          >
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.change-password-page {
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

  &__password-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__strength {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__strength-bar {
    width: 160px;
    height: 6px;
    background: #F3EBE2;
    border-radius: 3px;
    overflow: hidden;
  }

  &__strength-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease, background-color 0.3s ease;
  }

  &__strength-text {
    font-size: 12px;
    font-weight: 500;
  }

  &__submit-btn {
    margin-top: 8px;
    min-width: 100px;
  }
}
</style>
