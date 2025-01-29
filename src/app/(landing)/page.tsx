import { Suspense } from "react";
import Long from "./long";
import Revalidate from "./revalidate";

export default function LandingPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Long />
      </Suspense>
      <Revalidate />
    </div>
  );
}
