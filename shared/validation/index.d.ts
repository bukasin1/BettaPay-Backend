import { z } from 'zod';
export declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodEffects<z.ZodString, number, string>>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    STELLAR_RPC_URL: z.ZodOptional<z.ZodString>;
    SETTLEMENT_CONTRACT_ID: z.ZodOptional<z.ZodString>;
    GOVERNANCE_CONTRACT_ID: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    STELLAR_RPC_URL?: string | undefined;
    SETTLEMENT_CONTRACT_ID?: string | undefined;
    GOVERNANCE_CONTRACT_ID?: string | undefined;
}, {
    NODE_ENV?: "development" | "production" | "test" | undefined;
    PORT?: string | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
    STELLAR_RPC_URL?: string | undefined;
    SETTLEMENT_CONTRACT_ID?: string | undefined;
    GOVERNANCE_CONTRACT_ID?: string | undefined;
}>;
export type Env = z.infer<typeof EnvSchema>;
export declare function validateEnv(env: Record<string, unknown>): Env;
export declare const idSchema: z.ZodString;
export declare const isoDateString: z.ZodEffects<z.ZodString, string, string>;
export declare const paymentSchema: z.ZodObject<{
    id: z.ZodString;
    merchantId: z.ZodString;
    payerId: z.ZodOptional<z.ZodString>;
    amount: z.ZodString;
    asset: z.ZodString;
    status: z.ZodEnum<["initiated", "completed", "failed", "cancelled"]>;
    createdAt: z.ZodEffects<z.ZodString, string, string>;
    reference: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "initiated" | "completed" | "failed" | "cancelled";
    id: string;
    merchantId: string;
    amount: string;
    asset: string;
    createdAt: string;
    payerId?: string | undefined;
    reference?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    status: "initiated" | "completed" | "failed" | "cancelled";
    id: string;
    merchantId: string;
    amount: string;
    asset: string;
    createdAt: string;
    payerId?: string | undefined;
    reference?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const settlementSchema: z.ZodObject<{
    id: z.ZodString;
    merchantId: z.ZodString;
    totalAmount: z.ZodString;
    asset: z.ZodString;
    initiatedAt: z.ZodEffects<z.ZodString, string, string>;
    completedAt: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    status: z.ZodEnum<["pending", "processing", "completed", "failed"]>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "completed" | "failed" | "pending" | "processing";
    id: string;
    merchantId: string;
    asset: string;
    totalAmount: string;
    initiatedAt: string;
    metadata?: Record<string, any> | undefined;
    completedAt?: string | undefined;
}, {
    status: "completed" | "failed" | "pending" | "processing";
    id: string;
    merchantId: string;
    asset: string;
    totalAmount: string;
    initiatedAt: string;
    metadata?: Record<string, any> | undefined;
    completedAt?: string | undefined;
}>;
export declare const fxQuoteSchema: z.ZodObject<{
    id: z.ZodString;
    fromCurrency: z.ZodString;
    toCurrency: z.ZodString;
    rate: z.ZodString;
    expiresAt: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: string;
    expiresAt: string;
}, {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: string;
    expiresAt: string;
}>;
export type Payment = z.infer<typeof paymentSchema>;
export type Settlement = z.infer<typeof settlementSchema>;
export type FXQuote = z.infer<typeof fxQuoteSchema>;
//# sourceMappingURL=index.d.ts.map