import { DbFilledCredential } from "@/db/schema/credentials";
import { FilledCredential } from "../types/verifiable-credential";

export function toVerifiableCredential(
  baseUrl: string,
  value: DbFilledCredential
): FilledCredential {
  const { formVersion, org, issuer, ...credential } = value;

  return {
    "@context": formVersion.credentialContext,
    type: formVersion.credentialTypes,
    id: `${baseUrl}/credentials/${credential.id}`,
    title: formVersion.title,
    description: formVersion.description ?? undefined,
    validFrom: credential.validFrom?.toISOString(),
    validUntil: credential.validUntil?.toISOString(),
    issuer: {
      name: org.name,
      id: `${baseUrl}/dids/${issuer.document.controller}`,
    },
    credentialSubject: {
      id: credential.holder,
      ...credential.claims,
    },
    credentialSchema: {
      id: `${baseUrl}/form/${formVersion.id}`,
      type: formVersion.types[0],
    },
  };
}
