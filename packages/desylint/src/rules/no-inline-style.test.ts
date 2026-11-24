import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports fixed values and leaves computed ones", () => {
  const result = lint("no-inline-style", {
    "src/app/page.tsx":
      'export default function Fixture({ width }: { width: number }) {\n  return <div style={{ padding: 4, width, "--gap": "1px" }} />;\n}\n',
    "src/app/motion.tsx":
      'import { motion } from "motion/react";\nexport default function Fixture() {\n  return (\n    <motion.div style={{ x: 0 }} />\n  );\n}\n',
    "src/app/image.tsx":
      'import { ImageResponse } from "next/og";\n\nexport const response = ImageResponse;\nexport default function Fixture() {\n  return (\n    <div style={{ display: "flex" }} />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "style sets padding to a fixed value",
  );

  expect(result["src/app/motion.tsx"]).toHaveLength(0);

  expect(result["src/app/image.tsx"]).toHaveLength(0);
});
