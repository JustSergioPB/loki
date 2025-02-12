import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { JsonNumberType } from "@/lib/types/json-schema";
import { useFormContext } from "react-hook-form";

type Props = {
  path: string;
  required: boolean;
  jsonSchema: JsonNumberType;
  className?: string;
};

export default function JsonNumberForm({
  path,
  jsonSchema,
  className,
  required,
}: Props) {
  const { control } = useFormContext();
  const placeholder = jsonSchema.examples?.[0]?.toString() ?? "";

  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, title } =
    jsonSchema;

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
              type="number"
              min={exclusiveMinimum ? exclusiveMinimum + 1 : minimum}
              max={exclusiveMaximum ? exclusiveMaximum - 1 : maximum}
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
