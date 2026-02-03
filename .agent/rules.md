# Agent Rules

This file defines the mandatory guidelines for me, your AI agent. I will consult this file before any significant implementation to ensure consistency with your project.

## 📚 Main Reference
Always consult the [docs/](../docs/) folder for deep details on:
- [Architecture](../docs/architecture)
- [Best Practices](../docs/development/best-practices.md)
- [Testing Guide](../docs/development/testing-guide.md)

## 🛠️ Code Guidelines

### 1. Layered Architecture (DDD-lite)
- **Domain (`src/domain/`)**: Where business logic resides.
    - `actions/`: Must be focused and have a single responsibility.
    - `entity/`: Drizzle table definitions.
    - `schema/`: Zod validation.
    - `routes/`: Fastify route definitions.
- **Infrastructure (`src/infrastructure/`)**: Technical details (Server, Cache, DB, Message, Plugins).

### 2. Implementation Patterns
- **Language**: **ALL** code, documentation, comments, and implementation plans must be in **English**. Conversation with the user should follow the user's preferred language.
- **Naming**:
    - Actions: `verbNoun` (e.g., `postNewUser`, `getById`).
    - Action Files: `kebab-case.ts`.
- **Database**: Always use **Prepared Statements** via Drizzle for repetitive queries.
- **Validation**: All input must be validated with **Zod** in the domain Schemas.
- **Typing**: **STRICTLY FORBIDDEN** to use `any`. All code must be strictly typed.
- **Control Structures**:
    - Avoid cascades of `if`, `else if`, `else`. Prefer **Early Returns** or `switch/case` when appropriate to keep code linear and clean.
    - For `if` with a single line of instruction (e.g., quick returns), do not use braces. Example: `if (x) return XYZ`.
- **Final Cleanup**: After code validation and final approval, all comments (except for necessary JSDoc for API documentation) must be **removed** to keep the code as clean as possible.
- **Internationalization (i18n)**: Errors must use translation keys (e.g., `request.badRequest(lang, "key")`).
- **Cache**: Implement Redis caching for frequently read data and invalidate them on mutations.

### 3. Testing
- Always follow the **AAA (Arrange, Act, Assert)** pattern.
- **Mandatory Coverage**: Every new Action or Domain feature must include corresponding tests in `tests/unit/`. The goal is to maintain **90% to 100% code coverage** for all new logic.
- Test domain logic, not the infrastructure of the library.

### 4. Style and Tools
- Use **Bun** as runtime and package manager.
- The official linter/formatter is **Biome**. Do not use Prettier/ESLint unless explicitly requested.
- **Git Strategy**: Use **Conventional Commits** (e.g., `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`) for all commits.

### 5. Plugin System
- **Modularity**: Cross-cutting concerns (Auth, Logs, etc.) must be implemented as plugins in `src/infrastructure/plugins`.
- **Configuration**: Every new plugin must be registered in `src/infrastructure/settings/plugins.ts`.
- **Priority**: Assign the correct priority to ensure the desired execution order.

### 6. Dependency Management
- **Minimalist Approach**: Avoid adding new external dependencies. Always try to implement using existing boilerplate features or vanilla TypeScript/Bun first.
- **Security**: Regularly check for vulnerabilities and never commit secrets/keys.

---

## 🤖 Agent Behavior
- **Agenic Memory**:
    - **Never Commit**: `IMPLEMENTATION_PROPOSAL.md` is for planning only and must **NEVER** be committed to the repository. It should remain local.
- **Implementation Proposal**: For any task, I must create an `IMPLEMENTATION_PROPOSAL.md` file in the root containing:
    - **Branch Information**: Branch Name (`feat/name`) and PR Name (`type(scope): description`).
    - **Context**: Brief explanation of the problem and improved solution.
    - **Proposed Changes**:
        - Focus on **textual summaries** of logic and architecture.
        - **Logic Diagram**: A generic Mermaid diagram showing how the new feature connects/flows in the system.
        - **Avoid large code blocks**. Use short references to files/functions.
        - Mention design patterns or structural changes.
    - **PR Template Sections**: Align structure with `.github/pull_request_template.md` (e.g., Benefits, Checklist, Type of Change).
    - **Verification Plan**: Step-by-step instructions for automated and manual testing.
    - **Commit Plan**:
        - **Distinct**: Commit messages should NOT be identical to the PR title but must share the same context.
        - **Granularity**: Separate logical changes (e.g., one commit for infra, one for docs).
        - **Convention**: Use Conventional Commits.
- **Code Review**: Before submitting, I will run a self-check for N+1 queries, missing database indexes, and `any` usage.
- **Proactivity**: Before creating something new, check if a similar template or pattern exists in the project.
- **Documentation**:
    - When implementing a new feature, I must validate if the `README.md` or `docs/` needs updates, improvements, or new files.
    - Documentation must be **clear, detailed, and dynamic**.
    - **Graphics**: Use **Mermaid** diagrams to visualize complex data flows, logic, or architectures. This is mandatory for significant changes to make the documentation easier to read.
- **Security**: Never log sensitive data (passwords, tokens). Always use env vars.
