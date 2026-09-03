import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// Carga el archivo .env ubicado en la raíz del monorepo
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});