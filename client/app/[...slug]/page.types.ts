import type { getPage } from "@/api/cms";

export interface PageProps {
  params: Promise<{ slug: string[] }>;
}
export type PageData = Awaited<ReturnType<typeof getPage>>;
