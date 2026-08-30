"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFamily } from "@/lib/services/familyService";
import { Family } from "@/types";

export default function FamilySettingsPage() {
  const { session, loading, family, refreshFamily } = useSession();
  const router = useRouter();
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/auth");
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (family) {
      setFamilyData(family);
      setEditForm({ name: family.name });
    }
  }, [family]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (familyData) {
      setEditForm({ name: familyData.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!familyData) {
        throw new Error("No family data available");
      }

      const { family: updatedFamily, error } = await updateFamily(
        familyData.id,
        {
          name: editForm.name,
        },
      );

      if (error) {
        console.error("Error updating family:", error);
      } else if (updatedFamily) {
        // Update the local state
        setFamilyData(updatedFamily);
        // Refresh the family data in the context
        await refreshFamily();
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating family:", error);
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
          <h1 className="text-2xl font-bold text-gray-900 px-4">
            Family Settings
          </h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md max-w-2xl">
          <div className="px-4 py-5 sm:p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Enter family name"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
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
            ) : (
              <div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Family Name
                  </Label>
                  <p className="mt-1 text-lg text-gray-900">
                    {familyData?.name}
                  </p>
                </div>

                <Button onClick={handleEditClick}>Edit Family</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
