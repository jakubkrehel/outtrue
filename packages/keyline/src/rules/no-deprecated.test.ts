import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports deprecated components, props and imports", () => {
  const result = lint(
    "no-deprecated",
    {
      "src/app/page.tsx":
        'import OldCard from "@/old/card";\nimport Button from "@/design-system/components/button";\nexport default function Fixture() {\n  return (\n    <OldCard>\n      <Button color="red">Save</Button>\n    </OldCard>\n  );\n}\n',
    },
    {
      components: {
        OldCard: "Card",
      },
      imports: {
        "@/old/card": "@/design-system/components/card",
      },
      props: {
        "Button.color": "variant",
      },
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(3);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "@/old/card is deprecated",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "<OldCard> is deprecated. Use Card",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "color on <Button> is deprecated. Use variant",
  );
});
