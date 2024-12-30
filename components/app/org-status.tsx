import { cn } from "@/lib/utils";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  status: "verified" | "verifying" | "onboarding";
}

export default function OrgStatus({ status, children }: Props) {
  let bg = "bg-purple-100";
  let textColor = "text-purple-500";

  switch (status) {
    case "verified":
      bg = "bg-emerald-100";
      textColor = "text-emerald-500";
      break;
    case "verifying":
      bg = "bg-amber-100";
      textColor = "text-amber-500";
      break;
    default:
      bg = "bg-purple-100";
      textColor = "text-purple-500";
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
