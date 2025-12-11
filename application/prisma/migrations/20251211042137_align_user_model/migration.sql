-- AlignUserModel: Align User model with SaaS Starter Kit requirements

-- 1. Rename password to passwordHash
ALTER TABLE "users" RENAME COLUMN "password" TO "passwordHash";

-- 2. Add role column
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

-- 3. Add verificationToken column
ALTER TABLE "users" ADD COLUMN "verificationToken" TEXT;

-- 4. Make name NOT NULL
UPDATE "users" SET "name" = '' WHERE "name" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

-- 5. Convert emailVerified from DateTime to Boolean
ALTER TABLE "users" ADD COLUMN "email_verified_bool" BOOLEAN NOT NULL DEFAULT false;
UPDATE "users" SET "email_verified_bool" = true WHERE "emailVerified" IS NOT NULL;
ALTER TABLE "users" DROP COLUMN "emailVerified";
ALTER TABLE "users" RENAME COLUMN "email_verified_bool" TO "emailVerified";

-- 6. Create notes table
CREATE TABLE IF NOT EXISTS "notes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Create saas_subscriptions table
CREATE TABLE IF NOT EXISTS "saas_subscriptions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "status" TEXT,
  "plan" TEXT,
  "customerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saas_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
