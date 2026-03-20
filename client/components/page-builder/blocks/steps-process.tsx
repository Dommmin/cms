import type { PageBlock } from "@/types/api";

interface Step {
  title?: string;
  description?: string;
  icon?: string;
}

interface StepsProcessConfig {
  title?: string;
  subtitle?: string;
  layout?: "horizontal" | "vertical" | "numbered";
  steps?: Step[];
}

interface Props {
  block: PageBlock;
}

export function StepsProcessBlock({ block }: Props) {
  const cfg = block.configuration as StepsProcessConfig;
  const steps = cfg.steps ?? [];
  const layout = cfg.layout ?? "horizontal";

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="mt-2 text-muted-foreground">{cfg.subtitle}</p>}
        </div>
      )}

      {layout === "vertical" ? (
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />
          <div className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-8">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-4 ring-background">
                  {i + 1}
                </div>
                <div className="pb-2 pt-2">
                  {step.title && <h3 className="text-lg font-semibold">{step.title}</h3>}
                  {step.description && (
                    <p className="mt-2 text-muted-foreground">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`grid gap-8 ${
            steps.length <= 3
              ? "md:grid-cols-3"
              : steps.length === 4
                ? "md:grid-cols-4"
                : "md:grid-cols-3"
          }`}
        >
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center gap-4 text-center">
              {/* Connector line between steps */}
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+2.5rem)] top-6 hidden h-0.5 w-[calc(100%-5rem)] bg-border md:block" />
              )}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {layout === "numbered" ? i + 1 : i + 1}
              </div>
              {step.title && <h3 className="font-semibold">{step.title}</h3>}
              {step.description && (
                <p className="text-sm text-muted-foreground">{step.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
