"use client";

import ConfirmDialog from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Schema } from "@/db/schema/schemas";
import { publishSchemaVersion } from "@/lib/actions/schema-version.actions";
import { Schema as SchemaEntity } from "@/lib/models/schema";
import { Rss } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PublishSchemaVersion({ schema }: { schema: Schema }) {
  const t = useTranslations("SchemaVersion");
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const latest = SchemaEntity.fromProps(schema).getLatestVersion();
  const [isLoading, setIsLoading] = useState(false);

  async function onPublish() {
    setIsLoading(true);

    const { success, error } = await publishSchemaVersion(latest.id!);

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
    router.push(`/forms/${schema.id}?action=publish`);
  }

  return (
    <Dialog
      open={action === "publish"}
      onOpenChange={(open) => (!open ? onClose() : onOpen())}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Rss className="size-3" />
          {t("publish")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ConfirmDialog
          keyword={schema.title}
          title={t("publishTitle")}
          description={t("publishDescription")}
          label={t("publishLabel")}
          onSubmit={onPublish}
          loading={isLoading}
          id={schema.id}
          variant="warning"
        />
      </DialogContent>
    </Dialog>
  );
}
