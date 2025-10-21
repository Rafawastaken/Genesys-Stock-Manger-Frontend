// src/components/genesys-ui/Hightlight.tsx

export default function Highlight({
  text,
  query,
}: {
  text?: string | null;
  query: string | null;
}) {
  const t = text ?? "";
  if (!query) return <>{t}</>;
  const i = t.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return <>{t}</>;
  const before = t.slice(0, i);
  const match = t.slice(i, i + query.length);
  const after = t.slice(i + query.length);
  return (
    <>
      {before}
      <mark className="rounded bg-accent px-0.5 py-0.5 text-foreground">
        {match}
      </mark>
      {after}
    </>
  );
}
