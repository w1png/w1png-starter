"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({
      redirect: true,
      callbackUrl: "/",
    });
  }, []);

  return null;
}
