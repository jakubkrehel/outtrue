import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

const PRIMITIVE = "export default function Fixture() {\n  return <div />;\n}\n";

test("reports raw controls and hand-built overlays", () => {
  const result = lint("no-rebuilt-primitives", {
    "src/design-system/components/button.tsx": PRIMITIVE,
    "src/design-system/components/dialog.tsx": PRIMITIVE,
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
    "src/design-system/components/radio.tsx": PRIMITIVE,
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <input type="radio" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use Radio.");
});

test("only names primitives the design system has", () => {
  const result = lint("no-rebuilt-primitives", {
    "src/design-system/components/input-field.tsx": PRIMITIVE,
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="fixed inset-0">\n      <button type="button">Save</button>\n      <textarea />\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("trusts the elements option without looking for the files", () => {
  const result = lint(
    "no-rebuilt-primitives",
    {
      "src/app/page.tsx":
        'export default function Fixture() {\n  return <a href="/">Home</a>;\n}\n',
    },
    { elements: { a: "Link" } },
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain("Use Link.");
});
