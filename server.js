import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const OWNER = "spider660";
const REPO = "Spider-bot";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GH_HEADERS = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "fork-checker"
};

async function hasUserForked(username) {
  if (username.toLowerCase() === OWNER.toLowerCase()) {
    return true;
  }

  let page = 1;
  while (true) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/forks?per_page=100&page=${page}`;
    const resp = await fetch(url, { headers: GH_HEADERS });
    if (!resp.ok) break;

    const forks = await resp.json();
    if (forks.some(f => f.owner?.login.toLowerCase() === username.toLowerCase())) {
      return true;
    }

    if (!Array.isArray(forks) || forks.length < 100) break;
    page++;
  }

  return false;
}

app.get("/api/check-fork", async (req, res) => {
  const { username } = req.query;
  if (!username) return res.json({ success: false, error: "No username provided" });

  try {
    const forked = await hasUserForked(username);
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
