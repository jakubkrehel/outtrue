import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a color set for one theme", () => {
  const result = lint("no-theme-overrides", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="bg-white dark:bg-gray-900 dark:hover:text-muted dark:border-white/10" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(3);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "dark:bg-gray-900 sets a color for the dark theme",
  );
});

test("accepts theme classes that are not colors", () => {
  const result = lint("no-theme-overrides", {
    "src/app/page.tsx":
      'export default function Fixture() {\n  return (\n    <div className="dark:hidden dark:block dark:invert dark:text-sm dark:border-2 dark:border-t dark:shadow-none dark:ring-1 dark:text-center dark:outline-hidden dark:opacity-50" />\n  );\n}\n',
  });

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("lets the design system set theme colors", () => {
  const result = lint("no-theme-overrides", {
    "src/design-system/components/button.tsx":
      'export default function Fixture() {\n  return (\n    <button className="dark:bg-gray-900" />\n  );\n}\n',
  });

  expect(result["src/design-system/components/button.tsx"]).toHaveLength(0);
});
