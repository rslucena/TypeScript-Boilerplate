# Error Handling

The TypeScript Boilerplate employs a secure, structured approach to error handling. This strategy ensures developers have access to detailed logs for debugging, while end-users receive consistent, safe, and helpful error messages without exposing sensitive system information.

## The Core Principle: Secure by Default

When an API encounters an error, the boilerplate handles it via a global error handler (`setErrorHandler` in `src/infrastructure/server/webserver.ts`).

<script setup>
import { MarkerType } from '@vue-flow/core'

const errorNodes = [
  { id: 'route', type: 'multi-handle', label: 'Route Throws Error', position: { x: 250, y: 0 } },
  { id: 'handler', type: 'multi-handle', label: 'Global Error Handler', position: { x: 250, y: 100 }, class: 'bg-red-50 border-red-200' },
  { id: 'type', type: 'multi-handle', label: 'Identify Type', position: { x: 250, y: 200 } },
  { id: 'zod', type: 'multi-handle', label: 'Extract Paths', position: { x: 0, y: 350 }, class: 'bg-orange-50 border-orange-200' },
  { id: 'custom', type: 'multi-handle', label: 'Extract Code/Message', position: { x: 250, y: 350 }, class: 'bg-yellow-50 border-yellow-200' },
  { id: 'unknown', type: 'multi-handle', label: 'Mask Details/Log', position: { x: 500, y: 350 }, class: 'bg-gray-50 border-gray-200' },
  { id: 'format', type: 'multi-handle', label: 'Format Response', position: { x: 250, y: 500 } },
  { id: 'client', type: 'multi-handle', label: 'Return JSON', position: { x: 250, y: 600 } }
]

const errorEdges = [
  { id: 'e1', source: 'route', target: 'handler', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'handler', target: 'type', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'type', target: 'zod', sourceHandle: 'left-source', targetHandle: 'top', label: 'Zod Validation', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'type', target: 'custom', sourceHandle: 'bottom-source', targetHandle: 'top', label: 'Custom Business', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'type', target: 'unknown', sourceHandle: 'right-source', targetHandle: 'top', label: 'Unknown / 500', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e6', source: 'zod', target: 'format', sourceHandle: 'bottom-source', targetHandle: 'left', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e7', source: 'custom', target: 'format', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e8', source: 'unknown', target: 'format', sourceHandle: 'bottom-source', targetHandle: 'right', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e9', source: 'format', target: 'client', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="errorNodes" :edges="errorEdges" :height="700" />

## Standard Error Response Format

All errors returned by the API follow a consistent JSON structure, defined by the `err` class in `src/infrastructure/server/interface.ts`.

```json
{
  "statusCode": 400,
  "code": "ERR_REQUEST",
  "error": "Bad Request",
  "message": "Translated error message here"
}
```

### Common HTTP Status Codes

The `err` class provides utility methods for common error responses:

*   **`400 Bad Request`** (`err.badRequest()`): The request was malformed or validation failed. Automatically triggered by Fastify when Zod validation fails.
*   **`401 Unauthorized`** (`err.unauthorized()`): Missing or invalid JWT token.
*   **`404 Not Found`** (`err.notFound()`): The requested resource could not be found.
*   **`409 Conflict`** (`err.conflict()`): The request conflicts with current server state (e.g., duplicate entries).
*   **`422 Unprocessable Entity`** (`err.unprocessableEntity()`): Used for semantic validation failures.
*   **`500 Internal Server Error`** (`err.internalServerError()`): A generic unhandled error.

## Automatic Validation Errors (400)

Because we use `fastify-type-provider-zod`, any request body, query, or params that do not match the Zod schema defined in your route will automatically be intercepted by Fastify before reaching your handler.

The global error handler catches these and formats them into a standard `400 Bad Request` response, masking complex internal Zod paths from the end user while providing a clear error message.

## How to Throw Errors in Handlers

When writing business logic in your actions, you can instantiate and throw standard errors using the `err` class, or let standard JavaScript `Error` objects be caught by the 500 handler.

For predictable API responses, it's recommended to return formatted error objects directly to the reply, or use custom exceptions that map to specific status codes.

*(Note: The `err` class methods like `.notFound()` return the formatted JSON object directly, which can be sent via `reply.code(...).send(...)`).*
