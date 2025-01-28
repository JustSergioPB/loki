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
        <FormItem>
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
            <section className={cn("space-y-4", className)}>
              {fields.map((_: unknown, index: number) => (
                <div key={index} className="w-full border-b py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Item {index}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="mb-1"
                      onClick={() => remove(index)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                  <JsonSchemaForm
                    path={`${path}.${index}`}
                    jsonSchema={jsonSchema.items!}
                    className="flex-1"
                    required={true}
                  />
                </div>
              ))}
            </section>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
