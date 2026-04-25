-- Add denormalized active-variant price bounds for stable catalog sorting and filtering.
ALTER TABLE "Product"
ADD COLUMN "minPriceKurus" INTEGER,
ADD COLUMN "maxPriceKurus" INTEGER;

UPDATE "Product" AS p
SET
  "minPriceKurus" = bounds."minPriceKurus",
  "maxPriceKurus" = bounds."maxPriceKurus"
FROM (
  SELECT
    "productId",
    MIN("priceKurus") AS "minPriceKurus",
    MAX("priceKurus") AS "maxPriceKurus"
  FROM "ProductVariant"
  WHERE "isActive" = true
  GROUP BY "productId"
) AS bounds
WHERE p."id" = bounds."productId";

CREATE INDEX "Product_status_minPriceKurus_idx" ON "Product"("status", "minPriceKurus");
CREATE INDEX "Product_status_maxPriceKurus_idx" ON "Product"("status", "maxPriceKurus");
