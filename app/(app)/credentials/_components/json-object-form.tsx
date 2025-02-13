import JsonSchemaHeader from "@/components/app/json-schema-header";
import { JsonObjectType } from "@/lib/types/json-schema";
import JsonSchemaForm from "./json-schema-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { ReactNode } from "react";

type Props = {
  path: string;
  jsonSchema: JsonObjectType;
  className?: string;
  children?: ReactNode;
  headerVariant?: "main" | "secondary";
};

export default function JsonObjectForm({
  path,
  jsonSchema,
  className,
  children,
  headerVariant,
}: Props) {
  const { control } = useFormContext();
  const { properties, required } = jsonSchema;

  if (!properties) {
    return (
      <p>
        This property is missing the subjacent properties, please reconfigure
        the form.
      </p>
    );
  }

  return (
    <FormField
      control={control}
      name={path}
      render={() => (
        <FormItem>
          <FormLabel className="flex items-center justify-between">
            <JsonSchemaHeader jsonSchema={jsonSchema} variant={headerVariant} />
            {children}
          </FormLabel>
          <FormControl>
            <section className="space-y-4">
              <div className={cn("grid grid-cols-2 gap-4", className)}>
                {Object.entries(properties)
                  .filter(
                    ([, schema]) =>
                      schema.type !== "object" && schema.type !== "array"
                  )
                  .map(([key, schema]) => (
                    <JsonSchemaForm
                      key={key}
                      path={path ? `${path}.${key}` : key}
                      jsonSchema={schema}
                      className="flex-1"
                      required={required?.includes(key) ?? false}
                    />
                  ))}
              </div>
              <div className="space-y-4">
                {Object.entries(properties)
                  .filter(
                    ([, schema]) =>
                      schema.type === "object" || schema.type === "array"
                  )
                  .map(([key, schema]) => (
                    <JsonSchemaForm
                      key={key}
                      path={path ? `${path}.${key}` : key}
                      jsonSchema={schema}
                      className="flex-1"
                      required={required?.includes(key) ?? false}
                    />
                  ))}
              </div>
            </section>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
