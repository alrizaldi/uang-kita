import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-slate-900">
      <Sidebar />
      <div className="flex min-h-screen flex-col md:ml-72">
        <Header />
        <main className="flex-1 px-4 pb-10 pt-20 md:px-8 md:pt-24">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
