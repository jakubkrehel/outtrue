import { attributeName, nameOf, type Node, valueNode } from "../lib/ast.ts";
import {
  CLASS_FUNCTIONS,
  classSites,
  tokensOf,
  utilityOf,
} from "../lib/classes.ts";
import { isUnder } from "../lib/paths.ts";
import { ratcheted, type Visitor } from "../lib/ratchet.ts";

const ARBITRARY_TIMING = /^(duration|delay|ease)-\[(?!var\(|--).+\]$/;

const TIMING_KEYS = new Set([
  "bounce",
  "damping",
  "delay",
  "duration",
  "ease",
  "mass",
  "stiffness",
]);

const FIXED = new Set(["ArrayExpression", "Literal"]);

export const motionTokens = ratcheted<{
  functions?: string[];
  primitives?: string[];
  props?: string[];
}>(
  {
    functions: { items: { type: "string" }, type: "array" },
    primitives: { items: { type: "string" }, type: "array" },
    props: { items: { type: "string" }, type: "array" },
  },
  (
    file,
    {
      functions = CLASS_FUNCTIONS,
      primitives = ["src/design-system"],
      props = ["transition"],
    },
    report,
  ): Visitor => {
    if (isUnder(file, primitives)) {
      return {};
    }
    const sites = classSites(functions, (strings) => {
      for (const { node, text } of strings) {
        for (const token of tokensOf(text)) {
          if (ARBITRARY_TIMING.test(utilityOf(token))) {
            report({
              message: `${token} hardcodes a timing. Use a step from the scale, or add a motion token to the theme.`,
              node,
            });
          }
        }
      }
    });
    return {
      ...sites,
      JSXAttribute(node: Node) {
        sites["JSXAttribute"]?.(node);
        const name = attributeName(node) ?? "";
        const object = valueNode(node)?.expression;
        if (!props.includes(name) || object?.type !== "ObjectExpression") {
          return;
        }
        for (const property of object.properties ?? []) {
          const key = nameOf(property.key) ?? "";
          if (
            TIMING_KEYS.has(key) &&
            FIXED.has(valueNode(property)?.type ?? "")
          ) {
            report({
              message: `${name} sets ${key} inline. Use a shared transition from the design system, or add one.`,
              node: property,
            });
          }
        }
      },
    };
  },
);
