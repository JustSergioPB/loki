import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  type?: "vertical" | "horizontal";
};

export default function Page({ children, type }: Props) {
  return (
    <div
      className={cn(
        "flex h-full",
        type === "horizontal" ? "flex-row" : "flex-col"
      )}
    >
      {children}
    </div>
  );
}
