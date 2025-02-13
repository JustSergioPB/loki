import JsonSchemaHeader from "@/components/app/json-schema-header";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JsonArrayType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import JsonSchemaForm from "./json-schema-form";
import { getDefaultJsonSchemaValues } from "@/lib/helpers/json-schema";

type Props = {
  path: string;
  jsonSchema: JsonArrayType;
  className?: string;
};

export default function JsonArrayForm({ path, jsonSchema, className }: Props) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: path,
  });

  if (!jsonSchema.items) {
    return <p>This property is missing items, please reconfigure the form.</p>;
  }

  return (
    <FormField
      control={control}
      name={path}
      render={() => (
        <FormItem className="space-y-6">
          <FormLabel className="flex items-center justify-between">
            <JsonSchemaHeader jsonSchema={jsonSchema} />
            <Button
              type="button"
              size="sm"
              onClick={() =>
                append(getDefaultJsonSchemaValues(jsonSchema.items!))
              }
            >
              <PlusCircle className="size-4" />
              Add
            </Button>
          </FormLabel>
          <FormControl>
            <ul className={cn("space-y-6", className)}>
              {fields.map((_: unknown, index: number) => (
                <li key={index} className="w-full">
                  <JsonSchemaForm
                    path={`${path}.${index}`}
                    jsonSchema={jsonSchema.items!}
                    className="flex-1"
                    required={true}
                    headerVariant="secondary"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </JsonSchemaForm>
                </li>
              ))}
            </ul>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
