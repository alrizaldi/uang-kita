import { supabase } from '@/lib/supabase/client';
import { FinancialGoal } from '@/types';

/**
 * Service functions for financial goal-related operations
 */

// Get all financial goals for the current family
export async function getFamilyGoals(familyId: string): Promise<{ goals: FinancialGoal[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('goals')  // Changed from 'financial_goals' to 'goals'
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return { goals: [], error };
    }

    return { goals: data as FinancialGoal[], error: null };
  } catch (error) {
    console.error('Unexpected error in getFamilyGoals:', error);
    return { goals: [], error };
  }
}

// Create a new financial goal
export async function createGoal(
  goalData: Omit<FinancialGoal, 'id' | 'family_id' | 'current_amount' | 'created_at' | 'updated_at'>,
  familyId: string
): Promise<{ goal: FinancialGoal | null; error: any }> {
  try {
    const goalWithFamilyId = {
      ...goalData,
      family_id: familyId,
      current_amount: 0 // Initialize with 0
    };
    
    const { data, error } = await supabase
      .from('goals')  // Changed from 'financial_goals' to 'goals'
      .insert([goalWithFamilyId])
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      return { goal: null, error };
    }

    return { goal: data as FinancialGoal, error: null };
  } catch (error) {
    console.error('Unexpected error in createGoal:', error);
    return { goal: null, error };
  }
}

// Update an existing financial goal
export async function updateGoal(goalId: string, updates: Partial<Omit<FinancialGoal, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<{ goal: FinancialGoal | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('goals')  // Changed from 'financial_goals' to 'goals'
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return { goal: null, error };
    }

    return { goal: data as FinancialGoal, error: null };
  } catch (error) {
    console.error('Unexpected error in updateGoal:', error);
    return { goal: null, error };
  }
}

// Delete a financial goal
export async function deleteGoal(goalId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('goals')  // Changed from 'financial_goals' to 'goals'
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Error deleting goal:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteGoal:', error);
    return { error };
  }
}