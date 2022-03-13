import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KoaInstrumentation } from '@opentelemetry/instrumentation-koa';
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { InMemorySpanExporter, TracerConfig } from "@opentelemetry/tracing";
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
export declare class Tracer {
    constructor(cfg: AppTracingConfig);
    getExporterClass(name: string): typeof ConsoleSpanExporter | typeof InMemorySpanExporter | typeof JaegerExporter;
    getSpanProcesserClass(name: string): typeof SimpleSpanProcessor | typeof BatchSpanProcessor;
    getInstrumentation(name: string): KoaInstrumentation | HttpInstrumentation;
    getInstrumentations(names: string[]): (KoaInstrumentation | HttpInstrumentation)[];
    getInstrumentationClass(name: string): typeof KoaInstrumentation | typeof HttpInstrumentation;
    initial(cfg: AppTracingConfig): import("@opentelemetry/api").Tracer;
    /**
     * 获取当前 active 的 span
     * @returns Span
     */
    getCurrentActiveSpan(): import("@opentelemetry/api").Span | undefined;
    /**
     * 获取当前活跃的 traceId
     * @returns String | null
     */
    getCurrentActiveTraceId(): string | undefined;
    /**
     * 获取 opentelemetry 实例，用于执行原生的 opentelemetry-js 操作
     * @returns opentelemetry
     */
    getOpentelemetry(): {
        trace: import("@opentelemetry/api").TraceAPI;
        context: import("@opentelemetry/api").ContextAPI;
        propagation: import("@opentelemetry/api").PropagationAPI;
        diag: import("@opentelemetry/api").DiagAPI;
    };
}
