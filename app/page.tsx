'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';

export default function HomePage() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      // If already logged in, redirect to dashboard
      router.replace('/dashboard');
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

  if (session) {
    return null; // Will be redirected by useEffect
  }

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to UangKita</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your family's personal finance manager
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Track Expenses</h2>
            <p>Easily record and categorize your family's expenses</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Manage Budgets</h2>
            <p>Set and monitor your spending limits across categories</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Set Goals</h2>
            <p>Plan for your family's financial future with savings goals</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}