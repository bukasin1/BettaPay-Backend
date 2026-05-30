/**
 * API Gateway — BettaPay Backend
 *
 * Unified REST entry point for the BettaPay platform.
 * Handles merchant registration, payment sessions, and settlement requests.
 *
 * Endpoints:
 *   GET  /api/health               — liveness probe
 *   POST /api/merchants            — register merchant
 *   GET  /api/merchants/:id        — fetch merchant
 *   POST /api/payments             — initiate payment session
 *   GET  /api/payments/:id         — fetch payment session
 *   POST /api/settlements          — trigger settlement
 *   GET  /api/deployments          — Soroban contract addresses (testnet)
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { validateEnv } from '@bettapay/validation';

const env = validateEnv(process.env);
const PORT = Number(process.env.PORT ?? '3000');

// ── In-memory store (replace with DB in production) ──────────────────────────

const db = {
  merchants: new Map<string, any>(),
  payments:  new Map<string, any>(),
  settlements: new Map<string, any>(),
};

// Seed admin merchant
db.merchants.set('GCCHHKNI7GRA5QWC7RCTT3OHO7SKAUMKQA6IBWEQEO2SXI3GF376UHDD', {
  id: 'GCCHHKNI7GRA5QWC7RCTT3OHO7SKAUMKQA6IBWEQEO2SXI3GF376UHDD',
  name: 'BettaPay Merchant LLC',
  ownerId: 'admin-user-001',
  createdAt: new Date().toISOString(),
  settings: { preferredAsset: 'USDC', autoSettle: true },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function body(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => { s += c; });
    req.on('end', () => resolve(s));
    req.on('error', reject);
  });
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function uid(prefix: string) {
  return prefix + '_' + Math.random().toString(36).slice(2, 15);
}

// ── Server ───────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const url  = new URL(req.url ?? '', `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  console.log(`[API Gateway] ${method} ${path}`);

  try {
    // Health
    if (path === '/api/health' && method === 'GET')
      return json(res, 200, { status: 'healthy', env: env.NODE_ENV });

    // Merchants
    if (path === '/api/merchants' && method === 'POST') {
      const d = JSON.parse(await body(req));
      if (!d.id || !d.name) return json(res, 400, { error: 'id and name required' });
      db.merchants.set(d.id, { ...d, createdAt: new Date().toISOString() });
      return json(res, 201, { success: true, merchant: d });
    }

    if (path.startsWith('/api/merchants/') && method === 'GET') {
      const id = path.split('/').at(-1)!;
      const m = db.merchants.get(id);
      return m ? json(res, 200, m) : json(res, 404, { error: 'Merchant not found' });
    }

    // Payments
    if (path === '/api/payments' && method === 'POST') {
      const d = JSON.parse(await body(req));
      if (!d.merchantId || !d.amount || !d.asset)
        return json(res, 400, { error: 'merchantId, amount, asset required' });
      const payment = { id: uid('pay'), ...d, status: 'initiated', createdAt: new Date().toISOString() };
      db.payments.set(payment.id, payment);
      return json(res, 201, payment);
    }

    if (path.startsWith('/api/payments/') && method === 'GET') {
      const id = path.split('/').at(-1)!;
      const p = db.payments.get(id);
      return p ? json(res, 200, p) : json(res, 404, { error: 'Payment not found' });
    }

    // Settlements
    if (path === '/api/settlements' && method === 'POST') {
      const d = JSON.parse(await body(req));
      if (!d.merchantId || !d.amount || !d.asset)
        return json(res, 400, { error: 'merchantId, amount, asset required' });
      const settlement = { id: uid('set'), ...d, status: 'pending', initiatedAt: new Date().toISOString() };
      db.settlements.set(settlement.id, settlement);
      return json(res, 201, settlement);
    }

    // Contract deployments
    if (path === '/api/deployments' && method === 'GET') {
      return json(res, 200, {
        network: 'Test SDF Network ; September 2015',
        adminAddress: 'GCCHHKNI7GRA5QWC7RCTT3OHO7SKAUMKQA6IBWEQEO2SXI3GF376UHDD',
        contracts: [
          {
            name: 'Settlement contract',
            contractId: process.env.SETTLEMENT_CONTRACT_ID ?? 'CC74K4KWT4ZSTDBGEYM2LT2N4H6R2HV7VA5HEWUQVPMHVDPL44EQSCNM',
            explorerUrl: 'https://lab.stellar.org/r/testnet/contract/CC74K4KWT4ZSTDBGEYM2LT2N4H6R2HV7VA5HEWUQVPMHVDPL44EQSCNM',
          },
          {
            name: 'Governance contract',
            contractId: process.env.GOVERNANCE_CONTRACT_ID ?? 'CATDQJ4O24SOWJHJFHA4GZCVBFSAAELJ62FXI7XSAMNQ753BOWHIM3LJ',
            explorerUrl: 'https://lab.stellar.org/r/testnet/contract/CATDQJ4O24SOWJHJFHA4GZCVBFSAAELJ62FXI7XSAMNQ753BOWHIM3LJ',
          },
        ],
        updatedAt: new Date().toISOString(),
      });
    }

    return json(res, 404, { error: 'Not found' });

  } catch (err: any) {
    console.error('[API Gateway] Error:', err);
    return json(res, 500, { error: 'Internal Server Error', message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT} (${env.NODE_ENV})`);
});
