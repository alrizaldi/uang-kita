import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/context/SessionContext'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UangKita - Family Finance Manager',
  description: 'A simple family finance management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"  /* Changed from "system" to "light" */
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}