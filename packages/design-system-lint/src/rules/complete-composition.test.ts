import { expect, test } from "vitest";

import { lint } from "./rule.test-utils.ts";

test("reports a missing required part", () => {
  const result = lint(
    "complete-composition",
    {
      "src/app/page.tsx":
        'import {\n  Accordion,\n  AccordionItem,\n  AccordionPanel,\n  AccordionTrigger,\n} from "@/design-system/components/accordion";\nexport default function Fixture() {\n  return (\n    <Accordion>\n      <AccordionItem>\n        <AccordionTrigger>Billing</AccordionTrigger>\n      </AccordionItem>\n    </Accordion>\n  );\n}\n',
    },
    {
      parts: {
        Accordion: ["AccordionItem", "AccordionTrigger", "AccordionPanel"],
      },
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(1);

  expect(result["src/app/page.tsx"]?.join("\n")).toContain(
    "<Accordion> is missing AccordionPanel",
  );
});

test("accepts a full assembly", () => {
  const result = lint(
    "complete-composition",
    {
      "src/app/page.tsx":
        'import {\n  Accordion,\n  AccordionItem,\n  AccordionPanel,\n  AccordionTrigger,\n} from "@/design-system/components/accordion";\nexport default function Fixture() {\n  return (\n    <Accordion>\n      <AccordionItem>\n        <AccordionTrigger>Billing</AccordionTrigger>\n        <AccordionPanel>Invoices</AccordionPanel>\n      </AccordionItem>\n    </Accordion>\n  );\n}\n',
    },
    {
      parts: {
        Accordion: ["AccordionItem", "AccordionTrigger", "AccordionPanel"],
      },
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});

test("skips a component that is not imported from the primitives", () => {
  const result = lint(
    "complete-composition",
    {
      "src/app/page.tsx":
        "function Accordion() {\n  return <div />;\n}\n\nexport default function Fixture() {\n  return (\n    <Accordion />\n  );\n}\n",
    },
    {
      parts: {
        Accordion: ["AccordionItem", "AccordionTrigger", "AccordionPanel"],
      },
    },
  );

  expect(result["src/app/page.tsx"]).toHaveLength(0);
});
