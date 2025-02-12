import { JsonArrayType, JsonObjectType, JsonStringType } from "./json-schema";

export type CredentialSchemaProperties = {
  "@context": JsonArrayType;
  title: JsonStringType;
  description?: JsonStringType;
  type: JsonArrayType;
  issuer: JsonStringType;
  id: JsonStringType;
  validFrom?: JsonStringType;
  validUntil?: JsonStringType;
  credentialSubject: JsonObjectType;
  credentialSchema: JsonObjectType;
  proof: JsonObjectType;
};

export type CredentialSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  title: string;
  description?: string;
  properties: CredentialSchemaProperties;
  required: string[];
  type: "object";
};
