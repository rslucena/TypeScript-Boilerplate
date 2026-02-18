<script setup>
import { MarkerType } from '@vue-flow/core'

const style = { type: 'smoothstep', style: {stroke: 'var(--vp-code-line-diff-add-symbol-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }
const style2 = { type: 'smoothstep', style: {stroke: 'var(--vp-code-color)', strokeWidth: 1}, animated: true, markerEnd: MarkerType.ArrowClosed }

const httpNodes = [
  { id: 'client', type: 'multi-handle', label: 'Client', position: { x: 0, y: 150 } },
  { id: 'server', type: 'multi-handle', label: 'Server', position: { x: 400, y: 150 } },
  
  // HTTP/1.1 Logic
  { id: 'req1', type: 'multi-handle', label: 'Req 1', position: { x: 100, y: 0 }},
  { id: 'res1', type: 'multi-handle', label: 'Res 1', position: { x: 300, y: 0 }},
  
  // HTTP/2 Logic
  { id: 's1', type: 'multi-handle', label: 'Stream 1', position: { x: 200, y: 100 }, style: { color: 'var(--vp-c-brand-dark)'} },
  { id: 's2', type: 'multi-handle', label: 'Stream 2', position: { x: 200, y: 180 }, style: { color: 'var(--vp-c-brand-dark)'} },
  { id: 's3', type: 'multi-handle', label: 'Stream 3', position: { x: 200, y: 260 }, style: { color: 'var(--vp-c-brand-dark)'} }
]

const httpEdges = [
  // HTTP/1.1 Flow (Sequential representation)
  { id: 'e1', source: 'client', target: 'req1', sourceHandle: 'top-source', targetHandle: 'left', label: 'HTTP/1.1', ...style2 },
  { id: 'e2', source: 'req1', target: 'res1', sourceHandle: 'right-source', targetHandle: 'left', ...style2 },
  { id: 'e3', source: 'res1', target: 'server', sourceHandle: 'right-source', targetHandle: 'top', ...style2 },

  // HTTP/2 Flow (Multiplexed)
  { id: 'h1', source: 'client', target: 's1', sourceHandle: 'right-source', targetHandle: 'left', label: 'HTTP/2', ...style },
  { id: 'h2', source: 'client', target: 's2', sourceHandle: 'right-source', targetHandle: 'left', ...style },
  { id: 'h3', source: 'client', target: 's3', sourceHandle: 'right-source', targetHandle: 'left', ...style },
  { id: 'h4', source: 's1', target: 'server', sourceHandle: 'right-source', targetHandle: 'left', ...style },
  { id: 'h5', source: 's2', target: 'server', sourceHandle: 'right-source', targetHandle: 'left', ...style },
  { id: 'h6', source: 's3', target: 'server', sourceHandle: 'right-source', targetHandle: 'left', ...style }
]
</script>

# HTTP/2

This boilerplate comes with native, high-performance support for **HTTP/2**, enabling multiplexing, header compression, and server push capabilities out of the box.

## Why?

HTTP/2 is a major revision of the HTTP network protocol. It improves latency and throughput by moving away from the text-based, ordered nature of HTTP/1.1.

### Key Benefits

| Feature | HTTP/1.1 | HTTP/2 | Benefit |
| :--- | :--- | :--- | :--- |
| **Multiplexing** | Sequential Requests (Head-of-Line Blocking) | **Parallel Streams** over single TCP connection | Removes the need for domain sharding and multiple connections. |
| **Header Compression** | Plain Text (Redundant) | **HPACK Compression** | Drastically reduces overhead, especially for microservices. |
| **Binary Protocol** | Text-based | **Binary-based** | More efficient to parse and less error-prone. |


### Visual Comparison

<InteractiveFlow :nodes="httpNodes" :edges="httpEdges" />

---

## Configuration

HTTP/2 is controlled via environment variables. Since modern browsers enforce HTTPS for HTTP/2, this boilerplate automatically configures TLS/SSL when enabled.

### 1. Enable in Environment

Set `APP_HTTP2` to `true` in your `.env` file. You must also point to your SSL certificate and private key.

```dotenv
# .env
APP_HTTP2="true"
APP_KEY="./keys/private.pem"
APP_CERT="./keys/cert.pem"
```

### 2. Generate Local Certificates

For local development, we include a utility to generate valid self-signed certificates and RSA keys in one command:

```bash
bun gen:keys
```

This command uses `openssl` to automatically generate:
- 🔑 `private.pem`: Your private key.
- 📜 `cert.pem`: A self-signed SSL certificate valid for 365 days.

---

## 🧪 How to Test

Since we are using self-signed certificates locally, testing requires bypassing standard trust verification.

### Option A: Using cURL

Use the `-k` (insecure) flag to bypass certificate validation and `--http2` to verify the protocol negotiation.

```bash
curl -I -k --http2 https://localhost:3000
```

**✅ Expected Output:**
```http
HTTP/2 200
content-type: application/json
...
```

### Option B: Using Browser

1. 🌐 Open `https://localhost:3000`.
2. ⚠️ You will see a **"Your connection is not private"** warning (normal for self-signed certs).
3. Click **Advanced** -> **Proceed to localhost (unsafe)**.
4. Open Developer Tools (`F12`) -> **Network** tab.
5. Right-click the header columns and enable **Protocol**.
6. Refresh the page. You should see **`h2`** in the Protocol column.

---

## ⚠️ Production Note

In production (e.g., behind Nginx, ALB, or Cloudflare), you typically terminate SSL at the load balancer. However, if you need end-to-end encryption or your load balancer supports HTTP/2 upstream, this configuration allows Node.js/Bun to handle it natively.

> [!TIP]
> If you are using a reverse proxy like Nginx, you might not need `APP_HTTP2="true"` in the Node app if Nginx handles the HTTP/2 client connection and proxies via HTTP/1.1 to the backend. Enable this only if you need HTTP/2 capabilities directly in the application server.
