import type { Detect } from "../terminal";

// wt reads `;` as the start of its next command, so one inside an argument has to be escaped.
function wtArgument(arg: string): string {
  return arg.replaceAll(";", "\\;");
}

// The wt command line cannot list, focus or type into panes, so only splitting is offered.
// New panes always open to the right of or below the current one.
export const windowsTerminal: Detect = (env, run) => {
  if (!env.WT_SESSION || env.TERM_PROGRAM) return null;
  const session = env.WT_SESSION;

  return {
    name: "windows-terminal",
    async getCurrentPane() {
      return { id: session, tab: session };
    },
    async split({ direction, command, size }) {
      const orientation = direction === "right" || direction === "left" ? "--vertical" : "--horizontal";
      const sized = size ? ["--size", String(size)] : [];
      await run("wt", ["-w", "0", "split-pane", orientation, ...sized, ...command.map(wtArgument)]);
    },
  };
};
