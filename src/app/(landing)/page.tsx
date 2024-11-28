import { auth } from "~/server/auth";

export default async function LandingPage() {
  const session = await auth();

  return JSON.stringify(session);
}
