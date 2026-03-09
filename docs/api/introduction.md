# Introduction

Welcome to the **API Reference & Usage** documentation!

This section is designed to help you construct robust, scalable, and documented APIs using our TypeScript Boilerplate. Whether you're building a straightforward REST application, a complex back-end system, or real-time WebSockets, the structure provided simplifies the process while enforcing best practices.

## Core Principles of API Development

The boilerplate leverages the **Bun runtime**, **Fastify**, **Zod**, and **Drizzle ORM** to create an end-to-end type-safe ecosystem.

By embracing these tools, our architecture ensures that your data validations (Zod) seamlessly integrate with your routing (Fastify) and your database schemas (Drizzle). This structure provides several distinct advantages:

*   **Type Safety**: Catch errors at compile-time instead of runtime. The types defined for your database automatically reflect in your validation schemas, which in turn define the types for your route handlers.
*   **Automatic Documentation**: Because routes are defined with strict schemas via `fastify-type-provider-zod`, tools like Swagger can automatically generate interactive API documentation without writing separate specifications.
*   **Performance**: Fastify combined with Bun offers unparalleled performance. Zod handles complex input parsing extremely quickly.
*   **Consistency**: A standardized folder structure separates concerns into `commands`, `domain`, `functions`, and `infrastructure`, promoting clean code and simple maintainability.

## Creating Endpoints (The Domain Approach)

The standard way to build endpoints in this boilerplate is through **Domains**. A domain represents a specific business entity (e.g., `users`, `products`, `orders`).

Instead of manually creating every file, we strongly encourage using the **CLI Code Generator**.

### The CLI Generator

Scaffold a complete CRUD domain in seconds. This automatically writes the database schema, Zod validations, standard REST actions, and Fastify routes.

```bash
bun gen:domain user
```

This single command will generate:

1.  **Entity (`src/domain/user/entity.ts`)**: The Drizzle schema representing your database table.
2.  **Schema (`src/domain/user/schema.ts`)**: Zod validation rules mapping precisely to your Drizzle entity.
3.  **Actions (`src/domain/user/actions.ts`)**: The core business logic for Create, Read, Update, Delete.
4.  **Routes (`src/functions/api/routes/user.ts`)**: Fastify endpoint definitions connecting the HTTP layer to your actions.

### Understanding Route Definitions

When you define a route in the boilerplate, you combine Fastify's speed with Zod's rigorous validation. Here's how a typical GET endpoint looks:

```typescript
// src/functions/api/routes/user.ts
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { userSchema } from '../../../domain/user/schema';

export default async function userRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<ZodTypeProvider>();

    server.get(
        '/:id',
        {
            schema: {
                tags: ['Users'],
                summary: 'Get User by ID',
                description: 'Retrieves a single user by their unique identifier.',
                params: z.object({
                    id: z.string().uuid(),
                }),
                response: {
                    200: z.object({
                        data: userSchema,
                        message: z.string()
                    }),
                    404: z.object({
                        error: z.string(),
                        code: z.string()
                    })
                }
            }
        },
        async (request, reply) => {
            // TypeScript knows `request.params.id` is a UUID string!
            const { id } = request.params;

            // Call your action here...
            const user = { id, name: "John Doe" }; // Example

            return reply.send({ data: user, message: "User found" });
        }
    );
}
```

Notice how the `schema` block completely describes the expected input (`params`) and output (`response`). This block is the foundation for our automated Swagger generation.

## Next Steps

Now that you understand the basic flow, dive deeper into specific API development topics:

*   [**Authentication**](./authentication): Learn how to secure your endpoints with JWT, API Keys, or OAuth.
*   [**Error Handling**](./error-handling): Understand the standard error responses, status codes, and how internal errors are masked.
*   [**Swagger & OpenAPI**](./swagger-openapi): Discover how to expose and customize your auto-generated documentation.
