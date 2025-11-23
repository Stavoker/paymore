export interface RadioButtonProps {
  options: (string | number)[];
  value: string | number;
  onChange: (value: string | number) => void;
  name?: string;
  descriptionText?: Record<string | number, string>;
}
