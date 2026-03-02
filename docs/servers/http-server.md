# HTTP Server (Fastify)

The project uses **Fastify** as the core HTTP framework, configured for maximum performance and stricter security defaults. It is fully typed using `fastify-type-provider-zod`, enabling end-to-end type safety from the route definition to the controller.

## Features

- **Type-Safe Routing**: Uses **Zod** to validate request bodies, query parameters, and headers.
- **Auto-Documentation**: Automatically generates **Swagger/OpenAPI** specs from your Zod schemas.
- **Security First**: Pre-configured with **Helmet** (headers) and **CORS**.
- **Rate Limiting**: Built-in protection against abusive traffic.
- **Global Error Handling**: Centralized error interceptor with standardized JSON responses.

## Setup & Configuration

The server configuration resides in `src/infrastructure/server/webserver.ts`.

### Core Configuration
```typescript
const instance = fastify({
    logger: Logs.settings("webserver"),
    pluginTimeout: 20000,
    requestTimeout: 20000,
    // ...
}).withTypeProvider<ZodTypeProvider>();
```

### Registered Plugins
| Plugin | Purpose |
| :--- | :--- |
| `fastify-type-provider-zod` | Enables Zod schemas for route validation. |
| `@fastify/swagger` | Generates OpenAPI 3.0 specifications. |
| `@fastify/swagger-ui` | Hosts the documentation UI at `/docs`. |
| `@fastify/helmet` | Sets secure HTTP headers (XSS protection, no-sniff, etc). |
| `@fastify/cors` | Configures Cross-Origin Resource Sharing. |

## Request Flow

1. **Rate Limit Hook**: Checks if the IP has exceeded the request quota.
2. **Type Conversion Hook**: Converts numeric query parameters (which arrive as strings) into actual numbers based on the Zod schema.
3. **Validator**: Validates the request against the Zod schema defined in the route.
4. **Action**: Executes the domain logic.
5. **Serializer**: Formats the response (if a response schema is defined).

## Error Handling

The server includes a global error handler that catches exceptions and normalizes them into a standard JSON format.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error: invalid email"
}
```

- **Validation Errors**: Automatically mapped from Zod errors.
- **Unsupported Media Type**: Automatically handled to ensure JSON responses.
- **Unknown Errors**: Masked as "An unknown error occurred" in all environments when sent to the client. The full error (including stack traces and sensitive details) is logged internally for debugging.

## Usage in Routes

Routes are defined in the `domain/{entity}` layer and registered in the application entry point.

```typescript
// src/domain/{entity}/routes.ts
export default (app: server) => {
	api.get(
		"/:id",
		{
			schema: {
				tags: ["{entity}"],
				summary: "Find {entity} by id",
				params: schema.actions.id,
				headers: schema.actions.headers,
				response: { 200: schema.entity, ...request.reply.schemas },
			},
		},
		request.restricted(getById),
	);
};
```
