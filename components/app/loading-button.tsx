import { Loader2 } from "lucide-react";

import { Button, ButtonProps } from "@/components/ui/button";
import React from "react";

export interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, children, ...props }, ref) => {
    return (
      <Button {...props} ref={ref} disabled={loading || props.disabled}>
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
