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
import { DbForm } from "@/db/schema/forms";
import { useTranslations } from "next-intl";
import { Form } from "@/lib/models/form";
import FormVersionStatus from "@/components/app/form-version-status";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/page-header";
import ArchiveFormVersion from "./archive";
import DeleteFormVersion from "./delete";
import PublishFormVersion from "./publish";
import Date from "@/components/app/date";

type Props = {
  form: DbForm;
};

export default function FormDetails({ form }: Props) {
  const t = useTranslations("FormVersion");
  const tForm = useTranslations("Form");
  const tGeneric = useTranslations("Generic");
  const latest = Form.fromProps(form).latestVersion;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = latest.credentialSubject;

  return (
    <section className="p-6 lg:w-[620px] space-y-6">
      <PageHeader
        title={tForm("seeTitle")}
        subtitle={tForm("seeDescription")}
        className="p-0"
      />
      <div className="flex items-center gap-4">
        <Link
          href={`/forms/${form.id}?action=edit`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Pencil className="size-3" />
          {tGeneric("edit")}
        </Link>
        {latest.props.status === "draft" && <PublishFormVersion form={form} />}
        {latest.props.status === "published" && (
          <ArchiveFormVersion form={form} />
        )}
        <DeleteFormVersion form={form} />
      </div>
      <section className="space-y-4">
        <Field
          icon={<Heading1 className="size-4" />}
          label={tForm("titleProp")}
          type="vertical"
        >
          <p className="text-sm line-clamp-2">{form.title}</p>
        </Field>
        <Field
          icon={<ClipboardType className="size-4" />}
          label={t("type")}
          type="vertical"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {latest.type.slice(1).map((type, idx) => (
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
          <p className="text-sm line-clamp-4">{latest.description}</p>
        </Field>
        <Field icon={<Rss className="size-4" />} label={t("status")}>
          <FormVersionStatus status={latest.props.status}>
            {t(`statuses.${latest.props.status}`)}
          </FormVersionStatus>
        </Field>
        <Field icon={<History className="size-4" />} label={t("version")}>
          <Badge>V{form.versions.length}</Badge>
        </Field>
        <Field icon={<Timer className="size-4" />} label={t("validFrom")}>
          <Date date={latest.validFrom} />
        </Field>
        <Field icon={<TimerOff className="size-4" />} label={t("validUntil")}>
          <Date date={latest.validUntil} />
        </Field>
        <Field
          icon={<FileJson className="size-4" />}
          label={t("content")}
          type="vertical"
        >
          <pre className="w-full rounded-md border p-2">
            <code className="text-xs">{JSON.stringify(rest, null, 1)}</code>
          </pre>
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {form.id}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          <Date date={form.updatedAt} />
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("createdAt")}
        >
          <Date date={form.createdAt} />
        </Field>
      </section>
    </section>
  );
}
