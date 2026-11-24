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
