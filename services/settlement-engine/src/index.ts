/**
 * Settlement Engine — BettaPay Backend
 *
 * Handles settlement processing with fee deduction and audit trail.
 *
 * Endpoints:
 *   GET  /api/settlements         — list all settlements
 *   POST /api/settlements         — create and process a settlement
 */

import { createServer } from 'http';
import { validateEnv } from '@bettapay/validation';

const env = validateEnv(process.env);
const PORT = Number(process.env.PORT ?? '3001');
console.log(`[Settlement Engine] Starting in ${env.NODE_ENV} mode`);

const FEE_BPS = 150; // 1.5% base platform fee

const settlements: any[] = [];

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  console.log(`[Settlement Engine] ${req.method} ${url.pathname}`);

  if (url.pathname === '/api/settlements' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(JSON.stringify({ settlements, total: settlements.length }));
  }

  if (url.pathname === '/api/settlements' && req.method === 'POST') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try {
        const d = JSON.parse(raw);
        const gross = parseFloat(d.amount ?? '0');
        if (gross <= 0) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'amount must be > 0' }));
        }

        const fee = (gross * FEE_BPS) / 10_000;
        const net = gross - fee;

        const record = {
          id: 'set_' + Math.random().toString(36).slice(2, 15),
          merchantId: d.merchantId ?? 'unknown',
          grossAmount: gross.toFixed(2),
          feeAmount: fee.toFixed(2),
          netAmount: net.toFixed(2),
          feeBps: FEE_BPS,
          asset: d.asset ?? 'USDC',
          status: 'completed',
          contractRef: process.env.SETTLEMENT_CONTRACT_ID ?? null,
          createdAt: new Date().toISOString(),
        };

        settlements.unshift(record);
        res.writeHead(201);
        return res.end(JSON.stringify(record));
      } catch (err: any) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Invalid payload', message: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[Settlement Engine] Listening on port ${PORT}`);
});
