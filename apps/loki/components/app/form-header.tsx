import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
}

export default function FormHeader({ title, subtitle, className }: Props) {
  return (
    <header className={cn("space-y-1 mb-12", className)}>
      <h1 className="text-2xl font-semibold lg:text-3xl">{title}</h1>
      <p className="text-sm lg:text-base text-muted-foreground">{subtitle}</p>
    </header>
  );
}
