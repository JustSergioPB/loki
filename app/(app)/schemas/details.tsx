import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash,
  Calendar,
  Clock,
  Database,
  Globe,
  History,
  Rss,
  Text,
  Heading1,
  FileJson,
  Archive,
} from "lucide-react";
import Field from "@/components/app/field";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SchemaWithVersions } from "@/db/schema/schemas";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Schema } from "@/lib/models/schema";
import SchemaVersionStatus from "@/components/app/schema-version-status";
import { Badge } from "@/components/ui/badge";
import { DialogDescription } from "@radix-ui/react-dialog";

type Props = {
  schemaWithVersions: SchemaWithVersions;
  editHref: string;
  publishHref: string;
  archiveHref: string;
  deleteHref: string;
};

export default function SchemaDetails({
  schemaWithVersions,
  editHref,
  publishHref,
  archiveHref,
  deleteHref,
}: Props) {
  const t = useTranslations("SchemaVersion");
  const tSchema = useTranslations("Schema");
  const tGeneric = useTranslations("Generic");
  const schema = Schema.fromProps(schemaWithVersions);
  const latest = schema.getLatestVersion();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{tSchema("seeTitle")}</DialogTitle>
        <DialogDescription>{tSchema("seeDescription")}</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-4">
        <Link href={editHref} className={cn(buttonVariants({ size: "sm" }))}>
          <Pencil className="size-3" />
          {tGeneric("edit")}
        </Link>
        {latest.props.status === "draft" && (
          <Link
            href={publishHref}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Rss className="size-3" />
            {t("publish")}
          </Link>
        )}
        {latest.props.status === "published" && (
          <Link
            href={archiveHref}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Archive className="size-3" />
            {t("archive")}
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
          {schema.props.updatedAt?.toLocaleString()}
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("createdAt")}
        >
          {schema.props.createdAt.toLocaleString()}
        </Field>
      </section>
    </>
  );
}
