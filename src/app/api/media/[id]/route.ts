import { connection } from "next/server";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  await connection();
  const { id } = await context.params;

  const { getMedia } = catalogAdminUseCases();
  const media = await getMedia.execute(id);
  if (!media) {
    return new Response("Imagem não encontrada.", { status: 404 });
  }

  const bytes = new Uint8Array(Buffer.from(media.base64, "base64"));
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": media.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
