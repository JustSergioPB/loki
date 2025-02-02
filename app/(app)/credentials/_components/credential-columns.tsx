"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import CredentialDialog from "./credential-dialog";
import { CredentialWithIssuer } from "@/db/schema/credentials";
import { Badge } from "@/components/ui/badge";
import CredentialStatus from "@/components/app/credential-status";

export const credentialColumns: ColumnDef<CredentialWithIssuer>[] = [
  {
    accessorKey: "title",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("titleProp");
    },
    cell: function CellCompodnent({ row }) {
      return row.original.formVersion.title;
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
          {row.original.formVersion.types.slice(1, 3).map((type, idx) => (
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
      return row.original.issuer?.fullName;
    },
  },
  {
    accessorKey: "status",
    header: function CellHeader() {
      const t = useTranslations("Credential");
      return t("status");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("Credential");
      const status = row.original.status;

      return (
        <CredentialStatus status={status}>
          {t(`statuses.${status}`)}
        </CredentialStatus>
      );
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <CredentialDialog credential={row.original} />;
    },
  },
];
