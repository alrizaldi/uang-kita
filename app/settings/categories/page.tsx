"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getFamilyCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/services/categoryService";
import { Category } from "@/types";

export default function CategoriesSettingsPage() {
  const { session, loading, family } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "expense",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/auth");
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (family) {
      setFamilyId(family.id);
      loadCategories();
    }
  }, [family]);

  const loadCategories = async () => {
    if (!familyId) return;

    try {
      const { categories: fetchedCategories, error } =
        await getFamilyCategories(familyId);
      if (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      } else {
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewCategory({ name: "", type: "expense" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!familyId) {
        throw new Error("No family ID available");
      }

      const { category: createdCategory, error } = await createCategory(
        {
          name: newCategory.name,
          type: newCategory.type,
          is_active: true,
        },
        familyId,
      );

      if (error) {
        console.error("Error creating category:", error);
      } else if (createdCategory) {
        setCategories([...categories, createdCategory]);
        setIsAdding(false);
        setNewCategory({ name: "", type: "expense" });
      }
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      type: category.type,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      type: "expense",
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setIsSubmitting(true);

    try {
      const { category: updatedCategory, error } = await updateCategory(
        editingId,
        {
          name: editForm.name,
          type: editForm.type,
        },
      );

      if (error) {
        console.error("Error updating category:", error);
      } else if (updatedCategory) {
        // Update the category in the local state
        setCategories(
          categories.map((cat) =>
            cat.id === editingId ? updatedCategory : cat,
          ),
        );

        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const { error } = await deleteCategory(id);

      if (error) {
        console.error("Error deleting category:", error);
      } else {
        setCategories(categories.filter((cat) => cat.id !== id));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
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
          <h1 className="text-2xl font-bold text-gray-900 px-4">
            Category Management
          </h1>
          <Button onClick={handleAddClick}>Add Category</Button>
        </div>

        {isAdding && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md max-w-2xl">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="Enter category name"
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="categoryType">Type</Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(value) =>
                      setNewCategory({ ...newCategory, type: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Add Category"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-4 py-4 sm:px-6">
                {editingId === category.id ? (
                  <div className="space-y-3">
                    <div>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        placeholder="Category name"
                      />
                    </div>

                    <div>
                      <Select
                        value={editForm.type}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, type: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">{category.type}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
