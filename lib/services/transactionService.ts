import { supabase } from '@/lib/supabase/client';
import { Transaction } from '@/types';

/**
 * Service functions for transaction-related operations
 */

// Get all transactions for the current family
export async function getFamilyTransactions(familyId: string): Promise<{ transactions: Transaction[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (name),
        categories (name, type)
      `)
      .eq('family_id', familyId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return { transactions: [], error };
    }

    // Map the data to the Transaction type, incorporating related data
    const transactions = data.map(item => ({
      id: item.id,
      family_id: item.family_id,
      account_id: item.account_id,
      member_id: item.member_id,
      category_id: item.category_id,
      transaction_type: item.transaction_type,
      amount: item.amount,
      transaction_date: item.transaction_date,
      description: item.description,
      attachment_url: item.attachment_url,
      created_by: item.created_by,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Adding related data
      account_name: item.accounts?.name,
      category_name: item.categories?.name,
      category_type: item.categories?.type
    }));

    return { transactions, error: null };
  } catch (error) {
    console.error('Unexpected error in getFamilyTransactions:', error);
    return { transactions: [], error };
  }
}

// Create a new transaction
export async function createTransaction(transactionData: Omit<Transaction, 'id' | 'family_id' | 'created_at' | 'updated_at'>): Promise<{ transaction: Transaction | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { transaction: null, error: 'No user found' };
    }

    // Need to add family_id from user context
    // For now, we'll assume family_id is provided in the transactionData
    // In a real implementation, this would come from the session context

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transactionData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return { transaction: null, error };
    }

    return { transaction: data as Transaction, error: null };
  } catch (error) {
    console.error('Unexpected error in createTransaction:', error);
    return { transaction: null, error };
  }
}

// Update an existing transaction
export async function updateTransaction(transactionId: string, updates: Partial<Omit<Transaction, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<{ transaction: Transaction | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      return { transaction: null, error };
    }

    return { transaction: data as Transaction, error: null };
  } catch (error) {
    console.error('Unexpected error in updateTransaction:', error);
    return { transaction: null, error };
  }
}

// Delete a transaction
export async function deleteTransaction(transactionId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      console.error('Error deleting transaction:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteTransaction:', error);
    return { error };
  }
}