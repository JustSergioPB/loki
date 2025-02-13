import { z } from "zod";
import {
  JsonArrayType,
  JsonBooleanType,
  JsonNullType,
  JsonNumberType,
  JsonObjectType,
  JsonSchemaType,
  JsonStringType,
} from "../types/json-schema";

export function credentialSubjectToZod(
  credentialSubject: JsonObjectType
): z.ZodType {
  const shape: { [key: string]: z.ZodType } = {};

  if (credentialSubject.properties) {
    for (const [key, propSchema] of Object.entries(
      credentialSubject.properties
    )) {
      if (key !== "id") {
        shape[key] = jsonSchemaToZod(propSchema);
      }
    }
  }

  let zodSchema = z.object(shape);

  if (credentialSubject.required) {
    const partial = Object.fromEntries(
      Object.entries(shape).map(([key, value]) => [
        key,
        credentialSubject.required?.includes(key) ? value : value.optional(),
      ])
    );
    zodSchema = z.object(partial);
  }

  return zodSchema;
}

export function jsonSchemaToZod(schema: JsonSchemaType): z.ZodType {
  switch (schema.type) {
    case "string":
      return buildStringSchema(schema);
    case "number":
    case "integer":
      return buildNumberSchema(schema);
    case "boolean":
      return buildBooleanSchema(schema);
    case "null":
      return z.null();
    case "array":
      return buildArraySchema(schema);
    case "object":
      return buildObjectSchema(schema);
    default:
      return buildStringSchema(schema);
  }
}

export function getDefaultCredentialSubject(
  credentialSubject: JsonObjectType
): object {
  if (!credentialSubject.properties) return {};

  const defaults: Record<string, unknown> = {};
  Object.keys(credentialSubject.properties).forEach((key) => {
    if (key !== "id") {
      defaults[key] = getDefaultJsonSchemaValues(
        credentialSubject.properties![key]
      );
    }
  });
  return defaults;
}

export function getDefaultJsonSchemaValues(schema: JsonSchemaType): unknown {
  if (schema.default !== undefined) {
    return schema.default;
  }

  switch (schema.type) {
    case "string":
      return "";
    case "number":
    case "integer":
      return schema.minimum ?? 0;
    case "boolean":
      return false;
    case "null":
      return null;
    case "array":
      return [];
    case "object":
      if (!schema.properties) return {};

      const defaults: Record<string, unknown> = {};
      Object.keys(schema.properties).forEach((key) => {
        defaults[key] = getDefaultJsonSchemaValues(schema.properties![key]);
      });

      return defaults;
    default:
      return undefined;
  }
}

function buildStringSchema(
  schema: Extract<JsonSchemaType, { type: "string" }>
) {
  if (schema.const) return z.literal(schema.const);

  let zodSchema = z.string();

  if (schema.minLength !== undefined) {
    zodSchema = zodSchema.min(schema.minLength);
  }
  if (schema.maxLength !== undefined) {
    zodSchema = zodSchema.max(schema.maxLength);
  }
  if (schema.pattern !== undefined) {
    zodSchema = zodSchema.regex(new RegExp(schema.pattern));
  }
  if (schema.format) {
    switch (schema.format) {
      case "email":
        zodSchema = zodSchema.email();
        break;
      case "uuid":
        zodSchema = zodSchema.uuid();
        break;
      case "uri":
        zodSchema = zodSchema.url();
        break;
      case "datetime":
        zodSchema = zodSchema.datetime();
        break;
    }
  }

  return zodSchema;
}

function buildNumberSchema(
  schema: Extract<JsonSchemaType, { type: "number" | "integer" }>
) {
  if (schema.const) return z.literal(schema.const);

  let zodSchema =
    schema.type === "integer" ? z.coerce.number().int() : z.coerce.number();

  if (schema.minimum !== undefined) {
    zodSchema = zodSchema.min(schema.minimum);
  }
  if (schema.maximum !== undefined) {
    zodSchema = zodSchema.max(schema.maximum);
  }
  if (schema.exclusiveMinimum !== undefined) {
    zodSchema = zodSchema.gt(schema.exclusiveMinimum);
  }
  if (schema.exclusiveMaximum !== undefined) {
    zodSchema = zodSchema.lt(schema.exclusiveMaximum);
  }
  if (schema.multipleOf !== undefined) {
    zodSchema = zodSchema.multipleOf(schema.multipleOf);
  }

  return zodSchema;
}

function buildBooleanSchema(
  schema: Extract<JsonSchemaType, { type: "boolean" }>
) {
  return schema.const ? z.literal(schema.const) : z.coerce.boolean();
}

function buildArraySchema(schema: Extract<JsonSchemaType, { type: "array" }>) {
  let zodSchema = schema.items
    ? z.array(jsonSchemaToZod(schema.items))
    : z.array(z.unknown());

  if (schema.minItems !== undefined) {
    zodSchema = zodSchema.min(schema.minItems);
  }
  if (schema.maxItems !== undefined) {
    zodSchema = zodSchema.max(schema.maxItems);
  }

  return zodSchema;
}

function buildObjectSchema(
  schema: Extract<JsonSchemaType, { type: "object" }>
) {
  const shape: { [key: string]: z.ZodType } = {};

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      shape[key] = jsonSchemaToZod(propSchema);
    }
  }

  let zodSchema = z.object(shape);

  if (schema.required) {
    const partial = Object.fromEntries(
      Object.entries(shape).map(([key, value]) => [
        key,
        schema.required?.includes(key) ? value : value.optional(),
      ])
    );
    zodSchema = z.object(partial);
  }

  return zodSchema;
}

