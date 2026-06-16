# next-algolia-cache-components

written by AI, adjusted by hand to be a minimal reproduction of the Algolia `react-instantsearch-nextjs` incompatibility with Next.js static pre-rendering.

Minimal reproduction of Algolia `react-instantsearch-nextjs` incompatibility with Next.js static pre-rendering.

## Issue

When using `InstantSearchNext` from `react-instantsearch-nextjs` in a page that undergoes static pre-rendering or ISR (Incremental Static Regeneration) in Next.js, the following error occurs:

```
Error [InvariantError]: Invariant: `headers` must not be used within a client component. Next.js should be preventing `headers` from being included in client components statically, but did not in this case. This is a bug in Next.js.
```

### Root Cause

`InstantSearchNext` tries to access Next.js routing APIs (`useRouter()`, `useSearchParams()`) during the component render phase, not just in effects. This causes the underlying router initialization to attempt to read request headers during static pre-rendering, which violates Next.js constraints.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 3. Run the reproduction

```bash
# This will trigger the error during pre-rendering
npm run build
```

## Expected Output

During `next build`, you should see an error similar to:

```
⨯ Error occurred prerendering page "/[marketplace]/[locale]/store-locator". 
Error [InvariantError]: Invariant: `headers` must not be used within a client component.
```
