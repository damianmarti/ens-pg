"use client";

import { useEffect } from "react";
import { Button } from "~~/components/pg-ens/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-12 items-center">
      <h2 className="text-2xl mt-10 text-center">Something went wrong!</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
