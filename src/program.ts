import { createRequire } from "node:module";
import { Command } from "commander";
import { notImplemented } from "./output.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

interface Step {
  name: string;
  description: string;
}

/** The four MVP commands, in the order a migration runs them. */
export const steps: readonly Step[] = [
  { name: "init", description: "Analyse the repository and write epsylon.yaml" },
  {
    name: "plan",
    description: "Generate the Dockerfile, docker-compose.yml and migration runbook",
  },
  { name: "check", description: "Run the compliance checks and print a report" },
  { name: "deploy", description: "Deploy the generated configuration to a Coolify instance" },
];

export interface ProgramIO {
  writeOut: (text: string) => void;
  writeErr: (text: string) => void;
}

const processIO: ProgramIO = {
  writeOut: (text) => process.stdout.write(text),
  writeErr: (text) => process.stderr.write(text),
};

export function buildProgram(io: ProgramIO = processIO): Command {
  const program = new Command()
    .name("epsylon")
    .description(
      "Migrate a Vercel-hosted Next.js app to sovereign European infrastructure with Coolify.",
    )
    .version(version)
    .configureOutput({ writeOut: io.writeOut, writeErr: io.writeErr });

  for (const step of steps) {
    program
      .command(step.name)
      .description(step.description)
      .option("--json", "print machine-readable JSON output")
      .action((options: { json?: boolean }) => {
        process.exitCode = notImplemented(step.name, options.json === true, io);
      });
  }

  return program;
}
