<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
}>()

const isSvg = computed(() => props.icon?.trim().startsWith('<svg'))

const isUrl = computed(() => {
  const v = props.icon?.trim()
  if (!v) return false
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/')
})
</script>

<template>
  <span v-if="isSvg" v-html="icon" class="icon-display" />
  <img v-else-if="isUrl" :src="icon" class="icon-display icon-display--img" alt="icon" />
  <span v-else>{{ icon }}</span>
</template>

<style scoped lang="scss">
.icon-display {
  display: inline-flex;
  align-items: center;

  :deep(svg) {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }

  &--img {
    width: 1.2em;
    height: 1.2em;
    object-fit: contain;
  }
}
</style>