'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getFamilyTransactions, createTransaction } from '@/lib/services/transactionService';
import { getFamilyAccounts } from '@/lib/services/accountService';
import { getFamilyCategories } from '@/lib/services/categoryService';
import { getFamilyGoals } from '@/lib/services/goalService';
import { Transaction, Account, Category, FinancialGoal } from '@/types';
import { PlusCircle, Search, Calendar, Filter } from 'lucide-react';
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
  const [allTransactions, setAllTransactions] = useState<any[]>([]); // Store all transactions for filtering
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: 0,
    transaction_type: 'expense' as 'income' | 'expense',
    category_id: '',
    account_id: '',
    goal_id: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    searchTerm: '',
    accountFilter: '',
    categoryFilter: '',
    typeFilter: '',
    goalFilter: ''
  });

  // Function to load transactions for the current family
  const loadTransactions = async () => {
    if (!family?.id) return; // Guard clause if family is not loaded
    setIsLoading(true);
    try {
      const { transactions: dbTransactions, error } = await getFamilyTransactions(family.id);
      if (error) {
        console.error('Error fetching transactions from DB:', error);
        setTransactions([]);
        setAllTransactions([]);
      } else {
        // Map the fetched data to the format expected by the UI
        // Cast 't' to 'any' to access properties added by the Supabase join query
        const mappedTransactions = dbTransactions.map((t: any) => ({
          id: t.id,
          date: t.transaction_date,
          description: t.description || 'No description',
          category: t.categories?.name || 'Uncategorized', // Safe access on cast 'any' type
          category_id: t.category_id,
          goal_id: t.goal_id,
          amount: t.transaction_type === 'income' ? t.amount : -t.amount,
          type: t.transaction_type,
          account: t.accounts?.name || 'Unknown Account', // Safe access on cast 'any' type
          account_id: t.account_id
        }));
        setAllTransactions(mappedTransactions);
        setTransactions(mappedTransactions);
      }
    } catch (error) {
      console.error('Unexpected error loading transactions:', error);
      setTransactions([]);
      setAllTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load accounts, categories and goals for the current family
  const loadRelatedData = async () => {
    if (!family?.id) return;
    try {
      // Fetch all related data concurrently
      const [accountsRes, categoriesRes, goalsRes] = await Promise.all([
        getFamilyAccounts(family.id),
        getFamilyCategories(family.id),
        getFamilyGoals(family.id)
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

      if (goalsRes.error) {
        console.error('Error fetching goals:', goalsRes.error);
        setGoals([]); // Clear state on error
      } else {
        setGoals(goalsRes.goals);
      }
    } catch (error) {
      console.error('Error loading related data:', error);
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
      loadRelatedData();
    }
  }, [family?.id]); // Dependency array ensures effect runs when family.id changes

  // Apply filters to transactions
  useEffect(() => {
    let filtered = [...allTransactions];
    
    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    
    // Apply search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.account.toLowerCase().includes(term) ||
        t.amount.toString().includes(term)
      );
    }
    
    // Apply account filter
    if (filters.accountFilter) {
      filtered = filtered.filter(t => t.account_id === filters.accountFilter);
    }
    
    // Apply category filter
    if (filters.categoryFilter) {
      filtered = filtered.filter(t => t.category_id === filters.categoryFilter);
    }
    
    // Apply type filter
    if (filters.typeFilter) {
      filtered = filtered.filter(t => t.type === filters.typeFilter);
    }
    
    // Apply goal filter
    if (filters.goalFilter) {
      filtered = filtered.filter(t => t.goal_id === filters.goalFilter);
    }
    
    setTransactions(filtered);
  }, [filters, allTransactions]);

  // Handler for creating a new transaction
  const handleCreateTransaction = async () => {
    if (!family?.id || !newTransaction.account_id || !newTransaction.category_id) return;
    setIsSubmitting(true);
    try {
      // Prepare data object for the service call
      // Ensure optional fields like member_id and goal_id are undefined if not set, not null
      const transactionData = {
        account_id: newTransaction.account_id,
        member_id: undefined, // Use undefined instead of null
        category_id: newTransaction.category_id, // This is a string from the form, will be sent if selected
        goal_id: newTransaction.goal_id || undefined, // Link to goal if selected
        transaction_type: newTransaction.transaction_type,
        amount: Math.abs(Number(newTransaction.amount)),
        transaction_date: newTransaction.date,
        description: newTransaction.description,
        attachment_url: undefined
      };

      const { transaction: newDbTransaction, error } = await createTransaction(transactionData, family.id);
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
          goal_id: '',
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

  // Handler for filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      searchTerm: '',
      accountFilter: '',
      categoryFilter: '',
      typeFilter: '',
      goalFilter: ''
    });
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
                  <Label htmlFor="goal" className="text-right">
                    Goal
                  </Label>
                  <Select
                    value={newTransaction.goal_id}
                    onValueChange={(value) => setNewTransaction({...newTransaction, goal_id: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {goals.map(goal => (
                        <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>
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

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">Search</Label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  id="search"
                  placeholder="Search description, category, account..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">From Date</Label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="date"
                  id="startDate"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">To Date</Label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="date"
                  id="endDate"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="accountFilter" className="text-sm font-medium text-gray-700">Account</Label>
              <Select
                value={filters.accountFilter}
                onValueChange={(value) => handleFilterChange('accountFilter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accounts</SelectItem>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="categoryFilter" className="text-sm font-medium text-gray-700">Category</Label>
              <Select
                value={filters.categoryFilter}
                onValueChange={(value) => handleFilterChange('categoryFilter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="typeFilter" className="text-sm font-medium text-gray-700">Type</Label>
              <Select
                value={filters.typeFilter}
                onValueChange={(value) => handleFilterChange('typeFilter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="goalFilter" className="text-sm font-medium text-gray-700">Goal</Label>
              <Select
                value={filters.goalFilter}
                onValueChange={(value) => handleFilterChange('goalFilter', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Goals</SelectItem>
                  {goals.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>{goal.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading transactions...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
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
                ))
              ) : (
                <li className="px-4 py-8 text-center">
                  <p className="text-gray-500">No transactions found matching your filters.</p>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}