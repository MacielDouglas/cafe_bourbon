-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('COFFEE', 'CHEESE', 'WINE');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MENSAL', 'COFFEE_LOVERS', 'TRIMESTRAL');

-- CreateEnum
CREATE TYPE "GrindOption" AS ENUM ('GRAOS', 'MOIDO');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "priceCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "imageUrl" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "isDemoData" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeProfile" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "variety" TEXT,
    "process" TEXT,
    "roastLevel" INTEGER NOT NULL,
    "intensity" INTEGER NOT NULL,
    "acidity" INTEGER NOT NULL,
    "body" INTEGER NOT NULL,
    "notes" TEXT[],
    "brewMethods" TEXT[],

    CONSTRAINT "CoffeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheeseProfile" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "milkType" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "agingDays" INTEGER,
    "texture" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "acidity" INTEGER,
    "notes" TEXT[],
    "origin" TEXT,

    CONSTRAINT "CheeseProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WineProfile" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "grapes" TEXT[],
    "region" TEXT,
    "style" TEXT NOT NULL,
    "vintage" INTEGER,
    "body" INTEGER NOT NULL,
    "acidity" INTEGER NOT NULL,
    "tannins" INTEGER,
    "notes" TEXT[],
    "alcoholPct" DOUBLE PRECISION,

    CONSTRAINT "WineProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pairing" (
    "id" TEXT NOT NULL,
    "productIds" TEXT[],
    "origin" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pairing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionKey" TEXT,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "plan" "SubscriptionPlan" NOT NULL,
    "grind" "GrindOption" NOT NULL,
    "brewMethod" TEXT,
    "coffeeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_type_available_idx" ON "Product"("type", "available");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CoffeeProfile_productId_key" ON "CoffeeProfile"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CheeseProfile_productId_key" ON "CheeseProfile"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WineProfile_productId_key" ON "WineProfile"("productId");

-- CreateIndex
CREATE INDEX "Pairing_published_idx" ON "Pairing"("published");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE INDEX "CartItem_sessionKey_idx" ON "CartItem"("sessionKey");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- AddForeignKey
ALTER TABLE "CoffeeProfile" ADD CONSTRAINT "CoffeeProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheeseProfile" ADD CONSTRAINT "CheeseProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WineProfile" ADD CONSTRAINT "WineProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
