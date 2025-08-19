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

// ✅ Permanent memory of verified users
const verifiedUsers = new Set();

// ✅ Check if user is owner or forked the repo
async function hasUserForked(username) {
  if (!username) return false;

  username = username.toLowerCase();

  // If already verified once, always pass
  if (verifiedUsers.has(username)) {
    return true;
  }

  // Original owner always passes
  if (username === OWNER.toLowerCase()) {
    verifiedUsers.add(username);
    return true;
  }

  // Direct check: does repo exist under username?
  const repoUrl = `https://api.github.com/repos/${username}/${REPO}`;
  const repoResp = await fetch(repoUrl, { headers: GH_HEADERS });

  if (repoResp.ok) {
    const repoData = await repoResp.json();
    if (
      repoData.fork === true &&
      repoData.parent &&
      repoData.parent.full_name.toLowerCase() === `${OWNER}/${REPO}`.toLowerCase()
    ) {
      verifiedUsers.add(username); // store forever
      return true;
    }
  }

  // Fallback: check forks list
  const forksUrl = `https://api.github.com/repos/${OWNER}/${REPO}/forks?per_page=100`;
  const forksResp = await fetch(forksUrl, { headers: GH_HEADERS });
  if (forksResp.ok) {
    const forks = await forksResp.json();
    const found = forks.some(f => f.owner.login.toLowerCase() === username);
    if (found) {
      verifiedUsers.add(username); // store forever
      return true;
    }
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

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
