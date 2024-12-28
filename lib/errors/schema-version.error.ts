export const schemaVersionErrorMessages = [
  "cantBePublished",
  "cantBeArchived",
  "notFound",
] as const;
export type SchemaVersionErrorMessage =
  (typeof schemaVersionErrorMessages)[number];

export class SchemaVersionError extends Error {
  constructor(message: SchemaVersionErrorMessage) {
    super(message);
    this.name = message;
  }
}
