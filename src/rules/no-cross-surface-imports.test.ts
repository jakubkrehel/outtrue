import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports an import between two surfaces", () => {
  const result = lint("no-cross-surface-imports", {
    "src/components/article/layout.tsx":
      'import { Checkout } from "@/components/billing/checkout";\n\nexport const Layout = Checkout;\n',
    "src/components/billing/checkout.tsx":
      'export const Checkout = "checkout";\n',
  });

  expect(result["src/components/article/layout.tsx"]).toHaveLength(1);

  expect(result["src/components/article/layout.tsx"]?.join("\n")).toContain(
    "article imports from billing",
  );

  expect(result["src/components/billing/checkout.tsx"]).toHaveLength(0);
});

test("accepts an import from a shared surface", () => {
  const result = lint(
    "no-cross-surface-imports",
    {
      "src/components/article/layout.tsx":
        'import { Checkout } from "@/components/billing/checkout";\n\nexport const Layout = Checkout;\n',
      "src/components/billing/checkout.tsx":
        'export const Checkout = "checkout";\n',
    },
    {
      shared: ["billing"],
    },
  );

  expect(result["src/components/article/layout.tsx"]).toHaveLength(0);
});

test("accepts an import from the primitives when they sit beside the surfaces", () => {
  const result = lint(
    "no-cross-surface-imports",
    {
      "src/components/billing/plan.tsx":
        'import { Button } from "@/components/ui/button";\nexport default function Fixture() {\n  return (\n    <Button />\n  );\n}\n',
    },
    { primitives: "src/components/ui" },
  );

  expect(result["src/components/billing/plan.tsx"]).toHaveLength(0);
});

test("accepts any import made by a composing surface", () => {
  const result = lint(
    "no-cross-surface-imports",
    {
      "src/components/billing/checkout.tsx":
        'import { Shell } from "@/components/shell/shell";\n\nexport const Checkout = Shell;\n',
      "src/components/shell/shell.tsx":
        'import { Checkout } from "@/components/billing/checkout";\n\nexport const Shell = Checkout;\n',
    },
    {
      composers: ["shell"],
    },
  );

  expect(result["src/components/shell/shell.tsx"]).toHaveLength(0);

  expect(result["src/components/billing/checkout.tsx"]).toHaveLength(1);
});
