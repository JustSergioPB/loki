"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { BridgeType } from "@/lib/types/bridge";
import { Loader2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EmailBridgeForm from "./email-bridge-form";
import { useState } from "react";
import { toggleEmailBridgeAction } from "@/lib/actions/email-bridge.actions";
import { DbFormVersion } from "@/db/schema/form-versions";

type Props = {
  formVersion?: DbFormVersion;
  checked: boolean;
  type: BridgeType;
};

export default function BridgeDialog({ checked, type, formVersion }: Props) {
  const tGeneric = useTranslations("Generic");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(checked);

  async function onToggle(checked: boolean) {
    if (checked && !formVersion) {
      return onActionTrigger("edit");
    }

    setIsLoading(true);
    setIsChecked(checked);

    const { success, error } = await toggleEmailBridgeAction(checked);

    if (success) {
      toast.success(success.message);
    } else {
      setIsChecked(!checked);
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  function onActionTrigger(action: "edit") {
    const params = new URLSearchParams(searchParams);
    params.set("id", type);
    params.set("action", action);
    router.push(`${pathname}?${params.toString()}`);
  }

  function onClose() {
    const params = new URLSearchParams(searchParams);
    params.delete("action");
    params.delete("id");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1">
      {isLoading && <Loader2 className="animate-spin" />}
      <Switch
        checked={isChecked}
        onCheckedChange={(value) => onToggle(value)}
        disabled={isLoading}
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onActionTrigger("edit")}
        disabled={isLoading}
      >
        <Settings className="size-4" />
        <span className="sr-only">{tGeneric("edit")}</span>
      </Button>
      <Dialog open={!!action && id === type} onOpenChange={onClose}>
        <DialogContent>
          {action === "edit" && type === "email" && (
            <EmailBridgeForm onSubmit={onClose} formVersion={formVersion} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
