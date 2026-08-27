"use client";

import { usePathname } from "next/navigation";

function getHeaderTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/transactions")) return "Transactions";
  if (pathname.startsWith("/accounts")) return "Accounts";
  if (pathname.startsWith("/budgets")) return "Budgets";
  if (pathname.startsWith("/recurring")) return "Bills & Recurring";
  if (pathname.startsWith("/goals")) return "Financial Goals";
  if (pathname.startsWith("/reports")) return "Reports & Insights";
  if (pathname.startsWith("/family")) return "Family Members";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Family Finance";
}

export default function Header() {
  const pathname = usePathname();
  const title = getHeaderTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 md:text-2xl">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 md:block">
            Single-account MVP with scalable family finance architecture
          </p>
        </div>
        <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
          August 2026
        </div>
      </div>
    </header>
  );
}
