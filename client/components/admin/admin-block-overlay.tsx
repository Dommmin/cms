'use client';

import { PencilIcon } from 'lucide-react';
import type { AdminBlockOverlayProps } from './admin-block-overlay.types';

export function AdminBlockOverlay({
  blockId,
  blockType,
  pageId,
  adminBaseUrl,
  children,
}: AdminBlockOverlayProps) {
  const editUrl = `${adminBaseUrl}/admin/cms/pages/${pageId}/builder?block=${blockId}`;

  const label = blockType.replace(/_/g, ' ');

  return (
    <div className="group/block relative w-full">
      {children}
      {/* Hover overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-40 border-2 border-transparent transition-all duration-150 group-hover/block:border-indigo-500 group-hover/block:bg-indigo-500/5"
        aria-hidden="true"
      />
      {/* Edit button */}
      <div className="pointer-events-none absolute top-2 left-2 z-50 flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover/block:pointer-events-auto group-hover/block:opacity-100">
        <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase shadow">
          {label}
        </span>
        <a
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 text-[11px] font-medium text-white shadow transition-colors hover:bg-indigo-500"
        >
          <PencilIcon className="h-3 w-3" />
          Edit
        </a>
      </div>
    </div>
  );
}
