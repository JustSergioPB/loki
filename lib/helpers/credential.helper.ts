import { DbFilledCredential } from "@/db/schema/credentials";
import { FilledCredential } from "../types/verifiable-credential";

/**
 * 
import { canonicalize } from "json-canonicalize";
import { SupportedType, ALGORITHM_MAP } from "../types/algorithms";
import { CredentialSchema } from "../types/credential-schema";
import { DIDDocument } from "../types/did";
import { SupportedPreffix, PREFFIX_MAP } from "../types/encoding";
import { Observation } from "../types/observations";
import { baseDecode } from "./encoder";
import { validateObject } from "./json-schema";
 */

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

/**
export function validateVerifiableCredential(
  verifiableCredential: VerifiableCredential,
  issuer: DIDDocument,
  credentialSchema: CredentialSchema
): Observation[] {
  return [
    ...validateValidFrom(verifiableCredential.validFrom),
    ...validateValidUntil(verifiableCredential.validUntil),
    ...validateProof(verifiableCredential, issuer),
    ...validateCredentialSubject(
      verifiableCredential.credentialSubject,
      credentialSchema
    ),
  ];
}

function validateValidFrom(value: string | undefined): Observation[] {
  if (!value) return [];

  const observations: Observation[] = [];
  const validFrom = new Date(value);

  if (isNaN(validFrom.getTime())) {
    observations.push({
      level: "warn",
      field: "VALID_FROM",
      code: "INVALID_DATE",
    });
  }

  if (validFrom > new Date()) {
    observations.push({
      level: "warn",
      field: "VALID_FROM",
      code: "NOT_VALID_YET",
    });
  }

  return observations;
}

function validateValidUntil(value: string | undefined): Observation[] {
  if (!value) return [];

  const observations: Observation[] = [];
  const validUntil = new Date(value);

  if (isNaN(validUntil.getTime())) {
    observations.push({
      level: "warn",
      path: "validUntil",
      code: "INVALID_DATE",
    });
  }

  if (validUntil < new Date()) {
    observations.push({
      level: "warn",
      field: "validUntil",
      code: "NOT_VALID_YET",
    });
  }

  return observations;
}

function validateCredentialSubject(
  credentialSubject: Record<string, unknown>,
  credentialSchema: CredentialSchema
): Observation[] {
  const observations: Observation[] = [];

  const isValid = validateObject(credentialSchema, credentialSubject, true);

  if (!isValid) {
    observations.push({
      level: "error",
      field: "CREDENTIAL_SUBJECT",
      code: "INVALID",
    });
  }

  return observations;
}

function validateProof(
  value: VerifiableCredential,
  issuer: DIDDocument
): Observation[] {
  const observations: Observation[] = [];
  const { proof, ...rest } = value;

  const canonical = canonicalize.canonicalize({
    ...rest,
    proof: {
      ...proof,
      proofValue: "",
    },
  });

  const verificationMethod = issuer.verificationMethod.find(
    (v) => v.id === proof.verificationMethod
  );

  if (!verificationMethod) {
    observations.push({
      level: "error",
      field: "PROOF",
      code: "MISSING_VERIFICATION_METHOD",
    });
    return observations;
  }

  const { publicKeyMultibase, type, revoked } = verificationMethod;
  const preffix = publicKeyMultibase[0] as SupportedPreffix;
  const alg = type as SupportedType;

  if (revoked) {
    observations.push({
      level: "error",
      field: "PROOF",
      code: "REVOKED",
    });
    return observations;
  }

  if (!PREFFIX_MAP[preffix]) {
    observations.push({
      level: "warn",
      field: "PROOF",
      code: "UNSUPPORTED_MULTIBASE",
    });
    return observations;
  }

  if (!ALGORITHM_MAP[alg]) {
    observations.push({
      level: "warn",
      field: "PROOF",
      code: "UNSUPPORTED_TYPE",
    });
    return observations;
  }

  const base = PREFFIX_MAP[preffix];
  const key = baseDecode(publicKeyMultibase.slice(1), base.base, base.alphabet);

  const valid = crypto.verify(
    ALGORITHM_MAP[alg],
    Buffer.from(canonical),
    crypto.createPublicKey({
      format: "der",
      type: "spki",
      key: Buffer.from(key),
    }),
    Buffer.from(proof.proofValue, "base64")
  );

  if (!valid) {
    observations.push({
      level: "error",
      field: "PROOF",
      code: "INVALID",
    });
  }

  return observations;
}
 */
