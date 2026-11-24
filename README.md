# design-system-lint

Oxlint rules that keep code on the design system.

A design system only works if the code uses it. Agents and people both reach
for a raw hex value, restyle a primitive through `className`, rebuild a button
that already exists or import across a boundary. Each of those renders fine
and each one makes the system a little less true.

`design-system-lint` turns the rules of a design system into lint errors.
Every message names the replacement, so the fix lands in the same run that
tripped it.

The class rules read Tailwind class names. Written against Oxlint 1.92.

## Install

The package is private and not on npm. Install it from the repository:

```sh
bun add -d oxlint github:jakubkrehel/design-system-lint
```

Extend a configuration in `.oxlintrc.json`:

```json
{
  "extends": ["./node_modules/design-system-lint/configs/recommended.json"]
}
```

| Configuration | Enables                                                                                 |
| ------------- | --------------------------------------------------------------------------------------- |
| `base`        | The three to start with: `no-raw-values`, `layout-only-classname` and `one-way-imports` |
| `recommended` | `base` plus the rules that need no project-specific options                             |
| `all`         | Every rule. Several do nothing until they are given options                             |

Or register the plugin and pick rules yourself:

```json
{
  "jsPlugins": [{ "name": "design-system", "specifier": "design-system-lint" }],
  "rules": {
    "design-system/no-raw-values": "error",
    "design-system/one-way-imports": [
      "error",
      { "layers": ["src/design-system", "src/components", "src/app"] }
    ]
  }
}
```

## Rules

| Rule                       | Fails on                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `no-raw-values`            | px and rem lengths and colours hardcoded in classes, plus colours in JSX attributes and inline `style`                         |
| `layout-only-classname`    | A class on a primitive that is not placement: margin, width and height, position, flex or grid placement, `hidden` and `block` |
| `one-way-imports`          | An import from a higher level                                                                                                  |
| `no-rebuilt-primitives`    | A raw `<button>`, `<input>` or `<textarea>` outside the design system, and a hand-built `fixed inset-0` overlay                |
| `index-in-sync`            | A primitive file the index does not mention, and an index line whose file is gone                                              |
| `complete-composition`     | A composable component used without one of its required parts                                                                  |
| `closed-variants`          | A `variant` or `size` prop on a primitive typed `string` or `number`                                                           |
| `semantic-tokens-only`     | A raw palette class such as `text-gray-900` outside the design system                                                          |
| `no-deprecated`            | A component, prop or import path listed in a rename map                                                                        |
| `primitive-naming`         | A primitive file named after a page or a variant, such as `pricing-card-pro`                                                   |
| `prefer-shorthand`         | `w-4 h-4`, `h-screen`, a numeric `z-[n]` and a template literal in `className`                                                 |
| `icon-button-label`        | A `Button` holding only an icon with no `aria-label`                                                                           |
| `no-cross-surface-imports` | A composite in one surface folder importing a composite from another                                                           |
| `no-reach-in-selectors`    | A class on a primitive that styles its insides, such as `[&_svg]:size-4` or `*:rounded-none`                                   |
| `known-tokens`             | A colour class with a step the theme does not define, such as `bg-gray-150`                                                    |
| `classname-passthrough`    | A primitive that takes `className` from its props and never uses it                                                            |
| `no-important`             | A class with the `!` modifier                                                                                                  |
| `no-inline-style`          | A fixed string or number in a `style` object. Custom properties, computed values, Motion elements and `next/og` files pass     |
| `single-export-default`    | A file whose only export is a component not written as `export default function`                                               |

## Options

