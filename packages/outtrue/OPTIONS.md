# Options

Every rule also takes `baseline`: the number of violations each file is still allowed.

Set the primitives folder once for every rule that needs it. A rule's own `primitives` option still wins:

```json
{
  "settings": { "design-system": { "primitives": "src/components/ui" } }
}
```

With no theme file found, `known-tokens` reports nothing.

| Rule                             | Option                                                                                                          | Default                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `no-raw-values`                  | `functions`: calls whose string arguments are classes                                                           | `cn`, `cva`, `clsx`, `twMerge`                                                                          |
| `no-raw-values`                  | `spacing`: pixels per step of the spacing scale                                                                 | `4`                                                                                                     |
| `no-raw-values`                  | `text`: attributes that hold content, where a color value is not styling                                        | `placeholder`, `alt`, `title`, `aria-label`, `aria-description`, `label`, `value`, `defaultValue`       |
| `layout-only-classname`          | `primitives`: import path prefixes or folders that mark a primitive                                             | `@/design-system/components/`                                                                           |
| `layout-only-classname`          | `allow`: regular expressions for extra classes to permit                                                        | none                                                                                                    |
| `one-way-imports`                | `layers`: folders ordered lowest first                                                                          | `src/design-system`, `src/components`, `src/app`                                                        |
| `one-way-imports`                | `alias`: import prefixes mapped to folders                                                                      | `@/` to `src/`                                                                                          |
| `no-rebuilt-primitives`          | `elements`: tag mapped to the component to use. `tag[type=value]` narrows it and an empty string allows the tag | `button`, `input`, `textarea` and checkbox, radio and range inputs, with hidden and file inputs allowed |
| `no-rebuilt-primitives`          | `overlay`: the component a `fixed inset-0` layer should be                                                      | `Dialog`                                                                                                |
| `index-in-sync`                  | `index`: the file that lists every component                                                                    | `src/design-system/INDEX.md`                                                                            |
| `index-in-sync`                  | `ignore`: regular expressions for files the index leaves out                                                    | tests, stories and `index` files                                                                        |
| `complete-composition`           | `parts`: component mapped to its required parts                                                                 | none                                                                                                    |
| `closed-variants`                | `props`: prop names that must be a closed union                                                                 | `variant`, `size`                                                                                       |
| `semantic-tokens-only`           | `scales`: raw palette names                                                                                     | the Tailwind palette                                                                                    |
| `semantic-tokens-only`           | `suggest`: raw class mapped to its variable, named in the message                                               | none                                                                                                    |
| `no-deprecated`                  | `components`, `props` and `imports`: old name mapped to new. A prop is keyed `Component.prop`                   | none                                                                                                    |
| `primitive-naming`               | `banned`: words a primitive file name can't contain                                                             | page, tier and variant words such as `pricing`, `pro`, `large`                                          |
| `no-template-classname`          | `compose`: the function the message names for joining classes                                                   | `cn`                                                                                                    |
| `icon-button-label`              | `components`: buttons to check. `icons`: regular expression for icon element names                              | `Button`, names starting or ending in `Icon`                                                            |
| `no-cross-surface-imports`       | `surfaces`: folders whose direct children are surfaces                                                          | `src/components`                                                                                        |
| `no-cross-surface-imports`       | `shared`: surfaces any other may import, such as shared page chrome                                             | none                                                                                                    |
| `no-cross-surface-imports`       | `primitives`: the folder a shared component moves to. An import from it always passes                           | `src/design-system/components`                                                                          |
| `known-tokens`                   | `theme`: CSS files that define the `--color-*` tokens. Stylesheets they import by a relative path are read too  | `src/app/globals.css`                                                                                   |
| `known-tokens`                   | `defaults`: also accept the steps of Tailwind's default palette                                                 | `true`                                                                                                  |
| `no-important`                   | `allow`: regular expressions for classes that may use `!`, such as one overriding a third-party inline style    | none                                                                                                    |
| `no-inline-style`                | `allow`: style properties that may hold a fixed value                                                           | none                                                                                                    |
| `no-inline-style`                | `motion`: element roots whose `style` holds animation values. `exempt`: imports that mark a file with no CSS    | `motion`, `m` and `next/og`                                                                             |
| rules that tell primitives apart | `primitives`: the folders or import prefixes that hold them                                                     | `src/design-system`                                                                                     |
| rules that read imports          | `alias`: import prefixes mapped to folders                                                                      | `@/` to `src/`                                                                                          |
| every rule                       | `baseline`: violations allowed per file                                                                         | none                                                                                                    |

## Required and optional parts

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

Parts written with dot notation are keyed the same way: `"Accordion.Root": ["Accordion.Item", "Accordion.Trigger", "Accordion.Panel"]`.

## The index

`index-in-sync` finds a missing component by looking for the file name, `button` or `Button`, as the label of a list item or inside a code span. The label can be bold and its case does not matter, so `InputOTP` matches `input-otp`. A mention in running prose does not count. It finds a removed one only on
lines shaped like this:

```md
- Button: runs an action. `@/design-system/components/button`
```
