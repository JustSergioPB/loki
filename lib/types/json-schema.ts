export const jsonStringFormat = [
  "datetime",
  "date",
  "time",
  "email",
  "uri",
  "uuid",
] as const;

export type JsonStringFormat = (typeof jsonStringFormat)[number];

export const jsonType = [
  "number",
  "integer",
  "string",
  "boolean",
  "null",
  "array",
  "object",
] as const;

export type JsonType = (typeof jsonType)[number];

// Base schema type with common properties
export interface JsonSchemaBase<T> {
  title: string;
  description?: string;
  default?: T;
  examples?: T[];
  const?: T;
  enum?: T[];
}

// Number constraints
export interface JsonNumberType extends JsonSchemaBase<number> {
  type: "number" | "integer";
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

// String constraints
export interface JsonStringType extends JsonSchemaBase<string> {
  type: "string";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: JsonStringFormat;
}

// Boolean constraints
export interface JsonBooleanType extends JsonSchemaBase<boolean> {
  type: "boolean";
}

// Null constraints
export interface JsonNullType extends JsonSchemaBase<null> {
  type: "null";
}

// Array type
export interface JsonArrayType extends JsonSchemaBase<unknown[]> {
  type: "array";
  items?: JsonSchemaType;
  minItems?: number;
  maxItems?: number;
}

// Object type
export interface JsonObjectType extends JsonSchemaBase<object> {
  type: "object";
  properties?: {
    [key: string]: JsonSchemaType;
  };
  required?: string[];
  additionalProperties?: boolean;
}

// Combined schema type
export type JsonSchemaType =
  | JsonNullType
  | JsonBooleanType
  | JsonNumberType
  | JsonStringType
  | JsonArrayType
  | JsonObjectType;
