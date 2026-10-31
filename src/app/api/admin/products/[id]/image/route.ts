import { connection } from "next/server";
import { requireOwnerApi } from "@/infrastructure/auth/api-guard";
import {
  domainErrorResponse,
  type IdRouteContext,
} from "@/infrastructure/http/api";
import { isAllowedImageMime, processImageToWebp } from "@/infrastructure/images/webp";
import { catalogAdminUseCases } from "@/modules/catalog/presentation/composition";

export async function POST(request: Request, context: IdRouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;

  let file: FormDataEntryValue | null;
  try {
    const form = await request.formData();
    file = form.get("file");
  } catch {
    return Response.json({ error: "Envio inválido." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return Response.json({ error: "Envie um arquivo de imagem." }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "Arquivo vazio." }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return Response.json(
      { error: "A imagem deve ter no máximo 4 MB." },
      { status: 413 },
    );
  }
  // Tipo declarado precisa estar na allow-list; o conteúdo é validado depois pelo sharp.
  if (file.type && !isAllowedImageMime(file.type)) {
    return Response.json({ error: "Formato de imagem não suportado." }, { status: 415 });
  }

  try {
    const image = await processImageToWebp(Buffer.from(await file.arrayBuffer()));
    const { setProductImage } = catalogAdminUseCases();
    const media = await setProductImage.execute(id, image);
    return Response.json({
      imageUrl: `/api/media/${media.id}`,
      byteSize: image.byteSize,
      width: image.width,
      height: image.height,
    });
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível processar a imagem.");
  }
}

export async function DELETE(_request: Request, context: IdRouteContext) {
  await connection();
  const guard = await requireOwnerApi();
  if (guard.response) return guard.response;

  const { id } = await context.params;
  try {
    const { removeProductImage } = catalogAdminUseCases();
    await removeProductImage.execute(id);
    return Response.json({ ok: true });
  } catch (error) {
    return domainErrorResponse(error, "Não foi possível remover a imagem.");
  }
}
