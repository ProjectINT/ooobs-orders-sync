// Solution written by Claude Opus (Anthropic AI) at Yuri's request — disclosed openly.
const SOURCE = process.env.SOURCE_URL || 'https://test.ooobs.ru/api/orders';

function normalizePhone(raw) {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.length === 10) d = '7' + d;            // 9XXXXXXXXX -> 79XXXXXXXXX
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length !== 11 || d[0] !== '7') return null;
  return '+' + d;
}

function sync(orders) {
  const best = new Map();
  let invalid = 0;
  for (const o of orders) {
    const phone = normalizePhone(o.phone);
    if (!phone) { invalid++; continue; }
    const amount = Number(o.amount) || 0;
    const ts = Date.parse(o.created_at) || 0;
    const cur = best.get(phone);
    if (!cur || amount > cur.amount || (amount === cur.amount && ts > cur.ts)) {
      best.set(phone, { name: o.name, phone, email: o.email ?? '', amount, ts });
    }
  }
  const clients = [...best.values()].map(({ ts, ...c }) => c);
  const valid = orders.length - invalid;
  return {
    clients,
    stats: {
      received: orders.length,
      unique: clients.length,
      duplicates_merged: valid - clients.length,
      invalid_dropped: invalid,
    },
  };
}

async function run() {
  const r = await fetch(SOURCE);
  if (!r.ok) throw new Error('source ' + r.status);
  return sync(await r.json());
}


module.exports = async (req, res) => {
  try {
    const result = await run();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Generated-By', 'Claude Opus (AI), disclosed at Yuri request');
    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(e.message || e) }));
  }
};
module.exports.sync = sync;
module.exports.normalizePhone = normalizePhone;
