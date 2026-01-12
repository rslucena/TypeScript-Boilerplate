# Contributing to TypeScript Boilerplate

Thank you for your interest in contributing to this project! We welcome all kinds of contributions—bug reports, ideas, code, docs, and more.

## How to Contribute

### 1. Fork the Repository

Click the "Fork" button at the top right of the [repository page](https://github.com/rslucena/TypeScript-Boilerplate) to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/TypeScript-Boilerplate.git
cd TypeScript-Boilerplate
```

### 3. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feat/your-feature-name
```

### 4. Install Dependencies

Make sure you have Bun installed, then:

```bash
bun install
```

### 5. Make Your Changes

- Follow the existing code style (Biome and ESLint are configured).
- Add or update tests if necessary (`tests/` directory).
- Update documentation as needed.

### 6. Run Lint and Tests

Before committing, ensure everything is linted and tested:

```bash
bun run biome
bun test
```

### 7. Commit and Push

```bash
git add .
git commit -m "feat: Describe your changes"
git push origin feat/your-feature-name
```

### 8. Open a Pull Request

Go to your fork on GitHub and click "Compare & pull request". Please fill out the PR template and provide context/motivation for your changes.

---

## Code Style

- Keep code clean and consistent.
- Use TypeScript features and types whenever possible.
- Prefer functional programming and immutability when applicable.

## Reporting Bugs / Requesting Features

- Open an [issue](https://github.com/rslucena/TypeScript-Boilerplate/issues) and provide as much detail as possible (steps to reproduce, expected/actual behavior, screenshots, etc.).
- Tag your issue as a "bug", "enhancement", or "question" as appropriate.

## Community

- Be kind and respectful to others.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Thank you for helping improve this project! 🚀