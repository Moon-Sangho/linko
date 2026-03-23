# Conventions Index

Project-wide coding conventions for Linko.
Each reference below covers a specific area — read the relevant file before working in that domain.

| Convention | Summary | Reference |
|---|---|---|
| **File Naming** | All source files use kebab-case to avoid case-sensitivity issues on GitHub | [file-naming.md](./references/file-naming.md) |
| **Imports** | Absolute path aliases (`@renderer/`, `@shared/`), no barrel exports | [imports.md](./references/imports.md) |
| **Renderer** | IPC-only access, Zustand store pattern, component rules | [renderer.md](./references/renderer.md) |
| **Main Process** | Repository pattern, IPC handler structure, response shape | [main.md](./references/main.md) |
| **Electron Security** | BrowserWindow settings, contextBridge rules, prohibited patterns | [electron-security.md](./references/electron-security.md) |
| **Git** | Branch naming (`type/description`), conventional commit format | [git.md](./references/git.md) |
