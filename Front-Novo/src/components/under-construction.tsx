export default function UnderConstruction({
  title,
  description = "Esta página está em desenvolvimento. Em breve novidades!",
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}