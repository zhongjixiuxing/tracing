import { TracerConfig } from "@opentelemetry/tracing";
export declare type SpanProcessorConfig = {
    [key: string]: {
        config: {
            [key: string]: any;
        } | null | undefined;
        spanExpoter: {
            [key: string]: any;
        };
    };
};
export declare type AppTracingConfig = {
    config: TracerConfig;
    spanProcessor: SpanProcessorConfig;
    instrumentation: string[];
};
