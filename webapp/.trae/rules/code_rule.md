# 知晓记管理后台 - 代码开发规范

> **版本**：V1.0
> **创建日期**：2026-05-06
> **技术栈**：Vue 3 + TypeScript + Element Plus

---

## 一、通用规范

### 1.1 语言

- 所有**代码**（变量名、函数名、组件名、类名、文件名、注释等）一律使用**英文**
- 所有**用户可见文案**（页面标题、按钮文字、提示信息、表单标签等）使用**中文**
- 禁止在代码中使用拼音命名

### 1.2 缩进与格式

- 缩进使用 **2 个空格**
- 文件末尾保留一个空行
- 行尾不允许有多余空格
- 每行最大长度 **120 个字符**
- 使用单引号，不使用双引号（JS/TS 代码）
- 语句末尾不加分号

### 1.3 编码

- 所有源文件统一使用 **UTF-8** 编码

---

## 二、命名规范

### 2.1 通用命名原则

| 类别 | 规范 | 示例 |
|------|------|------|
| **变量名** | camelCase（小驼峰） | `userList`, `isVisible` |
| **常量名** | UPPER_SNAKE_CASE（大写蛇形） | `MAX_FILE_SIZE`, `API_BASE_URL` |
| **函数名** | camelCase，动词开头 | `fetchUserData`, `handleSubmit` |
| **类名 / 类型名** | PascalCase（大驼峰） | `UserStore`, `LoginParams` |
| **接口名** | PascalCase，加 I 前缀 | `IUserInfo`, `ILoginParams` |
| **枚举名** | PascalCase | `ContentStatus`, `DifficultyLevel` |
| **枚举成员** | PascalCase | `ContentStatus.Draft`, `DifficultyLevel.Beginner` |
| **组件名** | PascalCase | `ProTable`, `CardPreview` |
| **文件名** | camelCase | `userStore.ts`, `cardList.vue` |
| **目录名** | 小写 + 连字符（kebab-case） | `pro-table`, `ai-generate` |

### 2.2 变量命名

```typescript
// 正确
const userList = ref<UserInfo[]>([])
const isLoading = ref(false)
const cardCount = computed(() => cardList.value.length)

// 错误
const list = ref([])                    // 不够具体
const user_list = ref([])               // 使用了下划线
const isLoad = ref(false)               // 语法不完整
const card_num = ref(0)                 // 使用了缩写+下划线
```

### 2.3 布尔变量

表示布尔值的变量应以 `is`, `has`, `can`, `should`, `show` 等开头：

```typescript
const isVisible = ref(false)
const hasPermission = computed(() => userStore.role === 'admin')
const canEdit = computed(() => editMode.value === 'edit')
const showDialog = ref(false)
```

### 2.4 事件命名

- 组件自定义事件使用 `kebab-case`
- 事件名以动词开头，或 `on` 前缀

```typescript
// emits 定义
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'row-click': [row: RowData]
  'save-success': []
}>()
```

---

## 三、Vue 3 编码规范

### 3.1 统一使用 Composition API

整个项目统一使用 `<script setup>` 语法，禁止使用 Options API。

```vue
<script setup lang="ts">
// 正确 - Composition API + <script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

```vue
<script lang="ts">
// 错误 - 禁止使用 Options API
export default defineComponent({
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  methods: { increment() { this.count++ } },
})
</script>
```

### 3.2 组件文件结构

每个 `.vue` 文件的标签顺序：

```vue
<script setup lang="ts">
// 1. 导入（先外部库，后内部模块）
// 2. 组件 props / emits 定义
// 3. 响应式状态
// 4. 计算属性
// 5. 普通函数
// 6. 生命周期钩子
// 7. 暴露给模板的内容（return 由 setup 隐式处理）
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped lang="scss">
/* 样式内容 */
</style>
```

### 3.3 组件通信

| 通信方式 | 适用场景 | 规范 |
|---------|---------|------|
| **props** | 父传子 | 所有 props 必须定义类型，可选的用 `?` |
| **emits** | 子传父 | 所有 emits 必须显式声明 |
| **v-model** | 双向绑定 | 组件支持 `modelValue` + `update:modelValue` |
| **provide/inject** | 跨层级传递 | 仅在 3 层以上嵌套时使用 |
| **Pinia** | 全局状态 | 全局共享状态统一使用 Pinia |

### 3.4 Props 定义规范

```typescript
// 正确 - 使用类型标注 + withDefaults
const props = withDefaults(defineProps<{
  title: string
  content?: string
  visible: boolean
  pageSize?: number
}>(), {
  content: '',
  pageSize: 20,
})
```

### 3.5 Emits 定义规范

```typescript
// 正确 - 使用类型标注
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [data: FormData]
  delete: [id: number]
}>()
```

### 3.6 禁止使用

以下内容禁止在项目中出现：

| 禁止项 | 说明 | 替代方案 |
|--------|------|---------|
| `this` | `<script setup>` 中没有 this | 直接使用响应式变量 |
| `any` 类型 | 禁止 TypeScript 中使用 `any` | 使用 `unknown` 或定义具体类型 |
| `// @ts-ignore` | 禁止绕过类型检查 | 正确定义类型 |
| `console.log` | 调试用后必须删除 | 使用 `console.error` 仅用于错误上报 |
| `setTimeout` 模拟延迟 | 不要用定时器替代数据驱动 | 使用生命周期 / watch |
| `nextTick` 操作 DOM | 能用响应式解决的不用 DOM | 修改响应式数据驱动视图 |

