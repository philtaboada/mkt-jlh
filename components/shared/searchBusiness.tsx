import { Input } from '../ui/input';

export function SearchBusiness({
  placeholder = 'Buscar negocio...',
  value,
  onChange,
  onSearch,
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="w-full md:w-1/3">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch();
          }
        }}
      />
    </div>
  );
}
