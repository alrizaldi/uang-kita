import { supabase } from '@/lib/supabase/client';
import { Category } from '@/types';

/**
 * Service functions for category-related operations
 */

// Get all categories for the current family
export async function getFamilyCategories(familyId: string): Promise<{ categories: Category[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('family_id', familyId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return { categories: [], error };
    }

    return { categories: data as Category[], error: null };
  } catch (error) {
    console.error('Unexpected error in getFamilyCategories:', error);
    return { categories: [], error };
  }
}

// Create a new category
export async function createCategory(
  categoryData: Omit<Category, 'id' | 'family_id' | 'created_at' | 'updated_at'>,
  familyId: string
): Promise<{ category: Category | null; error: any }> {
  try {
    const categoryWithFamilyId = {
      ...categoryData,
      family_id: familyId
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryWithFamilyId])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return { category: null, error };
    }

    return { category: data as Category, error: null };
  } catch (error) {
    console.error('Unexpected error in createCategory:', error);
    return { category: null, error };
  }
}

// Update an existing category
export async function updateCategory(categoryId: string, updates: Partial<Omit<Category, 'id' | 'family_id' | 'created_at' | 'updated_at'>>): Promise<{ category: Category | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return { category: null, error };
    }

    return { category: data as Category, error: null };
  } catch (error) {
    console.error('Unexpected error in updateCategory:', error);
    return { category: null, error };
  }
}

// Delete a category
export async function deleteCategory(categoryId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected error in deleteCategory:', error);
    return { error };
  }
}