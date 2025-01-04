import { cn } from "@/lib/utils";
import UserRole from "@/components/app/user-role";
import {
  UserCheck,
  Pencil,
  Trash,
  Shield,
  Calendar,
  Clock,
  Database,
} from "lucide-react";
import Field from "@/components/app/field";
import UserStatus from "@/components/app/user-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullInitials } from "@/lib/helpers/user";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DbUser } from "@/db/schema/users";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

type Props = {
  user: DbUser;
  editHref: string;
  deleteHref: string;
};

export default function UserDetails({ user, editHref, deleteHref }: Props) {
  const t = useTranslations("User");
  const tGeneric = useTranslations("Generic");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("seeTitle")}</DialogTitle>
        <DialogDescription>{t("seeDescription")}</DialogDescription>
      </DialogHeader>
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
      <div className="flex items-center gap-4">
        <Link href={editHref} className={cn(buttonVariants({ size: "sm" }))}>
          <Pencil className="size-3" />
          {tGeneric("edit")}
        </Link>
        <Link
          href={deleteHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-red-500"
          )}
        >
          <Trash className="size-3" />
          {tGeneric("delete")}
        </Link>
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
          {user.confirmedAt?.toLocaleString()}
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {user.id}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("createdAt")}
        >
          {user.createdAt.toLocaleString()}
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          {user.updatedAt?.toLocaleString()}
        </Field>
      </section>
    </>
  );
}
