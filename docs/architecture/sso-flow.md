---
title: SSO Authentication Flow
description: OAuth2 and OpenID Connect (OIDC) implementation details
---

# SSO Authentication Flow

This guide covers the Single Sign-On (SSO) integration using OAuth 2.0 and OpenID Connect (OIDC). The boilerplate supports robust integration with identity providers like **Google** and **GitHub**.

## Architecture Overview

The SSO flow is completely built into the core domain layer (`src/domain/sso`), avoiding heavy framework coupling and using the clean distinction between *Identities* and *Credentials*.

<script setup>
import { MarkerType } from '@vue-flow/core'

const ssoNodes = [
  { id: 'client', type: 'multi-handle', label: 'Client / Frontend', position: { x: 0, y: 150 } },
  { id: 'api', type: 'multi-handle', label: 'API (SSO Module)', position: { x: 300, y: 150 } },
  { id: 'provider', type: 'multi-handle', label: 'Provider (Google/GitHub)', position: { x: 650, y: 50 } },
  { id: 'db', type: 'multi-handle', label: 'Database', position: { x: 650, y: 250 } }
]

const ssoEdges = [
  { id: 'e1', source: 'client', target: 'api', sourceHandle: 'right-source', targetHandle: 'left', label: '1. Login Request', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'api', target: 'provider', sourceHandle: 'top-source', targetHandle: 'left', label: '2. Redirect /authorize', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'provider', target: 'api', sourceHandle: 'bottom-source', targetHandle: 'top', label: '3. Callback with ?code', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e4', source: 'api', target: 'provider', sourceHandle: 'right-source', targetHandle: 'bottom', label: '4. Token Exchange & JWT Verify', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e5', source: 'api', target: 'db', sourceHandle: 'bottom-source', targetHandle: 'left', label: '5. Find/Create Identity', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e6', source: 'api', target: 'client', sourceHandle: 'left-source', targetHandle: 'right', label: '6. Returns App Session', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="ssoNodes" :edges="ssoEdges" />

## Key Components

### 1. `get-authorize.ts` (The Redirect)
The entrypoint `/authorize` generates the necessary URL to redirect the user to the provider.
- It includes security measures such as `state` generation to prevent CSRF attacks.
- Certain providers, such as Google, might also require a `nonce` depending on the requested `response_type`.

### 2. `get-callback.ts` (The Token Exchange & Login)
Once the IDP redirects the user back to the application (`/callback`), this controller:
- Extracts the authorization `code` from the query string.
- Validates the `state` to ensure the session wasn't hijacked.
- Calls the underlying `exchangeToken` infrastructure to swap the `code` for an `access_token` (and `id_token` if applicable).
- Generates or updates the internal `Identity` and `Credential`.
- **Cache Invalidation**: Triggers an automatic deletion of `identity:find*` and `credentials:find*` cache namespaces to ensure subsequent requests fetch the most up-to-date user data.
- Finally, it provides the internal `JWT` used by the application for subsequent requests.

### 3. `oidc.ts` (The Infrastructure Hook)
Located at `src/infrastructure/sso/oidc.ts`, this file manages all the external communication with the providers:
- `exchangeToken`: Hits the provider's token endpoint to trade codes.
- `verifyIdToken`: A robust built-in JWT validator that fetches the provider's Public Keys (JWKS), verifies the `kid` (Key ID), and ensures the `exp` (Expiration) and signature are completely valid before trusting the token.
- `getNormalizedUser`: Maps different API contracts (e.g. Google's parsed `id_token` vs GitHub's `/user` endpoint) into a consistent format.

## Environment Configuration

To enable SSO, setup the specific environment variables in your `.env`:

```env
# Google SSO
SSO_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
SSO_GOOGLE_CLIENT_SECRET="your-client-secret"
SSO_GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/sso/callback"

# GitHub SSO
SSO_GITHUB_CLIENT_ID="your-client-id"
SSO_GITHUB_CLIENT_SECRET="your-client-secret"
SSO_GITHUB_REDIRECT_URI="http://localhost:3000/api/v1/sso/callback"
```

> [!NOTE]
> If a provider is not configured, the boilerplate will instantly throw an error if a user attempts to use `/authorize` for that provider.

## Security Considerations
1. The OAuth flow uses **JWKS validation arrays** to ensure `id_tokens` received from providers like Google belong to them and weren't tampered with.
2. We enforce `state` comparison across both GitHub and Google to guarantee CSRF resistance.
3. Access tokens inside the application are extremely short-lived, favoring refresh tokens.
