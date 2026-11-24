import { type Node } from "../lib/ast.ts";
import { resolveImport } from "../lib/paths.ts";
import { ratcheted } from "../lib/ratchet.ts";

export const noCrossSurfaceImports = ratcheted<{
  alias?: Record<string, string>;
  primitives?: string;
  shared?: string[];
  surfaces?: string[];
}>(
  {
    alias: { additionalProperties: { type: "string" }, type: "object" },
    primitives: { type: "string" },
    shared: { items: { type: "string" }, type: "array" },
    surfaces: { items: { type: "string" }, type: "array" },
  },
  (
    file,
    {
      alias = { "@/": "src/" },
      primitives = "src/design-system/components",
      shared = [],
      surfaces = ["src/components"],
    },
    report,
  ) => {
    const surfaceOf = (path: string) => {
      for (const folder of surfaces) {
        if (path.startsWith(`${folder}/`)) {
          const [surface = "", ...rest] = path
            .slice(folder.length + 1)
            .split("/");
          return rest.length > 0 ? surface : null;
        }
      }
      return null;
    };
    const from = surfaceOf(file);
    const check = (node: Node) => {
      const source = node.source?.value;
      if (!from || typeof source !== "string") {
        return;
      }
      const target = resolveImport(file, source, alias);
      const to = target ? surfaceOf(target) : null;
      if (to && to !== from && !shared.includes(to)) {
        report({
          message: `${from} imports from ${to}. A component two parts of the product use belongs to the design system. Move it to ${primitives}, or pass it in through props.`,
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
