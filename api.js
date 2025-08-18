export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ success: false, message: "No username" });
  }

  const owner = "spider660"; // your GitHub
  const repo = "Spider-bot"; // repo they must fork

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/forks`);
    const forks = await response.json();

    const forked = forks.some(fork => fork.owner.login.toLowerCase() === username.toLowerCase());

    if (forked) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
