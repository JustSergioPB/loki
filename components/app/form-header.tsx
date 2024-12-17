export default function FormHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="space-y-1 mb-12">
      <h1 className="text-2xl font-semibold lg:text-3xl">{title}</h1>
      <p className="text-sm lg:text-base text-muted-foreground">{subtitle}</p>
    </header>
  );
}
