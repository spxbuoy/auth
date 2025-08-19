const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your repo details
const OWNER = "spider660"; 
const REPO = "Spider-bot";

// Serve index.html directly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API route to check fork
app.get("/api/check-fork", async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.json({ success: false, error: "No username provided" });
  }

  try {
    const url = `https://api.github.com/repos/${username}/${REPO}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "fork-checker" }
    });

    if (response.status === 200) {
      // Repo exists under this username → assume it’s forked
      return res.json({ success: true });
    } else {
      // Not found → no fork
      return res.json({ success: false });
    }
  } catch (err) {
    return res.json({ success: false, error: "GitHub API error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
