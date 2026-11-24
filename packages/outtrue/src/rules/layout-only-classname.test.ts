import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a class that restyles a primitive", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import Button from "@/design-system/components/button";\nexport default function Fixture() {\n  return (\n    <Button className="mt-2 rounded-none bg-red-500">Save</Button>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "rounded-none, bg-red-500 restyle the component",
  );
});

test("accepts placement classes", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import Button from "@/design-system/components/button";\nexport default function Fixture() {\n  return (\n    <Button className="mt-2 w-full">Save</Button>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("accepts classes the allow option lists", () => {
  const result = lint(
    "layout-only-classname",
    {
      "src/app/page.tsx":
        'import Button from "@/design-system/components/button";\nexport default function Fixture() {\n  return (\n    <Button className="gap-2">Save</Button>\n  );\n}\n',
    },
    {
      allow: ["^gap-"],
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("accepts classes that arrange children or offset the component", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import Button from "@/design-system/components/button";\nexport default function Fixture() {\n  return (\n    <Button className="inline-flex -translate-x-1/2 scroll-mt-20 flex-col items-center justify-between gap-2">\n      Save\n    </Button>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
