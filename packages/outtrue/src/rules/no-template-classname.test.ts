import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a class name built with a template literal", () => {
  const result = lint("no-template-classname", {
    "src/app/page.tsx":
      'export default function Fixture({ wide }: { wide: boolean }) {\n  return <div className={`flex ${wide ? "p-4" : "p-2"}`} />;\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "Compose classes with cn()",
  );
});

test("accepts cn and a template with nothing interpolated", () => {
  const result = lint("no-template-classname", {
    "src/app/page.tsx":
      'export default function Fixture({ wide }: { wide: boolean }) {\n  return (\n    <div className={cn("flex", wide ? "p-4" : "p-2")}>\n      <span className={`flex p-2`} />\n    </div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
