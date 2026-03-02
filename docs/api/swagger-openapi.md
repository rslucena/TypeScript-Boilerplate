# Swagger & OpenAPI Integration

The TypeScript Boilerplate provides automatic, zero-configuration API documentation using Swagger UI and OpenAPI specifications. By leveraging `fastify-type-provider-zod`, your validation schemas directly generate the interactive documentation.

## How It Works

Instead of writing separate, easily outdated YAML or JSON OpenAPI files, the boilerplate generates the documentation directly from your code.

1.  **Zod Schemas:** You define your data structures (params, body, response) using Zod in your domain's `schema.ts`.
2.  **Fastify Routes:** You attach these Zod schemas to your route definitions using Fastify's `schema` property.
3.  **Auto-Generation:** The `@fastify/swagger` and `@fastify/swagger-ui` plugins parse these schemas at runtime and generate an OpenAPI v3 specification.

This guarantees that your API documentation is always 100% in sync with your actual validation logic.

## Accessing the Documentation

Once your server is running (e.g., `bun dev`), you can access the interactive Swagger UI at:

```
http://localhost:3000/docs
```

*(Note: The exact port might vary based on your `.env` configuration).*

From this interface, you can:
*   Browse all available endpoints.
*   See the exact request payloads (body, query, params) and their required data types.
*   View all possible response structures (success and error codes).
*   Test endpoints directly from the browser (if authentication is configured in Swagger).

## Documenting Your Routes

To ensure your endpoints appear correctly in Swagger, you must provide comprehensive metadata in your route's `schema` block.

### A Complete Route Example

Here is how you document an endpoint to get the best result in Swagger:

```typescript
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { userSchema, createUserSchema } from '../../../domain/user/schema';

export default async function userRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<ZodTypeProvider>();

    server.post(
        '/',
        {
            schema: {
                tags: ['Users'], // Groups endpoints in Swagger
                summary: 'Create a new user', // The short title
                description: 'Registers a new user in the system. Requires a unique email address.', // The detailed explanation
                body: createUserSchema, // Your Zod validation schema for the request
                response: {
                    // Documenting the success response
                    201: z.object({
                        data: userSchema,
                        message: z.string().default('User created successfully')
                    }).describe('Successful user creation'),

                    // Documenting potential errors
                    400: z.object({
                        error: z.string().default('VALIDATION_ERROR'),
                        message: z.string()
                    }).describe('Validation failed for the request body'),

                    409: z.object({
                        error: z.string().default('CONFLICT'),
                        message: z.string()
                    }).describe('A user with this email already exists')
                }
            }
        },
        async (request, reply) => {
            // Your handler logic...
            return reply.code(201).send({ data: { id: "123", email: request.body.email }, message: "Success" });
        }
    );
}
```

### Key Schema Properties for Swagger

*   **`tags`**: Essential for organizing your Swagger UI. All routes with the tag `['Users']` will be grouped together under a "Users" section.
*   **`summary`**: The concise title displayed next to the endpoint URL (e.g., "Create a new user").
*   **`description`**: A longer explanation of what the endpoint does, any business rules, or specific edge cases. You can use Markdown here.
*   **`body`, `params`, `querystring`**: These must be Zod schemas. Swagger will read the types (string, number, boolean), validations (min, max, email), and default values.
*   **`response`**: You should document *every* status code your endpoint might return. Use `z.object().describe('...')` to add explanations for each response type.

## Enhancing Zod Schemas for Swagger

You can add extra metadata directly to your Zod schemas to make the Swagger documentation even clearer.

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email().describe('The unique email address of the user'),
    password: z.string()
        .min(8)
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        .describe('Minimum 8 characters, at least one letter and one number'),
    name: z.string().min(2).max(50).describe('The full name of the user. Optional.'),
    role: z.enum(['user', 'admin']).default('user').describe('The authorization role')
});
```

The `.describe()` method adds descriptions to individual fields in the Swagger model view, helping consumers understand the specific requirements for each property.

## Exporting the OpenAPI Spec (Postman / Insomnia)

If you need the raw OpenAPI JSON specification to generate client SDKs or to share with your team, you can fetch it directly from the API:

```
http://localhost:3000/docs/json
```

This endpoint returns the complete OpenAPI 3.0 document generated by Fastify.

### Import into Postman

You can use this generated JSON to instantly create a complete Postman Collection:

1.  Open Postman.
2.  Click the **Import** button in the top left corner.
3.  Select the **Link** tab.
4.  Paste your API's Swagger JSON URL (e.g., `http://localhost:3000/docs/json`) into the field.
5.  Click **Continue**, then **Import**.

Postman will automatically create a new collection with all your endpoints, grouped by tags, with path parameters, query strings, and request bodies already configured based on your Zod schemas.

### Import into Insomnia

Similarly, for Insomnia:

1.  Open Insomnia.
2.  Click the `+` icon next to your project name, or click **Create** on the dashboard.
3.  Choose **URL**.
4.  Paste your API's Swagger JSON URL.
5.  Insomnia will import the OpenAPI spec and generate a complete request collection.
