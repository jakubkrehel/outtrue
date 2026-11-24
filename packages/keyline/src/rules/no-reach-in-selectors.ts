import {
  elementName,
  elementOf,
  type Node,
  rootOf,
  valueNode,
} from "../lib/ast.ts";
import {
  classAttribute,
  classStrings,
  primitiveImports,
  tokensOf,
  variantOf,
} from "../lib/classes.ts";
import { ratcheted } from "../lib/ratchet.ts";

const REACH_IN = /(?:^|:)(?:\[[^\]]*&[^\]]*\]|\*{1,2}):/;

export const noReachInSelectors = ratcheted<{ primitives?: string[] }>(
  { primitives: { items: { type: "string" }, type: "array" } },
  (_file, { primitives = ["@/design-system/components/"] }, report) => {
    const { collect, sources } = primitiveImports(primitives);
    return {
      ImportDeclaration: collect,
      JSXOpeningElement(node: Node) {
        const element = elementOf(node);
        const source = sources.get(rootOf(element) ?? "");
        const attribute = classAttribute(node);
        if (!(source && attribute)) {
          return;
        }
        for (const { node: origin, text } of classStrings(
          valueNode(attribute),
        )) {
          for (const token of tokensOf(text)) {
            if (REACH_IN.test(variantOf(token))) {
              report({
                message: `${token} on <${elementName(element)}> styles the inside of the component from outside. Add a prop or a variant in ${source}.`,
                node: origin,
              });
            }
          }
        }
      },
    };
  },
);
