import {
  CLASS_FUNCTIONS,
  classSites,
  COLOR_ROOTS,
  tokensOf,
  utilityOf,
  variantOf,
} from "../lib/classes.ts";
import { isUnder } from "../lib/paths.ts";
import { ratcheted, type Visitor } from "../lib/ratchet.ts";

const COLOR_UTILITY = new RegExp(`^(?:${COLOR_ROOTS})-(.+)$`);

const NOT_A_COLOR =
  /^(?:\d[\d./%]*|\[(?:length:)?-?[\d.]+(?:px|rem|em|%)?\]|[2-9]?x[sl]|xs|sm|md|lg|base|none|hidden|inner|inset|auto|[xytrblse](?:-.+)?|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|solid|dashed|dotted|double|wavy|collapse|separate|from-font|offset-.+|(?:linear|radial|conic)(?:-.+)?)$/;

export const noThemeOverrides = ratcheted<{
  functions?: string[];
  primitives?: string[];
  variants?: string[];
}>(
  {
    functions: { items: { type: "string" }, type: "array" },
    primitives: { items: { type: "string" }, type: "array" },
    variants: { items: { type: "string" }, type: "array" },
  },
  (
    file,
    {
      functions = CLASS_FUNCTIONS,
      primitives = ["src/design-system"],
      variants = ["dark"],
    },
    report,
  ): Visitor => {
    if (isUnder(file, primitives)) {
      return {};
    }
    return classSites(functions, (strings) => {
      for (const { node, text } of strings) {
        for (const token of tokensOf(text)) {
          const theme = variantOf(token)
            .split(":")
            .find((variant) => variants.includes(variant));
          const value = COLOR_UTILITY.exec(utilityOf(token))?.[1];
          if (theme && value && !NOT_A_COLOR.test(value)) {
            report({
              message: `${token} sets a color for the ${theme} theme at the call site. Use a token that changes with the theme, or add one.`,
              node,
            });
          }
        }
      }
    });
  },
);
