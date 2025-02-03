import { JsonBooleanType } from "@/lib/types/json-schema";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

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
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Label htmlFor={path}>{jsonSchema.title}</Label>
      <Checkbox id={path} disabled />
    </div>
  );
}
