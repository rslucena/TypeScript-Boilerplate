<script setup>
import { ref, watch, computed } from 'vue'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import MultiHandleNode from './MultiHandleNode.vue'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

let id = 0
const getId = () => `node_${id++}`

const nodes = ref([])
const edges = ref([])

const { onConnect, addEdges, addNodes, project, vueFlowRef, onNodeDragStop, removeNodes, removeEdges } = useVueFlow()

const selectedElement = ref(null)

const onNodeClick = (event) => {
  selectedElement.value = { type: 'node', data: event.node }
}

const onEdgeClick = (event) => {
  selectedElement.value = { type: 'edge', data: event.edge }
}

const onPaneClick = () => {
  selectedElement.value = null
}

const deleteSelected = () => {
  if (!selectedElement.value) return

  if (selectedElement.value.type === 'node') {
    removeNodes([selectedElement.value.data.id])
  } else if (selectedElement.value.type === 'edge') {
    removeEdges([selectedElement.value.data.id])
  }
  selectedElement.value = null
}

// Drag & Drop Logic
const onDragOver = (event) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  const label = event.dataTransfer?.getData('application/label')
  
  const { left, top } = vueFlowRef.value.getBoundingClientRect()
  
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })
  
  const newNode = {
    id: getId(),
    type: type || 'default',
    position,
    label: label || `${type} node`,
    style: { backgroundColor: 'transparent', color: '#ffffff'},
  }
  
  addNodes([newNode])
}

const onDragStart = (event, nodeType, label) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.setData('application/label', label)
    event.dataTransfer.effectAllowed = 'move'
  }
}

onConnect((params) => {
  addEdges([{ 
    ...params, 
    markerEnd: MarkerType.ArrowClosed, 
    animated: true, 
    type: 'smoothstep',
    label: '',
    style: { stroke: '#b1b1b7' }
  }])
})

const nodeTypes = {
  'multi-handle': MultiHandleNode
}

const generatedCode = ref('')
const showExport = ref(false)

const { toObject } = useVueFlow()

