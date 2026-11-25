import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a boolean prop that names a look", () => {
  const result = lint("no-boolean-variants", {
    "src/design-system/components/button.tsx":
      'interface Props {\n  disabled?: boolean;\n  isPrimary?: boolean;\n  large: boolean;\n  loading?: boolean;\n  size?: "sm" | "lg";\n}\n\nexport default function Fixture(props: Props) {\n  return <button disabled={props.disabled} />;\n}\n',
  });

  expect(result["src/design-system/components/button.tsx"]).toHaveLength(2);

  expect(
    result["src/design-system/components/button.tsx"]?.join("\n"),
  ).toContain("isPrimary is a boolean for one look");
});

test("leaves components outside the design system alone", () => {
  const result = lint("no-boolean-variants", {
    "src/app/page.tsx":
      "interface Props {\n  large: boolean;\n}\n\nexport default function Fixture(props: Props) {\n  return <div>{String(props.large)}</div>;\n}\n",
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
