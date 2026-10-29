# Contributing to xBO

Thanks for helping. Bug reports, fixes, components and documentation are all welcome.

## Before you start

- For anything larger than a small fix, open an issue first so we can agree on the approach.
- Read [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md): every UI change follows them.

## Setup

Node.js 22 or later and pnpm 10.

```bash
pnpm install
pnpm build:libs
pnpm dev
```

The playground (http://localhost:5190) runs against the library sources.

## Making a change

1. Work on a branch.
2. Keep the conventions in [docs/ROADMAP.md](docs/ROADMAP.md#conventions): prefixed utilities in library templates, `Xbo*` component names, `is`/`has`/`can` booleans, ordered `as const` lists.
3. Add or update tests next to the code (`*.test.ts`). Core logic belongs in `@xbo-ui/core` with unit tests; components get tests with `@vue/test-utils`.
4. Run the checks CI runs: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.
5. Add a changeset describing user-visible changes: `pnpm changeset`.
6. Open a pull request using the template.

## Accessibility

Every interactive element must work from the keyboard, have an accessible name, show visible focus and meet WCAG 2.2 AA contrast in light, dark and increased-contrast modes. Status is never colour-only.

## Conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
