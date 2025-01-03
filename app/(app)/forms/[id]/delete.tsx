"use client";

import ConfirmDialog from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SchemaWithVersions } from "@/db/schema/schemas";
import { removeSchema } from "@/lib/actions/schema.actions";
import { Schema } from "@/lib/models/schema";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteSchemaVersion({
  schemaWithVersions,
}: {
  schemaWithVersions: SchemaWithVersions;
}) {
  const t = useTranslations("Schema");
  const tGeneric = useTranslations("Generic");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const schema = Schema.fromProps(schemaWithVersions);
  const [isLoading, setIsLoading] = useState(false);

  async function onArchive() {
    setIsLoading(true);

    const { success, error } = await removeSchema(schemaWithVersions.id);

    if (success) {
      toast.success(success.message);
      onClose();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onClose() {
    router.push(`/forms/${schema.id}?action=see`);
  }

  async function onOpen() {
    router.push(`/forms/${schema.id}?action=delete`);
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
          keyword={schemaWithVersions.title}
          title={t("deleteTitle")}
          description={t("deleteDescription")}
          label={t("deleteLabel")}
          onSubmit={onArchive}
          loading={isLoading}
          id={schemaWithVersions.id}
          variant="danger"
        />
      </DialogContent>
    </Dialog>
  );
}
