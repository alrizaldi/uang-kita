import { supabase } from '@/lib/supabase/client';
import { Family, FamilyMember } from '@/types';

/**
 * Service functions for family-related operations
 */

// Get the family for the current user
export async function getCurrentFamily(userId: string): Promise<{ family: Family | null; error: any }> {
  try {
    // Query the 'families' table for a record where the 'created_by' column matches the user ID.
    // The 'select()' method specifies which columns to retrieve, '*' means all.
    // The 'limit(1)' ensures we only get the first matching record, which is good practice.
    const { data: families, error } = await supabase
      .from('families')
      .select('*') // Select all columns from the families table
      .eq('created_by', userId) // Filter rows where 'created_by' equals the provided user ID
      .limit(1); // Limit the result to 1 row

    if (error) {
      // If the Supabase client returns an error, log it and return the error object.
      console.error('Supabase error fetching family:', error);
      return { family: null, error };
    }

    // If no family was found matching the criteria, 'families' will be an empty array.
    if (!families || families.length === 0) {
      console.log(`No family found for user ID: ${userId}`);
      return { family: null, error: null }; // Return null family, but no specific error.
    }

    // If a family was found, 'families' will be an array with one element.
    // Extract the first (and expected only) family object.
    const family = families[0];

    // Fetch members belonging to the found family using the family ID.
    const { data: members, error: membersError } = await supabase
      .from('members') // Query the 'members' table
      .select('*') // Select all columns from the members table
      .eq('family_id', family.id); // Filter rows where 'family_id' matches the current family's ID

    if (membersError) {
      // If fetching members fails, log the error.
      // We still return the family object, but with an empty members array and the error.
      console.error('Supabase error fetching family members:', membersError);
      return { family: { ...family, members: [] }, error: membersError };
    }

    // Combine the family data with the fetched members array and return it.
    return { family: { ...family, members }, error: null };
  } catch (err) {
    // Catch any unexpected JavaScript errors during the execution of the function.
    console.error('Unexpected error in getCurrentFamily service:', err);
    // Return a generic error object.
    return { family: null, error: { message: 'An unexpected error occurred' } };
  }
}

// Create a new family
export async function createFamily(familyName: string): Promise<{ family: Family | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { family: null, error: 'No user found' };
    }

    // Insert the new family
    const { data, error } = await supabase
      .from('families')
      .insert([{ name: familyName }])
      .select()
      .single();

    if (error) {
      console.error('Error creating family:', error);
      return { family: null, error };
    }

    const newFamily = data as unknown as Family;

    // Add the user as the first family member (owner/admin)
    const { error: memberError } = await supabase
      .from('members')
      .insert([{
        family_id: newFamily.id,
        user_id: user.id,
        name: user.email?.split('@')[0] || 'Family Member',
        role: 'admin'
      }]);

    if (memberError) {
      console.error('Error adding family member:', memberError);
      // Rollback: delete the family if member creation fails
      await supabase.from('families').delete().eq('id', newFamily.id);
      return { family: null, error: memberError };
    }

    return { family: newFamily, error: null };
  } catch (error) {
    console.error('Unexpected error in createFamily:', error);
    return { family: null, error };
  }
}

// Update an existing family
export async function updateFamily(familyId: string, updates: Partial<Omit<Family, 'id' | 'created_at' | 'updated_at'>>): Promise<{ family: Family | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('families')
      .update(updates)
      .eq('id', familyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating family:', error);
      return { family: null, error };
    }

    return { family: data as Family, error: null };
  } catch (error) {
    console.error('Unexpected error in updateFamily:', error);
    return { family: null, error };
  }
}

// Join an existing family
export async function joinFamily(inviteCode: string): Promise<{ error: any }> {
  // Note: This implementation assumes invite codes exist in the system
  // For now, we'll skip this until we implement the invitation system
  return { error: 'Join family functionality not yet implemented' };
}

// Get all family members for a family
export async function getFamilyMembers(familyId: string): Promise<{ members: FamilyMember[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('family_id', familyId);

    if (error) {
      console.error('Error fetching family members:', error);
      return { members: [], error };
    }

    return { members: data as FamilyMember[], error: null };
  } catch (error) {
    console.error('Unexpected error in getFamilyMembers:', error);
    return { members: [], error };
  }
}

// Add a family member
export async function addFamilyMember(familyId: string, name: string, role: string): Promise<{ member: FamilyMember | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert([{ 
        family_id: familyId, 
        name, 
        role,
        user_id: null // For now, not associated with a specific user account
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding family member:', error);
      return { member: null, error };
    }

    return { member: data as FamilyMember, error: null };
  } catch (error) {
    console.error('Unexpected error in addFamilyMember:', error);
    return { member: null, error };
  }
}