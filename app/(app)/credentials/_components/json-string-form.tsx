import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JsonStringFormat, JsonStringType } from "@/lib/types/json-schema";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { HTMLInputTypeAttribute } from "react";

const FORMAT_MAP: Record<JsonStringFormat, HTMLInputTypeAttribute> = {
  datetime: "datetime-local",
  date: "date",
  time: "time",
  email: "email",
  uri: "url",
  uuid: "text",
};

type Props = {
  path: string;
  required: boolean;
  jsonSchema: JsonStringType;
  className?: string;
};

export default function JsonStringForm({
  path,
  jsonSchema,
  className,
  required,
}: Props) {
  const { control } = useFormContext();
  const placeholder = jsonSchema.examples?.[0]?.toString() ?? "";

  const { format, minLength, maxLength, pattern, title } = jsonSchema;

  return (
    <FormField
      control={control}
      name={path}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{title}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type={format ? FORMAT_MAP[format] : "text"}
              minLength={minLength}
              maxLength={maxLength}
              pattern={pattern}
              required={required}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
