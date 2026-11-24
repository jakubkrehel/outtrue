#!/usr/bin/env node
const RULE = /design-system\((.+)\)$/;

let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
}

const baseline = {};

for (const { code, filename } of JSON.parse(input).diagnostics) {
  const rule = RULE.exec(code ?? "")?.[1];
  if (rule) {
    baseline[rule] ??= {};
    baseline[rule][filename] = (baseline[rule][filename] ?? 0) + 1;
  }
}

const sorted = (object) =>
  Object.fromEntries(
    Object.entries(object).toSorted(([a], [b]) => a.localeCompare(b)),
  );

for (const rule of Object.keys(baseline)) {
  baseline[rule] = sorted(baseline[rule]);
}

console.log(JSON.stringify(sorted(baseline), null, 2));