| Rule                             | Option                                                                                                          | Default                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `no-raw-values`                  | `functions`: calls whose string arguments are classes                                                           | `cn`, `cva`, `clsx`, `twMerge`                                                                |
| `no-raw-values`                  | `spacing`: pixels per step of the spacing scale                                                                 | `4`                                                                                           |
| `layout-only-classname`          | `primitives`: import path prefixes that mark a primitive                                                        | `@/design-system/components/`                                                                 |
| `layout-only-classname`          | `allow`: regular expressions for extra classes to permit                                                        | none                                                                                          |
| `one-way-imports`                | `layers`: folders ordered lowest first                                                                          | `src/design-system`, `src/components`, `src/app`                                              |
| `one-way-imports`                | `alias`: import prefixes mapped to folders                                                                      | `@/` to `src/`                                                                                |
| `no-rebuilt-primitives`          | `elements`: tag mapped to the component to use. `tag[type=value]` narrows it and an empty string allows the tag | `button`, `input`, `textarea` and `input[type=checkbox]`, with hidden and file inputs allowed |
| `no-rebuilt-primitives`          | `overlay`: the component a `fixed inset-0` layer should be                                                      | `Dialog`                                                                                      |
| `index-in-sync`                  | `index`: the file that lists every component                                                                    | `src/design-system/INDEX.md`                                                                  |
| `index-in-sync`                  | `ignore`: regular expressions for files the index leaves out                                                    | tests, stories and `index` files                                                              |
| `complete-composition`           | `parts`: component mapped to its required parts                                                                 | none                                                                                          |
| `closed-variants`                | `props`: prop names that must be a closed union                                                                 | `variant`, `size`                                                                             |
| `semantic-tokens-only`           | `scales`: raw palette names                                                                                     | the Tailwind palette                                                                          |
| `semantic-tokens-only`           | `suggest`: raw class mapped to its variable, named in the message                                               | none                                                                                          |
| `no-deprecated`                  | `components`, `props` and `imports`: old name mapped to new. A prop is keyed `Component.prop`                   | none                                                                                          |
| `primitive-naming`               | `banned`: words a primitive file name can't contain                                                             | page, tier and variant words such as `pricing`, `pro`, `large`                                |
| `prefer-shorthand`               | `compose`: the function the message names for joining classes                                                   | `cn`                                                                                          |
| `icon-button-label`              | `components`: buttons to check. `icons`: regular expression for icon element names                              | `Button`, names starting or ending in `Icon`                                                  |
| `no-cross-surface-imports`       | `surfaces`: folders whose direct children are surfaces                                                          | `src/components`                                                                              |
| `no-cross-surface-imports`       | `shared`: surfaces any other may import, such as shared page chrome                                             | none                                                                                          |
| `known-tokens`                   | `theme`: CSS files that define the `--color-*` tokens                                                           | `src/app/globals.css`                                                                         |
| `known-tokens`                   | `defaults`: also accept the steps of Tailwind's default palette                                                 | `true`                                                                                        |
| `no-important`                   | `allow`: regular expressions for classes that may use `!`, such as one overriding a third-party inline style    | none                                                                                          |
| `no-inline-style`                | `allow`: style properties that may hold a fixed value                                                           | none                                                                                          |
| `no-inline-style`                | `motion`: element roots whose `style` holds animation values. `exempt`: imports that mark a file with no CSS    | `motion`, `m` and `next/og`                                                                   |
| rules that tell primitives apart | `primitives`: the folders or import prefixes that hold them                                                     | `src/design-system`                                                                           |
| every rule                       | `baseline`: violations allowed per file                                                                         | none                                                                                          |

### Required and optional parts

`complete-composition` reads required parts from `parts`. A part that is not
listed is optional. A nested list means any one of them is enough:

```json
{
  "parts": {
    "Accordion": ["AccordionItem", "AccordionTrigger", "AccordionPanel"],
    "Dialog": [["DialogContent", "DialogPopup"]]
  }
}
```

`DialogTitle` is left out, so a dialog without one passes. The rule only
checks components imported from the primitives. It skips an element that
spreads props, renders `{children}` or has another component as a direct
child, since a part may come from there.

### The index

`index-in-sync` finds a missing component by looking for the file name,
`button` or `Button`, anywhere in the index. It finds a removed one only on
lines shaped like this:

```md
- Button: runs an action. `ui/button`
```

## Adopt in an existing codebase

Fix what is quick, then grandfather what is left with a baseline so only new
violations fail.

1. With the rules on and no baseline, write the current counts to a file:

```sh
bunx oxlint -f json . | bunx design-system-lint-baseline > lint/design-system-baseline.json
```

2. Pass each rule its part of that file as the `baseline` option.
3. Run the linter. It passes.

A file over its count fails. A file under its count also fails until the count
is lowered, so the baseline only shrinks.

Turn a rule off with an override for folders where it does not apply, such as
brand logos with fixed colours for `no-raw-values`.

A rule that flags hundreds of the same thing is describing the system. Many
`text-[13px]` flags mean a missing token. Many colour classes on `Button` mean
a missing prop or variant. Add the token or the prop and the flags go away
together.

## Develop

```sh
bun install
bun run test
bun run typecheck
bun run lint
bun run format
bun run build
```

Each rule is one file in `packages/design-system-lint/src/rules` with a test
beside it. Helpers shared by more than one rule live in `src/lib`.
`src/lib/ratchet.ts` wraps every rule with the `baseline` option.
