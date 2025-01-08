import {
  Calendar,
  Clock,
  Database,
  CalendarCheck,
  Trash,
  Banknote,
  BadgeCheck,
  Badge,
} from "lucide-react";
import Field from "@/components/app/field";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { DbOrg } from "@/db/schema/orgs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullInitials } from "@/lib/helpers/user";
import OrgTier from "@/components/app/org-tier";
import OrgStatus from "@/components/app/org-status";
import Date from "@/components/app/date";

type Props = {
  org: DbOrg;
  verifyHref: string;
  deleteHref: string;
};

export default function OrgDetails({ org, deleteHref, verifyHref }: Props) {
  const t = useTranslations("Org");
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
            <AvatarImage src="" alt={org.name} />
            <AvatarFallback className="rounded-lg">
              {getFullInitials(org.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <p className="font-semibold">{org.name}</p>
          </div>
        </div>
      </div>
      <div className="space-x-2">
        {org.status === "verifying" && (
          <Link
            href={verifyHref}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <BadgeCheck className="size-3" />
            {tGeneric("verify")}
          </Link>
        )}
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
        <Field icon={<Banknote className="size-4" />} label={t("tier")}>
          <OrgTier tier={org.tier}>{t(`tiers.${org.tier}`)}</OrgTier>
        </Field>
        <Field icon={<Badge className="size-4" />} label={t("status")}>
          <OrgStatus status={org.status}>
            {t(`statuses.${org.status}`)}
          </OrgStatus>
        </Field>
        <Field
          icon={<CalendarCheck className="size-4" />}
          label={t("verifiedAt")}
        >
          <Date date={org.verifiedAt} />
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {org.id}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("createdAt")}
        >
          <Date date={org.createdAt} />
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          <Date date={org.updatedAt} />
        </Field>
      </section>
    </>
  );
}
