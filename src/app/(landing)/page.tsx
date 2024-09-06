import { getServerAuthSession } from "~/server/auth";

export default async function LandingPage() {
  const session = await getServerAuthSession();

  return JSON.stringify(session);
}
