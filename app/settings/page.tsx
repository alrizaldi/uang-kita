'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SettingsPage() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth');
    }
  }, [session, loading, router]);

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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/settings/family" className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Family Settings</h3>
              <p className="mt-2 text-sm text-gray-500">
                Manage your family profile and settings.
              </p>
              <Button className="mt-4 w-full">
                Manage Family
              </Button>
            </div>
          </Link>
          
          <Link href="/settings/members" className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Member Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                Invite and manage family members.
              </p>
              <Button className="mt-4 w-full">
                Manage Members
              </Button>
            </div>
          </Link>
          
          <Link href="/settings/categories" className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Category Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create and manage transaction categories.
              </p>
              <Button className="mt-4 w-full">
                Manage Categories
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}