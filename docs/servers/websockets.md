# Scalable WebSockets (Redis Pub/Sub)

The boilerplate includes a production-ready, horizontally scalable WebSocket implementation using Redis Pub/Sub. This allows you to run multiple instances of your API (`app_server`) and ensuring that real-time messages reach all connected clients, regardless of which instance they are connected to.

## Architecture

- **Subscriber-Only**: The WebSocket endpoint is designed primarily for **receiving** real-time updates (server-to-client).
- **Redis Bridge**: The server acts as a bridge. When a client subscribes to a topic (e.g., `chat-room`), the server subscribes to the corresponding Redis channel.
- **Broadcast**: Messages published to Redis are automatically broadcast to all WebSocket clients subscribed to that topic across all replicas.

<script setup>
import { MarkerType } from '@vue-flow/core'
const style = { type: 'smoothstep', style: {stroke: 'var(--vp-code-line-diff-add-symbol-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }
const style2 = { type: 'smoothstep', style: {stroke: 'var(--vp-code-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }

const nodes = [
  { id: 'c1', type: 'multi-handle', label: 'Client A', position: { x: 0, y: 0 } },
  { id: 'c2', type: 'multi-handle', label: 'Client B', position: { x: 250, y: 0 } },
  { id: 's1', type: 'multi-handle', label: 'App Instance 1', position: { x: -25, y: 150 } },
  { id: 's2', type: 'multi-handle', label: 'App Instance 2', position: { x: 221, y: 150 } },
  { id: 'redis', type: 'multi-handle', label: 'Redis Pub/Sub', position: { x: 100, y: 350 } }
]

const edges = [
  { id: 'e1', source: 'c1', target: 's1', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'WebSocket', ...style2 },
  { id: 'e2', source: 'c2', target: 's2', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'WebSocket', ...style2 },
  { id: 'e3', source: 's1', target: 'redis', sourceHandle: 'right-source', targetHandle: 'top', label: 'Subscribe', ...style },
  { id: 'e4', source: 's2', target: 'redis', sourceHandle: 'left-source', targetHandle: 'top', label: 'Subscribe', ...style },
  { id: 'e5', source: 'redis', target: 's1', sourceHandle: 'left-source', targetHandle: 'bottom', label: 'Publish', ...style, animated: true },
  { id: 'e6', source: 'redis', target: 's2', sourceHandle: 'right-source', targetHandle: 'bottom', label: 'Publish', ...style, animated: true }
]
</script>

<InteractiveFlow :nodes="nodes" :edges="edges" />

## Connection Details

- **URL**: `ws://localhost:3000` or `ws://localhost:5080` (or configured port)
- **Protocol**: JSON-based messages.

## Message Protocol

### 1. Connection Established
Upon connection, the server sends:
```json
{ "action": "connect", "message": "connection established" }
{ "action": "session", "message": "waiting for create session", "session": "YOUR_SESSION_ID" }
```
> **Save the `session` ID**, it is required for all subsequent requests.

### 2. Authorization (Required)
You must authenticate using a valid JWT token before subscribing to topics.

**Request:**
```json
{
  "action": "authorization",
  "session": "YOUR_SESSION_ID",
  "context": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{ "action": "session", "message": "session authenticated" }
```

### 3. Subscribe to Topic
Start receiving messages for a specific context.

**Request:**
```json
{
  "action": "subscribe",
  "session": "YOUR_SESSION_ID",
  "context": "chat-room"
}
```

**Response:**
```json
{ "action": "subscribe", "message": "context subscribed" }
```

### 4. Unsubscribe
Stop receiving messages.

**Request:**
```json
{
  "action": "unsubscribe",
  "session": "YOUR_SESSION_ID",
  "context": "chat-room"
}
```

**Response:**
```json
{ "action": "unsubscribe", "message": "context unsubscribed" }
```

## 🧪 Testing Guide

Follow these steps to verify the implementation using **Postman** (or any WebSocket client) and **Redis CLI**.

### Step 1: Connect
1. Open Postman.
2. Create a new **WebSocket Request**.
3. Enter URL: `ws://localhost:3000` (or `ws://localhost:5080` if testing docker-compose mapping).
4. Click **Connect**.
5. Copy the `session` ID from the response log.

### Step 2: Authenticate
1. Send the Authorization JSON payload (see above) with a valid JWT.
   > *Note: If you are in a dev environment with auth disabled, you may skip this or send any string if the bypass is active.*

### Step 3: Subscribe
1. Send the Subscribe JSON payload for the context `test-channel`.
2. Verify you receive the `context subscribed` confirmation.

### Step 4: Publish Message (Simulate Event)
Since the WebSocket is subscriber-only, use Redis to simulate a backend event.

1. Open your terminal.
2. Connect to the Redis container:
   ```bash
   podman exec -it redis redis-cli -a <REDIS_PASSWORD>
   ```
   *(Default password in `.env` is typically `65QaKz4Hn2KN`)*

3. Publish a message to the channel:
   ```bash
   PUBLISH test-channel '{"info": "Hello from Redis"}'
   ```

### Step 5: Verify Receipt
1. Check Postman.
2. You should instantaneously receive:
   ```json
   {
     "action": "message",
     "topic": "test-channel",
     "snapshot": { "info": "Hello from Redis" }
   }
   ```
