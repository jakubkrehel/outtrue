import {
  cookedOf,
  isClassAttribute,
  nameOf,
  type Node,
  valueNode,
} from "./ast.ts";
import { type Visitor } from "./ratchet.ts";

export interface ClassString {
  node: Node;
  text: string;
}

export const PLACEMENT_ROOTS = [
  "w",
  "h",
  "size",
  "min-w",
  "max-w",
  "min-h",
  "max-h",
  "basis",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "ms",
  "me",
  "inset",
  "inset-x",
  "inset-y",
  "top",
  "right",
  "bottom",
  "left",
  "start",
  "end",
];

export function classStrings(node: Node | null | undefined): ClassString[] {
  if (!node) {
    return [];
  }
  switch (node.type) {
    case "Literal": {
      return typeof node.value === "string" ? [{ node, text: node.value }] : [];
    }
    case "TemplateLiteral": {
      return [
        ...(node.quasis ?? []).flatMap((quasi) => {
          const cooked = cookedOf(quasi);
          return cooked ? [{ node: quasi, text: cooked }] : [];
        }),
        ...(node.expressions ?? []).flatMap(classStrings),
      ];
    }
    case "JSXExpressionContainer": {
      return classStrings(node.expression);
    }
    case "CallExpression": {
      return (node.arguments ?? []).flatMap(classStrings);
    }
    case "ConditionalExpression": {
      return [
        ...classStrings(node.consequent),
        ...classStrings(node.alternate),
      ];
    }
    case "LogicalExpression": {
      return [...classStrings(node.left), ...classStrings(node.right)];
    }
    case "ArrayExpression": {
      return (node.elements ?? []).flatMap(classStrings);
    }
    case "ObjectExpression": {
      return (node.properties ?? []).flatMap((property) =>
        classStrings(property.key).concat(classStrings(valueNode(property))),
      );
    }
    default: {
      return [];
    }
  }
}

export function utilityOf(token: string) {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < token.length; index++) {
    const character = token[index];
    if (character === "[" || character === "(") {
      depth++;
    } else if (character === "]" || character === ")") {
      depth--;
    } else if (character === ":" && depth === 0) {
      start = index + 1;
    }
  }
  return token
    .slice(start)
    .replace(/^!/, "")
    .replace(/!$/, "")
    .replace(/^-/, "");
}

export function tokensOf(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

export function classSites(
  functions: string[],
  inspect: (strings: ClassString[], attribute: Node | undefined) => void,
): Visitor {
  const classFunctions = new Set(functions);
  const isClassCall = (node: Node | undefined) =>
    node?.type === "CallExpression" &&
    classFunctions.has(nameOf(node.callee) ?? "");
  return {
    CallExpression(node: Node) {
      if (!isClassCall(node)) {
        return;
      }
      let current = node.parent;
      while (current) {
        if (isClassAttribute(current) || isClassCall(current)) {
          return;
        }
        current = current.parent;
      }
      inspect(classStrings(node), undefined);
    },
    JSXAttribute(node: Node) {
      if (isClassAttribute(node)) {
        inspect(classStrings(valueNode(node)), node);
      }
    },
  };
}

export function variantOf(token: string) {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < token.length; index++) {
    const character = token[index];
    if (character === "[" || character === "(") {
      depth++;
    } else if (character === "]" || character === ")") {
      depth--;
    } else if (character === ":" && depth === 0) {
      start = index + 1;
    }
  }
  return token.slice(0, start);
}

export const COLOR_ROOTS = [
  "text",
  "bg",
  "border",
  "border-[xytrblse]",
  "ring",
  "ring-offset",
  "inset-ring",
  "outline",
  "fill",
  "stroke",
  "divide",
  "decoration",
  "shadow",
  "inset-shadow",
  "from",
  "via",
  "to",
  "placeholder",
  "caret",
  "accent",
].join("|");

export const PALETTE = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];
