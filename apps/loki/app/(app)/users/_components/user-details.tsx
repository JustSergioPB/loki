import UserRole from "@/components/app/user-role";
import { UserCheck, Shield, Calendar, Clock, Database } from "lucide-react";
import Field from "@/components/app/field";
import UserStatus from "@/components/app/user-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullInitials } from "@/lib/helpers/user";
import Link from "next/link";
import { DbUser } from "@/db/schema/users";
import { useTranslations } from "next-intl";
import Date from "@/components/app/date";
import { cn } from "@/lib/utils";

type Props = {
  user: DbUser;
  className?: string;
};

export default function UserDetails({ user, className }: Props) {
  const t = useTranslations("User");
  const tGeneric = useTranslations("Generic");

  return (
    <section className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-left">
          <Avatar className="size-12 rounded-lg">
            <AvatarImage src="" alt={user.fullName} />
            <AvatarFallback className="rounded-lg">
              {getFullInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <p className="font-semibold">{user.fullName}</p>
            <Link href={`mailto:${user.email}`} className="text-sm">
              {user.email}
            </Link>
          </div>
        </div>
      </div>
      <section className="space-y-4">
        <Field icon={<UserCheck className="size-4" />} label={t("status")}>
          <UserStatus status={user.status}>
            {t(`statuses.${user.status}`)}
          </UserStatus>
        </Field>
        <Field icon={<Shield className="size-4" />} label={t("role")}>
          <UserRole userRole={user.role}>{t(`roles.${user.role}`)}</UserRole>
        </Field>
        <Field icon={<Clock className="size-4" />} label={t("confirmedAt")}>
          <Date date={user.confirmedAt} />
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {user.id}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("createdAt")}
        >
          <Date date={user.createdAt} />
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          <Date date={user.updatedAt} />
        </Field>
      </section>
    </section>
  );
}
