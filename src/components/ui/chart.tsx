"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: Record<string, any>;
  }
>(({ className, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${props.id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config: config || {} }}>
      <div
        ref={ref}
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config || {}} />
        <RechartsPrimitive.ResponsiveContainer>
          {props.children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = ({ content, ...props }: any) => {
  return content ? React.cloneElement(content, props) : null;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    payload?: RechartsPrimitive.TooltipPayload<any, any>[];
    active?: boolean;
    label?: string | number;
    labelKey?: string;
    nameKey?: string;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    labelClassName?: string;
    indicator?: "dot" | "line" | "dashed";
    formatter?: (
      value: any,
      name: string,
      props: RechartsPrimitive.TooltipPayload<any, any>,
      index: number,
      payload: any
    ) => React.ReactNode;
    labelFormatter?: (
      label: any,
      payload: RechartsPrimitive.TooltipPayload<any, any>[]
    ) => React.ReactNode;
  }
>(({ className, ...props }, ref) => {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (props.hideLabel || !props.payload?.length) {
      return null;
    }

    const [item] = props.payload;
    const key = `${props.labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !props.labelKey && typeof props.label === "string"
        ? config[props.label as keyof typeof config]?.label || props.label
        : itemConfig?.label;

    if (props.labelFormatter) {
      return (
        <div className={cn("font-medium", props.labelClassName)}>
          {props.labelFormatter(value, props.payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return (
      <div className={cn("font-medium", props.labelClassName)}>{value}</div>
    );
  }, [
    props.label,
    props.labelFormatter,
    props.payload,
    props.hideLabel,
    props.labelClassName,
    config,
    props.labelKey,
  ]);

  if (!props.active || !props.payload?.length) {
    return null;
  }

  const nestLabel = props.payload.length === 1 && props.indicator !== "dot";

  return (
    <div
      ref={ref}
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {props.payload.map((item, index) => {
          const key = `${
            props.nameKey || item.name || item.dataKey || "value"
          }`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor =
            props.color || item.payload?.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                props.indicator === "dot" && "items-center"
              )}
            >
              {itemConfig?.icon ? (
                <itemConfig.icon />
              ) : (
                !props.hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": props.indicator === "dot",
                        "w-1": props.indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent":
                          props.indicator === "dashed",
                        "my-0.5": nestLabel && props.indicator === "dashed",
                      }
                    )}
                    style={
                      {
                        "--color-bg": indicatorColor,
                        "--color-border": indicatorColor,
                      } as React.CSSProperties
                    }
                  />
                )
              )}
              <div
                className={cn(
                  "flex flex-1 justify-between leading-none",
                  nestLabel ? "items-end" : "items-center"
                )}
              >
                <div className="grid gap-1.5">
                  {nestLabel ? tooltipLabel : null}
                  <span className="text-muted-foreground">
                    {itemConfig?.label || item.name}
                  </span>
                </div>
                {item.value !== undefined && (
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideIcon?: boolean;
    payload?: RechartsPrimitive.LegendPayload[];
    verticalAlign?: "top" | "bottom";
    nameKey?: string;
  }
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      ...props
    },
    ref
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
        {...props}
      >
        {payload.map((item: RechartsPrimitive.LegendPayload) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
