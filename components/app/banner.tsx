import { Rocket } from "lucide-react";

export default function Banner() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="size-4" />
      </div>
      <span className="truncate font-semibold text-lg">Loki</span>
    </div>
  );
}
