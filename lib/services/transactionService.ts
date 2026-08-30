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
      goal_id: item.goal_id, // Added goal_id field
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

// Helper function to update account balance based on transaction
async function updateAccountBalance(transaction: Transaction, isAddition: boolean) {
  try {
    // Get the current account to update its balance
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('opening_balance')
      .eq('id', transaction.account_id)
      .single();

    if (accountError) {
      console.error('Error fetching account to update balance:', accountError);
      return { error: accountError };
    }

    // Calculate the new balance based on transaction type
    let amountToAdjust = transaction.amount;
    if (transaction.transaction_type === 'expense') {
      // For expenses, subtract the amount (or add if we're reversing the transaction)
      amountToAdjust = isAddition ? -transaction.amount : transaction.amount;
    } else if (transaction.transaction_type === 'income') {
      // For income, add the amount (or subtract if we're reversing the transaction)
      amountToAdjust = isAddition ? transaction.amount : -transaction.amount;
    } else if (transaction.transaction_type === 'transfer') {
      // Transfers are more complex - for now, we'll just return without error
      return { error: null };
    }

    // Calculate new balance
    const newBalance = account.opening_balance + amountToAdjust;

    // Update the account balance
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ opening_balance: newBalance })
      .eq('id', transaction.account_id);

    if (updateError) {
      console.error('Error updating account balance:', updateError);
      return { error: updateError };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in updateAccountBalance:', error);
    return { error };
  }
}

// Helper function to update goal progress based on transaction
async function updateGoalProgress(transaction: Transaction, isAddition: boolean) {
  try {
    // If the transaction doesn't have a goal_id, nothing to update
    if (!transaction.goal_id) {
      return { error: null };
    }

    // Get the current goal to update its progress
    const { data: goal, error: goalError } = await supabase
      .from('goals')  // Changed from 'financial_goals' to 'goals'
      .select('current_amount')
      .eq('id', transaction.goal_id)
      .single();

    if (goalError) {
      console.error('Error fetching goal to update progress:', goalError);
      return { error: goalError };
    }

    // Calculate the new progress based on transaction type
    // For goal contributions, we consider them as positive additions
    let amountToAdjust = transaction.amount;
    if (transaction.transaction_type === 'expense') {
      // If it's an expense transaction for a goal, add the amount to progress
      amountToAdjust = isAddition ? transaction.amount : -transaction.amount;
    } else if (transaction.transaction_type === 'income') {
      // If it's an income transaction for a goal, add the amount to progress
      amountToAdjust = isAddition ? transaction.amount : -transaction.amount;
    } else if (transaction.transaction_type === 'transfer') {
      // For transfers, we might not want to affect goal progress
      return { error: null };
    }

    // Calculate new progress
    const newProgress = Math.max(0, goal.current_amount + amountToAdjust);

    // Update the goal progress
    const { error: updateError } = await supabase
      .from('goals')  // Changed from 'financial_goals' to 'goals'
      .update({ current_amount: newProgress })
      .eq('id', transaction.goal_id);

    if (updateError) {
      console.error('Error updating goal progress:', updateError);
      return { error: updateError };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in updateGoalProgress:', error);
    return { error };
  }
}

// Create a new transaction
export async function createTransaction(
  transactionData: Omit<Transaction, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
  familyId: string
): Promise<{ transaction: Transaction | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { transaction: null, error: 'No user found' };
    }

    // Add family_id and created_by to the transaction data
    const transactionWithFamilyId = {
      ...transactionData,
      family_id: familyId,
      created_by: user.id
    };

    // Insert the transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionWithFamilyId])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return { transaction: null, error };
    }

    const insertedTransaction = data as Transaction;

    // Update the account balance based on this transaction
    const balanceUpdateResult = await updateAccountBalance(insertedTransaction, true);
    if (balanceUpdateResult.error) {
      console.error('Error updating account balance after creating transaction:', balanceUpdateResult.error);
      // Optionally, we could rollback the transaction creation here
      return { transaction: null, error: balanceUpdateResult.error };
    }

    // Update the goal progress if this transaction is linked to a goal
    const goalUpdateResult = await updateGoalProgress(insertedTransaction, true);
    if (goalUpdateResult.error) {
      console.error('Error updating goal progress after creating transaction:', goalUpdateResult.error);
      // Note: We don't rollback the transaction because the account update already happened
    }

    return { transaction: insertedTransaction, error: null };
  } catch (error) {
    console.error('Unexpected error in createTransaction:', error);
    return { transaction: null, error };
  }
}

