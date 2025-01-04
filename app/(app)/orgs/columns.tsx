"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import OrgDialog from "./dialog";
import { DbOrg } from "@/db/schema/orgs";
import OrgTier from "@/components/app/org-tier";

export const userColumns: ColumnDef<DbOrg>[] = [
  {
    accessorKey: "name",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("name");
    },
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
    id: "actions",
    cell: function CellComponent({ row }) {
      return <OrgDialog org={row.original} />;
    },
  },
];
