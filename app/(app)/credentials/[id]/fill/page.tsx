import { getFullCredential } from "@/lib/models/credential.model";
import CredentialFillStepper from "../../_components/credential-fill-stepper";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";

export default async function CredentialFill({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const queryResult = await getFullCredential(user, id);

  if (!queryResult) {
    notFound();
  }

  const [credential, formVersion, challenge] = queryResult;

  return (
    <CredentialFillStepper
      credential={credential}
      formVersion={formVersion}
      challenge={challenge}
    />
  );
}
