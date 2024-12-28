"use client";

import UserRole from "@/components/app/user-role";
import UserStatus from "@/components/app/user-status";
import { UserWithOrg } from "@/db/schema/users";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import UserDialog from "./dialog";

export const userColumns: ColumnDef<UserWithOrg>[] = [
  {
    accessorKey: "fullName",
    header: function CellHeader() {
      const t = useTranslations("User");
      return t("fullName");
    },
  },
  {
    accessorKey: "email",
    header: function CellHeader() {
      const t = useTranslations("Generic");
      return t("email");
    },
  },
  {
    accessorKey: "role",
    header: function CellHeader() {
      const t = useTranslations("User");
      return t("role");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("User");
      const role = row.original.role;

      return <UserRole role={role}>{t(`roles.${role}`)}</UserRole>;
    },
  },
  {
    accessorKey: "org.name",
    header: function CellHeader() {
      const t = useTranslations("Org");
      return t("org");
    },
  },
  {
    accessorKey: "status",
    header: function CellHeader() {
      const t = useTranslations("User");
      return t("status");
    },
    cell: function CellComponent({ row }) {
      const t = useTranslations("User");
      const status = row.original.status;

      return <UserStatus status={status}>{t(`statuses.${status}`)}</UserStatus>;
    },
  },
  {
    id: "actions",
    cell: function CellComponent({ row }) {
      return <UserDialog user={row.original} />;
    },
  },
];
