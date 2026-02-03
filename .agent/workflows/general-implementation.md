---
description: General flow for any code implementation
---

Before starting any implementation task, follow these steps:

1. **Rule Consultation**:
   Check the `.agent/rules.md` file for architecture and style guidelines.
   Check if there is an agent in the /agents folder that best meets your needs.

2. **Context Analysis**:
   - Check if the functionality already exists in any `plugin` (`src/infrastructure/plugins`).
   - Check for relevant architectural decisions in `docs/architecture/architecture-decisions.md`.

3. **Implementation Plan & Internal Documentation**:
   - Before coding, create an `.md` file in the root (e.g., `IMPLEMENTATION_PLAN_<feature>.md`).
   - Define the **Branch Name** (e.g., `feature/my-feature`).
   - Write the **PR Template** (Title, Context, and Changes).
   - Present this condensed plan to the user.

4. **Development Cycle**:
   - Implement following the **Clean Flow** (Route -> Action -> Schema -> Entity).
   - Use the linter: `bun lint:check`.
   - Run relevant tests: `bun test <path_to_test>`.
   - **Mandatory**: Ensure tests cover **90% to 100%** of the new logic.

5. **Documentation & Cleanup**:
   - **Validation**: Check if `README.md` or `docs/` needs updates, additions, or improvements based on the change.
   - **Quality**: Ensure documentation is clear and detailed.
   - **Graphics**: Incorporate **Mermaid** diagrams to explain complex flows or new structures.
   - **Cleanup**: Remove all comments from the code after final validation and approval.
