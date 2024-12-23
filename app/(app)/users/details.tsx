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
  Globe,
} from "lucide-react";
import Field from "@/components/app/field";
import UserStatus from "@/components/app/user-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullInitials } from "@/lib/helpers/user";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { UserWithOrg } from "@/db/schema/users";
import { DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

type Props = {
  user: UserWithOrg;
  editHref: string;
  deleteHref: string;
};

export default function UserDetails({ user, editHref, deleteHref }: Props) {
  const t = useTranslations("User");
  const tGeneric = useTranslations("Generic");

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-left">
          <Avatar className="size-12 rounded-lg">
            <AvatarImage src="" alt={user.fullName} />
            <AvatarFallback className="rounded-lg">
              {getFullInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <DialogTitle className="truncate font-semibold">
              {user.fullName}
            </DialogTitle>
            <Link href={`mailto:${user.email}`} className="truncate text-sm">
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
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Trash className="size-3" />
          {tGeneric("delete")}
        </Link>
      </div>
      <section className="space-y-4">
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {user.id}
        </Field>
        <Field icon={<Globe className="size-4" />} label={tGeneric("publicId")}>
          {user.publicId}
        </Field>
        <Field icon={<UserCheck className="size-4" />} label={t("status")}>
          <UserStatus status={user.status}>{t(user.status)}</UserStatus>
        </Field>
        <Field icon={<Shield className="size-4" />} label={t("role")}>
          <UserRole role={user.role}>{t(user.role)}</UserRole>
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
        <Field icon={<Clock className="size-4" />} label={t("confirmedAt")}>
          {user.confirmedAt?.toLocaleString()}
        </Field>
      </section>
    </>
  );
}
