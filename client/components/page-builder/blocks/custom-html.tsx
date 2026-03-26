import type { CustomHtmlConfig, CustomHtmlProps } from './custom-html.types';

export function CustomHtmlBlock({ block }: CustomHtmlProps) {
  const cfg = block.configuration as CustomHtmlConfig;
  if (!cfg.html) return null;

  return (
    <>
      {cfg.css && <style dangerouslySetInnerHTML={{ __html: cfg.css }} />}
      <div dangerouslySetInnerHTML={{ __html: cfg.html }} />
    </>
  );
}
