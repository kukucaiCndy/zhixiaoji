<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { authSdk } from '@/api/modules/auth'
import { setToken } from '@/api/sdk-client'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (sessionStorage.getItem('auth_expired') === '1') {
    sessionStorage.removeItem('auth_expired')
    ElMessage.warning('登录已过期，请重新登录')
  }
})

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

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await authSdk.login(form)
    if (res.code === 0 && res.data) {
      const data = res.data
      setToken(data.accessToken)
      userStore.setToken(data.accessToken)
      userStore.setAdminInfo({
        id: data.admin.id,
        username: data.admin.username,
        role: data.admin.role,
        createdAt: data.admin.createdAt
      })
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
      <div class="login-page__logo">
        <span class="login-page__logo-icon">📖</span>
        <span class="login-page__logo-text">知晓记管理后台</span>
      </div>
      <p class="login-page__desc">运营内容管理平台</p>

      <el-form
        ref="loginFormRef"
        :model="form"
        :rules="loginRules"
        label-position="top"
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
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-page__btn"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>

      <p class="login-page__hint">仅限授权运营人员登录</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--app-bg-color);

  &__card {
    width: 420px;
    padding: 48px;
    background-color: #fff;
    border-radius: 16px;
    border: 1px solid var(--app-border-color);
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  &__logo-icon {
    font-size: 32px;
    color: var(--app-primary-color);
  }

  &__logo-text {
    font-family: var(--app-font-heading);
    font-size: 24px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  &__desc {
    text-align: center;
    font-size: 14px;
    color: var(--app-text-secondary);
    margin-bottom: 32px;
  }

  &__btn {
    width: 100%;
    margin-top: 8px;
    --el-button-bg-color: var(--app-primary-color);
    --el-button-border-color: var(--app-primary-color);
    --el-button-hover-bg-color: #c0805e;
    --el-button-hover-border-color: #c0805e;
  }

  &__hint {
    text-align: center;
    margin-top: 24px;
    font-size: 12px;
    color: var(--app-text-secondary);
  }
}
</style>
