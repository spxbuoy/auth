import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/check", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: "No username" });
  }

  const owner = "spider660";   // your GitHub username
  const repo = "Spider-bot";   // repo name only

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/forks?per_page=100`);
    
    if (!response.ok) {
      return res.status(500).json({ success: false, error: "GitHub API error" });
    }

    const forks = await response.json();

    const forked = forks.some(
      (fork) => fork.owner.login.toLowerCase() === username.toLowerCase()
    );

    res.json({ success: forked });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
