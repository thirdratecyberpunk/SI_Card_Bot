#!/usr/bin/env node
/**
 * Uploads the images extracted by scripts/extractAssets.cjs to the R2
 * bucket, then points the data files at them.
 *
 * Reads assets/manifest.json, uploads each image under its key (skipping
 * any the bucket already holds byte-for-byte), checks one comes back from
 * R2_PUBLIC_URL, and only then rewrites each manifest entry's data field
 * to `<R2_PUBLIC_URL>/<key>`. Safe to run again: unchanged images aren't
 * re-sent and the rewrite is a no-op.
 *
 * Needs the R2_* variables in .env (see .env.template).
 *
 * Usage: node scripts/uploadAssets.cjs [--dry-run]
 *   --dry-run  list what would be uploaded and rewritten, touching nothing.
 *              Needs no credentials.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const prettier = require("prettier");
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { locateField } = require("./extractAssets.cjs");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "assets");

// Keys follow entity ids and stay put, but an image can change under the
// same key (errata, a better scan), so don't cache forever.
const CACHE_CONTROL = "public, max-age=604800";

const CONTENT_TYPES = { ".jpg": "image/jpeg", ".png": "image/png" };

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set; see .env.template`);
  return value;
}

/** Every object in the bucket, as key -> ETag (an MD5 for simple uploads). */
async function listBucket(s3, bucket) {
  const etags = new Map();
  let token;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }),
    );
    for (const obj of page.Contents ?? []) {
      etags.set(obj.Key, obj.ETag.replaceAll('"', ""));
    }
    token = page.NextContinuationToken;
  } while (token);
  return etags;
}

async function upload(manifest, dryRun) {
  if (dryRun) {
    for (const { key } of manifest) console.log(`upload  ${key}`);
    return;
  }
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
  const bucket = env("R2_BUCKET");
  const existing = await listBucket(s3, bucket);

  let sent = 0;
  for (const { key } of manifest) {
    const body = fs.readFileSync(path.join(ASSETS, key));
    const md5 = crypto.createHash("md5").update(body).digest("hex");
    if (existing.get(key) === md5) continue;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: CONTENT_TYPES[path.extname(key)],
        CacheControl: CACHE_CONTROL,
      }),
    );
    console.log(`uploaded  ${key}`);
    sent++;
  }
  console.log(`${sent} uploaded, ${manifest.length - sent} already current`);
}

/** Fails unless the first image is reachable at its public url. */
async function checkPublicUrl(publicUrl, key) {
  const res = await fetch(`${publicUrl}/${key}`, { method: "HEAD" });
  if (!res.ok) {
    throw new Error(
      `${publicUrl}/${key} returned ${res.status}; is the bucket's public domain connected?`,
    );
  }
}

async function rewriteData(manifest, publicUrl, dryRun) {
  const files = new Map();
  let changed = 0;
  for (const entry of manifest) {
    const file = path.join(ROOT, entry.file);
    if (!files.has(file)) {
      files.set(file, JSON.parse(fs.readFileSync(file, "utf8")));
    }
    const name = path.basename(entry.file, ".json");
    const data = { [name]: files.get(file) };
    const { holder, key } = locateField(data, name, entry.id, entry.field);
    const url = `${publicUrl}/${entry.key}`;
    if (holder[key] === url) continue;
    if (dryRun) console.log(`rewrite ${entry.id} ${entry.field}  ->  ${url}`);
    holder[key] = url;
    changed++;
  }
  if (!dryRun) {
    for (const [file, json] of files) {
      const options = await prettier.resolveConfig(file);
      // Indented input, so prettier leaves multi-line objects multi-line.
      const text = await prettier.format(JSON.stringify(json, null, 2), {
        ...options,
        filepath: file,
      });
      fs.writeFileSync(file, text);
    }
  }
  console.log(
    `${changed} data field(s) ${dryRun ? "to rewrite" : "rewritten"}`,
  );
}

async function main() {
  dotenv.config({ path: path.join(ROOT, ".env") });
  const dryRun = process.argv.includes("--dry-run");
  const manifestPath = path.join(ASSETS, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("No assets/manifest.json; run scripts/extractAssets.cjs");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const { key } of manifest) {
    if (!fs.existsSync(path.join(ASSETS, key))) {
      throw new Error(`assets/${key} is missing; rerun extractAssets.cjs`);
    }
  }
  const publicUrl = (
    dryRun
      ? process.env.R2_PUBLIC_URL || "<R2_PUBLIC_URL>"
      : env("R2_PUBLIC_URL")
  ).replace(/\/+$/, "");

  await upload(manifest, dryRun);
  if (!dryRun) await checkPublicUrl(publicUrl, manifest[0].key);
  await rewriteData(manifest, publicUrl, dryRun);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
