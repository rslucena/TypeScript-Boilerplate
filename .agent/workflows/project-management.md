---
description: How to manage the project board, create tasks, and update status.
---

# Issue & PR Management Workflow

1. **GitHub Issue Creation**:
    - **CRITICAL RULE**: The Agent *must* read the repository's issue templates in `.github/ISSUE_TEMPLATE/` (e.g., `3_feature_request.yml`) and format the issue body precisely according to those fields (e.g., Problem, Solution, Alternatives, Additional Context).
    - The Agent will generate the detailed issue description in **English**, following the template structure.
    - If applicable, include an **Architecture Diagram**: a `mermaid` block visualizing the logic flow or component interaction in the "Additional context" section.
    - Write this description to a temporary file: `temp/issue-body.md`.
    - Create the issue using the GitHub CLI:
      `gh issue create --title "[Feature] Task Name" --body-file temp/issue-body.md`
    - The CLI returns an Issue URL and number (e.g., `#123`).
    - Clean up the temporary file.

## 2. Execution and Linking to GitHub
When work begins on the task:
1. **Branching**:
    - **CRITICAL RULE**: Branches must follow the Epic/Child structure. Create or checkout the parent Epic branch first (e.g., `epic/117-advanced-authentication`), then create the child feature branch from it (e.g., `feat/120-sso-mapping`).
    - When the subtask is finished, the child branch (`feat`) will be merged back into the parent (`epic`).
2. **Status Updates**:
    - Keep track of completed steps internally or in your artifacts.
3. **Pull Requests**:
    - **CRITICAL RULE**: Pull Requests must NEVER be opened with just "Closes #XXX". A high-quality PR is mandatory for documentation.
    - When opening a PR, the Agent must generate a detailed PR description in a temporary file (`temp/pr-body.md`).
    - The PR description must contain:
      - **Context & Objectives**: A brief summary of what this PR accomplishes and why.
      - **What Changed**: Bullet points of the technical implementation (files added, patterns used).
      - **Architecture Diagram**: A `mermaid` diagram if the PR introduces new flows or integrations.
      - **Linking Keyword**: The exact phrase `Closes #123` or `Fixes #123`.
    - Execute `gh pr create --title "feat: ... " --body-file temp/pr-body.md`
    - GitHub will automatically link the PR to the issue. If GitHub's native project automations are active, this will also shift the project card's status (e.g., "In Progress" -> "Done").

## 3. Interpreting Demands
When the user gives a high-level goal (e.g., "Implement SSO"):
1. **Analyze**: Break it down into backend (API, DB) and frontend components.
2. **Automate**: Run the GitHub CLI commands to set up the issues before writing implementation code.
