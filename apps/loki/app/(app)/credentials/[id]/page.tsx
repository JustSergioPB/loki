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
import Date from "@/components/app/date";
import { Badge } from "@/components/ui/badge";
import { credentialTable } from "@/db/schema/credentials";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import PageHeader from "@/components/app/page-header";
import { and, eq, isNull } from "drizzle-orm";
import { didTable } from "@/db/schema/dids";
import { OrgDID } from "@/lib/models/org-did";
import { FakeHSMProvider } from "@/providers/key-pair.provider";
import DeleteCredential from "./delete";

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

  const queryResult = await db
    .select()
    .from(credentialTable)
    .where(
      and(
        eq(credentialTable.orgId, user.orgId),
        eq(credentialTable.id, credentialId)
      )
    )
    .innerJoin(
      didTable,
      and(eq(didTable.orgId, user.orgId), isNull(didTable.userId))
    );

  if (!queryResult[0]) {
    notFound();
  }

  const orgDID = OrgDID.fromProps(queryResult[0].dids);
  const keyPairProvider = new FakeHSMProvider();
  const credential = await keyPairProvider.decrypt(
    orgDID.signingLabel,
    queryResult[0].credentials
  );

  const { id: holder, ...credentialSubject } = credential.credentialSubject;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { proofValue, ...proof } = credential.proof;

  return (
    <section className="p-6 lg:w-[620px] space-y-6">
      <PageHeader
        title={t("seeTitle")}
        subtitle={t("seeDescription")}
        className="p-0"
      />
      <div>
        <DeleteCredential credential={queryResult[0].credentials} />
      </div>
      <section className="space-y-4">
        <Field
          icon={<Heading1 className="size-4" />}
          label={tForm("titleProp")}
          type="vertical"
        >
          <p className="text-sm line-clamp-2">{credential.title}</p>
        </Field>
        <Field
          icon={<ClipboardType className="size-4" />}
          label={tFormVersion("type")}
          type="vertical"
        >
          <div className="flex items-center gap-1 flex-wrap">
            {credential.type.slice(1).map((type, idx) => (
              <Badge variant="secondary" key={`${type}-${idx}`}>
                {type}
              </Badge>
            ))}
          </div>
        </Field>
        <Field
          icon={<Text className="size-4" />}
          label={tFormVersion("description")}
          type="vertical"
        >
          <p className="text-sm line-clamp-4">{credential.description}</p>
        </Field>
        <Field
          icon={<Timer className="size-4" />}
          label={tFormVersion("validFrom")}
        >
          <Date date={credential.validFrom} />
        </Field>
        <Field
          icon={<TimerOff className="size-4" />}
          label={tFormVersion("validUntil")}
        >
          <Date date={credential.validUntil} />
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
            <code className="text-xs">
              {JSON.stringify(credentialSubject, null, 1)}
            </code>
          </pre>
        </Field>
        <Field
          icon={<Key className="size-4" />}
          label={t("proof")}
          type="vertical"
        >
          <pre className="w-full rounded-md border p-2">
            <code className="text-xs">{JSON.stringify(proof, null, 1)}</code>
          </pre>
        </Field>
        <Field icon={<Database className="size-4" />} label={tGeneric("id")}>
          {credential.id}
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("createdAt")}
        >
          <Date date={credential.props.createdAt} />
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          <Date date={credential.props.updatedAt} />
        </Field>
      </section>
    </section>
  );
}
