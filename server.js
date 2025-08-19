// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Your main repo details
const OWNER = "spider660";   // main repo owner
const REPO = "Spider-bot";   // main repo name

// Needed to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API endpoint to check fork
app.get("/api/check-fork", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.json({ success: false, error: "No username provided" });
  }

  try {
    // Get all forks of the main repo
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/forks`);

    if (!response.ok) {
      return res.json({ success: false, error: "GitHub API error" });
    }

    const forks = await response.json();

    // See if the username is among the fork owners
    const forked = forks.some(
      (fork) => fork.owner.login.toLowerCase() === username.toLowerCase()
    );

    if (forked || username.toLowerCase() === OWNER.toLowerCase()) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error("Error checking fork:", err);
    return res.json({ success: false, error: "Server error" });
  }
});

// Serve index.html directly (same folder as server.js)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
