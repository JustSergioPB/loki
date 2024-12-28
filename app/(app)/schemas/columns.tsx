"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import SchemaDialog from "./dialog";
import { SchemaWithVersions } from "@/db/schema/schemas";
import { Schema } from "@/lib/models/schema";
import { Badge } from "@/components/ui/badge";
import SchemaVersionStatus from "@/components/app/schema-version-status";

export const schemaColumns: ColumnDef<SchemaWithVersions>[] = [
  {
    accessorKey: "title",
    header: function CellHeader() {
      const t = useTranslations("Schema");
      return t("titleProp");
    },
  },
  {
    accessorKey: "version",
    header: function CellHeader() {
      const t = useTranslations("SchemaVersion");
      return t("version");
    },
    cell: function CellComponent({ row }) {
      return <Badge>V{row.original.versions.length}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: function CellHeader() {
      const t = useTranslations("SchemaVersion");
      return t("status");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("SchemaVersion");
      const schema = Schema.fromProps(row.original);
      const latest = schema.getLatestVersion();
      const status = latest.props.status;

      return (
        <SchemaVersionStatus status={status}>
          {t(`statuses.${status}`)}
        </SchemaVersionStatus>
      );
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <SchemaDialog schemaWithVersions={row.original} />;
    },
  },
];
