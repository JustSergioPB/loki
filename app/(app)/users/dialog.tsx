import { UserWithOrg } from "@/db/schema/users";
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
import UserDelete from "./delete";

export default function UserDialog({ user }: { user: UserWithOrg }) {
  const t = useTranslations("Generic");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  const editParams = new URLSearchParams(searchParams);
  editParams.set("action", "edit");

  const deleteParams = new URLSearchParams(searchParams);
  deleteParams.set("action", "delete");

  function onClose() {
    const params = new URLSearchParams(searchParams);
    params.delete("action");
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Dialog
      open={
        !!action &&
        ["see", "edit", "delete"].includes(action) &&
        Number(id) === user.id
      }
      onOpenChange={onClose}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("action", "edit");
              params.set("id", user.id.toString());
              router.replace(`${pathname}?${params.toString()}`);
            }}
          >
            <Pencil />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("id", user.id.toString());
              params.set("action", "see");
              router.replace(`${pathname}?${params.toString()}`);
            }}
          >
            <ArrowRight />
            {t("see")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("id", user.id.toString());
              params.set("action", "delete");
              router.replace(`${pathname}?${params.toString()}`);
            }}
          >
            <Trash />
            {t("delete")}
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
        {action === "delete" && <UserDelete user={user} onSubmit={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
