/**
 * FX Engine — BettaPay Backend
 *
 * Provides exchange rate quotes for currency pairs.
 * Supports USDC, EURT, and NGN with mock rates.
 *
 * Endpoints:
 *   GET /api/rates               — all live rates
 *   GET /api/quote?from=&to=&amount= — FX quote
 */

import { createServer } from 'http';
import { validateEnv } from '@bettapay/validation';

const env = validateEnv(process.env);
const PORT = Number(process.env.PORT ?? '3002');
console.log(`[FX Engine] Starting in ${env.NODE_ENV} mode`);

const rates: Record<string, number> = {
  USDC: 1545.50,
  EURT: 1680.20,
  NGN: 1.0,
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  const { pathname } = url;
  const { method } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  console.log(`[FX Engine] ${method} ${pathname}`);

  try {
    if (pathname === '/api/rates' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ rates, updatedAt: new Date().toISOString() }));
    }

    if (pathname === '/api/quote' && method === 'GET') {
      const from   = url.searchParams.get('from') ?? 'USDC';
      const to     = url.searchParams.get('to') ?? 'NGN';
      const amount = parseFloat(url.searchParams.get('amount') ?? '1');

      if (!rates[from] || !rates[to]) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Unsupported currency pair' }));
      }

      const amountInNgn  = amount * rates[from];
      const targetAmount = amountInNgn / rates[to];
      const exchangeRate = rates[from] / rates[to];

      res.writeHead(200);
      return res.end(JSON.stringify({
        from, to,
        amount: amount.toString(),
        result: targetAmount.toFixed(4),
        rate: exchangeRate.toFixed(4),
        slippageLimit: '0.005',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }));
    }

    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Not found' }));
  } catch (err: any) {
    console.error('[FX Engine] Error:', err);
    res.writeHead(500);
    return res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[FX Engine] Listening on port ${PORT}`);
});
