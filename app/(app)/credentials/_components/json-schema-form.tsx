import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JsonSchemaType } from "@/lib/types/json-schema";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import JsonObjectForm from "./json-object-form";
import JsonArrayForm from "./json-array-form";
import JsonStringForm from "./json-string-form";
import JsonNumberForm from "./json-number-form";
import JsonBooleanForm from "./json-boolean-form";
import { ReactNode } from "react";

type Props = {
  path: string;
  required: boolean;
  jsonSchema: JsonSchemaType;
  className?: string;
  children?: ReactNode;
  headerVariant?: "main" | "secondary";
};

export default function JsonSchemaForm({
  path,
  jsonSchema,
  className,
  required,
  children,
  headerVariant,
}: Props) {
  const { control } = useFormContext();

  const { title, type } = jsonSchema;

  if (type === "null") {
    return <></>;
  }

  if (jsonSchema.enum) {
    return (
      <FormField
        control={control}
        name={path}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{title}</FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jsonSchema.enum!.map((value, index) => (
                    <SelectItem value={index.toString()} key={index.toString()}>
                      {value ? value.toString() : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (type === "object")
    return (
      <JsonObjectForm
        {...{ path, jsonSchema, className, children, headerVariant }}
      />
    );
  if (type === "array")
    return <JsonArrayForm {...{ path, jsonSchema, className }} />;
  if (type === "string")
    return <JsonStringForm {...{ path, jsonSchema, className, required }} />;
  if (type === "number" || type === "integer")
    return <JsonNumberForm {...{ path, jsonSchema, className, required }} />;
  if (type === "boolean")
    return <JsonBooleanForm {...{ path, jsonSchema, className }} />;
}
