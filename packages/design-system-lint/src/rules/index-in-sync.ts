import { existsSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { type Node } from "../lib/ast.ts";
import { isUnder, SOURCE_FILE, sourceFiles } from "../lib/paths.ts";
import { ratcheted, type Visitor } from "../lib/ratchet.ts";

function pascalCase(name: string) {
  return name
    .split(/[-_.]/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join("");
}

function mentions(text: string, name: string) {
  const escaped = name.replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");
  return new RegExp(`(?:^|[^\\w-])${escaped}(?:[^\\w-]|$)`, "m").test(text);
}

const INDEX_ENTRY = /^\s*[-*]\s+[\w<][^:`]*:\s.*`([\w@./-]+)`\s*$/;

export const indexInSync = ratcheted<{
  ignore?: string[];
  index?: string;
  primitives?: string[];
}>(
  {
    ignore: { items: { type: "string" }, type: "array" },
    index: { type: "string" },
    primitives: { items: { type: "string" }, type: "array" },
  },
  (
    file,
    {
      ignore = ["\\.(?:test|spec|stories)\\.", "(?:^|/)index\\.[jt]sx?$"],
      index = "src/design-system/INDEX.md",
      primitives = ["src/design-system/components"],
    },
    report,
    cwd,
  ): Visitor => {
    if (!isUnder(file, primitives)) {
      return {};
    }
    const ignored = ignore.map((pattern) => new RegExp(pattern));
    const isListed = (path: string) =>
      !ignored.some((pattern) => pattern.test(path));
    return {
      Program(program: Node) {
        if (!isListed(file)) {
          return;
        }
        const files = primitives
          .flatMap((folder) => sourceFiles(cwd, folder))
          .filter(isListed);
        const isFirst = files[0] === file;
        const path = join(cwd, index);
        if (!existsSync(path)) {
          if (isFirst) {
            report({
              message: `${index} does not exist. Create it with one line per component.`,
              node: program,
            });
          }
          return;
        }
        const text = readFileSync(path, "utf8");
        const stem = file.replace(SOURCE_FILE, "");
        const base = posix.basename(stem);
        if (!(mentions(text, base) || mentions(text, pascalCase(base)))) {
          report({
            message: `${base} has no line in ${index}. Add one with what it is for and its import path.`,
            node: program,
          });
        }
        if (!isFirst) {
          return;
        }
        const names = new Set(
          files.map((candidate) =>
            posix.basename(candidate.replace(SOURCE_FILE, "")),
          ),
        );
        for (const line of text.split("\n")) {
          const entry = INDEX_ENTRY.exec(line)?.[1];
          if (entry && !names.has(posix.basename(entry))) {
            report({
              message: `${index} lists ${entry} and no component file matches it. Remove the line or fix the path.`,
              node: program,
            });
          }
        }
      },
    };
  },
);
