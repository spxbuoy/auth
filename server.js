// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Replace with your main repo details
const OWNER = "spider660";   // your GitHub username (the repo owner)
const REPO = "Spider-bot";   // your repo name

// Needed to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API endpoint to check fork
app.get("/api/check-fork", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.json({ success: false, error: "No username provided" });

  try {
    // ✅ Owner should always be allowed
    if (username.toLowerCase() === OWNER.toLowerCase()) {
      return res.json({ success: true, owner: true });
    }

    // ✅ Check if fork exists
    const response = await fetch(`https://api.github.com/repos/${username}/${REPO}`);
    if (response.status === 200) {
      return res.json({ success: true, owner: false });
    } else {
      return res.json({ success: false, error: "No fork found" });
    }
  } catch (err) {
    console.error("Error checking fork:", err);
    return res.json({ success: false, error: "Server error" });
  }
});

// Serve your index.html directly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
