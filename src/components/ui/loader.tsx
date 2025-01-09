import { type VariantProps, cva } from "class-variance-authority";
import { Loader as LoaderSpinner } from "lucide-react";
import { cn } from "~/lib/client/utils";

const loaderVariants = cva("", {
  variants: {
    size: {
      sm: "size-4",
      default: "size-6",
      lg: "size-8",
      xl: "size-12",
    },
  },
});

interface LoaderProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof loaderVariants> {}

export default function Loader({ size, ...props }: LoaderProps) {
  return (
    <span
      {...props}
      className={cn(loaderVariants({ size }), "animate-spin", props.className)}
    >
      <LoaderSpinner className={loaderVariants({ size })} />
    </span>
  );
}
