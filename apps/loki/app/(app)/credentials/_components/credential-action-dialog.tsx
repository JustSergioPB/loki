"use client";

import ConfirmDialog from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DbCredential } from "@/db/schema/credentials";
import { deleteCredentialAction } from "@/lib/actions/credential.actions";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  credential: DbCredential;
  action: "delete";
};

export default function CredentialActionDialog({ credential, action }: Props) {
  const t = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onArchive() {
    setIsLoading(true);

    const { success, error } = await deleteCredentialAction(credential.id);

    if (success) {
      toast.success(success.message);
      setOpen(false);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-500">
          <Trash className="size-3" />
          {tGeneric("delete")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${action}Title`)}</DialogTitle>
          <DialogDescription>{t(`${action}Description`)}</DialogDescription>
        </DialogHeader>
        <ConfirmDialog
          keyword={credential.id}
          label={t(`${action}Label`)}
          onSubmit={onArchive}
          loading={isLoading}
          id={credential.id}
          variant="danger"
        />
      </DialogContent>
    </Dialog>
  );
}
