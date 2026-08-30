'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getFamilyGoals, createGoal } from '@/lib/services/goalService';
import { FinancialGoal } from '@/types';
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
import { Textarea } from "@/components/ui/textarea";

export default function GoalsPage() {
  const { session, loading, family } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    target_amount: 0,
    target_date: '',
    monthly_target: 0
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
      loadGoals();
    }
  }, [familyId]);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const { goals: fetchedGoals, error } = await getFamilyGoals(familyId!);
      if (error) {
        console.error('Error loading goals:', error);
      } else {
        setGoals(fetchedGoals);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    setIsSubmitting(true);
    try {
      if (!familyId) {
        throw new Error('No family ID available');
      }
      
      // Calculate monthly target based on target amount and date
      let monthlyTarget = 0;
      if (newGoal.target_date) {
        const targetDate = new Date(newGoal.target_date);
        const currentDate = new Date();
        const monthsDiff = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                          (targetDate.getMonth() - currentDate.getMonth());
                          
        if (monthsDiff > 0) {
          monthlyTarget = Math.round(newGoal.target_amount / monthsDiff);
        }
      }
      
      const goalData = {
        name: newGoal.name,
        description: newGoal.description,
        target_amount: Number(newGoal.target_amount),
        target_date: newGoal.target_date,
        monthly_target: monthlyTarget,
        status: 'ACTIVE' as const,
        linked_account_id: undefined // Use undefined instead of null
      };
      
      const { goal: createdGoal, error } = await createGoal(goalData, familyId);
      
      if (error) {
        console.error('Error creating goal:', error);
      } else if (createdGoal) {
        setGoals([createdGoal, ...goals]);
        setNewGoal({
          name: '',
          description: '',
          target_amount: 0,
          target_date: '',
          monthly_target: 0
        });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>
                  Enter the details for your new financial goal.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetAmount" className="text-right">
                    Target Amount
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({...newGoal, target_amount: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="targetDate" className="text-right">
                    Target Date
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateGoal} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating...' : 'Create Goal'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading goals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const percentage = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
              return (
                <div key={goal.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                    
                    {goal.description && (
                      <p className="mt-2 text-sm text-gray-500">{goal.description}</p>
                    )}
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Rp {goal.current_amount.toLocaleString('id-ID')}</span>
                        <span>Rp {goal.target_amount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Target Date: {goal.target_date}</p>
                    </div>
                    
                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}