#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const packageDir = import.meta.dirname;
const templateDir = path.join(packageDir, "template");
const { version } = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));

const USAGE = `usage: npm create @zenbu-labs/pixel [dir] [-- --no-install]

  Creates a pixel app in [dir] (default: pixel-app) and installs its dependencies.

  --no-install   only write the files
`;

function fail(message) {
  process.stderr.write(`create-pixel: ${message}\n`);
  process.exit(1);
}

function packageManager() {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("bun")) return "bun";
  if (agent.startsWith("yarn")) return "yarn";
  return "npm";
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  process.stdout.write(USAGE);
  process.exit(0);
}
const install = !args.includes("--no-install");
const target = path.resolve(args.find((arg) => !arg.startsWith("-")) ?? "pixel-app");
const name = path.basename(target).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^[._-]+/, "") || "pixel-app";

if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    fail(`${target} already exists and is not empty`);
}

const SKIP = new Set(["node_modules", "dist"]);
fs.cpSync(templateDir, target, { recursive: true, filter: (source) => !SKIP.has(path.basename(source)) });
fs.renameSync(path.join(target, "gitignore"), path.join(target, ".gitignore"));

const manifestPath = path.join(target, "package.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.name = name;
manifest.dependencies["@zenbu-labs/pixel"] = `^${version}`;
manifest.pnpm = { onlyBuiltDependencies: ["@zenbu-labs/pixel"] };
manifest.trustedDependencies = ["@zenbu-labs/pixel"];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

for (const file of [path.join("src", "main.tsx")]) {
  const filePath = path.join(target, file);
  fs.writeFileSync(filePath, fs.readFileSync(filePath, "utf8").replaceAll("pixel-app", name));
}

const pm = packageManager();
process.stdout.write(`created ${name} in ${target}\n`);

if (install) {
  const result = spawnSync(pm, ["install"], { cwd: target, stdio: "inherit" });
    if (result.status !== 0) fail(`${pm} install failed, run it yourself in ${target}`);
}

const relative = path.relative(process.cwd(), target) || ".";
const cdTarget = /\s/.test(relative) ? `"${relative}"` : relative;
const start = pm === "npm" ? "npm start" : `${pm} run start`;
process.stdout.write(`\nnext:\n  cd ${cdTarget}\n${install ? "" : `  ${pm} install\n`}  ${start}\n`);
