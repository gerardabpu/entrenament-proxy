const REPO = 'gerardabpu/Entrenament';
const FILE = 'data/app-data.json';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  async function getFile() {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'entrenament-app'
      }
    });
    if (r.status === 404) return null;
    const d = await r.json();
    const content = JSON.parse(Buffer.from(d.content, 'base64').toString('utf-8'));
    return { sha: d.sha, content };
  }

  if (req.method === 'GET') {
    try {
      const result = await getFile();
      return res.status(200).json({ data: result ? result.content : null });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { data } = req.body;
      if (!data) return res.status(400).json({ error: 'Missing data' });
      const existing = await getFile();
      const content = Buffer.from(JSON.stringify(data)).toString('base64');
      const body = {
        message: `sync: ${new Date().toISOString()}`,
        content,
        ...(existing ? { sha: existing.sha } : {})
      };
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'entrenament-app'
        },
        body: JSON.stringify(body)
      });
      if (!r.ok) return res.status(r.status).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
