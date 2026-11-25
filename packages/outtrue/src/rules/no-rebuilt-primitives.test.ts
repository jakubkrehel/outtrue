import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports raw controls and hand-built overlays", () => {
  const result = lint("no-rebuilt-primitives", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="fixed inset-0">\n      <button type="button">Save</button>\n      <input type="hidden" />\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "<button> rebuilds a primitive",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use Dialog");
});

test("leaves the design system itself alone", () => {
  const result = lint("no-rebuilt-primitives", {
    "src/design-system/components/button.tsx":
      'export default function Fixture() {\n  return (\n    <button type="button">Save</button>\n  );\n}\n',
  });

  expect(result["src/design-system/components/button.tsx"]).toHaveLength(0);
});

test("names the primitive for a radio input", () => {
  const result = lint("no-rebuilt-primitives", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <input type="radio" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use Radio.");
});
