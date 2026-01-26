<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { site, theme } = useData()

const version = computed(() => theme.value.version || '1.0.0')

const currentEnv = computed(() => {
  return typeof window !== 'undefined' && window.location.pathname.includes('/staging/') ? 'Staging' : 'Main'
})

const switchEnv = () => {
  if (typeof window === 'undefined') return
  const repoBase = '/TypeScript-Boilerplate/'
  window.location.href = repoBase
}

const goToReleases = () => {
  if (typeof window !== 'undefined') {
    window.open('https://github.com/rslucena/TypeScript-Boilerplate/releases', '_blank')
  }
}
</script>

<template>
  <div class="env-selector-wrapper">
    <div class="version-tag" @click="goToReleases">
      v{{ version }}
    </div>
    <div class="env-selector" @click="switchEnv" :title="`Switch to ${currentEnv === 'Main' ? 'Staging' : 'Main'}`">
      <div class="env-badge" :class="currentEnv.toLowerCase()">
        <span class="dot"></span>
        <span class="env-text">{{ currentEnv }}</span>
        <span class="chevron">▼</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.env-selector-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 2px;
  margin-left: 12px;
  height: fit-content;
  align-self: center;
}

.version-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-right: 1px solid var(--vp-c-divider);
}

.version-tag:hover {
  color: var(--vp-c-brand-1);
}

.env-selector {
  display: flex;
  align-items: center;
  padding: 0 4px;
  cursor: pointer;
  user-select: none;
}

.env-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.env-badge:hover {
  background: var(--vp-c-bg-soft);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.main .dot {
  background-color: #10b981;
}

.staging .dot {
  background-color: #f59e0b;
}

.env-text {
  line-height: 1;
  color: var(--vp-c-text-1);
}

.chevron {
  font-size: 7px;
  opacity: 0.5;
}

.env-badge:hover .chevron {
  opacity: 1;
}

@media (max-width: 959px) {
  .env-selector-wrapper {
    margin-left: 8px;
    margin-right: 0;
  }
}
</style>

