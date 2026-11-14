import { afterEach, describe, expect, it } from "vitest";
import { EXIT_NOT_IMPLEMENTED } from "../src/output.js";
import { buildProgram, steps } from "../src/program.js";

async function run(...args: string[]) {
  let stdout = "";
  let stderr = "";
  const program = buildProgram({
    writeOut: (text) => {
      stdout += text;
    },
    writeErr: (text) => {
      stderr += text;
    },
  }).exitOverride();
  await program.parseAsync(args, { from: "user" });
  return { stdout, stderr, exitCode: process.exitCode };
}

afterEach(() => {
  process.exitCode = undefined;
});

describe("epsylon", () => {
  it("exposes the four MVP commands in order", () => {
    const names = buildProgram().commands.map((command) => command.name());
    expect(names).toEqual(["init", "plan", "check", "deploy"]);
  });

  it("prints its version", async () => {
    await expect(run("--version")).rejects.toMatchObject({ code: "commander.version" });
  });

  it.each(steps.map((step) => step.name))("%s reports it is not implemented", async (name) => {
    const { stderr, exitCode } = await run(name);
    expect(stderr).toBe(`epsylon ${name}: not implemented yet\n`);
    expect(exitCode).toBe(EXIT_NOT_IMPLEMENTED);
  });

  it.each(steps.map((step) => step.name))("%s --json prints valid JSON", async (name) => {
    const { stdout, exitCode } = await run(name, "--json");
    expect(JSON.parse(stdout)).toEqual({ command: name, status: "not_implemented" });
    expect(exitCode).toBe(EXIT_NOT_IMPLEMENTED);
  });
});
