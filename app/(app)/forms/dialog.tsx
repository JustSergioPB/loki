import { SchemaWithVersions } from "@/db/schema/schemas";
import { Button } from "@/components/ui/button";
import {
  Archive,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Rss,
  Trash,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { Schema } from "@/lib/models/schema";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import { removeSchema } from "@/lib/actions/schema.actions";
import { toast } from "sonner";
import {
  archiveSchemaVersion,
  publishSchemaVersion,
} from "@/lib/actions/schema-version.actions";

export default function SchemaDialog({
  schemaWithVersions,
}: {
  schemaWithVersions: SchemaWithVersions;
}) {
  const t = useTranslations("Schema");
  const tGeneric = useTranslations("Generic");
  const tVersion = useTranslations("SchemaVersion");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const schema = Schema.fromProps(schemaWithVersions);
  const latest = schema.getLatestVersion();
  const [isLoading, setIsLoading] = useState(false);

  const deleteParams = new URLSearchParams(searchParams);
  deleteParams.set("action", "delete");

  const publishParams = new URLSearchParams(searchParams);
  publishParams.set("action", "publish");

  const archiveParams = new URLSearchParams(searchParams);
  archiveParams.set("action", "archive");

  function onActionTrigger(action: "delete" | "publish" | "archive") {
    const params = new URLSearchParams(searchParams);
    params.set("id", schemaWithVersions.id.toString());
    params.set("action", action);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onActionNavigate(action: "see" | "edit") {
    router.push(`${pathname}/${schema.id}?action=${action}`);
  }

  async function onDelete() {
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

  function onClose() {
    const params = new URLSearchParams(searchParams);
    params.delete("action");
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Dialog open={!!action && Number(id) === schema.id} onOpenChange={onClose}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tGeneric("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tGeneric("actions")}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onActionNavigate("edit")}>
            <Pencil />
            {tGeneric("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onActionNavigate("see")}>
            <ArrowRight />
            {tGeneric("see")}
          </DropdownMenuItem>
          {latest.props.status === "draft" && (
            <DropdownMenuItem onClick={() => onActionTrigger("publish")}>
              <Rss />
              {tVersion("publish")}
            </DropdownMenuItem>
          )}
          {latest.props.status === "published" && (
            <DropdownMenuItem onClick={() => onActionTrigger("archive")}>
              <Archive />
              {tVersion("archive")}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => onActionTrigger("delete")}
          >
            <Trash />
            {tGeneric("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        {action === "publish" && (
          <ConfirmDialog
            keyword={schemaWithVersions.title}
            title={tVersion("publishTitle")}
            description={tVersion("publishDescription")}
            label={tVersion("publishLabel")}
            onSubmit={onPublish}
            loading={isLoading}
            id={schemaWithVersions.id}
            variant="warning"
          />
        )}
        {action === "archive" && (
          <ConfirmDialog
            keyword={schemaWithVersions.title}
            title={tVersion("archiveTitle")}
            description={tVersion("archiveDescription")}
            label={tVersion("archiveLabel")}
            onSubmit={onArchive}
            loading={isLoading}
            id={schemaWithVersions.id}
            variant="warning"
          />
        )}
        {action === "delete" && (
          <ConfirmDialog
            keyword={schemaWithVersions.title}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            label={t("deleteLabel")}
            onSubmit={onDelete}
            loading={isLoading}
            id={schemaWithVersions.id}
            variant="danger"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
