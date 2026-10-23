import crypto from "node:crypto";
import path from "node:path";

// Node only talks to local sockets through named pipes on Windows, so each socket file stands
// for a pipe named after its full path, which keeps pipes apart between users and data dirs.
export function ipcPath(socketFile: string): string {
  if (process.platform !== "win32") return socketFile;
  const digest = crypto.createHash("sha256").update(path.resolve(socketFile).toLowerCase()).digest("hex");
  return `\\\\.\\pipe\\terminal-browser-${digest.slice(0, 16)}-${path.basename(socketFile)}`;
}
