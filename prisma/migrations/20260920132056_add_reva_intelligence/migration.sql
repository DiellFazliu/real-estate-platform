-- CreateTable
CREATE TABLE "property_intelligence" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "price_per_m2" DOUBLE PRECISION,
    "comparable_average" DOUBLE PRECISION,
    "comparable_median" DOUBLE PRECISION,
    "comparable_count" INTEGER NOT NULL DEFAULT 0,
    "price_difference_pct" DOUBLE PRECISION,
    "market_position" VARCHAR(20),
    "percentile" DOUBLE PRECISION,
    "trend_direction" VARCHAR(20),
    "trend_pct_12m" DOUBLE PRECISION,
    "trend_pct_5y" DOUBLE PRECISION,
    "trend_confidence" DOUBLE PRECISION,
    "location_score" DOUBLE PRECISION,
    "location_insights" JSONB,
    "estimated_rent" DOUBLE PRECISION,
    "gross_rental_yield" DOUBLE PRECISION,
    "ai_summary" TEXT,
    "warnings" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" VARCHAR(20) NOT NULL DEFAULT '1.0',

    CONSTRAINT "property_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_history" (
    "id" SERIAL NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(100),
    "property_type" VARCHAR(50),
    "listing_type" VARCHAR(20) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "avg_price_m2" DOUBLE PRECISION NOT NULL,
    "median_price_m2" DOUBLE PRECISION,
    "sample_size" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_intelligence_property_id_key" ON "property_intelligence"("property_id");

-- CreateIndex
CREATE INDEX "property_intelligence_property_id_idx" ON "property_intelligence"("property_id");

-- CreateIndex
CREATE INDEX "market_history_city_year_idx" ON "market_history"("city", "year");

-- CreateIndex
CREATE INDEX "market_history_city_neighborhood_year_idx" ON "market_history"("city", "neighborhood", "year");

-- CreateIndex
CREATE UNIQUE INDEX "market_history_city_neighborhood_property_type_listing_type_key" ON "market_history"("city", "neighborhood", "property_type", "listing_type", "year", "month");

-- AddForeignKey
ALTER TABLE "property_intelligence" ADD CONSTRAINT "property_intelligence_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
