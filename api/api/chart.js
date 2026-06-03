bash

cat /mnt/user-data/outputs/stocklens-app/api/chart.js
Ausgabe

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sym } = req.query;
  if (!sym) return res.status(400).json({ error: 'No symbol' });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1wk&range=1y`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    const result = j?.chart?.result?.[0];
    if (!result) throw new Error('No data');
    const q = result.indicators?.quote?.[0];
    const ts = result.timestamp;
    if (!q || !ts) throw new Error('No quotes');
    const validIdx = ts.map((t, i) => q.close[i] != null ? i : -1).filter(i => i >= 0);
    return res.json({
      t: validIdx.map(i => ts[i]),
      c: validIdx.map(i => q.close[i]),
      h: validIdx.map(i => q.high[i] || q.close[i]),
      l: validIdx.map(i => q.low[i] || q.close[i]),
      ok: true
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, ok: false });
  }
}
Fertig
