<a href="https://interfaces.dev/?utm_source=outtrue">
  <img width="320" height="168" alt="interfaces.dev" src="https://ho1jr3x2dcwdu3t5.public.blob.vercel-storage.com/og-readme.png" />
</a>

Read more in [Interfaces](https://interfaces.dev/?utm_source=outtrue), the first design engineering magazine.

# outtrue

[![npm downloads](https://img.shields.io/npm/dt/outtrue)](https://www.npmjs.com/package/outtrue)

Oxlint rules that keep your code on your design system. Every error names the fix, so agents and people correct it in the same run.

The rules read Tailwind class names in React code and require Oxlint 1.92 or later.

```sh
npm i -D oxlint outtrue
```

```json
{
  "extends": ["./node_modules/outtrue/configs/recommended.json"],
  "settings": { "design-system": { "primitives": "src/components/ui" } }
}
```

Set `primitives` to the folder that holds yours. The default is `src/design-system/components`. A folder that does not exist is reported as an error.

There are three configs. `base` has the three rules to start with, `recommended` adds nine more and `all` turns on all twenty.

Current list of rules:

- `no-raw-values`: hardcoded lengths and colors in classes, attributes and inline styles.
- `layout-only-classname`: a `className` that restyles a primitive instead of placing it.
- `one-way-imports`: an import from a level above.
- `no-rebuilt-primitives`: a raw `<button>`, `<input>` or hand-built overlay where a primitive exists.
- `index-in-sync`: a component missing from the index or an index line whose file is gone.
- `complete-composition`: a composable component used without a required part.
- `closed-variants`: a `variant` or `size` prop typed as any string.
- `semantic-tokens-only`: a raw palette class such as `text-gray-900` outside the design system.
- `no-deprecated`: a deprecated component, prop or import path.
- `primitive-naming`: a primitive named after a page or a variant, such as `pricing-card-pro`.
- `prefer-shorthand`: `w-4 h-4`, `h-screen` and an arbitrary `z-[n]`.
- `no-template-classname`: a `className` built with a template literal.
- `icon-button-label`: an icon-only button with no `aria-label`.
- `no-cross-surface-imports`: one part of the product importing a component from another.
- `no-reach-in-selectors`: a class that styles the inside of a primitive, such as `[&_svg]:size-4`.
- `known-tokens`: a color step the theme does not define, such as `bg-gray-150`.
- `classname-passthrough`: a primitive that accepts `className` and never applies it.
- `no-important`: the `!` modifier.
- `no-inline-style`: a fixed value in a `style` object.
- `single-export-default`: a lone component not written as `export default function`.

Every rule has options for your folders, names and exceptions. They are in [OPTIONS.md](OPTIONS.md), along with how to adopt the rules in a codebase that already breaks them.

Releases are listed in [CHANGELOG.md](CHANGELOG.md).

## License

MIT
