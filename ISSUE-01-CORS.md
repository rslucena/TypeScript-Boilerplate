# Insecure CORS Configuration via `startsWith`

### Description
A HIGH severity vulnerability was identified in `src/infrastructure/settings/cors.ts`. The Cross-Origin Resource Sharing (CORS) validation logic checks if the incoming request origin starts with any of the allowed origins using `origin.startsWith(allowedOrigin.trim())`. This implementation is insecure because an attacker can bypass the CORS policy by registering a malicious domain that begins with the allowed domain name (e.g., `https://myapp.com.malicious.com` will successfully bypass a check for `https://myapp.com`).

### Steps to reproduce the issue
1. The server is configured with `PROCESS_CORS_ORIGIN` set to `https://myapp.com`.
2. An attacker sends an HTTP request with the `Origin` header set to `https://myapp.com.malicious.com`.
3. The server processes the request and responds with the `Access-Control-Allow-Origin: https://myapp.com.malicious.com` header.
4. The malicious domain can now make authenticated requests on behalf of the user to the server.

### Possible solution
Instead of using `String.prototype.startsWith()`, the CORS origin check must enforce exact string matching or use a secure URL parser to validate the hostname and port.

We can change the validation logic to:

```typescript
const allowed = !origin || allowedOrigins.some((allowedOrigin) => origin === allowedOrigin.trim());
```

Alternatively, if subdomains are required, use a strict regular expression or the `URL` API to verify the exact hostname structure.

### Severity
HIGH
