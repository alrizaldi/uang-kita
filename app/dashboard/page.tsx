'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { getFamilyAccounts } from '@/lib/services/accountService';
import { getFamilyTransactions } from '@/lib/services/transactionService';
import { getFamilyBudgets } from '@/lib/services/budgetService';
import { Account, Transaction, Budget } from '@/types';

// Define extended types for the dashboard
interface ExtendedTransaction extends Transaction {
  account_name?: string;
  category_name?: string;
  category_type?: string;
}

interface ExtendedBudget extends Budget {
  category_name?: string;
  spent?: number;
  remaining?: number;
}

export default function DashboardPage() {
  const { session, family, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [budgets, setBudgets] = useState<ExtendedBudget[]>([]);
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
        getFamilyAccounts(family!.id),
        getFamilyTransactions(family!.id),
        getFamilyBudgets(family!.id)
      ]);

      // Check for errors in the responses
      if (accountsRes.error) {
        console.error('Error loading accounts:', accountsRes.error);
        setAccounts([]);
      } else {
        setAccounts(accountsRes.accounts);
      }

      if (transactionsRes.error) {
        console.error('Error loading transactions:', transactionsRes.error);
        setTransactions([]);
      } else {
        setTransactions(transactionsRes.transactions);
      }

      if (budgetsRes.error) {
        console.error('Error loading budgets:', budgetsRes.error);
        setBudgets([]);
      } else {
        // Calculate spent amounts for each budget based on transactions
        const budgetsWithCalculations = budgetsRes.budgets.map(budget => {
          // Find transactions that match this budget's category
          const relatedTransactions = transactionsRes.transactions.filter(transaction => 
            transaction.category_id === budget.category_id && 
            transaction.transaction_type === 'expense'
          );
          
          // Sum up the amounts of these transactions
          const spent = relatedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
          
          return {
            ...budget,
            spent: Math.abs(spent), // Make sure spent is positive
            remaining: budget.amount - Math.abs(spent)
          };
        });
        setBudgets(budgetsWithCalculations);
      }
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
      if (!t.transaction_date) return false;
      const transDate = new Date(t.transaction_date);
      return t.transaction_type === 'expense' && 
             transDate.getMonth() === currentMonth && 
             transDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate remaining budget
  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
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
                      <p className="text-sm font-medium text-gray-900">{transaction.description || 'N/A'}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'} 
                        • {transaction.category_name || 'N/A'}
                      </p>
                    </div>
                    <p className={`text-sm font-medium ${
                      transaction.transaction_type === 'income' ? 'text-green-600' : 
                      transaction.transaction_type === 'expense' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : 
                       transaction.transaction_type === 'expense' ? '-' : ''} 
                      Rp {Math.abs(transaction.amount).toLocaleString('id-ID')}
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
                  const percentage = Math.min(100, ((budget.spent || 0) / budget.amount) * 100);
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{budget.category_name || 'N/A'}</span>
                        <span className="text-sm font-medium text-gray-700">
                          Rp {(budget.spent || 0).toLocaleString('id-ID')} / Rp {budget.amount.toLocaleString('id-ID')}
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