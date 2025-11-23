export type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  type?: string;
  error?: string;
  required?: boolean;
};
