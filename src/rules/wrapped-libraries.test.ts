import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a wrapped library imported outside the design system", () => {
  const result = lint("wrapped-libraries", {
    "src/app/page.tsx":
      'import { Dialog } from "@base-ui/react/dialog";\nimport * as Tabs from "@radix-ui/react-tabs";\n\nexport default function Fixture() {\n  return <Dialog.Root><Tabs.Root /></Dialog.Root>;\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(2);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "@base-ui/react/dialog is a library the design system wraps",
  );
});

test("lets the design system import what it wraps", () => {
  const result = lint("wrapped-libraries", {
    "src/design-system/components/dialog.tsx":
      'import { Dialog } from "@base-ui/react/dialog";\n\nexport default function Fixture() {\n  return <Dialog.Root />;\n}\n',
  });

  expect(result["src/design-system/components/dialog.tsx"]).toHaveLength(0);
});

test("leaves type imports and other packages alone", () => {
  const result = lint("wrapped-libraries", {
    "src/app/page.tsx":
      'import type { Dialog } from "@base-ui/react/dialog";\nimport { motion } from "motion/react";\nimport { radix } from "radix-ui-colors";\n\nexport type Props = Dialog.Root.Props;\n\nexport default function Fixture() {\n  return <motion.div>{radix}</motion.div>;\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("reads the libraries option", () => {
  const result = lint(
    "wrapped-libraries",
    {
      "src/app/page.tsx":
        'import { Check } from "lucide-react";\n\nexport default function Fixture() {\n  return <Check />;\n}\n',
    },
    { libraries: ["lucide-react"] },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);
});
