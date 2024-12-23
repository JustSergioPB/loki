"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import OrgDialog from "./dialog";
import { Org } from "@/db/schema/orgs";

export const userColumns: ColumnDef<Org>[] = [
  {
    accessorKey: "name",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("name");
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <OrgDialog org={row.original} />;
    },
  },
];
