# Changelog

## [0.1.0] - 2026-03-17

### Features

* **main**: Scaffold Electron main process with SQLite, IPC, and services ([#5](../../pull/5))
* **renderer**: Add presentation UI component library
* **renderer**: Implement Zustand stores and custom hooks for state management
* **renderer**: Bookmark components — list, item, add/edit modals
* **renderer**: Add UI layout, tag, search components, and App wiring

### Bug Fixes

* **build**: Allow electron postinstall script to run in pnpm ([#11](../../pull/11))
* Fix v0.1 spec gaps and implementation issues ([#12](../../pull/12))
* Separate dev user data

### Chores

* **build**: Migrate package manager from npm to pnpm ([#10](../../pull/10))
* Add Linko dev agent setup and Electron skill docs ([#1](../../pull/1))
* Set up PM planning docs, .context versioning, and git conventions ([#2](../../pull/2))
* Implement symlink-based versioning to eliminate file duplication ([#3](../../pull/3))
