# Testing Conventions

Rules for all test files in the Linko project.

---

## Test File Location

Place test files in a `tests/` subdirectory directly adjacent to the source file being tested.
Mirror the source directory structure exactly.

```
src/
├── shared/
│   └── utils/
│       ├── is-valid-url.ts
│       ├── is-valid-id.ts
│       └── tests/
│           ├── is-valid-url.test.ts
│           └── is-valid-id.test.ts
└── renderer/
    ├── store/
    │   ├── use-ui-store.ts
    │   └── tests/
    │       └── use-ui-store.test.ts
    ├── hooks/
    │   ├── use-bookmark-form.ts
    │   └── tests/
    │       └── use-bookmark-form.test.ts
    ├── utils/
    │   ├── debounce.ts
    │   └── tests/
    │       └── debounce.test.ts
    └── components/
        └── bookmark/
            ├── bookmark-item.tsx
            └── tests/
                └── bookmark-item.test.tsx
```

### Rules

- Always use the `tests/` subdirectory (plural) — never `test/` (singular)
- One test file per source file: `foo.ts` → `tests/foo.test.ts`
- Use `.test.ts` for logic/hooks/stores, `.test.tsx` for React components

---

## Test Runner

**Vitest** with `jsdom` environment. Configuration is in `vitest.config.ts`.

Covered include paths:
- `src/renderer/**/*.{test,spec}.{ts,tsx}`
- `src/shared/**/*.{test,spec}.{ts,tsx}`

---

## Import Conventions

Test files follow the same import rules as source files.

```typescript
// ✅ Absolute alias imports
import { isValidUrl } from '@shared/utils/is-valid-url'
import { useUIStore } from '@renderer/store/use-ui-store'
import { IpcChannels } from '@shared/ipc-channels'

// ❌ Cross-directory relative imports
import { isValidUrl } from '../../utils/is-valid-url'
```

---

## Mocking Patterns

### `window.electron.invoke` (renderer hooks/stores)

```typescript
const mockInvoke = vi.fn()
Object.defineProperty(window, 'electron', {
  value: { invoke: mockInvoke },
  writable: true,
})

beforeEach(() => {
  mockInvoke.mockReset()
})
```

### `vi.mock` with top-level variables

`vi.mock` is hoisted to the top of the file. Variables used inside mock factories
must be declared with `vi.hoisted()` to avoid "accessed before initialization" errors.

```typescript
// ✅ Correct
const { mockFn } = vi.hoisted(() => ({ mockFn: vi.fn() }))
vi.mock('@renderer/some-module', () => ({ useSomething: () => ({ fn: mockFn }) }))

// ❌ Wrong — mockFn is not yet initialized when the factory runs
const mockFn = vi.fn()
vi.mock('@renderer/some-module', () => ({ useSomething: () => ({ fn: mockFn }) }))
```

### Zustand stores

```typescript
beforeEach(() => {
  useUIStore.setState({ searchQuery: '', selectedTagIds: [] })
})
```

---

## Layer-Specific Strategy

| Layer | Strategy |
|-------|----------|
| `src/shared/utils/` | Pure unit tests — no mocks needed |
| `src/renderer/store/` | Set state via `setState`, assert via `getState` |
| `src/renderer/hooks/` | `renderHook` + mock `window.electron.invoke` |
| `src/renderer/components/` | React Testing Library + `userEvent`, mock hooks via `vi.mock` |
| `src/main/ipc/` | Inject typed mock repository, test response shape |
| `src/main/db/repositories/` | In-memory SQLite (`:memory:`), never mock `better-sqlite3` |
