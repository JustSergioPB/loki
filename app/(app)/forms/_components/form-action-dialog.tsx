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
import { DbFormVersion } from "@/db/schema/form-versions";
import {
  archiveFormVersionAction,
  deleteFormVersionAction,
  publishFormVersionAction,
} from "@/lib/actions/form-version.actions";
import { Archive, Rss, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  formVersion: DbFormVersion;
  action: "delete" | "archive" | "publish";
};

export default function FormActionDialog({ formVersion, action }: Props) {
  const t = useTranslations("FormVersion");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await deleteFormVersionAction(formVersion.id);

    if (success) {
      toast.success(success.message);
      setOpen(false);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onArchive() {
    setIsLoading(true);

    const { success, error } = await archiveFormVersionAction(formVersion.id);

    if (success) {
      toast.success(success.message);
      setOpen(false);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onPublish() {
    setIsLoading(true);

    const { success, error } = await publishFormVersionAction(formVersion.id);

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
        <Button
          variant={action === "delete" ? "destructive" : "outline"}
          size="sm"
        >
          {action === "delete" && <Trash className="size-3" />}
          {action === "archive" && <Archive className="size-3" />}
          {action === "publish" && <Rss className="size-3" />}
          {t(action)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${action}Title`)}</DialogTitle>
          <DialogDescription>{t(`${action}Description`)}</DialogDescription>
        </DialogHeader>
        <ConfirmDialog
          keyword={formVersion.title}
          label={t(`${action}Label`)}
          onSubmit={() => {
            if (action === "delete") return onDelete();
            if (action === "publish") return onPublish();
            return onArchive();
          }}
          loading={isLoading}
          id={formVersion.id}
          variant={action === "delete" ? "danger" : "warning"}
        />
      </DialogContent>
    </Dialog>
  );
}
