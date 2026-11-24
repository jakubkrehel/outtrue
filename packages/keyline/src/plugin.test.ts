import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

import plugin from "./plugin.ts";

const ruleFiles = readdirSync(fileURLToPath(new URL("rules", import.meta.url)))
  .filter((name) => name.endsWith(".ts") && !name.includes(".test"))
  .map((name) => name.replace(/\.ts$/, ""))
  .toSorted();

test("every rule file is registered under its file name", () => {
  expect(Object.keys(plugin.rules).toSorted()).toStrictEqual(ruleFiles);
});

test("the all config turns on every rule", () => {
  const config = JSON.parse(
    readFileSync(
      fileURLToPath(new URL("../configs/all.json", import.meta.url)),
      "utf8",
    ),
  ) as { rules: Record<string, string> };

  expect(Object.keys(config.rules).toSorted()).toStrictEqual(
    ruleFiles.map((rule) => `design-system/${rule}`),
  );
});
