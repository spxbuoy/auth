import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API route
app.get("/check", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: "No username" });
  }

  const owner = "spider660"; // your GitHub username
  const repo = "Spider-bot"; // repo name

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/forks`);
    const forks = await response.json();

    const forked = forks.some(
      (fork) => fork.owner.login.toLowerCase() === username.toLowerCase()
    );

    if (forked) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