export function validateString(
  schema: JsonStringType,
  value: string | undefined,
  required: boolean
): boolean {
  if (required && value === undefined) {
    return false;
  }
  // Check type
  if (typeof value !== "string") {
    return false;
  }

  // Check enum
  if (schema.enum && !schema.enum.includes(value)) {
    return false;
  }

  // Check const
  if (schema.const && value !== schema.const) {
    return false;
  }

  // Check minLength
  if (schema.minLength && value.length < schema.minLength) {
    return false;
  }

  // Check maxLength
  if (schema.maxLength && value.length > schema.maxLength) {
    return false;
  }

  // Check pattern
  if (schema.pattern) {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(value)) {
      return false;
    }
  }

  // Check format
  if (schema.format) {
    switch (schema.format) {
      case "datetime":
        return !isNaN(Date.parse(value));
      case "date":
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      case "time":
        return /^\d{2}:\d{2}:\d{2}$/.test(value);
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "uri":
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case "uuid":
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value
        );
    }
  }

  return true;
}

export function validateBoolean(
  schema: JsonBooleanType,
  value: boolean | undefined,
  required: boolean
): boolean {
  // Check if required
  if (required && value === undefined) {
    return false;
  }

  // If value is undefined and not required, it's valid
  if (value === undefined) {
    return true;
  }

  // Check type
  if (typeof value !== "boolean") {
    return false;
  }

  // Check const
  if (schema.const !== undefined && value !== schema.const) {
    return false;
  }

  // Check enum
  if (schema.enum !== undefined && !schema.enum.includes(value)) {
    return false;
  }

  return true;
}

export function validateNumber(
  schema: JsonNumberType,
  value: number | undefined,
  required: boolean
): boolean {
  // Check if required
  if (required && value === undefined) {
    return false;
  }

  // If value is undefined and not required, it's valid
  if (value === undefined) {
    return true;
  }

  // Check type - must be number and integer
  if (
    typeof value !== "number" ||
    (schema.type === "integer" && !Number.isInteger(value)) ||
    (schema.type === "number" && !Number.isNaN(value))
  ) {
    return false;
  }

  // Check minimum
  if (schema.minimum !== undefined && value < schema.minimum) {
    return false;
  }

  // Check maximum
  if (schema.maximum !== undefined && value > schema.maximum) {
    return false;
  }

  // Check exclusiveMinimum
  if (
    schema.exclusiveMinimum !== undefined &&
    value <= schema.exclusiveMinimum
  ) {
    return false;
  }

  // Check exclusiveMaximum
  if (
    schema.exclusiveMaximum !== undefined &&
    value >= schema.exclusiveMaximum
  ) {
    return false;
  }

  // Check multipleOf
  if (schema.multipleOf !== undefined) {
    if (value % schema.multipleOf !== 0) {
      return false;
    }
  }

  // Check const
  if (schema.const !== undefined && value !== schema.const) {
    return false;
  }

  // Check enum
  if (schema.enum !== undefined && !schema.enum.includes(value)) {
    return false;
  }

  return true;
}

export function validateNull(
  schema: JsonNullType,
  value: null | undefined,
  required: boolean
): boolean {
  // Check if required
  if (required && value === undefined) {
    return false;
  }

  // If value is undefined and not required, it's valid
  if (value === undefined) {
    return true;
  }

  // Check type - must be null
  if (value !== null) {
    return false;
  }

  return true;
}

export function validateObject(
  schema: JsonObjectType,
  value: Record<string, unknown> | undefined,
  required: boolean
): boolean {
  // Check if required
  if (required && value === undefined) {
    return false;
  }

  // Check type
  if (typeof value !== "object") {
    return false;
  }

  // Validate defined properties
  if (schema.properties) {
    return Object.keys(schema.properties)
      .map((key) =>
        validateValue(
          value[key],
          schema.properties![key],
          schema.required?.includes(key) ?? false
        )
      )
      .every((v) => v);
  }

  return true;
}

export function validateArray(
  schema: JsonArrayType,
  value: unknown[] | undefined,
  required: boolean
): boolean {
  // Check if required
  if (required && value === undefined) {
    return false;
  }

  // If value is undefined and not required, it's valid
  if (value === undefined) {
    return true;
  }

  // Check type
  if (!Array.isArray(value)) {
    return false;
  }

  // Check minItems
  if (schema.minItems !== undefined && value.length < schema.minItems) {
    return false;
  }

  // Check maxItems
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    return false;
  }

  // Validate items
  if (schema.items) {
    return value
      .map((v) => validateValue(v, schema.items!, true))
      .every((v) => v);
  }

  return true;
}

export function validateValue(
  value: unknown,
  schema: JsonSchemaType,
  required: boolean
): boolean {
  let isValid = false;

  switch (schema.type) {
    case "string":
      isValid = validateString(schema, value as string, required);
      break;
    case "null":
      isValid = validateNull(schema, value as null, required);
      break;
    case "boolean":
      isValid = validateBoolean(schema, value as boolean, required);
      break;
    case "number":
      isValid = validateNumber(schema, value as number, required);
      break;
    case "integer":
      isValid = validateNumber(schema, value as number, required);
      break;
    case "object":
      isValid = validateObject(
        schema,
        value as Record<string, unknown>,
        required
      );
      break;
    case "array":
      isValid = validateArray(schema, value as unknown[], required);
      break;
  }

  return isValid;
}
