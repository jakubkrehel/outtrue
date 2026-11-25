import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

const PRIMITIVE = "export default function Fixture() {\n  return <div />;\n}\n";

test("reports a component named like a primitive", () => {
  const result = lint("no-duplicate-primitives", {
    "src/design-system/components/button.tsx": PRIMITIVE,
    "src/design-system/components/input-otp.tsx": PRIMITIVE,
    "src/components/billing/button.tsx": PRIMITIVE,
    "src/components/billing/InputOTP.tsx": PRIMITIVE,
  });

  expect(result["src/components/billing/button.tsx"]?.join("\n")).toContain(
    "has the same name as the primitive in src/design-system/components/button.tsx",
  );

  expect(result["src/components/billing/InputOTP.tsx"]).toHaveLength(1);

  expect(result["src/design-system/components/button.tsx"]).toHaveLength(0);
});

test("accepts other names, tests and files that are not components", () => {
  const result = lint("no-duplicate-primitives", {
    "src/design-system/components/button.tsx": PRIMITIVE,
    "src/design-system/components/index.tsx": PRIMITIVE,
    "src/components/billing/checkout-button.tsx": PRIMITIVE,
    "src/components/billing/button.test.tsx": PRIMITIVE,
    "src/components/billing/index.tsx": PRIMITIVE,
    "src/lib/button.ts": "export const button = 1;\n",
  });

  expect(result["src/components/billing/checkout-button.tsx"]).toHaveLength(0);

  expect(result["src/components/billing/button.test.tsx"]).toHaveLength(0);

  expect(result["src/components/billing/index.tsx"]).toHaveLength(0);

  expect(result["src/lib/button.ts"]).toHaveLength(0);
});

test("reads the allow option", () => {
  const result = lint(
    "no-duplicate-primitives",
    {
      "src/design-system/components/button.tsx": PRIMITIVE,
      "src/components/billing/button.tsx": PRIMITIVE,
    },
    { allow: ["button"] },
  );

  expect(result["src/components/billing/button.tsx"]).toHaveLength(0);
});
