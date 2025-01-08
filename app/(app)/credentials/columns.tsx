"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import CredentialDialog from "./dialog";
import { DbCredential } from "@/db/schema/credentials";
import { Badge } from "@/components/ui/badge";
import { FormVersion } from "@/lib/models/form-version";

export const credentialColumns: ColumnDef<DbCredential>[] = [
  {
    accessorKey: "title",
    header: function CellHeader() {
      const t = useTranslations("Form");
      return t("titleProp");
    },
    cell: function CellCompodnent({ row }) {
      return row.original.formVersion
        ? FormVersion.fromProps(row.original.formVersion).title
        : undefined;
    },
  },
  {
    accessorKey: "type",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("type");
    },
    cell: function CellComponent({ row }) {
      const type = row.original.formVersion
        ? FormVersion.fromProps(row.original.formVersion).type
        : [];
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
    cell: function CellComponent({}) {
      return <Badge>V{0}</Badge>;
    },
  },
  {
    accessorKey: "issuer",
    header: function CellHeader() {
      const t = useTranslations("Credential");
      return t("issuer");
    },
    cell: function CellCompodnent({ row }) {
      return row.original.user?.fullName;
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <CredentialDialog credential={row.original} />;
    },
  },
];
