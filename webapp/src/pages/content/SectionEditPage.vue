<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { knowledgeApi } from '@/api/modules/content'
import { sdk } from '@/api/sdk-client'
import type { ISection, ColorScheme } from '@/mock/knowledge'
import type { IAiLogEntry } from '@/utils/aiLog'
import { extractAiLogMessage, formatElapsed } from '@/utils/aiLog'

const route = useRoute()
const router = useRouter()

const categoryId = computed(() => route.params.categoryId as string)
const subjectId = computed(() => route.params.subjectId as string)
const chapterId = computed(() => route.params.chapterId as string)
const sectionId = computed(() => route.params.sectionId as string)

const pageLoading = ref(true)
const isGenerating = ref(false)
const isSaving = ref(false)
const isGeneratingPage = ref(false)

const categoryName = computed(() => (route.query.categoryName as string) || '分类详情')
const chapterName = computed(() => (route.query.chapterName as string) || '学科详情')

const section = ref<ISection | null>(null)

const viewMode = ref<'code' | 'preview'>('preview')
const htmlContent = ref('')
const editorIframeKey = ref(0)
const previewKey = ref(0)

let autoSaveTimer: ReturnType<typeof setInterval> | null = null
let isComposing = false

const hasContent = computed(() => !!htmlContent.value.trim())

function handleSync() {
  const iframe = getEditorIframe()
  if (!iframe) return
  const doc = getEditorDoc(iframe)
  if (!doc?.body) return
  htmlContent.value = doc.body.innerHTML
  previewKey.value++
}

function getEditorIframe(): HTMLIFrameElement | null {
  return document.querySelector('.section-edit-page__editor-iframe') as HTMLIFrameElement | null
}

function getEditorDoc(iframe: HTMLIFrameElement): Document | null {
  return iframe.contentDocument || iframe.contentWindow?.document || null
}

function execCmd(command: string, value?: string) {
  const iframe = getEditorIframe()
  if (!iframe) return
  getEditorDoc(iframe)?.execCommand(command, false, value)
  iframe.focus()
}

function queryCmdState(command: string, value?: string): boolean {
  const iframe = getEditorIframe()
  if (!iframe) return false
  return getEditorDoc(iframe)?.queryCommandState(command) || false
}

function handleBold() { execCmd('bold') }
function handleItalic() { execCmd('italic') }
function handleUnderline() { execCmd('underline') }
function handleStrike() { execCmd('strikeThrough') }
function handleH1() { execCmd('formatBlock', '<h1>') }
function handleH2() { execCmd('formatBlock', '<h2>') }
function handleH3() { execCmd('formatBlock', '<h3>') }
function handleUl() { execCmd('insertUnorderedList') }
function handleOl() { execCmd('insertOrderedList') }
function handleQuote() { execCmd('formatBlock', '<blockquote>') }
function handleClean() { execCmd('removeFormat') }
function handleForeColor(color: string) { execCmd('foreColor', color) }
function handleHiliteColor(color: string) { execCmd('hiliteColor', color) }

const fileRef = ref<HTMLInputElement>()

function handleInsertLink() {
  const url = window.prompt('请输入链接地址：')
  if (url) execCmd('createLink', url)
}

