---
title: Security and Keys
description: Comprehensive guide on the cryptography, RSA key generation, and security pipes used in the TypeScript Boilerplate.
---

# Security & Keys

Security in this boilerplate is treated as a first-class citizen. Rather than relying heavily on external services for basic security needs, we provide a robust set of built-in cryptographic functions (`crypto.ts`) and an automated key generation process (`bun gen:keys`).

This ensures you have complete control over your identity management, token signing, and data encryption.

## The Key Generation Process

Before running the application in a production-like environment (especially if you are using the Identity or SSO domains), you need a secure set of cryptographic keys. 

We use the command `bun gen:keys` to automate this setup.

```bash
bun gen:keys
```

### What happens when you run this command?

1. **RSA Pair Generation**: It generates a 2048-bit RSA Public/Private key pair (`private.pem`, `public.pem`), essential for signing and validating JWTs asymmetrically.
2. **Self-Signed SSL**: It automatically calls `openssl` to generate a self-signed `cert.pem` for local HTTPS/HTTP2 development.
3. **JWKS Generation**: It converts the new public key into a JSON Web Key (JWK) and exports a `jwks.json` file. This format is the industry standard for distributing public keys so clients (or other microservices) can verify your tokens.
4. **OIDC Metadata**: It generates the `openid-configuration.json` necessary to make your server act as an OpenID Connect identity provider.

### The Security Flow

Here is how the keys are utilized across the architecture:

<script setup>
import { MarkerType } from '@vue-flow/core'
const nodes = [
  { id: "gen", type: "multi-handle", label: "bun gen:keys", position: { x: 250, y: 0 }, style: {} },
  { id: "rsa", type: "multi-handle", label: "RSA Keys", position: { x: -63.35474506929735, y: 151.05682727989227 }, style: {} },
  { id: "ssl", type: "multi-handle", label: "SSL Certs", position: { x: 263.35614372834556, y: 149.39290255780247 }, style: {} },
  { id: "jwks", type: "multi-handle", label: "JWKS & OIDC", position: { x: 460.78645868280347, y: 155.04498466318753 }, style: {} },
  { id: "id", type: "multi-handle", label: "Identity: Sign JWT", position: { x: -196.89659644863718, y: 299.1787076734074 }, style: {} },
  { id: "auth", type: "multi-handle", label: "Auth: Verify JWT", position: { x: 9.386764466245985, y: 300.95859148066 }, style: {} },
  { id: "fast", type: "multi-handle", label: "Fastify: HTTPS", position: { x: 243.92902557802478, y: 299.3929025578025 }, style: {} },
  { id: "sso", type: "multi-handle", label: "SSO: /jwks", position: { x: 471.87750155521405, y: 299.84674531236254 }, style: {} },
];
const edges = [
  { id: "k1", source: "gen", target: "rsa", sourceHandle: "bottom-source", targetHandle: "top", label: "Generates", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
  { id: "k2", source: "gen", target: "ssl", sourceHandle: "bottom", targetHandle: "top", label: "Generates", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
  { id: "k3", source: "gen", target: "jwks", sourceHandle: "bottom-source", targetHandle: "top", label: "Generates", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
  { id: "k4", source: "rsa", target: "id", sourceHandle: "bottom-source", targetHandle: "top", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
  { id: "k5", source: "rsa", target: "auth", sourceHandle: "bottom-source", targetHandle: "top", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
  { id: "k6", source: "ssl", target: "fast", sourceHandle: "bottom", targetHandle: "top", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
  { id: "k7", source: "jwks", target: "sso", sourceHandle: "bottom", targetHandle: "top", animated: true, markerEnd: MarkerType.ArrowClosed, type: "multi-handle", style: {} },
];

</script>

<InteractiveFlow :nodes="nodes" :edges="edges" />

---

## Cryptographic Utilities (`crypto.ts`)

The `src/infrastructure/pipes/crypto.ts` file abstracts Node's native `node:crypto` module to provide easy-to-use, secure functions.

### Password Hashing

For user passwords, we leverage **Bun's native `Bun.password` API** (usually implemented inside the Identity domain actions, rather than the `crypto.ts` pipe directly). It automatically handles salt generation and secure hashing (e.g., bcrypt or argon2) without needing external npm packages.

### Available Crypto Functions

The `crypto.ts` pipe provides the following utilities:

- **`uuid()`**: Generates a standard random UUID.
- **`sha256(data)`**: Quickly hashes data. Useful for creating identifiers or data integrity checks.
- **`base64url(input)`**: Encodes data securely for use in URLs (removes `+`, `/`, and `=`).
- **`generateRSAKeyPair()`**: The core function used by the CLI to create the PEM files.
- **`pemToJWK(pem)`**: Converts a public PEM file into a standard JWK object.
- **`rsa(data, privateKey)`**: Signs a string of data using RSA-SHA256. Used internally to sign custom tokens.
- **`rsaVerify(data, signature, publicKey)`**: Verifies that a specific piece of data was signed by the matching private key.

## Managing Keys in Production

> [!WARNING]
> The keys generated by `bun gen:keys` are placed in the `./keys` folder by default and are **ignored by Git** (`.gitignore`). Do **NOT** commit your `private.pem` to version control!

In a production environment (e.g., Docker/Kubernetes):
1. You should generate the keys securely offline or via a secure pipeline.
2. Inject the keys into your container via **Secrets** (e.g., Docker Secrets, AWS Secrets Manager, or Kubernetes Secrets).
3. The application will read the folder specified by the `APP_FOLDER_KEY` environment variable (defined in `.env`) to load the keys at startup.
