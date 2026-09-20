"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import ThemeToggle from "@/src/modules/auth/ui/components/ThemeToggle";
import { useAuth } from "@/src/modules/auth/infrastructure/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("No se pudo iniciar sesión. Inténtalo nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f6f2] text-marine transition-colors duration-500 dark:bg-[#081b2a] dark:text-warm-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-marine/10 py-6 dark:border-warm-white/10">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="TeamFlow, inicio"
          >
            <Image
              src="/Logo-nobg.png"
              alt=""
              width={64}
              height={35}
              priority
            />

            <span className="text-xl font-bold tracking-tight text-marine dark:text-warm-white">
              Team<span className="text-mint">Flow</span>
            </span>
          </Link>

          <ThemeToggle />
        </header>

        <section className="flex flex-1 items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-electric">
                Bienvenido de nuevo
              </p>

              <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                Inicia sesión
              </h1>

              <p className="mt-4 text-sm leading-6 text-marine/60 dark:text-warm-white/60">
                Entra a tu espacio de trabajo y continúa avanzando con tu
                equipo.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-marine/10 bg-white/80 p-6 shadow-xl shadow-marine/5 backdrop-blur-sm dark:border-warm-white/10 dark:bg-[#0d2739]/80 sm:p-8"
            >
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-marine/15 bg-white px-4 py-3 text-sm text-marine outline-none transition placeholder:text-marine/35 focus:border-electric focus:ring-2 focus:ring-electric/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-warm-white/15 dark:bg-[#081b2a] dark:text-warm-white dark:placeholder:text-warm-white/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Contraseña
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Tu contraseña"
                    className="w-full rounded-xl border border-marine/15 bg-white px-4 py-3 text-sm text-marine outline-none transition placeholder:text-marine/35 focus:border-electric focus:ring-2 focus:ring-electric/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-warm-white/15 dark:bg-[#081b2a] dark:text-warm-white dark:placeholder:text-warm-white/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-7 flex w-full items-center justify-center rounded-xl bg-electric px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-electric/20 transition hover:bg-electric/90 focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-[#f4f6f2] disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-[#081b2a]"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              <p className="mt-6 text-center text-sm text-marine/60 dark:text-warm-white/60">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/register"
                  className="font-bold text-electric transition hover:text-royal"
                >
                  Crear una
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}