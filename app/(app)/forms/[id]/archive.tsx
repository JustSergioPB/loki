"use client";

import ConfirmDialog from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SchemaWithVersions } from "@/db/schema/schemas";
import { archiveSchemaVersion } from "@/lib/actions/schema-version.actions";
import { Schema } from "@/lib/models/schema";
import { Archive } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ArchiveSchemaVersion({
  schemaWithVersions,
}: {
  schemaWithVersions: SchemaWithVersions;
}) {
  const t = useTranslations("SchemaVersion");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const schema = Schema.fromProps(schemaWithVersions);
  const latest = schema.getLatestVersion();
  const [isLoading, setIsLoading] = useState(false);

  async function onArchive() {
    setIsLoading(true);

    const { success, error } = await archiveSchemaVersion(latest.id!);

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
    router.push(`/forms/${schema.id}?action=archive`);
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
          keyword={schemaWithVersions.title}
          title={t("archiveTitle")}
          description={t("archiveDescription")}
          label={t("archiveLabel")}
          onSubmit={onArchive}
          loading={isLoading}
          id={schemaWithVersions.id}
          variant="warning"
        />
      </DialogContent>
    </Dialog>
  );
}
