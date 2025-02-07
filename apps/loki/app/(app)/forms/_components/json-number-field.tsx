import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JsonNumberType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";

type Props = {
  path: string;
  jsonSchema: JsonNumberType;
  className?: string;
};

export default function JsonNumberForm({ path, jsonSchema, className }: Props) {
  const placeholder = jsonSchema.examples?.[0]?.toString() ?? "";

  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, title } =
    jsonSchema;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={path}>{title}</Label>
      <Input
        id={path}
        placeholder={placeholder}
        type="number"
        min={exclusiveMinimum ? exclusiveMinimum + 1 : minimum}
        max={exclusiveMaximum ? exclusiveMaximum - 1 : maximum}
        disabled
      />
    </div>
  );
}
