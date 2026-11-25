import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a class that styles the inside of a primitive", () => {
  const result = lint("no-reach-in-selectors", {
    "src/app/page.tsx":
      'import Button from "@/design-system/components/button";\nexport default function Fixture() {\n  return (\n    <Button className="ml-2 [&_svg]:size-4 *:rounded-none">Save</Button>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "[&_svg]:size-4 on <Button>",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "*:rounded-none on <Button>",
  );
});

test("lets a primitive style its own inside", () => {
  const result = lint(
    "no-reach-in-selectors",
    {
      "src/components/ui/button.tsx":
        'export default function Button({ className }: { className?: string }) {\n  return (\n    <button className="[&_svg]:size-4 [&_svg]:pointer-events-none" />\n  );\n}\n',
    },
    undefined,
    { primitives: "src/components/ui" },
  );

  expect(result["src/components/ui/button.tsx"]).toHaveLength(0);
});
