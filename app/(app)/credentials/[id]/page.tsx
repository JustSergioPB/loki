import {
  Calendar,
  ClipboardType,
  Clock,
  Database,
  Heading1,
  Timer,
  TimerOff,
  Text,
  FileJson,
  Key,
  IdCard,
} from "lucide-react";
import Field from "@/components/app/field";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import DeleteCredential from "./delete";
import { getCredentialById } from "@/lib/models/credential.model";
import DateDisplay from "@/components/app/date";
import CredentialStatus from "@/components/app/credential-status";

export default async function Credential({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const credentialId = (await params).id;
  const t = await getTranslations("Credential");
  const tForm = await getTranslations("Form");
  const tGeneric = await getTranslations("Generic");
  const tFormVersion = await getTranslations("FormVersion");

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const credential = await getCredentialById(user, credentialId);

  if (!credential) {
    notFound();
  }

  const { id: holder, ...claims } =
    credential.plainCredential.credentialSubject;

  return (
    <section className="p-6 lg:w-[620px] space-y-6">
      <PageHeader title={t("seeTitle")} subtitle={t("seeDescription")} />
      <div>
        <DeleteCredential credential={credential} />
      </div>
      <section className="space-y-4">
        <Field
          icon={<Heading1 className="size-4" />}
          label={tForm("titleProp")}
          type="vertical"
        >
          <p className="text-sm line-clamp-2">
            {credential.plainCredential.title}
          </p>
        </Field>
        <Field
          icon={<ClipboardType className="size-4" />}
          label={tFormVersion("type")}
          type="vertical"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {credential.plainCredential.type.slice(1).map((type, idx) => (
              <Badge variant="secondary" key={`${type}-${idx}`}>
                {type}
              </Badge>
            ))}
          </div>
        </Field>
        <Field icon={<Badge className="size-4" />} label={t("status")}>
          <CredentialStatus status={credential.status}>
            {t(`statuses.${credential.status}`)}
          </CredentialStatus>
        </Field>
        <Field
          icon={<Text className="size-4" />}
          label={tFormVersion("description")}
          type="vertical"
        >
          <p className="text-sm line-clamp-4">
            {credential.plainCredential.description}
          </p>
        </Field>
        <Field
          icon={<Timer className="size-4" />}
          label={tFormVersion("validFrom")}
        >
          <DateDisplay
            date={
              credential.plainCredential.validFrom
                ? new Date(credential.plainCredential.validFrom)
                : undefined
            }
          />
        </Field>
        <Field
          icon={<TimerOff className="size-4" />}
          label={tFormVersion("validUntil")}
        >
          <DateDisplay
            date={
              credential.plainCredential.validUntil
                ? new Date(credential.plainCredential.validUntil)
                : undefined
            }
          />
        </Field>
        <Field icon={<IdCard className="size-4" />} label={t("holder")}>
          {holder}
        </Field>
        <Field
          icon={<FileJson className="size-4" />}
          label={tFormVersion("content")}
          type="vertical"
        >
          <pre className="w-full rounded-md border p-2">
            <code className="text-xs">{JSON.stringify(claims, null, 1)}</code>
          </pre>
        </Field>
        <Field
          icon={<Key className="size-4" />}
          label={t("proof")}
          type="vertical"
        >
          <pre className="w-full rounded-md border p-2">
            <code className="text-xs">
              {JSON.stringify(credential.plainCredential.proof, null, 1)}
            </code>
          </pre>
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
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
  );
}
