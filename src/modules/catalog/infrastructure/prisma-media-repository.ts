import type { PrismaClient } from "@prisma/client";
import type {
  MediaRecord,
  MediaRepository,
  ProductMediaInput,
} from "@/modules/catalog/domain/admin-repository";
import { DomainError } from "@/modules/shared/domain/errors";

function toMedia(record: {
  id: string;
  mimeType: string;
  base64: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
}): MediaRecord {
  return {
    id: record.id,
    mimeType: record.mimeType,
    base64: record.base64,
    byteSize: record.byteSize,
    width: record.width,
    height: record.height,
    createdAt: record.createdAt,
  };
}

export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<MediaRecord | null> {
    const record = await this.prisma.mediaAsset.findUnique({ where: { id } });
    return record ? toMedia(record) : null;
  }

  async replaceForProduct(
    productId: string,
    media: ProductMediaInput,
  ): Promise<MediaRecord> {
    return this.prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { mediaId: true },
        });
        if (!product) throw new DomainError("Produto não encontrado.");

        const created = await tx.mediaAsset.create({
          data: {
            mimeType: media.mimeType,
            base64: media.base64,
            byteSize: media.byteSize,
            width: media.width,
            height: media.height,
          },
        });
        await tx.product.update({
          where: { id: productId },
          data: { mediaId: created.id },
        });
        if (product.mediaId) {
          await tx.mediaAsset.deleteMany({ where: { id: product.mediaId } });
        }
        return toMedia(created);
      },
      { maxWait: 15_000, timeout: 30_000 },
    );
  }

  async removeForProduct(productId: string): Promise<void> {
    await this.prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { mediaId: true },
        });
        if (!product) throw new DomainError("Produto não encontrado.");
        await tx.product.update({
          where: { id: productId },
          data: { mediaId: null },
        });
        if (product.mediaId) {
          await tx.mediaAsset.deleteMany({ where: { id: product.mediaId } });
        }
      },
      { maxWait: 15_000, timeout: 20_000 },
    );
  }
}
