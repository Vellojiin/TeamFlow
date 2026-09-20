"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/src/modules/auth/infrastructure/auth-context";
import { apiClient, ApiError } from "@/src/core/api-client";

interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: string;
  taskCount?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");

  const [error, setError] = useState("");

  const currentOrganization = organizations[0] ?? null;

  const fetchOrganizations = useCallback(async () => {
    setIsLoadingOrganizations(true);
    setError("");

    try {
      const data = await apiClient<Organization[]>("/organizations");
      setOrganizations(data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, []);

  const fetchProjects = useCallback(async (organizationId: string) => {
    setIsLoadingProjects(true);
    setError("");

    try {
      const data = await apiClient<Project[]>(
        `/organizations/${organizationId}/projects`,
      );

      setProjects(data);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (currentOrganization) {
      void fetchProjects(currentOrganization.id);
    } else {
      setProjects([]);
    }
  }, [currentOrganization, fetchProjects]);

  async function handleCreateOrganization(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = organizationName.trim();

    if (!name) {
      setError("Introduce un nombre para la organización.");
      return;
    }

    setIsCreatingOrganization(true);
    setError("");

    try {
      const organization = await apiClient<Organization>("/organizations", {
        method: "POST",
        body: JSON.stringify({
          name,
        }),
      });

      setOrganizations([organization]);
      setOrganizationName("");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsCreatingOrganization(false);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = projectName.trim();

    if (!name || !currentOrganization) {
      return;
    }

    setIsCreatingProject(true);
    setError("");

    try {
      const project = await apiClient<Project>(
        `/organizations/${currentOrganization.id}/projects`,
        {
          method: "POST",
          body: JSON.stringify({
            name,
          }),
        },
      );

      setProjects((currentProjects) => [project, ...currentProjects]);
      setProjectName("");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsCreatingProject(false);
    }
  }

  function getErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Ha ocurrido un error. Inténtalo nuevamente.";
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  if (isLoadingOrganizations) {
    return (
      <DashboardLoading />
    );
  }

  if (!currentOrganization) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-3xl border border-marine/10 bg-white p-8 text-center shadow-xl shadow-marine/5 dark:border-warm-white/10 dark:bg-[#0d2739] sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/10 text-2xl text-electric">
            +
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-electric">
            Bienvenido a TeamFlow
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Hola, {user?.name}
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-marine/60 dark:text-warm-white/60">
            Crea tu primera organización para empezar a gestionar proyectos,
            tareas y equipos desde un mismo lugar.
          </p>

          {error && <ErrorMessage message={error} />}

          <form
            onSubmit={handleCreateOrganization}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              placeholder="Nombre de tu organización"
              disabled={isCreatingOrganization}
              required
              className="min-w-0 flex-1 rounded-xl border border-marine/15 bg-[#f4f6f2] px-4 py-3 text-sm outline-none transition focus:border-electric focus:ring-2 focus:ring-electric/20 disabled:opacity-60 dark:border-warm-white/15 dark:bg-[#081b2a]"
            />

            <button
              type="submit"
              disabled={isCreatingOrganization}
              className="rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white shadow-lg shadow-electric/20 transition hover:bg-electric/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingOrganization ? "Creando..." : "Crear organización"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-electric">
            {currentOrganization.name}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-marine/60 dark:text-warm-white/60">
            Hola, {user?.name}. Aquí tienes el estado de tus proyectos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setProjectName("")}
          className="rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white shadow-lg shadow-electric/20 transition hover:bg-electric/90"
        >
          + Nuevo proyecto
        </button>
      </header>

      {error && <ErrorMessage message={error} />}

      <section className="mb-8 rounded-2xl border border-marine/10 bg-white/70 p-5 dark:border-warm-white/10 dark:bg-[#0d2739]/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-marine/45 dark:text-warm-white/45">
              Organización actual
            </p>
            <h2 className="mt-1 text-lg font-bold">
              {currentOrganization.name}
            </h2>
          </div>

          <p className="text-sm text-marine/50 dark:text-warm-white/50">
            Creada el {formatDate(currentOrganization.createdAt)}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Proyectos</h2>
            <p className="mt-1 text-sm text-marine/50 dark:text-warm-white/50">
              Organiza el trabajo de tu equipo.
            </p>
          </div>

          <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-bold text-mint">
            {projects.length}{" "}
            {projects.length === 1 ? "proyecto" : "proyectos"}
          </span>
        </div>

        {isLoadingProjects ? (
          <ProjectsLoading />
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-marine/15 bg-white/50 px-6 py-14 text-center dark:border-warm-white/15 dark:bg-[#0d2739]/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10 text-xl text-mint">
              +
            </div>

            <h3 className="mt-5 text-lg font-bold">
              Crea tu primer proyecto
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-marine/55 dark:text-warm-white/55">
              Empieza a organizar el trabajo creando un proyecto para tu
              equipo.
            </p>

            <button
              type="button"
              onClick={() => setProjectName("")}
              className="mt-6 rounded-xl border border-electric px-5 py-3 text-sm font-bold text-electric transition hover:bg-electric hover:text-white"
            >
              Crear proyecto
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/projects/${project.id}`,
                  )
                }
                className="group rounded-2xl border border-marine/10 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-electric/30 hover:shadow-lg hover:shadow-electric/5 dark:border-warm-white/10 dark:bg-[#0d2739]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-electric/10 text-electric">
                    #
                  </div>

                  <span className="text-lg text-marine/30 transition group-hover:text-electric dark:text-warm-white/30">
                    →
                  </span>
                </div>

                <h3 className="mt-6 truncate text-lg font-bold">
                  {project.name}
                </h3>

                <div className="mt-5 flex items-center justify-between border-t border-marine/10 pt-4 text-xs text-marine/50 dark:border-warm-white/10 dark:text-warm-white/50">
                  <span>
                    {project.taskCount ?? 0}{" "}
                    {project.taskCount === 1 ? "tarea" : "tareas"}
                  </span>

                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {isCreatingProject === false && (
        <ProjectForm
          projectName={projectName}
          setProjectName={setProjectName}
          onSubmit={handleCreateProject}
          isLoading={isCreatingProject}
        />
      )}
    </main>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
    >
      {message}
    </div>
  );
}

function DashboardLoading() {
  return (
    <main className="mx-auto max-w-7xl animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-28 rounded bg-marine/10 dark:bg-warm-white/10" />
        <div className="mt-3 h-10 w-48 rounded bg-marine/10 dark:bg-warm-white/10" />
        <div className="mt-3 h-4 w-72 rounded bg-marine/10 dark:bg-warm-white/10" />
      </div>

      <div className="h-28 rounded-2xl bg-marine/10 dark:bg-warm-white/10" />
    </main>
  );
}

function ProjectsLoading() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-52 animate-pulse rounded-2xl bg-marine/10 dark:bg-warm-white/10"
        />
      ))}
    </div>
  );
}

interface ProjectFormProps {
  projectName: string;
  setProjectName: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

function ProjectForm({
  projectName,
  setProjectName,
  onSubmit,
  isLoading,
}: ProjectFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden"
        aria-hidden="true"
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0d2739]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-electric">
                  Nuevo proyecto
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  Crea un proyecto
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-marine/50 hover:text-marine dark:text-warm-white/50 dark:hover:text-warm-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(event) => {
                onSubmit(event);
                setIsOpen(false);
              }}
              className="mt-6"
            >
              <label
                htmlFor="project-name"
                className="mb-2 block text-sm font-semibold"
              >
                Nombre del proyecto
              </label>

              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Ej. Rediseño de producto"
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-marine/15 bg-[#f4f6f2] px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/20 dark:border-warm-white/15 dark:bg-[#081b2a]"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-marine/60 hover:bg-marine/5 dark:text-warm-white/60 dark:hover:bg-warm-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-electric px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {isLoading ? "Creando..." : "Crear proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}