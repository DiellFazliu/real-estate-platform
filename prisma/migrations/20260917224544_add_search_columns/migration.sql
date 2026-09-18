-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "primary_image_url" TEXT;

-- CreateIndex
CREATE INDEX "properties_status_price_idx" ON "properties"("status", "price");

-- CreateIndex
CREATE INDEX "properties_status_city_idx" ON "properties"("status", "city");

-- CreateIndex
CREATE INDEX "properties_status_bedrooms_idx" ON "properties"("status", "bedrooms");

-- CreateIndex
CREATE INDEX "properties_status_listing_type_idx" ON "properties"("status", "listing_type");

-- CreateIndex
CREATE INDEX "properties_status_property_type_idx" ON "properties"("status", "property_type");

-- CreateIndex
CREATE INDEX "properties_review_status_status_idx" ON "properties"("review_status", "status");
