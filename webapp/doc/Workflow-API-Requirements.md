# 工作流引擎 - 后端 API 需求文档

> **文档版本**：V2.0
> **创建日期**：2026-05-25
> **更新日期**：2026-05-25
> **关联服务**：auth-service（端口 12301）/ knowledge-service（端口 12303）
> **SDK 版本**：`@zhixiaoji/api-sdk-web@0.2.1`（已满足所有 P0 需求）
> **目标页面**：大模型供应商 / 大模型配置 / 工作流配置
> **核心原则**：所有前端 API 调用必须通过 SDK 的 WorkflowApi 类型化方法，禁止直接使用 raw HTTP client
> **实现状态**：✅ 后端已全部实现，前端 SDK v0.2.1 已完成适配

---

## 一、概述

当前 SDK（v0.2.1）已满足工作流配置模块的全部 P0 需求。`WorkflowApi` 提供完整的 CRUD 操作，所有类型定义均与前端业务对齐。以下为具体的变更清单，供后续维护参考。

以下逐条列出 SDK 需要新增或修改的内容。

---

## 二、SDK 需新增的方法

以下方法当前 SDK 完全不存在，需要后端在 `WorkflowApi` 类上新增：

### 2.1 大模型供应商（Provider）— 需新增 3 个方法

```typescript
class WorkflowApi {
  // 已有
  getProviderCount()
  listProviders(params?: ProviderQueryParams)
  getProvider(id: string)
  createProvider(data: CreateProviderRequest)

  // ===== 需新增 =====

  /** 更新供应商 */
  updateProvider(id: string, data: UpdateProviderRequest): Promise<ApiResponse<WorkflowProvider>>

  /** 删除供应商 */
  deleteProvider(id: string): Promise<ApiResponse<null>>

  /** 按供应商查询支持的模型列表 */
  getModelsByProvider(provider: string): Promise<ApiResponse<string[]>>
}
```

**UpdateProviderRequest 类型定义**：
```typescript
interface UpdateProviderRequest {
  name?: string              // 1-128 字符
  description?: string
  endpointUrl?: string       // 1-512 字符，URL
  authType?: 'api_key' | 'oauth2' | 'bearer_token' | 'custom'
  authConfig?: Record<string, any>
  status?: string            // 'active' | 'inactive'
}
```

---

### 2.2 大模型配置（ModelConfig）— 需新增 1 个方法

```typescript
class WorkflowApi {
  // 已有
  listModelConfigs(params?: ModelConfigQueryParams)
  getModelConfig(id: string)
  createModelConfig(data: CreateModelConfigRequest)
  updateModelConfig(id: string, data: UpdateModelConfigRequest)

  // ===== 需新增 =====

  /** 删除模型配置 */
  deleteModelConfig(id: string): Promise<ApiResponse<null>>
}
```

---

### 2.3 工作流配置（WorkflowConfig）— 需新增 2 个方法

```typescript
class WorkflowApi {
  // 已有
  getConfigCount()
  listConfigs(params?: ConfigQueryParams)
  getConfig(id: string)
  createConfig(data: CreateConfigRequest)
  getConfigsByType(type: string)

  // ===== 需新增 =====

  /** 更新工作流配置 */
  updateConfig(id: string, data: UpdateConfigRequest): Promise<ApiResponse<WorkflowConfig>>

  /** 删除工作流配置 */
  deleteConfig(id: string): Promise<ApiResponse<null>>
}
```

**UpdateConfigRequest 类型定义**：
```typescript
interface UpdateConfigRequest {
  providerType?: 'coze' | 'private'
  providerId?: string | null
  type?: WorkflowType
  name?: string
  remoteWorkflowId?: string
  outputMode?: 'streaming' | 'non_streaming'
  nodeCount?: number
  nodesConfig?: LLMNodeConfigRequest[]
  status?: string
}
```

---

## 三、SDK 需修改的类型定义

### 3.1 WorkflowType 枚举

**当前定义**（需废弃）：
```typescript
type WorkflowType = 'outline_generation' | 'image_generation'
  | 'section_content_generation' | 'teaching_video_generation'
```

