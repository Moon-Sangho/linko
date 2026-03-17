# Patch 004 — Upgrade better-sqlite3 to v12 for Node.js 24

**Date:** 2026-03-17
**Agents involved:** Build

## Problem

`npm install` (and `pnpm install`) failed on Node.js 24 environments.
Root cause: `better-sqlite3` v9.x requires C++17 during native compilation,
but Node.js 24 ships with a compiler that enforces C++20 by default, causing
ABI/build failures.

## Changes

- `better-sqlite3`: `^9.4.3` → `^12.8.0`
- `@types/better-sqlite3`: `^7.6.8` → `^7.6.13`
- `package.json` `engines.node`: Updated to allow Node.js 24.x

## Notes
- v12 ships prebuilt binaries for Node 24, so native compilation is not required
  in most cases
- No API changes — all existing repository code is compatible with v12
