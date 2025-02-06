import { Calendar, Clock, Database, BadgeCheck } from "lucide-react";
import Field from "@/components/app/field";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import CredentialActionDialog from "../_components/credential-action-dialog";
import { getCredentialByIdWithChallenge } from "@/lib/models/credential.model";
import DateDisplay from "@/components/app/date";
import { GoBackButton } from "@/components/app/go-back-button";
import { getCredentialStatus } from "@/lib/helpers/credential.helper";
import { CREDENTIAL_STATUS_VARIANTS } from "@/lib/constants/credential.const";
import StatusTag from "@/components/app/status-tag";
import ChallengeDetails from "../_components/credential-challenge-details";

export default async function Credential({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("Credential");
  const tGeneric = await getTranslations("Generic");

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getCredentialByIdWithChallenge(user, id);

  if (!result) {
    notFound();
  }

  const [credential, challenge] = result;
  const credentialStatus = getCredentialStatus(credential);

  return (
    <section className="flex flex-1">
      <section className="border-r basis-3/5 flex flex-col">
        <div className="px-6 py-4 border-b">
          <GoBackButton variant="ghost" size="sm" />
        </div>
        <div className="p-6 bg-muted flex-auto overflow-y-auto h-0">
          <pre className="w-full rounded-md border p-2 bg-card">
            <code className="text-xs">
              {JSON.stringify(credential.content, null, 1)}
            </code>
          </pre>
        </div>
      </section>
      <section className="basis-2/5 flex flex-col">
        <section className="border-b p-6 space-y-6">
          <PageHeader title={t("seeTitle")} />
          <CredentialActionDialog credential={credential} action="delete" />
          <section className="space-y-4">
            <Field icon={<BadgeCheck className="size-4" />} label={t("status")}>
              <StatusTag variant={CREDENTIAL_STATUS_VARIANTS[credentialStatus]}>
                {t(`statuses.${credentialStatus}`)}
              </StatusTag>
            </Field>
            <Field
              icon={<Database className="size-4" />}
              label={tGeneric("id")}
            >
              {credential.id}
            </Field>
            <Field
              icon={<Calendar className="size-4" />}
              label={tGeneric("createdAt")}
            >
              <DateDisplay date={credential.createdAt} />
            </Field>
            <Field
              icon={<Clock className="size-4" />}
              label={tGeneric("updatedAt")}
            >
              <DateDisplay date={credential.updatedAt} />
            </Field>
          </section>
        </section>
        <ChallengeDetails challenge={challenge} />
      </section>
    </section>
  );
}
