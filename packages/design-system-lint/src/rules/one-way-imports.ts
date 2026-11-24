import { type Node } from "../lib/ast.ts";
import { resolveImport } from "../lib/paths.ts";
import { ratcheted } from "../lib/ratchet.ts";

export const oneWayImports = ratcheted<{
  alias?: Record<string, string>;
  layers?: string[];
}>(
  {
    alias: { additionalProperties: { type: "string" }, type: "object" },
    layers: { items: { type: "string" }, type: "array" },
  },
  (
    file,
    {
      alias = { "@/": "src/" },
      layers = ["src/design-system", "src/components", "src/app"],
    },
    report,
  ) => {
    const layerOf = (path: string) =>
      layers.findIndex(
        (layer) => path === layer || path.startsWith(`${layer}/`),
      );
    const from = layerOf(file);
    const check = (node: Node) => {
      const source = node.source?.value;
      if (from === -1 || typeof source !== "string") {
        return;
      }
      const target = resolveImport(file, source, alias);
      const to = target ? layerOf(target) : -1;
      if (to > from) {
        report({
          message: `${layers[from]} sits below ${layers[to]} and can't import from it. Pass what this needs through props, or move the file up to ${layers[to]}.`,
          node: node.source ?? node,
        });
      }
    };
    return {
      ExportAllDeclaration: check,
      ExportNamedDeclaration: check,
      ImportDeclaration: check,
      ImportExpression: check,
    };
  },
);
