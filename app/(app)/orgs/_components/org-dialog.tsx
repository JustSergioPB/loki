import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, MoreHorizontal, Trash } from "lucide-react";
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
import OrgDetails from "./org-details";
import { DbOrg } from "@/db/schema/orgs";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import { deleteOrgAction, verifyOrgAction } from "@/lib/actions/org.actions";
import { toast } from "sonner";

type Action = "see" | "delete" | "verify";

export default function OrgDialog({ org }: { org: DbOrg }) {
  const t = useTranslations("Org");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<Action>("see");
  const [open, setOpen] = useState(false);

  async function onVerify() {
    setIsLoading(true);

    const { success, error } = await verifyOrgAction(org.id);

    if (success) {
      toast.success(success.message);
      setOpen(false);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await deleteOrgAction(org.id);

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
          {org.status === "verifying" && (
            <DropdownMenuItem
              onClick={() => {
                setAction("verify");
                setOpen(true);
              }}
            >
              <BadgeCheck />
              {tGeneric("verify")}
            </DropdownMenuItem>
          )}
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
        {action === "see" && <OrgDetails org={org} />}
        {["verify", "delete"].includes(action) && (
          <ConfirmDialog
            keyword={org.name}
            label={t(`${action}Label`)}
            onSubmit={() => {
              if (action === "delete") return onDelete();
              return onVerify();
            }}
            loading={isLoading}
            id={org.id}
            variant={action === "delete" ? "danger" : "warning"}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
