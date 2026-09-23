-- CreateTable
CREATE TABLE "hero_slides" (
    "id" SERIAL NOT NULL,
    "sanity_id" VARCHAR(100),
    "slug" VARCHAR(200),
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(255),
    "price" VARCHAR(100),
    "description" TEXT,
    "badge" VARCHAR(50),
    "image_url" TEXT,
    "image_alt" VARCHAR(255),
    "property_id" INTEGER,
    "custom_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source" VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    "created_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hero_slides_sanity_id_key" ON "hero_slides"("sanity_id");

-- CreateIndex
CREATE UNIQUE INDEX "hero_slides_slug_key" ON "hero_slides"("slug");

-- CreateIndex
CREATE INDEX "hero_slides_is_active_idx" ON "hero_slides"("is_active");

-- CreateIndex
CREATE INDEX "hero_slides_order_idx" ON "hero_slides"("order");

-- CreateIndex
CREATE INDEX "hero_slides_property_id_idx" ON "hero_slides"("property_id");

-- CreateIndex
CREATE INDEX "hero_slides_source_idx" ON "hero_slides"("source");

-- CreateIndex
CREATE INDEX "hero_slides_created_by_id_idx" ON "hero_slides"("created_by_id");

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
