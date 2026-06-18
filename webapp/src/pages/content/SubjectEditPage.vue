<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import EmojiPicker from '@/components/EmojiPicker.vue'
import type { ISubject } from '@/mock/knowledge'

const route = useRoute()
const router = useRouter()
const categoryId = computed(() => route.params.categoryId as string)
const subjectId = computed(() => route.params.subjectId as string)
const categoryName = computed(() => (route.query.categoryName as string) || '分类详情')

const subject = ref<ISubject | null>(null)
const pageLoading = ref(false)
const isSaving = ref(false)

const form = ref({
  name: '',
  icon: '',
  difficulty: '入门',
})

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' },
]

async function fetchData() {
  pageLoading.value = true
  try {
    const res = await knowledgeApi.getSubject(subjectId.value)
    if (res.code === 0) {
      subject.value = res.data as ISubject
      form.value = {
        name: subject.value.name,
        icon: subject.value.icon,
        difficulty: subject.value.difficulty,
      }
    } else {
      ElMessage.error(res.message || '获取学科失败')
    }
  } catch {
    ElMessage.error('获取学科失败')
  } finally {
    pageLoading.value = false
  }
}

async function handleSave() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入学科名称')
    return
  }
  isSaving.value = true
  try {
    const res = await knowledgeApi.updateSubject(subjectId.value, form.value)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      router.push({
        path: `/content/knowledge/${categoryId.value}/subjects/${subjectId.value}/detail`,
        query: { categoryName: categoryName.value }
      })
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    isSaving.value = false
  }
}

function handleGoBack() {
  router.push({
    path: `/content/knowledge/${categoryId.value}/subjects/${subjectId.value}/detail`,
    query: { categoryName: categoryName.value }
  })
}

onMounted(fetchData)
</script>

<template>
  <div v-loading="pageLoading" class="subject-edit-page">
    <template v-if="!pageLoading && subject">
      <el-breadcrumb class="subject-edit-page__breadcrumb" separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/content/knowledge' }">内容管理</el-breadcrumb-item>
        <el-breadcrumb-item>编辑学科</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="subject-edit-page__top-bar">
        <el-button
          text
          :icon="ArrowLeft"
          class="subject-edit-page__back-btn"
          @click="handleGoBack"
        >
          返回详情
        </el-button>
        <el-button type="primary" :loading="isSaving" @click="handleSave">
          保存
        </el-button>
      </div>

      <div class="subject-edit-page__form-card">
        <h2 class="subject-edit-page__form-title">
          <el-icon><Edit /></el-icon>
          编辑学科信息
        </h2>
        <el-form label-position="top" class="subject-edit-page__form">
          <el-form-item label="学科名称">
            <el-input v-model="form.name" placeholder="请输入学科名称" />
          </el-form-item>
          <el-form-item label="图标">
            <EmojiPicker v-model="form.icon" />
          </el-form-item>
          <el-form-item label="难度">
            <el-radio-group v-model="form.difficulty">
              <el-radio-button
                v-for="opt in difficultyOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.subject-edit-page {
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
    justify-content: space-between;
  }

  &__back-btn {
    font-size: 14px;
    color: var(--app-text-secondary);

    &:hover {
      color: var(--app-primary-color);
    }
  }

  &__form-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 16px;
    padding: 28px 32px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  &__form-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--app-font-heading);
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text-primary);
    margin: 0 0 24px 0;

    .el-icon {
      font-size: 20px;
      color: var(--app-primary-color);
    }
  }

  &__form {
    max-width: 640px;
  }
}
</style>
