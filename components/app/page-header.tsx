import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  children,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center justify-between p-6", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold leading-none">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
