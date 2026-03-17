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

`current`는 항상 최신 버전 디렉토리를 가리키는 **심볼릭 링크**입니다.
파일을 복사하지 않으므로 중복이 없습니다.

### 릴리즈 경계 시 (예: v0.1 → v0.2)

```bash
# 1. 현재 버전(v0.1) 아카이브 — current 링크가 끊기므로 직접 복사
cp -r .context/versions/v0.1 .context/versions/v0.2

# 2. 심볼릭 링크를 새 버전으로 업데이트
rm .context/current
ln -s versions/v0.2 .context/current

# 3. v0.1은 이제 불변 스냅샷으로 보존
```

- 작업 중엔 `current/`(= 현재 버전 디렉토리)에서만 읽고 씀
- 이전 버전은 `versions/vX.X/`에서 직접 참조 가능

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

---

## Parallel Agent Workflow

`/agent-dev-ui` 작업을 여러 에이전트가 동시에 진행할 때 사용하는 프로세스.
충돌 없는 병렬 작업을 위해 `/agent-orchestrate`가 전체를 조율합니다.

### 관련 파일

| 파일 | 역할 |
|------|------|
| `.claude/commands/agent-orchestrate.md` | 오케스트레이터 역할 정의 |
| `.claude/skills/parallel-agents/SKILL.md` | 병렬 조율 전략 (contract-first) |
| `.claude/rules/renderer-conventions.md` | renderer 코딩 규칙 |
| `.claude/rules/main-conventions.md` | main process 코딩 규칙 |
| `.claude/rules/electron-security.md` | Electron 보안 체크리스트 |
| `.claude/rules/import-conventions.md` | 절대경로, 배럴 export 금지 |

### 프로세스 개요

```
Phase 1 — 계약 동결 (오케스트레이터, 순차)
  ├── src/shared/types.ts 확정
  ├── src/shared/ipc-channels.ts 확정
  ├── current/implementation/contracts.md 작성   ← 모든 인터페이스 명세
  └── current/implementation/file-ownership.md 작성 ← 에이전트별 파일 경계

Phase 2 — 병렬 구현 (서브 에이전트들, 동시)
  ├── Agent A: components 파티션만 구현
  ├── Agent B: store/hooks 파티션만 구현
  └── 각자 file-ownership.md에 지정된 파일만 수정

Phase 3 — 검토 (오케스트레이터, 순차)
  ├── contracts.md 준수 여부 확인 (인터페이스 일치)
  ├── rules/ 위반 여부 확인 (import, 보안, 패턴)
  └── 파일 경계 위반 여부 확인

Phase 4 — 수정 + 통합 (오케스트레이터, 순차)
  ├── 위반 사항 직접 수정
  ├── App.tsx 통합 작성 (직접 import, 배럴 없음)
  └── pnpm build 통과 확인
```

### 병렬 작업 시 생성되는 파일

```
current/implementation/
├── contracts.md       ← Phase 1에서 오케스트레이터가 작성
├── file-ownership.md  ← Phase 1에서 오케스트레이터가 작성
└── ipc-api.md         ← /agent-dev-core가 작성 (기존)
```

### 핵심 규칙

- **계약 동결 전에는 병렬 작업 금지** — contracts.md 없이 병렬 시작하면 인터페이스 충돌
- **서브 에이전트는 자기 파일만** — file-ownership.md 외 파일 수정 금지
- **공유 파일은 오케스트레이터만** — `src/shared/types.ts`, `ipc-channels.ts`, `App.tsx`
- **배럴 export 금지** — `index.ts` 재수출 파일 생성 금지, 직접 import 사용

