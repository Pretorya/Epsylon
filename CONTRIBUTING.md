# Contributing

## Branches

| Branch           | Role                                                                                   | Receives changes from          |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| `main`           | Released code. Never touched directly                                                  | `staging`, by pull request     |
| `staging`        | Release candidate, validated before going to `main`                                    | `dev`, by pull request         |
| `dev`            | Integration branch, where finished work lands                                          | Work branches, by pull request |
| `<type>/<topic>` | One branch per piece of work (`feat/init-detect-nextjs`, `docs/…`, `fix/…`, `chore/…`) | Created from `dev`             |

Changes always flow in one direction:

```
<type>/<topic> ──PR──► dev ──PR──► staging ──PR──► main
```

A fix needed on `staging` or `main` is made on a work branch from `dev` and promoted like any other
change, so the three branches never diverge.

## Workflow

```bash
git switch dev && git pull
git switch -c feat/my-change
# work, commit
git push -u origin feat/my-change
gh pr create --base dev
```

CI (lint, type check, tests, build on Node 24 and 26) runs on every pull request and on every push to
`dev`, `staging` and `main`. Merge only when it is green.

## Local safeguard

`pnpm install` sets `core.hooksPath` to `.githooks`, whose `pre-push` hook refuses direct pushes to
`main` and `staging`. It protects against mistakes only: it runs on your machine and can be bypassed
with `git push --no-verify`.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
