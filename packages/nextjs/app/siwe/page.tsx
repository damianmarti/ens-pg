"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Button } from "~~/components/pg-ens/Button";
import { useAuthSession } from "~~/hooks/pg-ens/useAuthSession";
import { useHandleLogin } from "~~/hooks/pg-ens/useHandleLogin";

export default function Siwe() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { handleLogin } = useHandleLogin();
  const { isAuthenticated } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [router, isAuthenticated]);

  return (
    <Button
      className="mt-10 self-center"
      onClick={e => {
        e?.preventDefault();
        if (!isConnected) {
          openConnectModal?.();
        } else {
          handleLogin();
        }
      }}
    >
      Sign in with Ethereum
    </Button>
  );
}
