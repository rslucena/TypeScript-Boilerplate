---
title: Home
description: Praxis Framework - A professional, modular project template for high-performance server-side applications using Bun.
layout: home

hero:
  name: Praxis
  text: Build Blazing-Fast APIs
  tagline: A modern, scalable, and production-ready framework for API development. Featuring Auto-CRUD Scaffolding, Type-Safe ORM, integrated Swagger docs, and Smart Caching. Experience Go-like speed with the developer ergonomics of TypeScript.
  actions:
    - theme: brand
      text: Quick Navigation
      link: /guide/quick-navigation
    - theme: alt
      text: API Reference & Usage
      link: /api/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/rslucena/TypeScript-Boilerplate
    - theme: alt
      text: AI Assistant
      link: https://deepwiki.com/rslucena/TypeScript-Boilerplate

features:
  - title: Near Go-like Performance
    details: Powered by the Bun runtime, delivering up to 3x faster execution and startup times compared to standard Node.js.
  - title: End-to-End Type Safety
    details: Built with Drizzle ORM and Zod validation, ensuring robust type checking from database schema to API endpoint responses.
  - title: Auto-Generated API Docs
    details: Instantly generate interactive Swagger UI documentation from your Zod schemas and Fastify route definitions.
  - title: Auto-CRUD Generation
    details: Scaffold complete domain structures in seconds—including routes, schemas, and tests—with our custom CLI generator.
  - title: Secure Error Handling
    details: Professional error handling that automatically masks sensitive internal details while providing clear feedback to clients.
  - title: Smart Caching
    details: Built-in Redis integration featuring automatic cache invalidation and graceful degradation for high availability.
---

## 🎬 See it in Action

Praxis is designed for extreme productivity. Watch how we scaffold a complete CRUD domain in seconds, including database schemas, validation, and auto-registered routes:

<div align="center" style="margin: 2rem 0;">
  <img src="/praxis-load-test.gif" alt="Praxis CLI Generation Demo" width="100%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);" />
</div>


<div class="tip custom-block" style="padding: 24px; margin-top: 40px; border-radius: 12px; border: 1px solid var(--vp-c-brand);">
  <h2 style="margin-top: 0; border: none; display: flex; align-items: center; gap: 10px;">
    AI Documentation Assistant
  </h2>
  <p style="font-size: 1.1rem; color: var(--vp-c-text-2);">
    Have questions about how to use Praxis or how the CI/CD works? <strong>Ask our AI!</strong>
  </p>
  <p><strong>Try asking:</strong></p>
  <ul>
    <li>How do I scaffold a new CRUD domain with <code>bun gen:domain</code>?</li>
    <li>How does the CI/CD pipeline handle automated releases?</li>
    <li>What are the key features of the Smart Caching system with Redis?</li>
    <li>How do I configure and run database migrations in production?</li>
    <li>How does this boilerplate achieve Go-like performance with Bun?</li>
  </ul>
  <div style="margin-top: 24px;">
    <a href="https://deepwiki.com/rslucena/TypeScript-Boilerplate" target="_blank" style="display: inline-block; padding: 12px 24px; background: var(--vp-c-brand); color: white; border-radius: 8px; font-weight: bold; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
      Launch AI Assistant →
    </a>
  </div>
</div>
