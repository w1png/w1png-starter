import { type VariantProps, cva } from "class-variance-authority";
import NextLink  from "next/link";
import * as React from "react";
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from "~/lib/client/utils";
import { buttonVariants } from "./button";

interface ExtendedLinkProps extends ComponentPropsWithoutRef<typeof NextLink>, VariantProps<typeof buttonVariants> {}

const Link = forwardRef<HTMLAnchorElement, ExtendedLinkProps>(({ className, size, variant, ...props }: ExtendedLinkProps, ref) => {
	return (
    <NextLink
      {...props}
      ref={ref}
      className={cn(buttonVariants({ className, size, variant }))}
      />
  );
});

Link.displayName = 'Link';

export default Link;
