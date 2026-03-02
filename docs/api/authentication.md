# API Authentication

Ensuring the security of your API is paramount. The TypeScript Boilerplate uses a custom JSON Web Token (JWT) implementation utilizing asymmetric RSA keys (public/private key pairs).

## The JWT Architecture (`src/infrastructure/authentication/jwt.ts`)

Instead of relying on a shared symmetric secret (`HS256`), the boilerplate uses **RS256** signatures. This is a highly secure pattern common in enterprise applications.

1.  **Keys:** The system expects a `private.pem`, `public.pem`, and `metadata.json` (containing the Key ID, `kid`) in the directory specified by `env.APP_FOLDER_KEY`. (You can generate these using `bun gen:keys`).
2.  **Creation (`jwt.create`):** When a user successfully authenticates (e.g., via SSO or local login), a JWT is created. It is signed with the `private.pem`.
3.  **Validation (`jwt.parse` & `jwt.session`):** When a client makes a request to a protected route, the server extracts the Bearer token, decodes it, and cryptographically verifies the signature using the `public.pem`.

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
