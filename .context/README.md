# .context - Agent Collaboration Space

Inter-agent output files. Written by one agent, read by the next.
This directory is git-tracked.

## Folder Structure

```
.context/
├── current/          ← always the latest; all agents read from here
│   ├── planning/
│   │   ├── requirements.md
│   │   ├── user-stories.md
│   │   └── mvp-scope.md
│   ├── design/
│   │   ├── design-system.md
│   │   ├── screens.md
│   │   └── components.md
│   ├── implementation/
│   │   └── ipc-api.md
│   └── qa/
│       └── qa-checklist.md
└── versions/         ← snapshots at milestone boundaries
    └── v0.1/
        ├── planning/     ← /agent-pm 완료 시점
        ├── design/       ← /agent-designer 완료 시점
        ├── implementation/ ← /agent-dev-core + dev-ui 완료 시점
        └── qa/           ← /agent-dev-qa 완료 시점
```

## Versioning Rule

각 단계 완료 시:
1. `current/` 전체를 `versions/vX.X/<milestone>/` 에 복사 (스냅샷)
2. 계속 `current/` 에서 작업

각 버전(v0.1, v0.2, ...)은 제품 릴리즈 단위입니다.
그 안의 단계(planning → design → implementation → qa)가 쌓여 하나의 릴리즈를 이룹니다.

| Milestone | 스냅샷 경로 | 완료 기준 |
|-----------|------------|----------|
| planning | `versions/v0.1/planning/` | /agent-pm 산출물 완료 |
| design | `versions/v0.1/design/` | /agent-designer 산출물 완료 |
| implementation | `versions/v0.1/implementation/` | /agent-dev-core + dev-ui 완료 |
| qa | `versions/v0.1/qa/` | /agent-dev-qa 완료 |

## Output Files

| File | Written by | Read by |
|------|------------|---------|
| `planning/requirements.md` | `/agent-pm` | designer, dev-core, dev-ui, qa |
| `planning/user-stories.md` | `/agent-pm` | designer, dev-core |
| `planning/mvp-scope.md` | `/agent-pm` | all agents |
| `design/design-system.md` | `/agent-designer` | dev-ui |
| `design/screens.md` | `/agent-designer` | dev-ui |
| `design/components.md` | `/agent-designer` | dev-ui |
| `implementation/ipc-api.md` | `/agent-dev-core` | dev-ui, dev-qa |
| `qa/qa-checklist.md` | `/agent-dev-qa` | — |

## Agent Execution Order

```
1. /agent-pm          → requirements.md, user-stories.md, mvp-scope.md
2. /agent-designer    → design-system.md, screens.md, components.md
3. /agent-dev-core    → src/main/, src/shared/, .context/ipc-api.md
   /agent-dev-ui      → src/renderer/  (can run in parallel with dev-core)
4. /agent-dev-qa      → electron.vite.config.ts, electron-builder.yml, qa-checklist.md
```

## Current Status

- Phase: v0.1 planning complete
- Next: Run `/agent-designer` to design screens and component system
