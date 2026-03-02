# Error Handling

The TypeScript Boilerplate employs a secure, structured approach to error handling. This strategy ensures developers have access to detailed logs for debugging, while end-users receive consistent, safe, and helpful error messages without exposing sensitive system information.

## The Core Principle: Secure by Default

When an API encounters an error (like a database connection failure, a syntax error, or an unhandled exception), it is crucial to protect internal details.

The boilerplate adheres to a **Secure Error Handling Policy**:
*   **Internal Logging:** Full stack traces, SQL queries, and detailed error messages are logged internally using the infrastructure logger (e.g., Pino).
*   **External Masking:** When returning an error to the client, the API automatically masks these internal details, replacing them with generic, safe messages (e.g., "Internal Server Error").

This prevents attackers from gaining insights into your database structure, file paths, or third-party dependencies.

## Standard Error Response Format

All errors returned by the API follow a consistent JSON structure. This predictability makes it easy for client applications (web, mobile, or other services) to parse and handle errors programmatically.

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error description.",
  "field": "Optional field name if applicable",
  "details": [
    // Optional array for validation errors
  ]
}
```

### Common HTTP Status Codes

The API uses standard HTTP status codes to indicate the outcome of a request:

| Status Code | Meaning | Typical Use Case |
| :--- | :--- | :--- |
| **`400 Bad Request`** | The request was malformed or validation failed. | Missing required fields, invalid email format. |
| **`401 Unauthorized`** | Authentication is required or failed. | Missing JWT, invalid token, expired token. |
| **`403 Forbidden`** | The client is authenticated but lacks permission. | A regular user trying to access an admin endpoint. |
| **`404 Not Found`** | The requested resource could not be found. | Requesting a user ID that doesn't exist. |
| **`409 Conflict`** | The request conflicts with the current state of the server. | Trying to register an email that is already taken. |
| **`422 Unprocessable Entity`** | Validation error (often used instead of 400 for specific validation failures). | Zod validation failure. |
| **`429 Too Many Requests`** | The client has exceeded rate limits. | Brute-force protection, API quotas. |
| **`500 Internal Server Error`** | A generic error occurred on the server. | Database connection issue, unhandled exception. |
| **`503 Service Unavailable`** | The server is currently unable to handle the request. | Maintenance, overloaded cache/database. |

## Examples of Error Responses

### Example 1: Validation Error (400 Bad Request)

When a request fails Zod validation (e.g., invalid email format, missing required field), the API automatically returns a 400 response with details about the specific fields that failed.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "String must contain at least 8 character(s)"
    }
  ]
}
```

### Example 2: Resource Not Found (404 Not Found)

If an endpoint specifically looks for a resource (like a user or product) and it doesn't exist, it should return a 404.

```json
{
  "error": "NOT_FOUND",
  "message": "The requested user could not be found."
}
```

### Example 3: Conflict (409 Conflict)

Used when an action violates a business rule, such as uniqueness constraints.

```json
{
  "error": "CONFLICT",
  "message": "An account with this email address already exists.",
  "field": "email"
}
```

### Example 4: Internal Server Error (500 Internal Server Error)

When an unhandled exception occurs (e.g., a database query fails), the API intercepts it. The actual error is logged, and the client receives a masked response.

```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Please try again later or contact support."
}
```

## How to Handle Errors in Route Handlers

When writing Fastify route handlers or business logic actions, you don't need to manually construct these JSON responses for every error.

### Throwing Specific Errors

The recommended approach is to throw specific error classes (or use utility functions if provided by the boilerplate) that Fastify's global error handler will catch and format appropriately.

```typescript
// src/domain/user/actions.ts

export async function getUserById(id: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, id)
    });

    if (!user) {
        // Option 1: Throw a custom Error (if your Fastify setup maps this)
        const error = new Error("User not found");
        (error as any).statusCode = 404;
        (error as any).code = "NOT_FOUND";
        throw error;

        // Option 2 (Better): If the boilerplate provides a utility class
        // throw new NotFoundError("User not found");
    }

    return user;
}
```

### Fastify Global Error Handler

The boilerplate typically configures a global `setErrorHandler` in the Fastify setup (`src/servers/http-server.ts` or similar). This handler acts as the central point for intercepting all thrown errors, formatting them according to the standard structure, masking sensitive data, and logging the internal details.

## Troubleshooting Common Errors

### "The application fails to start"

Ensure your `.env` file is complete. The boilerplate enforces strict environment validation on startup. If a variable like `DATABASE_URL` or `REDIS_URL` is missing, the application will exit immediately with a configuration error.

### "Validation errors on seemingly correct data"

Check your Zod schemas (`src/domain/<domain>/schema.ts`). Zod is very strict. If you define a field as a string but pass a number, or if you have a typo in a field name, Zod will reject it. Use the generated Swagger documentation to verify the exact expected payload.

### "Database migration failed"

Review the Drizzle ORM migration logs. Often, this is caused by conflicting schema changes or missing relationships. Ensure you've run `bun db:migrate:push` (or `generate` and `push` depending on your workflow) after updating your entities.
