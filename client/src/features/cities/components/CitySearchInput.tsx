import { ChangeEvent, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/forms/Input";

interface CitySearchInputProps {
  value: string;
  onChange: (q: string) => void;
  placeholder?: string;
}

export function CitySearchInput({ value, onChange, placeholder = "Search a city or country" }: CitySearchInputProps) {
  const [internal, setInternal] = useState(value);

  function handle(e: ChangeEvent<HTMLInputElement>) {
    setInternal(e.target.value);
    onChange(e.target.value);
  }

  return (
    <Input
      placeholder={placeholder}
      leadingIcon={<Search className="h-5 w-5" />}
      value={internal}
      onChange={handle}
      aria-label="Search cities"
    />
  );
}
