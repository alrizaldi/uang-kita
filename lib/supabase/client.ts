import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(key: string) {
        if (typeof document !== 'undefined') {
          const cookie = document.cookie
            .split(';')
            .find(c => c.trim().startsWith(`${key}=`));
          if (cookie) {
            return cookie.split('=')[1];
          }
        }
        return null;
      },
      set(key: string, value: string, options: any) {
        if (typeof document !== 'undefined') {
          document.cookie = `${key}=${value}; path=/; ${options?.secure ? 'secure;' : ''}${options?.sameSite ? 'sameSite=${options.sameSite};' : ''}`;
        }
      },
      remove(key: string, options: any) {
        if (typeof document !== 'undefined') {
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; ${options?.secure ? 'secure;' : ''}${options?.sameSite ? 'sameSite=${options.sameSite};' : ''}`;
        }
      }
    }
  }
)
