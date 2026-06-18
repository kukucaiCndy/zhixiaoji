import { sdk, checkAuthAndRedirect } from '@/api/sdk-client'
import type { ApiResponse, PaginatedData, WorkflowType, UpdateConfigRequest, ExecuteWorkflowRequest, ExecuteWorkflowStreamEvent, WorkflowExecutionLog, ExecutionQueryParams } from '@zhixiaoji/api-sdk-web'
import { workflowMock } from '@/mock/workflow'

function toPaginated<T>(res: PaginatedData<T>): { list: T[]; total: number; page: number; pageSize: number } {
  return { list: res.items, total: res.total, page: res.page, pageSize: res.pageSize }
}

function isSuccess<T>(res: ApiResponse<T>): res is ApiResponse<T> & { data: NonNullable<T> } {
  if (res.code === 0 && res.data != null) return true
  checkAuthAndRedirect(res)
  return false
}

function isOk(res: ApiResponse<unknown>): boolean {
  if (res.code === 0) return true
  checkAuthAndRedirect(res)
  return false
}

export const workflowApi = {
  async getProviderCount() {
    try {
      const res = await sdk.workflow.getProviderCount()
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.getProviderCount()
    }
  },

  async listProviders(params: { page: number; pageSize: number; status?: string; keyword?: string }) {
    try {
      const res = await sdk.workflow.listProviders(params)
      if (isSuccess(res)) {
        return { code: 0, data: toPaginated(res.data), message: 'ok' }
      }
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.listProviders(params)
    }
  },

  async getProvider(id: string) {
    try {
      const res = await sdk.workflow.getProvider(id)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.getProvider(id)
    }
  },

  async createProvider(data: { name: string; description?: string; endpointUrl: string; authType: 'api_key' | 'oauth2' | 'bearer_token' | 'custom'; authConfig?: Record<string, string>; status?: string }) {
    try {
      const res = await sdk.workflow.createProvider(data)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.createProvider(data)
    }
  },

  async updateProvider(id: string, data: { name?: string; description?: string; endpointUrl?: string; authType?: 'api_key' | 'oauth2' | 'bearer_token' | 'custom'; authConfig?: Record<string, string>; status?: string }) {
    try {
      const res = await sdk.workflow.updateProvider(id, data)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.updateProvider(id, data)
    }
  },

  async deleteProvider(id: string) {
    try {
      const res = await sdk.workflow.deleteProvider(id)
      if (isOk(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.deleteProvider(id)
    }
  },

  async listModelConfigs(params: { page: number; pageSize: number; llmProvider?: string; status?: string; keyword?: string }) {
    try {
      const res = await sdk.workflow.listModelConfigs(params)
      if (isSuccess(res)) {
        return { code: 0, data: toPaginated(res.data), message: 'ok' }
      }
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.listModelConfigs(params)
    }
  },

  async getModelConfig(id: string) {
    try {
      const res = await sdk.workflow.getModelConfig(id)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.getModelConfig(id)
    }
  },

  async createModelConfig(data: { name: string; llmProvider: string; baseUrl: string; model: string; apiKey: string; inputMaxTokens?: number; outputMaxTokens?: number; thinkingLevel?: '' | 'low' | 'medium' | 'high'; status?: string }) {
    try {
      const res = await sdk.workflow.createModelConfig(data)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.createModelConfig(data)
    }
  },

  async updateModelConfig(id: string, data: { name?: string; llmProvider?: string; baseUrl?: string; model?: string; apiKey?: string; inputMaxTokens?: number; outputMaxTokens?: number; thinkingLevel?: '' | 'low' | 'medium' | 'high'; status?: string }) {
    try {
      const res = await sdk.workflow.updateModelConfig(id, data)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.updateModelConfig(id, data)
    }
  },

  async deleteModelConfig(id: string) {
    try {
      const res = await sdk.workflow.deleteModelConfig(id)
      if (isOk(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.deleteModelConfig(id)
    }
  },

  async listConfigs(params: { page: number; pageSize: number; providerType?: string; type?: string; status?: string; keyword?: string }) {
    try {
      const res = await sdk.workflow.listConfigs({
        page: params.page,
        pageSize: params.pageSize,
        keyword: params.keyword,
        type: params.type as WorkflowType | undefined,
        status: params.status,
      })
      if (isSuccess(res)) {
        return { code: 0, data: toPaginated(res.data), message: 'ok' }
      }
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.listConfigs(params)
    }
  },

  async getConfig(id: string) {
    try {
      const res = await sdk.workflow.getConfig(id)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.getConfig(id)
    }
  },

  async createConfig(data: { providerType: 'coze' | 'private'; providerId: number | null; type: 'chapter_generation' | 'section_content_generation' | 'image_generation' | 'video_generation' | 'questions_generation'; name: string; remoteWorkflowId?: string; outputMode?: string; nodeCount: number; nodesConfig: { nodeIndex: number; nodeName: string; modelConfigId: string; systemPrompt?: string; userPrompt?: string }[]; status?: string }) {
    try {
      const res = await sdk.workflow.createConfig({
        providerType: data.providerType,
        providerId: data.providerId ? String(data.providerId) : undefined,
        type: data.type,
        name: data.name,
        remoteWorkflowId: data.remoteWorkflowId,
        outputMode: data.outputMode as 'streaming' | 'non_streaming' | undefined,
        nodeCount: data.nodeCount,
        nodesConfig: data.nodesConfig,
        status: data.status,
      })
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.createConfig(data)
    }
  },

  async updateConfig(id: string, data: { providerType?: 'coze' | 'private'; providerId?: number | null; type?: 'chapter_generation' | 'section_content_generation' | 'image_generation' | 'video_generation' | 'questions_generation'; name?: string; remoteWorkflowId?: string; outputMode?: 'streaming' | 'non_streaming'; nodeCount?: number; nodesConfig?: { nodeIndex: number; nodeName: string; modelConfigId: string; systemPrompt?: string; userPrompt?: string }[]; status?: string }) {
    try {
      const res = await sdk.workflow.updateConfig(id, {
        ...data,
        providerId: data.providerId !== undefined ? (data.providerId !== null ? String(data.providerId) : null) : undefined,
      } as UpdateConfigRequest)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.updateConfig(id, data)
    }
  },

  async deleteConfig(id: string) {
    try {
      const res = await sdk.workflow.deleteConfig(id)
      if (isOk(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.deleteConfig(id)
    }
  },

  async getModelsByProvider(provider: string) {
    try {
      const res = await sdk.workflow.listModels(provider)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return workflowMock.getModelsByProvider(provider)
    }
  },

  getModelProviderOptions() {
    return workflowMock.getModelProviderOptions()
  },

  async executeWorkflow(data: ExecuteWorkflowRequest): Promise<AsyncGenerator<ExecuteWorkflowStreamEvent>> {
    return sdk.workflow.executeWorkflow(data)
  },

  async getExecutionTask(taskId: string) {
    try {
      const res = await sdk.workflow.getExecutionTask(taskId)
      if (isSuccess(res)) return res
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return { code: -1, data: null, message: '获取执行任务失败' }
    }
  },

  async listExecutions(params?: ExecutionQueryParams) {
    try {
      const res = await sdk.workflow.listExecutions(params)
      if (isSuccess(res)) {
        return { code: 0, data: toPaginated(res.data), message: 'ok' }
      }
      throw new Error('API error')
    } catch (ex) {
      checkAuthAndRedirect(ex)
      return { code: -1, data: { list: [], total: 0, page: 1, pageSize: 20 }, message: '获取执行日志失败' }
    }
  },
}