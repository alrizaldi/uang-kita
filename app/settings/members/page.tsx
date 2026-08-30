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
  getFamilyMembers,
  addFamilyMember,
} from "@/lib/services/familyService";
import { FamilyMember } from "@/types";

export default function MembersSettingsPage() {
  const { session, loading, family } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "member",
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
      loadMembers();
    }
  }, [family]);

  const loadMembers = async () => {
    if (!familyId) return;

    try {
      const { members: fetchedMembers, error } =
        await getFamilyMembers(familyId);
      if (error) {
        console.error("Error loading members:", error);
        setMembers([]);
      } else {
        setMembers(fetchedMembers);
      }
    } catch (error) {
      console.error("Error loading members:", error);
      setMembers([]);
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewMember({ name: "", role: "member" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!familyId) {
        throw new Error("No family ID available");
      }

      const { member: addedMember, error } = await addFamilyMember(
        familyId,
        newMember.name,
        newMember.role,
      );

      if (error) {
        console.error("Error adding member:", error);
      } else if (addedMember) {
        setMembers([...members, addedMember]);
        setIsAdding(false);
        setNewMember({ name: "", role: "member" });
      }
    } catch (error) {
      console.error("Error adding member:", error);
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
            Member Management
          </h1>
          <Button onClick={handleAddClick}>Add Member</Button>
        </div>

        {isAdding && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md max-w-2xl">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="memberName">Member Name</Label>
                  <Input
                    id="memberName"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="Enter member name"
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="memberRole">Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, role: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Member"}
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
            {members.map((member) => (
              <li key={member.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {member.name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <p>Status: {member.is_active ? "Active" : "Inactive"}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
