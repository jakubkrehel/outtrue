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

test("accepts arbitrary values that are not a fixed length or color", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="top-[50%] max-w-[65ch] w-[calc(100%-2rem)] translate-x-[-50%] grid-cols-[1fr_2fr] aspect-[16/9] rotate-[3deg] duration-[250ms] leading-[1.4] tracking-[-0.01em] has-[>svg]:px-3 data-[state=open]:flex" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("leaves hashes that are not colors", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture({ color }: { color: string }) {\n  return (\n    <a href="#top" id="#1" style={{ backgroundColor: color, width: "50%" }}>\n      <img alt="#fff" src="/logo.svg#mark" />\n    </a>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("reads classes inside cva and constants", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'import { cva } from "class-variance-authority";\n\nconst WIDTHS = { sm: "w-24", lg: "w-[320px]" };\n\nconst variants = cva("inline-flex", {\n  variants: { size: { sm: "h-8", lg: "h-[44px]" } },\n});\n\nexport default function Fixture() {\n  return <div className={WIDTHS.lg}>{variants()}</div>;\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);
});

test("reads a number sign as text unless the attribute paints", () => {
  const result = lint("no-raw-values", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <svg data-issue="#120" id="#4821">\n      <rect fill="#120" />\n      <rect data-tone="#1a2b3c" />\n    </svg>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);
});
