export interface InPostPoint {
  name: string;
  address: {
    line1: string;
    line2: string;
  };
}
export interface InpostPickerProps {
  value: string | null;
  onChange: (pointId: string, point: InPostPoint) => void;
  language?: string;
}