---

## 四、TypeScript 规范

### 4.1 类型定义位置

- **API 相关类型**：放在 `src/api/types/` 下对应模块文件中
- **组件 Props/Emits**：在组件内使用 `defineProps` / `defineEmits` 内联定义
- **全局通用类型**：放在 `src/types/` 目录下
- **Store 类型**：在 Store 文件内定义

### 4.2 接口定义规范

```typescript
// 正确 - 明确的命名和字段类型
export interface IUserInfo {
  id: number
  nickname: string
  avatar: string
  createdAt: string
  isActive: boolean
  level: number
}

// 错误 - 命名模糊、缺少类型
export interface res {  // 命名不清晰
  code: number
  msg: string
  data: any  // 禁止使用 any
}
```

### 4.3 泛型使用

```typescript
// 正确 - 泛型约束分页响应
export interface IPaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

---

## 五、组件规范

### 5.1 组件层级与职责

| 层级 | 命名示例 | 职责 | 对 Pinia 的访问 |
|------|---------|------|----------------|
| **页面组件** | `CardListPage.vue` | 路由入口，组合业务组件 | 允许 |
| **业务组件** | `ProTable.vue` | 通用业务逻辑封装 | 不允许 |
| **通用组件** | `ImageUpload.vue` | 基础 UI 封装 | 不允许 |
| **布局组件** | `AppLayout.vue` | 框架布局 | 不允许 |

### 5.2 组件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| **页面组件** | `XxxPage.vue` | `CardListPage`, `UserDetailPage` |
| **通用业务组件** | `ProXxx.vue` | `ProTable`, `ProForm`, `ProDialog` |
| **业务组件** | 语义命名 | `CardPreview`, `AIGenerate` |
| **布局组件** | `AppXxx.vue` | `AppLayout`, `AppSidebar` |

### 5.3 组件粒度原则

- **单一职责**：一个组件只做一件事
- **可复用判断**：同一段代码在 2 个以上页面出现，提取为通用组件
- **不宜过细**：组件层级不超过 4 层嵌套
- **文件大小**：单个 `.vue` 文件不超过 500 行（超过则考虑拆分）

### 5.4 组件 Props 规范

- Props 定义必须使用 `defineProps` 类型标注
- 所有 Props 必须有明确类型
- 可选的 Props 用 `?` 标记，并用 `withDefaults` 提供默认值
- 禁止修改 Props

### 5.5 组件 Emits 规范

- 所有自定义事件必须在 `defineEmits` 中显式声明
- 事件名使用 `kebab-case`
- 不允许使用 `emit('事件名')` 而不声明

---

## 六、模板规范

### 6.1 模板指令顺序

同一元素上的多个指令按以下顺序排列：

```vue
<!-- 推荐顺序 -->
<div
  v-if="condition"          // 1. 条件渲染
  v-for="item in list"      // 2. 列表渲染（v-if 和 v-for 不放在同一元素）
  v-show="visible"          // 3. 显示隐藏
  v-model="value"           // 4. 双向绑定
  ref="myRef"               // 5. 引用
  :key="item.id"            // 6. 内置绑定 / 自定义绑定
  @click="handleClick"      // 7. 事件
  v-permission="'edit'"     // 8. 自定义指令
>
```

### 6.2 v-if / v-for 禁止同元素

```vue
<!-- 错误 - v-if 和 v-for 在同一元素 -->
<div v-for="item in list" v-if="item.visible" :key="item.id">

<!-- 正确 - 使用 template 包装 -->
<template v-for="item in list" :key="item.id">
  <div v-if="item.visible">{{ item.name }}</div>
