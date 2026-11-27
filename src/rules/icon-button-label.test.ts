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

test("leaves a button that assistive technology cannot reach", () => {
  const result = lint("icon-button-label", {
    "src/app/page.tsx":
      'import { Button } from "@/design-system/components/button";\nimport { PlusIcon } from "@/icons";\n\nexport default function Fixture() {\n  return (\n    <div>\n      <Button aria-hidden>\n        <PlusIcon />\n      </Button>\n      <Button aria-hidden="true">\n        <PlusIcon />\n      </Button>\n      <Button as="span">\n        <PlusIcon />\n      </Button>\n      <Button aria-hidden="false">\n        <PlusIcon />\n      </Button>\n      <Button as="a">\n        <PlusIcon />\n      </Button>\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);
});

test("reports an icon button whose aria-hidden is the boolean false", () => {
  const result = lint("icon-button-label", {
    "src/app/page.tsx":
      'import { Button } from "@/design-system/components/button";\nimport { PlusIcon } from "@/icons";\n\nexport default function Fixture() {\n  return (\n    <div>\n      <Button aria-hidden={false}>\n        <PlusIcon />\n      </Button>\n      <Button aria-hidden={true}>\n        <PlusIcon />\n      </Button>\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);
});
