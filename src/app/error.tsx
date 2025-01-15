"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function NotFound({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen-navbar container flex items-center justify-center flex-col gap-4">
      <h1 className="font-bold text-9xl">4XX</h1>
      <Button onClick={reset}>Попробовать еще раз</Button>
    </div>
  );
}
