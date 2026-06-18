<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconDisplay from './IconDisplay.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const pickerRef = ref<HTMLElement | null>(null)
const activeTab = ref<'emoji' | 'svg'>('emoji')
const svgInput = ref('')

const isSvg = computed(() => props.modelValue?.trim().startsWith('<svg'))

const emojiList = [
  '📚', '🐍', '💻', '🔧', '🚀', '🌐', '📊', '🎨', '⚡', '🔬',
  '🎯', '💡', '🌟', '🔥', '🎵', '🏆', '📱', '🤖', '🎮', '📷',
  '🗂️', '🧠', '📈', '🛠️', '💎', '🎪', '🎭', '🎨', '🎬', '🎤',
  '🎧', '🎲', '♟️', '🧩', '📕', '📗', '📘', '📙', '🔬', '🔭',
  '🌍', '🌋', '🏔️', '🏖️', '🎠', '🎡', '🎢', '🛝', '🎯', '🏹',
  '🧬', '⚗️', '🔮', '💊', '🩺', '🔑', '🗝️', '⚙️', '🖥️', '🖨️',
  '📡', '🎥', '📽️', '📺', '📻', '🎙️', '📞', '📟', '⏰', '🧭',
]

function selectEmoji(emoji: string) {
  emit('update:modelValue', emoji)
  showPicker.value = false
}

function applySvg() {
  const trimmed = svgInput.value.trim()
  if (!trimmed) return
  emit('update:modelValue', trimmed)
  svgInput.value = ''
  showPicker.value = false
}

function onDocumentClick(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    showPicker.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="pickerRef" class="emoji-picker">
    <div class="emoji-picker__trigger" @click="showPicker = !showPicker">
      <span class="emoji-picker__current">
        <IconDisplay :icon="modelValue || '❓'" />
      </span>
      <span class="emoji-picker__hint">{{ modelValue ? '点击更换' : '点击选择图标' }}</span>
    </div>
    <Transition name="emoji-fade">
      <div v-if="showPicker" class="emoji-picker__dropdown">
        <!-- Tabs -->
        <div class="emoji-picker__tabs">
          <button
            type="button"
            class="emoji-picker__tab"
            :class="{ 'emoji-picker__tab--active': activeTab === 'emoji' }"
            @click="activeTab = 'emoji'"
          >
            Emoji
          </button>
          <button
            type="button"
            class="emoji-picker__tab"
            :class="{ 'emoji-picker__tab--active': activeTab === 'svg' }"
            @click="activeTab = 'svg'"
          >
            SVG
          </button>
        </div>

        <!-- Emoji Grid -->
        <div v-if="activeTab === 'emoji'" class="emoji-picker__grid">
          <div
            v-for="emoji in emojiList"
            :key="emoji"
            class="emoji-picker__item"
            :class="{ 'emoji-picker__item--active': modelValue === emoji }"
            @click="selectEmoji(emoji)"
          >
            {{ emoji }}
          </div>
        </div>

        <!-- SVG Input -->
        <div v-if="activeTab === 'svg'" class="emoji-picker__svg">
          <textarea
            v-model="svgInput"
            class="emoji-picker__svg-textarea"
            placeholder="粘贴 SVG 代码，例如：&#10;&lt;svg viewBox=&quot;0 0 24 24&quot;&gt;&lt;circle cx=&quot;12&quot; cy=&quot;12&quot; r=&quot;10&quot; fill=&quot;#409eff&quot;/&gt;&lt;/svg&gt;"
            rows="6"
            spellcheck="false"
          />
          <div v-if="svgInput.trim()" class="emoji-picker__svg-preview">
            <span class="emoji-picker__svg-preview-label">预览：</span>
            <span class="emoji-picker__svg-preview-icon" v-html="svgInput" />
          </div>
          <button
            type="button"
            class="emoji-picker__svg-apply"
            :disabled="!svgInput.trim()"
            @click="applySvg"
          >
            应用 SVG
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.emoji-picker {
  position: relative;
  display: inline-block;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border: 1px solid var(--app-border-color, #dcdfe6);
    border-radius: 8px;
    cursor: pointer;
    background: var(--app-bg-color, #f5f7fa);
    transition: border-color 0.2s, box-shadow 0.2s;
    min-width: 140px;
    user-select: none;

    &:hover {
      border-color: var(--app-primary-color, #409eff);
      box-shadow: 0 0 0 1px var(--app-primary-color, #409eff);
    }
  }

  &__current {
    font-size: 28px;
    line-height: 1;
    display: flex;
    align-items: center;
  }

  &__hint {
    font-size: 13px;
    color: var(--app-text-secondary, #909399);
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 100;
    padding: 8px;
    background: var(--app-bg-card, #fff);
    border: 1px solid var(--app-border-color, #e4e7ed);
    border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    min-width: 380px;
  }

  // Tabs
  &__tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    padding: 2px;
    background: var(--app-bg-color, #f5f7fa);
    border-radius: 8px;
  }

  &__tab {
    flex: 1;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    background: transparent;
    color: var(--app-text-secondary, #909399);
    transition: all 0.2s;

    &--active {
      background: var(--app-bg-card, #fff);
      color: var(--app-text-primary, #303133);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    &:hover:not(&--active) {
      color: var(--app-text-primary, #303133);
    }
  }

  // Emoji Grid
  &__grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 4px;
    max-height: 220px;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    font-size: 22px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s;
    user-select: none;

    &:hover {
      background: var(--app-primary-color-light, #ecf5ff);
      transform: scale(1.2);
    }

    &--active {
      background: var(--app-primary-color, #409eff);
      transform: scale(1.15);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
    }
  }

  // SVG Input
  &__svg {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__svg-textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--app-border-color, #dcdfe6);
    border-radius: 8px;
    font-family: 'Courier New', Consolas, 'Liberation Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      border-color: var(--app-primary-color, #409eff);
      box-shadow: 0 0 0 1px var(--app-primary-color, #409eff);
    }
  }

  &__svg-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--app-bg-color, #f5f7fa);
    border-radius: 8px;
  }

  &__svg-preview-label {
    font-size: 12px;
    color: var(--app-text-secondary, #909399);
    flex-shrink: 0;
  }

  &__svg-preview-icon {
    font-size: 28px;
    display: inline-flex;
    align-items: center;

    :deep(svg) {
      width: 28px;
      height: 28px;
    }
  }

  &__svg-apply {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    background: var(--app-primary-color, #409eff);
    color: #fff;
    transition: opacity 0.2s;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
  }
}

.emoji-fade-enter-active,
.emoji-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.emoji-fade-enter-from,
.emoji-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>