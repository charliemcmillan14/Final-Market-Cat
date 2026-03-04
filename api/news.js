export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  const days   = Math.min(parseInt(req.query.days || '7'), 30);
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const key = process.env.FINNHUB_API_KEY;
  if (!key) return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });

  const to   = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  try {
    const r = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${key}`);
    const data = await r.json();
    if (!Array.isArray(data)) return res.status(200).json({ symbol, articles: [] });
    const articles = data
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 20)
      .map(a => ({ headline: a.headline, summary: a.summary, url: a.url, source: a.source, datetime: a.datetime, image: a.image || null }));
    res.status(200).json({ symbol, articles });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
