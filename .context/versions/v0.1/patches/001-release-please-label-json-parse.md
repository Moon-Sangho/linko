# Patch: Fix release-please label template JSON parsing error

Date: 2026-03-20
Type: ci
Scope: ci

## Problem

GitHub Actions evaluates `env` block expressions before checking `if` conditions.
When `steps.release.outputs.pr` is empty, `fromJson()` is still called and fails
with "Error reading JToken from JsonReader" error.

This occurs when release-please merges a release PR (no new PR created yet),
or during subsequent workflow runs.

## Fix

Defer JSON parsing to runtime by:
- Move raw JSON output to `PR_JSON` environment variable
- Parse it with `jq` inside the `run` block instead of GitHub Actions expression engine

This prevents template validation errors when `pr` output is empty.
