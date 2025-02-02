"use client";

import { LoadingButton } from "@/components/app/loading-button";
import { renewCredentialRequestAction } from "@/lib/actions/credential-request.actions";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  credentialId: string;
  id: string;
  disabled: boolean;
};

export default function ChallengeRenewButton({
  credentialId,
  id,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("CredentialRequest");

  async function onClick() {
    setLoading(true);

    const { success, error } = await renewCredentialRequestAction(
      credentialId,
      id
    );

    if (success) {
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setLoading(false);
  }

  return (
    <LoadingButton
      loading={loading}
      size="sm"
      onClick={onClick}
      disabled={disabled}
    >
      <RotateCcw className="size-4" />
      {t("renew")}
    </LoadingButton>
  );
}
