"use client";

import Image from "next/image";
import { CHALLENGE_STATUS_VARIANTS } from "@/lib/constants/credential-challenge.const";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/app/page-header";
import { DbCredentialRequest } from "@/db/schema/credential-requests";
import { LoadingButton } from "@/components/app/loading-button";
import { BadgeCheck, Calendar, Clock, Database } from "lucide-react";
import Field from "@/components/app/field";
import DateDisplay from "@/components/app/date";
import StatusTag from "@/components/app/status-tag";
import { useEffect, useState } from "react";
import * as QrCode from "qrcode";
import { renewCredentialRequestAction } from "@/lib/actions/credential-request.actions";
import { toast } from "sonner";
import { CredentialChallengeStatus } from "@/lib/types/credential-challenge";
import { getCredentialChallengeStatus } from "@/lib/helpers/credential-challenge.helper";
import { cn } from "@/lib/utils";

type Props = {
  challenge: DbCredentialRequest;
  className?: string;
};

export default function CredentialChallengeDetails({
  challenge: challengeState,
  className,
}: Props) {
  const t = useTranslations("CredentialRequest");
  const tGeneric = useTranslations("Generic");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(challengeState);
  const [status, setStatus] = useState<CredentialChallengeStatus>("pending");
  const [qrCode, setQrCode] = useState<string>("");

  useEffect(() => {
    generateQR(challenge);
    setStatus(getCredentialChallengeStatus(challenge));
  }, [challenge]);

  function generateQR(challenge: DbCredentialRequest) {
    QrCode.toDataURL(
      JSON.stringify({
        id: challenge.id,
        code: challenge.code,
      }),
      {
        errorCorrectionLevel: "high",
      }
    ).then((value) => setQrCode(value));
  }

  async function onClick() {
    setLoading(true);

    const { success, error } = await renewCredentialRequestAction(challenge.id);

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
        <PageHeader title={t("scanTitle")} subtitle={t("scanSubtitle")} />
        <div className="space-y-4">
          <Image src={qrCode} alt={t("qrCode")} width={250} height={250} />
          <Field icon={<BadgeCheck className="size-4" />} label={t("status")}>
            <StatusTag variant={CHALLENGE_STATUS_VARIANTS[status]}>
              {t(`statuses.${status}`)}
            </StatusTag>
          </Field>
          <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
            {challenge.id}
          </Field>
          <Field
            icon={<Calendar className="size-4" />}
            label={tGeneric("createdAt")}
          >
            <DateDisplay date={challenge.createdAt} />
          </Field>
          <Field
            icon={<Clock className="size-4" />}
            label={tGeneric("updatedAt")}
          >
            <DateDisplay date={challenge.updatedAt} />
          </Field>
        </div>
      </section>
      <div className="flex justify-end py-4 px-12 gap-2 border-t">
        <LoadingButton
          loading={loading}
          onClick={onClick}
          disabled={status !== "expired"}
        >
          {t("renew")}
        </LoadingButton>
      </div>
    </section>
  );
}