const exportDiagram = () => {
  const flowData = toObject()
  
  const nodesExport = flowData.nodes.map(n => ({
    id: n.id,
    type: n.type,
    label: n.label || n.data?.label,
    position: n.position,
    style: { ...n.style, ...n.data?.style }
  }))

  const edgesExport = flowData.edges.map(e => ({
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
  generatedCode.value = scriptContent.trim()
  showExport.value = true
}


const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedCode.value)
  alert('Copied to clipboard!')
}

const showImport = ref(false)
const importCode = ref('')

const showImportModal = () => {
  showImport.value = true
  importCode.value = ''
}

const handleImport = () => {
  try {
    let code = importCode.value.trim()
    // Remove script tags and template tags if pasted completely
    code = code.replace(/<script setup>|<\/script>|<template>[\s\S]*?<\/template>|<InteractiveFlow[\s\S]*?\/>/g, '')
    // Remove imports
    code = code.replace(/import .* from .*/g, '')
    
    // Check if it's just raw object/array pasted (loose check)
    if (code.startsWith('[') || code.startsWith('{')) {
       // If it looks like JSON/JS Object, try to parse or wrap it
       // But user mentioned 'edges: [...] nodes: [...]', so likely variables
    }

    // Execute in a restricted scope
    // We expect user to paste code that defines 'nodes' and 'edges'
    // We append a return statement
    const safeEval = new Function('MarkerType', `
      ${code}
      return { 
        nodes: typeof nodes !== 'undefined' ? nodes : [], 
        edges: typeof edges !== 'undefined' ? edges : [] 
      }
    `)

    const result = safeEval(MarkerType)
    
    if (result.nodes && Array.isArray(result.nodes)) {
      // Restore styles and data
      nodes.value = result.nodes.map(n => ({
        ...n,
        data: { 
          label: n.label, 
          style: { ...n.style } 
        }
      }))
    }
    
    if (result.edges && Array.isArray(result.edges)) {
      edges.value = result.edges.map(e => ({
        ...e,
        data: {
          label: e.label,
          animated: e.animated,
          style: { ...e.style }
        }
      }))
    }

    showImport.value = false
    alert('Diagram imported successfully!')
  } catch (err) {
    console.error(err)
    alert('Failed to import code. Ensure it is valid JS declaring "nodes" and "edges" arrays.')
  }
}

</script>

<template>
  <div class="dnd-flow">
    <aside class="sidebar-left">
      <div class="description">Drag nodes:</div>
      
      <div class="nodes-list">
        <div class="draggable-node" :draggable="true" @dragstart="onDragStart($event, 'multi-handle', 'Client')">
          Client
        </div>
        
        <div class="draggable-node" :draggable="true" @dragstart="onDragStart($event, 'multi-handle', 'API Route')">
           API Route
        </div>
        
        <div class="draggable-node" :draggable="true" @dragstart="onDragStart($event, 'multi-handle', 'Action')">
           Action
        </div>

        <div class="draggable-node" :draggable="true" @dragstart="onDragStart($event, 'multi-handle', 'Database')">
           Database
        </div>

        <div class="draggable-node" :draggable="true" @dragstart="onDragStart($event, 'multi-handle', 'Cache')">
           Cache
        </div>
      </div>

      <div class="actions">
        <button @click="showImportModal" class="import-btn">Import Code</button>
        <button @click="exportDiagram" class="export-btn">Export Code</button>
      </div>
    </aside>

    <div class="vue-flow-wrapper">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        @dragover="onDragOver"
        @drop="onDrop"
        @node-click="onNodeClick"
        @edge-click="onEdgeClick"
        @pane-click="onPaneClick"
        :node-types="nodeTypes"
        class="builder-flow"
        :default-viewport="{ zoom: 1 }"
      >
        <Background pattern-color="#aaa" :gap="16" />
        <Controls />
      </VueFlow>
    </div>

    <aside class="sidebar-right" v-if="selectedElement">
      <div class="prop-header">
        {{ selectedElement.type === 'node' ? 'Node Properties' : 'Connection Properties' }}
      </div>
      
      <template v-if="selectedElement.type === 'node'">
        <div class="prop-group">
          <label>Label</label>
          <input v-model="selectedElement.data.label" />
        </div>

        <div class="prop-group">
          <label>Background Color</label>
          <input type="color" v-model="selectedElement.data.style.backgroundColor" />
        </div>

        <div class="prop-group">
          <label>Text Color</label>
          <input type="color" v-model="selectedElement.data.style.color" />
        </div>
        
         <div class="prop-group">
          <label>Border Color</label>
           <input type="text" v-model="selectedElement.data.style.borderColor" placeholder="#3c3c43" style="font-size: 11px;" />
        </div>
      </template>

      <template v-if="selectedElement.type === 'edge'">
        <div class="prop-group">
          <label>Label</label>
          <input v-model="selectedElement.data.label" placeholder="e.g. valid data" />
        </div>

        <div class="prop-group">
          <label>Line Color</label>
          <input type="color" v-model="selectedElement.data.style.stroke" />
        </div>
        
        <div class="prop-group checkbox-group">
          <label>Animated</label>
          <input type="checkbox" v-model="selectedElement.data.animated" />
        </div>
      </template>

      <div class="selected-id">ID: {{ selectedElement.data.id }}</div>

      <button class="delete-btn" @click="deleteSelected">
        Delete Selected
      </button>
    </aside>

    <div v-if="showExport" class="export-modal-overlay" @click.self="showExport = false">
      <div class="export-modal">
        <h3>Exported Diagram</h3>
        <textarea readonly :value="generatedCode"></textarea>
        <div class="modal-actions">
          <button @click="copyToClipboard">Copy to Clipboard</button>
          <button @click="showExport = false" class="secondary">Close</button>
        </div>
      </div>
    </div>

    <div v-if="showImport" class="export-modal-overlay" @click.self="showImport = false">
      <div class="export-modal">
        <h3>Import Diagram Config</h3>
        <p class="modal-hint">Paste your generated JS object or full script block here:</p>
        <textarea v-model="importCode" placeholder="const nodes = [...]"></textarea>
        <div class="modal-actions">
          <button @click="handleImport">Import</button>
          <button @click="showImport = false" class="secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dnd-flow {
  display: flex;
  flex-direction: row;
  height: 85vh;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

aside {
  width: 250px;
  padding: 15px;
  background: var(--vp-c-bg-mute);
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-right: 1px solid var(--vp-c-divider);
  z-index: 10;
}

.sidebar-right {
  border-right: none;
  border-left: 1px solid var(--vp-c-divider);
}

.prop-header {
  font-weight: 600;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 5px;
}

.prop-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.prop-group label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

input:not([type="checkbox"]), textarea {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.vue-flow-wrapper {
  flex-grow: 1;
  height: 100%;
  position: relative;
}

.draggable-node {
  cursor: grab;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 8px;
  font-size: 14px;
}

.draggable-node:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand);
}

.actions {
  margin-top: auto;
}

.export-btn {
  width: 100%;
  padding: 10px;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.delete-btn {
  margin-top: auto;
  padding: 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: #dc2626;
}

.export-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.export-modal {
  background: var(--vp-c-bg);
  padding: 20px;
  border-radius: 12px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.export-modal textarea {
  height: 300px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  background: var(--vp-c-brand);
  color: white;
  border: none;
}

.modal-actions button.secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.selected-id {
  font-size: 10px;
  color: var(--vp-c-text-3);
  margin-top: 10px;
}

.import-btn {
  width: 100%;
  padding: 10px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 10px;
}

.import-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.modal-hint {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 10px;
}
</style>
