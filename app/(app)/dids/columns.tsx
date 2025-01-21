"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import DIDDialog from "./dialog";
import { DIDWithOwner } from "@/db/schema/dids";

export const orgColumns: ColumnDef<DIDWithOwner>[] = [
  {
    accessorKey: "did",
    header: function CellHeader() {
      const t = useTranslations("Did");
      return t("did");
    },
  },
  {
    accessorKey: "org",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("org");
    },
    cell: function CellComponent({ row }) {
      return row.original.org.name;
    },
  },
  {
    accessorKey: "user",
    header: function CellHeader() {
      const t = useTranslations("User");
      return t("user");
    },
    cell: function CellComponent({ row }) {
      return row.original.user?.fullName;
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <DIDDialog did={row.original} />;
    },
  },
];
