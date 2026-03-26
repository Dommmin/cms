import type { PickupPoint } from '@/types/api';

export interface PickupPointPickerProps {
  carrier: string;
  postalCode?: string;
  value: string | null;
  onChange: (id: string, point: PickupPoint) => void;
}
