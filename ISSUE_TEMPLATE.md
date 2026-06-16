# Issue Template for Algolia React InstantSearch

Use this template when creating an issue on the [react-instantsearch repository](https://github.com/algolia/react-instantsearch).

---

## Title

`InstantSearchNext` incompatible with Next.js static pre-rendering and ISR

## Description

When using `InstantSearchNext` from `react-instantsearch-nextjs` in pages configured for static pre-rendering or ISR (via `generateStaticParams`), the Next.js build fails with:

```
Error [InvariantError]: Invariant: `headers` must not be used within a client component. 
Next.js should be preventing `headers` from being included in client components statically, 
but did not in this case. This is a bug in Next.js.
```

### Root Cause

The `InstantSearchNext` component attempts to access Next.js routing APIs (`useRouter()`, `useSearchParams()`) during the component render phase, not deferred to effects. This causes the internal router initialization to try reading request headers during static pre-rendering, which violates Next.js SSR constraints.

### Steps to Reproduce

1. Create a Next.js App Router project
2. Create a page with `generateStaticParams` (for pre-rendering)
3. Use `InstantSearchNext` component in that page
4. Run `next build`

**Minimal reproduction**: https://github.com/yourusername/next-algolia-cache-components

### Expected Behavior

The page should build successfully and be statically pre-rendered without errors.

### Actual Behavior

Build fails with the "headers must not be used" error during pre-rendering.

### Environment

- `react-instantsearch-nextjs`: [version]
- `next`: 15.0.0+
- `react`: 18.0.0+
- `react-dom`: 18.0.0+

### Workaround

Currently, this can be worked around by deferring the component rendering until after client hydration in a hook shell pattern:

```tsx
"use client";
import { useEffect, useState } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";

export const InitInstantSearch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  if (!isHydrated) return null;
  return <InstantSearchNext>{children}</InstantSearchNext>;
};
```

### Proposed Solution

Add a `deferRouterInitialization` prop (or similar) to `InstantSearchNext` that:

1. Delays router state setup until after client hydration
2. Moves router API access from render phase to effect phase
3. Allows the component to be safely pre-rendered without accessing request headers

Example implementation:

```tsx
export interface InstantSearchNextProps {
  deferRouterInitialization?: boolean;
  // ... existing props
}

export function InstantSearchNext({ 
  deferRouterInitialization = false,
  ...props 
}: InstantSearchNextProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  if (deferRouterInitialization && !isHydrated) {
    return null;
  }
  
  // ... rest of component
}
```

---

**Additional Context**: This issue affects any Next.js application using `InstantSearchNext` with static generation, ISR, or any feature requiring pre-rendering.

