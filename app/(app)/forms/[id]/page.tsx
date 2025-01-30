import { getUser } from "@/lib/helpers/dal";
import { forbidden, notFound, redirect } from "next/navigation";
import { getFormById } from "@/lib/models/form.model";
import { GoBackButton } from "@/components/app/go-back-button";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Database,
  Pencil,
  History,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import PublishFormVersion from "./publish";
import ArchiveFormVersion from "./archive";
import DeleteFormVersion from "./delete";
import DateDisplay from "@/components/app/date";
import Field from "@/components/app/field";
import { Badge } from "@/components/ui/badge";
import StatusTag, { StatusTagVariant } from "@/components/app/status-tag";
import { FormVersionStatus } from "@/lib/types/form";

const FORM_STATUS_VARIANTS: Record<FormVersionStatus, StatusTagVariant> = {
  draft: "warning",
  published: "success",
  archived: "inactive",
};

export default async function Form({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const t = await getTranslations("FormVersion");
  const tGeneric = await getTranslations("Generic");

  if (!user) {
    redirect("/login");
  }

  const formVersion = await getFormById(id);

  if (!formVersion) {
    notFound();
  }

  if (user.orgId !== formVersion.orgId) {
    forbidden();
  }

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-6 py-4 border-b">
          <GoBackButton variant="ghost" size="sm" />
        </div>
        <div className="p-6 bg-muted flex-auto overflow-y-auto h-0">
          <pre className="w-full rounded-md border p-2 bg-card">
            <code className="text-xs">
              {JSON.stringify(formVersion.credentialSchema, null, 1)}
            </code>
          </pre>
        </div>
      </section>
      <section className="basis-2/5 flex flex-col">
        <section className="p-6 space-y-6">
          <PageHeader title={t("seeTitle")} />
          <div className="flex items-center gap-2">
            <Link
              href={`/forms/${formVersion.id}/edit`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Pencil className="size-3" />
              {tGeneric("edit")}
            </Link>
            {formVersion.status === "draft" && (
              <PublishFormVersion formVersion={formVersion} />
            )}
            {formVersion.status === "published" && (
              <ArchiveFormVersion formVersion={formVersion} />
            )}
            <DeleteFormVersion formVersion={formVersion} />
          </div>
          <section className="space-y-4">
            <Field icon={<BadgeCheck className="size-4" />} label={t("status")}>
              <StatusTag variant={FORM_STATUS_VARIANTS[formVersion.status]}>
                {t(`statuses.${formVersion.status}`)}
              </StatusTag>
            </Field>
            <Field icon={<History className="size-4" />} label={t("version")}>
              <Badge>V{0}</Badge>
            </Field>
            <Field
              icon={<Database className="size-4" />}
              label={tGeneric("id")}
            >
              {formVersion.id}
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("updatedAt")}
            >
              <DateDisplay date={formVersion.updatedAt} />
            </Field>
            <Field
              icon={<Clock className="size-4" />}
              label={tGeneric("createdAt")}
            >
              <DateDisplay date={formVersion.createdAt} />
            </Field>
          </section>
        </section>
      </section>
    </section>
  );
}
