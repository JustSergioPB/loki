import { UserStatus as UserStatuses } from "@/lib/models/user";
import { cn } from "@/lib/utils";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  status: UserStatuses;
}

export default function UserStatus({ status, children }: Props) {
  let bg = "bg-neutral-100";
  let textColor = "text-neutral-500";

  switch (status) {
    case "active":
      bg = "bg-emerald-100";
      textColor = "text-emerald-500";
      break;
    case "banned":
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
