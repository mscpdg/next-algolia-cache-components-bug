# Comparison: Buggy vs Fixed Implementation

## The Problem: Direct InstantSearchNext Usage (FAILS)

### Current Code (Causes Error)

```typescript
// app/components/InstantSearchNextPage.tsx (FAILS during next build)
"use client";

import { InstantSearchNext } from "react-instantsearch-nextjs";
import { Configure } from "react-instantsearch";
import { liteClient } from "algoliasearch/lite";

const searchClient = liteClient("APP_ID", "API_KEY");

export function InstantSearchNextPage({
  params,
}: {
  params: { marketplace: string; locale: string };
}) {
  const indexName = `${params.marketplace}-${params.locale}-stores`;

  // ❌ InstantSearchNext tries to access router/headers during render
  // This causes error during static pre-rendering with generateStaticParams
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={indexName}
      routing={{
        stateMapping: {
          routeToState: (routeState) => routeState,
          stateToRoute: (uiState) => uiState,
        },
      }}
    >
      <Configure hitsPerPage={20} />
      {/* content */}
    </InstantSearchNext>
  );
}
```

### Build Output

```
⨯ Error occurred prerendering page "/us/en-US/store-locator".
Error [InvariantError]: Invariant: `headers` must not be used within a client component.
```

---

## The Solution: Deferred Hydration Hook Shell (WORKS)

### Fixed Code (Works during next build)

```typescript
// app/components/InitInstantSearch.tsx
"use client";

import { useEffect, useState } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";

/**
 * Hook shell that defers InstantSearchNext rendering until after client hydration.
 * This prevents InstantSearchNext from trying to access request-level data during
 * static pre-rendering.
 */
export const InitInstantSearch: React.FC<{
  children: React.ReactNode;
  searchClient: any;
  indexName: string;
  routing: any;
}> = ({ children, searchClient, indexName, routing }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Only render InstantSearchNext after client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Return null during SSR, rendering component only on client
  if (!isHydrated) {
    return null;
  }

  // ✅ InstantSearchNext is now only rendered client-side
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={indexName}
      routing={routing}
    >
      {children}
    </InstantSearchNext>
  );
};
```

### Updated Page Component

```typescript
// app/components/InstantSearchNextPage.tsx (NOW WORKS)
"use client";

import { Configure } from "react-instantsearch";
import { liteClient } from "algoliasearch/lite";
import { InitInstantSearch } from "./InitInstantSearch";

const searchClient = liteClient("APP_ID", "API_KEY");

export function InstantSearchNextPage({
  params,
}: {
  params: { marketplace: string; locale: string };
}) {
  const indexName = `${params.marketplace}-${params.locale}-stores`;

  return (
    <InitInstantSearch
      searchClient={searchClient}
      indexName={indexName}
      routing={{
        stateMapping: {
          routeToState: (routeState) => routeState,
          stateToRoute: (uiState) => uiState,
        },
      }}
    >
      <Configure hitsPerPage={20} />
      {/* content */}
    </InitInstantSearch>
  );
}
```

### Build Output

```
✓ Static generation complete
✓ Generated: /us/en-US/store-locator
✓ Generated: /de/de-DE/store-locator
```

---

## Key Differences

| Aspect | ❌ Direct Usage | ✅ Hook Shell |
|--------|-----------------|--------------|
| Renders during SSR | Yes (causes error) | No (returns null) |
| Renders on client | Yes | Yes (after hydration) |
| Works with `generateStaticParams` | ❌ No | ✅ Yes |
| Complexity | Simple but broken | Slightly more code |
| Performance | N/A (fails to build) | Same on client |
| Accessibility | N/A | Maintained |

---

## Why This Works

1. **During Server-Side Rendering (SSR)**:
   - Hook shell returns `null`
   - `InstantSearchNext` is never evaluated
   - No attempt to access router/headers
   - Build succeeds

2. **After Client Hydration**:
   - `useEffect` sets `isHydrated = true`
   - React re-renders
   - `InstantSearchNext` now safely renders
   - All routing hooks work correctly

---

## Ideal Solution (Library Level)

The library itself could provide this behavior with a flag:

```typescript
// What we want in react-instantsearch-nextjs
export interface InstantSearchNextProps {
  // ... existing props
  deferRouterInitialization?: boolean; // NEW
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

  // ... rest of implementation
}
```

Then users could simply do:

```tsx
<InstantSearchNext
  deferRouterInitialization={true}  // Enable for static pages
  {...otherProps}
>
  {children}
</InstantSearchNext>
```

