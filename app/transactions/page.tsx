'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getFamilyTransactions, createTransaction } from '@/lib/services/transactionService';
import { getFamilyAccounts } from '@/lib/services/accountService';
import { getFamilyCategories } from '@/lib/services/categoryService';
import { Transaction, Account, Category } from '@/types';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TransactionsPage() {
  const { session, loading, family } = useSession(); // Destructure family from session context
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: 0,
    transaction_type: 'expense',
    category_id: '',
    account_id: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to load transactions for the current family
  const loadTransactions = async () => {
    if (!family?.id) return; // Guard clause if family is not loaded
    setIsLoading(true);
    try {
      const { transactions: dbTransactions, error } = await getFamilyTransactions(family.id);
      if (error) {
        console.error('Error fetching transactions from DB:', error);
        setTransactions([]);
      } else {
        // Map the fetched data to the format expected by the UI
        // Cast 't' to 'any' to access properties added by the Supabase join query
        const mappedTransactions = dbTransactions.map((t: any) => ({
          id: t.id,
          date: t.transaction_date,
          description: t.description || 'No description',
          category: t.categories?.name || 'Uncategorized', // Safe access on cast 'any' type
          amount: t.transaction_type === 'income' ? t.amount : -t.amount,
          type: t.transaction_type,
          account: t.accounts?.name || 'Unknown Account' // Safe access on cast 'any' type
        }));
        setTransactions(mappedTransactions);
      }
    } catch (error) {
      console.error('Unexpected error loading transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load accounts and categories for the current family
  const loadAccountsAndCategories = async () => {
    if (!family?.id) return;
    try {
      // Fetch both accounts and categories concurrently
      const [accountsRes, categoriesRes] = await Promise.all([
        getFamilyAccounts(family.id),
        getFamilyCategories(family.id)
      ]);

      if (accountsRes.error) {
        console.error('Error fetching accounts:', accountsRes.error);
        setAccounts([]); // Clear state on error
      } else {
        setAccounts(accountsRes.accounts);
      }

      if (categoriesRes.error) {
        console.error('Error fetching categories:', categoriesRes.error);
        setCategories([]); // Clear state on error
      } else {
        setCategories(categoriesRes.categories);
      }
    } catch (error) {
      console.error('Error loading accounts and categories:', error);
    }
  };

  // Effect to run on component mount and when family ID changes
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth'); // Redirect to auth if not logged in
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (family?.id) {
      // Load all necessary data when family ID becomes available
      loadTransactions();
      loadAccountsAndCategories();
    }
  }, [family?.id]); // Dependency array ensures effect runs when family.id changes

  // Handler for creating a new transaction
  const handleCreateTransaction = async () => {
    if (!family?.id || !newTransaction.account_id || !newTransaction.category_id) return;
    setIsSubmitting(true);
    try {
      // Prepare data object for the service call
      // Ensure optional fields like member_id and category_id are undefined if not set, not null
      const transactionData = {
        family_id: family.id,
        account_id: newTransaction.account_id,
        member_id: undefined, // Use undefined instead of null
        category_id: newTransaction.category_id, // This is a string from the form, will be sent if selected
        transaction_type: newTransaction.transaction_type,
        amount: Math.abs(Number(newTransaction.amount)),
        transaction_date: newTransaction.date,
        description: newTransaction.description,
      };

      const { transaction: newDbTransaction, error } = await createTransaction(transactionData);
      if (error) {
        console.error('Error creating transaction in DB:', error);
        // TODO: Show user-friendly error message
      } else {
        // Refresh the list after successful creation
        loadTransactions();
        // Reset form
        setNewTransaction({
          description: '',
          amount: 0,
          transaction_type: 'expense',
          category_id: '',
          account_id: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddDialog(false); // Close dialog
      }
    } catch (error) {
      console.error('Unexpected error creating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null; // Redirect handled by useEffect
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details for your new transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select 
                    value={newTransaction.transaction_type} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, transaction_type: value as 'income' | 'expense'})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newTransaction.category_id}
                    onValueChange={(value) => setNewTransaction({...newTransaction, category_id: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account" className="text-right">
                    Account
                  </Label>
                  <Select
                    value={newTransaction.account_id}
                    onValueChange={(value) => setNewTransaction({...newTransaction, account_id: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateTransaction} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating...' : 'Create Transaction'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading transactions...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {transaction.description}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                          {transaction.type === 'income' ? '+' : '-'}Rp {Math.abs(transaction.amount).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {transaction.date} • {transaction.category}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{transaction.account}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}