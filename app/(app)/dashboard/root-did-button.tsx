"use client";

import { LoadingButton } from "@/components/app/loading-button";
import { createRootDID } from "@/lib/actions/did.actions";
import { Rocket } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export default function RootDIDButton() {
  const t = useTranslations("Dashboard");
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    setIsLoading(true);

    const { success, error } = await createRootDID();

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
      {t("rootDID")}
    </LoadingButton>
  );
}
