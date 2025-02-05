import { DbUser } from "@/db/schema/users";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import UserDetails from "./user-details";
import UserForm from "./user-form";
import { useState } from "react";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { deleteUserAction } from "@/lib/actions/user.actions";
import { toast } from "sonner";

type Action = "edit" | "see" | "delete";

export default function UserDialog({ user }: { user: DbUser }) {
  const t = useTranslations("User");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<Action>("see");
  const [open, setOpen] = useState(false);

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await deleteUserAction(user.id);

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
              setAction("edit");
              setOpen(true);
            }}
          >
            <Pencil />
            {tGeneric("edit")}
          </DropdownMenuItem>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`${action}Title`)}</DialogTitle>
          <DialogDescription>{t(`${action}Description`)}</DialogDescription>
        </DialogHeader>
        {action === "see" && <UserDetails user={user} />}
        {action === "edit" && (
          <UserForm user={user} onSubmit={() => setOpen(false)} />
        )}
        {action === "delete" && (
          <ConfirmDialog
            keyword={user.fullName}
            label={t("deleteLabel")}
            onSubmit={onDelete}
            loading={isLoading}
            id={user.id}
            variant="danger"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
