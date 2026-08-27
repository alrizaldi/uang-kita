export const summary = {
  totalBalance: 12500000,
  monthlyIncome: 10000000,
  monthlyExpense: 6800000,
};

export const cashFlowByMonth = [
  { month: "Jun", income: 9200000, expense: 6400000 },
  { month: "Jul", income: 9800000, expense: 7100000 },
  { month: "Aug", income: 10000000, expense: 6800000 },
];

export const expenseByCategory = [
  { category: "Food", amount: 1800000 },
  { category: "Housing", amount: 2000000 },
  { category: "Transportation", amount: 800000 },
  { category: "Shopping", amount: 700000 },
  { category: "Utilities", amount: 650000 },
  { category: "Other", amount: 850000 },
];

export const budgets = [
  { category: "Food", limit: 2500000, spent: 1800000 },
  { category: "Housing", limit: 2500000, spent: 2100000 },
  { category: "Transportation", limit: 1000000, spent: 600000 },
  { category: "Shopping", limit: 750000, spent: 712500 },
  { category: "Utilities", limit: 600000, spent: 660000 },
];

export const upcomingBills = [
  { dueDate: "29 Aug", name: "Electricity", amount: 450000 },
  { dueDate: "01 Sep", name: "Internet", amount: 350000 },
  { dueDate: "05 Sep", name: "House Loan", amount: 3200000 },
  { dueDate: "15 Sep", name: "Insurance", amount: 750000 },
];

export const goals = [
  {
    name: "Emergency Fund",
    currentAmount: 18500000,
    targetAmount: 30000000,
    targetDate: "2027-05-31",
  },
  {
    name: "Family Vacation",
    currentAmount: 4500000,
    targetAmount: 10000000,
    targetDate: "2027-01-31",
  },
];

export const accounts = [
  {
    name: "BCA",
    type: "BANK",
    owner: "Family",
    currency: "IDR",
    openingBalance: 10000000,
    currentBalance: 12500000,
    isPrimary: true,
  },
  {
    name: "Cash Wallet",
    type: "CASH",
    owner: "Rizaldi",
    currency: "IDR",
    openingBalance: 500000,
    currentBalance: 700000,
    isPrimary: false,
  },
];

export const transactions = [
  {
    date: "27 Aug 2026",
    type: "EXPENSE",
    category: "Food",
    account: "BCA",
    member: "Rizaldi",
    description: "Lunch",
    amount: 150000,
  },
  {
    date: "26 Aug 2026",
    type: "EXPENSE",
    category: "Utilities",
    account: "BCA",
    member: "Mother",
    description: "Electricity bill",
    amount: 450000,
  },
  {
    date: "25 Aug 2026",
    type: "INCOME",
    category: "Salary",
    account: "BCA",
    member: "Rizaldi",
    description: "August salary",
    amount: 10000000,
  },
  {
    date: "24 Aug 2026",
    type: "TRANSFER",
    category: "Transfer",
    account: "BCA -> Stockbit",
    member: "Rizaldi",
    description: "Investment allocation",
    amount: 2000000,
  },
];

export const familyMembers = [
  { name: "Father", role: "OWNER", hasLogin: true, isActive: true },
  { name: "Mother", role: "MEMBER", hasLogin: false, isActive: true },
  { name: "Rizaldi", role: "MEMBER", hasLogin: true, isActive: true },
  { name: "Sibling", role: "VIEWER", hasLogin: false, isActive: true },
];

export const monthlyTrend = [
  { month: "Jan", income: 10000000, expense: 7000000 },
  { month: "Feb", income: 11000000, expense: 8000000 },
  { month: "Mar", income: 12000000, expense: 7500000 },
  { month: "Apr", income: 11200000, expense: 7600000 },
  { month: "May", income: 11800000, expense: 8100000 },
  { month: "Jun", income: 9200000, expense: 6400000 },
  { month: "Jul", income: 9800000, expense: 7100000 },
  { month: "Aug", income: 10000000, expense: 6800000 },
];
