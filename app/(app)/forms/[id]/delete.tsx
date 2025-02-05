"use client";

import ConfirmDialog from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DbFormVersion } from "@/db/schema/form-versions";
import { deleteFormAction } from "@/lib/actions/form.actions";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteFormVersion({
  formVersion,
}: {
  formVersion: DbFormVersion;
}) {
  const t = useTranslations("Form");
  const tGeneric = useTranslations("Generic");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const [isLoading, setIsLoading] = useState(false);

  async function onArchive() {
    setIsLoading(true);

    const { success, error } = await deleteFormAction(formVersion.formId);

    if (success) {
      toast.success(success.message);
      onClose();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onClose() {
    router.push(`/forms/${formVersion.formId}?action=see`);
  }

  async function onOpen() {
    router.push(`/forms/${formVersion.formId}?action=delete`);
  }

  return (
    <Dialog
      open={action === "delete"}
      onOpenChange={(open) => (!open ? onClose() : onOpen())}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500">
          <Trash className="size-3" />
          {tGeneric("delete")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ConfirmDialog
          keyword={formVersion.credentialSchema.title}
          title={t("deleteTitle")}
          description={t("deleteDescription")}
          label={t("deleteLabel")}
          onSubmit={onArchive}
          loading={isLoading}
          id={formVersion.formId}
          variant="danger"
        />
      </DialogContent>
    </Dialog>
  );
}
