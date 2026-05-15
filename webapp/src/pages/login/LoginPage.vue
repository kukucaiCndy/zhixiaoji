<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { authApi } from '@/api/modules/auth'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()

const form = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loading = ref(false)

interface ILoginResult {
  token: string
  userInfo: {
    id: number
    nickname: string
    avatar: string
    role: string
  }
}

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await authApi.login(form)
    if (res.code === 0) {
      const data = res.data as ILoginResult
      userStore.setToken(data.token)
      userStore.setUserInfo(data.userInfo)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error(res.message || '登录失败，请重试')
    }
  } catch {
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__card">
      <div class="login-page__header">
        <span class="login-page__logo-icon">📖</span>
        <h1 class="login-page__title">知晓记管理后台</h1>
        <p class="login-page__subtitle">运营内容管理平台</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="form"
        :rules="loginRules"
        class="login-page__form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-page__submit-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <p class="login-page__hint">
        初始账号：admin / admin123
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #FAF7F2;

  &__card {
    width: 420px;
    padding: 48px 40px 40px;
    background-color: #fff;
    border: 1px solid #E8DED0;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  }

  &__header {
    text-align: center;
    margin-bottom: 36px;
  }

  &__logo-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 12px;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 22px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0 0 8px 0;
  }

  &__subtitle {
    font-family: var(--app-font-body);
    font-size: 14px;
    color: var(--app-text-secondary);
    margin: 0;
  }

  &__form {
    :deep(.el-input__wrapper) {
      background-color: #F5F0EB;
      box-shadow: none;
      border: 1px solid #E8DED0;
      border-radius: 10px;

      &:hover,
      &.is-focus {
        border-color: #D4916E;
        box-shadow: 0 0 0 1px rgba(212, 145, 110, 0.2);
      }
    }

    :deep(.el-form-item__error) {
      padding-top: 2px;
    }
  }

  &__submit-btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
    border-radius: 10px;
    background-color: #D4916E;
    border-color: #D4916E;

    &:hover,
    &:focus {
      background-color: #C47A55;
      border-color: #C47A55;
    }

    &:active {
      background-color: #B36A48;
      border-color: #B36A48;
    }
  }

  &__hint {
    text-align: center;
    font-size: 12px;
    color: var(--app-text-placeholder);
    margin: 0;
  }
}
</style>
