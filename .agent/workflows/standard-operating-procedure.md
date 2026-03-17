---
description: Standard Operating Procedure for agent implementation and delivery
---

# Agent Standard Operating Procedure (SOP)

This document defines the mandatory steps an agent must follow for every task in this repository to ensure architectural consistency, project health, and delivery excellence.

## 1. Pre-Implementation (Analysis & Law)

- **Consult the Rules**: Always read `.agent/rules.md` and appropriate `.agent/agents/` documentation before touching code.
- **Pattern Matching**: Analyze existing domain patterns (e.g., `src/domain/credentials/`) to mirror structure, validation styles, and naming conventions.
- **Prohibited Patterns**:
  - No `z.nativeEnum` (use `z.enum` with `as const` arrays).
  - No manual `try-catch` blocks inside `actions` (bubble errors to the `request` container).
  - No `any` type in business logic or domain schemas.
  - No "suja" inlined functions in `routes.ts` (all logic must live in `actions/`).

## 2. Project Management (GitHub)

- **Hierarchy**: Follow the `Epic -> Feature Branch` flow. Child tasks must branch from the Epic branch, not `main`.
- **Command GH**:
  - Use `gh issue create` for sub-tasks.
- **Automation**: Proposals must be approved by the user.

## 3. The Clean Flow Execution

1. **Schemas**: Define strict Zod validation first. Include standard `headers` validation (omit authorization if public).
2. **Actions**: Implement logic in pure functions inside the `actions/` folder.
3. **Routes**: Bind actions in `routes.ts` using `@infrastructure/server/request` wrappers (`restricted` or `noRestricted`).
4. **Entity**: Define or update Drizzle schemas if persistence is required.

## 4. Quality Assurance (Zero Failure Policy)

- **Unit Testing**: 100% coverage on new business logic using `bun:test`.
- **Mock Isolation**: Always use `afterEach(() => { mock.restoreAllMocks(); })` or explicit `.mockRestore()` on spies to prevent cross-file leakage.
- **Global Build**: Run `bun run build` before pushing. This verifies:
  - Linter (Biome).
  - Type Safety (TSC).
  - Full Test Suite (100+ tests).
  - Build Compilation.
- **Debug Cleanup**: Scan for and remove all `console.log`, `console.dir`, or similar debug statements added during development.

## 5. Housekeeping & Clean Workspace (Zero Debris Policy)

- **Temporary Files**: DELETE all `.log`, `.tmp`, `.output`, or temporary script files created for validation/testing before committing.
- **Git Hygiene**: Never include temporary files in commits. Use `.gitignore` for persistent patterns, but manually delete ad-hoc debris initially.
- **Final Cleanup**: Remove all comments from the code (except required JSDoc) after final validation.

## 6. Documentation & Delivery (Final Step)

- **Artifacts**: Maintain a clean `IMPLEMENTATION_PLAN_<feature>.md` and `walkthrough.md`.
- **Sync Check**: Proactively check if the `README.md` or any architectural documentation in `backend/docs/` needs updates based on the changes.
- **PR Standards**:
  - Clear titles and context.
  - Mermaid diagrams for sequences or state changes.
  - Functional linking using `Closes - #XXX`.

---
*Note: This SOP is a living document and must be verified at the start of every session.*