function handleInsertImage() {
  fileRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const iframe = getEditorIframe()
    if (!iframe) return
    const doc = getEditorDoc(iframe)
    if (!doc) return
    doc.execCommand('insertImage', false, reader.result as string)
    iframe.focus()
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function alignSelectedImage(style: string) {
  const iframe = getEditorIframe()
  if (!iframe) return
  const doc = getEditorDoc(iframe)
  if (!doc) return
  const img = doc.querySelector('img.selected-img') as HTMLImageElement | null
  if (!img) return
  img.style.cssText += ';' + style
  iframe.focus()
}

function handleImageAlignLeft() { alignSelectedImage('float:left;margin:8px 16px 8px 0;max-width:50%') }
function handleImageAlignCenter() { alignSelectedImage('float:none;display:block;margin:8px auto;max-width:100%') }
function handleImageAlignRight() { alignSelectedImage('float:right;margin:8px 0 8px 16px;max-width:50%') }

function onEditorLoad(e: Event) {
  const iframe = e.target as HTMLIFrameElement
  const doc = getEditorDoc(iframe)
  if (!doc) return

  doc.addEventListener('compositionstart', () => { isComposing = true })
  doc.addEventListener('compositionend', () => { isComposing = false })

  doc.addEventListener('keydown', (ke: KeyboardEvent) => {
    if (ke.ctrlKey && ke.key === 'b') { ke.preventDefault(); execCmd('bold') }
    if (ke.ctrlKey && ke.key === 'i') { ke.preventDefault(); execCmd('italic') }
    if (ke.ctrlKey && ke.key === 'u') { ke.preventDefault(); execCmd('underline') }
  })

  // Image click → select + show alignment buttons
  doc.addEventListener('click', (ev: MouseEvent) => {
    const target = ev.target as HTMLElement
    if (target.tagName === 'IMG') {
      ev.stopPropagation()
      const imgs = doc.querySelectorAll('img.selected-img')
      imgs.forEach((img) => img.classList.remove('selected-img'))
      target.classList.add('selected-img')
    } else {
      doc.querySelectorAll('img.selected-img').forEach((img) => img.classList.remove('selected-img'))
    }
  })

  // Image alignment shortcuts
  doc.addEventListener('keydown', (ke: KeyboardEvent) => {
    const sel = doc.querySelector('img.selected-img') as HTMLImageElement | null
    if (!sel) return
    if (ke.key === 'ArrowLeft' && ke.ctrlKey) { ke.preventDefault(); sel.style.cssText += ';float:left;margin:8px 16px 8px 0' }
    if (ke.key === 'ArrowRight' && ke.ctrlKey) { ke.preventDefault(); sel.style.cssText += ';float:right;margin:8px 0 8px 16px' }
    if (ke.key === 'ArrowUp' && ke.ctrlKey) { ke.preventDefault(); sel.style.cssText += ';float:none;display:block;margin:8px auto' }
  })
}

function switchMode(mode: 'code' | 'preview') {
  if (mode === 'preview' && isCompleteHtmlDocument(htmlContent.value)) {
    section.value!.htmlContent = htmlContent.value
    htmlContent.value = extractBodyContent(htmlContent.value)
    editorIframeKey.value++
    previewKey.value++
  }
  if (mode === 'code') {
    const full = reconstructFullHtml(htmlContent.value)
    if (full) htmlContent.value = full
  }
  viewMode.value = mode
}

function isCompleteHtmlDocument(html: string): boolean {
  const trimmed = html.trim()
  return trimmed.startsWith('<!DOCTYPE html>') || trimmed.startsWith('<!doctype html>') || trimmed.startsWith('<html')
}

function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return bodyMatch ? bodyMatch[1].trim() : html
}

function reconstructFullHtml(bodyContent: string): string | null {
  if (!section.value?.htmlContent || !isCompleteHtmlDocument(section.value.htmlContent)) {
    return null
  }
  const bodyMatch = section.value.htmlContent.match(/(<body[^>]*>)[\s\S]*?(<\/body>)/i)
  if (bodyMatch) {
    const beforeBody = section.value.htmlContent.substring(0, bodyMatch.index! + bodyMatch[1].length)
    const afterBody = section.value.htmlContent.substring(bodyMatch.index! + bodyMatch[0].length - bodyMatch[2].length)
    return `${beforeBody}\n${bodyContent}\n${afterBody}`
  }
  return null
}

