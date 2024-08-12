"use client;";

import { Address as AddressType } from "viem";
import { Address } from "~~/components/scaffold-eth";

type GrantBuilderAlertProps = {
  address: AddressType;
  className?: string;
};

export const GrantBuilderAlert = ({ address, className = "" }: GrantBuilderAlertProps) => {
  return (
    <div
      className={`flex flex-col  sm:flex-row gap-2 items-center justify-center p-3 bg-secondary w-full max-w-96 sm:max-w-4xl shadow-sm rounded-xl ${className}`}
    >
      <span className="text-primary">You are viewing the grants of</span> <Address address={address} />
    </div>
  );
};
