import type { PrismaClient } from "@prisma/client";
import type { AdminProductRepository } from "@/modules/catalog/domain/admin-repository";
import type { Product } from "@/modules/catalog/domain/product";
import type { ProductProfile } from "@/modules/catalog/domain/schemas";
import { toDomainProduct } from "@/modules/catalog/infrastructure/prisma-mapper";

const includeProfiles = {
  coffeeProfile: true,
  cheeseProfile: true,
  wineProfile: true,
} as const;

function coffeeData(profile: Extract<ProductProfile, { kind: "COFFEE" }>) {
  return {
    origin: profile.origin,
    variety: profile.variety,
    process: profile.process,
    roastLevel: profile.roastLevel,
    intensity: profile.intensity,
    acidity: profile.acidity,
    body: profile.body,
    notes: profile.notes,
    brewMethods: profile.brewMethods,
  };
}

function cheeseData(profile: Extract<ProductProfile, { kind: "CHEESE" }>) {
  return {
    milkType: profile.milkType,
    style: profile.style,
    agingDays: profile.agingDays,
    texture: profile.texture,
    intensity: profile.intensity,
    acidity: profile.acidity,
    notes: profile.notes,
    origin: profile.origin,
  };
}

function wineData(profile: Extract<ProductProfile, { kind: "WINE" }>) {
  return {
    grapes: profile.grapes,
    region: profile.region,
    style: profile.style,
    vintage: profile.vintage,
    body: profile.body,
    acidity: profile.acidity,
    tannins: profile.tannins,
    notes: profile.notes,
    alcoholPct: profile.alcoholPct,
  };
}

function baseData(product: Product) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    type: product.type,
    priceCents: product.price?.cents ?? null,
    stock: product.stock,
    available: product.available,
    isDemoData: product.isDemoData,
  };
}

export class PrismaAdminProductRepository implements AdminProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { id },
      include: includeProfiles,
    });
    return record ? toDomainProduct(record) : null;
  }

  async listAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      include: includeProfiles,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
    return records.map(toDomainProduct);
  }

  async create(product: Product): Promise<void> {
    const profile = product.profile;
    await this.prisma.product.create({
      data: {
        id: product.id.value,
        ...baseData(product),
        coffeeProfile:
          profile.kind === "COFFEE"
            ? { create: coffeeData(profile) }
            : undefined,
        cheeseProfile:
          profile.kind === "CHEESE"
            ? { create: cheeseData(profile) }
            : undefined,
        wineProfile:
          profile.kind === "WINE" ? { create: wineData(profile) } : undefined,
      },
    });
  }

  async update(product: Product): Promise<void> {
    const id = product.id.value;
    const profile = product.profile;

    await this.prisma.$transaction(
      async (tx) => {
        await tx.product.update({ where: { id }, data: baseData(product) });

        if (profile.kind === "COFFEE") {
          await tx.coffeeProfile.upsert({
            where: { productId: id },
            update: coffeeData(profile),
            create: { ...coffeeData(profile), productId: id },
          });
          await tx.cheeseProfile.deleteMany({ where: { productId: id } });
          await tx.wineProfile.deleteMany({ where: { productId: id } });
        } else if (profile.kind === "CHEESE") {
          await tx.cheeseProfile.upsert({
            where: { productId: id },
            update: cheeseData(profile),
            create: { ...cheeseData(profile), productId: id },
          });
          await tx.coffeeProfile.deleteMany({ where: { productId: id } });
          await tx.wineProfile.deleteMany({ where: { productId: id } });
        } else {
          await tx.wineProfile.upsert({
            where: { productId: id },
            update: wineData(profile),
            create: { ...wineData(profile), productId: id },
          });
          await tx.coffeeProfile.deleteMany({ where: { productId: id } });
          await tx.cheeseProfile.deleteMany({ where: { productId: id } });
        }
      },
      { maxWait: 15_000, timeout: 20_000 },
    );
  }

  async delete(id: string): Promise<void> {
    const record = await this.prisma.product.findUnique({
      where: { id },
      select: { mediaId: true },
    });
    await this.prisma.product.delete({ where: { id } });
    if (record?.mediaId) {
      await this.prisma.mediaAsset.deleteMany({
        where: { id: record.mediaId },
      });
    }
  }

  async setAvailability(id: string, available: boolean): Promise<void> {
    await this.prisma.product.update({ where: { id }, data: { available } });
  }

  async setStock(id: string, stock: number): Promise<void> {
    await this.prisma.product.update({ where: { id }, data: { stock } });
  }
}
