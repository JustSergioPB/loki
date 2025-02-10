"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import CredentialDialog from "./credential-dialog";
import { Badge } from "@/components/ui/badge";
import { getCredentialStatus } from "@/lib/helpers/credential.helper";
import StatusTag from "@/components/app/status-tag";
import { CREDENTIAL_STATUS_VARIANTS } from "@/lib/constants/credential.const";
import { DbCredential } from "@/db/schema/credentials";

export const credentialColumns: ColumnDef<DbCredential>[] = [
  {
    accessorKey: "title",
    header: function CellHeader() {
      const t = useTranslations("FormVersion");
      return t("titleProp");
    },
    cell: function CellCompodnent({ row }) {
      return row.original.formVersion?.title;
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
          {row.original.formVersion?.types.slice(1, 3).map((type, idx) => (
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
      return <Badge>V{row.original.formVersion?.version}</Badge>;
    },
  },
  {
    accessorKey: "issuer",
    header: function CellHeader() {
      const t = useTranslations("Credential");
      return t("issuer");
    },
    cell: function CellCompodnent({ row }) {
      console.log(row.original);
      return row.original.issuer?.user?.fullName;
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
      const status = getCredentialStatus(row.original);

      return (
        <StatusTag variant={CREDENTIAL_STATUS_VARIANTS[status]}>
          {t(`statuses.${status}`)}
        </StatusTag>
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
