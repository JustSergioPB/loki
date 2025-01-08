"use client";

import ConfirmDialog from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DbForm } from "@/db/schema/forms";
import { changeFormState } from "@/lib/actions/form.actions";
import { Archive } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ArchiveFormVersion({ form }: { form: DbForm }) {
  const t = useTranslations("FormVersion");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const [isLoading, setIsLoading] = useState(false);

  async function onArchive() {
    setIsLoading(true);

    const { success, error } = await changeFormState(form.id!, "archived");

    if (success) {
      toast.success(success.message);
      onClose();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onClose() {
    router.push(`/forms/${form.id}?action=see`);
  }

  async function onOpen() {
    router.push(`/forms/${form.id}?action=archive`);
  }

  return (
    <Dialog
      open={action === "archive"}
      onOpenChange={(open) => (!open ? onClose() : onOpen())}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Archive className="size-3" />
          {t("archive")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ConfirmDialog
          keyword={form.title}
          title={t("archiveTitle")}
          description={t("archiveDescription")}
          label={t("archiveLabel")}
          onSubmit={onArchive}
          loading={isLoading}
          id={form.id}
          variant="warning"
        />
      </DialogContent>
    </Dialog>
  );
}
