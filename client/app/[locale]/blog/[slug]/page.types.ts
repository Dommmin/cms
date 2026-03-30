export interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}
