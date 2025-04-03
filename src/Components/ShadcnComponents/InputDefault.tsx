import { Input } from "../ui/input";

interface InputDefaultProps {
  type?: string;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const InputDefault: React.FC<InputDefaultProps> = ({
  type,
  placeholder,
  className,
  onChange,
}) => {
  return (
    <Input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      className={className}
    />
  );
};
