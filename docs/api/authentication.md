# API Authentication

Ensuring the security of your API is paramount. The TypeScript Boilerplate uses a custom JSON Web Token (JWT) implementation utilizing asymmetric RSA keys (public/private key pairs).

## The JWT Architecture (`src/infrastructure/authentication/jwt.ts`)

Instead of relying on a shared symmetric secret (`HS256`), the boilerplate uses **RS256** signatures. This is a highly secure pattern common in enterprise applications.

1.  **Keys:** The system expects a `private.pem`, `public.pem`, and `metadata.json` (containing the Key ID, `kid`) in the directory specified by `env.APP_FOLDER_KEY`. (You can generate these using `bun gen:keys`).
2.  **Creation (`jwt.create`):** When a user successfully authenticates (e.g., via SSO or local login), a JWT is created. It is signed with the `private.pem`.
<script setup>
import { MarkerType } from '@vue-flow/core'

const authNodes = [
  { id: 'client', type: 'multi-handle', label: 'Client', position: { x: 0, y: 150 } },
  { id: 'api', type: 'multi-handle', label: 'API Gateway', position: { x: 250, y: 150 } },
  { id: 'authSvc', type: 'multi-handle', label: 'Auth Validation', position: { x: 500, y: 50 }, class: 'bg-indigo-50 border-indigo-200' },
  { id: 'jwtGen', type: 'multi-handle', label: 'JWT Generator', position: { x: 500, y: 250 }, class: 'bg-emerald-50 border-emerald-200' }
]

const authEdges = [
  { id: 'e1', source: 'client', target: 'api', sourceHandle: 'right-source', targetHandle: 'left', label: 'POST /login', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'api', target: 'authSvc', sourceHandle: 'top-source', targetHandle: 'left', label: 'Validate', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'authSvc', target: 'api', sourceHandle: 'left-source', targetHandle: 'right', label: 'Valid', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'api', target: 'jwtGen', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Sign RSA', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'jwtGen', target: 'api', sourceHandle: 'left-source', targetHandle: 'right', label: 'JWT', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed },
  { id: 'e6', source: 'api', target: 'client', sourceHandle: 'left-source', targetHandle: 'right', label: '200 OK + Token', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="authNodes" :edges="authEdges" :height="400" />

## Using the Token (Client-Side)

Once a client receives a token, it must be included in the `Authorization` header as a Bearer token.

### Example Request

```bash
curl -X GET https://api.yourdomain.com/api/v1/secure-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Extracting the Session in Handlers

The boilerplate provides a `session` utility function to extract and validate the JWT payload from an incoming request.

```typescript
import * as jwt from "@infrastructure/authentication/jwt";
import type { container } from "@infrastructure/server/interface";

export default async function myProtectedAction(request: container) {
    try {
        // This will extract the Bearer token from headers, parse it,
        // verify the RSA signature, and check expiration.
        // It throws an "Unauthorized" error if invalid.
        const userSession = await jwt.session<{ id: string, email: string }>(request);

        // Proceed with logic using userSession.id
        return { data: `Hello, user ${userSession.id}` };

    } catch (error) {
         // The error handler will catch the "Unauthorized" string and can format it.
         throw error;
    }
}
```

## Advanced Authentication Patterns

*   **SSO Integration:** The boilerplate has built-in support for OpenID Connect (OIDC). Refer to the `src/domain/sso/` module. The flow involves redirecting the user to the provider (`getAuthorizationUrl`), handling the callback, and issuing our own local RSA-signed JWT to the client.
*   **Identity vs Credentials**: We strongly advise separating the concept of a "User" (Identity) from their "Login Methods" (Credentials). Read more in our [Identity vs Credentials](../architecture/identity-vs-credentials.md) guide.
