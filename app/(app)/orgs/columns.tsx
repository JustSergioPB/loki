"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import OrgDialog from "./dialog";
import { Org } from "@/db/schema/orgs";
import OrgStatus from "@/components/app/org-status";
import Address from "@/components/app/address";

export const userColumns: ColumnDef<Org>[] = [
  {
    accessorKey: "name",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("name");
    },
  },
  {
    id: "address",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("address");
    },
    cell: function CellComponent({ row }) {
      return <Address address={row.original.address} />;
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
