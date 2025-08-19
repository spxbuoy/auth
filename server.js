import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const OWNER = "spider660";   // Repo owner
const REPO = "Spider-bot";   // Repo name

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GH_HEADERS = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "fork-checker"
};

// Check if user forked the repo
async function hasUserForked(username) {
  try {
    // Check if user has a repo with same name
    const url = `https://api.github.com/repos/${username}/${REPO}`;
    const resp = await fetch(url, { headers: GH_HEADERS });
    if (!resp.ok) return false;

    const data = await resp.json();

    // Must be fork of OWNER/REPO
    return (
      data.fork === true &&
      data.parent?.full_name?.toLowerCase() === `${OWNER}/${REPO}`.toLowerCase()
    );
  } catch (err) {
    console.error("Error checking fork:", err);
    return false;
  }
}

// API endpoint
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

// Serve static files (so index.html + CSS/images work)
app.use(express.static(__dirname));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
