import { Button } from "../ui/button";
import { ReactNode } from "react";

interface ButtonOutlineIconProps {
  text?: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export const ButtonOutlineIcon: React.FC<ButtonOutlineIconProps> = ({
  text,
  className,
  onClick,
  children,
}) => {
  return (
    <Button
      variant="secondary"
      size="icon"
      className={className}
      onClick={onClick}
    >
      {text || children}
    </Button>
  );
};
