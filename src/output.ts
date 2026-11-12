import type { ProgramIO } from "./program.js";

/** Exit code used by commands that are not implemented yet. */
export const EXIT_NOT_IMPLEMENTED = 2;

/** Reports that a command is not implemented yet and returns its exit code. */
export function notImplemented(command: string, json: boolean, io: ProgramIO): number {
  if (json) {
    io.writeOut(`${JSON.stringify({ command, status: "not_implemented" })}\n`);
  } else {
    io.writeErr(`epsylon ${command}: not implemented yet\n`);
  }
  return EXIT_NOT_IMPLEMENTED;
}
