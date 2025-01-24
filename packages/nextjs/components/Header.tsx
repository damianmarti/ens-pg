"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocumentTextIcon, LockClosedIcon, QuestionMarkCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useAuthSession } from "~~/hooks/pg-ens/useAuthSession";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "My grants",
    href: "/my-grants",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    label: "All Grants",
    href: "/all-grants",
    icon: <DocumentTextIcon className="h-4 w-4" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <LockClosedIcon className="h-4 w-4" />,
  },
  {
    label: "FAQ",
    href: "/faq",
    icon: <QuestionMarkCircleIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { isAdmin, data } = useAuthSession();

  const linksToShow = [...(isAdmin ? [menuLinks[1], menuLinks[2]] : [menuLinks[0]]), menuLinks[3]];

  return (
    <>
      {linksToShow.map((linkToShow, index) => {
        if (
          (linkToShow.label === "My grants" && !data) ||
          (linkToShow.label !== "My grants" && !isAdmin && linkToShow.label !== "FAQ")
        ) {
          return null;
        }

        const isActive = pathname === linkToShow.href;

        return (
          <li key={index}>
            <Link
              href={linkToShow.href}
              passHref
              className={`${
                isActive ? "bg-secondary" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {linkToShow.icon}
              <span>{linkToShow.label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  return (
    <div className="sticky lg:static top-0 navbar bg-base-200 min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2 flex items-center">
        <Link href="/" passHref className="flex items-center gap-2 ml-4 mr-2 lg:mr-6">
          <div className="relative w-10 h-10 sm:hidden mt-1">
            <Image alt="ENS logo" className="object-contain" fill sizes="40px" priority src="/ens-vector.svg" />
          </div>
          <div className="relative hidden sm:block w-64 h-20 ">
            <Image
              alt="ENS Builder Grants logo"
              className="object-contain"
              fill
              sizes="256px"
              priority
              src="/ens-builder-grants.svg"
            />
          </div>
        </Link>
        <ul className="flex flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
