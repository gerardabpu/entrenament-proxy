module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const token = process.env.GITHUB_TOKEN;
  const anthropic = process.env.ANTHROPIC_API_KEY;
  return res.status(200).json({
    GITHUB_TOKEN: token ? `present (${token.length} chars, starts: ${token.substring(0,8)}...)` : 'MISSING',
    ANTHROPIC_API_KEY: anthropic ? `present (${anthropic.length} chars)` : 'MISSING',
    env_keys: Object.keys(process.env).filter(k => !k.startsWith('npm_')).sort()
  });
}
