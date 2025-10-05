![https://github.com/rslucena/TypeScript-Boilerplate](https://i.ibb.co/Ytg53xH/Screenshot-from-2024-03-01-23-25-11.png)

A modern, production-ready TypeScript boilerplate featuring Bun, Vite, Drizzle ORM, Docker, and full testing support.

[![CodeQL](https://github.com/rslucena/Template-Typescript/actions/workflows/check.codeql.yml/badge.svg)](https://github.com/rslucena/Template-Typescript/actions/workflows/check.codeql.yml)   [![Build and Test CI](https://github.com/rslucena/Template-Typescript/actions/workflows/build.nodejs.yml/badge.svg)](https://github.com/rslucena/Template-Typescript/actions/workflows/build.nodejs.yml)   [![Commit Activity](https://img.shields.io/github/commit-activity/t/rslucena/Template-Typescript)](https://github.com/rslucena/Template-Typescript/pulse)   [![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/rslucena/Template-Typescript?link=https%3A%2F%2Fgithub.com%2Frslucena%2FTemplate-Typescript%2Fcommits%2Fmain%2F)](https://github.com/rslucena/Template-Typescript/graphs/code-frequency)   [![GitHub contributors](https://img.shields.io/github/contributors/rslucena/Template-Typescript)](https://github.com/rslucena/Template-Typescript/graphs/contributors)

## 🚀 Quick Start

```bash
git clone https://github.com/rslucena/TypeScript-Boilerplate.git my-project
cd my-project
bun install
cp .env.exemple .env
bun run dev
```

---

## 📦 Folder Structure

```
src/
  commands/         # Main app commands or CLI entry points
  domain/           # Business logic (entities, use cases)
  functions/        # Utility/helper functions
  infrastructure/   # Database, external services, etc.
tests/              # Automated tests
```

---

## 🧑‍💻 Usage Examples

### Run the development server

```bash
bun run dev
```

### Build for production

```bash
bun run build
```

### Run tests

```bash
bun test
```

### Running with Docker

```bash
docker-compose up --build
```

---

## ⚙️ Environment Variables

- Check `.env.exemple` for all required variables.
- Example:
  ```
  POSTGRES_PORT=5432
  POSTGRES_POOL=200
  POSTGRES_SERVER=localhost
  # Add other variables as needed
  ```

---

## 🔗 Main Features

- **Bun** as package manager and runtime for fast installs and execution
- **TypeScript** for type-safe development
- **Vite** for fast builds and hot-module replacement (HMR)
- **Drizzle ORM** for modern and type-safe database access
- **Docker** and `docker-compose` for containerized development and production
- **ESLint** and **Biome** for code linting and formatting
- **Testing** setup (see `tests/` directory)
- **Ready-to-use project structure** separating domain, infrastructure, commands, and utilities

---

## 💡 Tips & FAQ

- **How to create a new migration (Drizzle)?**
  ```bash
  bun run drizzle-kit generate
  ```
- **How to add a new dependency?**
  ```bash
  bun add <package>
  ```
- **How to update dependencies?**
  ```bash
  bun upgrade
  ```

---

## 📚 Resources

- [Wiki](https://github.com/rslucena/TypeScript-Boilerplate/wiki)
- [Bun Documentation](https://bun.sh/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/guide/)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Docker Docs](https://docs.docker.com/)

---

## 🤝 Contributing

Pull requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## 📜 License

This project is under the MIT license. See [LICENSE](LICENSE) for details.
