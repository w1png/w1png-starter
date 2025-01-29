"use client";

import { Button } from "~/components/ui/button";
import { revalidate } from "./rev";

export default function Revalidate() {
  return (
    <form action={revalidate}>
      <Button>Revalidate</Button>
    </form>
  );
}
