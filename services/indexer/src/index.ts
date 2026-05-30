/**
 * Indexer Service — BettaPay Backend
 *
 * Listens to Soroban contract event streams and indexes payment/settlement events.
 * In production, this polls the Stellar RPC for contract events.
 *
 * Endpoints:
 *   GET /api/events              — list indexed events (newest first, max 50)
 *   GET /api/health              — liveness probe
 */

import { createServer } from 'http';
import { validateEnv } from '@bettapay/validation';

const env = validateEnv(process.env);
const PORT = Number(process.env.PORT ?? '3003');

const SETTLEMENT_CONTRACT_ID =
  process.env.SETTLEMENT_CONTRACT_ID ?? 'CC74K4KWT4ZSTDBGEYM2LT2N4H6R2HV7VA5HEWUQVPMHVDPL44EQSCNM';

const GOVERNANCE_CONTRACT_ID =
  process.env.GOVERNANCE_CONTRACT_ID ?? 'CATDQJ4O24SOWJHJFHA4GZCVBFSAAELJ62FXI7XSAMNQ753BOWHIM3LJ';

console.log(`[Indexer] Starting in ${env.NODE_ENV} mode`);
console.log(`[Indexer] Watching settlement:  ${SETTLEMENT_CONTRACT_ID}`);
console.log(`[Indexer] Watching governance:  ${GOVERNANCE_CONTRACT_ID}`);

// In-memory event ring buffer (50 events max)
const events: any[] = [];

function pushEvent(topic: string, contractId: string, data: Record<string, unknown>) {
  const event = {
    id: 'evt_' + Math.random().toString(36).slice(2, 15),
    contractId,
    topic,
    ...data,
    indexedAt: new Date().toISOString(),
  };
  events.unshift(event);
  if (events.length > 50) events.pop();
  console.log(`[Indexer] ${topic} — ${event.id}`);
  return event;
}

// HTTP API
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (url.pathname === '/api/health') {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: 'ok', indexedEvents: events.length }));
  }

  if (url.pathname === '/api/events') {
    res.writeHead(200);
    return res.end(JSON.stringify({ events, total: events.length }));
  }

  res.writeHead(404);
  return res.end(JSON.stringify({ error: 'Not found' }));
});

// Simulate polling Stellar RPC for contract events
const TOPICS = ['payment', 'split', 'set_rule', 'merchant', 'fee_cfg', 'anchor_up'];

setInterval(() => {
  if (Math.random() > 0.65) {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const isGovernance = topic === 'fee_cfg' || topic === 'anchor_up';
    pushEvent(topic, isGovernance ? GOVERNANCE_CONTRACT_ID : SETTLEMENT_CONTRACT_ID, {
      merchant: 'GCCHHKNI7GRA5QWC7RCTT3OHO7SKAUMKQA6IBWEQEO2SXI3GF376UHDD',
      amount: (Math.random() * 500 + 10).toFixed(2),
      asset: 'USDC',
    });
  }
}, 10_000);

server.listen(PORT, () => {
  console.log(`[Indexer] Listening on port ${PORT}`);
});
