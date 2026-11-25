import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a primitive named after a page or a variant", () => {
  const result = lint("primitive-naming", {
    "src/design-system/components/pricing-card-pro.tsx":
      "export default function Fixture() {\n  return (\n    <div />\n  );\n}\n",
    "src/design-system/components/card.tsx":
      "export default function Fixture() {\n  return (\n    <div />\n  );\n}\n",
  });

  expect(
    result["src/design-system/components/pricing-card-pro.tsx"],
  ).toHaveLength(1);

  expect(
    result["src/design-system/components/pricing-card-pro.tsx"]?.join("\n"),
  ).toContain("named after a page or a variant: pricing, pro");

  expect(result["src/design-system/components/card.tsx"]).toHaveLength(0);
});

test("accepts names that only sound like a page or a tier", () => {
  const result = lint("primitive-naming", {
    "src/design-system/components/settings-menu.tsx":
      "export default function Fixture() {\n  return (\n    <div />\n  );\n}\n",
    "src/design-system/components/new-badge.tsx":
      "export default function Fixture() {\n  return (\n    <div />\n  );\n}\n",
  });

  expect(result["src/design-system/components/settings-menu.tsx"]).toHaveLength(
    0,
  );

  expect(result["src/design-system/components/new-badge.tsx"]).toHaveLength(0);
});
