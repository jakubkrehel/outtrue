import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const binary = fileURLToPath(
  new URL("../../node_modules/.bin/oxlint", import.meta.url),
);

const plugin = fileURLToPath(new URL("../plugin.ts", import.meta.url));

interface Diagnostic {
  code: string;
  filename: string;
  message: string;
}

export function lint(
  rule: string,
  files: Record<string, string>,
  options?: Record<string, unknown>,
) {
  const directory = mkdtempSync(join(tmpdir(), "desylint-"));

  try {
    for (const [path, code] of Object.entries(files)) {
      const file = join(directory, path);

      mkdirSync(dirname(file), { recursive: true });

      writeFileSync(file, code);
    }

    writeFileSync(
      join(directory, "config.json"),
      JSON.stringify({
        categories: { correctness: "off" },
        jsPlugins: [{ name: "design-system", specifier: plugin }],
        rules: {
          [`design-system/${rule}`]: options ? ["error", options] : "error",
        },
      }),
    );

    const result = spawnSync(
      binary,
      ["--config", "config.json", "--threads", "1", "--format", "json", "."],
      { cwd: directory, encoding: "utf8", timeout: 20_000 },
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0 && result.status !== 1) {
      throw new Error(
        `Oxlint exited with status ${result.status}: ${result.stdout}${result.stderr}`,
      );
    }

    const report = JSON.parse(result.stdout) as { diagnostics: Diagnostic[] };

    const messages: Record<string, string[]> = Object.fromEntries(
      Object.keys(files).map((path) => [path, []]),
    );

    for (const { code, filename, message } of report.diagnostics) {
      if (code === `design-system(${rule})`) {
        (messages[filename] ??= []).push(message);
      }
    }

    return messages;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
