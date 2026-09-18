-- DropIndex
DROP INDEX "properties_primary_agent_id_idx";

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "balconies" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "condition" VARCHAR(30),
ADD COLUMN     "distance_from_center" DECIMAL(10,2),
ADD COLUMN     "energy_class" VARCHAR(10),
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "furnished" VARCHAR(30),
ADD COLUMN     "has_air_conditioning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_elevator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_garden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_heating" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_internet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_parking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_pool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_security" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listing_type" VARCHAR(20) NOT NULL DEFAULT 'sale',
ADD COLUMN     "neighborhood" VARCHAR(100),
ADD COLUMN     "orientation" VARCHAR(30),
ADD COLUMN     "postal_code" VARCHAR(20),
ADD COLUMN     "price_per_m2" DECIMAL(10,2),
ADD COLUMN     "renovation_year" INTEGER,
ADD COLUMN     "total_floors" INTEGER,
ADD COLUMN     "year_built" INTEGER;

-- CreateIndex
CREATE INDEX "properties_neighborhood_idx" ON "properties"("neighborhood");

-- CreateIndex
CREATE INDEX "properties_property_type_idx" ON "properties"("property_type");

-- CreateIndex
CREATE INDEX "properties_listing_type_idx" ON "properties"("listing_type");

-- CreateIndex
CREATE INDEX "properties_bedrooms_idx" ON "properties"("bedrooms");

-- CreateIndex
CREATE INDEX "properties_area_idx" ON "properties"("area");
