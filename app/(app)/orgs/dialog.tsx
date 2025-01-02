import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, MoreHorizontal, Trash } from "lucide-react";
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
import OrgDetails from "./details";
import { Org } from "@/db/schema/orgs";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { useState } from "react";
import { removeOrg, verifyOrg } from "@/lib/actions/org.actions";
import { toast } from "sonner";

export default function OrgDialog({ org }: { org: Org }) {
  const t = useTranslations("Org");
  const tGeneric = useTranslations("Generic");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);

  const deleteParams = new URLSearchParams(searchParams);
  deleteParams.set("action", "delete");

  const verifyParams = new URLSearchParams(searchParams);
  verifyParams.set("action", "verify");

  function onActionTrigger(action: "see" | "edit" | "delete" | "verify") {
    const params = new URLSearchParams(searchParams);
    params.set("id", org.id.toString());
    params.set("action", action);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onVerify() {
    setIsLoading(true);

    const { success, error } = await verifyOrg(org.id);

    if (success) {
      toast.success(success.message);
      onClose();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function onDelete() {
    setIsLoading(true);

    const { success, error } = await removeOrg(org.id);

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
    <Dialog open={!!action && Number(id) === org.id} onOpenChange={onClose}>
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
          {org.status === "verifying" && (
            <DropdownMenuItem onClick={() => onActionTrigger("verify")}>
              <BadgeCheck />
              {tGeneric("verify")}
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
      <DialogContent>
        {action === "see" && (
          <OrgDetails
            org={org}
            deleteHref={`${pathname}?${deleteParams.toString()}`}
            verifyHref={`${pathname}?${verifyParams.toString()}`}
          />
        )}
        {action === "delete" && (
          <ConfirmDialog
            keyword={org.name}
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            label={t("deleteLabel")}
            onSubmit={onDelete}
            loading={isLoading}
            id={org.id}
            variant="danger"
          />
        )}
        {action === "verify" && (
          <ConfirmDialog
            keyword={org.name}
            title={t("verifyTitle")}
            description={t("verifyDescription")}
            label={t("verifyLabel")}
            onSubmit={onVerify}
            loading={isLoading}
            id={org.id}
            variant="warning"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
