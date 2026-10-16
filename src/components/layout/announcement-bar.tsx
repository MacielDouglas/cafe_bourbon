export function AnnouncementBar() {
  const message = "Torra artesanal · Franca, São Paulo";
  const secondary = "Assinaturas a partir de R$ 90";

  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center text-[0.6875rem] font-medium tracking-[0.16em] uppercase sm:text-xs">
        <span>{message}</span>
        <span aria-hidden className="hidden opacity-40 sm:inline">
          —
        </span>
        <span className="hidden sm:inline">{secondary}</span>
      </div>
    </div>
  );
}
