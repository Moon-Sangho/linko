# Patch 006 — React Hook Form Migration

**Date:** 2026-03-18
**Agents involved:** Dev UI

## Problem

Bookmark form components (AddBookmarkModal, EditBookmarkModal) used manual useState state management with scattered validation logic. This made the forms error-prone, hard to test, and difficult to extend with new validation rules or fields.

## Decision

Migrate to react-hook-form with Zod validation. This provides:
- Centralized, schema-driven validation
- Reduced form boilerplate (no manual state for every field)
- Better TypeScript support and type inference
- Extensible validation schema for future features

## Changes

### `package.json` + `pnpm-lock.yaml`
- Add `react-hook-form`, `@hookform/resolvers`, `zod` dependencies

### `src/renderer/hooks/useBookmarkForm.ts`
- Replace useState-based state management with `useForm` hook
- Define Zod schema for bookmark validation (url required, title optional, tags array)
- Integrate `zodResolver` for automatic validation
- Export form instance via custom hook for consumption in modals
- Return form state (watch, formState.errors) alongside form methods

### `src/renderer/components/bookmark/AddBookmarkModal.tsx`
- Use `useBookmarkForm()` hook to get form instance and state
- Connect form fields to RHF `register()` for native inputs
- Display validation errors from `form.formState.errors`
- Use `form.handleSubmit()` for IPC submission
- Inline `newTagName` state (single field, too simple for RHF)

### `src/renderer/components/bookmark/EditBookmarkModal.tsx`
- Mirror AddBookmarkModal pattern with pre-filled `defaultValues`
- Use `form.reset()` on successful submission
- Same error display and submission flow as Add modal
