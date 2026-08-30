'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Signup error:', error);
          setMessage(`Error: ${error.message}`);
        } else {
          console.log('Signup response:', data);
          if (data.user) {
            setMessage('Account created successfully! Please check your email for confirmation.');
          } else {
            setMessage('Please check your email for confirmation.');
          }
          // Switch to login after successful signup
          setIsSignUp(false);
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Login error:', error);
          setMessage(`Error: ${error.message}`);
        } else {
          console.log('Login response:', data);
          if (data.session) {
            // Successful login - redirect to dashboard using window.location
            console.log('Login successful, redirecting to dashboard...');
            window.location.href = '/dashboard';
          } else {
            console.warn('Login response did not contain session:', data);
            setMessage('Login failed. Please try again.');
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {message && (
            <div className={`text-center text-sm ${message.includes('Error') || message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
          
          <div className="text-center mt-2">
            <Link href="/" className="font-medium text-gray-600 hover:text-gray-500">
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}