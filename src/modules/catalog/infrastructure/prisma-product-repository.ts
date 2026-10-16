import type { PrismaClient } from "@prisma/client";
import {
  clampPage,
  clampPageSize,
  type PaginatedProducts,
  type ProductFilter,
  type ProductRepository,
} from "@/modules/catalog/domain/repository";
import type { Product } from "@/modules/catalog/domain/product";
import {
  type ProductRecordWithProfiles,
  toDomainProduct,
} from "@/modules/catalog/infrastructure/prisma-mapper";

const includeProfiles = {
  coffeeProfile: true,
  cheeseProfile: true,
  wineProfile: true,
} as const;

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filter: ProductFilter): Promise<PaginatedProducts> {
    const page = clampPage(filter.page);
    const pageSize = clampPageSize(filter.pageSize);
    const search = filter.search?.trim();

    const where = {
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.availableOnly ? { available: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [records, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: includeProfiles,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: records.map(toDomainProduct),
      total,
      page,
      pageSize,
    };
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { slug },
      include: includeProfiles,
    });
    return record ? toDomainProduct(record as ProductRecordWithProfiles) : null;
  }

  async findByIds(ids: readonly string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const records = await this.prisma.product.findMany({
      where: { id: { in: [...ids] } },
      include: includeProfiles,
    });
    return records.map((record) =>
      toDomainProduct(record as ProductRecordWithProfiles),
    );
  }
}
