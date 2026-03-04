export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol = (req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ error: 'symbol required' });

  const key = process.env.FINNHUB_API_KEY;
  if (!key) return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });

  try {
    const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`);
    const d = await r.json();
    if (!d.c || d.c === 0) return res.status(404).json({ error: `No data for ${symbol}` });
    res.status(200).json({
      symbol, price: d.c, change: d.d, changePct: d.dp,
      high: d.h, low: d.l, open: d.o, prevClose: d.pc, timestamp: d.t
    });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
