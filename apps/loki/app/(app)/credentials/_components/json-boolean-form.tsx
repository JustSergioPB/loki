import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { JsonBooleanType } from "@/lib/types/json-schema";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  path: string;
  jsonSchema: JsonBooleanType;
  className?: string;
};

export default function JsonBooleanForm({
  path,
  jsonSchema,
  className,
}: Props) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={path}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{jsonSchema.title}</FormLabel>
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
