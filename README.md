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
yarn install
# or
npm install
```

### 2. Configure Algolia credentials

Edit `app/components/InstantSearchNextPage.tsx` and replace:
```typescript
const searchClient = liteClient("ALGOLIA_APP_ID", "ALGOLIA_API_KEY");
```

With your actual Algolia credentials.

### 3. Run the reproduction

```bash
# This will trigger the error during pre-rendering
yarn build
```

## Expected Output

During `next build`, you should see an error similar to:

```
⨯ Error occurred prerendering page "/[marketplace]/[locale]/store-locator". 
Error [InvariantError]: Invariant: `headers` must not be used within a client component.
```

## Workarounds

### Option 1: Hook Shell Pattern (Current solution in storefront)

Wrap `InstantSearchNext` in a component that defers rendering until after hydration:

```tsx
"use client";

import { useEffect, useState } from "react";
import { InstantSearchNext } from "react-instantsearch-nextjs";

export const InitInstantSearch: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return <InstantSearchNext>{children}</InstantSearchNext>;
};
```

### Option 2: Dynamic import with ssr: false

```tsx
import dynamic from "next/dynamic";

const InstantSearchNextPage = dynamic(
  () => import("./InstantSearchNextPage"),
  { ssr: false }
);
```

## Expected Fix in Algolia Library

The `react-instantsearch-nextjs` library should:

1. Add a `deferRouterInitialization` prop to `InstantSearchNext`
2. Defer router state access to `useEffect` instead of component render
3. Allow safe usage during static pre-rendering without workarounds

### Proposed Implementation

```tsx
interface InstantSearchNextProps {
  deferRouterInitialization?: boolean;
  // ... other props
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

## Files

- `app/[marketplace]/[locale]/store-locator/page.tsx` - Page with static params (triggers pre-rendering)
- `app/components/InstantSearchNextPage.tsx` - Client component using InstantSearchNext
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

## How to Submit to Algolia

1. Fork [react-instantsearch](https://github.com/algolia/react-instantsearch)
2. Clone this repo as a reference for the issue
3. Create an issue with:
   - Title: "InstantSearchNext incompatible with Next.js static pre-rendering"
   - Description: Quote the error message above
   - Reproduction steps: "Run `yarn build` in next-algolia-cache-components"
   - Link to this reproduction package

## References

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Static Rendering](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering)
- [React InstantSearch Issues](https://github.com/algolia/react-instantsearch/issues)

