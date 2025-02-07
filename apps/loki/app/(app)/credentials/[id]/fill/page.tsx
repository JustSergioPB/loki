import CredentialFillStepper from "../../_components/credential-fill-stepper";
import { getUser } from "@/lib/helpers/dal";
import { notFound, redirect } from "next/navigation";
import { getFullCredentialbyId } from "@/lib/models/credential.model";

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

  const query = await getFullCredentialbyId(id, user);

  if (!query) {
    notFound();
  }

  const { formVersion, presentationChallenge, claimChallenge ,...credential} = query;

  return (
    <CredentialFillStepper
      credential={credential}
      formVersion={formVersion}
      challenge={presentationChallenge}
    />
  );
}
