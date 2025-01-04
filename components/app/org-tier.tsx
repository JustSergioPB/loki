import { OrgTierType } from "@/lib/models/org-tier";
import { Building2, Flame, House, Warehouse } from "lucide-react";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  tier: OrgTierType;
}

export default function OrgTier({ tier, children }: Props) {
  let icon = <House className="size-4" />;

  if (tier == "pro") {
    icon = <Warehouse className="size-4" />;
  }

  if (tier == "enterprise") {
    icon = <Building2 className="size-4" />;
  }

  if (tier == "unbound") {
    icon = <Flame className="size-4" />;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {icon}
      <span>{children}</span>
    </div>
  );
}
