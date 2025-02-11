import { getUser } from "@/lib/helpers/dal";
import { FORBIDDEN, notFound, redirect } from "next/navigation";
import { getFormVersionById } from "@/lib/models/form-version.model";
import { GoBackButton } from "@/components/app/go-back-button";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Pencil,
  History,
  BadgeCheck,
  AlarmClockOff,
  AlarmClock,
} from "lucide-react";
import Link from "next/link";
import DateDisplay from "@/components/app/date";
import Field from "@/components/app/field";
import { Badge } from "@/components/ui/badge";
import StatusTag, { StatusTagVariant } from "@/components/app/status-tag";
import { FormVersionStatus } from "@/lib/types/form-version";
import JsonSchemaField from "../_components/json-schema-field";
import { SearchParams } from "@/lib/generics/search-params";
import FormTabs from "../_components/form-tabs";
import PageHeader from "@/components/app/page-header";
import FormActionDialog from "../_components/form-action-dialog";
import { getFormVersionStatus } from "@/lib/helpers/form-version.helper";

const FORM_STATUS_VARIANTS: Record<FormVersionStatus, StatusTagVariant> = {
  draft: "warning",
  published: "success",
  archived: "inactive",
};

export default async function Form({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
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
    FORBIDDEN();
  }

  const {
    title,
    description,
    types,
    credentialSubject,
    validFrom,
    validUntil,
  } = formVersion;

  const activeTab = typeof tab !== "string" ? "content" : tab;
  const status = getFormVersionStatus(formVersion);

  return (
    <section className="flex flex-col flex-1">
      <header className="px-6 py-4 flex justify-between border-b">
        <GoBackButton variant="ghost" href="/forms" />
        <section className="flex items-center gap-2">
          {status === "draft" && (
            <Link
              href={`/forms/${formVersion.id}/edit`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Pencil className="size-3" />
              {tGeneric("edit")}
            </Link>
          )}
          {status === "draft" && (
            <FormActionDialog formVersion={formVersion} action="publish" />
          )}
          {status === "published" && (
            <FormActionDialog formVersion={formVersion} action="archive" />
          )}
          <FormActionDialog formVersion={formVersion} action="delete" />
        </section>
      </header>
      <div className="flex flex-1">
        <aside className="basis-1/4 p-6 space-y-6 border-r flex flex-col justify-between">
          <FormTabs />
          <section className="space-y-4">
            <Field
              icon={<BadgeCheck className="size-4" />}
              label={t("status")}
              className="basis-1/4"
            >
              <StatusTag variant={FORM_STATUS_VARIANTS[status]}>
                {t(`statuses.${status}`)}
              </StatusTag>
            </Field>
            <Field
              icon={<History className="size-4" />}
              label={t("version")}
              className="basis-1/4"
            >
              <Badge>V{formVersion.version}</Badge>
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("createdAt")}
              className="basis-1/4"
            >
              <DateDisplay date={formVersion.createdAt} />
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("updatedAt")}
              className="basis-1/4"
            >
              <DateDisplay date={formVersion.updatedAt} />
            </Field>
          </section>
        </aside>
        <section
          className={cn(
            "basis-3/4 flex-col space-y-12 p-12 overflow-y-auto",
            activeTab === "content" ? "flex" : "hidden"
          )}
        >
          <section>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground mb-2">{description}</p>
            <div className="flex items-center gap-1">
              {types.map((type, idx) => (
                <Badge variant="secondary" key={`${type}-${idx}`}>
                  {type}
                </Badge>
              ))}
            </div>
          </section>
          {Object.entries(credentialSubject.properties ?? {})
            .filter(([key]) => key !== "id")
            .map(([key, schema]) => (
              <JsonSchemaField key={key} path={key} jsonSchema={schema} />
            ))}
        </section>
        <section
          className={cn(
            "basis-3/4 flex-col space-y-12 p-12 overflow-y-auto",
            activeTab === "validity" ? "flex" : "hidden"
          )}
        >
          <PageHeader
            title={t("validityTitle")}
            subtitle={t("validitySubtitle")}
          />
          {validFrom || validUntil ? (
            <div className="space-y-2">
              <Field
                icon={<AlarmClock className="size-4" />}
                label={t("validFrom")}
                className="basis-1/4"
              >
                <DateDisplay date={formVersion.validFrom} />
              </Field>
              <Field
                icon={<AlarmClock className="size-4" />}
                label={t("validUntil")}
                className="basis-1/4"
              >
                <DateDisplay date={formVersion.validUntil} />
              </Field>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="flex flex-col items-center space-y-1">
                <AlarmClockOff className="size-6" />
                <p className="text-lg font-semibold">No validity configured</p>
              </div>
              <Button disabled={status !== "draft"}>
                <Link
                  href={`forms/${formVersion.id}/edit?tab=validity`}
                  className="flex items-center gap-2"
                >
                  <Pencil />
                  Configure
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
