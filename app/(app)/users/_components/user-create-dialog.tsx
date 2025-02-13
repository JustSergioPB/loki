"use client";

import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserForm from "./user-form";
import { useTranslations } from "next-intl";

export default function UserCreateDialog() {
  const t = useTranslations("User");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <Button>
          <CirclePlus />
          {t("user")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>
        <UserForm onSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
