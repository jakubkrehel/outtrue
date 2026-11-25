import { relative, sep } from "node:path";
import { type Node } from "./ast.ts";

export interface Report {
  message: string;
  node: Node;
}

export interface Context {
  cwd: string;
  filename: string;
  options: unknown[];
  settings?: Record<string, unknown>;
  report: (descriptor: Report) => void;
}

export function relativePath(context: Context) {
  return relative(context.cwd, context.filename).split(sep).join("/");
}

export type Visitor = Record<string, (node: Node) => void>;

function sharedPrimitives(
  context: Context,
  properties: Record<string, unknown>,
) {
  const shared = context.settings?.["design-system"] as
    | { primitives?: string | string[] }
    | undefined;
  if (!(shared?.primitives && "primitives" in properties)) {
    return {};
  }
  const folders = [shared.primitives].flat();
  const takesOne =
    (properties["primitives"] as { type?: string }).type === "string";
  return { primitives: takesOne ? folders[0] : folders };
}

export function ratcheted<Options>(
  properties: Record<string, unknown>,
  create: (
    file: string,
    options: Options,
    report: (report: Report) => void,
    cwd: string,
  ) => Visitor,
) {
  return {
    create(context: Context): Visitor {
      const { baseline = {}, ...options } = {
        ...sharedPrimitives(context, properties),
        ...(context.options[0] as object | undefined),
      } as { baseline?: Record<string, number> } & Options;
      const file = relativePath(context);
      const allowance = baseline[file] ?? 0;
      const reports: Report[] = [];
      const visitor = create(
        file,
        options as Options,
        (report) => {
          reports.push(report);
        },
        context.cwd,
      );
      return {
        ...visitor,
        "Program:exit"(program) {
          visitor["Program:exit"]?.(program);
          if (reports.length > allowance) {
            for (const report of reports) {
              context.report(report);
            }
          } else if (reports.length < allowance) {
            context.report({
              message: `${file} has ${reports.length} of the ${allowance} violations its baseline allows. Lower the baseline to ${reports.length} so it only shrinks.`,
              node: program,
            });
          }
        },
      };
    },
    meta: {
      schema: [
        {
          additionalProperties: false,
          properties: {
            baseline: {
              additionalProperties: { type: "number" },
              type: "object",
            },
            ...properties,
          },
          type: "object",
        },
      ],
      type: "problem",
    },
  };
}
