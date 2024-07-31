import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary";

type ButtonProps = {
  variant?: Variant;
  onClick?: () => void;
  children: ReactNode;
  link?: boolean;
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ variant = "primary", onClick, children, link, href, className }: ButtonProps) => {
  const sharedButtonClassNames = "py-3 px-16 text-lg font-bold h-auto";
  let variantClassNames = "";
  if (variant === "primary") {
    variantClassNames = "bg-primary hover:bg-primary text-white";
  }
  if (variant === "secondary") {
    variantClassNames = "bg-secondary hover:bg-secondary text-primary";
  }

  if (link && href) {
    return (
      <Link href={href} className={`btn ${sharedButtonClassNames} ${variantClassNames}`} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button className={`btn ${sharedButtonClassNames} ${variantClassNames} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