function buildEditorDoc(): string {
  const fullHtml = reconstructFullHtml(htmlContent.value) || htmlContent.value
  const rawHtml = fullHtml || htmlContent.value
  if (isCompleteHtmlDocument(rawHtml)) {
    return rawHtml.replace(/<body([^>]*)>/i, '<body$1 contenteditable="true">')
  }
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:24px; outline:none; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif; line-height:1.7; }
  img { max-width:100%; height:auto; display:block; margin:8px auto; border-radius:8px; cursor:pointer; transition:outline .15s; }
  img.selected-img { outline:3px solid var(--app-primary-color, #409eff); outline-offset:2px; }
  img:hover { outline:2px dashed #ccc; outline-offset:2px; }
</style></head>
<body contenteditable="true">${rawHtml}</body>
</html>`
}

function buildPreviewDoc(): string {
  if (section.value?.htmlContent && isCompleteHtmlDocument(section.value.htmlContent)) {
    return section.value.htmlContent
  }
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif; line-height:1.6; }
  img { max-width:100%; height:auto; display:block; margin:8px auto; }
</style></head>
<body>${htmlContent.value}</body>
</html>`
}

async function fetchData() {
  pageLoading.value = true
  try {
    const secRes = await knowledgeApi.getSection(sectionId.value)

    if (secRes.code === 0) {
      section.value = secRes.data as ISection
      const draft = loadDraft()
      if (draft !== null) {
        htmlContent.value = draft
        if (isCompleteHtmlDocument(draft)) {
          section.value.htmlContent = draft
          htmlContent.value = extractBodyContent(draft)
        }
      } else if (section.value.htmlContent) {
        if (isCompleteHtmlDocument(section.value.htmlContent)) {
          htmlContent.value = extractBodyContent(section.value.htmlContent)
        } else {
          htmlContent.value = section.value.htmlContent
        }
      }
    }
  } catch { ElMessage.error('加载数据失败，请稍后重试') }
  finally { pageLoading.value = false }
}

function loadDraft(): string | null {
  try {
    const key = `section_edit_draft_${sectionId.value}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const data = JSON.parse(stored)
      if (data.html && data.timestamp) {
        if (section.value?.updatedAt && new Date(data.timestamp) > new Date(section.value.updatedAt)) {
          return data.html as string
        }
      }
    }
  } catch { localStorage.removeItem(`section_edit_draft_${sectionId.value}`) }
  return null
}

function saveDraft() {
  try { localStorage.setItem(`section_edit_draft_${sectionId.value}`, JSON.stringify({ html: htmlContent.value, timestamp: new Date().toISOString() })) } catch { /* ignore */ }
}
function clearDraft() {
  try { localStorage.removeItem(`section_edit_draft_${sectionId.value}`) } catch { /* ignore */ }
}
function startAutoSave() {
  autoSaveTimer = setInterval(() => { if (htmlContent.value.trim()) saveDraft() }, 30000)
}
function stopAutoSave() {
  if (autoSaveTimer) { clearInterval(autoSaveTimer); autoSaveTimer = null }
}

const aiStep = ref('')
const aiLogs = ref<IAiLogEntry[]>([])
const isWorkflowRunning = ref(false)
let elapsedTimer: ReturnType<typeof setInterval> | null = null

async function handleGenerate() {
  if (!section.value) return
  isGenerating.value = true
  isWorkflowRunning.value = true
    aiStep.value = '正在连接 AI 服务...'
    aiLogs.value = []
    const startTime = Date.now()
  elapsedTimer = setInterval(() => {
    if (!isWorkflowRunning.value) return
    aiStep.value = `AI 正在生成内容，已用时 ${Math.floor((Date.now() - startTime) / 1000)}s`
  }, 1000)

  let hasCompleted = false
    let eventIndex = 0
    try {
    let scheme: ColorScheme | null = null
    try { const r = await knowledgeApi.getDefaultColorScheme(); if (r.code === 0 && r.data) scheme = r.data as ColorScheme } catch { /* ignore */ }
    const inputParams = { chapter: chapterName.value || section.value.chapterName || '', section: section.value.title, knowledge_point: section.value.knowledgePoint, color_system: scheme?.workflowInput || undefined }
    const stream = sdk.workflow.executeWorkflow({ type: 'section_content_generation', inputParams })
    let next = await stream.next()
    while (!next.done) {
      const event = next.value
      eventIndex++
      const logMsg = extractAiLogMessage(event.type, event.data, eventIndex)
      aiLogs.value.push({ type: event.type as IAiLogEntry['type'], time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)), message: logMsg })
      aiStep.value = event.type === 'completed' ? '内容生成完成' : event.type === 'error' ? '生成失败' : '正在生成...'

      if (event.type === 'started') {
        isWorkflowRunning.value = true
      } else if (event.type === 'progress') {
        isWorkflowRunning.value = false
      } else if (event.type === 'completed') {
        const raw = event.data as Record<string, unknown> | undefined
        const outputStr = raw?.Output as string
        if (outputStr) {
          try { const p = JSON.parse(outputStr) as { section_html: string } | { output: { section_html: string } }; const h = 'output' in p ? p.output.section_html : p.section_html; if (h) { setContentFromWorkflow(h); hasCompleted = true; break } } catch { /* ignore */ }
        } else if (raw?.section_html) { setContentFromWorkflow(raw.section_html as string); hasCompleted = true; break }
      } else if (event.type === 'error') {
        throw new Error(event.error || '工作流执行失败')
      }
      next = await stream.next()
    }
  } catch (err) {
    console.warn('AI content: SDK workflow failed:', err)
    aiLogs.value.push({ type: 'error', time: formatElapsed(Math.floor((Date.now() - startTime) / 1000)), message: `异常：${String(err)}` })
  }

  if (!hasCompleted) {
    console.error('[AI小节] 工作流未返回 completed 事件')
    ElMessage.error('AI 生成内容失败，工作流未完成')
  }
  isGenerating.value = false; isWorkflowRunning.value = false
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }; aiStep.value = ''; aiLogs.value = []
}

function setContentFromWorkflow(newHtml: string) {
  if (isCompleteHtmlDocument(newHtml)) { section.value!.htmlContent = newHtml; htmlContent.value = extractBodyContent(newHtml) }
  else { htmlContent.value = newHtml }
  viewMode.value = 'preview'; editorIframeKey.value++; previewKey.value++
}

async function handleRegenerate() {
  try { await ElMessageBox.confirm('重新生成将覆盖当前内容，确定继续？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }); await handleGenerate() } catch { /* cancelled */ }
}

async function handleSave() {
  if (isSaving.value) return
  if (!sectionId.value) return
  if (!htmlContent.value.trim()) { ElMessage.warning('请先编辑内容'); return }
  try {
    isSaving.value = true
    const fullHtml = reconstructFullHtml(htmlContent.value) || htmlContent.value
    const saveRes = await knowledgeApi.saveSectionHtml(sectionId.value, fullHtml)
    if (saveRes.code !== 0) { ElMessage.error(saveRes.message || '保存失败'); return }
    clearDraft()
    applySaveResult(saveRes.data)
    ElMessage.success('内容已保存')
  } catch { ElMessage.error('保存失败，请稍后重试') }
  finally { isSaving.value = false }
}

function applySaveResult(data: unknown) {
  const raw = data as Record<string, unknown> | null
  if (!raw) return
  const latestHtml = (raw.latestHtmlContent || '') as string
  section.value = { ...raw, htmlContent: latestHtml } as unknown as ISection
  if (latestHtml) {
    if (isCompleteHtmlDocument(latestHtml)) {
      htmlContent.value = extractBodyContent(latestHtml)
    } else {
      htmlContent.value = latestHtml
    }
  }
  editorIframeKey.value++
  previewKey.value++
}

function goBack() {
  router.push({
    path: `/content/knowledge/${categoryId.value}/subjects/${subjectId.value}/detail`,
    query: { categoryName: categoryName.value }
  })
}

async function handleGenerateHtmlPage() {
  if (!sectionId.value) return
  if (!htmlContent.value.trim()) { ElMessage.warning('请先编辑内容'); return }
  try {
    isGeneratingPage.value = true
    const fullHtml = reconstructFullHtml(htmlContent.value) || htmlContent.value
    const saveRes = await knowledgeApi.saveSectionHtml(sectionId.value, fullHtml)
    if (saveRes.code !== 0) { ElMessage.error(saveRes.message || '保存失败'); return }
    clearDraft()
    applySaveResult(saveRes.data)
    const genRes = await knowledgeApi.generateSectionPage(sectionId.value)
    if (genRes.code === 0) {
      const d = genRes.data as unknown as Record<string, unknown> | undefined
      const hUrl = d?.htmlUrl as string | undefined
      if (hUrl) { window.open(hUrl.startsWith('http') ? hUrl : `http://192.168.16.129:12302${hUrl}`, '_blank'); ElMessage.success('HTML页面已生成') }
      else ElMessage.warning('未获取到页面URL')
    } else ElMessage.error(genRes.message || '生成HTML页面失败')
  } catch { ElMessage.error('生成HTML页面失败，请稍后重试') }
  finally { isGeneratingPage.value = false }
}

onMounted(async () => { await fetchData(); startAutoSave() })
onUnmounted(() => { stopAutoSave(); saveDraft(); if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null } })
</script>

