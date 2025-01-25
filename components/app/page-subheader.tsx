import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function PageSubheader({ title, subtitle, className }: Props) {
  return (
    <div className={cn("space-y-1", className)}>
      <h3 className="text-2xl font-semibold">{title}</h3>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
