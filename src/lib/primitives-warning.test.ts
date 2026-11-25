import { expect, test } from "vitest";

import { lintBare } from "../rules/rule.test-utils.ts";

const files = {
  "src/app/page.tsx":
    'import { Button } from "@/components/ui/button";\n\nexport default function Fixture() {\n  return <Button className="bg-red-500" />;\n}\n',
};

test("says so when the primitives folder it was given does not exist", () => {
  const result = lintBare("layout-only-classname", files, undefined, {
    primitives: "src/componets/ui",
  });

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "primitives is set to src/componets/ui, which does not exist",
  );
});

test("says so when no folder is set and the default one is missing", () => {
  const result = lintBare("layout-only-classname", files);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "No primitives folder is set and src/design-system does not exist",
  );
});

test("resolves an aliased folder before looking for it", () => {
  const result = lintBare(
    "layout-only-classname",
    files,
    { primitives: ["@/components/ui/"] },
    undefined,
    ["src/components/ui"],
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "bg-red-500 restyles the component",
  );
});

test("leaves a package prefix alone", () => {
  const result = lintBare(
    "layout-only-classname",
    {
      "src/app/page.tsx":
        'import { Button } from "@acme/ui/button";\n\nexport default function Fixture() {\n  return <Button className="mt-4" />;\n}\n',
    },
    { primitives: ["@acme/ui/"] },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("stays quiet for a rule that does not read primitives", () => {
  const result = lintBare("no-important", files);

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
