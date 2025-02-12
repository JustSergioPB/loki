"use client";

import { LoadingButton } from "@/components/app/loading-button";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function ConfirmButton() {
  const t = useTranslations("Inactive");
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    setIsLoading(true);
  }

  return (
    <LoadingButton loading={isLoading} onClick={onClick} className="w-full">
      {t("reactivate")}
    </LoadingButton>
  );
}
