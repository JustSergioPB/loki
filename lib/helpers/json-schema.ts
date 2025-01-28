import { z } from "zod";
import { JsonObjectType, JsonSchemaType } from "../types/json-schema";

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

  console.log(defaults);
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
