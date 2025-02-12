import { cn } from "@/lib/utils";

interface Props extends React.HTMLProps<HTMLDivElement> {
  label: string;
  type?: "vertical" | "horizontal";
  icon: React.ReactNode;
}

export default function Field({
  label,
  icon,
  children,
  type,
  className,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        "flex text-sm font-medium",
        type === "vertical"
          ? "flex-col items-start space-y-1"
          : "flex-row items-center justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <label className="block font-normal">{label}</label>
      </div>
      {children}
    </div>
  );
}
