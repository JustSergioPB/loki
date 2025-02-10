"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GoBackButton } from "@/components/app/go-back-button";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, FileStack, FileText, PenTool, QrCode } from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import PageHeader from "@/components/app/page-header";
import CredentialValidityForm from "./credential-validity-form";
import ChallengeDetails from "./credential-challenge-details";
import { toast } from "sonner";
import { signCredentialAction } from "@/lib/actions/credential.actions";
import { DbFormVersion } from "@/db/schema/form-versions";
import { DbChallenge } from "@/db/schema/challenges";
import { ValiditySchema } from "@/lib/schemas/validity.schema";
import CredentialClaimsForm from "./credential-claims-form";

type Props = {
  credential: Omit<DbCredential, "formVersion" | "challenge"> & {
    formVersion: DbFormVersion;
    challenge: DbChallenge;
  };
};

const items = [
  {
    title: "challenge",
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
];

export default function CredentialFillStepper({
  credential: { formVersion, challenge, ...credential },
}: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [claims, setClaims] = useState<object | null>(null);
  const [validity, setValidity] = useState<ValiditySchema>({
    validFrom: getValidFrom(),
    validUntil: getValidUntil(),
  });

  function getValidFrom(): Date | undefined {
    let validFrom = undefined;

    if (formVersion.validFrom) validFrom = formVersion.validFrom;
    if (credential.content?.validFrom)
      validFrom = new Date(credential.content.validFrom);

    return validFrom;
  }

  function getValidUntil(): Date | undefined {
    let validUntil = undefined;

    if (formVersion.validUntil) validUntil = formVersion.validUntil;
    if (credential.content?.validUntil)
      validUntil = new Date(credential.content.validUntil);

    return validUntil;
  }

  async function handleSubmit(values: object) {
    setIsLoading(true);

    const { success, error } = await signCredentialAction(
      credential.id,
      values
    );

    if (success) {
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
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            {tStepper("step")} {step + 1} {tStepper("of")} {items.length}
          </p>
          <Progress value={((step + 1) / items.length) * 100} />
        </div>
      </section>
      <section className="border-l basis-3/4 flex flex-col">
        {step === 0 && <ChallengeDetails challenge={challenge} />}
        {step === 2 && (
          <CredentialClaimsForm
            claims={claims}
            formVersion={formVersion}
            onSubmit={(value) => setClaims(value)}
          />
        )}
        {step === 3 && (
          <CredentialValidityForm
            validity={validity}
            isLoading={isLoading}
            onSubmit={(value) => setValidity(value)}
          />
        )}
      </section>
    </section>
  );
}
