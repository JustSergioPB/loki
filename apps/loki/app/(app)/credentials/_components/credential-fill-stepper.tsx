"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { GoBackButton } from "@/components/app/go-back-button";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CircleCheck,
  Clock,
  FileSearch,
  NotepadTextDashed,
  PenTool,
  QrCode,
} from "lucide-react";
import { DbCredential } from "@/db/schema/credentials";
import CredentialValidityForm from "./credential-validity-form";
import ChallengeDetails from "./credential-challenge-details";
import { toast } from "sonner";
import {
  createCredentialAction,
  signCredentialAction,
  updateCredentialAction,
} from "@/lib/actions/credential.actions";
import { DbFormVersion } from "@/db/schema/form-versions";
import { DbChallenge } from "@/db/schema/challenges";
import { ValiditySchema } from "@/lib/schemas/validity.schema";
import CredentialClaimsForm from "./credential-claims-form";
import { DbPresentation } from "@/db/schema/presentations";
import { LoadingButton } from "@/components/app/loading-button";
import { CredentialStatus } from "@/lib/types/credential";
import CredentialFormSelect from "./credential-form-select";
import { ApiErrorResult } from "@/lib/generics/api-error";
import PageHeader from "@/components/app/page-header";
import { useRouter } from "next/navigation";

type CredentialView = Omit<DbCredential, "formVersion" | "challenge"> & {
  formVersion: DbFormVersion;
  challenge: DbChallenge;
  presentations: DbPresentation[];
};

type Props = {
  credential: CredentialView | null;
  formVersions: DbFormVersion[];
};

const STEP_MAP: Record<CredentialStatus, number> = {
  empty: 1,
  presented: 2,
  partiallyFilled: 3,
  filled: 4,
  signed: 5,
  claimed: 6,
};

const items = [
  {
    title: "formSelectTitle",
    icon: NotepadTextDashed,
  },
  {
    title: "presentDocumentsTitle",
    icon: QrCode,
  },
  {
    title: "fillContentTitle",
    icon: FileSearch,
  },
  {
    title: "fillValidityTitle",
    icon: Clock,
  },
  {
    title: "signTitle",
    icon: PenTool,
  },
  {
    title: "claimTitle",
    icon: QrCode,
  },
];

