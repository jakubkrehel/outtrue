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

test("accepts grid layout the same as flex", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import Card from "@/design-system/components/card";\nexport default function Fixture() {\n  return (\n    <Card className="grid aspect-square grid-cols-2 flex-wrap place-items-center gap-4" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("checks a primitive imported by a relative path", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import Card from "../design-system/components/card";\nexport default function Fixture() {\n  return (\n    <Card className="bg-red-500" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);
});

test("reads the primitives folder from the shared setting", () => {
  const result = lint(
    "layout-only-classname",
    {
      "src/app/page.tsx":
        'import { Button } from "@/components/ui/button";\nexport default function Fixture() {\n  return (\n    <Button className="bg-red-500">Save</Button>\n  );\n}\n',
    },
    undefined,
    { primitives: "src/components/ui" },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);
});

test("accepts classes that hide a primitive from sight", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import { Button } from "@/design-system/components/button";\n\nexport default function Fixture() {\n  return (\n    <Button className="sr-only focus:not-sr-only md:hidden" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("leaves elements and components from other folders alone", () => {
  const result = lint("layout-only-classname", {
    "src/app/page.tsx":
      'import Link from "next/link";\nimport { Chart } from "@/components/chart";\n\nexport default function Fixture() {\n  return (\n    <div className="bg-red-500">\n      <Link className="text-sm underline" href="/" />\n      <Chart className="rounded-lg" />\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("accepts classes the allowFor option lists for that component only", () => {
  const result = lint(
    "layout-only-classname",
    {
      "src/app/page.tsx":
        'import { Button } from "@/design-system/components/button";\nimport { Card } from "@/design-system/components/card";\nimport { Dialog } from "@/design-system/components/dialog";\nexport default function Fixture() {\n  return (\n    <Card className="p-4">\n      <Dialog.Content className="px-6 pt-10" />\n      <Button className="px-6">Save</Button>\n    </Card>\n  );\n}\n',
    },
    {
      allowFor: {
        Card: ["^p[xytrblse]?-.+$"],
        "Dialog.Content": ["^p[xytrblse]?-.+$"],
      },
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("<Button>");
});

test("matches an allow pattern against the class with its variants", () => {
  const result = lint(
    "layout-only-classname",
    {
      "src/app/page.tsx":
        'import { Text } from "@/design-system/components/text";\nexport default function Fixture() {\n  return (\n    <Text className="group-hover:text-primary text-secondary">Save</Text>\n  );\n}\n',
    },
    {
      allow: ["^(?:group-)?hover:text-.+$"],
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "text-secondary restyles the component",
  );
});
