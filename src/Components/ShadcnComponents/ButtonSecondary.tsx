import { Button } from "../ui/button";
import { ReactNode } from "react";

interface ButtonSecondaryProps {
  text?: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  text,
  className,
  onClick,
  children,
}) => {
  return (
    <Button variant="secondary" className={className} onClick={onClick}>
      {text || children}
    </Button>
  );
};

// add a fucking dark class to the html / body
