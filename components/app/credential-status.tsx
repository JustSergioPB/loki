import { CredentialStatus as Status } from "@/lib/types/credential";
import { cn } from "@/lib/utils";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  status: Status;
}

export default function CredentialStatus({ status, children }: Props) {
  let bg = "bg-amber-100";
  let textColor = "text-amber-500";

  switch (status) {
    case "signed":
      bg = "bg-emerald-100";
      textColor = "text-emerald-500";
      break;
    default:
      bg = "bg-amber-100";
      textColor = "text-amber-500";
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
