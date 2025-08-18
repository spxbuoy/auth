import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve index.html directly
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API to check fork/owner
app.get("/check", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: "No username provided" });
  }

  const owner = "spider660";   // original repo owner
  const repo = "Spider-bot";   // repo name

  try {
    // ✅ If the username is the owner → success
    if (username.toLowerCase() === owner.toLowerCase()) {
      return res.json({ success: true, owner: true });
    }

    // Otherwise, check forks
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/forks`);

    if (!response.ok) {
      return res.status(500).json({ success: false, error: "GitHub API error" });
    }

    const forks = await response.json();

    const forked = forks.some(
      (fork) => fork.owner.login.toLowerCase() === username.toLowerCase()
    );

    if (forked) {
      res.json({ success: true, fork: true });
    } else {
      res.json({ success: false, fork: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
