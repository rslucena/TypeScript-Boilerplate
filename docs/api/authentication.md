# API Authentication

Ensuring the security of your API is paramount. The TypeScript Boilerplate provides a robust, standardized approach to authentication, making it simple to protect endpoints while maintaining flexibility for various authorization strategies (like JWT, OAuth2, or SSO).

## Authentication Strategy Overview

The boilerplate favors a token-based authentication system using **JSON Web Tokens (JWT)**. This is generally preferred for stateless API architectures. The standard flow involves:

1.  **Client Authentication**: The client submits credentials (e.g., email/password, SSO token).
2.  **Token Issuance**: The server validates credentials and issues a signed JWT.
3.  **Token Usage**: The client includes the JWT in the `Authorization` header of subsequent requests.
4.  **Token Validation**: The server intercepts the request, verifies the JWT signature and expiration, and grants access if valid.

## Implementing Authentication on Routes

To protect a Fastify route, the boilerplate uses custom plugins or hooks that inspect the incoming request. Typically, this is achieved by registering a global `onRequest` hook or applying an authentication middleware to specific routes.

### Securing a Specific Route

Here is an example of how you might require a valid Bearer token for a specific endpoint:

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Example Middleware/Hook (often defined in src/infrastructure/plugins/)
async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify(); // Provided by @fastify/jwt
    } catch (err) {
        reply.code(401).send({
            error: "UNAUTHORIZED",
            message: "Missing or invalid authentication token"
        });
    }
}

export default async function protectedRoutes(fastify: FastifyInstance) {
    fastify.route({
        method: 'GET',
        url: '/api/v1/secure-data',
        preHandler: [verifyToken], // Requires authentication before handler execution
        schema: {
            tags: ['Secure'],
            summary: 'Get Protected Data',
            description: 'Requires a valid Bearer token.',
            response: {
                200: {
                    description: 'Successful Response',
                    type: 'object',
                    properties: {
                        data: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            // request.user is populated by jwtVerify()
            const userId = request.user.id;

            return reply.send({ data: `Secret data for user ${userId}` });
        }
    });
}
```

## Token Management (Getting a Token)

When building an authentication endpoint (e.g., login), the process usually involves verifying credentials and generating the token payload.

### Example: Login Endpoint

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
      "id": "usr_123456",
      "email": "user@example.com",
      "role": "user"
  }
}
```

## Using the Token (Client-Side)

Once a client receives a token, it must be included in the `Authorization` header as a Bearer token for all protected requests.

### Example Request (cURL)

```bash
curl -X GET https://api.yourdomain.com/api/v1/secure-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Example Request (JavaScript / Fetch)

```javascript
const response = await fetch('https://api.yourdomain.com/api/v1/secure-data', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`, // The token received from login
        'Content-Type': 'application/json'
    }
});

const data = await response.json();
console.log(data);
```

### Example Request (Python / Requests)

```python
import requests

url = "https://api.yourdomain.com/api/v1/secure-data"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)
```

## Advanced Authentication Patterns

For more complex scenarios, the boilerplate architecture supports advanced patterns:

*   **Identity vs Credentials**: We strongly advise separating the concept of a "User" (Identity) from their "Login Methods" (Credentials). This allows a single user to log in via password, Google OAuth, or enterprise SSO without duplicating accounts. Read more in our [Identity vs Credentials](../architecture/identity-vs-credentials.md) guide.
*   **SSO Flow**: If integrating with Single Sign-On providers (like Okta or Auth0), the token issuance is handled externally. Your API primarily acts as a Resource Server validating the external JWT. See the [SSO Flow](../architecture/sso-flow.md) architecture document.
*   **Role-Based Access Control (RBAC)**: Extend your token payload to include a `role` or `permissions` array. You can then create specific `preHandler` hooks to enforce authorization checks (e.g., `requireAdminRole`).

## Security Best Practices

*   **Always use HTTPS**: Tokens sent over plain HTTP can be easily intercepted.
*   **Short Expiration Times**: Issue tokens with a short lifespan (e.g., 15-60 minutes) to minimize the risk of compromised tokens.
*   **Refresh Tokens**: If long-lived sessions are required, implement a refresh token flow. The refresh token should be stored securely (e.g., HTTP-only cookies) and used solely to obtain new short-lived access tokens.
*   **Secret Management**: Never hardcode your JWT secret. Use the `.env` file (`AUTH_SALT` or `JWT_SECRET`) and ensure it's a strong, cryptographically secure random string. The boilerplate enforces strict environment validation on startup.
