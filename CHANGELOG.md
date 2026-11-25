# Changelog

## Unreleased

- A `primitives` folder that does not exist is now reported instead of silently turning the primitive rules off. The same goes for a project with no folder set and no `src/design-system`.
- `layout-only-classname` accepts `sr-only` and `not-sr-only` on a primitive.

## 0.1.3

2026-11-25

- No rule changes. The repository is now a single package.

## 0.1.2

2026-11-25

- The primitives folder is set once, under `settings["design-system"].primitives`, for every rule that needs it.
- Fixed false errors in several rules.

## 0.1.1

2026-11-24

- Added `no-template-classname`.
- `layout-only-classname` accepts more placement classes.

## 0.1.0

2026-11-24

- First release.
