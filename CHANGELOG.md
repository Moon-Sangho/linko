# Changelog

## [0.1.11](https://github.com/Moon-Sangho/linko/compare/v0.1.10...v0.1.11) (2026-03-25)


### Bug Fixes

* **renderer:** Make tag filter update search results instantly ([#73](https://github.com/Moon-Sangho/linko/issues/73)) ([189429f](https://github.com/Moon-Sangho/linko/commit/189429f0038c492867f498c78c213a9920a3047c))

## [0.1.10](https://github.com/Moon-Sangho/linko/compare/v0.1.9...v0.1.10) (2026-03-24)


### Bug Fixes

* **ui:** Prevent global keyboard shortcuts from intercepting input events ([#66](https://github.com/Moon-Sangho/linko/issues/66)) ([257ccde](https://github.com/Moon-Sangho/linko/commit/257ccdead55eac8abd3ce96ab63a917756181905))

## [0.1.9](https://github.com/Moon-Sangho/linko/compare/v0.1.8...v0.1.9) (2026-03-20)


### Bug Fixes

* **main:** Remove dock icon call that fails in packaged app ([#58](https://github.com/Moon-Sangho/linko/issues/58)) ([079696f](https://github.com/Moon-Sangho/linko/commit/079696fdc85d45a890ee210b657aef5de86b7f2c))

## [0.1.8](https://github.com/Moon-Sangho/linko/compare/v0.1.7...v0.1.8) (2026-03-20)


### Features

* **build:** Add custom app icon with cross-platform icon build pipeline ([#56](https://github.com/Moon-Sangho/linko/issues/56)) ([0a120af](https://github.com/Moon-Sangho/linko/commit/0a120af9eafe0164da119f00a620ea4c58ba0630))

## [0.1.7](https://github.com/Moon-Sangho/linko/compare/v0.1.6...v0.1.7) (2026-03-20)


### Features

* **ui:** Redesign sidebar tag filter with left-border active state ([#52](https://github.com/Moon-Sangho/linko/issues/52)) ([0461619](https://github.com/Moon-Sangho/linko/commit/04616193f3fb10b0a4c6b6a598a35fb42daa82d6))

## [0.1.6](https://github.com/Moon-Sangho/linko/compare/v0.1.5...v0.1.6) (2026-03-20)


### Features

* **ui:** Add shift-click range selection for bookmark checkboxes ([#50](https://github.com/Moon-Sangho/linko/issues/50)) ([f976569](https://github.com/Moon-Sangho/linko/commit/f97656968abe97ce09444c165cfa5a17fad186c8))

## [0.1.5](https://github.com/Moon-Sangho/linko/compare/v0.1.4...v0.1.5) (2026-03-20)


### Bug Fixes

* **ui:** Fix BulkActionBar position to always stick to bottom of screen ([#42](https://github.com/Moon-Sangho/linko/issues/42)) ([8a4c268](https://github.com/Moon-Sangho/linko/commit/8a4c268f9304e45980de546bc7eb751ff65713bf))

## [0.1.4](https://github.com/Moon-Sangho/linko/compare/v0.1.3...v0.1.4) (2026-03-19)


### Features

* **ui:** Add bulk select/delete, fix bookmark/tag scroll, and correct import conventions ([#34](https://github.com/Moon-Sangho/linko/issues/34)) ([f2ea7c2](https://github.com/Moon-Sangho/linko/commit/f2ea7c25d29ef6e77b1f3cfb4bfe8da7d41825ce))

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
