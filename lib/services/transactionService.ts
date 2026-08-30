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
    // First, get the original transaction to reverse its effect on the account balance
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
      // Try to restore the original balance since the update failed
      await updateAccountBalance(originalTransaction as Transaction, true);
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

    return { transaction: updatedTransaction, error: null };
  } catch (error) {
    console.error('Unexpected error in updateTransaction:', error);
    return { transaction: null, error };
  }
}

// Delete a transaction
export async function deleteTransaction(transactionId: string, familyId: string): Promise<{ error: any }> {
  try {
    // First, get the transaction to reverse its effect on the account balance
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

    // Delete the transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('family_id', familyId);

    if (error) {
      console.error('Error deleting transaction:', error);
      // Try to restore the balance since the deletion failed
      await updateAccountBalance(transaction as Transaction, true);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteTransaction:', error);
    return { error };
  }
}