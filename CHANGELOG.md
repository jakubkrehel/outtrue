# Changelog

## 0.2.2

2026-11-27

- `icon-button-label` leaves a button with `aria-hidden`, or one rendered as a non-interactive element through a literal `as` prop. `aria-hidden={false}` and `aria-hidden="false"` are still reported.
- `no-theme-overrides` no longer reads a named width such as `border-hairline` or `border-t-hairline` as a color. It takes `sizes`, which lists more width names.
- `no-rebuilt-primitives` counts `<input hidden>` as a hidden input, and no longer reports an `<output>` that fills the screen as a hand-built overlay.
- `classname-passthrough` follows `className` under the name it was destructured to, and when it is forwarded as the fallback of a destructuring default.
- `no-raw-values` reads a number sign followed only by digits, such as `#1234`, as text unless the attribute paints, like `fill` or `stroke`.

## 0.2.1

2026-11-27

- `layout-only-classname` takes `allowFor`, which lists `allow` patterns per component name, such as padding on `Card` or `Dialog.Content`.
- `layout-only-classname` tests `allow` patterns against a class with its variants as well as without, so `hover:bg-muted` can be allowed while `bg-muted` is still reported.
- `no-cross-surface-imports` takes `composers`, the surfaces that may import any other, such as an app shell.

## 0.2.0

2026-11-25

- A `primitives` folder that does not exist is now reported instead of silently turning the primitive rules off. The same goes for a project with no folder set and no `src/design-system`.
- `layout-only-classname` accepts `sr-only` and `not-sr-only` on a primitive.
- Added `wrapped-libraries`, `no-duplicate-primitives`, `no-boolean-variants` and `no-theme-overrides`.
- `recommended` now includes `no-rebuilt-primitives`, `no-duplicate-primitives` and `wrapped-libraries`.
- `no-rebuilt-primitives` only names a primitive whose file exists, unless `elements` or `overlay` is set.
- `no-inline-style` leaves a color to `no-raw-values`, so one line is no longer reported twice.
- `prefer-shorthand` takes `square`, `dvh` and `zIndex` to turn each check off.
- `primitive-naming` no longer bans `new`, `free` and `settings`.

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
