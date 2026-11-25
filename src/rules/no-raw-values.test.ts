import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports hardcoded lengths and colors", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="w-[200px] bg-[#ff0000] p-4" style={{ color: "#fff" }} />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(3);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "w-50 on the spacing scale",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "bg-[#ff0000] hardcodes a color",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "#fff is a hardcoded color",
  );
});

test("accepts scale steps, tokens and variables", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="w-50 bg-red-500 text-[length:var(--size)]" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("leaves color text in attributes that hold content", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <input\n      aria-label="oklch(0.7 0.1 250)"\n      defaultValue="#ff0000"\n      placeholder="oklch(0.7 0.1 250)"\n    />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("reports a color inside a longer value and names w-px", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="w-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] [color:#fff] bg-[url(#dots)] [--gap:0.5rem] [perspective:1000px]" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(3);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("1px is w-px");
});
