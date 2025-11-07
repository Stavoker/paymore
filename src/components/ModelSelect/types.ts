export interface ModelSelectProps {
  catSpec: any;
  subcatKeys?: string[];
  subcategory?: string;
  setSubcategory?: (value: string) => void;
  q: string;
  setQ: (value: string) => void;
  items: any[];
  lowMatches?: any[];
  category: string;
  brand: string;
  model: string;
  categoryLabel: string;
}
