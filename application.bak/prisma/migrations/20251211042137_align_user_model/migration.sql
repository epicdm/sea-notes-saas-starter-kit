-- AlignUserModel: Align User model with SaaS Starter Kit requirements

-- 1. Rename password to passwordHash
ALTER TABLE "users" RENAME COLUMN "password" TO "passwordHash";

-- 2. Create enum types
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PENDING');
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');

-- 3. Add role column with enum type
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- 4. Add verificationToken column
ALTER TABLE "users" ADD COLUMN "verificationToken" TEXT;

-- 5. Make name NOT NULL
UPDATE "users" SET "name" = '' WHERE "name" IS NULL;
ALTER TABLE "users" ALTER COLUMN "name" SET DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

-- 6. Make email NOT NULL (should already be, but ensure it)
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- 7. Convert emailVerified from DateTime to Boolean
ALTER TABLE "users" ADD COLUMN "email_verified_bool" BOOLEAN NOT NULL DEFAULT false;
UPDATE "users" SET "email_verified_bool" = true WHERE "emailVerified" IS NOT NULL;
ALTER TABLE "users" DROP COLUMN "emailVerified";
ALTER TABLE "users" RENAME COLUMN "email_verified_bool" TO "emailVerified";

-- 8. Create notes table
CREATE TABLE IF NOT EXISTS "notes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 9. Create saas_subscriptions table with enum types
CREATE TABLE IF NOT EXISTS "saas_subscriptions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "status" "SubscriptionStatus",
  "plan" "SubscriptionPlan",
  "customerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saas_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
