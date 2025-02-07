import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JsonSchemaType } from "@/lib/types/json-schema";
import JsonObjectField from "./json-object-field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import JsonStringField from "./json-string-field";
import JsonNumberField from "./json-number-field";
import JsonBooleanField from "./json-boolean-field";
import JsonArrayField from "./json-array-field";
import { ReactNode } from "react";

type Props = {
  path: string;
  jsonSchema: JsonSchemaType;
  className?: string;
  children?: ReactNode;
  headerVariant?: "main" | "secondary";
};

export default function JsonSchemaField({
  jsonSchema,
  className,
  path,
  children,
  headerVariant,
}: Props) {
  const { title, type } = jsonSchema;

  if (type === "null") {
    return <></>;
  }

  if (jsonSchema.enum) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={path}>{title}</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue
              placeholder={jsonSchema.enum![0].toString()}
              id={path}
            />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (type === "object")
    return (
      <JsonObjectField
        {...{ path, jsonSchema, className, children, headerVariant }}
      />
    );
  if (type === "array")
    return <JsonArrayField {...{ path, jsonSchema, className }} />;
  if (type === "string")
    return <JsonStringField {...{ path, jsonSchema, className }} />;
  if (type === "number" || type === "integer")
    return <JsonNumberField {...{ path, jsonSchema, className }} />;
  if (type === "boolean")
    return <JsonBooleanField {...{ path, jsonSchema, className }} />;
}
