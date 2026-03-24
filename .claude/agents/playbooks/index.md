# Playbooks

Playbooks define **what** to orchestrate. The universal `orchestrator.md` defines **how**.

Each playbook is a self-contained workflow specification: which sub-agents to run, what to pass them, and how to synthesize their output.

---

## How to add a new playbook

1. Create a folder: `.claude/agents/playbooks/<name>/`
2. Add `index.md` — the playbook entry point (see structure below)
3. Add sub-agent files inside the folder if needed
4. Create a command in `.claude/commands/agent-<name>.md` that calls `orchestrator.md` with your playbook path

```markdown
<!-- .claude/commands/agent-<name>.md -->
---
description: <one-line description>
---

Read `.claude/agents/orchestrator.md` and follow its instructions exactly.

playbooks/<name>/index.md $ARGUMENTS
```

---

## Playbook structure (`index.md`)

Every playbook must define these four sections:

| Section | Purpose |
|---------|---------|
| `## Pre-work` | Steps the orchestrator runs before launching agents (can be "None") |
| `## Agents` | Sub-agents to launch in parallel, with exact prompts |
| `## Output` | Where to write the report and what format to use |
| `## User Report` | Summary format printed to the user after completion |

---

## Available playbooks

| Playbook | Shortcut command | Via orchestrator |
|----------|-----------------|------------------|
| `feature-build.md` | — | `/agent-orchestrator playbooks/feature-build.md` |
| `qa/` | `/agent-dev-qa` | `/agent-orchestrator playbooks/qa/index.md` |
| `test-code-review/` | `/agent-test-code-review` | `/agent-orchestrator playbooks/test-code-review/index.md` |

`/agent-orchestrator` also accepts natural language — e.g. `/agent-orchestrator run full QA` — and selects the matching playbook automatically.
