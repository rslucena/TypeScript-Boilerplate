# Agent Rules

This file defines the mandatory guidelines for me, your AI agent. I will consult this file before any significant implementation to ensure consistency with your project.

## 📚 Main Reference
Always consult the [wiki/](../wiki/) folder for deep details on:
- [Architecture](../wiki/Architecture.md)
- [Best Practices](../wiki/Best-Practices.md)
- [Testing Guide](../wiki/Testing-Guide.md)

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
    - **Task Logging**: For every significant implementation, I must create a task log in `.agent/tasks/YYYY-MM/DD_{TIMESTAMP}.md`.
    - **Self-Correction**: Check for similar past tasks in `.agent/tasks/` before starting to avoid duplicating efforts or repeating mistakes.
    - **Reflection**: Periodically update `.agent/reflections/` with broad architectural insights or recurring patterns discovered.
- **Log Template**: Each task log must include:
    - **Description**: What the task is.
    - **User Request**: Textual quote.
    - **Context**: Project state before changes.
    - **Decisions**: Why approach X was chosen over Y.
    - **Implemented Changes**: Step-by-step summary.
    - **Lessons Learned**: Insights for future agents/sessions.
- **Implementation Proposal**: For any non-trivial task, I must create an `IMPLEMENTATION_PROPOSAL.md` file in the root containing:
    - **Branch Name**: Following the pattern `feat/name`, `fix/name`, or `docs/name`.
    - **Branch Title**: A descriptive title for the branch (e.g., # [Feat] Setup Agent Directives).
    - **PR Name**: Following the format `type(scope): description` (e.g., `feat(agents): setup-agent-directives`).
    - **Standard PR Template**: Mandatory use of sections from `.github/pull_request_template.md` (Changes, Motivation/Context, Benefits, Is it resolved?, Type of Change, Checklist).
    - **Commit Plan**: A detailed plan for git commits:
        - **Minimum**: At least **2 commits** to separate different types of changes.
        - **Format**: Each commit must have a title (Conventional Commits) and a list of specific files included.
    - **Additional Details**: Any extra technical info (e.g., Mermaid diagrams, specific deployment steps) should be added *after* the standard template sections.
- **Code Review**: Before submitting, I will run a self-check for N+1 queries, missing database indexes, and `any` usage.
- **Proactivity**: Before creating something new, check if a similar template or pattern exists in the project.
- **Documentation**: 
    - When implementing a new feature, I must validate if the `README.md` or `wiki/` needs updates, improvements, or new files.
    - Documentation must be **clear, detailed, and dynamic**. 
    - **Graphics**: Use **Mermaid** diagrams to visualize complex data flows, logic, or architectures. This is mandatory for significant changes to make the documentation easier to read.
- **Security**: Never log sensitive data (passwords, tokens). Always use env vars.
