import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports hardcoded lengths and colours", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="w-[200px] bg-[#ff0000] p-4" style={{ color: "#fff" }} />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(3);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "w-50 on the spacing scale",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "bg-[#ff0000] hardcodes a colour",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "#fff is a hardcoded colour",
  );
});

test("accepts scale steps, tokens and variables", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="w-50 bg-red-500 text-[length:var(--size)]" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("leaves colour text in attributes that hold content", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <input\n      aria-label="oklch(0.7 0.1 250)"\n      defaultValue="#ff0000"\n      placeholder="oklch(0.7 0.1 250)"\n    />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
