import { cn } from "@/lib/utils";

interface Props extends React.HTMLProps<HTMLDivElement> {
  label: string;
  icon: React.ReactNode;
}

export default function Field({
  label,
  icon,
  children,
  className,
  ...props
}: Props) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <div className="flex items-center gap-1 text-neutral-500">
        {icon}
        <label className="block text-sm">{label}</label>
      </div>
      {children}
    </div>
  );
}
