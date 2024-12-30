import { cn } from "@/lib/utils";
import {
  Pencil,
  Calendar,
  Clock,
  Database,
  Globe,
  History,
  Rss,
  Text,
  Heading1,
  FileJson,
  Timer,
  TimerOff,
} from "lucide-react";
import Field from "@/components/app/field";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SchemaWithVersions } from "@/db/schema/schemas";
import { useTranslations } from "next-intl";
import { Schema } from "@/lib/models/schema";
import SchemaVersionStatus from "@/components/app/schema-version-status";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/app/page-header";
import ArchiveSchemaVersion from "./archive";
import DeleteSchemaVersion from "./delete";
import PublishSchemaVersion from "./publish";
import Date from "@/components/app/date";

type Props = {
  schemaWithVersions: SchemaWithVersions;
};

export default function SchemaDetails({ schemaWithVersions }: Props) {
  const t = useTranslations("SchemaVersion");
  const tSchema = useTranslations("Schema");
  const tGeneric = useTranslations("Generic");
  const schema = Schema.fromProps(schemaWithVersions);
  const latest = schema.getLatestVersion();

  return (
    <section className="p-6 h-full lg:w-[620px] space-y-6">
      <PageHeader
        title={tSchema("seeTitle")}
        subtitle={tSchema("seeDescription")}
        className="p-0"
      />
      <div className="flex items-center gap-4">
        <Link
          href={`/forms/${schemaWithVersions.id}?action=edit`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Pencil className="size-3" />
          {tGeneric("edit")}
        </Link>
        {latest.props.status === "draft" && (
          <PublishSchemaVersion schemaWithVersions={schemaWithVersions} />
        )}
        {latest.props.status === "published" && (
          <ArchiveSchemaVersion schemaWithVersions={schemaWithVersions} />
        )}
        <DeleteSchemaVersion schemaWithVersions={schemaWithVersions} />
      </div>
      <section className="space-y-4">
        <Field
          icon={<Heading1 className="size-4" />}
          label={tSchema("titleProp")}
          type="vertical"
        >
          <p className="text-sm line-clamp-2">{schema.props.title}</p>
        </Field>
        <Field
          icon={<Text className="size-4" />}
          label={t("description")}
          type="vertical"
        >
          <p className="text-sm line-clamp-4">{latest.description}</p>
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
            <code className="text-xs">
              {JSON.stringify(latest.credentialSubject, null, 1)}
            </code>
          </pre>
        </Field>
        <Field icon={<Rss className="size-4" />} label={t("status")}>
          <SchemaVersionStatus status={latest.props.status}>
            {t(`statuses.${latest.props.status}`)}
          </SchemaVersionStatus>
        </Field>
        <Field icon={<History className="size-4" />} label={t("version")}>
          <Badge>V{schemaWithVersions.versions.length}</Badge>
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {schema.id}
        </Field>
        <Field icon={<Globe className="size-4" />} label={tGeneric("publicId")}>
          {schema.publicId}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          <Date date={schema.props.updatedAt} />
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("createdAt")}
        >
          <Date date={schema.props.createdAt} />
        </Field>
      </section>
    </section>
  );
}
