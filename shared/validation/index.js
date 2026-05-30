// BettaPay Backend — Shared Validation
// Collapsed from packages/validation — single file, no workspace imports needed
import { z } from 'zod';
// ── Environment ─────────────────────────────────────────────────────────────
export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform((s) => parseInt(s, 10)).default('3000'),
    DATABASE_URL: z.string().url().optional(),
    REDIS_URL: z.string().optional(),
    STELLAR_RPC_URL: z.string().optional(),
    SETTLEMENT_CONTRACT_ID: z.string().optional(),
    GOVERNANCE_CONTRACT_ID: z.string().optional(),
});
export function validateEnv(env) {
    try {
        return EnvSchema.parse(env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
            throw new Error(`Invalid environment variables:\n${message}`);
        }
        throw error;
    }
}
// ── Domain schemas ───────────────────────────────────────────────────────────
export const idSchema = z.string().min(1);
export const isoDateString = z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'Invalid ISO date string',
});
export const paymentSchema = z.object({
    id: idSchema,
    merchantId: idSchema,
    payerId: idSchema.optional(),
    amount: z.string(),
    asset: z.string(),
    status: z.enum(['initiated', 'completed', 'failed', 'cancelled']),
    createdAt: isoDateString,
    reference: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});
export const settlementSchema = z.object({
    id: idSchema,
    merchantId: idSchema,
    totalAmount: z.string(),
    asset: z.string(),
    initiatedAt: isoDateString,
    completedAt: isoDateString.optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    metadata: z.record(z.any()).optional(),
});
export const fxQuoteSchema = z.object({
    id: idSchema,
    fromCurrency: z.string(),
    toCurrency: z.string(),
    rate: z.string(),
    expiresAt: isoDateString,
});
//# sourceMappingURL=index.js.map