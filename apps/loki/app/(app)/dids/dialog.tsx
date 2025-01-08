import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal, Trash } from "lucide-react";
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
import DIDDetails from "./details";
import { DbDID } from "@/db/schema/dids";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import { removeDID } from "@/lib/actions/did.actions";
import { toast } from "sonner";

export default function DIDDialog({ did }: { did: DbDID }) {
  const t = useTranslations("Did");
  const tGeneric = useTranslations("Generic");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);

  const deleteParams = new URLSearchParams(searchParams);
  deleteParams.set("action", "delete");

  function onActionTrigger(action: "see" | "delete") {
    const params = new URLSearchParams(searchParams);
    params.set("id", did.did.toString());
    params.set("action", action);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await removeDID(did.did);

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
    <Dialog open={!!action && id === did.did} onOpenChange={onClose}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tGeneric("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tGeneric("actions")}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onActionTrigger("see")}>
            <ArrowRight />
            {tGeneric("see")}
          </DropdownMenuItem>
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
        {action === "see" && (
          <DIDDetails
            did={did}
            deleteHref={`${pathname}?${deleteParams.toString()}`}
          />
        )}
        {action === "delete" && (
          <ConfirmDialog
            keyword={did.did}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
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
