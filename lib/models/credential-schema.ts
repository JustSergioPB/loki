export type CredentialSchemaProof = {
  properties: {
    type: {
      const: "DataIntegrityProof";
    };
    cryptosuite: {
      const: "Ed25519Signature2020";
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
  type: { const: string[] };
  issuer: { type: "string"; format: "uri" };
  id: { type: "string"; format: "uri" };
  validFrom?: {
    const: string;
  };
  validUntil?: {
    const: string;
  };
  credentialSubject: {
    properties: {
      id: { type: "string"; format: "uri" };
      [x: string]: unknown;
    };
    type: "object";
    required: string[];
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
