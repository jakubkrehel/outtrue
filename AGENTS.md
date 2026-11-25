# AGENTS.md

This file is the single source of guidance for coding agents working in this repository. `CLAUDE.md` imports it and adds nothing but Claude Code specifics, so put repository facts here and do not maintain a second copy.

## What this repository is

`outtrue` is an npm package of Oxlint rules that keep code on a design system. It is loaded through `jsPlugins` under the plugin name `design-system`, so every rule is `design-system/<rule>`. The rules read Tailwind class names in React code.

## Working agreement

Behavioural rules, not code conventions.

- **Change only what was named.** If a fix needs an adjacent file, helper, dependency or piece of copy, say so and stop.
- **A false positive is worse than a missed case.** A rule that reports valid code gets turned off. When a check can't tell, it stays quiet. Every fix for a false positive comes with the test that reproduces it.
- **Every message names the fix.** Say what is wrong and what to write instead, in the words of the code being linted: `16px is p-4 on the spacing scale`. An agent reads the message and corrects the code in the same run.
- **End on the result.** No "want me to…", "say the word", "happy to…". If a decision is genuinely needed, ask it in the first line, not the last.
- **Write commit and PR titles like a person.** `type: short summary`, under ~60 characters, naming the outcome. No trailing "for improved / for better / for consistency" clause.
- **PR descriptions are plain prose or nothing.** A few sentences on what changed and why. Never a bulleted dump of the commit subjects.
- **Releasing is Jakub's.** Commit, push and open PRs when asked. He merges, bumps the version and publishes.

## Commands

The package manager is **bun**.

- `bun run test` runs Vitest. Each test writes fixture files to a temporary folder and runs the real `oxlint` binary over them with the plugin loaded from `src/plugin.ts`, so nothing is mocked.
- `bun run lint` runs Oxlint and `bun run format` runs oxfmt. `bun run format:check` is what CI runs.
- `bun run typecheck` runs `tsc`.
- `bun run build` runs tsdown and writes `dist/plugin.mjs`, the file the package exports.

CI runs all five on every pull request and on `main`.

## Architecture

- `src/plugin.ts` registers every rule under its file name. A test fails when a file in `src/rules/` is not registered.
- `src/rules/<rule>.ts` holds one rule and `src/rules/<rule>.test.ts` its tests.
- `src/lib/ratchet.ts` exports `ratcheted`, which every rule is built with. It adds the `baseline` option, fills `primitives` from `settings["design-system"]` and reports a primitives folder that does not exist.
- `src/lib/classes.ts` finds class strings in `className`, in `cn`, `cva`, `clsx` and `twMerge` calls and in module constants, and splits a class into its variant and utility. `src/lib/ast.ts` has the node helpers and `src/lib/paths.ts` the import and folder ones.
- `configs/` holds `base`, `recommended` and `all`. A test fails when `all.json` does not turn on every rule.
- `baseline.mjs` is the `outtrue-baseline` binary, which turns Oxlint's JSON output into the per-file counts the `baseline` option takes.
- `OPTIONS.md` documents every option. `README.md` lists every rule in one line each.

`tsconfig.json` sets `allowImportingTsExtensions`, so imports end in `.ts`.

## Adding a rule

1. Write `src/rules/<rule>.ts` with `ratcheted`. A rule that tells primitives apart takes a `primitives` option, which the shared setting then fills.
2. Write `src/rules/<rule>.test.ts` with `lint` from `rule.test-utils.ts`. Cover what it reports, what it must leave alone and each option.
3. Register it in `src/plugin.ts` and add it to `configs/all.json`. Add it to `recommended.json` only when it is safe on a codebase that has never seen it.
4. Add its line to the list in `README.md`, its options to the table in `OPTIONS.md` and an entry under Unreleased in `CHANGELOG.md`. Update the rule counts in `README.md`.

## Releasing

Move the Unreleased entries in `CHANGELOG.md` under the new version and bump `version` in `package.json`. Then `gh release create vX.Y.Z --generate-notes`. Publishing the GitHub release creates the tag and runs `release.yml`, which publishes to npm. A draft release publishes nothing.

A new rule in `recommended` or a rule that starts reporting more is a minor version while the package is below 1.0.
