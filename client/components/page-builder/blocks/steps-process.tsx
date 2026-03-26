import type { StepsProcessConfig, StepsProcessProps } from './steps-process.types';

export function StepsProcessBlock({ block }: StepsProcessProps) {
  const cfg = block.configuration as StepsProcessConfig;
  const steps = cfg.steps ?? [];
  const layout = cfg.layout ?? 'horizontal';

  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="text-muted-foreground mt-2">{cfg.subtitle}</p>}
        </div>
      )}

      {layout === 'vertical' ? (
        <div className="relative mx-auto max-w-2xl">
          <div className="bg-border absolute top-0 left-6 h-full w-0.5" />
          <div className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-8">
                <div className="bg-primary text-primary-foreground ring-background relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ring-4">
                  {i + 1}
                </div>
                <div className="pt-2 pb-2">
                  {step.title && <h3 className="text-lg font-semibold">{step.title}</h3>}
                  {step.description && (
                    <p className="text-muted-foreground mt-2">{step.description}</p>
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
              ? 'md:grid-cols-3'
              : steps.length === 4
                ? 'md:grid-cols-4'
                : 'md:grid-cols-3'
          }`}
        >
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center gap-4 text-center">
              {/* Connector line between steps */}
              {i < steps.length - 1 && (
                <div className="bg-border absolute top-6 left-[calc(50%+2.5rem)] hidden h-0.5 w-[calc(100%-5rem)] md:block" />
              )}
              <div className="bg-primary text-primary-foreground relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                {layout === 'numbered' ? i + 1 : i + 1}
              </div>
              {step.title && <h3 className="font-semibold">{step.title}</h3>}
              {step.description && (
                <p className="text-muted-foreground text-sm">{step.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
