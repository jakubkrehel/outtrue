import { nameOf, type Node, valueNode } from "../lib/ast.ts";
import { isUnder } from "../lib/paths.ts";
import { ratcheted, type Visitor } from "../lib/ratchet.ts";

const FUNCTIONS = [
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression",
];

function isPatternProperty(node: Node | undefined) {
  return node?.type === "Property" && node.parent?.type === "ObjectPattern";
}

export const classNamePassthrough = ratcheted<{ primitives?: string[] }>(
  { primitives: { items: { type: "string" }, type: "array" } },
  (file, { primitives = ["src/design-system"] }, report): Visitor => {
    if (!isUnder(file, primitives)) {
      return {};
    }
    const open: {
      declared: boolean;
      local: string;
      node: Node;
      used: boolean;
    }[] = [];
    const enter = (node: Node) => {
      open.push({ declared: false, local: "className", node, used: false });
    };
    const exit = (node: Node) => {
      const frame = open.pop();
      if (frame?.node === node && frame.declared && !frame.used) {
        report({
          message:
            "className is taken from the props and never reaches an element, so placing this component from outside does nothing. Merge it into the root element's classes.",
          node,
        });
      }
    };
    return {
      ...Object.fromEntries(
        FUNCTIONS.flatMap((type) => [
          [type, enter],
          [`${type}:exit`, exit],
        ]),
      ),
      Identifier(node: Node) {
        const name = nameOf(node);
        const { parent } = node;
        if (parent?.type === "TSPropertySignature") {
          return;
        }
        const binds =
          isPatternProperty(parent) ||
          (parent?.type === "AssignmentPattern" &&
            isPatternProperty(parent.parent));
        if (name === "className" && isPatternProperty(parent)) {
          const frame = open.at(-1);
          const target = valueNode(parent);
          const local = nameOf(
            target?.type === "AssignmentPattern" ? target.left : target,
          );
          if (frame && parent?.key === node) {
            frame.declared = true;
            frame.local = local ?? "className";
          }
          return;
        }
        if (binds) {
          return;
        }
        for (const frame of open) {
          if (
            name === "className" ||
            (frame.declared && frame.local === name)
          ) {
            frame.used = true;
          }
        }
      },
    };
  },
);
