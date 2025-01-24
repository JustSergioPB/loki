import { cn } from "@/lib/utils";
import {
  Pencil,
  Calendar,
  Clock,
  Database,
  History,
  Rss,
  Text,
  Heading1,
  FileJson,
  Timer,
  TimerOff,
  ClipboardType,
} from "lucide-react";
import Field from "@/components/app/field";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import FormVersionStatus from "@/components/app/form-version-status";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/page-header";
import ArchiveFormVersion from "./archive";
import DeleteFormVersion from "./delete";
import PublishFormVersion from "./publish";
import DateDisplay from "@/components/app/date";
import { DbFormVersion } from "@/db/schema/form-versions";

export default function FormDetails({
  formVersion,
}: {
  formVersion: DbFormVersion;
}) {
  const t = useTranslations("FormVersion");
  const tForm = useTranslations("Form");
  const tGeneric = useTranslations("Generic");
  const validFrom = formVersion.credentialSchema.properties.validFrom;
  const validUntil = formVersion.credentialSchema.properties.validUntil;

  return (
    <section className="p-6 lg:w-[620px] space-y-6">
      <PageHeader
        title={tForm("seeTitle")}
        subtitle={tForm("seeDescription")}
        className="p-0"
      />
      <div className="flex items-center gap-4">
        <Link
          href={`/forms/${formVersion.formId}?action=edit`}
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
        <Field
          icon={<Heading1 className="size-4" />}
          label={tForm("titleProp")}
          type="vertical"
        >
          <p className="text-sm line-clamp-2">
            {formVersion.credentialSchema.title}
          </p>
        </Field>
        <Field
          icon={<ClipboardType className="size-4" />}
          label={t("type")}
          type="vertical"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {formVersion.credentialSchema.properties.type.const
              .slice(1)
              .map((type, idx) => (
                <Badge variant="secondary" key={`${type}-${idx}`}>
                  {type}
                </Badge>
              ))}
          </div>
        </Field>
        <Field
          icon={<Text className="size-4" />}
          label={t("description")}
          type="vertical"
        >
          <p className="text-sm line-clamp-4">
            {formVersion.credentialSchema.description}
          </p>
        </Field>
        <Field icon={<Rss className="size-4" />} label={t("status")}>
          <FormVersionStatus status={formVersion.status}>
            {t(`statuses.${formVersion.status}`)}
          </FormVersionStatus>
        </Field>
        <Field icon={<History className="size-4" />} label={t("version")}>
          <Badge>V{0}</Badge>
        </Field>
        <Field icon={<Timer className="size-4" />} label={t("validFrom")}>
          <DateDisplay
            date={validFrom ? new Date(validFrom.const) : undefined}
          />
        </Field>
        <Field icon={<TimerOff className="size-4" />} label={t("validUntil")}>
          <DateDisplay
            date={validUntil ? new Date(validUntil.const) : undefined}
          />
        </Field>
        <Field
          icon={<FileJson className="size-4" />}
          label={t("content")}
          type="vertical"
        >
          <pre className="w-full rounded-md border p-2">
            <code className="text-xs">
              {JSON.stringify(
                formVersion.credentialSchema.properties.credentialSubject,
                null,
                1
              )}
            </code>
          </pre>
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
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
  );
}
