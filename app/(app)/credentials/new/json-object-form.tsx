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

type Props = {
  path: string;
  jsonSchema: JsonObjectType;
  className?: string;
};

export default function JsonObjectForm({ path, jsonSchema, className }: Props) {
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
          <FormLabel>
            <JsonSchemaHeader jsonSchema={jsonSchema} />
          </FormLabel>
          <FormControl>
            <section className={cn("space-y-2", className)}>
              {Object.entries(properties).map(([key, schema]) => (
                <JsonSchemaForm
                  key={key}
                  path={path ? `${path}.${key}` : key}
                  jsonSchema={schema}
                  className="flex-1"
                  required={required?.includes(key) ?? false}
                />
              ))}
            </section>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
