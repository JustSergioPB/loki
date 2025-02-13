import { Button } from "@/components/ui/button";
import {
  Archive,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Rss,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import {
  deleteFormVersionAction,
  publishFormVersionAction,
  archiveFormVersionAction,
} from "@/lib/actions/form-version.actions";
import { toast } from "sonner";
import { DbFormVersion } from "@/db/schema/form-versions";
import { getFormVersionStatus } from "@/lib/helpers/form-version.helper";

type Action = "delete" | "publish" | "archive";

export default function FormDialog({
  formVersion,
}: {
  formVersion: DbFormVersion;
}) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");

  const router = useRouter();
  const status = getFormVersionStatus(formVersion);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<Action>("publish");
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

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tGeneric("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tGeneric("actions")}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push(`/forms/${formVersion.id}`)}
          >
            <ArrowRight />
            {tGeneric("see")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={status !== "draft"}
            onClick={() => router.push(`/forms/${formVersion.id}/edit`)}
          >
            <Pencil />
            {tGeneric("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={status !== "draft"}
            onClick={() => {
              setAction("publish");
              setOpen(true);
            }}
          >
            <Rss />
            {t("publish")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={status !== "published"}
            onClick={() => {
              setAction("archive");
              setOpen(true);
            }}
          >
            <Archive />
            {t("archive")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              setAction("delete");
              setOpen(true);
            }}
          >
            <Trash />
            {tGeneric("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
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
