"use client";

import { X, ExternalLink, Settings } from "lucide-react";
import { useAdminPreview } from "@/hooks/use-admin-preview";
import type { AdminBarProps } from './admin-bar.types';

const ENTITY_LABELS: Record<string, string> = {
  page: "Page",
  blog_post: "Blog Post",
  product: "Product",
  category: "Category",
};

function exitPreview() {
  document.cookie = "admin_preview=; max-age=0; path=/";
  window.location.reload();
}

export function AdminBar({ entity: serverEntity }: AdminBarProps = {}) {
  const { entity: cookieEntity } = useAdminPreview();
  // Prefer server-provided entity (SSR-consistent); fall back to client-side cookie read
  const entity = serverEntity ?? cookieEntity;

  if (!entity) return null;

  const entityType = entity?.type;
  const entityLabel = entityType ? ENTITY_LABELS[entityType] ?? entityType : null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex h-10 items-center justify-between gap-4 bg-gray-950 px-4 text-sm text-gray-100 shadow-lg"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* Left: label */}
      <div className="flex items-center gap-2 font-semibold tracking-wide">
        <Settings className="h-4 w-4 text-indigo-400" />
        <span className="text-indigo-300">Admin Preview</span>
      </div>

      {/* Center: entity context */}
      <div className="flex items-center gap-2 truncate">
        {entityLabel && (
          <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-300">
            {entityLabel}
          </span>
        )}
        {entity?.name && (
          <span className="truncate max-w-xs text-gray-100">{entity.name}</span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex shrink-0 items-center gap-2">
        {entity?.admin_url && (
          <a
            href={entity.admin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Edit in Admin
          </a>
        )}
        <button
          onClick={exitPreview}
          className="inline-flex items-center gap-1 rounded border border-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <X className="h-3 w-3" />
          Exit Preview
        </button>
      </div>
    </div>
  );
}
