export const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-PT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "—";
