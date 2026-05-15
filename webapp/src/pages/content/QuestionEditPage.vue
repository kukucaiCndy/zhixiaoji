<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { questionApi, cardApi } from '@/api/modules/content'

interface ICardOption {
  id: number
  title: string
}

interface IFormData {
  type: string
  content: string
  options: { label: string; content: string }[]
  correctAnswer: string | string[]
  explanation: string
  relatedCardId: number | undefined
  difficulty: string
}

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => route.name === 'QuestionEdit')
const pageTitle = computed(() => isEdit.value ? '编辑题目' : '新增题目')
const questionId = computed(() => (isEdit.value ? Number(route.params.id) : null))

const formLoading = ref(false)
const formRef = ref()

const cardOptions = ref<ICardOption[]>([])
const cardSearchKeyword = ref('')

const formData = reactive<IFormData>({
  type: '单选题',
  content: '',
  options: [
    { label: 'A', content: '' },
    { label: 'B', content: '' },
    { label: 'C', content: '' },
    { label: 'D', content: '' }
  ],
  correctAnswer: '',
  explanation: '',
  relatedCardId: undefined,
  difficulty: '入门'
})

const typeOptions = [
  { label: '单选题', value: '单选题' },
  { label: '多选题', value: '多选题' },
  { label: '判断题', value: '判断题' }
]

const difficultyOptions = [
  { label: '入门', value: '入门' },
  { label: '基础', value: '基础' },
  { label: '进阶', value: '进阶' }
]

const formRules = {
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  correctAnswer: [{ required: true, message: '请选择正确答案', trigger: 'change' }]
}

const isSingleChoice = computed(() => formData.type === '单选题')
const isMultiChoice = computed(() => formData.type === '多选题')
const isTrueFalse = computed(() => formData.type === '判断题')

const singleAnswerOptions = computed(() => {
  if (isTrueFalse.value) {
    return [
      { label: '对', value: '对' },
      { label: '错', value: '错' }
    ]
  }
  return formData.options.map((opt) => ({
    label: `${opt.label}. ${opt.content}`,
    value: opt.label
  }))
})

const multiAnswerOptions = computed(() =>
  formData.options.map((opt) => ({
    label: `${opt.label}. ${opt.content}`,
    value: opt.label
  }))
)

const filteredCardOptions = computed(() => {
  if (!cardSearchKeyword.value) return cardOptions.value
  return cardOptions.value.filter((c) =>
    c.title.includes(cardSearchKeyword.value)
  )
})

function handleTypeChange() {
  if (isSingleChoice.value || isTrueFalse.value) {
    formData.correctAnswer = '' as string | string[]
  } else {
    formData.correctAnswer = [] as string | string[]
  }
}

async function fetchCardOptions() {
  try {
    const res = await cardApi.getCards({
      page: 1,
      pageSize: 1000,
      status: '已上架'
    })
    if (res.code === 0) {
      const data = res.data as { list: ICardOption[] }
      cardOptions.value = data.list.map((c) => ({
        id: c.id,
        title: c.title
      }))
    }
  } catch {
    // non-critical
  }
}

async function fetchQuestionDetail() {
  if (!questionId.value) return
  formLoading.value = true
  try {
    const res = await questionApi.getQuestion(questionId.value)
    if (res.code === 0) {
      const q = res.data as Record<string, unknown>
      formData.type = q.type as string || '单选题'
      formData.content = q.content as string || ''
      formData.difficulty = q.difficulty as string || '入门'
      formData.explanation = q.explanation as string || ''
      formData.relatedCardId = q.relatedCardId as number | undefined

      if (q.options) {
        formData.options = q.options as { label: string; content: string }[]
      }

      if (isTrueFalse.value) {
        formData.correctAnswer = q.correctAnswer as string
      } else if (isMultiChoice.value) {
        formData.correctAnswer = (q.correctAnswer as string || '').split(',')
      } else {
        formData.correctAnswer = q.correctAnswer as string
      }
    } else {
      ElMessage.error(res.message || '获取题目详情失败')
    }
  } catch {
    ElMessage.error('获取题目详情失败，请稍后重试')
  } finally {
    formLoading.value = false
  }
}

function goBack() {
  router.push('/content/questions')
}

