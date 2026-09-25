-- AlterTable
ALTER TABLE "users" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN     "plan_updated_at" TIMESTAMP(3);
