import { existsSync, readdirSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

export function resolveImport(
  file: string,
  source: string,
  alias: Record<string, string>,
) {
  if (source.startsWith(".")) {
    return posix.join(posix.dirname(file), source);
  }
  const prefix = Object.keys(alias).find((key) => source.startsWith(key));
  return prefix ? `${alias[prefix]}${source.slice(prefix.length)}` : null;
}

export function isUnder(file: string, folders: string[]) {
  return folders.some((folder) =>
    file.startsWith(folder.endsWith("/") ? folder : `${folder}/`),
  );
}

export const SOURCE_FILE = /\.(?:tsx?|jsx?)$/;

export function sourceFiles(cwd: string, folder: string): string[] {
  const root = join(cwd, folder);
  if (!existsSync(root)) {
    return [];
  }
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SOURCE_FILE.test(entry.name))
    .map((entry) =>
      relative(cwd, join(entry.parentPath, entry.name)).split(sep).join("/"),
    )
    .toSorted();
}