// Update an existing transaction
export async function updateTransaction(
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'family_id' | 'created_at' | 'updated_at'>>,
  familyId: string
): Promise<{ transaction: Transaction | null; error: any }> {
  try {
    // First, get the original transaction to reverse its effects
    const { data: originalTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('family_id', familyId)
      .single();

    if (fetchError) {
      console.error('Error fetching original transaction:', fetchError);
      return { transaction: null, error: fetchError };
    }

    // Reverse the original transaction's effect on the account balance
    const reverseBalanceResult = await updateAccountBalance(originalTransaction as Transaction, false);
    if (reverseBalanceResult.error) {
      console.error('Error reversing original transaction effect on account balance:', reverseBalanceResult.error);
      return { transaction: null, error: reverseBalanceResult.error };
    }

    // Reverse the original transaction's effect on the goal progress
    const reverseGoalResult = await updateGoalProgress(originalTransaction as Transaction, false);
    if (reverseGoalResult.error) {
      console.error('Error reversing original transaction effect on goal progress:', reverseGoalResult.error);
      return { transaction: null, error: reverseGoalResult.error };
    }

    // Apply the updates
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .eq('family_id', familyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      // Try to restore the original balance and goal progress since the update failed
      await updateAccountBalance(originalTransaction as Transaction, true);
      await updateGoalProgress(originalTransaction as Transaction, true);
      return { transaction: null, error };
    }

    const updatedTransaction = data as Transaction;

    // Apply the new transaction's effect on the account balance
    const newBalanceResult = await updateAccountBalance(updatedTransaction, true);
    if (newBalanceResult.error) {
      console.error('Error applying updated transaction effect on account balance:', newBalanceResult.error);
      // Optionally, we could revert the update here
      return { transaction: null, error: newBalanceResult.error };
    }

    // Apply the new transaction's effect on the goal progress
    const newGoalResult = await updateGoalProgress(updatedTransaction, true);
    if (newGoalResult.error) {
      console.error('Error applying updated transaction effect on goal progress:', newGoalResult.error);
      // Optionally, we could revert the update here
      return { transaction: null, error: newGoalResult.error };
    }

    return { transaction: updatedTransaction, error: null };
  } catch (error) {
    console.error('Unexpected error in updateTransaction:', error);
    return { transaction: null, error };
  }
}

// Delete a transaction
export async function deleteTransaction(transactionId: string, familyId: string): Promise<{ error: any }> {
  try {
    // First, get the transaction to reverse its effects
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('family_id', familyId)
      .single();

    if (fetchError) {
      console.error('Error fetching transaction to delete:', fetchError);
      return { error: fetchError };
    }

    // Reverse the transaction's effect on the account balance
    const balanceUpdateResult = await updateAccountBalance(transaction as Transaction, false);
    if (balanceUpdateResult.error) {
      console.error('Error reversing transaction effect on account balance:', balanceUpdateResult.error);
      return { error: balanceUpdateResult.error };
    }

    // Reverse the transaction's effect on the goal progress
    const goalUpdateResult = await updateGoalProgress(transaction as Transaction, false);
    if (goalUpdateResult.error) {
      console.error('Error reversing transaction effect on goal progress:', goalUpdateResult.error);
      return { error: goalUpdateResult.error };
    }

    // Delete the transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('family_id', familyId);

    if (error) {
      console.error('Error deleting transaction:', error);
      // Try to restore the balance and goal progress since the deletion failed
      await updateAccountBalance(transaction as Transaction, true);
      await updateGoalProgress(transaction as Transaction, true);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteTransaction:', error);
    return { error };
  }
}