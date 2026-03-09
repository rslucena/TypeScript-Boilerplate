---
title: Auth & Identity API Reference
description: API logic reference for the Identity, Credentials, and SSO domains.
---

<script setup>
import { MarkerType } from '@vue-flow/core'

const styleReq = { type: 'smoothstep', style: {stroke: '#3B82F6', strokeWidth: 2}, animated: true, markerEnd: MarkerType.ArrowClosed }
const styleRes = { type: 'smoothstep', style: {stroke: '#10B981', strokeWidth: 2}, animated: true, markerEnd: MarkerType.ArrowClosed }

const ssoNodes = [
  { id: 'cli', type: 'multi-handle', label: 'Client', position: { x: 0, y: 150 }, style: { borderRadius: '20px', border: '2px solid #000' } },
  { id: 'api', type: 'multi-handle', label: '/api/v1/sso/token', position: { x: 300, y: 150 }, style: { backgroundColor: '#3B82F6', color: '#fff' } },
  { id: 'cred', type: 'multi-handle', label: 'Credentials DB', position: { x: 600, y: 50 }, style: { backgroundColor: '#4B5563', color: '#fff' } },
  { id: 'id', type: 'multi-handle', label: 'Identity DB', position: { x: 600, y: 250 }, style: { backgroundColor: '#4B5563', color: '#fff' } }
]

const ssoEdges = [
  { id: 'q1', source: 'cli', target: 'api', sourceHandle: 'right-source', targetHandle: 'left', label: 'POST /token', ...styleReq },
  { id: 'q2', source: 'api', target: 'cred', sourceHandle: 'top-source', targetHandle: 'left', label: 'Verify Hash', ...styleReq },
  { id: 'q3', source: 'cred', target: 'api', sourceHandle: 'left-source', targetHandle: 'top', label: 'Valid Cred', ...styleRes },
  { id: 'q4', source: 'api', target: 'id', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Get ID', ...styleReq },
  { id: 'q5', source: 'id', target: 'api', sourceHandle: 'left-source', targetHandle: 'bottom', label: 'ID Data', ...styleRes },
  { id: 'q6', source: 'api', target: 'cli', sourceHandle: 'left-source', targetHandle: 'right', label: '200 OK + JWT', ...styleRes }
]
</script>

# Auth & Identity API Reference

This boilerplate separates the concept of a User (Identity) from their Login Methods (Credentials). Below is the technical reference for how to interact with these built-in domains via the API.

> [!NOTE]
> For a theoretical explanation of why this architecture was chosen, please read our [Identity vs Credentials Architecture Guide](../architecture/identity-vs-credentials.md).

---

## Identity Domain

The Identity domain manages the public or core profile of a user (e.g., Name, Email, Avatar). It does **not** handle passwords.

### Endpoints

Base Path: `/api/v1/identity`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Creates a new Identity profile. | No |
| `GET`  | `/:id` | Retrieves a specific Identity by UUID. | Yes |
| `GET`  | `/email/:email` | Retrieves an Identity by exact email match. | Yes |
| `GET`  | `/` | Lists Identities with pagination and filters. | Yes |
| `PUT`  | `/:id` | Updates an Identity's mutable fields. | Yes |

### Example Payload (POST `/`)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## Credentials Domain

The Credentials domain links a specific Identity to a login method. A single Identity can have multiple credentials (e.g., a Password and a Google SSO link).

### Endpoints

Base Path: `/api/v1/credentials`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Creates a new Credential linked to an Identity. | Yes (Admin/System) |
| `GET`  | `/:id` | Retrieves a Credential record (without revealing the secret/hash). | Yes |
| `GET`  | `/` | Lists Credentials. | Yes |
| `PUT`  | `/:id` | Updates a Credential (e.g., changing a password). | Yes |
| `DELETE`|`/:id` | Revokes/deletes a Credential. | Yes |

### Security Validation Rules

When creating or updating a credential, strict validation rules apply depending on the `provider`:

- **LOCAL (Password)**: Must include a `secret` (the plain text password, which the Action will hash before saving). Cannot have a `subject`.
- **GOOGLE / GITHUB (OIDC)**: Must have a `subject` (the third-party provider's user ID). Cannot have a `secret`.
- **API_KEY**: Must include a `secret` (the token value).

### Example Payload (POST `/`) - Local Password
```json
{
  "identity_id": "uuid-of-the-identity",
  "provider": "LOCAL",
  "type": "PASSWORD",
  "secret": "MySuperSecretP@ssw0rd!"
}
```

---

## SSO (Single Sign-On) Domain

The SSO domain acts as an orchestrator. It verifies credentials, manages OAuth flows, and issues JWT tokens upon successful authentication. 

Instead of manipulating entities directly, it performs authentication logic and returns session tokens.

### Main Authentication Flow

1. **Client** sends login request to `/api/v1/sso/token`.
2. **SSO Action** searches for the Credential by the provided identifier (e.g., email).
3. **SSO Action** verifies the password against the stored hash.
4. If valid, the **SSO Action** fetches the associated Identity.
5. The Server signs a **JWT Token** containing the Identity UUID and returns it to the client.

<InteractiveFlow :nodes="ssoNodes" :edges="ssoEdges" />

### JWKS Endpoint
For microservice architectures or external clients needing to verify the JWTs issued by this server, the SSO domain exposes the public keys.

- `GET /api/v1/sso/jwks`: Returns the JSON Web Key Set generated by `bun gen:keys`.
