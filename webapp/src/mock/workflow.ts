import { success, delay, paginate } from './base'

function randomStrId(): string {
  return String(Math.floor(Math.random() * 100000) + 1)
}

interface IWorkflowProvider {
  id: string
  name: string
  description: string
  endpointUrl: string
  authType: 'api_key' | 'oauth2' | 'bearer_token' | 'custom'
  authConfig: Record<string, string> | null
  status: string
  createdAt: string
  updatedAt: string
}

interface IWorkflowModelConfig {
  id: string
  name: string
  llmProvider: string
  baseUrl: string
  model: string
  apiKey: string
  inputMaxTokens: number | null
  outputMaxTokens: number | null
  thinkingLevel: string | null
  status: string
  createdAt: string
  updatedAt: string
}

type WorkflowType = 'chapter_generation' | 'section_content_generation' | 'image_generation' | 'video_generation' | 'questions_generation'

type ProviderType = 'coze' | 'private'

interface ILLMNodeConfig {
  nodeIndex: number
  nodeName: string
  modelConfigId: string
  systemPrompt?: string
  userPrompt?: string
}

interface IWorkflowConfig {
  id: string
  providerType: ProviderType
  providerId: number | null
  providerName: string
  type: WorkflowType
  name: string
  remoteWorkflowId: string | null
  outputMode: 'streaming' | 'non_streaming'
  nodeCount: number
  nodesConfig: ILLMNodeConfig[]
  status: string
  createdAt: string
  updatedAt: string
}

