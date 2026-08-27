"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Accounts", href: "/accounts" },
  { name: "Budgets", href: "/budgets" },
  { name: "Bills", href: "/recurring" },
  { name: "Goals", href: "/goals" },
  { name: "Reports", href: "/reports" },
  { name: "Family", href: "/family" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-lg md:hidden"
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-700/50 bg-slate-900 text-slate-100 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="border-b border-slate-700/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Uang Kita
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">Family Finance</h2>
          <p className="mt-2 text-xs text-slate-300">
            Simple now, scalable later.
          </p>
        </div>
        <nav className="mt-3 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-4 py-2.5 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/30"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
