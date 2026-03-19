# Changelog

## [0.1.4](https://github.com/Moon-Sangho/linko/compare/linko-v0.1.3...linko-v0.1.4) (2026-03-19)


### Features

* **main:** Scaffold Electron main process with SQLite, IPC, and services ([#5](https://github.com/Moon-Sangho/linko/issues/5)) ([8d8f124](https://github.com/Moon-Sangho/linko/commit/8d8f1240036a982d8136079236be7ce57323bbd7))
* **renderer:** Add presentation UI component library ([d8fdebf](https://github.com/Moon-Sangho/linko/commit/d8fdebf210c29a3596f93fddfee40b9eba3cda19))
* **renderer:** Add UI layout, tag, search components, and App wiring ([096aad6](https://github.com/Moon-Sangho/linko/commit/096aad6ff62c928fdd599ba79f692250bebb58ea))
* **renderer:** Bookmark components — list, item, add/edit modals ([472cc97](https://github.com/Moon-Sangho/linko/commit/472cc978597e203e55abafe6d3e616ef093d0fe0))
* **renderer:** Implement Zustand stores and custom hooks for state management ([38a11bd](https://github.com/Moon-Sangho/linko/commit/38a11bd62ec90ade2aff589c09a38606a7a8e81e))
* **ui:** Add bulk select/delete, fix bookmark/tag scroll, and correct import conventions ([#34](https://github.com/Moon-Sangho/linko/issues/34)) ([f2ea7c2](https://github.com/Moon-Sangho/linko/commit/f2ea7c25d29ef6e77b1f3cfb4bfe8da7d41825ce))


### Bug Fixes

* **build:** Allow electron postinstall script to run in pnpm ([#11](https://github.com/Moon-Sangho/linko/issues/11)) ([fb0898a](https://github.com/Moon-Sangho/linko/commit/fb0898aae47c2718d82c59cee9cd626561314492))
* Fix v0.1 spec gaps and implementation issues ([#12](https://github.com/Moon-Sangho/linko/issues/12)) ([c52bcc4](https://github.com/Moon-Sangho/linko/commit/c52bcc46154d1ecd362f033ba29d1f21d2d73d61))
* **main,renderer:** Improve IPC validation, error handling, and platform detection ([#22](https://github.com/Moon-Sangho/linko/issues/22)) ([920ed33](https://github.com/Moon-Sangho/linko/commit/920ed33c91a90bc1af73b00481a5080f3867a1f1)), closes [#1](https://github.com/Moon-Sangho/linko/issues/1)
* **renderer:** Improve URL input UX and re-fetch title on URL change ([#25](https://github.com/Moon-Sangho/linko/issues/25)) ([f6220d0](https://github.com/Moon-Sangho/linko/commit/f6220d05d17824cda35197c0e4032ceb43f2f4d7))
* Separate dev user data ([0d4bef3](https://github.com/Moon-Sangho/linko/commit/0d4bef31bb870e66fa260046406019d872607946))
* **ui:** Remove barrel exports and fix import conventions across codebase ([#32](https://github.com/Moon-Sangho/linko/issues/32)) ([455a8b7](https://github.com/Moon-Sangho/linko/commit/455a8b799921515591438496f44100a8d6650645))

## [0.1.3](https://github.com/Moon-Sangho/linko/compare/v0.1.2...v0.1.3) (2026-03-18)


### Bug Fixes

* **ui:** Remove barrel exports and fix import conventions across codebase ([#32](https://github.com/Moon-Sangho/linko/issues/32)) ([455a8b7](https://github.com/Moon-Sangho/linko/commit/455a8b799921515591438496f44100a8d6650645))

## [0.1.2](https://github.com/Moon-Sangho/linko/compare/v0.1.1...v0.1.2) (2026-03-17)


### Bug Fixes

* **renderer:** Improve URL input UX and re-fetch title on URL change ([#25](https://github.com/Moon-Sangho/linko/issues/25)) ([f6220d0](https://github.com/Moon-Sangho/linko/commit/f6220d05d17824cda35197c0e4032ceb43f2f4d7))

## [0.1.1](https://github.com/Moon-Sangho/linko/compare/v0.1.0...v0.1.1) (2026-03-17)


### Bug Fixes

* **main,renderer:** Improve IPC validation, error handling, and platform detection ([#22](https://github.com/Moon-Sangho/linko/issues/22)) ([920ed33](https://github.com/Moon-Sangho/linko/commit/920ed33c91a90bc1af73b00481a5080f3867a1f1)), closes [#1](https://github.com/Moon-Sangho/linko/issues/1)

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
