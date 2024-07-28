import { ReactNode } from "react";

type Variant = "primary" | "secondary";

type ButtonProps = {
  variant?: Variant;
  onClick: () => void;
  children: ReactNode;
};

export const Button = ({ variant = "primary", onClick, children }: ButtonProps) => {
  const sharedButtonClassNames = "py-3 px-16 text-lg font-bold h-auto";
  let variantClassNames = "";
  if (variant === "primary") {
    variantClassNames = "bg-primary hover:bg-primary text-white";
  }
  if (variant === "secondary") {
    variantClassNames = "bg-secondary hover:bg-secondary text-primary";
  }

  return (
    <button className={`btn ${sharedButtonClassNames} ${variantClassNames}`} onClick={onClick}>
      {children}
    </button>
  );
};