</template>
```

### 6.3 模板表达式简洁

```vue
<!-- 错误 - 模板中复杂的表达式 -->
<div>{{ userList.filter(u => u.role === 'admin').map(u => u.name).join(', ') }}</div>

<!-- 正确 - 使用计算属性 -->
<script setup>
const adminNames = computed(() =>
  userList.filter(u => u.role === 'admin').map(u => u.name).join(', ')
)
</script>
<template>
  <div>{{ adminNames }}</div>
</template>
```

---

## 七、样式规范

### 7.1 样式作用域

- 所有组件样式必须使用 `<style scoped>`
- 全局样式放到 `src/assets/styles/global.scss` 中
- 禁止在非全局样式中使用裸标签选择器（如 `div {}`）

```vue
<!-- 正确 -->
<style scoped lang="scss">
.card-list {
  display: flex;
  .card-item {
    margin-bottom: 16px;
  }
}
</style>

<!-- 错误 -->
<style scoped>
div { margin: 0 }  /* 裸标签选择器 */
.list > div { }     /* 深层选择器可能影响子组件 */
</style>
```

### 7.2 SCSS 变量

- 全局 SCSS 变量统一放在 `src/assets/styles/variables.scss`
- 颜色、字体、间距等主题变量使用 CSS 自定义属性

```scss
// variables.scss
:root {
  --app-primary-color: #409eff;
  --app-success-color: #67c23a;
  --app-warning-color: #e6a23c;
  --app-danger-color: #f56c6c;
  --app-sidebar-width: 220px;
  --app-navbar-height: 56px;
}
```

### 7.3 BEM 命名风格

组件内样式推荐使用 BEM 风格：

```scss
<style scoped lang="scss">
.pro-table {
  &__header { }
  &__body { }
  &__footer { }
  &__search { }
  &--loading { }
}
</style>
```

---

## 八、目录与文件规范

### 8.1 目录组织的核心原则

| 目录 | 允许存放的内容 |
|------|---------------|
| `src/api/modules/` | 按模块划分的 API 接口函数 |
| `src/api/types/` | API 相关的 TypeScript 类型定义 |
| `src/api/request.ts` | axios 实例 + 拦截器 |
| `src/components/` | 通用业务组件（跨模块共享） |
| `src/composables/` | 通用组合式逻辑 |
| `src/pages/` | 页面级组件，按模块目录划分 |
| `src/pages/[module]/` | 同一模块下的页面共享的逻辑 |
| `src/store/` | Pinia Store 定义 |
| `src/router/` | 路由配置 |
| `src/utils/` | 纯函数工具 |
| `src/assets/styles/` | 全局样式 |
| `src/assets/images/` | 图片资源 |

### 8.2 模块内私有组件

当某个组件只在特定模块内使用时，放在该模块的 `_components` 目录下：

```
src/pages/content/
├── _components/          # 内容管理模块私有组件
│   ├── ChapterTree.vue
│   └── CardStatusTag.vue
├── cards/
│   ├── CardListPage.vue
│   └── CardEditPage.vue
└── knowledge/
    └── ChapterListPage.vue
```

---

## 九、API 层规范

### 9.1 接口文件命名

```
src/api/
├── request.ts                # axios 实例 + 拦截器
├── modules/
│   ├── dashboard.ts          # 数据看板接口
│   ├── content.ts            # 内容管理接口
│   ├── user.ts               # 用户管理接口
│   ├── operation.ts          # 运营管理接口
│   └── system.ts             # 系统配置接口
└── types/
    ├── dashboard.ts
    ├── content.ts
    ├── user.ts
    ├── operation.ts
    └── system.ts
