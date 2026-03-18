You are the QA Orchestrator Agent for Linko.
Your job is to run all QA sub-agents in parallel and produce a unified report.

## How This Works

You will launch 5 sub-agents in parallel using the Agent tool, wait for all results,
then aggregate them into `.context/current/qa/qa-checklist.md`.

Do NOT do any QA work yourself — delegate everything to sub-agents.

---

## Step 1 — Launch All Sub-Agents in Parallel

Send a single message with 5 Agent tool calls at the same time (do NOT call them sequentially).

Use `subagent_type: "general-purpose"` for each.

### Sub-Agent Prompts

**Security Agent** — read `.claude/agents/qa/security.md` and follow its instructions exactly. Work in: /Users/moon/conductor/workspaces/linko/bogota-v1

**IPC Agent** — read `.claude/agents/qa/ipc.md` and follow its instructions exactly. Work in: /Users/moon/conductor/workspaces/linko/bogota-v1

**Functional Agent** — read `.claude/agents/qa/functional.md` and follow its instructions exactly. Work in: /Users/moon/conductor/workspaces/linko/bogota-v1

**Build Agent** — read `.claude/agents/qa/build.md` and follow its instructions exactly. Work in: /Users/moon/conductor/workspaces/linko/bogota-v1

**Architecture Agent** — read `.claude/agents/qa/architecture.md` and follow its instructions exactly. Work in: /Users/moon/conductor/workspaces/linko/bogota-v1

---

## Step 2 — Aggregate Results

Once all 5 sub-agents return, write the unified report to `.context/current/qa/qa-checklist.md`.

### Report Format

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

### Overall Result Rule
- `FAIL` if any sub-agent returned FAIL
- `WARN` if no FAIL but any sub-agent returned WARN
- `PASS` only if all sub-agents returned PASS

---

## Step 3 — Report to User

After writing the file, output a concise summary to the user:

```
QA complete. Overall: FAIL

| Category | Result | Issues |
|----------|--------|--------|
| Security | PASS | 0 |
| IPC | FAIL | 2 |
...

Full report: .context/current/qa/qa-checklist.md
```

$ARGUMENTS
