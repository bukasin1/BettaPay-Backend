import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development','production','test']).default('development'),
  PORT: z.string().transform((s) => parseInt(s, 10)).default('3000'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional()
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function parseBaseEnv(raw: Record<string,string|undefined>){
  return baseEnvSchema.parse(raw);
}
