// Shared Type Definitions for BettaPay — single source of truth for TS types

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ID = string;

export interface User {
  id: ID;
  email: string;
  displayName?: string;
  createdAt: string; // ISO
  metadata?: Record<string, Json>;
}

export interface Merchant {
  id: ID;
  name: string;
  ownerId: ID; // user id
  createdAt: string;
  settings?: Record<string, Json>;
}

export interface Wallet {
  id: ID;
  ownerId: ID; // user or merchant
  address: string; // Stellar public key
  asset: string; // e.g. USDC
  balance: string; // string representation to preserve precision
}

export type Currency = string;

export interface Transaction {
  id: ID;
  type: 'payment' | 'settlement' | 'anchor_transfer' | 'fx';
  amount: string;
  asset: string;
  from: string | null;
  to: string | null;
  createdAt: string;
  metadata?: Record<string, Json>;
}

export interface Payment {
  id: ID;
  merchantId: ID;
  payerId?: ID;
  amount: string;
  asset: string;
  status: 'initiated' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  reference?: string;
  metadata?: Record<string, Json>;
}

export interface Settlement {
  id: ID;
  merchantId: ID;
  totalAmount: string;
  asset: string;
  initiatedAt: string;
  completedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, Json>;
}

export interface FXQuote {
  id: ID;
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: string; // decimal as string
  expiresAt: string;
}

export interface BillPayment {
  id: ID;
  merchantId: ID;
  amount: string;
  asset: string;
  billerReference: string;
  status: 'initiated' | 'paid' | 'failed';
  createdAt: string;
}

export interface AnchorTransfer {
  id: ID;
  anchorName: string;
  amount: string;
  asset: string;
  externalReference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// Event payloads
export type EventType =
  | 'PaymentInitiated'
  | 'PaymentCompleted'
  | 'SettlementTriggered'
  | 'FXExecuted'
  | 'BillPaid'
  | 'AnchorSettled';

export interface BaseEvent<P = any> {
  id: ID;
  type: EventType;
  occurredAt: string;
  payload: P;
}

export type PaymentInitiatedPayload = {
  payment: Payment;
};
export type PaymentCompletedPayload = { payment: Payment; transaction: Transaction };
export type SettlementTriggeredPayload = { settlement: Settlement };
export type FXExecutedPayload = { quote: FXQuote; transaction: Transaction };
export type BillPaidPayload = { billPayment: BillPayment };
export type AnchorSettledPayload = { anchorTransfer: AnchorTransfer };

export type EventPayloads =
  | BaseEvent<PaymentInitiatedPayload>
  | BaseEvent<PaymentCompletedPayload>
  | BaseEvent<SettlementTriggeredPayload>
  | BaseEvent<FXExecutedPayload>
  | BaseEvent<BillPaidPayload>
  | BaseEvent<AnchorSettledPayload>;

export const EVENT_TYPES = [
  'PaymentInitiated',
  'PaymentCompleted',
  'SettlementTriggered',
  'FXExecuted',
  'BillPaid',
  'AnchorSettled'
] as const;
