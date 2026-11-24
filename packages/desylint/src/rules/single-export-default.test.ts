import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a lone component that is not a default function", () => {
  const result = lint("single-export-default", {
    "src/components/card.tsx":
      "export function Card() {\n  return <div />;\n}\n",
    "src/components/frame.tsx":
      "export default function Fixture() {\n  return (\n    <div />\n  );\n}\n",
    "src/components/parts.tsx":
      "export const LIMIT = 3;\n\nexport function Part() {\n  return <div />;\n}\n",
  });

  expect(result["src/components/card.tsx"]).toHaveLength(1);

  expect(result["src/components/card.tsx"]?.join("\n")).toContain(
    "export default function Card()",
  );

  expect(result["src/components/frame.tsx"]).toHaveLength(0);

  expect(result["src/components/parts.tsx"]).toHaveLength(0);
});
