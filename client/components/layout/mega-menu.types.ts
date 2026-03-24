import type { Category, MenuItem } from "@/types/api";

export interface MegaMenuProps {
  items: MenuItem[];
  categories: Category[];
}
export type OpenKey = number | "categories" | null;
