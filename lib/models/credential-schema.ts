export type CredentialSchemaProof = {
  properties: {
    type: {
      const: "DataIntegrityProof";
    };
    cryptosuite: {
      const: "ecdsa-jcs-2022";
    };
    created: {
      type: "string";
      format: "datetime";
    };
    verificationMethod: {
      type: "string";
      format: "uri";
    };
    proofPurpose: {
      const: "assertionMethod";
    };
    proofValue: {
      type: "string";
    };
  };
  required: [
    "type",
    "cryptosuite",
    "created",
    "verificationMethod",
    "proofPurpose",
    "proofValue"
  ];
  type: "object";
};

export type CredentialSchemaProperties = {
  "@context": { const: ["https://www.w3.org/ns/credentials/v2"] };
  title: { const: string };
  description?: { const: string };
  type: { const: ["VerifiableCredential"] };
  issuer: { type: "string"; format: "did" };
  id: { type: "string"; format: "uuid" };
  validFrom?: {
    const: string;
  };
  validUntil?: {
    const: string;
  };
  credentialSubject: {
    properties: {
      id: { type: "string"; format: "did" };
      content: object;
    };
    type: "object";
    required: ["id", "content"];
  };
  credentialSchema: {
    type: "object";
    properties: {
      id: { type: "string"; format: "uri" };
      type: { const: "JsonSchema" };
    };
    required: ["id", "type"];
  };
  proof: CredentialSchemaProof;
};

export type CredentialSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  title: string;
  description?: string;
  properties: CredentialSchemaProperties;
  required: string[];
  type: "object";
};
