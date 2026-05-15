<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="error-page">
    <div class="error-page__card">
      <div class="error-page__icon">
        <el-icon :size="64" color="#C4726F"><Lock /></el-icon>
      </div>
      <h1 class="error-page__code">403</h1>
      <h2 class="error-page__title">暂无访问权限</h2>
      <p class="error-page__desc">如需访问请联系管理员</p>
      <el-button
        type="primary"
        size="large"
        class="error-page__btn"
        @click="goHome"
      >
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #FAF7F2;

  &__card {
    width: 420px;
    padding: 56px 40px 48px;
    background-color: #fff;
    border: 1px solid #E8DED0;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
    text-align: center;
  }

  &__icon {
    margin-bottom: 20px;
  }

  &__code {
    font-family: var(--app-font-heading);
    font-size: 72px;
    font-weight: 700;
    color: #C4726F;
    margin: 0 0 8px 0;
    line-height: 1;
    opacity: 0.85;
  }

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0 0 12px 0;
  }

  &__desc {
    font-family: var(--app-font-body);
    font-size: 14px;
    color: var(--app-text-secondary);
    margin: 0 0 32px 0;
  }

  &__btn {
    min-width: 160px;
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
}
</style>
