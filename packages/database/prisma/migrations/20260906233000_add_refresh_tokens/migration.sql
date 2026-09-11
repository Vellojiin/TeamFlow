ALTER TABLE "users"
ADD COLUMN "refreshTokenHash" TEXT,
ADD COLUMN "refreshTokenExpiresAt" TIMESTAMP(3);
