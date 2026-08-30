import { supabase } from '@/lib/supabase/client';
import { Budget } from '@/types';

/**
 * Service functions for budget-related operations
 */

// Get all budgets for the current family
export async function getFamilyBudgets(familyId: string): Promise<{ budgets: Budget[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (name)
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      return { budgets: [], error };
    }

    // Map the data to the Budget type, incorporating related category data
    const budgets = data.map(item => ({
      id: item.id,
      family_id: item.family_id,
      category_id: item.category_id,
      amount: item.amount,
      period_type: item.period_type,
      period_start: item.period_start,
      period_end: item.period_end,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Adding related data
      category_name: item.categories?.name
    }));

    return { budgets, error: null };
  } catch (error) {
    console.error('Unexpected error in getFamilyBudgets:', error);
    return { budgets: [], error };
  }
}

// Create a new budget
export async function createBudget(
  budgetData: Omit<Budget, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
  familyId: string
): Promise<{ budget: Budget | null; error: any }> {
  try {
    const budgetWithFamilyId = {
      ...budgetData,
      family_id: familyId
    };
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([budgetWithFamilyId])
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      return { budget: null, error };
    }

    return { budget: data as Budget, error: null };
  } catch (error) {
    console.error('Unexpected error in createBudget:', error);
    return { budget: null, error };
  }
}

// Update an existing budget
export async function updateBudget(budgetId: string, updates: Partial<Omit<Budget, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<{ budget: Budget | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return { budget: null, error };
    }

    return { budget: data as Budget, error: null };
  } catch (error) {
    console.error('Unexpected error in updateBudget:', error);
    return { budget: null, error };
  }
}

// Delete a budget
export async function deleteBudget(budgetId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      console.error('Error deleting budget:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteBudget:', error);
    return { error };
  }
}