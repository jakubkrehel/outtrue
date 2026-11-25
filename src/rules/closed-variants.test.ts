import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports an open variant prop", () => {
  const result = lint("closed-variants", {
    "src/design-system/components/badge.tsx":
      'interface BadgeProps {\n  size?: "sm" | "md";\n  variant?: string;\n}\n\nexport default function Badge({ size, variant }: BadgeProps) {\n  return <span data-size={size} data-variant={variant} />;\n}\n',
  });

  expect(result["src/design-system/components/badge.tsx"]).toHaveLength(1);

  expect(
    result["src/design-system/components/badge.tsx"]?.join("\n"),
  ).toContain("variant accepts any string or number");
});

test("reads the primitives folder from the shared setting", () => {
  const result = lint(
    "closed-variants",
    {
      "src/components/ui/button.tsx":
        "interface Props {\n  variant?: string;\n}\nexport default function Fixture(_props: Props) {\n  return null;\n}\n",
    },
    undefined,
    { primitives: "src/components/ui" },
  );

  expect(result["src/components/ui/button.tsx"]).toHaveLength(1);
});
