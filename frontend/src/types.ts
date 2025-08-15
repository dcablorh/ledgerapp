export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENDITURE';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  userPrefix?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  permission: 'READ' | 'WRITE';
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenditure: number;
  netBalance: number;
  totalTransactions: number;
}