---
name: InstantSearchNext Static Pre-rendering Issue
about: Report issues with InstantSearchNext during Next.js static pre-rendering
title: "InstantSearchNext fails during static pre-rendering with headers error"
labels: bug, nextjs
assignees: ''

---

## Description

When using `InstantSearchNext` in pages configured for static pre-rendering or ISR, the build fails.

## Error Message

```
Error [InvariantError]: Invariant: `headers` must not be used within a client component.
```

## Steps to Reproduce

1. Install `react-instantsearch-nextjs`
2. Create a page with `generateStaticParams`
3. Use `InstantSearchNext` component
4. Run `next build`

## Expected Behavior

Page builds and pre-renders successfully.

## Environment

- react-instantsearch-nextjs: [version]
- next: [version]
- react: [version]

## Additional Context

Minimal reproduction: https://github.com/yourusername/next-algolia-cache-components

Workaround: Defer rendering until client hydration

