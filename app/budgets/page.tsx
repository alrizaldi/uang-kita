'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getFamilyBudgets, createBudget } from '@/lib/services/budgetService';
import { getFamilyCategories } from '@/lib/services/categoryService';
import { Budget, Category } from '@/types';
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

interface ExtendedBudget extends Budget {
  category_name?: string;
  spent?: number;
  remaining?: number;
}

export default function BudgetsPage() {
  const { session, loading, family } = useSession();
  const router = useRouter();
  const [budgets, setBudgets] = useState<ExtendedBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newBudget, setNewBudget] = useState({
    category_id: '',
    amount: 0,
    period_type: 'MONTHLY',
    period_start: '',
    period_end: ''
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (family) {
      setFamilyId(family.id);
    }
  }, [family]);

  useEffect(() => {
    if (familyId) {
      loadBudgets();
      loadCategories();
    }
  }, [familyId]);

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const { budgets: fetchedBudgets, error } = await getFamilyBudgets(familyId!);
      if (error) {
        console.error('Error loading budgets:', error);
      } else {
        // Calculate spent and remaining amounts for each budget
        const budgetsWithCalculations = fetchedBudgets.map(budget => {
          // In a real implementation, you would calculate the spent amount based on transactions
          // For now, we'll use mock values
          const spent = budget.amount * 0.6; // Mock spent amount
          return {
            ...budget,
            spent,
            remaining: budget.amount - spent
          };
        });
        setBudgets(budgetsWithCalculations);
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { categories: fetchedCategories, error } = await getFamilyCategories(familyId!);
      if (error) {
        console.error('Error loading categories:', error);
        // Set empty array if there's an error
        setCategories([]);
      } else {
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleCreateBudget = async () => {
    setIsSubmitting(true);
    try {
      if (!familyId) {
        throw new Error('No family ID available');
      }
      
      // Prepare the budget data with proper dates for the selected period
      let periodStart: string, periodEnd: string;
      const today = new Date();
      
      switch (newBudget.period_type) {
        case 'DAILY':
          periodStart = today.toISOString().split('T')[0];
          periodEnd = today.toISOString().split('T')[0];
          break;
        case 'WEEKLY':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          periodStart = weekStart.toISOString().split('T')[0];
          periodEnd = weekEnd.toISOString().split('T')[0];
          break;
        case 'MONTHLY':
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'YEARLY':
          periodStart = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          periodEnd = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
          break;
        default:
          periodStart = today.toISOString().split('T')[0];
          periodEnd = today.toISOString().split('T')[0];
      }
      
      const budgetData = {
        category_id: newBudget.category_id,
        amount: Number(newBudget.amount),
        period_type: newBudget.period_type,
        period_start: periodStart,
        period_end: periodEnd
      };
      
      const { budget: createdBudget, error } = await createBudget(budgetData, familyId);
      
      if (error) {
        console.error('Error creating budget:', error);
      } else if (createdBudget) {
        // Add the calculated values to the new budget
        const newBudgetWithCalculations = {
          ...createdBudget,
          spent: 0, // New budget starts with 0 spent
          remaining: Number(newBudget.amount)
        };
        
        setBudgets([newBudgetWithCalculations, ...budgets]);
        setNewBudget({
          category_id: '',
          amount: 0,
          period_type: 'MONTHLY',
          period_start: '',
          period_end: ''
        });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error creating budget:', error);
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
    return null; // Will be redirected by useEffect
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Budget</DialogTitle>
                <DialogDescription>
                  Enter the details for your new budget.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select value={newBudget.category_id} onValueChange={(value) => setNewBudget({...newBudget, category_id: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({...newBudget, amount: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Select value={newBudget.period_type} onValueChange={(value) => setNewBudget({...newBudget, period_type: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleCreateBudget} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating...' : 'Create Budget'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading budgets...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {budgets.map((budget) => {
                const percentage = Math.min(100, (budget.spent || 0) / budget.amount * 100);
                return (
                  <li key={budget.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {budget.category_name || 'Unknown Category'}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-sm text-gray-500">
                            Rp {(budget.spent || 0).toLocaleString('id-ID')} / Rp {budget.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage > 90 ? 'bg-red-600' : 
                              percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Remaining: Rp {(budget.remaining || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>{budget.period_type}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}