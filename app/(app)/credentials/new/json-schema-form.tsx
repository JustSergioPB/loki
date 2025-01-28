import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JsonSchemaType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";
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

type Props = {
  path: string;
  required: boolean;
  jsonSchema: JsonSchemaType;
  className?: string;
};

export default function JsonSchemaForm({
  path,
  jsonSchema,
  className,
  required,
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
            <div className={cn("flex items-center justify-between", className)}>
              <FormLabel>{title}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="Select one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jsonSchema.enum!.map((value, index) => (
                      <SelectItem
                        value={index.toString()}
                        key={index.toString()}
                      >
                        {value ? value.toString() : null}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (type === "object")
    return <JsonObjectForm {...{ path, jsonSchema, className }} />;
  if (type === "array")
    return <JsonArrayForm {...{ path, jsonSchema, className }} />;
  if (type === "string")
    return <JsonStringForm {...{ path, jsonSchema, className, required }} />;
  if (type === "number" || type === "integer")
    return <JsonNumberForm {...{ path, jsonSchema, className, required }} />;
  if (type === "boolean")
    return <JsonBooleanForm {...{ path, jsonSchema, className }} />;
}
