---
title: Identity vs Credentials Architecture
description: Understanding the separation of social identity and access security
---

# Identity vs Credentials Architecture

This document explains the architectural decision to separate **Identity** (who the user is) from **Credentials** (how the user proves who they are).

## Overview

In many systems, user data and passwords live in the same table. In this boilerplate, we've decoupled these concerns into two distinct domains to improve security, scalability, and modularity.

<script setup>
import { MarkerType } from '@vue-flow/core'

const overviewNodes = [
  { id: 'ident', type: 'multi-handle', label: 'Identity Entity', position: { x: 0, y: 0 } },
  { id: 'data', type: 'multi-handle', label: 'Name, Email, Bio', position: { x: 0, y: 120 } },
  { id: 'cred', type: 'multi-handle', label: 'Credentials Entity', position: { x: 250, y: 0 } },
  { id: 'sec', type: 'multi-handle', label: 'Password, Salt, MFA', position: { x: 250, y: 120 } }
]

const overviewEdges = [
  { id: 'e1', source: 'ident', target: 'data', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e2', source: 'cred', target: 'sec', sourceHandle: 'bottom-source', targetHandle: 'top', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'e3', source: 'ident', target: 'cred', sourceHandle: 'right-source', targetHandle: 'left', type: 'smoothstep' },
  { id: 'e4', source: 'cred', target: 'ident', sourceHandle: 'left-source', targetHandle: 'right', label: 'auth-link', type: 'smoothstep', markerEnd: MarkerType.ArrowClosed }
]

const flowNodes = [
  { id: 'client', type: 'multi-handle', label: 'Client', position: { x: 0, y: 100 } },
  { id: 'auth', type: 'multi-handle', label: 'Auth Plugin', position: { x: 250, y: 100 } },
  { id: 'credAct', type: 'multi-handle', label: 'Credentials Action', position: { x: 500, y: 20 } },
  { id: 'identAct', type: 'multi-handle', label: 'Identity Action', position: { x: 500, y: 180 } }
]

const flowEdges = [
  { id: 'f1', source: 'client', target: 'auth', sourceHandle: 'right-source', targetHandle: 'left', label: 'Login', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'f2', source: 'auth', target: 'credAct', sourceHandle: 'top-source', targetHandle: 'left', label: 'Verify', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'f3', source: 'auth', target: 'identAct', sourceHandle: 'bottom-source', targetHandle: 'left', label: 'Retrieve', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed },
  { id: 'f4', source: 'auth', target: 'client', sourceHandle: 'left-source', targetHandle: 'right', label: 'JWT Token', type: 'smoothstep', animated: true, markerEnd: MarkerType.ArrowClosed }
]
</script>

<InteractiveFlow :nodes="overviewNodes" :edges="overviewEdges" />

## Why separate them?

### 1. Security (Principle of Least Privilege)
By separating credentials, we can enforce stricter access controls. For example:
- The `Identity` domain can be accessed by various services (profile page, search, social features) without ever having visibility into hashing algorithms or password metadata.
- The `Credentials` domain can be isolated in a more secure database schema or even a different microservice.

### 2. Flexibility
Different authentication methods can be added without modifying the `Identity` entity:
- A user can have one `Identity` linked to multiple `Credentials` (Password, OAuth, Passkeys).
- We can rotate security protocols in the `Credentials` domain without affecting social features.

### 3. Modular Testing
Separating these domains allows for cleaner unit tests. We can test identity profile updates independently of password hashing logic and vice versa.

## How it works

When a user logs in, the system verifies the **Credentials** first. Once validated, it retrieves the associated **Identity** to populate the session/token.

<InteractiveFlow :nodes="flowNodes" :edges="flowEdges" />

## Infrastructure Support

To ensure these domains remain decoupled but efficient, we use:
- **Shared Pipes**: Standardized cryptographic utilities in `src/infrastructure/pipes`.
- **Cross-Domain Builders**: Test builders that can link entities together consistently.
- **Relational Mapping**: Drizzle-ORM relationships that maintain referential integrity between the `identities` and `credentials` tables.
