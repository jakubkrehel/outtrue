import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a step the theme does not define", () => {
  const result = lint("known-tokens", {
    "src/app/globals.css":
      "@theme {\n  --color-gray-100: #fff;\n  --color-gray-1200: #000;\n}\n",
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="border-red-450 bg-gray-150 bg-gray-50 text-gray-1200" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "border-red-450 names a step",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "bg-gray-150 names a step",
  );
});

test("reads tokens from a stylesheet the theme imports", () => {
  const result = lint("known-tokens", {
    "src/app/globals.css":
      '@import "tailwindcss";\n@import "../styles/tokens.css";\n',
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="bg-gray-13 text-gray-12" />\n  );\n}\n',
    "src/styles/tokens.css": "@theme {\n  --color-gray-12: #202020;\n}\n",
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "bg-gray-13 names a step",
  );
});

test("reports nothing when no theme file is found", () => {
  const result = lint("known-tokens", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="text-gray-12" />\n  );\n}\n',
    "src/styles/tokens.css": "@theme {\n  --color-gray-12: #202020;\n}\n",
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
