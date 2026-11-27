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

test("follows className under the name it was destructured to", () => {
  const result = lint("classname-passthrough", {
    "src/design-system/components/frame.tsx":
      'export function Frame({\n  className: rootClassName,\n  ...props\n}: {\n  className?: string;\n}) {\n  return <div {...props} className={rootClassName} />;\n}\n\nexport function Panel({\n  className: panelClassName = "",\n}: {\n  className?: string;\n}) {\n  return <div className={["panel", panelClassName].join(" ")} />;\n}\n\nexport function Dropped({\n  className: unused,\n  label,\n}: {\n  className?: string;\n  label: string;\n}) {\n  return <div>{label}</div>;\n}\n',
  });

  expect(result["src/design-system/components/frame.tsx"]).toHaveLength(1);
});

test("follows className forwarded through a destructuring default", () => {
  const result = lint("classname-passthrough", {
    "src/design-system/components/frame.tsx":
      "export default function Frame({\n  className,\n  slots,\n}: {\n  className?: string;\n  slots: { rootClassName?: string };\n}) {\n  const { rootClassName = className } = slots;\n  return <div className={rootClassName} />;\n}\n",
  });

  expect(result["src/design-system/components/frame.tsx"]).toHaveLength(0);
});
