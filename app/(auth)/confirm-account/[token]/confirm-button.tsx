"use client";

import { toast } from "sonner";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { confirmAccount } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ConfirmButton({ token }: { token: string }) {
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onClick() {
    setIsLoading(true);

    const { success, error } = await confirmAccount(token);

    if (success) {
      toast.success(success.message);
      router.push("/dashboard");
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <LoadingButton loading={isLoading} onClick={onClick} className="w-full">
      {tGeneric("confirm")}
    </LoadingButton>
  );
}