async function handleSave(status: string) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  // Validate that options are filled for single/multi choice
  if ((isSingleChoice.value || isMultiChoice.value) && !isTrueFalse.value) {
    const emptyOptions = formData.options.filter((opt) => !opt.content.trim())
    if (emptyOptions.length > 0) {
      ElMessage.warning('请填写所有选项内容')
      return
    }
  }

  const correctAnswer = Array.isArray(formData.correctAnswer)
    ? formData.correctAnswer.join(',')
    : formData.correctAnswer

  const data: Record<string, unknown> = {
    type: formData.type,
    content: formData.content,
    difficulty: formData.difficulty,
    correctAnswer,
    explanation: formData.explanation,
    relatedCard: cardOptions.value.find((c) => c.id === formData.relatedCardId)?.title || '',
    status
  }

  if (!isTrueFalse.value) {
    data.options = formData.options
  }

  try {
    if (isEdit.value && questionId.value) {
      const res = await questionApi.updateQuestion(questionId.value, data)
      if (res.code === 0) {
        ElMessage.success('题目更新成功')
        goBack()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      const res = await questionApi.createQuestion(data)
      if (res.code === 0) {
        ElMessage.success('题目创建成功')
        goBack()
      } else {
        ElMessage.error(res.message || '创建失败')
      }
    }
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  }
}
</script>

<template>
  <div class="question-edit-page">
    <!-- Breadcrumb -->
    <el-breadcrumb class="question-edit-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/questions' }">内容管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/questions' }">题目管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Top Bar -->
    <div class="question-edit-page__top-bar">
      <h2 class="question-edit-page__title">{{ pageTitle }}</h2>
      <div class="question-edit-page__top-actions">
        <el-button :icon="ArrowLeft" @click="goBack">返回列表</el-button>
        <el-button @click="handleSave('草稿')">保存为草稿</el-button>
        <el-button type="primary" @click="handleSave('已上架')">保存并上架</el-button>
      </div>
    </div>

    <!-- Form Card -->
    <div v-loading="formLoading" class="question-edit-page__form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
        class="question-edit-page__form"
      >
        <el-form-item label="题目类型">
          <el-radio-group v-model="formData.type" @change="handleTypeChange">
            <el-radio-button
              v-for="opt in typeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- Options for single/multi choice -->
        <template v-if="isSingleChoice || isMultiChoice">
          <el-form-item
            v-for="(option, index) in formData.options"
            :key="option.label"
            :label="'选项 ' + option.label"
          >
            <el-input
              v-model="option.content"
              :placeholder="'请输入选项' + option.label + '的内容'"
              maxlength="200"
            />
          </el-form-item>
        </template>

        <!-- Correct Answer -->
        <el-form-item label="正确答案" prop="correctAnswer">
          <!-- Single choice: radio -->
          <el-radio-group
            v-if="isSingleChoice || isTrueFalse"
            v-model="formData.correctAnswer as string"
          >
            <el-radio
              v-for="opt in singleAnswerOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>

          <!-- Multi choice: checkbox -->
          <el-checkbox-group
            v-if="isMultiChoice"
            v-model="formData.correctAnswer as string[]"
          >
            <el-checkbox
              v-for="opt in multiAnswerOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="答案解析">
          <el-input
            v-model="formData.explanation"
            type="textarea"
            :rows="3"
            placeholder="请输入答案解析（选填）"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="关联卡片">
          <el-select
            v-model="formData.relatedCardId"
            placeholder="请选择关联的知识卡片（可选）"
            style="width: 100%"
            clearable
            filterable
            :filter-method="(val: string) => { cardSearchKeyword = val }"
          >
            <el-option
              v-for="opt in filteredCardOptions"
              :key="opt.id"
              :label="opt.title"
              :value="opt.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="难度">
          <el-radio-group v-model="formData.difficulty">
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
  </div>
</template>

<style scoped lang="scss">
.question-edit-page {
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

  &__title {
    font-family: var(--app-font-heading);
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text-primary);
    margin: 0;
  }

  &__top-actions {
    display: flex;
    gap: 12px;
  }

  &__form-card {
    background: var(--app-bg-card);
    border: 1px solid var(--app-border-color);
    border-radius: 12px;
    padding: 32px;
    max-width: 720px;
  }

  &__form {
    :deep(.el-form-item__label) {
      color: var(--app-text-regular);
      font-weight: 500;
    }
  }
}
</style>
