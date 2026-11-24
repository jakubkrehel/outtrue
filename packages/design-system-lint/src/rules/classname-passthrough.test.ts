import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports className that never reaches an element", () => {
  const result = lint("classname-passthrough", {
    "src/design-system/components/card.tsx":
      "export default function Card({\n  className,\n  label,\n}: {\n  className?: string;\n  label: string;\n}) {\n  return <div>{label}</div>;\n}\n",
    "src/design-system/components/frame.tsx":
      "export default function Frame({ className }: { className?: string }) {\n  return <div className={className} />;\n}\n",
  });

  expect(result["src/design-system/components/card.tsx"]).toHaveLength(1);

  expect(result["src/design-system/components/card.tsx"]?.join("\n")).toContain(
    "className is taken from the props and never reaches an element",
  );

  expect(result["src/design-system/components/frame.tsx"]).toHaveLength(0);
});
