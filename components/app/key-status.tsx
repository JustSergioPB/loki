import { cn } from "@/lib/utils";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  status: boolean;
}

export default function KeyStatus({ status, children }: Props) {
  let bg = "bg-red-100";
  let textColor = "text-red-500";

  if (!status) {
    bg = "bg-emerald-100";
    textColor = "text-emerald-500";
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-md py-1 px-2", bg)}
    >
      <p className={cn("text-xs font-semibold", textColor)}>{children}</p>
    </div>
  );
}
