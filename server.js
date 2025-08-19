// server.js (ESM)
// Requires Node 18+ (Render uses 22.x) – no need for node-fetch.
// If your package.json doesn't already have it, add: { "type": "module" }

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ====== CONFIGURE THESE TWO ======
const OWNER = "spider660";   // the original repo owner
const REPO  = "Spider-bot";  // the original repo name
// =================================

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Build GitHub headers (token optional but recommended)
const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || "").trim();
const GH_HEADERS = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "fork-checker/1.0"
};
if (GITHUB_TOKEN) {
  GH_HEADERS.Authorization = `Bearer ${GITHUB_TOKEN}`;
}

// Helper: check if username has forked OWNER/REPO (with pagination)
async function userHasFork(username) {
  const u = username.toLowerCase();
  const o = OWNER.toLowerCase();

  // Owner always passes
  if (u === o) return { ok: true, owner: true };

  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/forks?per_page=100&page=${page}`;
    const resp = await fetch(url, { headers: GH_HEADERS });

    if (!resp.ok) {
      // Surface the error so you can see rate-limit or typo issues
      const errBody = await resp.text().catch(() => "");
      return { ok: false, error: `GitHub API ${resp.status}`, details: errBody };
    }

    const forks = await resp.json();

    // Look for the username on this page
    const found = forks.some(
      f => f?.owner?.login?.toLowerCase() === u
    );
    if (found) return { ok: true, owner: false };

    // No more pages
    if (!Array.isArray(forks) || forks.length < 100) break;

    page += 1;
    // Safety cap to avoid infinite loops in bizarre cases
    if (page > 50) break;
  }

  return { ok: false }; // not found among forks
}

// Serve your index.html from the same folder (no /public needed)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API: /api/check-fork?username=NAME
app.get("/api/check-fork", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const username = (req.query.username || "").trim();

  if (!username) {
    return res.status(400).json({ success: false, error: "No username provided" });
  }

  try {
    const result = await userHasFork(username);

    if (result.ok) {
      return res.json({ success: true, owner: !!result.owner });
    }

    // If GitHub responded with an error, return it so you can see it in the browser
    if (result.error) {
      return res.status(502).json({
        success: false,
        error: result.error,
        details: result.details || undefined
      });
    }

    // Not found among forks
    return res.json({ success: false });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
