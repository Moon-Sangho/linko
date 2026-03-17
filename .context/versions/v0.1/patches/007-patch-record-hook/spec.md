# Patch 007 — Patch Record Validation Hook

**Date:** 2026-03-18
**Agents involved:** Dev UI

## Problem

Patch-level changes (fixes, refactors, improvements) were not being systematically documented. Without enforcement, it's easy to forget creating `.context/current/patches/NNN-*/spec.md` records, leading to missing change history and making it harder for agents to understand what was done in maintenance cycles.

## Decision

Add a Claude Code PreToolUse hook that intercepts `git commit` commands and enforces patch documentation:
- Only for patch-level commits (per release-please: non-feat, non-breaking)
- Checks if a recent patch record exists (modified in last 60 minutes)
- If not found, asks user (via Claude) "Shall I write the patch document for you?"
- User can accept (Claude creates it) or skip (proceed without)

## Changes

### `.claude/hooks/check-patch-record.sh`
- New PreToolUse Bash hook for validating patch-level commits
- Extracts commit type from `git commit` command
- Skips major/minor (feat, feat!, BREAKING CHANGE) commits
- Checks for recent patches (mtime within 60 minutes) to avoid re-prompting
- Falls back to asking user if no recent patch found
- Auto-calculates next patch number from existing entries

### `.claude/settings.json`
- Register `check-patch-record.sh` hook in PreToolUse array for Bash tool
- Keeps existing `validate-pr.sh` hook for PR validation

### `.claude/commands/git-commit.md`
- Add Patch Record Rule section explaining release-please convention
- Document when patch records are required (everything except feat/breaking)
- Link to `.context/README.md` (Patches section) for full specification
- Explain user prompt flow ("Shall I write...?") and Yes/No outcomes
