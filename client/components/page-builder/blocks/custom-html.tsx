import type { PageBlock } from "@/types/api";

interface CustomHtmlConfig {
  html?: string;
  css?: string;
}

interface Props {
  block: PageBlock;
}

export function CustomHtmlBlock({ block }: Props) {
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
