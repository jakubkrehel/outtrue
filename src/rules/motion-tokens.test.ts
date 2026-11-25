import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports hardcoded timings in classes and transitions", () => {
  const result = lint("motion-tokens", {
    "src/app/page.tsx":
      'import { motion } from "motion/react";\n\nexport default function Fixture() {\n  return (\n    <motion.div\n      className="duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)]"\n      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1], type: "spring" }}\n    />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(4);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "duration-[250ms] hardcodes a timing",
  );

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "transition sets duration inline",
  );
});

test("accepts scale steps, variables and shared transitions", () => {
  const result = lint("motion-tokens", {
    "src/app/page.tsx":
      'import { motion } from "motion/react";\nimport { SPRING } from "@/design-system/motion";\n\nexport default function Fixture({ delay }: { delay: number }) {\n  return (\n    <motion.div\n      className="duration-200 ease-out duration-[var(--duration-fast)] delay-(--delay)"\n      transition={SPRING}\n    >\n      <motion.span transition={{ ...SPRING, delay }} />\n    </motion.div>\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("lets the design system define timings", () => {
  const result = lint("motion-tokens", {
    "src/design-system/components/fade.tsx":
      'export default function Fixture() {\n  return (\n    <div className="duration-[250ms]" />\n  );\n}\n',
  });

  expect(result["src/design-system/components/fade.tsx"]).toHaveLength(0);
});
