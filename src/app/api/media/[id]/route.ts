import { connection } from "next/server";
import { type IdRouteContext } from "@/infrastructure/http/api";
import { isAllowedImageMime } from "@/infrastructure/images/webp";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";

export async function GET(_request: Request, context: IdRouteContext) {
  await connection();
  const { id } = await context.params;

  const { getMedia } = catalogAdminUseCases();
  const media = await getMedia.execute(id);
  if (!media) {
    return new Response("Imagem não encontrada.", { status: 404 });
  }

  // Allow-list defensiva: o MIME vem do banco; fora da lista, não serve como imagem.
  const contentType = isAllowedImageMime(media.mimeType)
    ? media.mimeType
    : "application/octet-stream";

  const bytes = new Uint8Array(Buffer.from(media.base64, "base64"));
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
