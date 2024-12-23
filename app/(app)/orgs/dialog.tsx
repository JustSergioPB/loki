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
import OrgDetails from "./details";
import OrgDelete from "./delete";
import { Org } from "@/db/schema/orgs";

export default function OrgDialog({ org }: { org: Org }) {
  const t = useTranslations("Generic");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");

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
        Number(id) === org.id
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
              params.set("id", org.id.toString());
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
              params.set("id", org.id.toString());
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
          <OrgDetails
            org={org}
            deleteHref={`${pathname}?${deleteParams.toString()}`}
          />
        )}
        {action === "delete" && <OrgDelete org={org} onSubmit={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
