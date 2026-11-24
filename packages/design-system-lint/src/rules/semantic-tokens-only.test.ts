import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports raw palette classes outside the design system", () => {
  const result = lint(
    "semantic-tokens-only",
    {
      "src/app/page.tsx":
        'export default function Fixture() {\n  return (\n    <div className="text-gray-900 md:bg-red-500/50" />\n  );\n}\n',
      "src/design-system/components/card.tsx":
        'export default function Fixture() {\n  return (\n    <div className="text-gray-900" />\n  );\n}\n',
    },
    {
      suggest: {
        "text-gray-900": "text-tertiary-foreground",
      },
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(2);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "Use the variable, text-tertiary-foreground",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "md:bg-red-500/50 uses a raw token",
  );

  expect(result["src/design-system/components/card.tsx"]).toHaveLength(0);
});
