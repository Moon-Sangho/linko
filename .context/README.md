# .context - Agent Collaboration Space

This directory is used for agents to share information with each other.
It is gitignored.

## Agent Config Files
- `agents/agent-pm.md` — PM Agent instructions
- `agents/agent-designer.md` — Designer Agent instructions
- `agents/agent-dev-core.md` — Dev Core Agent instructions (Electron main process)
- `agents/agent-dev-ui.md` — Dev UI Agent instructions (React renderer)
- `agents/agent-dev-qa.md` — Dev QA Agent instructions

## Shared Output Files (created during development)
- `requirements.md` — written by PM Agent
- `user-stories.md` — written by PM Agent
- `mvp-scope.md` — written by PM Agent
- `design-system.md` — written by Designer Agent
- `screens.md` — written by Designer Agent
- `components.md` — written by Designer Agent
- `ipc-api.md` — written by Main Process Agent
- `qa-checklist.md` — written by QA Agent

## Execution Order
1. `/agent-pm` → writes requirements
2. `/agent-designer` → reads requirements, writes design specs
3. `/agent-dev-core` + `/agent-dev-ui` → parallel (read PM + Designer output)
4. `/agent-dev-qa` → verifies everything works
