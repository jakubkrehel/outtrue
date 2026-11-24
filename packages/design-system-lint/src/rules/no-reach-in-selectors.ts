import {
  elementName,
  elementOf,
  isClassAttribute,
  nameOf,
  type Node,
  rootOf,
  valueNode,
} from "../lib/ast.ts";
import { classStrings, tokensOf, variantOf } from "../lib/classes.ts";
import { ratcheted } from "../lib/ratchet.ts";

const REACH_IN = /(?:^|:)(?:\[[^\]]*&[^\]]*\]|\*{1,2}):/;

export const noReachInSelectors = ratcheted<{ primitives?: string[] }>(
  { primitives: { items: { type: "string" }, type: "array" } },
  (_file, { primitives = ["@/design-system/components/"] }, report) => {
    const sources = new Map<string, string>();
    return {
      ImportDeclaration(node: Node) {
        const source = node.source?.value;
        if (
          typeof source !== "string" ||
          !primitives.some((prefix) => source.startsWith(prefix))
        ) {
          return;
        }
        for (const specifier of node.specifiers ?? []) {
          const local = nameOf(specifier.local);
          if (local) {
            sources.set(local, source);
          }
        }
      },
      JSXOpeningElement(node: Node) {
        const element = elementOf(node);
        const source = sources.get(rootOf(element) ?? "");
        const attribute = (node.attributes ?? []).find(isClassAttribute);
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
