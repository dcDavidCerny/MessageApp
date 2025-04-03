import { Textarea } from "../ui/textarea";

interface TextAreaDefaultProps {
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const TextAreaDefault: React.FC<TextAreaDefaultProps> = ({
  placeholder,
  className,
  onChange,
  value,
  onKeyDown,
}) => {
  return (
    <Textarea
      placeholder={placeholder}
      onChange={onChange}
      className={className}
      value={value}
      onKeyDown={onKeyDown}
    />
  );
};
