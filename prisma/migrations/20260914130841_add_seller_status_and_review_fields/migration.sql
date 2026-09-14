-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "listed_by_id" INTEGER,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "review_status" VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by_id" INTEGER,
ADD COLUMN     "source" VARCHAR(20) NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_seller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seller_since" TIMESTAMP(3),
ADD COLUMN     "seller_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "properties_source_idx" ON "properties"("source");

-- CreateIndex
CREATE INDEX "properties_review_status_idx" ON "properties"("review_status");

-- CreateIndex
CREATE INDEX "properties_listed_by_id_idx" ON "properties"("listed_by_id");

-- CreateIndex
CREATE INDEX "users_is_seller_idx" ON "users"("is_seller");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_listed_by_id_fkey" FOREIGN KEY ("listed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
