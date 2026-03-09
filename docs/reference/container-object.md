---
title: The Container Object (Context)
description: Reference guide for the Request Container object injected into all fastify routes and domains.
---

# The Container Object (Context)

In the TypeScript Boilerplate, raw Fastify Request objects are wrapped in a robust `container` class. This class provides a type-safe, fluent API to interact with the HTTP request context, headers, parameters, and more, while seamlessly inheriting semantic error-handling utilities.

Every Domain Action or middleware receives a `request` parameter of type `container`.

## 1. Accessing Request Data

The container provides getter methods to access the incoming payload. These getters gracefully handle undefined states and support TypeScript Generics for strong typing.

```typescript
import type { container } from "@infrastructure/server/interface";

export default async function myAction(request: container) {
  // Query String Parameters (e.g. ?search=foo&page=2)
  const query = request.query<{ search?: string; page?: number }>();
  
  // URL Path Parameters (e.g. /users/:id)
  const params = request.params<{ id: string }>();

  // JSON Request Body
  const body = request.body<{ name: string; age: number }>();
  
  // HTTP Headers
  const headers = request.headers();
  const bearerToken = headers.authorization;
}
```

## 2. Context & Environment

Data injected passively via middleware (like i18n detection or authentication plugins) is stored safely in the container, ready to be read anywhere in the code.

```typescript
export default async function sessionAction(request: container) {
  // Current locale detected from `Accept-Language` header
  const locale = request.language(); // e.g. "en" or "pt"
  
  // Get the injected Auth Session, strongly typing it to your Strategy payload
  const session = request.session<{ JWT: { id: string; email: string } }>();
  console.log("Logged In User:", session.JWT.email);
}
```

## 3. Controlling the Response

You can define the outbound HTTP status directly on the container. By default, it is tracked as `200 OK`.

```typescript
request.status(201); // Created
```

## 4. Error Utilities

The `container` class officially extends an `err` superclass. This means every request context is bundled with semantic, fully translated Error exceptions ready to be `throw`n. This architecture guarantees your API will always throw the exact localized JSON structure the frontend expects.

When throwing these errors, the active language from `request.language()` guarantees the message matches the user's Locale.

```typescript
// 400 Bad Request
throw request.badRequest(request.language(), "Validation Error Description");

// 401 Unauthorized
throw request.unauthorized(request.language());

// 404 Not Found
throw request.notFound(request.language(), "User Entity");

// 409 Conflict
throw request.conflict(request.language(), "Email already exists");

// 422 Unprocessable Entity
throw request.unprocessableEntity(request.language(), "Invalid Token Format");

// 500 Internal Server Error
throw request.internalServerError(request.language());
```

> [!TIP]
> The second parameter, the `resource_name` string, is concatenated to the standard error phrase. For example: `request.notFound('en', 'User')` outputs _"Not Found User"_, while in Portuguese (`'pt'`) it automatically becomes _"Não Encontrado User"_.
