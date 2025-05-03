-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "energyStar" BOOLEAN NOT NULL DEFAULT false,
    "waterSense" BOOLEAN NOT NULL DEFAULT false,
    "energyUse" REAL,
    "waterUse" REAL,
    "imageUrl" TEXT,
    "efficiencyScore" INTEGER,
    "savingEstimate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "price_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendor" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "url" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,
    CONSTRAINT "price_listings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "preferWaterEfficiency" BOOLEAN NOT NULL DEFAULT true,
    "preferEnergyEfficiency" BOOLEAN NOT NULL DEFAULT true,
    "priceRangeMin" REAL NOT NULL DEFAULT 0,
    "priceRangeMax" REAL NOT NULL DEFAULT 2000,
    "preferredVendors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "saved_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userPreferenceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_products_userPreferenceId_fkey" FOREIGN KEY ("userPreferenceId") REFERENCES "user_preferences" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userPreferenceId" TEXT NOT NULL,
    "applianceType" TEXT NOT NULL,
    "applianceBrand" TEXT,
    "applianceModel" TEXT,
    "applianceYear" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "searchDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_history_userPreferenceId_fkey" FOREIGN KEY ("userPreferenceId") REFERENCES "user_preferences" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "products_brand_model_key" ON "products"("brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_products_userPreferenceId_productId_key" ON "saved_products"("userPreferenceId", "productId");
