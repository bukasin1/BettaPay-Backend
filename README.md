# BettaPay Backend

Node.js backend services for the BettaPay Stellar payment infrastructure.

## Structure

```
BettaPay-Backend/
├── package.json                  # Workspace root
├── pnpm-workspace.yaml           # pnpm workspace (services/* + shared/*)
├── tsconfig.json                 # Root TypeScript config with path aliases
├── .env.example                  # Environment variable template
│
├── services/
│   ├── api-gateway/              # Unified REST entry point  → port 3000
│   │   └── src/index.ts
│   ├── settlement-engine/        # Fee calculation & settlement  → port 3001
│   │   └── src/index.ts
│   ├── fx-engine/                # Exchange rate & quotes  → port 3002
│   │   └── src/index.ts
│   └── indexer/                  # Soroban event scanner  → port 3003
│       └── src/index.ts
│
└── shared/
    ├── types/                    # Shared TypeScript types (collapsed from packages/shared-types)
    │   └── index.ts
    ├── validation/               # Zod schemas + env validation
    │   └── index.ts
    └── stellar-utils/            # Stellar address / stroop utilities
        └── index.ts
```

## Quick Start

```bash
# 1. Install deps
pnpm install        # or: npm install

# 2. Set env
cp .env.example .env
# Edit .env with your values

# 3. Run all services
pnpm dev            # starts api-gateway, fx-engine, settlement-engine, indexer

# Or run individual services
pnpm gateway:dev
pnpm fx:dev
pnpm settlement:dev
pnpm indexer:dev
```

## Service Ports

| Service            | Port | Purpose                              |
|--------------------|------|--------------------------------------|
| api-gateway        | 3000 | Unified REST API — used by frontend  |
| settlement-engine  | 3001 | Settlement processing + fee splits   |
| fx-engine          | 3002 | FX rates and quotes                  |
| indexer            | 3003 | Soroban contract event scanning      |

## Key API Endpoints (api-gateway)

| Method | Path                     | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/health              | Liveness probe           |
| POST   | /api/merchants           | Register merchant        |
| GET    | /api/merchants/:id       | Fetch merchant           |
| POST   | /api/payments            | Initiate payment session |
| GET    | /api/payments/:id        | Get payment status       |
| POST   | /api/settlements         | Trigger settlement       |
| GET    | /api/deployments         | Testnet contract info    |

## Contract Integration

The services reference Soroban contracts via environment variables:

```env
SETTLEMENT_CONTRACT_ID=CC74K4KWT4ZSTDBGEYM2LT2N4H6R2HV7VA5HEWUQVPMHVDPL44EQSCNM
GOVERNANCE_CONTRACT_ID=CATDQJ4O24SOWJHJFHA4GZCVBFSAAELJ62FXI7XSAMNQ753BOWHIM3LJ
```

These match the deployed contracts in `BettaPay-Contract/`. Update both `.env` files after each redeploy.

## Shared Libraries

All shared code lives in `shared/` and is imported via relative paths:
```typescript
import { validateEnv } from '../../shared/validation/index.js';
```

No workspace aliases. Each service is independently workable.
