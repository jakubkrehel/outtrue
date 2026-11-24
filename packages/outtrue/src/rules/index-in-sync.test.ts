import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a missing component and a stale line", () => {
  const result = lint("index-in-sync", {
    "src/design-system/INDEX.md":
      "- Button: runs an action. `ui/button`\n- Gone: was removed. `ui/gone`\n",
    "src/design-system/components/button.tsx":
      'export default function Fixture() {\n  return (\n    <button type="button">Save</button>\n  );\n}\n',
    "src/design-system/components/card.tsx":
      "export default function Fixture() {\n  return (\n    <div />\n  );\n}\n",
  });

  expect(result["src/design-system/components/button.tsx"]).toHaveLength(1);

  expect(
    result["src/design-system/components/button.tsx"]?.join("\n"),
  ).toContain("lists ui/gone and no component file matches it");

  expect(result["src/design-system/components/card.tsx"]).toHaveLength(1);

  expect(result["src/design-system/components/card.tsx"]?.join("\n")).toContain(
    "card has no line in src/design-system/INDEX.md",
  );
});
