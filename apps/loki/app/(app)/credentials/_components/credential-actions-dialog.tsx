import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal, NotebookPen, Trash } from "lucide-react";
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
import { toast } from "sonner";
import { deleteCredentialAction } from "@/lib/actions/credential.actions";
import { DbCredential } from "@/db/schema/credentials";
import CredentialDetails from "./credential-details";

type Action = "see" | "fill" | "delete";

export default function CredentialActionsDialog({
  credential,
}: {
  credential: DbCredential;
}) {
  const t = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<Action>("see");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function onDelete() {
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
            onClick={() => {
              setAction("see");
              setOpen(true);
            }}
          >
            <ArrowRight />
            {tGeneric("see")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={credential.status === "claimed"}
            onClick={() => router.push(`/credentials/${credential.id}/fill`)}
          >
            <NotebookPen />
            {tGeneric("fill")}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${action}Title`)}</DialogTitle>
          <DialogDescription>{t(`${action}Description`)}</DialogDescription>
        </DialogHeader>
        {action === "see" ? (
          <CredentialDetails credential={credential} />
        ) : (
          <ConfirmDialog
            keyword={credential.id}
            label={t("deleteLabel")}
            className={action === "delete" ? "block" : "hidden"}
            onSubmit={onDelete}
            loading={isLoading}
            id={credential.id}
            variant="danger"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
