"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/src/modules/auth/ui/components/ThemeToggle";

import {
  AuthProvider,
  useAuth,
} from "@/src/modules/auth/infrastructure/auth-context";
import { useRequiredAuth } from "@/src/core/middleware"; 

interface DashboardLayoutContentProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({
  children,
}: DashboardLayoutContentProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useRequiredAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f2] text-marine dark:bg-[#081b2a] dark:text-warm-white">
        <p className="text-sm text-marine/60 dark:text-warm-white/60">
          Cargando...
        </p>
      </div>
    );
  }

  const navigation = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Proyectos",
      href: "/dashboard/projects",
    },
    {
      label: "Ajustes",
      href: "/dashboard/settings",
    },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f2] text-marine dark:bg-[#081b2a] dark:text-warm-white">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-marine/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-marine/10 bg-white transition-transform duration-300 dark:border-warm-white/10 dark:bg-[#0d2739] lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-marine/10 px-6 dark:border-warm-white/10">
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="text-xl font-bold tracking-tight"
          >
            Team<span className="text-mint">Flow</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar menú"
            className="rounded-lg p-2 text-marine/60 transition hover:bg-marine/5 hover:text-marine dark:text-warm-white/60 dark:hover:bg-warm-white/5 dark:hover:text-warm-white lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-marine/10 px-6 py-5 dark:border-warm-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-electric">
            Organización
          </p>

          <p className="mt-2 truncate text-sm font-semibold">
            Sin organización
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-electric/10 text-electric"
                    : "text-marine/65 hover:bg-marine/5 hover:text-marine dark:text-warm-white/65 dark:hover:bg-warm-white/5 dark:hover:text-warm-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-marine/10 p-4 dark:border-warm-white/10">

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-marine/65 transition hover:bg-red-500/10 hover:text-red-600 dark:text-warm-white/65 dark:hover:text-red-300"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-marine/10 bg-[#f4f6f2]/90 px-4 backdrop-blur-md dark:border-warm-white/10 dark:bg-[#081b2a]/90 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-xl border border-marine/10 bg-white p-2.5 text-marine transition hover:border-electric hover:text-electric dark:border-warm-white/10 dark:bg-[#0d2739] dark:text-warm-white lg:hidden"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-marine/50 dark:text-warm-white/50">
              Espacio de trabajo
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-marine/50 dark:text-warm-white/50">
                {user.email}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-electric text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <ThemeToggle />
            <div>

            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}