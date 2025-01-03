import {
  Calendar,
  Clock,
  Database,
  Globe,
  CalendarCheck,
  Trash,
} from "lucide-react";
import Field from "@/components/app/field";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Org } from "@/db/schema/orgs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFullInitials } from "@/lib/helpers/user";

type Props = {
  org: Org;
  deleteHref: string;
};

export default function OrgDetails({ org, deleteHref }: Props) {
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
      <div>
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
        <Field
          icon={<CalendarCheck className="size-4" />}
          label={t("verifiedAt")}
        >
          {org.verifiedAt?.toLocaleString()}
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {org.id}
        </Field>
        <Field icon={<Globe className="size-4" />} label={tGeneric("publicId")}>
          {org.publicId}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("createdAt")}
        >
          {org.createdAt.toLocaleString()}
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          {org.updatedAt?.toLocaleString()}
        </Field>
      </section>
    </>
  );
}
