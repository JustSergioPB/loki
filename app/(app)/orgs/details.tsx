import {
  Calendar,
  Clock,
  Database,
  Globe,
  CalendarCheck,
  Trash,
} from "lucide-react";
import Field from "@/components/app/field";
import { DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Org } from "@/db/schema/orgs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  org: Org;
  deleteHref: string;
};

export default function OrgDetails({ org, deleteHref }: Props) {
  const t = useTranslations("Org");
  const tGeneric = useTranslations("Generic");

  return (
    <>
      <DialogTitle className="truncate font-semibold">{org.name}</DialogTitle>
      <div>
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
        <Field
          icon={<CalendarCheck className="size-4" />}
          label={t("verifiedAt")}
        >
          {org.verifiedAt?.toLocaleString()}
        </Field>
      </section>
    </>
  );
}
