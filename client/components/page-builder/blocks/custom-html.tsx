import type { PageBlock } from "@/types/api";
import type { CustomHtmlConfig, CustomHtmlProps } from './custom-html.types';

export function CustomHtmlBlock({ block }: CustomHtmlProps) {
  const cfg = block.configuration as CustomHtmlConfig;
  if (!cfg.html) return null;

  return (
    <>
      {cfg.css && (
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: cfg.css }}
        />
      )}
      <div
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: cfg.html }}
      />
    </>
  );
}
