"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import OrgDialog from "./dialog";
import { DbOrg } from "@/db/schema/orgs";
import OrgTier from "@/components/app/org-tier";
import OrgStatus from "@/components/app/org-status";

export const orgColumns: ColumnDef<DbOrg>[] = [
  {
    accessorKey: "name",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("name");
    },
  },
  {
    accessorKey: "did",
    header: "DID",
    cell: ({ row }) => row.original.did?.did,
  },
  {
    accessorKey: "tier",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("tier");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("Org");
      const tier = row.original.tier;

      return <OrgTier tier={tier}>{t(`tiers.${tier}`)}</OrgTier>;
    },
  },
  {
    accessorKey: "status",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("status");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("Org");
      const status = row.original.status;

      return <OrgStatus status={status}>{t(`statuses.${status}`)}</OrgStatus>;
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <OrgDialog org={row.original} />;
    },
  },
];
