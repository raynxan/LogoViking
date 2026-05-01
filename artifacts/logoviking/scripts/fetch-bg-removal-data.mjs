#!/usr/bin/env node
import { createWriteStream, createReadStream } from "node:fs";
import { mkdir, rm, stat, readFile, writeFile, readdir, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { createHash } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ARTIFACT_ROOT = resolve(__dirname, "..");
const TARGET_DIR = resolve(ARTIFACT_ROOT, "public", "bg-removal-data");
const TMP_DIR = resolve(ARTIFACT_ROOT, "tmp", "bg-removal-data");
const STAMP_FILE = resolve(TARGET_DIR, ".version");

async function readImglyVersion() {
  // Prefer the version actually installed in node_modules so we always match
  // what the browser bundle imports at runtime, not whatever range happens to
  // be written in package.json.
  const installedPkgPath = resolve(
    ARTIFACT_ROOT,
    "node_modules",
    "@imgly",
    "background-removal",
    "package.json",
  );
  if (await pathExists(installedPkgPath)) {
    const installedPkg = JSON.parse(await readFile(installedPkgPath, "utf8"));
    if (installedPkg.version && /^\d+\.\d+\.\d+/.test(installedPkg.version)) {
      return installedPkg.version;
    }
  }
  // Fallback to package.json range so first-time installs can still bootstrap
  // before pnpm has populated node_modules (e.g. fresh clones).
  const pkg = JSON.parse(await readFile(resolve(ARTIFACT_ROOT, "package.json"), "utf8"));
  const dep = pkg.devDependencies?.["@imgly/background-removal"]
    ?? pkg.dependencies?.["@imgly/background-removal"];
  if (!dep) throw new Error("@imgly/background-removal is not declared in package.json");
  const version = dep.replace(/^[^\d]*/, "");
  if (!/^\d+\.\d+\.\d+/.test(version)) {
    throw new Error(`Could not parse @imgly/background-removal version from "${dep}"`);
  }
  return version;
}

async function pathExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function alreadyInstalled(version) {
  if (!(await pathExists(STAMP_FILE))) return false;
  const stamp = (await readFile(STAMP_FILE, "utf8")).trim();
  if (stamp !== version) return false;
  const resourcesPath = resolve(TARGET_DIR, "resources.json");
  return pathExists(resourcesPath);
}

async function downloadTarball(url, dest) {
  console.log(`[bg-removal-data] downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  await pipeline(res.body, createWriteStream(dest));
  const { size } = await stat(dest);
  console.log(`[bg-removal-data] downloaded ${(size / 1024 / 1024).toFixed(1)} MB`);
}

async function extract(tarPath, outDir) {
  await mkdir(outDir, { recursive: true });
  console.log(`[bg-removal-data] extracting → ${outDir}`);
  await new Promise((resolveP, rejectP) => {
    const child = spawn("tar", ["-xzf", tarPath, "-C", outDir], { stdio: "inherit" });
    child.on("error", rejectP);
    child.on("exit", (code) => {
      if (code === 0) resolveP(undefined);
      else rejectP(new Error(`tar exited with code ${code}`));
    });
  });
}

async function sha256OfFile(filePath) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(filePath), hash);
  return hash.digest("hex");
}

/**
 * Verify the on-disk bundle matches resources.json exactly. Each chunk file
 * is content-addressed: its filename IS its sha256, and its byte-size MUST
 * equal `chunk.offsets[1] - chunk.offsets[0]`. The @imgly client validates
 * the same invariants on every load, so a passing check here guarantees
 * the tool will work on first run AND on every subsequent visit (it will
 * receive byte-identical files, served directly from our origin / browser
 * cache, with no fallback to the third-party CDN needed).
 */
async function verifyBundleIntegrity(targetDir) {
  const resourcesPath = resolve(targetDir, "resources.json");
  const resources = JSON.parse(await readFile(resourcesPath, "utf8"));
  const keys = Object.keys(resources);
  if (keys.length === 0) throw new Error("resources.json is empty");

  let chunkCount = 0;
  let totalBytes = 0;
  for (const [key, entry] of Object.entries(resources)) {
    if (!Array.isArray(entry.chunks) || entry.chunks.length === 0) {
      throw new Error(`Resource ${key} has no chunks`);
    }
    for (const chunk of entry.chunks) {
      const chunkPath = resolve(targetDir, chunk.name);
      const expectedSize = chunk.offsets[1] - chunk.offsets[0];
      const actual = await stat(chunkPath).catch(() => null);
      if (!actual) throw new Error(`Missing chunk file ${chunk.name} (for ${key})`);
      if (actual.size !== expectedSize) {
        throw new Error(
          `Chunk ${chunk.name} size mismatch: expected ${expectedSize}, got ${actual.size}`,
        );
      }
      // Verify the filename actually matches the file's sha256 (content-addressed).
      // This is the same check the @imgly runtime relies on for cache safety.
      const actualHash = await sha256OfFile(chunkPath);
      if (actualHash !== chunk.name) {
        throw new Error(
          `Chunk ${chunk.name} hash mismatch: file hashes to ${actualHash}`,
        );
      }
      chunkCount++;
      totalBytes += expectedSize;
    }
  }
  console.log(
    `[bg-removal-data] integrity ok: ${keys.length} resources, ${chunkCount} chunks, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total`,
  );
}

async function main() {
  const version = await readImglyVersion();
  if (await alreadyInstalled(version)) {
    // Don't re-download, but still smoke-test the bundle so a corrupted disk
    // copy fails loudly here instead of in the user's browser.
    try {
      await verifyBundleIntegrity(TARGET_DIR);
      console.log(`[bg-removal-data] already installed (v${version})`);
      return;
    } catch (err) {
      console.warn(
        `[bg-removal-data] cached bundle failed integrity check (${err.message}); re-downloading`,
      );
    }
  }

  await rm(TARGET_DIR, { recursive: true, force: true });
  await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });

  const url = `https://staticimgly.com/@imgly/background-removal-data/${version}/package.tgz`;
  const tarPath = resolve(TMP_DIR, "package.tgz");

  await downloadTarball(url, tarPath);
  await extract(tarPath, TMP_DIR);

  // Tarball layout: package/dist/* — move dist/ to TARGET_DIR
  const distSrc = resolve(TMP_DIR, "package", "dist");
  if (!(await pathExists(distSrc))) {
    throw new Error(`Expected ${distSrc} after extraction but it does not exist`);
  }

  await mkdir(dirname(TARGET_DIR), { recursive: true });
  await rename(distSrc, TARGET_DIR);

  await writeFile(STAMP_FILE, version + "\n", "utf8");

  // Verify the bundle on disk is byte-for-byte what the @imgly client expects.
  // This guarantees offline-after-first-load: every visit gets identical bytes
  // (validated by the runtime's own size + content-hash checks), so once the
  // browser has cached them they keep working with zero new network calls.
  await verifyBundleIntegrity(TARGET_DIR);

  const fileCount = (await readdir(TARGET_DIR)).length;
  console.log(`[bg-removal-data] installed v${version} (${fileCount} files)`);

  // Cleanup tmp
  await rm(TMP_DIR, { recursive: true, force: true });
}

main().catch((err) => {
  console.error("[bg-removal-data] failed:", err);
  process.exit(1);
});
