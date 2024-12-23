type Props = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex items-center justify-between p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold leading-none">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
