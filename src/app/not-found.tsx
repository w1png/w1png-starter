import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-screen-navbar container flex flex-col gap-4 items-center justify-center">
      <h1 className="font-bold text-9xl">404</h1>
      <Link href="/">
        <Button>На главную</Button>
      </Link>
    </div>
  );
}
