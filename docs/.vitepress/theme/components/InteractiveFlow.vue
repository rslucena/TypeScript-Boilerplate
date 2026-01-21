<script setup>
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { ref } from 'vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import MultiHandleNode from './MultiHandleNode.vue'

const props = defineProps({
  nodes: {
    type: Array,
    default: () => []
  },
  edges: {
    type: Array,
    default: () => []
  }
})

const nodeTypes = {
  'multi-handle': MultiHandleNode
}

const { onInit, onNodeDragStop, onConnect } = useVueFlow()

onInit((vueFlowInstance) => {
  vueFlowInstance.fitView()
})
</script>

<template>
  <div class="interactive-flow-wrapper">
    <div class="flow-container">
      <VueFlow 
        :nodes="nodes" 
        :edges="edges" 
        :node-types="nodeTypes"
        :class="{ dark: $props.dark }"
        fit-view-on-init
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
      >
        <Background pattern-color="#aaa" :gap="16" />
        
        <Controls />
        
        <slot />
      </VueFlow>
    </div>
  </div>
</template>

<style scoped>
.interactive-flow-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--vp-c-bg);
  margin: 24px 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.interactive-flow-wrapper:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: var(--vp-c-brand);
}

.flow-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.flow-container::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(189, 52, 254, 0.08) 0%, rgba(65, 209, 255, 0.08) 50%, transparent 70%);
  top: -20%;
  left: -20%;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
}

.flow-container::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 152, 0, 0.08) 0%, rgba(255, 87, 34, 0.08) 50%, transparent 70%);
  bottom: -10%;
  right: -10%;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
}

:deep(.vue-flow__controls) {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

:deep(.vue-flow__controls-button) {
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

:deep(.vue-flow__controls-button:hover) {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-brand);
}

:deep(.vue-flow__controls-button svg) {
  fill: currentColor;
}
</style>
