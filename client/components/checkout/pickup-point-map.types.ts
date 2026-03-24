import type { PickupPoint } from "@/types/api";

export interface PickupPointMapProps {
  points: PickupPoint[];
  hoveredId: string | null;
  onSelect: (point: PickupPoint) => void;
  onHover: (id: string | null) => void;
}