```

### 9.2 接口函数命名

```typescript
// 统一使用: getXXX / createXXX / updateXXX / deleteXXX
export const contentApi = {
  getCards: (params: CardQuery) => request.get('/api/admin/cards', { params }),
  createCard: (data: CardCreate) => request.post('/api/admin/cards', data),
  updateCard: (id: number, data: CardUpdate) => request.put(`/api/admin/cards/${id}`, data),
  deleteCard: (id: number) => request.delete(`/api/admin/cards/${id}`),
  batchUpdateStatus: (data: BatchStatusUpdate) => request.post('/api/admin/cards/batch-status', data),
}
```

### 9.3 接口调用规则

- 禁止在组件中直接调用 `axios` 或 `request`
- 禁止在组件中直接拼接 URL 字符串
- 所有接口调用必须通过 `src/api/modules/` 下的函数
- 接口函数必须有完整的 TypeScript 类型定义

---

## 十、状态管理规范

### 10.1 Store 定义

```typescript
// 统一使用 setup 语法
export const useAppStore = defineStore('app', () => {
  // state
  const sidebarCollapsed = ref(false)

  // getters
  const sidebarWidth = computed(() => sidebarCollapsed.value ? '64px' : '220px')

  // actions
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, sidebarWidth, toggleSidebar }
})
```

### 10.2 Store 使用原则

- 每个 Store 职责单一，不跨领域存放数据
- 组件内禁止直接修改 Store 的 state，必须通过 action
- 组件内通过 computed 读取 Store 状态
- `userStore` 和 `appStore` 为全局单例，其他 Store 按需创建

---

## 十一、Git 提交规范

### 11.1 提交信息格式

```
<type>(<scope>): <subject>
```

### 11.2 type 类型

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构（非功能性变更） |
| `style` | 代码格式调整（不影响逻辑） |
| `docs` | 文档变更 |
| `chore` | 构建/工具链变更 |
| `perf` | 性能优化 |

### 11.3 提交示例

```
feat(dashboard): 新增用户增长趋势图表
fix(card-edit): 修复富文本编辑器图片上传失败问题
refactor(pro-table): 提取搜索逻辑为独立 composable
style: 统一代码缩进和引号风格
docs: 更新 API 接口文档
```

### 11.4 提交要求

- 每个提交只包含一个功能点或修复
- 提交前必须确保代码无 ESLint 错误
- 禁止提交包含 `console.log` 调试代码

---

## 十二、注释规范

### 12.1 注释原则

- **代码即文档**：优先通过清晰的命名和代码结构表达意图，减少不必要的注释
- **注释 WHY 不注释 WHAT**：注释应解释"为什么这么写"，而不是"写了什么"
- **禁止**添加逐行注释解释每行代码的作用

### 12.2 必须加注释的场景

| 场景 | 说明 |
|------|------|
| **复杂业务逻辑** | 算法、状态机、数据处理 |
| **特殊处理** | 临时性修复、绕过后端 Bug、兼容性处理 |
| **接口类型** | 需要说明字段含义的复杂类型 |

### 12.3 注释格式

```typescript
// 正确 - 说明 WHY
// 此处手动拼接查询条件是因为后端接口不支持多字段排序
const sortParams = buildSortParams(fields)

// 错误 - 注释 WHAT（这段代码本身已经清晰）
// 遍历用户列表
userList.forEach(user => {
  // 检查用户状态
  if (user.isActive) {
    // 添加到活跃列表
    activeUsers.push(user)
  }
})
```

---

## 十三、错误处理规范

### 13.1 异步操作

所有异步操作必须包含错误处理：

```typescript
// 正确
async function fetchData() {
  try {
    tableLoading.value = true
    const res = await contentApi.getCards(queryParams.value)
    cardList.value = res.list
    total.value = res.total
  } catch (error) {
    ElMessage.error('获取卡片列表失败，请稍后重试')
  } finally {
    tableLoading.value = false
  }
}
```

### 13.2 错误处理层级

| 层级 | 处理方式 | 说明 |
|------|---------|------|
| **API 拦截器** | 统一 HTTP 错误处理（401/403/500） | 全局拦截 |
| **API 模块** | 业务逻辑错误处理（如表单校验） | 按模块处理 |
| **页面组件** | 用户交互层面的错误反馈 | Toast 提示 |
| **组件内部** | 组件自身的加载/错误状态 | 组件内处理 |

---

## 十四、性能规范

| 规则 | 说明 |
|------|------|
| **v-for 绑定 key** | 必须使用唯一 key，禁止使用 index |
| **v-if vs v-show** | 频繁切换用 `v-show`，否则用 `v-if` |
| **计算属性缓存** | 模板中复杂表达式用 `computed` 替代 |
| **组件懒加载** | 页面级组件使用 `() => import()` 懒加载 |
| **watch 及时销毁** | 组件卸载时自动清理 watch（使用 `onUnmounted`） |
| **大数据列表** | 超过 1000 条数据使用虚拟滚动 |
| **图片优化** | 列表图片使用懒加载，配置合适尺寸 |

---

## 十五、ESLint 核心规则

```javascript
// .eslintrc.cjs 核心规则
rules: {
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/no-unused-components': 'error',
  'vue/no-mutating-props': 'error',
  'vue/require-explicit-emits': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'prefer-const': 'error',
  'no-var': 'error',
}
```

---

> **文档修订记录**
>
> | 版本 | 日期 | 修订人 | 修订内容 |
> |------|------|--------|----------|
> | V1.0 | 2026-05-06 | 开发团队 | 初始版本，完成代码开发规范定义 |
