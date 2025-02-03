import JsonSchemaHeader from "@/components/app/json-schema-header";
import { JsonObjectType } from "@/lib/types/json-schema";
import JsonSchemaField from "./json-schema-field";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  jsonSchema: JsonObjectType;
  className?: string;
  children?: ReactNode;
  headerVariant?: "main" | "secondary";
};

export default function JsonObjectField({
  jsonSchema,
  className,
  children,
  headerVariant,
}: Props) {
  const { properties } = jsonSchema;

  if (!properties) {
    return (
      <p>
        This property is missing the subjacent properties, please reconfigure
        the form.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <JsonSchemaHeader jsonSchema={jsonSchema} variant={headerVariant} />
        {children}
      </div>
      <section className={cn("grid grid-cols-2 gap-4", className)}>
        {Object.entries(properties).map(([key, schema]) => (
          <JsonSchemaField key={key} jsonSchema={schema} path={key} />
        ))}
      </section>
    </div>
  );
}
