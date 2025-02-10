import CredentialFillStepper from "../../_components/credential-fill-stepper";
import { getUser } from "@/lib/helpers/dal";
import { getCredentialById } from "@/lib/models/credential.model";
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

  const query = await getCredentialById(id, user);

  if (!query) {
    notFound();
  }

  const { formVersion, challenge, ...credential } = query;

  return formVersion && challenge ? (
    <CredentialFillStepper
      credential={{ ...credential, formVersion, challenge }}
    />
  ) : (
    <></>
  );
}
