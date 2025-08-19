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

// ✅ Improved check: directly see if user owns a fork
async function hasUserForked(username) {
  if (!username) return false;

  if (username.toLowerCase() === OWNER.toLowerCase()) {
    return true; // original owner always passes
  }

  const url = `https://api.github.com/repos/${username}/${REPO}`;
  const resp = await fetch(url, { headers: GH_HEADERS });

  if (resp.status === 200) {
    const repoData = await resp.json();

    // confirm it's actually a fork of the original
    return repoData.fork && repoData.parent?.full_name?.toLowerCase() === `${OWNER}/${REPO}`.toLowerCase();
  }

  return false;
}

app.get("/api/check-fork", async (req, res) => {
  const { username } = req.query;
  if (!username) return res.json({ success: false, error: "No username provided" });

  try {
    const forked = await hasUserForked(username.trim());
    res.json({ success: forked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
