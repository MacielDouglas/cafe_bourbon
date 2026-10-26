import sharp from "sharp";
import { DomainError } from "@/modules/shared/domain/errors";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export interface ProcessedImage {
  base64: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  mimeType: "image/webp";
}

async function encode(
  input: Buffer,
  width: number,
  quality: number,
): Promise<Buffer> {
  return sharp(input, { failOn: "error" })
    .rotate()
    .resize({
      width,
      height: width,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();
}

/**
 * Converte qualquer imagem suportada para WebP, garantindo no máximo 4 MB na
 * entrada e na saída. SVG é recusado (pode conter scripts).
 */
export async function processImageToWebp(input: Buffer): Promise<ProcessedImage> {
  if (input.byteLength === 0) {
    throw new DomainError("Arquivo de imagem vazio.");
  }
  if (input.byteLength > MAX_IMAGE_BYTES) {
    throw new DomainError("A imagem deve ter no máximo 4 MB.");
  }

  try {
    const metadata = await sharp(input, { failOn: "error" }).metadata();
    if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
      throw new DomainError(
        "Formato não suportado. Envie JPG, PNG, WebP, GIF ou AVIF.",
      );
    }
    if (metadata.format === "svg") {
      throw new DomainError("SVG não é aceito por segurança.");
    }

    let width = Math.min(metadata.width ?? 2000, 2000);
    let quality = 85;
    let output = await encode(input, width, quality);

    while (output.byteLength > MAX_IMAGE_BYTES && quality > 45) {
      quality -= 10;
      output = await encode(input, width, quality);
    }
    while (output.byteLength > MAX_IMAGE_BYTES && width > 640) {
      width = Math.round(width * 0.75);
      quality = Math.max(45, quality - 10);
      output = await encode(input, width, quality);
    }

    if (output.byteLength > MAX_IMAGE_BYTES) {
      throw new DomainError("Não foi possível converter a imagem para até 4 MB.");
    }

    const result = await sharp(output).metadata();
    return {
      base64: output.toString("base64"),
      byteSize: output.byteLength,
      width: result.width ?? null,
      height: result.height ?? null,
      mimeType: "image/webp",
    };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError("Imagem inválida ou corrompida.");
  }
}

export function isAllowedImageMime(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}
