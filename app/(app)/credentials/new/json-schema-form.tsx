import { useFormContext } from "react-hook-form";
import { JsonSchemaType, JsonStringFormat } from "@/lib/types/json-schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HTMLInputTypeAttribute } from "react";
import { PlusCircle, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import JsonSchemaHeader from "@/components/app/json-schema-header";

type Props = {
  path: string;
  jsonSchema: JsonSchemaType;
  className?: string;
};

const FORMAT_MAP: Record<JsonStringFormat, HTMLInputTypeAttribute> = {
  datetime: "datetime-local",
  date: "date",
  time: "time",
  email: "email",
  uri: "url",
  uuid: "text",
};

export default function JsonSchemaForm({ path, jsonSchema, className }: Props) {
  const form = useFormContext();
  const placeholder = jsonSchema.examples?.[0]?.toString() ?? "";

  if (jsonSchema.enum) {
    return (
      <FormField
        control={form.control}
        name={path}
        render={({ field }) => (
          <FormItem
            className={cn("flex items-center justify-between", className)}
          >
            <FormLabel>{jsonSchema.title}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {jsonSchema.enum?.map((value, index) => (
                  <SelectItem value={index.toString()} key={index.toString()}>
                    {value?.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (jsonSchema.type === "object" && jsonSchema.properties) {
    return (
      <section className={cn("space-y-4", className)}>
        <JsonSchemaHeader jsonSchema={jsonSchema} />
        <div>
          {Object.entries(jsonSchema.properties).map(([key, schema]) => (
            <JsonSchemaForm
              key={key}
              path={path ? `${path}.${key}` : key}
              jsonSchema={schema}
              className="flex-1"
            />
          ))}
        </div>
      </section>
    );
  }

  if (jsonSchema.type === "array" && jsonSchema.items) {
    const fields = form.watch(path) || [];

    return (
      <FormField
        control={form.control}
        name={path}
        render={() => (
          <FormItem className={cn(className)}>
            <FormControl>
              <div className="space-y-4">
                <FormLabel className="flex items-center justify-between">
                  <JsonSchemaHeader jsonSchema={jsonSchema} />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const values = form.getValues(path) || [];
                      form.setValue(path, [...values, undefined]);
                    }}
                  >
                    <PlusCircle className="size-4" />
                    Add
                  </Button>
                </FormLabel>
                <div>
                  {fields.map((_: unknown, index: number) => (
                    <div key={index} className="w-full border-b py-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Item {index}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="mb-1"
                          onClick={() => {
                            const values = form.getValues(path);
                            values.splice(index, 1);
                            form.setValue(path, values);
                          }}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                      <JsonSchemaForm
                        path={`${path}.${index}`}
                        jsonSchema={jsonSchema.items!}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (jsonSchema.type === "string") {
    return (
      <FormField
        control={form.control}
        name={path}
        render={({ field }) => (
          <FormItem
            className={cn("flex items-center justify-between", className)}
          >
            <FormLabel>{jsonSchema.title}</FormLabel>
            <FormControl>
              <Input
                className="w-72"
                placeholder={placeholder}
                type={
                  jsonSchema.format ? FORMAT_MAP[jsonSchema.format] : "text"
                }
                minLength={jsonSchema.minLength}
                maxLength={jsonSchema.maxLength}
                pattern={jsonSchema.pattern}
                required
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (jsonSchema.type === "number" || jsonSchema.type === "integer") {
    return (
      <FormField
        control={form.control}
        name={path}
        render={({ field }) => (
          <FormItem
            className={cn("flex items-center justify-between", className)}
          >
            <FormLabel>{jsonSchema.title}</FormLabel>
            <FormControl>
              <Input
                placeholder={placeholder}
                className="w-72"
                type="number"
                min={
                  jsonSchema.exclusiveMinimum !== undefined
                    ? jsonSchema.exclusiveMinimum + 1
                    : jsonSchema.minimum
                }
                max={
                  jsonSchema.exclusiveMaximum !== undefined
                    ? jsonSchema.exclusiveMaximum - 1
                    : jsonSchema.maximum
                }
                required
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (jsonSchema.type === "boolean") {
    return (
      <FormField
        control={form.control}
        name="mobile"
        render={({ field }) => (
          <FormItem
            className={cn("flex items-center justify-between", className)}
          >
            <FormLabel>{jsonSchema.title}</FormLabel>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    );
  }
}
