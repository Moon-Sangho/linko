# Playbook: Test Code Review

Run 3 specialist test reviewers in parallel, then synthesize their findings into a single prioritized report.

Do NOT do any review work yourself — delegate everything to sub-agents.

---

## Pre-work

### Step 1 — Identify files to review

If `$ARGUMENTS` specifies files or directories, use those.
Otherwise, default to all test files changed in the current branch:

```bash
git diff main...HEAD --name-only | grep -E '\.test\.(ts|tsx)$'
```

If no changed test files exist, fall back to all test files in the renderer and shared layers:

```bash
find src/renderer src/shared -name '*.test.ts' -o -name '*.test.tsx' | sort
```

Collect the file list. You will pass it to each sub-agent.

### Step 2 — Determine the run folder

Check existing runs for today's date:

```bash
ls .context/test-code-review/ 2>/dev/null | sort | tail -1
```

If a folder for today already exists, increment `<NN>`. Start at `01` if none exists.

```bash
mkdir -p .context/test-code-review/YYYY-MM-DD-<NN>
```

---

## Agents

Launch all 3 reviewer sub-agents simultaneously in a single message.

**Skeptic Agent**
```
Read `.claude/agents/playbooks/test-code-review/skeptic.md` and follow its instructions exactly.

Review the following test files. For each, also read the corresponding source file.

Files to review:
<file list>

Working directory: <workspace-path>
```

**Coverage Hawk Agent**
```
Read `.claude/agents/playbooks/test-code-review/coverage-hawk.md` and follow its instructions exactly.

Review the following test files. For each, also read the corresponding source file.

Files to review:
<file list>

Working directory: <workspace-path>
```

**Pragmatist Agent**
```
Read `.claude/agents/playbooks/test-code-review/pragmatist.md` and follow its instructions exactly.

Review the following test files. For each, also read the corresponding source file.

Files to review:
<file list>

Working directory: <workspace-path>
```

---

## Output

Write the unified report to:

```
.context/test-code-review/<YYYY-MM-DD>-<NN>/report.md
```

### Report format

```markdown
# Test Code Review Report

Date: <date>
Files reviewed: <N>
Verdict: PASS | WARN | FAIL

---

## Executive Summary

| Reviewer | Issues |
|----------|--------|
| Skeptic (false confidence) | X |
| Coverage Hawk (missing scenarios) | Y |
| Pragmatist (maintainability) | Z |
| **Total** | **N** |

### Top Priorities

List the 3–5 most important issues across all reviewers. Consensus issues (flagged by 2+ reviewers) rank higher.

---

## Skeptic Findings

<paste Skeptic output here>

---

## Coverage Hawk Findings

<paste Coverage Hawk output here>

---

## Pragmatist Findings

<paste Pragmatist output here>

---

## Consensus Issues

List issues flagged by 2 or more reviewers about the same test or file.
These are highest-confidence problems — fix them first.

| File | Issue | Flagged By |
|------|-------|------------|
| ... | ... | Skeptic + Coverage Hawk |
```

### Verdict rule
- `FAIL` — any Skeptic issue of false positive / always-passing test, OR 5+ total issues
- `WARN` — 1–4 total issues, no false positives
- `PASS` — 0 issues

---

## User Report

```
Test review complete. Verdict: WARN

| Reviewer | Issues |
|----------|--------|
| Skeptic | 1 |
| Coverage Hawk | 3 |
| Pragmatist | 2 |
| Total | 6 |

Top priority: [one-line summary of most important issue]

Full report: .context/test-code-review/YYYY-MM-DD-<NN>/report.md
```

---

## Example Report

See [`review-example.md`](./review-example.md) for a real output from this playbook.
