import { getUser } from "@/lib/helpers/dal";
import { forbidden, notFound, redirect } from "next/navigation";
import { getFormVersionById } from "@/lib/models/form.model";
import { GoBackButton } from "@/components/app/go-back-button";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Clock, Pencil, History, BadgeCheck } from "lucide-react";
import Link from "next/link";
import PublishFormVersion from "../_components/form-publish-dialog";
import ArchiveFormVersion from "../_components/form-archive-dialog";
import DeleteFormVersion from "../_components/form-delete-dialog";
import DateDisplay from "@/components/app/date";
import Field from "@/components/app/field";
import { Badge } from "@/components/ui/badge";
import StatusTag, { StatusTagVariant } from "@/components/app/status-tag";
import { FormVersionStatus } from "@/lib/types/form-version";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Tabs from "../_components/form-tabs";

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

  const formVersion = await getFormVersionById(id);

  if (!formVersion) {
    notFound();
  }

  if (user.orgId !== formVersion.orgId) {
    forbidden();
  }

  const { title, description, types } = formVersion;

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <GoBackButton variant="ghost" size="sm" href="/forms" />
          <section className="flex items-center gap-2">
            {formVersion.status === "draft" && (
              <Link
                href={`/forms/${formVersion.id}/edit`}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                <Pencil className="size-3" />
                {tGeneric("edit")}
              </Link>
            )}
            {formVersion.status === "draft" && (
              <PublishFormVersion formVersion={formVersion} />
            )}
            {formVersion.status === "published" && (
              <ArchiveFormVersion formVersion={formVersion} />
            )}
            <DeleteFormVersion formVersion={formVersion} />
          </section>
        </div>
        <section className="flex p-6 gap-6">
          <section className="space-y-4 basis-1/2">
            <Field icon={<BadgeCheck className="size-4" />} label={t("status")}>
              <StatusTag variant={FORM_STATUS_VARIANTS[formVersion.status]}>
                {t(`statuses.${formVersion.status}`)}
              </StatusTag>
            </Field>
            <Field
              icon={<Clock className="size-4" />}
              label={tGeneric("createdAt")}
            >
              <DateDisplay date={formVersion.createdAt} />
            </Field>
          </section>
          <section className="space-y-4 basis-1/2">
            <Field icon={<History className="size-4" />} label={t("version")}>
              <Badge>V{formVersion.version}</Badge>
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("updatedAt")}
            >
              <DateDisplay date={formVersion.updatedAt} />
            </Field>
          </section>
        </section>
        <div className="p-6 bg-muted flex-auto overflow-y-auto h-0">
          <Card className="p-12 rounded-md">
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
              <div className="flex items-center gap-1">
                {types.map((type, idx) => (
                  <Badge variant="secondary" key={`${type}-${idx}`}>
                    {type}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
      <section className="basis-2/5 flex flex-col">
        <section className="p-6 space-y-6">
          <Tabs />
        </section>
      </section>
    </section>
  );
}
