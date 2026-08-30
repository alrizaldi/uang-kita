'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { getFamilyAccounts } from '@/lib/services/accountService';
import { getFamilyTransactions } from '@/lib/services/transactionService';
import { getFamilyBudgets } from '@/lib/services/budgetService';
import { Account, Transaction, Budget } from '@/types';

export default function DashboardPage() {
  const { session, family, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]); // Using any for now due to extended type from service
  const [budgets, setBudgets] = useState<any[]>([]); // Using any for now due to extended type from service
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace('/auth');
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (family?.id) {
      loadDashboardData();
    }
  }, [family]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data concurrently
      const [accountsRes, transactionsRes, budgetsRes] = await Promise.all([
        // In a real implementation, you would call the service functions
        // For now, we'll use mock data
        new Promise<Account[]>(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: '1',
                family_id: 'family-1',
                name: 'Checking Account',
                type: 'checking',
                institution: 'Bank Mandiri',
                opening_balance: 7500000,
                currency: 'IDR',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: '2',
                family_id: 'family-1',
                name: 'Savings Account',
                type: 'savings',
                institution: 'Bank BCA',
                opening_balance: 15000000,
                currency: 'IDR',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: '3',
                family_id: 'family-1',
                name: 'Credit Card',
                type: 'credit',
                institution: 'Bank BNI',
                opening_balance: -2500000,
                currency: 'IDR',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ]);
          }, 300);
        }),
        new Promise<any[]>(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: '1',
                date: '2024-01-15',
                description: 'Groceries',
                category: 'Food',
                amount: -250000,
                type: 'expense',
                account: 'Checking Account'
              },
              {
                id: '2',
                date: '2024-01-10',
                description: 'Salary',
                category: 'Income',
                amount: 8000000,
                type: 'income',
                account: 'Checking Account'
              },
              {
                id: '3',
                date: '2024-01-08',
                description: 'Electricity Bill',
                category: 'Utilities',
                amount: -150000,
                type: 'expense',
                account: 'Checking Account'
              }
            ]);
          }, 300);
        }),
        new Promise<any[]>(resolve => {
          setTimeout(() => {
            resolve([
              {
                id: '1',
                category: 'Food & Dining',
                allocated: 1500000,
                spent: 1000000,
                remaining: 500000,
                period: 'Monthly'
              },
              {
                id: '2',
                category: 'Transportation',
                allocated: 1000000,
                spent: 750000,
                remaining: 250000,
                period: 'Monthly'
              },
              {
                id: '3',
                category: 'Entertainment',
                allocated: 500000,
                spent: 450000,
                remaining: 50000,
                period: 'Monthly'
              }
            ]);
          }, 300);
        })
      ]);

      setAccounts(accountsRes);
      setTransactions(transactionsRes);
      setBudgets(budgetsRes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => sum + account.opening_balance, 0);
  const recentTransactions = transactions.slice(0, 3);
  
  // Calculate monthly expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = transactions
    .filter(t => {
      const transDate = new Date(t.date);
      return t.type === 'expense' && 
             transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate remaining budget
  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalAllocated - totalSpent;

  if (sessionLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null; // Will be redirected by useEffect
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900">Total Balance</h2>
            <p className="text-3xl font-bold text-gray-900">Rp {totalBalance.toLocaleString('id-ID')}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900">This Month Expenses</h2>
            <p className="text-3xl font-bold text-red-600">Rp {monthlyExpenses.toLocaleString('id-ID')}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900">Remaining Budget</h2>
            <p className="text-3xl font-bold text-green-600">Rp {remainingBudget.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h2>
            <ul className="divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="py-4 flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date} • {transaction.category}</p>
                    </div>
                    <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}Rp {Math.abs(transaction.amount).toLocaleString('id-ID')}
                    </p>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-gray-500">No recent transactions</li>
              )}
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h2>
            <div className="space-y-4">
              {budgets.length > 0 ? (
                budgets.slice(0, 3).map((budget) => {
                  const percentage = Math.min(100, (budget.spent / budget.allocated) * 100);
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                        <span className="text-sm font-medium text-gray-700">
                          Rp {budget.spent.toLocaleString('id-ID')} / Rp {budget.allocated.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage > 90 ? 'bg-red-600' : 
                            percentage > 75 ? 'bg-yellow-500' : 'bg-blue-600'
                          }`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">No budgets configured</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}