export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sym } = req.query;
  if (!sym) return res.status(400).json({ error: 'No symbol' });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error('Yahoo HTTP ' + r.status);
    const j = await r.json();
    const m = j?.chart?.result?.[0]?.meta;
    if (m && m.regularMarketPrice > 0) {
      const pc = m.previousClose || m.chartPreviousClose || m.regularMarketPrice;
      const ch = m.regularMarketPrice - pc;
      const pct = pc ? (ch / pc * 100) : 0;
      return res.json({
        symbol: sym,
        price: m.regularMarketPrice.toFixed(2),
        change: ch.toFixed(2),
        changePct: pct.toFixed(2),
        currency: m.currency || 'USD',
        ok: true
      });
    }
    throw new Error('No price data');
  } catch (e) {
    return res.status(500).json({ error: e.message, ok: false });
  }
}
