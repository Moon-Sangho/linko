# Memory Index

## Feedback

- [feedback_mid_flight_async_testing.md](./feedback_mid_flight_async_testing.md) — Don't combine `waitFor` + unawaited `act(async)`; use `await act(async () => { await Promise.resolve() })` to flush microtasks instead
- [feedback_bare_domain_invalid_suggestion.md](./feedback_bare_domain_invalid_suggestion.md) — To trigger handleUrlBlur's no-suggestion error path, use strings with spaces (e.g. `'just some words'`), not plain words like `'justsomewords'` which pass the URL constructor
- [feedback_ipc_result_false_continues.md](./feedback_ipc_result_false_continues.md) — `runBlurChecks` does not short-circuit on `{ success: false }` dup result; always mock both IPC calls for any handleUrlBlur test that reaches a valid URL
- [feedback_tanstack_query_hook_patterns.md](./feedback_tanstack_query_hook_patterns.md) — Patterns and pitfalls for testing useQuery/useInfiniteQuery: hollow query-key tests, createWrapper with staleTime:Infinity, fetchNextPage timing, pass-through test anti-pattern, NthCalledWith for ordered assertions
