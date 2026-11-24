import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports an icon-only button with no label", () => {
  const result = lint("icon-button-label", {
    "src/app/page.tsx":
      'import Button from "@/design-system/components/button";\nimport { IconPlus } from "icons";\nexport default function Fixture() {\n  return (\n    <>\n      <Button>\n        <IconPlus />\n      </Button>\n      <Button aria-label="Add">\n        <IconPlus />\n      </Button>\n      <Button>\n        <IconPlus />\n        Add\n      </Button>\n    </>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "<Button> holds only an icon",
  );
});
