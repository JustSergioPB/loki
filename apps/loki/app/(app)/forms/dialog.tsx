import { DbForm } from "@/db/schema/forms";
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
import { Form } from "@/lib/models/form";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import { removeForm, changeFormState } from "@/lib/actions/form.actions";
import { toast } from "sonner";

export default function FormDialog({ form }: { form: DbForm }) {
  const t = useTranslations("Form");
  const tGeneric = useTranslations("Generic");
  const tVersion = useTranslations("FormVersion");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const latest = Form.fromProps(form).latestVersion;
  const [isLoading, setIsLoading] = useState(false);

  const deleteParams = new URLSearchParams(searchParams);
  deleteParams.set("action", "delete");

  const publishParams = new URLSearchParams(searchParams);
  publishParams.set("action", "publish");

  const archiveParams = new URLSearchParams(searchParams);
  archiveParams.set("action", "archive");

  function onActionTrigger(action: "delete" | "publish" | "archive") {
    const params = new URLSearchParams(searchParams);
    params.set("id", form.id.toString());
    params.set("action", action);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onActionNavigate(action: "see" | "edit") {
    router.push(`${pathname}/${form.id}?action=${action}`);
  }

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await removeForm(form.id);

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

    const { success, error } = await changeFormState(form.id!, "published");

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

    const { success, error } = await changeFormState(form.id!, "archived");

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
    <Dialog open={!!action && id === form.id} onOpenChange={onClose}>
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
            keyword={form.title}
            title={tVersion("publishTitle")}
            description={tVersion("publishDescription")}
            label={tVersion("publishLabel")}
            onSubmit={onPublish}
            loading={isLoading}
            id={form.id}
            variant="warning"
          />
        )}
        {action === "archive" && (
          <ConfirmDialog
            keyword={form.title}
            title={tVersion("archiveTitle")}
            description={tVersion("archiveDescription")}
            label={tVersion("archiveLabel")}
            onSubmit={onArchive}
            loading={isLoading}
            id={form.id}
            variant="warning"
          />
        )}
        {action === "delete" && (
          <ConfirmDialog
            keyword={form.title}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            label={t("deleteLabel")}
            onSubmit={onDelete}
            loading={isLoading}
            id={form.id}
            variant="danger"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
