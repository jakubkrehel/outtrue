import {
  elementOf,
  nameOf,
  type Node,
  stringAttribute,
  valueNode,
} from "../lib/ast.ts";
import {
  classAttribute,
  classStrings,
  tokensOf,
  utilityOf,
} from "../lib/classes.ts";
import { isUnder } from "../lib/paths.ts";
import { ratcheted, type Visitor } from "../lib/ratchet.ts";

export const noRebuiltPrimitives = ratcheted<{
  elements?: Record<string, string>;
  overlay?: string;
  primitives?: string[];
}>(
  {
    elements: { additionalProperties: { type: "string" }, type: "object" },
    overlay: { type: "string" },
    primitives: { items: { type: "string" }, type: "array" },
  },
  (
    file,
    {
      elements = {
        button: "Button",
        input: "Input",
        "input[type=checkbox]": "Checkbox",
        "input[type=file]": "",
        "input[type=hidden]": "",
        textarea: "Textarea",
      },
      overlay = "Dialog",
      primitives = ["src/design-system"],
    },
    report,
  ): Visitor => {
    if (isUnder(file, primitives)) {
      return {};
    }
    return {
      JSXOpeningElement(node: Node) {
        const tag = nameOf(elementOf(node));
        if (!tag || tag !== tag.toLowerCase()) {
          return;
        }
        const type = stringAttribute(node, "type");
        const replacement =
          (type === null ? undefined : elements[`${tag}[type=${type}]`]) ??
          elements[tag];
        if (replacement) {
          report({
            message: `<${tag}> rebuilds a primitive the design system already has. Use ${replacement}.`,
            node,
          });
        }
        const attribute = classAttribute(node);
        if (!(overlay && attribute)) {
          return;
        }
        const utilities = new Set(
          classStrings(valueNode(attribute)).flatMap(({ text }) =>
            tokensOf(text).map(utilityOf),
          ),
        );
        if (utilities.has("fixed") && utilities.has("inset-0")) {
          report({
            message: `fixed inset-0 on <${tag}> builds an overlay by hand. Use ${overlay}.`,
            node: attribute,
          });
        }
      },
    };
  },
);