export default function CredentialFillStepper({
  formVersions,
  credential: credentialState,
}: Props) {
  const t = useTranslations("Credential");
  const tStepper = useTranslations("Stepper");
  const tGeneric = useTranslations("Generic");
  const [credential, setCredential] = useState(credentialState);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<number>(
    credential ? STEP_MAP[credential.status] : 0
  );

  const router = useRouter();

  useEffect(() => {
    setStep(credential ? STEP_MAP[credential.status] : 0);
  }, [credential]);

  async function create(formVersionId: string) {
    setIsLoading(true);

    const { success, error } = await createCredentialAction(formVersionId);

    setIsLoading(false);

    if (success) {
      const { formVersion, challenge, ...rest } = success.data;

      if (!formVersion) {
        return toast.error("MISSING_FORM");
      }

      if (!challenge) {
        return toast.error("MISSING_CHALLENGE");
      }

      setCredential({
        ...rest,
        formVersion,
        challenge,
        presentations: [],
      });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }
  }

  async function sync() {
    if (!credential) {
      return toast.error("MISSING_CREDENTIAL");
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/credentials/${credential.id}`);

      const body = await response.json();

      if (!response.ok) {
        return toast.error((body as ApiErrorResult).code);
      }

      const {
        data: { presentations, challenge, ...rest },
      } = body as { data: DbCredential };

      if (!challenge) {
        return toast.error("MISSING_CHALLENGE");
      }

      if (!presentations) {
        return toast.error("MISSING_PRESENTATIONS");
      }

      if (rest.status === "empty") {
        return toast.warning(t("NOT_PRESENTED"));
      }

      if (rest.status === "claimed") {
        return router.push("/credentials");
      }

      setCredential({
        ...credential,
        ...rest,
        presentations,
        challenge,
      });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateClaims(values: object) {
    if (!credential) {
      return toast.error("MISSING_CREDENTIAL");
    }

    setIsLoading(true);

    const { success, error } = await updateCredentialAction(credential.id, {
      claims: values,
      status: "partiallyFilled",
    });

    setIsLoading(false);

    if (success) {
      setCredential({
        ...credential,
        ...success.data,
      });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }
  }

  async function updateValidity(values: ValiditySchema) {
    if (!credential) {
      return toast.error("MISSING_CREDENTIAL");
    }

    setIsLoading(true);

    const { success, error } = await updateCredentialAction(credential.id, {
      validFrom: values.validFrom,
      validUntil: values.validUntil,
      status: "filled",
    });

    if (success) {
      setCredential({
        ...credential,
        ...success.data,
      });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  async function sign() {
    if (!credential) {
      return toast.error("MISSING_CREDENTIAL");
    }

    setIsLoading(true);

    const { success, error } = await signCredentialAction(credential.id);

    setIsLoading(false);

    if (success) {
      const { challenge } = success.data;

      if (!challenge) {
        return toast.error("MISSING_CHALLENGE");
      }

      setCredential({
        ...credential,
        ...success.data,
        challenge,
      });
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }
  }

  return (
    <section className="flex flex-1 border-t">
      <section className="basis-1/4 p-6 flex flex-col">
        <div className="space-y-6 flex-1">
          <GoBackButton variant="ghost" size="sm" />
          <div className="flex flex-col space-y-2">
            {items.map((item, index) => (
              <Button
                key={item.title}
                className={cn(
                  "justify-start",
                  index === step ? "bg-muted hover:bg-muted" : "",
                  index >= step
                    ? ""
                    : "disabled:opacity-1 text-emerald-500 font-semibold"
                )}
                variant="ghost"
                onClick={() => setStep(index)}
                disabled={step !== index}
              >
                {step <= index ? (
                  <item.icon />
                ) : (
                  <CircleCheck className="text-emerald-500" />
                )}
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
        {step === 0 && (
          <CredentialFormSelect
            formVersions={formVersions}
            onSubmit={create}
            isLoading={isLoading}
          />
        )}
        {credential && (
          <>
            {step === 1 && (
              <ChallengeDetails
                action="present"
                credential={credential}
                onSubmit={sync}
                loading={isLoading}
              />
            )}
            {step === 2 && (
              <CredentialClaimsForm
                claims={credential.claims}
                formVersion={credential.formVersion}
                presentations={credential.presentations}
                isLoading={isLoading}
                onSubmit={updateClaims}
              />
            )}
            {step === 3 && (
              <CredentialValidityForm
                validFrom={credential.validFrom}
                validUntil={credential.validUntil}
                formVersion={credential.formVersion}
                isLoading={isLoading}
                onSubmit={updateValidity}
              />
            )}
            {step === 4 && (
              <section className="flex-1 flex flex-col">
                <section className="flex-auto overflow-y-auto h-0 flex flex-col p-12 xl:w-2/3 space-y-6">
                  <PageHeader
                    title={t("signTitle")}
                    subtitle={t("signDescription")}
                  />
                  <pre className="text-sm">
                    <code>{JSON.stringify(credential.claims, null, 1)}</code>
                  </pre>
                </section>
                <div className="flex justify-end py-4 px-12 gap-2 border-t">
                  <LoadingButton
                    loading={isLoading}
                    type="submit"
                    onClick={sign}
                  >
                    {tGeneric("next")}
                  </LoadingButton>
                </div>
              </section>
            )}
            {step === 5 && (
              <ChallengeDetails
                action="claim"
                credential={credential}
                loading={isLoading}
                onSubmit={sync}
              />
            )}
          </>
        )}
      </section>
    </section>
  );
}
