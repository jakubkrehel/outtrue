import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports the important modifier", () => {
  const result = lint("no-important", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="!mt-0 md:mb-2! p-4" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "!mt-0 forces a style",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "md:mb-2! forces a style",
  );
});

test("accepts a class the allow option lists", () => {
  const result = lint(
    "no-important",
    {
      "src/app/page.tsx":
        'export default function Fixture() {\n  return (\n    <div className="[--size:80px]!" />\n  );\n}\n',
    },
    {
      allow: ["^\\[--size:"],
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
