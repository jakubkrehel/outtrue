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
  PLACEMENT_ROOTS,
  primitiveImports,
  tokensOf,
  utilityOf,
} from "../lib/classes.ts";
import { ratcheted } from "../lib/ratchet.ts";

const LAYOUT_ROOTS = [
  ...PLACEMENT_ROOTS,
  "order",
  "self",
  "justify-self",
  "place-self",
  "col",
  "row",
  "z",
  "grow",
  "shrink",
].join("|");

const LAYOUT = new RegExp(
  `^(?:(?:${LAYOUT_ROOTS})-.+|flex-(?:1|auto|none|initial)|grow|shrink|absolute|relative|fixed|sticky|static|hidden|block|inline-block|(?:group|peer)(?:/.+)?)$`,
);

export const layoutOnlyClassName = ratcheted<{
  allow?: string[];
  primitives?: string[];
}>(
  {
    allow: { items: { type: "string" }, type: "array" },
    primitives: { items: { type: "string" }, type: "array" },
  },
  (
    _file,
    { allow = [], primitives = ["@/design-system/components/"] },
    report,
  ) => {
    const allowed = allow.map((pattern) => new RegExp(pattern));
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
        const restyles = classStrings(valueNode(attribute))
          .flatMap(({ text }) => tokensOf(text))
          .filter((token) => {
            const utility = utilityOf(token);
            return !(
              LAYOUT.test(utility) ||
              allowed.some((pattern) => pattern.test(utility))
            );
          });
        if (restyles.length === 0) {
          return;
        }
        const listed = restyles.slice(0, 3).join(", ");
        const rest =
          restyles.length > 3 ? ` and ${restyles.length - 3} more` : "";
        const verb = restyles.length === 1 ? "restyles" : "restyle";
        report({
          message: `className on <${elementName(element)}> can only place it: margin, size, position and flex or grid placement. ${listed}${rest} ${verb} the component. Use a prop, or add a variant in ${source}.`,
          node: attribute,
        });
      },
    };
  },
);
