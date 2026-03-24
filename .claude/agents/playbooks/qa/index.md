# Playbook: QA

Run all QA sub-agents in parallel and produce a unified report.

Do NOT do any QA work yourself — delegate everything to sub-agents.

---

## Pre-work

### Step 1 — Determine the run folder

Check existing runs:

```bash
ls .context/qa/ 2>/dev/null | sort | tail -1
```

**New cycle** (no folders exist, or the latest folder already has `3-verification.md`):
- Create a new folder: `.context/qa/NNN-YYYY-MM-DD-<tag>/`
- Report will be written as `1-qa-report.md`

**Verification** (latest folder has `1-qa-report.md` but no `3-verification.md`):
- Reuse the existing folder
- Report will be written as `3-verification.md`

Choose `<tag>` based on context:

| Tag | When |
|-----|------|
| `initial` | First QA run for this version |
| `post-fix` | After resolving a batch of QA issues |
| `pre-release` | Final gate before a release |
| `regression` | Scheduled or incident-driven check |

```bash
mkdir -p .context/qa/NNN-YYYY-MM-DD-<tag>
```

---

## Agents

Launch all 5 sub-agents simultaneously in a single message.

**Security Agent**
```
Read `.claude/agents/playbooks/qa/security.md` and follow its instructions exactly.
Working directory: <workspace-path>
```

**IPC Agent**
```
Read `.claude/agents/playbooks/qa/ipc.md` and follow its instructions exactly.
Working directory: <workspace-path>
```

**Functional Agent**
```
Read `.claude/agents/playbooks/qa/functional.md` and follow its instructions exactly.
Working directory: <workspace-path>
```

**Build Agent**
```
Read `.claude/agents/playbooks/qa/build.md` and follow its instructions exactly.
Working directory: <workspace-path>
```

**Architecture Agent**
```
Read `.claude/agents/playbooks/qa/architecture.md` and follow its instructions exactly.
Working directory: <workspace-path>
```

---

## Output

Write the unified report to the run folder determined in Pre-work:

```
.context/qa/NNN-YYYY-MM-DD-<tag>/1-qa-report.md    ← new run
.context/qa/NNN-YYYY-MM-DD-<tag>/3-verification.md  ← verification run
```

### Report format

```markdown
# QA Report

Generated: <date>
Overall: PASS / FAIL / WARN

## Summary

| Category | Result | Issues |
|----------|--------|--------|
| Security | PASS/FAIL/WARN | 0 |
| IPC | PASS/FAIL/WARN | 2 |
| Functional | PASS/FAIL/WARN | 1 |
| Build | PASS/FAIL/WARN | 0 |
| Architecture | PASS/FAIL/WARN | 3 |

## All Issues (sorted by severity)

| Severity | Category | File | Description |
|----------|----------|------|-------------|
| HIGH | IPC | src/main/ipc/tags.ts | Handler missing for tag:delete |
| ...  |

---

## Security
<paste Security Agent report here>

---

## IPC
<paste IPC Agent report here>

---

## Functional
<paste Functional Agent report here>

---

## Build
<paste Build Agent report here>

---

## Architecture
<paste Architecture Agent report here>
```

### Overall result rule
- `FAIL` if any sub-agent returned FAIL
- `WARN` if no FAIL but any sub-agent returned WARN
- `PASS` only if all sub-agents returned PASS

---

## User Report

```
QA complete. Overall: FAIL

| Category | Result | Issues |
|----------|--------|--------|
| Security | PASS | 0 |
| IPC | FAIL | 2 |
| Functional | WARN | 1 |
| Build | PASS | 0 |
| Architecture | WARN | 3 |

Report: .context/qa/NNN-YYYY-MM-DD-<tag>/1-qa-report.md

Next step: run /agent-orchestrator playbooks/feature-build.md to distribute fix tasks.
```

For a verification run, replace the next-step line with:

```
Verification complete. Run cycle closed: .context/qa/NNN-YYYY-MM-DD-<tag>/
```
