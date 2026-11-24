import { expect, test } from "vitest";

import { lint } from "../rules/rule.test-utils.ts";

const files = {
  "src/app/page.tsx":
    'export default function Fixture() {\n  return (\n    <div className="!mt-0 !mb-0" />\n  );\n}\n',
};

test("a file at its baseline count passes", () => {
  const result = lint("no-important", files, {
    baseline: { "src/app/page.tsx": 2 },
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("a file over its baseline count reports every violation", () => {
  const result = lint("no-important", files, {
    baseline: { "src/app/page.tsx": 1 },
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);
});

test("a file under its baseline count asks for the count to be lowered", () => {
  const result = lint("no-important", files, {
    baseline: { "src/app/page.tsx": 3 },
  });

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "Lower the baseline to 2",
  );
});
