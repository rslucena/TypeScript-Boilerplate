<script setup>
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls, ControlButton } from '@vue-flow/controls'
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

const copySuccess = ref(false)

const exportToBuilder = () => {
  const nodesExport = props.nodes.map(n => ({
    id: n.id,
    type: n.type,
    label: n.label || n.data?.label,
    position: n.position,
    style: { ...n.style, ...n.data?.style }
  }))

  const edgesExport = props.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    label: e.label || e.data?.label,
    animated: e.animated || e.data?.animated,
    markerEnd: 'MarkerType.ArrowClosed',
    type: e.type,
    style: { ...e.style, ...e.data?.style }
  }))

  const scriptContent = `
<script setup>
import { MarkerType } from '@vue-flow/core'

const nodes = ${JSON.stringify(nodesExport, null, 2)}

const edges = ${JSON.stringify(edgesExport, null, 2).replace(/"markerEnd": "MarkerType.ArrowClosed"/g, 'markerEnd: MarkerType.ArrowClosed')}
<\/script>

<InteractiveFlow :nodes="nodes" :edges="edges" />
`

  navigator.clipboard.writeText(scriptContent.trim())
  copySuccess.value = true
  setTimeout(() => { copySuccess.value = false }, 2000)
}

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
        
        <Controls>
          <ControlButton title="Export to Builder" @click="exportToBuilder">
            <svg v-if="copySuccess" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" fill="currentColor"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 10h5l-6 6-6-6h5V3h2v7zm-9 9h16v-7h2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8h2v7z" fill="currentColor"/></svg>
          </ControlButton>
        </Controls>
        
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
