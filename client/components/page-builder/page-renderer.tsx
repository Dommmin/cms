import { cookies } from "next/headers";
import type { Page } from "@/types/api";

import { ModuleRenderer } from "./module-renderer";
import { SectionRenderer } from "./section-renderer";

interface Props {
  page: Page;
}

/**
 * Top-level renderer for CMS pages.
 *
 * Handles two page types:
 *  - `blocks`  → renders sections → blocks hierarchy
 *  - `module`  → renders named module (content, faq, …)
 *
 * This component is a Server Component — it has no interactivity of its own.
 * Interactive child blocks (newsletter, forms, accordion, tabs) are 'use client'.
 */
export async function PageRenderer({ page }: Props) {
  if (!page.is_published) {
    return null;
  }

  if (page.page_type === "module") {
    return <ModuleRenderer page={page} />;
  }

  const cookieStore = await cookies();
  const isPreview = !!cookieStore.get("admin_preview")?.value;
  const adminBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "";

  const activeSections = page.sections
    .filter((s) => s.is_active)
    .sort((a, b) => a.position - b.position);

  return (
    <main>
      {activeSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          isPreview={isPreview}
          pageId={page.id}
          adminBaseUrl={adminBaseUrl}
        />
      ))}
    </main>
  );
}
