#!/usr/bin/env node
/* Polls the bot's own /ready endpoint, then POSTs the release changelog to
 * /webhook/deploy so it gets broadcast to every server the bot is in. Run
 * by the deploy workflow via `docker compose exec` on the si-card-bot
 * container itself, so `localhost` reaches the bot even though its port
 * isn't published to the host (see docker-compose.yml).
 */
const fs = require("fs");

const PORT = process.env.HEALTH_PORT || "3000";
const SECRET = process.env.DEPLOY_WEBHOOK_SECRET;
const CHANGES_FILE = process.argv[2] || "/tmp/changes.json";

async function waitForReady(timeoutMs = 60000, intervalMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${PORT}/ready`);
      if (res.status === 200) return true;
    } catch {
      // bot not accepting connections yet, keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

async function main() {
  if (!SECRET) {
    console.error(
      "DEPLOY_WEBHOOK_SECRET not set; skipping changelog broadcast",
    );
    process.exit(1);
  }

  if (!(await waitForReady())) {
    console.error(
      "Bot did not become ready in time; skipping changelog broadcast",
    );
    process.exit(1);
  }

  const body = fs.readFileSync(CHANGES_FILE, "utf8");
  const res = await fetch(`http://localhost:${PORT}/webhook/deploy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-deploy-secret": SECRET,
    },
    body,
  });

  const text = await res.text();
  console.log(`Changelog webhook responded ${res.status}: ${text}`);
  if (!res.ok) process.exit(1);
}

main();
