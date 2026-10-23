import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Unlike a socket file, a named pipe is visible to every user on the machine, so its name mixes in
// a secret kept beside the socket file, where only this user can read it; nobody else can work out
// the name and open the pipe first to receive what is sent to it.
function pipeSecret(dir: string): string {
  const file = path.join(dir, ".pipe-secret");
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {}
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.writeFileSync(file, crypto.randomBytes(32).toString("hex"), { flag: "wx", mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  return fs.readFileSync(file, "utf8").trim();
}

// Node only talks to local sockets through named pipes on Windows, so each socket file stands
// for a pipe named after the file and this user's secret.
export function ipcPath(socketFile: string): string {
  if (process.platform !== "win32") return socketFile;
  const file = path.resolve(socketFile);
  const digest = crypto
    .createHmac("sha256", pipeSecret(path.dirname(file)))
    .update(file.toLowerCase())
    .digest("hex");
  return `\\\\.\\pipe\\terminal-browser-${digest.slice(0, 32)}-${path.basename(file)}`;
}
