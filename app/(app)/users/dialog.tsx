import { User } from "@/db/schema/users";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import UserDetails from "./details";
import UserForm from "./form";
import { useState } from "react";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { removeUser } from "@/lib/actions/user.actions";
import { toast } from "sonner";

export default function UserDialog({ user }: { user: User }) {
  const t = useTranslations("User");
  const tGeneric = useTranslations("Generic");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);

  const editParams = new URLSearchParams(searchParams);
  editParams.set("action", "edit");

  const deleteParams = new URLSearchParams(searchParams);
  deleteParams.set("action", "delete");

  function onActionTrigger(action: "see" | "edit" | "delete") {
    const params = new URLSearchParams(searchParams);
    params.set("id", user.id.toString());
    params.set("action", action);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await removeUser(user.id);

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
    <Dialog open={!!action && Number(id) === user.id} onOpenChange={onClose}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tGeneric("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tGeneric("actions")}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onActionTrigger("edit")}>
            <Pencil />
            {tGeneric("edit")}
          </DropdownMenuItem>
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
      <DialogContent>
        {action === "see" && (
          <UserDetails
            user={user}
            editHref={`${pathname}?${editParams.toString()}`}
            deleteHref={`${pathname}?${deleteParams.toString()}`}
          />
        )}
        {action === "edit" && <UserForm user={user} onSubmit={onClose} />}
        {action === "delete" && (
          <ConfirmDialog
            keyword={user.fullName}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
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
