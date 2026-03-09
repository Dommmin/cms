import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPage } from "@/api/cms";
import { PageRenderer } from "@/components/page-builder/page-renderer";
import { RecentlyViewed } from "@/components/recently-viewed";
import { generateAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPage("home");
    return {
      title: page.seo_title ?? page.title,
      description: page.seo_description ?? undefined,
      alternates: generateAlternates("/"),
    };
  } catch {
    return {};
  }
}

export default async function HomePage() {
  let page;
  console.log("Fetching page...");
  try {
    page = await getPage("home");
  } catch {
    notFound();
  }

  if (!page.is_published) {
    notFound();
  }

  return (
    <>
      <PageRenderer page={page} />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <RecentlyViewed />
      </div>
    </>
  );
}
