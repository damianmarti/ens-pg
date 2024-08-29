"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAuthSession } from "~~/hooks/pg-ens/useAuthSession";

export const SignInBtn = () => {
  const { openConnectModal } = useConnectModal();
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.refresh();
    }
  }, [router, isAuthenticated]);

  return (
    <Button variant="secondary" onClick={openConnectModal}>
      Sign in with Ethereum
    </Button>
  );
};
