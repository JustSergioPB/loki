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

const ACTION_MAP: Record<Action, { title: string; description: string }> = {
  see: {
    title: "seeTitle",
    description: "seeDescription",
  },
  delete: {
    title: "deleteTitle",
    description: "deleteDescription",
  },
};

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
      <DropdownMenu>
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
          <DialogTitle>{t(ACTION_MAP[action].title)}</DialogTitle>
          <DialogDescription>
            {t(ACTION_MAP[action].description)}
          </DialogDescription>
        </DialogHeader>
        <DIDDetails
          did={did}
          className={action === "see" ? "block" : "hidden"}
        />
        <ConfirmDialog
          keyword={did.did}
          className={action === "delete" ? "block" : "hidden"}
          label={t("deleteLabel")}
          onSubmit={onDelete}
          loading={isLoading}
          id={did.did}
          variant="danger"
        />
      </DialogContent>
    </Dialog>
  );
}
