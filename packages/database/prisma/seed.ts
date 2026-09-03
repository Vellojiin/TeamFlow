import { PrismaPg } from "@prisma/adapter-pg";
import { OrganizationRole, PrismaClient } from "@prisma/client";
import path from "path";
import { Pool } from "pg";

// Carga el archivo .env desde la raíz del monorepo usando la API nativa de Node.js
try {
  process.loadEnvFile(path.resolve(__dirname, "../../../.env"));
} catch {
  // En caso de que se ejecute en un contexto con variables de entorno ya cargadas
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("La variable de entorno DATABASE_URL no está definida.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: {
      email: "demo@teamflow.local",
    },
    update: {},
    create: {
      email: "demo@teamflow.local",
      name: "Demo User",
      password: "development-only-password",
    },
  });

  const organization = await prisma.organization.upsert({
    where: {
      slug: "demo-company",
    },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo-company",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: OrganizationRole.OWNER,
    },
  });

  console.log("Datos de prueba creados exitosamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });