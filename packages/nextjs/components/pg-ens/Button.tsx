import { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "green" | "green-secondary" | "red" | "red-secondary";

type ButtonProps = {
  variant?: Variant;
  onClick?: (e?: MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: ReactNode;
  link?: boolean;
  href?: string;
  size?: "sm" | "md";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  variant = "primary",
  size = "md",
  onClick,
  link,
  href,
  className = "",
  children,
}: ButtonProps) => {
  const sharedButtonClassNames = "h-auto text-lg font-bold";
  let sizeClassNames = "";
  if (size === "md") {
    sizeClassNames = "py-3 px-16";
  }

  if (size === "sm") {
    sizeClassNames = "px-4 py-1.5";
  }

  let variantClassNames = "";
  if (variant === "primary") {
    variantClassNames = "bg-primary hover:bg-primary text-white";
  }
  if (variant === "secondary") {
    variantClassNames = "bg-secondary hover:bg-secondary text-primary";
  }
  if (variant === "green") {
    variantClassNames = "bg-primary-green hover:bg-primary-green text-white";
  }
  if (variant === "green-secondary") {
    variantClassNames = "bg-success hover:bg-success text-primary-green";
  }
  if (variant === "red") {
    variantClassNames = "bg-primary-red hover:bg-primary-red text-white";
  }
  if (variant === "red-secondary") {
    variantClassNames = "bg-error hover:bg-error text-primary-red";
  }

  const allClassNames = `btn border-none ${sharedButtonClassNames} ${sizeClassNames} ${variantClassNames} ${className}`;

  if (link && href) {
    return (
      <Link href={href} className={allClassNames}>
        {children}
      </Link>
    );
  }
  return (
    <button className={allClassNames} onClick={onClick}>
      {children}
    </button>
  );
};
