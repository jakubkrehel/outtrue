import {
  CLASS_FUNCTIONS,
  classSites,
  tokensOf,
  variantOf,
} from "../lib/classes.ts";
import { ratcheted } from "../lib/ratchet.ts";

const SCREEN_HEIGHT = /^((?:min-|max-)?h)-screen$/;

const ARBITRARY_Z = /^z-\[-?\d+\]$/;

function shorthandMessages(text: string) {
  const messages: string[] = [];
  const widths = new Map<string, string>();
  const heights = new Map<string, string>();
  for (const token of tokensOf(text)) {
    const variant = variantOf(token);
    const utility = token.slice(variant.length);
    const screen = SCREEN_HEIGHT.exec(utility);
    if (screen) {
      messages.push(
        `${token} ignores mobile browser chrome. Use ${variant}${screen[1]}-dvh.`,
      );
    }
    if (ARBITRARY_Z.test(utility)) {
      messages.push(
        `${token} is an arbitrary z-index. Use a step on the z scale, such as ${variant}z-10.`,
      );
    }
    if (utility.startsWith("w-")) {
      widths.set(`${variant}${utility.slice(2)}`, variant);
    } else if (utility.startsWith("h-")) {
      heights.set(`${variant}${utility.slice(2)}`, variant);
    }
  }
  for (const [key, variant] of widths) {
    const value = key.slice(variant.length);
    if (heights.has(key) && value !== "screen") {
      messages.push(
        `${variant}w-${value} ${variant}h-${value} is a square. Use ${variant}size-${value}.`,
      );
    }
  }
  return messages;
}

export const preferShorthand = ratcheted<{ functions?: string[] }>(
  { functions: { items: { type: "string" }, type: "array" } },
  (_file, { functions = CLASS_FUNCTIONS }, report) =>
    classSites(functions, (strings) => {
      for (const { node, text } of strings) {
        for (const message of shorthandMessages(text)) {
          report({ message, node });
        }
      }
    }),
);
