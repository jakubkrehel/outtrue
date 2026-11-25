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

test("accepts imports that point down and ones from packages", () => {
  const result = lint("one-way-imports", {
    "src/app/page.tsx":
      'import Link from "next/link";\nimport { Card } from "@/components/card";\nimport { Button } from "@/design-system/components/button";\nimport { helper } from "./helper";\n\nexport default function Fixture() {\n  return <Card><Button /><Link href="/" />{helper}</Card>;\n}\n',
    "src/components/card.tsx":
      'import { Button } from "../design-system/components/button";\n\nexport function Card() {\n  return <Button />;\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);

  expect(result["src/components/card.tsx"]).toHaveLength(0);
});
