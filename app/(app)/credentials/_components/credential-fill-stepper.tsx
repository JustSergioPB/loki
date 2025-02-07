"use client";

import { DbFormVersion } from "@/db/schema/form-versions";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GoBackButton } from "@/components/app/go-back-button";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Calendar,
  Clock,
  FileStack,
  FileText,
  PenTool,
  QrCode,
} from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import { DbCredentialRequest } from "@/db/schema/credential-requests";
import PageHeader from "@/components/app/page-header";
import CredentialValidityForm from "./credential-validity-form";
import CredentialContentForm from "./credential-content-form";
import Field from "@/components/app/field";
import StatusTag from "@/components/app/status-tag";
import DateDisplay from "@/components/app/date";
import {
  getCredentialStatus,
  isUnsigned,
} from "@/lib/helpers/credential.helper";
import { CREDENTIAL_STATUS_VARIANTS } from "@/lib/constants/credential.const";
import { CredentialStatus } from "@/lib/types/credential";
import CredentialChallengeDetails from "./credential-challenge-details";
import { toast } from "sonner";

type Props = {
  credential: DbCredential;
  presentationChallenge: DbCredentialRequest;
  formVersion: DbFormVersion;
};

const items = [
  {
    title: "presentationChallenge",
    icon: QrCode,
  },
  {
    title: "presentations",
    icon: FileStack,
  },
  {
    title: "credential",
    icon: FileText,
  },
  {
    title: "validity",
    icon: Clock,
  },
  {
    title: "sign",
    icon: PenTool,
  },
  {
    title: "claimChallenge",
    icon: QrCode,
  },
];

export default function CredentialFillStepper({
  credential: credentialState,
  challenge: challengeState,
  presentations,
  formVersion,
}: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const tGeneric = useTranslations("Generic");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [credential, setCredential] = useState(credentialState);
  const [status, setStatus] = useState<CredentialStatus>("empty");
  const [challenge, setChallenge] = useState(challengeState);

  useEffect(() => {
    const newStatus = getCredentialStatus(credential);
    let step = 0;
    if (isUnsigned(credential)) {
      step = 1;
    }
    if (challenge) {
      step = 2;
    }
    setStep(step);
    setStatus(newStatus);
  }, [credential, challenge]);

  async function handleSubmit(values: object) {
    setIsLoading(true);

    const { success, error } = await updateCredentialContentAction(
      credential.id,
      values
    );

    if (success) {
      onSubmit(success.data);
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <section className="flex flex-1 border-t">
      <section className="basis-1/4 p-6 flex flex-col">
        <div className="space-y-6 flex-1">
          <GoBackButton variant="ghost" size="sm" />
          <PageHeader
            title={t("createTitle")}
            subtitle={t("createDescription")}
          />
          <div className="flex flex-col space-y-2">
            {items.map((item, index) => (
              <Button
                key={item.title}
                className={cn(
                  "justify-start",
                  index === step
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline"
                )}
                variant="ghost"
                onClick={() => setStep(index)}
                disabled={step !== index}
              >
                <item.icon />
                {t(item.title)}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <section className="space-y-4">
            <Field
              icon={<BadgeCheck className="size-4" />}
              label={t("status")}
              className="basis-1/4"
            >
              <StatusTag variant={CREDENTIAL_STATUS_VARIANTS[status]}>
                {t(`statuses.${status}`)}
              </StatusTag>
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("createdAt")}
              className="basis-1/4"
            >
              <DateDisplay date={formVersion.createdAt} />
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("updatedAt")}
              className="basis-1/4"
            >
              <DateDisplay date={formVersion.updatedAt} />
            </Field>
          </section>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {tStepper("step")} {step + 1} {tStepper("of")} {items.length}
            </p>
            <Progress value={((step + 1) / items.length) * 100} />
          </div>
        </div>
      </section>
      <section className="border-l basis-3/4 flex flex-col">
        {step === 0 && <CredentialChallengeDetails challenge={challenge} />}
        {step === 1 && (
          <CredentialContentForm
            credential={credential}
            formVersion={formVersion}
            onSubmit={handleSubmit}
          />
        )}
        {step === 2 && (
          <CredentialValidityForm
            credential={credential}
            formVersion={formVersion}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        )}
      </section>
    </section>
  );
}
