import { supabase } from '@/lib/supabase/client';
import { Account } from '@/types';

/**
 * Service functions for account-related operations
 */

// Get all accounts for the current family
export async function getFamilyAccounts(familyId: string): Promise<{ accounts: Account[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return { accounts: [], error };
    }

    return { accounts: data as Account[], error: null };
  } catch (error) {
    console.error('Unexpected error in getFamilyAccounts:', error);
    return { accounts: [], error };
  }
}

// Create a new account
export async function createAccount(
  accountData: Omit<Account, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
  familyId: string
): Promise<{ account: Account | null; error: any }> {
  try {
    const accountWithFamilyId = {
      ...accountData,
      family_id: familyId
    };
    
    const { data, error } = await supabase
      .from('accounts')
      .insert([accountWithFamilyId])
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      return { account: null, error };
    }

    return { account: data as Account, error: null };
  } catch (error) {
    console.error('Unexpected error in createAccount:', error);
    return { account: null, error };
  }
}

// Update an existing account
export async function updateAccount(accountId: string, updates: Partial<Omit<Account, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<{ account: Account | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      return { account: null, error };
    }

    return { account: data as Account, error: null };
  } catch (error) {
    console.error('Unexpected error in updateAccount:', error);
    return { account: null, error };
  }
}

// Delete an account
export async function deleteAccount(accountId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      console.error('Error deleting account:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteAccount:', error);
    return { error };
  }
}