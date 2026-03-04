export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const symbol     = (req.query.symbol || 'AAPL').toUpperCase();
  const resolution = req.query.resolution || 'D';
  const days       = Math.min(parseInt(req.query.days || '30'), 365);
  const key        = process.env.FINNHUB_API_KEY;
  if (!key) return res.status(500).json({ error: 'FINNHUB_API_KEY not configured' });

  const now  = Math.floor(Date.now() / 1000);
  const from = now - days * 86400;

  try {
    const r = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}&token=${key}`);
    const d = await r.json();
    if (d.s !== 'ok') return res.status(200).json({ symbol, candles: [] });
    const candles = d.t.map((t, i) => ({ time: t, open: d.o[i], high: d.h[i], low: d.l[i], close: d.c[i], volume: d.v[i] }));
    res.status(200).json({ symbol, resolution, candles });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
}
