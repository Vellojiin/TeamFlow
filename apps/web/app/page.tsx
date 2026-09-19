import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/src/modules/auth/ui/components/ThemeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f6f2] text-marine transition-colors duration-500 dark:bg-[#081b2a] dark:text-warm-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between border-b border-marine/10 py-6 dark:border-warm-white/10">
          <Link href="/" className="flex items-center gap-2" aria-label="TeamFlow, inicio">
            <Image 
              src="/Logo-nobg.png" 
              alt="Logo de TeamFlow" 
              width={80} 
              height={80} 
              priority
            />
            <span className="text-xl font-bold tracking-tight text-marine dark:text-warm-white">
              Team<span className="text-mint">Flow</span>
            </span>
          </Link>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-20">
          <div className="animate-[fade-up_700ms_ease-out_both]">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-electric">
              <span className="h-px w-8 bg-electric" />
              Trabajo con dirección
            </p>
            <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              El trabajo en equipo, <span className="text-electric">en movimiento.</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-marine/65 dark:text-warm-white/65 sm:text-lg">
              Organiza proyectos, reparte tareas y mantén a todos avanzando en la misma dirección.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-royal px-6 py-3.5 font-semibold text-warm-white shadow-[5px_5px_0_#17a8e0] transition-transform hover:-translate-y-0.5 hover:bg-electric hover:shadow-[3px_3px_0_#0e3a78] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric"
              >
                Crear cuenta
              </Link>
              <Link
                href="/login"
                className="rounded-xl px-3 py-3.5 font-semibold text-marine underline decoration-electric decoration-2 underline-offset-4 hover:text-electric dark:text-warm-white"
              >
                Ya tengo una cuenta
              </Link>
            </div>
          </div>

          <div className="relative animate-[fade-up_700ms_150ms_ease-out_both]">
            <Image 
              src="/Logo_con_Eslogan.jfif" 
              alt="TeamFlow - Logo con eslogan" 
              width={600}
              height={400}
              className="w-full rounded-2xl border border-marine/10 object-cover shadow-[0_0_0_1px_#17a8e0] dark:border-warm-white/10 dark:shadow-[0_0_0_1px_#17a8e0]" 
              priority
            />
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-marine/10 py-6 text-xs text-marine/50 dark:border-warm-white/10 dark:text-warm-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>Menos ruido. Más avance.</span>
          <span>Proyectos · Equipos · Tareas</span>
        </footer>
      </div>
    </main>
  );
}