import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal, Trash } from "lucide-react";
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
import DIDDetails from "./did-details";
import { DIDWithOwner } from "@/db/schema/dids";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import { deleteDIDAction } from "@/lib/actions/did.actions";
import { toast } from "sonner";

type Action = "see" | "delete";

export default function DIDDialog({ did }: { did: DIDWithOwner }) {
  const t = useTranslations("Org");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<Action>("see");
  const [open, setOpen] = useState(false);

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await deleteDIDAction(did.did);

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
        {action === "see" && <DIDDetails did={did} />}
        {action === "delete" && (
          <ConfirmDialog
            keyword={did.did}
            label={t("deleteLabel")}
            onSubmit={onDelete}
            loading={isLoading}
            id={did.did}
            variant="danger"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