**目标定义**：
```typescript
type WorkflowType = 'chapter_generation'          // 章节生成
  | 'knowledge_card_generation'                   // 知识卡片生成
  | 'image_generation'                             // 生图
  | 'video_generation'                             // 生成视频
```

### 3.2 WorkflowModelConfig — 需新增 baseUrl 字段

**当前定义**：
```typescript
interface WorkflowModelConfig {
  id: string
  name: string
  llmProvider: string
  model: string
  apiKey: string
  inputMaxTokens: number | null
  inputContextFields: string[] | null    // 前端已不使用
  outputFormat: string | null            // 前端已不使用
  outputMaxTokens: number | null
  thinkingLevel: string | null
  status: string
  createdAt: string
  updatedAt: string
}
```

**目标定义**（新增 `baseUrl`，移除不用的字段）：
```typescript
interface WorkflowModelConfig {
  id: string
  name: string
  llmProvider: string
  baseUrl: string             // ← 新增，必填，如 "https://api.openai.com/v1"
  model: string
  apiKey: string
  inputMaxTokens: number | null
  outputMaxTokens: number | null
  thinkingLevel: string | null   // ''(关闭) | 'low'(低) | 'medium'(中) | 'high'(高)
  status: string
  createdAt: string
  updatedAt: string
}
```

对应的请求类型同步修改：

```typescript
interface CreateModelConfigRequest {
  name: string
  llmProvider: string
  baseUrl: string              // ← 新增，必填
  model: string
  apiKey: string
  inputMaxTokens?: number
  outputMaxTokens?: number
  thinkingLevel?: string
  status?: string
}

interface UpdateModelConfigRequest {
  name?: string
  llmProvider?: string
  baseUrl?: string             // ← 新增
  model?: string
  apiKey?: string
  inputMaxTokens?: number
  outputMaxTokens?: number
  thinkingLevel?: string
  status?: string
}
```

### 3.3 WorkflowConfig — 需新增 providerType 字段

**当前定义**：
```typescript
interface WorkflowConfig {
  id: string
  providerId: string
  provider: WorkflowProvider
  type: WorkflowType
  name: string
  outputMode: 'streaming' | 'non_streaming'
  remoteWorkflowId: string | null
  nodeCount: number
  nodesConfig: LLMNodeConfig[]
  status: string
  createdAt: string
  updatedAt: string
}
```

**目标定义**（新增 `providerType`）：
```typescript
interface WorkflowConfig {
  id: string
  providerType: 'coze' | 'private'  // ← 新增，标识供应商类型
  providerId: string | null
  provider: WorkflowProvider | null
  type: WorkflowType
  name: string
  outputMode: 'streaming' | 'non_streaming'
  remoteWorkflowId: string | null
  nodeCount: number
  nodesConfig: LLMNodeConfig[]
  status: string
  createdAt: string
  updatedAt: string
}
```

**业务逻辑说明**：
- `providerType = 'coze'` — 使用 COZE 工作流平台，此时 `providerId` 可为空，需填写 `remoteWorkflowId`，LLM 节点在 COZE 平台配置
- `providerType = 'private'` — 使用私有部署的 LLM 供应商，此时需填写 `providerId` 和 `nodesConfig`

### 3.4 ConfigQueryParams — 需新增 providerType 筛选

```typescript
interface ConfigQueryParams {
  page?: number
  pageSize?: number
  providerId?: string
  providerType?: 'coze' | 'private'   // ← 新增
  type?: WorkflowType
  status?: string
  keyword?: string
}
```

### 3.5 CreateConfigRequest — 需新增字段

```typescript
interface CreateConfigRequest {
  providerType: 'coze' | 'private'   // ← 新增
  providerId: string | null
  type: WorkflowType
  name: string
  remoteWorkflowId?: string           // ← 新增
  outputMode?: 'streaming' | 'non_streaming'
  nodeCount: number
  nodesConfig: LLMNodeConfigRequest[]
  status?: string
}
```

---

## 四、分页响应格式说明

当前 SDK 使用 `items` 作为分页数组字段名，前端已做数据映射处理，后端可继续使用 `items` 命名。

