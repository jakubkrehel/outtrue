import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports longhand classes", () => {
  const result = lint("prefer-shorthand", {
    "src/app/page.tsx":
      'export default function Fixture({ wide }: { wide: boolean }) {\n  return (\n    <div className={`flex ${wide ? "p-4" : "p-2"}`}>\n      <span className="h-4 w-4 h-screen z-[999]" />\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(3);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use size-4");

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use h-dvh");

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("arbitrary z-index");
});

test("accepts the shorthands", () => {
  const result = lint("prefer-shorthand", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <span className="size-4 h-dvh z-10" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("turns each check off on its own", () => {
  const result = lint(
    "prefer-shorthand",
    {
      "src/app/page.tsx":
        'export default function Fixture() {\n  return (\n    <span className="h-4 w-4 h-screen z-[999]" />\n  );\n}\n',
    },
    { dvh: false, zIndex: false },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use size-4");
});
