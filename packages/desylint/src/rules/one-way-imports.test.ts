import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports an import from a higher level", () => {
  const result = lint("one-way-imports", {
    "src/design-system/components/card.tsx":
      'import { Pricing } from "@/components/pricing";\n\nexport const Card = Pricing;\n',
    "src/components/pricing.tsx":
      'import { Card } from "@/design-system/components/card";\n\nexport const Pricing = Card;\n',
  });

  expect(result["src/design-system/components/card.tsx"]).toHaveLength(1);

  expect(result["src/design-system/components/card.tsx"]?.join("\n")).toContain(
    "src/design-system sits below src/components",
  );

  expect(result["src/components/pricing.tsx"]).toHaveLength(0);
});
