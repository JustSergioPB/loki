"use client";

import Image from "next/image";
import { CHALLENGE_STATUS_VARIANTS } from "@/lib/constants/credential-challenge.const";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/app/page-header";
import { DbChallenge } from "@/db/schema/challenges";
import { LoadingButton } from "@/components/app/loading-button";
import { BadgeCheck } from "lucide-react";
import Field from "@/components/app/field";
import StatusTag from "@/components/app/status-tag";
import { useEffect, useState } from "react";
import * as QrCode from "qrcode";
import { renewChallengeAction } from "@/lib/actions/credential-request.actions";
import { toast } from "sonner";
import { ChallengeStatus } from "@/lib/types/credential-challenge";
import { getChallengeStatus } from "@/lib/helpers/credential-challenge.helper";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DbCredential } from "@/db/schema/credentials";

type Props = {
  action: "claim" | "present";
  credential: Omit<DbCredential, "challenge"> & {
    challenge: DbChallenge;
  };
  className?: string;
  onSubmit: () => void;
};

export default function ChallengeDetails({
  action,
  credential,
  onSubmit,
  className,
}: Props) {
  const t = useTranslations("Credential");
  const tGeneric = useTranslations("Generic");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(credential.challenge);
  const [status, setStatus] = useState<ChallengeStatus>(
    getChallengeStatus(challenge)
  );
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    generateQR(challenge, credential.id);
    setStatus(getChallengeStatus(challenge));
  }, [challenge, credential]);

  function generateQR(challenge: DbChallenge, credentialId: string) {
    QrCode.toDataURL(
      JSON.stringify({
        id: credentialId,
        code: challenge.code,
      }),
      {
        errorCorrectionLevel: "high",
      }
    ).then((value) => setQrCode(value));
  }

  async function onClick() {
    setLoading(true);

    const { success, error } = await renewChallengeAction(challenge.id);

    if (success) {
      setChallenge(success.data);
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setLoading(false);
  }

  return (
    <section className={cn("space-y-6 flex-1 flex flex-col", className)}>
      <section className="space-y-6 flex-auto overflow-y-auto h-0 flex flex-col p-12 w-1/2">
        <PageHeader
          title={t(action === "claim" ? "claimTitle" : "presentDocumentsTitle")}
          subtitle={t(
            action === "claim" ? "claimSubtitle" : "presentDocumentsDescription"
          )}
        />
        <div className="space-y-4">
          <Field icon={<BadgeCheck className="size-4" />} label={t("status")}>
            <StatusTag variant={CHALLENGE_STATUS_VARIANTS[status]}>
              {t(`statuses.${status}`)}
            </StatusTag>
          </Field>
          {qrCode ? (
            <Image src={qrCode} alt={t("qrCode")} width={250} height={250} />
          ) : (
            <Skeleton className="size-[250px] rounded-md" />
          )}
          <LoadingButton
            loading={loading}
            onClick={onClick}
            disabled={status !== "expired"}
          >
            {t("renew")}
          </LoadingButton>
        </div>
      </section>
      <div className="flex justify-end py-4 px-12 gap-2 border-t">
        <LoadingButton loading={loading} onClick={onSubmit}>
          {tGeneric("next")}
        </LoadingButton>
      </div>
    </section>
  );
}
