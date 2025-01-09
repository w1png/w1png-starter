import Bun from "bun";

import { headers } from "next/headers";
import { auth } from "~/server/auth/auth";
import Upload from "./upload";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <Upload />;
  return JSON.stringify(session);
}
