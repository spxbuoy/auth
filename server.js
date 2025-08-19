import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const OWNER = "spider660";  // original repo owner
const REPO = "Spider-bot";  // repo name

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GH_HEADERS = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "fork-checker"
};

// Simple in-memory cache (username -> true)
const verifiedUsers = new Map();

// ✅ Check if user is owner or forked the repo
async function hasUserForked(username) {
  if (!username) return false;
  username = username.toLowerCase();

  // Cached users always pass
  if (verifiedUsers.has(username)) {
    return true;
  }

  // Original owner always passes
  if (username === OWNER.toLowerCase()) {
    verifiedUsers.set(username, true);
    return true;
  }

  // Loop through all fork pages
  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/forks?per_page=100&page=${page}`;
    const resp = await fetch(url, { headers: GH_HEADERS });

    if (!resp.ok) {
      console.error("GitHub API error:", resp.status);
      return false;
    }

    const forks = await resp.json();
    if (forks.length === 0) break; // no more pages

    // Check this page
    const found = forks.some(
      (fork) => fork.owner && fork.owner.login.toLowerCase() === username
    );

    if (found) {
      verifiedUsers.set(username, true); // cache success
      return true;
    }

    page++;
  }

  return false;
}

// ✅ API endpoint to check
app.get("/api/check-fork", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.json({ success: false, error: "No username provided" });
  }

  try {
    const forked = await hasUserForked(username.trim());
    res.json({ success: forked });
  } catch (err) {
    console.error("Error checking fork:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ Serve your index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
