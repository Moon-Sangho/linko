# .context - Agent Collaboration Space

Inter-agent output files. Written by one agent, read by the next.
This directory is git-tracked.

## Output Files (created during development)

| File               | Written by          | Read by                          |
|--------------------|---------------------|----------------------------------|
| `requirements.md`  | `/agent-pm`         | designer, dev-core, dev-ui, qa   |
| `user-stories.md`  | `/agent-pm`         | designer, dev-core               |
| `mvp-scope.md`     | `/agent-pm`         | all agents                       |
| `design-system.md` | `/agent-designer`   | dev-ui                           |
| `screens.md`       | `/agent-designer`   | dev-ui                           |
| `components.md`    | `/agent-designer`   | dev-ui                           |
| `ipc-api.md`       | `/agent-dev-core`   | dev-ui, dev-qa                   |
| `qa-checklist.md`  | `/agent-dev-qa`     | —                                |

## Agent Execution Order

```
1. /agent-pm          → requirements.md, user-stories.md, mvp-scope.md
2. /agent-designer    → design-system.md, screens.md, components.md
3. /agent-dev-core    → src/main/, src/shared/, .context/ipc-api.md
   /agent-dev-ui      → src/renderer/  (can run in parallel with dev-core)
4. /agent-dev-qa      → electron.vite.config.ts, electron-builder.yml, qa-checklist.md
```

## Current Status

- Phase: Setup complete, ready to start development
- Next: Run `/agent-pm` to define requirements
