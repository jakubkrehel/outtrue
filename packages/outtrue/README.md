<a href="https://interfaces.dev/">
  <img width="320" height="168" alt="interfaces.dev" src="https://ho1jr3x2dcwdu3t5.public.blob.vercel-storage.com/og-readme.png" />
</a>

# outtrue

Oxlint rules that keep your code on your design system. Every error names the fix, so agents and people correct it in the same run.

```sh
pnpm add -D oxlint outtrue
```

```json
{
  "extends": ["./node_modules/outtrue/configs/recommended.json"]
}
```

There are three configs. `base` has the three rules to start with, `recommended` adds the ones that only need to know where your primitives are and `all` turns on everything.

The rules look for primitives in `src/design-system/components`. If yours live somewhere else, say where once. Without it the rules that check primitives report nothing:

```json
{
  "extends": ["./node_modules/outtrue/configs/recommended.json"],
  "settings": { "design-system": { "primitives": "src/components/ui" } }
}
```

The class rules read Tailwind class names. Requires Oxlint 1.92 or later.

## Rules

- **no-raw-values**: Hardcoded **lengths** and **colors** in classes, attributes and inline styles.
- **layout-only-classname**: A `className` that **restyles a primitive**. It can only place it or arrange its children.
- **one-way-imports**: An import from a **level above**.
- **no-rebuilt-primitives**: A raw `<button>`, `<input>` or hand-built overlay where a **primitive already exists**.
- **index-in-sync**: A component **missing from the index** or an index line whose file is gone.
- **complete-composition**: A composable component used **without a required part**.
- **closed-variants**: A `variant` or `size` prop typed as **any string**.
- **semantic-tokens-only**: A **raw palette class** such as `text-gray-900` outside the design system.
- **no-deprecated**: A **deprecated** component, prop or import path.
- **primitive-naming**: A primitive **named after a page or a variant**, such as `pricing-card-pro`.
- **prefer-shorthand**: `w-4 h-4`, `h-screen` and an arbitrary `z-[n]`.
- **no-template-classname**: A `className` built with a **template literal** where `cn()` belongs.
- **icon-button-label**: An **icon-only button** with no `aria-label`.
- **no-cross-surface-imports**: One part of the product **importing a component from another**.
- **no-reach-in-selectors**: A class that **styles the inside of a primitive**, such as `[&_svg]:size-4`.
- **known-tokens**: A color step the **theme does not define**, such as `bg-gray-150`.
- **classname-passthrough**: A primitive that accepts `className` and **never applies it**.
- **no-important**: The `!` modifier.
- **no-inline-style**: A **fixed value** in a `style` object.
- **single-export-default**: A lone component not written as `export default function`.

Each rule has options for your folders, names and exceptions. They are listed in [OPTIONS.md](OPTIONS.md).

## Existing codebases

Record the violations you already have, so only new ones fail:

```sh
pnpm exec oxlint -f json . | pnpm exec outtrue-baseline > lint/design-system-baseline.json
```

Pass each rule its part of that file as the `baseline` option. A JSON config can't read another file, so this needs `oxlint.config.ts`, where `extends` takes the imported config:

```ts
import { defineConfig } from "oxlint";
import recommended from "outtrue/configs/recommended.json" with { type: "json" };
import baseline from "./lint/design-system-baseline.json" with { type: "json" };

export default defineConfig({
  extends: [recommended],
  rules: {
    "design-system/no-raw-values": [
      "error",
      { baseline: baseline["no-raw-values"] },
    ],
  },
});
```

A file over its count fails and so does a file under it, so the baseline only shrinks.

## License

MIT
