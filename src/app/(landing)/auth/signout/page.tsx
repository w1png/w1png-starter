"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "~/lib/client/auth-client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/");
        },
      },
    });
  }, []);

  return null;
}
