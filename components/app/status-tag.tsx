import { cn } from "@/lib/utils";

export const statusTagVariants = [
  "success",
  "error",
  "warning",
  "inactive",
] as const;
export type StatusTagVariant = (typeof statusTagVariants)[number];

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  variant: StatusTagVariant;
}

export default function StatusTag({ variant, children }: Props) {
  let bg = "bg-neutral-100";
  let textColor = "text-neutral-500";

  switch (variant) {
    case "success":
      bg = "bg-emerald-100";
      textColor = "text-emerald-500";
      break;
    case "warning":
      bg = "bg-amber-100";
      textColor = "text-amber-500";
      break;
    case "error":
      bg = "bg-red-100";
      textColor = "text-red-500";
      break;
    default:
      bg = "bg-neutral-100";
      textColor = "text-neutral-500";
      break;
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-md py-1 px-2", bg)}
    >
      <p className={cn("text-xs font-semibold", textColor)}>{children}</p>
    </div>
  );
}
