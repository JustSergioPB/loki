import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import { HtmlHTMLAttributes } from "react";

export interface InfoPanelProps extends HtmlHTMLAttributes<HTMLDivElement> {
  variant: "danger" | "warning";
  type?: "vertical" | "horizontal";
  label: string;
  message: string;
}

export default function InfoPanel({
  variant,
  label,
  type,
  message,
  className,
}: InfoPanelProps) {
  let icon = <TriangleAlert className="size-4" />;
  let bg = "bg-red-100";
  let text = "text-red-500";

  if (variant === "warning") {
    icon = <TriangleAlert className="size-4" />;
    bg = "bg-amber-100";
    text = "text-amber-500";
  }

  return (
    <p
      className={cn(
        "p-2 rounded-md text-sm gap-1",
        bg,
        text,
        type === "vertical" ? "flex flex-col" : "inline-flex items-center",
        className
      )}
    >
      <span className="flex items-center gap-1">
        {icon}
        <span className="font-bold">{label}.</span>
      </span>
      {message}
    </p>
  );
}
