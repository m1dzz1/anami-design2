// Packs the standalone build into deploy/anami-cpanel(.zip) for a cPanel "Setup Node.js App" host.
// Run through `npm run package:cpanel` (builds first).
//
// node_modules is left out on purpose: the cPanel Node.js selector keeps node_modules in its own
// virtual environment and installs it with "Run NPM Install" from the package.json written here.
// That also gets the Linux build of sharp (image optimization) instead of the one from this machine.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const outDir = path.join(root, "deploy", "anami-cpanel");
const zipFile = path.join(root, "deploy", "anami-cpanel.zip");

if (!existsSync(path.join(standalone, "server.js"))) {
  console.error('No .next/standalone/server.js — run "npm run build" first (next.config.ts needs output: "standalone").');
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
rmSync(zipFile, { force: true });

// Server + traced build output, without node_modules and without any local .env secrets
cpSync(standalone, outDir, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(standalone, src);
    const top = rel.split(path.sep)[0];
    return top !== "node_modules" && !/^\.env/.test(path.basename(src));
  },
});
// Static assets server.js serves itself when they sit next to it
cpSync(path.join(root, ".next", "static"), path.join(outDir, ".next", "static"), { recursive: true });
cpSync(path.join(root, "public"), path.join(outDir, "public"), { recursive: true });

const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const nextPkg = JSON.parse(readFileSync(path.join(root, "node_modules", "next", "package.json"), "utf8"));
writeFileSync(
  path.join(outDir, "package.json"),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      private: true,
      scripts: { start: "node server.js" },
      engines: nextPkg.engines,
      dependencies: pkg.dependencies,
    },
    null,
    2,
  ) + "\n",
);

cpSync(path.join(root, "scripts", "cpanel-UPUTSTVO.txt"), path.join(outDir, "UPUTSTVO.txt"));

// bsdtar (bundled with Windows 10+ and macOS) writes zip archives with -a. On Windows call it by full path,
// because Git Bash puts GNU tar first on PATH and GNU tar would write a plain tar under the .zip name.
const tarBin = process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "tar";
const entries = readdirSync(outDir);
const tar = spawnSync(tarBin, ["-a", "-c", "-f", zipFile, ...entries], { cwd: outDir, stdio: "inherit" });
if (tar.status === 0) {
  console.log(`\nReady: ${path.relative(root, zipFile)} (upload) and ${path.relative(root, outDir)}/ (same files, unzipped)`);
} else {
  console.log(`\nZip step failed; upload the folder ${path.relative(root, outDir)}/ instead (or zip it by hand).`);
}
