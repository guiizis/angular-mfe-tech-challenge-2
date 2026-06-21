export type TransactionType = 'DEPOSIT' | 'TRANSFER';

export interface FinancialVisibilityTransaction {
  id: number;
  type: TransactionType;
  date: string;
  value: number;
}

export interface FinancialVisibilityData {
  balance: number;
  depositsTotal: number;
  transfersTotal: number;
  transactions: FinancialVisibilityTransaction[];
}
