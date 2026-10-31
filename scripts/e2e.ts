import path from "node:path";
import { spawnSync } from "node:child_process";

const browsersPath = path.join(process.cwd(), ".playwright-browsers");
process.env.PLAYWRIGHT_BROWSERS_PATH = browsersPath;

const cli = path.join(
  process.cwd(),
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

const [command = "test", ...args] = process.argv.slice(2);
const executable = /bun(\.exe)?$/i.test(process.execPath)
  ? "node"
  : process.execPath;
const result = spawnSync(executable, [cli, command, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