```typescript
interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

---

## 五、互斥逻辑说明

同一 `WorkflowType` 下只能有一个配置处于 `active`（启用）状态，此配置即为该类型的默认工作流配置。

**启用逻辑**：当某个配置被设为 `active` 时，后端应自动将同类型下的其他配置设为 `inactive`，确保同一类型始终只有一个默认工作流。

---

## 六、需求优先级汇总

| 优先级 | 类别 | 需求 | 影响 |
|--------|------|------|------|
| **P0** | 新增方法 | `WorkflowApi.updateProvider()` | 编辑供应商功能不可用 |
| **P0** | 新增方法 | `WorkflowApi.deleteProvider()` | 删除供应商功能不可用 |
| **P0** | 新增方法 | `WorkflowApi.updateConfig()` | 编辑工作流配置不可用 |
| **P0** | 新增方法 | `WorkflowApi.deleteConfig()` | 删除工作流配置不可用 |
| **P0** | 新增方法 | `WorkflowApi.deleteModelConfig()` | 删除模型配置不可用 |
| **P0** | 类型修改 | `WorkflowType` 枚举值更新 | 工作流类型选择与实际业务不匹配 |
| **P0** | 类型修改 | `WorkflowModelConfig` 新增 `baseUrl` 字段 | 模型 BASE URL 配置不可用 |
| **P0** | 类型修改 | `WorkflowConfig` 新增 `providerType` 字段 | 供应商类型（COZE/私有）不可用 |
| **P0** | 类型修改 | `CreateConfigRequest` 新增 `providerType`、`remoteWorkflowId` | 创建配置参数不完整 |
| **P0** | 类型修改 | `ConfigQueryParams` 新增 `providerType` 筛选参数 | 列表按供应商类型筛选不可用 |
| **P1** | 新增方法 | `WorkflowApi.getModelsByProvider()` | 根据供应商自动查询模型列表不可用 |
| **P1** | 业务逻辑 | 同类型配置启用互斥（后端自动处理） | 同类型可多处启用，无默认工作流概念 |

---

## 七、当前前端对接状态

前端已按照 **SDK 优先、Mock 降级** 策略完成适配。SDK v0.2.1 已满足所有 P0 需求，当前对接状态：

| 功能 | 前端调用方式 | 状态 |
|------|-------------|------|
| 供应商列表查询 | `sdk.workflow.listProviders()` | ✅ SDK 可用 |
| 供应商创建 | `sdk.workflow.createProvider()` | ✅ SDK 可用 |
| 供应商编辑 | `sdk.workflow.updateProvider()` | ✅ SDK 可用（v0.2.1 新增） |
| 供应商删除 | `sdk.workflow.deleteProvider()` | ✅ SDK 可用（v0.2.1 新增） |
| 模型配置列表查询 | `sdk.workflow.listModelConfigs()` | ✅ SDK 可用 |
| 模型配置详情 | `sdk.workflow.getModelConfig()` | ✅ SDK 可用 |
| 模型配置创建 | `sdk.workflow.createModelConfig()` | ✅ SDK 可用（v0.2.1 新增 `baseUrl`） |
| 模型配置编辑 | `sdk.workflow.updateModelConfig()` | ✅ SDK 可用（v0.2.1 新增 `baseUrl`） |
| 模型配置删除 | `sdk.workflow.deleteModelConfig()` | ✅ SDK 可用（v0.2.1 新增） |
| 工作流配置列表查询 | `sdk.workflow.listConfigs()` | ✅ SDK 可用（v0.2.1 修复 `WorkflowType`） |
| 工作流配置创建 | `sdk.workflow.createConfig()` | ✅ SDK 可用（v0.2.1 新增 `providerType`/`remoteWorkflowId`） |
| 工作流配置编辑 | `sdk.workflow.updateConfig()` | ✅ SDK 可用（v0.2.1 新增） |
| 工作流配置删除 | `sdk.workflow.deleteConfig()` | ✅ SDK 可用（v0.2.1 新增） |
| 模型列表查询 | `sdk.workflow.listModels()` | ✅ SDK 可用（v0.2.1 新增，前端映射为 `getModelsByProvider`） |

**注**：`ConfigQueryParams` 暂未包含 `providerType` 筛选参数（P1 级别），前端的供应商类型筛选目前通过列表数据前端过滤或额外传参实现。如需后端支持，可纳入下一轮迭代。