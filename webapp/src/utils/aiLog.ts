/**
 * AI workflow event log entry
 */
export interface IAiLogEntry {
  type: 'started' | 'progress' | 'completed' | 'error'
  time: string
  message: string
}

/**
 * Extract a human-readable log message from a workflow stream event
 */
export function extractAiLogMessage(
  eventType: string,
  data: unknown,
  eventIndex: number
): string {
  switch (eventType) {
    case 'started': {
      const d = data as Record<string, unknown> | undefined
      const taskId = d?.taskId as string | undefined
      const attempt = d?.attempt as number | undefined
      const maxAttempts = d?.maxAttempts as number | undefined
      const parts: string[] = ['AI 任务已启动']
      if (taskId) parts.push(`任务ID: ${String(taskId).slice(0, 8)}...`)
      if (attempt && maxAttempts) parts.push(`(第 ${attempt}/${maxAttempts} 次尝试)`)
      return parts.join('，')
    }
    case 'progress': {
      if (!data) return `第 ${eventIndex} 步：正在处理中...`
      if (typeof data === 'string') {
        const trimmed = data.trim()
        // Try to parse as JSON for better formatting
        try {
          const parsed = JSON.parse(trimmed)
          return formatProgressData(parsed, eventIndex)
        } catch {
          return `第 ${eventIndex} 步：${trimmed.length > 150 ? trimmed.slice(0, 150) + '...' : trimmed}`
        }
      }
      if (typeof data === 'object') {
        return formatProgressData(data as Record<string, unknown>, eventIndex)
      }
      return `第 ${eventIndex} 步：处理中...`
    }
    case 'completed': {
      const d = data as Record<string, unknown> | undefined
      const executionTimeMs = d?.executionTimeMs as number | undefined
      const output = d?.output
      const parts: string[] = ['AI 生成完成']
      if (executionTimeMs) {
        parts.push(`总耗时 ${(executionTimeMs / 1000).toFixed(1)}s`)
      }
      if (output) {
        const summary = summarizeOutput(output)
        if (summary) parts.push(summary)
      }
      return parts.join('，')
    }
    case 'error': {
      const d = data as Record<string, unknown> | undefined
      const error = (d?.error as string) || '未知错误'
      return `错误：${error}`
    }
    default:
      return `事件：${eventType}`
  }
}

/**
 * Format progress event data into a readable message
 */
function formatProgressData(data: Record<string, unknown>, eventIndex: number): string {
  // Check for SSE streaming content field (from workflow node output)
  const content = data.content as string | undefined
  const nodeTitle = data.node_title as string | undefined
  const nodeIsFinish = data.node_is_finish as boolean | undefined
  const contentType = data.content_type as string | undefined

  if (content || nodeTitle) {
    const parts: string[] = [`第 ${eventIndex} 步`]
    if (nodeTitle) {
      parts.push(nodeTitle)
    }
    if (content) {
      // Show up to 200 chars of streaming content
      const trimmed = content.length > 200 ? content.slice(0, 200) + '...' : content
      parts.push(trimmed)
    }
    if (nodeIsFinish) {
      parts.push('[完成]')
    }
    return parts.join('：')
  }

  // Try common fields that indicate meaningful progress
  const message = data.message as string | undefined
  const step = data.step as string | undefined
  const status = data.status as string | undefined
  const chapter = data.chapter as string | undefined
  const name = data.name as string | undefined
  const title = data.title as string | undefined

  const parts: string[] = [`第 ${eventIndex} 步`]

  if (message || step || status) {
    parts.push(message || step || status || '')
  }
  if (chapter || name || title) {
    parts.push(`正在处理：${chapter || name || title}`)
  }

  // If no recognizable fields, show a brief summary
  if (parts.length === 1) {
    const keys = Object.keys(data)
    if (keys.length === 0) {
      parts.push('处理中...')
    } else if (keys.length <= 2) {
      const firstValue = data[keys[0]]
      const valStr = typeof firstValue === 'string'
        ? firstValue.length > 80 ? firstValue.slice(0, 80) + '...' : firstValue
        : JSON.stringify(firstValue).slice(0, 80)
      parts.push(`${keys[0]}: ${valStr}`)
    } else {
      parts.push(`处理中 (${keys.length} 个数据字段)`)
    }
  }

  return parts.join('：')
}

/**
 * Summarize the completed output for the log
 */
function summarizeOutput(output: unknown): string {
  if (Array.isArray(output)) {
    if (output.length === 0) return '无生成结果'
    // Try to extract names/titles from array items
    const names = output
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return (item as Record<string, unknown>).chapter
            || (item as Record<string, unknown>).name
            || (item as Record<string, unknown>).title
            || ''
        }
        return ''
      })
      .filter(Boolean)
    if (names.length > 0) {
      const preview = names.slice(0, 3).join('、')
      const suffix = names.length > 3 ? ` 等${names.length}项` : ` 共${names.length}项`
      return `生成：${preview}${suffix}`
    }
    return `共生成 ${output.length} 项`
  }
  if (typeof output === 'object' && output !== null) {
    const obj = output as Record<string, unknown>
    const title = obj.chapter || obj.name || obj.title || obj.section
    if (title) return `结果：${String(title)}`
    const keys = Object.keys(obj)
    if (keys.length <= 3) {
      return `结果：${keys.join('、')}`
    }
    return `结果包含 ${keys.length} 个字段`
  }
  if (typeof output === 'string') {
    return output.length > 100 ? `结果：${output.slice(0, 100)}...` : `结果：${output}`
  }
  return ''
}

/**
 * Format elapsed seconds into a readable time string
 */
export function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m${s}s`
}
