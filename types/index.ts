export type Family = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type FamilyMember = {
  id: string;
  family_id: string;
  user_id: string | null;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Account = {
  id: string;
  family_id: string;
  name: string;
  type: string; // e.g., 'checking', 'savings', 'credit', 'cash'
  institution?: string;
  owner_member_id?: string;
  opening_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  family_id: string;
  name: string;
  type: string; // 'income' or 'expense'
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  family_id: string;
  account_id: string;
  member_id?: string;
  category_id?: string;
  goal_id?: string; // Added for linking transactions to goals
  transaction_type: string; // 'income', 'expense', 'transfer'
  amount: number;
  transaction_date: string; // Date string in YYYY-MM-DD format
  description?: string;
  attachment_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type Transfer = {
  id: string;
  family_id: string;
  source_account_id: string;
  destination_account_id: string;
  amount: number;
  transaction_date: string; // Date string in YYYY-MM-DD format
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type Budget = {
  id: string;
  family_id: string;
  category_id: string;
  amount: number;
  period_type: string; // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
  period_start: string; // Date string in YYYY-MM-DD format
  period_end: string; // Date string in YYYY-MM-DD format
  created_at: string;
  updated_at: string;
};

export type RecurringTransaction = {
  id: string;
  family_id: string;
  account_id: string;
  category_id?: string;
  member_id?: string;
  name: string;
  transaction_type: string; // 'income', 'expense'
  amount: number;
  frequency: string; // 'daily', 'weekly', 'monthly', 'yearly'
  start_date: string; // Date string in YYYY-MM-DD format
  end_date?: string; // Date string in YYYY-MM-DD format
  next_due_date: string; // Date string in YYYY-MM-DD format
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FinancialGoal = {
  id: string;
  family_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string; // Date string in YYYY-MM-DD format
  monthly_target?: number;
  linked_account_id?: string;
  status: string; // 'ACTIVE', 'COMPLETED', 'CANCELLED'
  created_at: string;
  updated_at: string;
};

export type Attachment = {
  id: string;
  family_id: string;
  transaction_id?: string;
  file_name: string;
  storage_path: string;
  mime_type?: string;
  file_size?: number;
  created_at: string;
};