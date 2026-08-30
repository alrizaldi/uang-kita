'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import Layout from '@/components/layout';
import { Button } from '@/components/ui/button';
import { getFamilyAccounts } from '@/lib/services/accountService';
import { Account } from '@/types';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAccount } from '@/lib/services/accountService';

export default function AccountsPage() {
  const { session, loading, family } = useSession();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking',
    institution: '',
    opening_balance: 0,
    currency: 'IDR'
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/auth');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (family) {
      setFamilyId(family.id);
    }
  }, [family]);

  useEffect(() => {
    if (familyId) {
      loadAccounts();
    }
  }, [familyId]);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const { accounts: fetchedAccounts, error } = await getFamilyAccounts(familyId!);
      if (error) {
        console.error('Error loading accounts:', error);
        // Handle error appropriately, maybe show an error message to the user
      } else {
        setAccounts(fetchedAccounts);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    try {
      if (!familyId) {
        throw new Error('No family ID available');
      }
      
      const { account: createdAccount, error } = await createAccount({
        name: newAccount.name,
        type: newAccount.type,
        institution: newAccount.institution,
        opening_balance: Number(newAccount.opening_balance),
        currency: newAccount.currency,
        is_active: true,
      }, familyId);
      
      if (error) {
        console.error('Error creating account:', error);
        // Handle error appropriately, maybe show an error message to the user
      } else if (createdAccount) {
        setAccounts([createdAccount, ...accounts]);
        setNewAccount({
          name: '',
          type: 'checking',
          institution: '',
          opening_balance: 0,
          currency: 'IDR'
        });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error creating account:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Enter the details for your new account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select value={newAccount.type} onValueChange={(value) => setNewAccount({...newAccount, type: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="institution" className="text-right">
                    Institution
                  </Label>
                  <Input
                    id="institution"
                    value={newAccount.institution}
                    onChange={(e) => setNewAccount({...newAccount, institution: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="openingBalance" className="text-right">
                    Opening Balance
                  </Label>
                  <Input
                    id="openingBalance"
                    type="number"
                    value={newAccount.opening_balance}
                    onChange={(e) => setNewAccount({...newAccount, opening_balance: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateAccount} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading accounts...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">{account.institution} • {account.type}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className={`text-2xl font-bold ${account.opening_balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      {account.currency} {Math.abs(account.opening_balance).toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                      account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}