const providerList: IWorkflowProvider[] = [
  { id: '1', name: 'OpenAI', description: 'OpenAI API 供应商', endpointUrl: 'https://api.openai.com/v1', authType: 'api_key', authConfig: null, status: 'active', createdAt: '2026-05-01 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '2', name: '阿里云通义千问', description: '阿里云通义千问大模型服务', endpointUrl: 'https://dashscope.aliyuncs.com/api/v1', authType: 'api_key', authConfig: null, status: 'active', createdAt: '2026-05-02 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '3', name: 'DeepSeek', description: 'DeepSeek 大模型服务', endpointUrl: 'https://api.deepseek.com/v1', authType: 'api_key', authConfig: null, status: 'active', createdAt: '2026-05-05 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '4', name: 'COZE', description: 'COZE 工作流平台', endpointUrl: 'https://api.coze.cn/v1', authType: 'bearer_token', authConfig: null, status: 'active', createdAt: '2026-05-05 10:00:00', updatedAt: '2026-05-15 14:00:00' },
]

const modelConfigList: IWorkflowModelConfig[] = [
  { id: '1', name: 'GPT-4o', llmProvider: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o', apiKey: 'sk-****openai****', inputMaxTokens: 2048000, outputMaxTokens: 512000, thinkingLevel: 'high', status: 'active', createdAt: '2026-05-01 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '2', name: 'GPT-4o-mini', llmProvider: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', apiKey: 'sk-****openai****', inputMaxTokens: 2048000, outputMaxTokens: 512000, thinkingLevel: 'low', status: 'active', createdAt: '2026-05-01 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '3', name: '通义千问-turbo', llmProvider: '阿里云通义千问', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', model: 'qwen-turbo', apiKey: 'sk-****aliyun****', inputMaxTokens: 2048000, outputMaxTokens: 512000, thinkingLevel: 'medium', status: 'active', createdAt: '2026-05-02 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '4', name: '通义千问-plus', llmProvider: '阿里云通义千问', baseUrl: 'https://dashscope.aliyuncs.com/api/v1', model: 'qwen-plus', apiKey: 'sk-****aliyun****', inputMaxTokens: 2048000, outputMaxTokens: 512000, thinkingLevel: 'high', status: 'active', createdAt: '2026-05-02 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '5', name: 'DeepSeek-V3', llmProvider: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat', apiKey: 'sk-****deepseek****', inputMaxTokens: 2048000, outputMaxTokens: 512000, thinkingLevel: 'medium', status: 'active', createdAt: '2026-05-05 10:00:00', updatedAt: '2026-05-15 14:00:00' },
]

const workflowConfigList: IWorkflowConfig[] = [
  { id: '1', providerType: 'private', providerId: 1, providerName: 'OpenAI', type: 'chapter_generation', name: '章节生成-OpenAI', remoteWorkflowId: null, outputMode: 'streaming', nodeCount: 2, nodesConfig: [{ nodeIndex: 1, nodeName: '分析主题', modelConfigId: '1', systemPrompt: '你是一个教育专家', userPrompt: '分析主题{topic}' }, { nodeIndex: 2, nodeName: '生成章节', modelConfigId: '1', systemPrompt: '你是一个教学内容编写专家', userPrompt: '生成章节内容' }], status: 'active', createdAt: '2026-05-10 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '2', providerType: 'coze', providerId: 4, providerName: 'COZE', type: 'section_content_generation', name: '小节内容生成-COZE', remoteWorkflowId: 'wf_coze_001', outputMode: 'non_streaming', nodeCount: 1, nodesConfig: [{ nodeIndex: 1, nodeName: '生成小节内容', modelConfigId: '5', systemPrompt: '你是一个教育内容编写专家', userPrompt: '生成小节内容' }], status: 'active', createdAt: '2026-05-11 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '3', providerType: 'private', providerId: 2, providerName: '阿里云通义千问', type: 'image_generation', name: '生图-通义千问', remoteWorkflowId: null, outputMode: 'non_streaming', nodeCount: 1, nodesConfig: [{ nodeIndex: 1, nodeName: '生成图片', modelConfigId: '3', systemPrompt: '你是一个图片生成专家', userPrompt: '根据描述生成图片' }], status: 'active', createdAt: '2026-05-12 10:00:00', updatedAt: '2026-05-15 14:00:00' },
  { id: '4', providerType: 'coze', providerId: 4, providerName: 'COZE', type: 'video_generation', name: '视频生成-COZE', remoteWorkflowId: 'wf_coze_002', outputMode: 'non_streaming', nodeCount: 1, nodesConfig: [{ nodeIndex: 1, nodeName: '生成视频脚本', modelConfigId: '5', systemPrompt: '你是一个教学视频脚本编写专家', userPrompt: '编写视频脚本' }], status: 'inactive', createdAt: '2026-05-13 10:00:00', updatedAt: '2026-05-15 14:00:00' },
]

const modelProviderOptions = [
  { label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { label: '阿里云通义千问', models: ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-long'] },
  { label: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { label: '百度文心一言', models: ['ERNIE-4.0-8K', 'ERNIE-3.5-8K', 'ERNIE-Speed-8K'] },
  { label: '月之暗面', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
  { label: '智谱AI', models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash'] },
]

export const workflowMock = {
  async getProviderCount() {
    await delay(200)
    return success({ count: providerList.length })
  },

  async listProviders(params: { page: number; pageSize: number; status?: string; keyword?: string }) {
    await delay(300)
    let filtered = [...providerList]
    if (params.status) filtered = filtered.filter((p) => p.status === params.status)
    if (params.keyword) filtered = filtered.filter((p) => p.name.includes(params.keyword!) || (p.description && p.description.includes(params.keyword!)))
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getProvider(id: string) {
    await delay(200)
    const provider = providerList.find((p) => p.id === id)
    if (!provider) return { code: -1, data: null, message: '供应商不存在' }
    return success(provider)
  },

  async createProvider(data: { name: string; description?: string; endpointUrl: string; authType: string; authConfig?: Record<string, string>; status?: string }) {
    await delay(400)
    const newProvider: IWorkflowProvider = {
      id: randomStrId(),
      name: data.name,
      description: data.description || '',
      endpointUrl: data.endpointUrl,
      authType: data.authType as IWorkflowProvider['authType'],
      authConfig: data.authConfig || null,
      status: data.status || 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    providerList.unshift(newProvider)
    return success(newProvider, '供应商创建成功')
  },

  async updateProvider(id: string, data: Partial<Omit<IWorkflowProvider, 'id' | 'createdAt' | 'updatedAt'>>) {
    await delay(400)
    const index = providerList.findIndex((p) => p.id === id)
    if (index === -1) return { code: -1, data: null, message: '供应商不存在' }
    providerList[index] = { ...providerList[index], ...data, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
    return success(providerList[index], '供应商更新成功')
  },

  async deleteProvider(id: string) {
    await delay(300)
    const index = providerList.findIndex((p) => p.id === id)
    if (index === -1) return { code: -1, data: null, message: '供应商不存在' }
    providerList.splice(index, 1)
    return success(null, '供应商已删除')
  },

  async getProviderConfigs(providerId: string) {
    await delay(200)
    return success(workflowConfigList.filter((c) => c.providerId && String(c.providerId) === providerId))
  },

  async getConfigCount() {
    await delay(200)
    return success({ count: workflowConfigList.length })
  },

  async listModelConfigs(params: { page: number; pageSize: number; llmProvider?: string; status?: string; keyword?: string }) {
    await delay(300)
    let filtered = [...modelConfigList]
    if (params.llmProvider) filtered = filtered.filter((m) => m.llmProvider === params.llmProvider)
    if (params.status) filtered = filtered.filter((m) => m.status === params.status)
    if (params.keyword) filtered = filtered.filter((m) => m.name.includes(params.keyword!) || m.model.includes(params.keyword!))
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getModelConfig(id: string) {
    await delay(200)
    const config = modelConfigList.find((m) => m.id === id)
    if (!config) return { code: -1, data: null, message: '模型配置不存在' }
    return success(config)
  },

  async createModelConfig(data: {
    name: string
    llmProvider: string
    baseUrl: string
    model: string
    apiKey: string
    inputMaxTokens?: number
    outputMaxTokens?: number
    thinkingLevel?: string
    status?: string
  }) {
    await delay(400)
    const newConfig: IWorkflowModelConfig = {
      id: randomStrId(),
      name: data.name,
      llmProvider: data.llmProvider,
      baseUrl: data.baseUrl,
      model: data.model,
      apiKey: data.apiKey,
      inputMaxTokens: data.inputMaxTokens ?? 2048000,
      outputMaxTokens: data.outputMaxTokens ?? 512000,
      thinkingLevel: data.thinkingLevel || null,
      status: data.status || 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    modelConfigList.unshift(newConfig)
    return success(newConfig, '模型配置创建成功')
  },

  async updateModelConfig(id: string, data: Partial<Omit<IWorkflowModelConfig, 'id' | 'createdAt' | 'updatedAt'>>) {
    await delay(400)
    const index = modelConfigList.findIndex((m) => m.id === id)
    if (index === -1) return { code: -1, data: null, message: '模型配置不存在' }
    modelConfigList[index] = { ...modelConfigList[index], ...data, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
    return success(modelConfigList[index], '模型配置更新成功')
  },

  async deleteModelConfig(id: string) {
    await delay(300)
    const index = modelConfigList.findIndex((m) => m.id === id)
    if (index === -1) return { code: -1, data: null, message: '模型配置不存在' }
    modelConfigList.splice(index, 1)
    return success(null, '模型配置已删除')
  },

  async listConfigs(params: { page: number; pageSize: number; providerType?: string; type?: string; status?: string; keyword?: string }) {
    await delay(300)
    let filtered = [...workflowConfigList]
    if (params.providerType) filtered = filtered.filter((c) => c.providerType === params.providerType)
    if (params.type) filtered = filtered.filter((c) => c.type === params.type)
    if (params.status) filtered = filtered.filter((c) => c.status === params.status)
    if (params.keyword) filtered = filtered.filter((c) => c.name.includes(params.keyword!))
    return success(paginate(filtered, { page: params.page, pageSize: params.pageSize }))
  },

  async getConfig(id: string) {
    await delay(200)
    const config = workflowConfigList.find((c) => c.id === id)
    if (!config) return { code: -1, data: null, message: '工作流配置不存在' }
    return success(config)
  },

  async createConfig(data: {
    providerType: ProviderType
    providerId: number | null
    type: WorkflowType
    name: string
    remoteWorkflowId?: string
    outputMode?: string
    nodeCount: number
    nodesConfig: ILLMNodeConfig[]
    status?: string
  }) {
    await delay(400)
    const provider = providerList.find((p) => p.id === String(data.providerId))
    const newConfig: IWorkflowConfig = {
      id: randomStrId(),
      providerType: data.providerType,
      providerId: data.providerId,
      providerName: provider?.name || (data.providerType === 'coze' ? 'COZE' : '私有部署'),
      type: data.type,
      name: data.name,
      remoteWorkflowId: data.remoteWorkflowId || null,
      outputMode: (data.outputMode as 'streaming' | 'non_streaming') || 'streaming',
      nodeCount: data.nodeCount,
      nodesConfig: data.nodesConfig,
      status: data.status || 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    if (newConfig.status === 'active') {
      workflowConfigList.forEach((c) => {
        if (c.type === newConfig.type && c.status === 'active') {
          c.status = 'inactive'
        }
      })
    }
    workflowConfigList.unshift(newConfig)
    return success(newConfig, '工作流配置创建成功')
  },

  async updateConfig(id: string, data: Partial<Omit<IWorkflowConfig, 'id' | 'createdAt' | 'updatedAt'>>) {
    await delay(400)
    const index = workflowConfigList.findIndex((c) => c.id === id)
    if (index === -1) return { code: -1, data: null, message: '工作流配置不存在' }
    if (data.providerId !== undefined) {
      const provider = providerList.find((p) => p.id === String(data.providerId))
      if (provider) {
        data.providerName = provider.name
      }
    }
    if (data.status === 'active') {
      const configType = data.type || workflowConfigList[index].type
      workflowConfigList.forEach((c) => {
        if (c.id !== id && c.type === configType && c.status === 'active') {
          c.status = 'inactive'
        }
      })
    }
    workflowConfigList[index] = { ...workflowConfigList[index], ...data, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
    return success(workflowConfigList[index], '工作流配置更新成功')
  },

  async deleteConfig(id: string) {
    await delay(300)
    const index = workflowConfigList.findIndex((c) => c.id === id)
    if (index === -1) return { code: -1, data: null, message: '工作流配置不存在' }
    workflowConfigList.splice(index, 1)
    return success(null, '工作流配置已删除')
  },

  async getModelsByProvider(provider: string) {
    await delay(200)
    const option = modelProviderOptions.find((o) => o.label === provider)
    return success(option ? option.models : [])
  },

  getModelProviderOptions() {
    return modelProviderOptions
  },
}