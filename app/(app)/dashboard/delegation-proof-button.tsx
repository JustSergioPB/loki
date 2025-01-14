"use client";

import { LoadingButton } from "@/components/app/loading-button";
import { createFormAction } from "@/lib/actions/form.actions";
import { FORMS } from "@/lib/consts/form.consts";
import { Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function DelegationProofButton() {
  const t = useTranslations("Dashboard");
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    setIsLoading(true);

    const { success, error } = await createFormAction(FORMS[0]);

    if (success) {
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <LoadingButton loading={isLoading} onClick={() => onClick()}>
      <Rocket className="size-4" />
      {t("delegationProof")}
    </LoadingButton>
  );
}
