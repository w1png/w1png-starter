import { headers } from "next/headers";
import { auth } from "~/server/auth/auth";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return JSON.stringify(session);
}