<template>
  <div class="section-edit-page" v-loading="pageLoading">
    <el-breadcrumb class="section-edit-page__breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/content/knowledge' }">内容管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: `/content/knowledge/${categoryId}/detail` }">{{ categoryName }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: `/content/knowledge/${categoryId}/subjects/${subjectId}/detail` }">{{ chapterName }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ section?.title || '加载中...' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="section-edit-page__top-bar">
      <el-button :icon="ArrowLeft" @click="goBack">返回章节详情</el-button>
      <h2 class="section-edit-page__title">章节编辑：{{ section?.title || '加载中...' }}</h2>
      <el-button-group>
        <el-button :type="viewMode === 'code' ? 'primary' : 'default'" @click="switchMode('code')">代码</el-button>
        <el-button :type="viewMode === 'preview' ? 'primary' : 'default'" @click="switchMode('preview')">预览</el-button>
      </el-button-group>
      <el-button type="primary" :loading="isSaving" @click="handleSave">保存</el-button>
      <el-button :loading="isGenerating" @click="handleGenerate" v-if="section">AI 生成内容</el-button>
      <el-button :loading="isGeneratingPage" @click="handleGenerateHtmlPage">生成HTML页面</el-button>
    </div>

    <div v-if="isGenerating" class="section-edit-page__generating">
      <div class="section-edit-page__generating-card">
        <el-icon class="section-edit-page__generating-spinner" :size="36"><svg viewBox="0 0 24 24" width="36" height="36"><circle cx="12" cy="12" r="10" fill="none" stroke="#D4916E" stroke-width="2" stroke-dasharray="31.4 31.4"/></svg></el-icon>
        <p class="section-edit-page__generating-text">{{ aiStep }}</p>
        <div class="section-edit-page__ai-log">
          <div
            v-for="(log, i) in aiLogs"
            :key="i"
            class="section-edit-page__ai-log-item"
            :class="`section-edit-page__ai-log-item--${log.type}`"
          >
            <span class="section-edit-page__ai-log-time">[{{ log.time }}]</span>
            <span class="section-edit-page__ai-log-msg">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isGenerating" class="section-edit-page__layout">
      <!-- Code View -->
      <div v-show="viewMode === 'code'" class="section-edit-page__code-panel">
        <div class="section-edit-page__code-label">HTML 源码编辑器</div>
        <el-input v-model="htmlContent" type="textarea" class="section-edit-page__code-textarea" placeholder="在此编辑或粘贴 HTML 源码..." />
      </div>

      <!-- Preview View -->
      <div v-show="viewMode === 'preview'" class="section-edit-page__preview-layout">
        <!-- Editor Panel -->
        <div class="section-edit-page__editor-panel">
          <div class="section-edit-page__editor-label">富文本编辑器</div>
          <div class="section-edit-page__toolbar">
            <button @click="handleBold" title="粗体 Ctrl+B">B</button>
            <button @click="handleItalic" title="斜体 Ctrl+I"><i>I</i></button>
            <button @click="handleUnderline" title="下划线 Ctrl+U"><u>U</u></button>
            <button @click="handleStrike" title="删除线"><s>S</s></button>
            <span class="section-edit-page__toolbar-sep" />
            <button @click="handleH1">H1</button>
            <button @click="handleH2">H2</button>
            <button @click="handleH3">H3</button>
            <span class="section-edit-page__toolbar-sep" />
            <button @click="handleUl" title="无序列表">•≡</button>
            <button @click="handleOl" title="有序列表">1.</button>
            <button @click="handleQuote" title="引用">❝</button>
            <span class="section-edit-page__toolbar-sep" />
            <button @click="handleForeColor('#FF6B00')" title="橙色文字" style="color:#FF6B00">A</button>
            <button @click="handleForeColor('#3B82F6')" title="蓝色文字" style="color:#3B82F6">A</button>
            <button @click="handleForeColor('#292524')" title="默认文字" style="color:#292524">A</button>
            <button @click="handleHiliteColor('#FEF3C7')" title="高亮" style="background:#FEF3C7">▣</button>
            <span class="section-edit-page__toolbar-sep" />
            <button @click="handleInsertLink" title="插入链接">🔗</button>
            <button @click="handleInsertImage" title="插入图片（本地文件）">🖼</button>
            <button @click="handleImageAlignLeft" title="图片左对齐 Ctrl+←">◧</button>
            <button @click="handleImageAlignCenter" title="图片居中 Ctrl+↑">◲</button>
            <button @click="handleImageAlignRight" title="图片右对齐 Ctrl+→">◨</button>
            <button @click="handleClean" title="清除格式">✕</button>
            <span class="section-edit-page__toolbar-sep" />
            <button class="section-edit-page__sync-btn" @click="handleSync" title="同步到预览">⟳ 同步</button>
          </div>
          <div class="section-edit-page__editor-body">
            <iframe
              :key="'ed-' + editorIframeKey"
              class="section-edit-page__editor-iframe"
              :srcdoc="buildEditorDoc()"
              sandbox="allow-scripts allow-same-origin"
              title="Content Editor"
              referrerpolicy="no-referrer"
              @load="onEditorLoad"
            />
          </div>
          <input ref="fileRef" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </div>

        <!-- Phone Preview -->
        <div class="section-edit-page__preview-panel">
          <div class="section-edit-page__preview-header">
            <span>手机预览</span>
            <el-button size="small" @click="handleRegenerate" v-if="hasContent">重新生成</el-button>
          </div>
          <div class="section-edit-page__preview-body">
            <div class="section-edit-page__preview-phone">
              <div class="section-edit-page__preview-statusbar"><span>9:41</span></div>
              <div class="section-edit-page__preview-urlbar"><span>{{ section?.title || '章节详情' }}</span></div>
              <div class="section-edit-page__preview-content">
                <iframe :key="'pv-' + previewKey" class="section-edit-page__preview-iframe" :srcdoc="buildPreviewDoc()" sandbox="allow-scripts allow-same-origin" title="Phone Preview" referrerpolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-edit-page {
  display: flex; flex-direction: column; gap: 20px;
  height: calc(100vh - var(--app-navbar-height) - 48px); min-height: 0;

  &__breadcrumb { flex-shrink: 0;
    :deep(.el-breadcrumb__inner) { color: var(--app-text-secondary); font-size: 13px; &.is-link { color: var(--app-text-secondary); &:hover { color: var(--app-primary-color); } } }
    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) { color: var(--app-text-primary); font-weight: 500; }
  }

  &__top-bar { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; gap: 12px; }
  &__title { font-family: var(--app-font-heading); font-size: 20px; font-weight: 700; color: var(--app-text-primary); margin: 0; flex: 1; text-align: center; }

  &__generating { display: flex; justify-content: center; padding-top: 80px; flex: 1; }
  &__generating-card { display: flex; flex-direction: column; align-items: center; gap: 20px; background: var(--app-bg-card); border: 1px solid var(--app-border-color); border-radius: 12px; padding: 48px 64px; min-width: 480px; }
  &__generating-spinner { color: var(--app-primary-color); animation: spin 1.5s linear infinite; :deep(svg) circle { stroke: var(--app-primary-color); stroke-linecap: round; animation: dash 1.5s ease-in-out infinite; } }
  &__generating-text { font-size: 15px; color: var(--app-text-secondary); margin: 0; }

  &__ai-log {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: var(--app-bg-color);
    border-radius: 8px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--app-border-color);
      border-radius: 2px;
    }
  }

  &__ai-log-item {
    display: flex;
    gap: 8px;
    padding: 2px 0;

    &--started .section-edit-page__ai-log-msg { color: var(--app-primary-color); }
    &--progress .section-edit-page__ai-log-msg { color: var(--app-text-regular); }
    &--completed .section-edit-page__ai-log-msg { color: var(--app-success-color); font-weight: 500; }
    &--error .section-edit-page__ai-log-msg { color: var(--app-danger-color); }
  }

  &__ai-log-time {
    color: var(--app-text-secondary);
    flex-shrink: 0;
    white-space: nowrap;
  }

  &__ai-log-msg {
    color: var(--app-text-regular);
    word-break: break-all;
  }

  &__generating-detail { font-size: 12px; color: #999; margin: 0; max-width: 360px; text-align: center; word-break: break-all; line-height: 1.5; }

  &__layout { flex: 1; min-height: 0; display: flex; }

  &__code-panel { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #1e1e1e; border-radius: 12px; padding: 16px; overflow: hidden; }
  &__code-label { font-size: 13px; color: #4ADE80; margin-bottom: 12px; font-weight: 500; flex-shrink: 0; }
  &__code-textarea { flex: 1; min-height: 0;
    :deep(.el-textarea__inner) { background: transparent; border: none; color: #e5e5e5; font-family: 'Courier New', Consolas, 'Liberation Mono', monospace; font-size: 13px; line-height: 1.7; resize: none; height: 100% !important; box-shadow: none; &::placeholder { color: #666; } &:focus { box-shadow: none; } }
  }

  &__preview-layout { flex: 1; min-height: 0; display: flex; gap: 16px; }

  &__editor-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--app-bg-card); border: 1px solid var(--app-border-color); border-radius: 12px; overflow: hidden; }
  &__editor-label { font-size: 13px; color: var(--app-text-secondary); padding: 10px 16px; font-weight: 500; border-bottom: 1px solid var(--app-border-light); flex-shrink: 0; }

  &__toolbar { display: flex; align-items: center; gap: 2px; padding: 6px 10px; border-bottom: 1px solid var(--app-border-light); flex-shrink: 0; flex-wrap: wrap;
    button { min-width: 26px; height: 26px; border: none; background: transparent; border-radius: 3px; cursor: pointer; font-size: 12px; color: var(--app-text-secondary); display: flex; align-items: center; justify-content: center; padding: 0 5px;
      &:hover { background: var(--app-bg-color); color: var(--app-text-primary); }
    }
  }
  &__toolbar-sep { width: 1px; height: 16px; background: var(--app-border-light); margin: 0 3px; }
  &__sync-btn { color: var(--app-primary-color) !important; font-weight: 600; }

  &__editor-body { flex: 1; min-height: 0; }
  &__editor-iframe { width: 100%; height: 100%; border: none; }

  &__preview-panel { width: 430px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--app-bg-card); border: 1px solid var(--app-border-color); border-radius: 12px; overflow: hidden; }
  &__preview-header { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--app-text-secondary); background: var(--app-bg-color); padding: 10px 16px; border-bottom: 1px solid var(--app-border-light); flex-shrink: 0; }
  &__preview-body { flex: 1; min-height: 0; display: flex; justify-content: center; align-items: flex-start; overflow-y: auto; padding: 16px; }
  &__preview-phone { width: 375px; aspect-ratio: 9 / 16; border: 1px solid var(--app-border-color); border-radius: 20px; overflow: hidden; background: #FFFBEB; box-shadow: 0 4px 16px rgba(0,0,0,0.08); display: flex; flex-direction: column; flex-shrink: 0; }
  &__preview-statusbar { display: flex; justify-content: center; padding: 6px 0; font-size: 10px; color: #292524; background: #FFFFFF; flex-shrink: 0; }
  &__preview-urlbar { display: flex; justify-content: center; padding: 4px 12px; font-size: 10px; color: var(--app-text-secondary); background: #FEF3C7; border-bottom: 1px solid #FDE68A; flex-shrink: 0; }
  &__preview-content { flex: 1; min-height: 0; overflow: hidden; }
  &__preview-iframe { width: 100%; height: 100%; border: none; }
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes dash { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
</style>
