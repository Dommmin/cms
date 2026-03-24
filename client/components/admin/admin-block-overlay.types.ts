import type { ReactNode } from "react";

export interface AdminBlockOverlayProps {
  blockId: number;
  blockType: string;
  pageId: number;
  adminBaseUrl: string;
  children: ReactNode;
}
