"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import FormDialog from "./dialog";
import { DbForm } from "@/db/schema/forms";
import { Form } from "@/lib/models/form";
import { Badge } from "@/components/ui/badge";
import FormVersionStatus from "@/components/app/form-version-status";

export const formColumns: ColumnDef<DbForm>[] = [
  {
    accessorKey: "title",
    header: function CellHeader() {
      const t = useTranslations("Form");
      return t("titleProp");
    },
  },
  {
    accessorKey: "type",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("type");
    },
    cell: function CellComponent({ row }) {
      const type = Form.fromProps(row.original).latestVersion.type;
      return (
        <div className="flex items-center gap-1">
          {type.slice(1, 3).map((type, idx) => (
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
      return <Badge>V{row.original.versions.length}</Badge>;
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
      const status = Form.fromProps(row.original).latestVersion.props.status;

      return (
        <FormVersionStatus status={status}>
          {t(`statuses.${status}`)}
        </FormVersionStatus>
      );
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <FormDialog form={row.original} />;
    },
  },
];
