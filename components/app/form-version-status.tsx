import { FormVersionStatus as FormVersionStatuses } from "@/lib/models/form-version";
import { cn } from "@/lib/utils";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  status: FormVersionStatuses;
}

export default function FormVersionStatus({ status, children }: Props) {
  let bg = "bg-neutral-100";
  let textColor = "text-neutral-500";

  switch (status) {
    case "published":
      bg = "bg-emerald-100";
      textColor = "text-emerald-500";
      break;
    case "draft":
      bg = "bg-amber-100";
      textColor = "text-amber-500";
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
