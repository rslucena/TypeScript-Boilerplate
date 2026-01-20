<script setup>
import { Handle, Position } from '@vue-flow/core'

defineProps(['label'])
</script>

<template>
  <div class="multi-handle-node">
    <Handle type="target" position="top" id="top" />
    <Handle type="source" position="top" id="top-source" />
    <Handle type="target" position="right" id="right" />
    <Handle type="source" position="right" id="right-source" />
    <Handle type="target" position="bottom" id="bottom" />
    <Handle type="source" position="bottom" id="bottom-source" />
    <Handle type="target" position="left" id="left" />
    <Handle type="source" position="left" id="left-source" />
    <div class="node-content">
      {{ label }}
    </div>
  </div>
</template>

<style scoped>
.multi-handle-node {
  padding: 10px 20px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: var(--vp-font-family-base);
  font-weight: 500;
  color: var(--vp-c-text-1);
  min-width: 100px;
  transition: all 0.3s ease;
}

.multi-handle-node:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Hide handles visually unless hovered or connected (optional, but cleaner) */
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  background: var(--vp-c-text-3);
  opacity: 0; /* Hidden by default for cleaner look */
  transition: opacity 0.2s;
}

.multi-handle-node:hover :deep(.vue-flow__handle),
:deep(.vue-flow__handle.connected) {
  opacity: 1;
}

:deep(.vue-flow__handle:hover) {
  background: var(--vp-c-brand);
  width: 12px;
  height: 12px;
}
</style>
