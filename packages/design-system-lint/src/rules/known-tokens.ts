import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  classSites,
  COLOR_ROOTS,
  PALETTE,
  tokensOf,
  utilityOf,
} from "../lib/classes.ts";
import { ratcheted } from "../lib/ratchet.ts";

const DEFAULT_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

const THEME_COLOR = /--color-([a-z][a-z-]*?)-(\d{1,4})\s*:/g;

const themes = new Map<string, Map<string, Set<string>>>();

function themeScales(cwd: string, files: string[], defaults: boolean) {
  const key = `${cwd}\n${files.join("\n")}\n${defaults}`;
  const cached = themes.get(key);
  if (cached) {
    return cached;
  }
  const scales = new Map<string, Set<string>>();
  if (defaults) {
    for (const scale of PALETTE) {
      scales.set(scale, new Set(DEFAULT_STEPS));
    }
  }
  for (const file of files) {
    const path = join(cwd, file);
    if (!existsSync(path)) {
      continue;
    }
    for (const [, scale = "", step = ""] of readFileSync(path, "utf8").matchAll(
      THEME_COLOR,
    )) {
      scales.set(scale, (scales.get(scale) ?? new Set()).add(step));
    }
  }
  themes.set(key, scales);
  return scales;
}

export const knownTokens = ratcheted<{
  defaults?: boolean;
  functions?: string[];
  theme?: string[];
}>(
  {
    defaults: { type: "boolean" },
    functions: { items: { type: "string" }, type: "array" },
    theme: { items: { type: "string" }, type: "array" },
  },
  (
    _file,
    {
      defaults = true,
      functions = ["cn", "cva", "clsx", "twMerge"],
      theme = ["src/app/globals.css"],
    },
    report,
    cwd,
  ) => {
    const scales = themeScales(cwd, theme, defaults);
    if (scales.size === 0) {
      return {};
    }
    const token = new RegExp(
      `^(?:${COLOR_ROOTS})-(${[...scales.keys()].join("|")})-(\\d{1,4})(?:/.+)?$`,
    );
    return classSites(functions, (strings) => {
      for (const { node, text } of strings) {
        for (const written of tokensOf(text)) {
          const [, scale = "", step = ""] =
            token.exec(utilityOf(written)) ?? [];
          const steps = scales.get(scale);
          if (steps && !steps.has(step)) {
            const listed = [...steps]
              .toSorted((a, b) => Number(a) - Number(b))
              .join(", ");
            report({
              message: `${written} names a step the theme does not define, so it renders nothing. ${scale} has ${listed}.`,
              node,
            });
          }
        }
      }
    });
  },
);
