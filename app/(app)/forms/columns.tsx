"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import FormDialog from "./dialog";
import { Badge } from "@/components/ui/badge";
import FormVersionStatus from "@/components/app/form-version-status";
import { DbFormVersion } from "@/db/schema/form-versions";

export const formColumns: ColumnDef<DbFormVersion>[] = [
  {
    accessorKey: "title",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("titleProp");
    },
    cell: function CellComponent({ row }) {
      return row.original.title;
    },
  },
  {
    accessorKey: "type",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("type");
    },
    cell: function CellComponent({ row }) {
      return (
        <div className="flex items-center gap-1">
          {row.original.types.slice(0, 2).map((type, idx) => (
            <Badge variant="secondary" key={`${type}-${idx}`}>
              {type}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "version",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("version");
    },
    cell: function CellComponent({ row }) {
      return <Badge>V{row.original.version}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("status");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("FormVersion");

      return (
        <FormVersionStatus status={row.original.status}>
          {t(`statuses.${row.original.status}`)}
        </FormVersionStatus>
      );
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <FormDialog formVersion={row.original} />;
    },
  },
];
