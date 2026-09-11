import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6">
        <span className="mb-4 text-sm font-medium text-blue-400">
          TeamFlow
        </span>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
          Administra tu equipo, proyectos y tareas en un solo lugar.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          Un proyecto fullstack construido con Next.js, NestJS,
          PostgreSQL, Redis y BullMQ.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
          >
            Iniciar Sesión
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-slate-700 px-5 py-3 font-medium hover:bg-slate-900"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}