"use client";

import { useState } from "react";

import type { PageBlock } from "@/types/api";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionConfig {
  title?: string;
  items?: AccordionItem[];
  allow_multiple?: boolean;
}

interface Props {
  block: PageBlock;
}

export function AccordionBlock({ block }: Props) {
  const cfg = block.configuration as AccordionConfig;
  const items = cfg.items ?? [];
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenItems((prev) => {
      const next = cfg.allow_multiple ? new Set(prev) : new Set<number>();
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {cfg.title && <h2 className="text-2xl font-bold">{cfg.title}</h2>}

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
        {items.map((item, i) => {
          const isOpen = openItems.has(i);
          return (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left font-medium transition-colors hover:bg-muted/50"
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                <span className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-border px-6 py-4">
                  <div
                    className="prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
