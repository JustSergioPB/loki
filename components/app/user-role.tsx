import { UserRole as UserRoles } from "@/lib/types/user";
import { PenTool, Shield, ShieldPlus } from "lucide-react";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  userRole: UserRoles;
}

export default function UserRole({ role, children }: Props) {
  let icon = <PenTool className="size-4" />;

  if (role == "org-admin") {
    icon = <Shield className="size-4" />;
  }

  if (role == "admin") {
    icon = <ShieldPlus className="size-4" />;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {icon}
      <span>{children}</span>
    </div>
  );
}
