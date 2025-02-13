"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { BridgeType } from "@/lib/types/bridge";
import { Loader2, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import EmailBridgeForm from "./email-bridge-form";
import { useState } from "react";
import { toggleEmailBridgeAction } from "@/lib/actions/email-bridge.actions";
import { DbFormVersion } from "@/db/schema/form-versions";
import { DialogTrigger } from "@radix-ui/react-dialog";

type Props = {
  formVersion?: DbFormVersion;
  checked: boolean;
  type: BridgeType;
};

export default function BridgeDialog({ checked, type, formVersion }: Props) {
  const t = useTranslations("Bridge");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(checked);
  const [open, setOpen] = useState(false);

  async function onToggle(checked: boolean) {
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

  return (
    <div className="flex items-center gap-1">
      {isLoading && <Loader2 className="animate-spin" />}
      <Switch
        checked={isChecked}
        onCheckedChange={(value) => onToggle(value)}
        disabled={isLoading}
      />
      <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" disabled={isLoading}>
            <Settings className="size-4" />
            <span className="sr-only">{tGeneric("edit")}</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`bridges.${type}.editTitle`)}</DialogTitle>
            <DialogDescription>
              {t(`bridges.${type}.editDescription`)}
            </DialogDescription>
          </DialogHeader>
          {type === "email" && (
            <EmailBridgeForm
              onSubmit={() => setOpen(false)}
              formVersion={formVersion}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
