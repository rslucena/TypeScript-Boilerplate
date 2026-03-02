# Error Handling

The TypeScript Boilerplate employs a secure, structured approach to error handling. This strategy ensures developers have access to detailed logs for debugging, while end-users receive consistent, safe, and helpful error messages without exposing sensitive system information.

## The Core Principle: Secure by Default

When an API encounters an error, the boilerplate handles it via a global error handler (`setErrorHandler` in `src/infrastructure/server/webserver.ts`).

*   **Internal Logging:** Full stack traces, SQL queries, and detailed error messages are logged internally using the infrastructure logger (Pino).
*   **External Masking:** The API automatically masks internal details for server errors (500), replacing them with generic, translated messages based on the client's `Accept-Language` header. In development (`env.isDev`), the raw error message is exposed to aid debugging.

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
