# Quick Start Guide

## 1. Clone and Setup

```bash
git clone https://github.com/yourusername/next-algolia-cache-components.git
cd next-algolia-cache-components
yarn install
```

## 2. Add Algolia Credentials

Edit `app/components/InstantSearchNextPage.tsx`:

```typescript
const searchClient = liteClient(
  "YOUR_ALGOLIA_APP_ID",    // Replace this
  "YOUR_ALGOLIA_API_KEY"    // Replace this
);
```

## 3. See the Bug

```bash
yarn build
```

You should see the error about headers access.

## 4. Apply Workaround

Wrap `InstantSearchNext` in a component that defers rendering until hydration.

## 5. Submit to Algolia

Create an issue on [react-instantsearch](https://github.com/algolia/react-instantsearch/issues) with the template in `ISSUE_TEMPLATE.md`.

