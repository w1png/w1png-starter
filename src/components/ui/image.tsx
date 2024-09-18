"use client";

import { ImageOff } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "~/lib/client/utils";
import Loader from "./loader";

const className =
  "aspect-video flex items-center justify-center text-muted-foreground rounded-md" as const;

export interface S3ImageProps extends ImageProps {
  imageClassName?: string;
}

export default function S3Image({
  src,
  imageClassName,
  ...props
}: S3ImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <>
      {error ? (
        <div className={cn(className, props.className)}>
          {error && <ImageOff className="size-[20%] animate-pulse" />}
        </div>
      ) : (
        <div className={cn(className, props.className, "relative")}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <Loader />
            </div>
          )}
          <Image
            {...props}
            src={`/api/files/${src}`}
            className={cn("object-cover size-full", imageClassName)}
            onLoadingComplete={() => {
              setIsLoading(false);
            }}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
          />
        </div>
      )}
    </>
  );
}
