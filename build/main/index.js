"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracer = void 0;
const api_1 = __importDefault(require("@opentelemetry/api"));
const exporter_jaeger_1 = require("@opentelemetry/exporter-jaeger");
const instrumentation_1 = require("@opentelemetry/instrumentation");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_koa_1 = require("@opentelemetry/instrumentation-koa");
const resources_1 = require("@opentelemetry/resources");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const tracing_1 = require("@opentelemetry/tracing");
class Tracer {
    constructor(cfg) {
        this.initial(cfg);
    }
    getExporterClass(name) {
        switch (name) {
            case 'ConsoleSpanExporter':
                return sdk_trace_base_1.ConsoleSpanExporter;
            case 'InMemorySpanExporter':
                return tracing_1.InMemorySpanExporter;
            case 'JaegerExporter':
                return exporter_jaeger_1.JaegerExporter;
            default:
                throw new Error(`Unknown SpanExporter: ${name}`);
        }
    }
    getSpanProcesserClass(name) {
        let SpanProcessorClass;
        switch (name) {
            case 'SimpleSpanProcessor':
                SpanProcessorClass = sdk_trace_base_1.SimpleSpanProcessor;
                break;
            case 'BatchSpanProcessor':
                SpanProcessorClass = sdk_trace_base_1.BatchSpanProcessor;
                break;
            default:
                throw new Error(`Unknown SpanProcessor: ${name}`);
        }
        return SpanProcessorClass;
    }
    getInstrumentation(name) {
        const iClass = this.getInstrumentationClass(name);
        return new iClass();
    }
    getInstrumentations(names) {
        const instrumentations = [];
        for (const name of names) {
            instrumentations.push(this.getInstrumentation(name));
        }
        return instrumentations;
    }
    getInstrumentationClass(name) {
        switch (name) {
            case 'KoaInstrumentation':
                return instrumentation_koa_1.KoaInstrumentation;
            case 'HttpInstrumentation':
                return instrumentation_http_1.HttpInstrumentation;
            default:
                throw new Error(`Unknown Instrumentation: ${name}`);
        }
    }
    initial(cfg) {
        const config = {};
        if (cfg.config && cfg.config.resource) {
            const resultAttrs = Object.assign({}, cfg.config.resource);
            config.resource = new resources_1.Resource(resultAttrs);
        }
        const provider = new sdk_trace_node_1.NodeTracerProvider(config);
        if (Object.keys(cfg.spanProcessor).length === 0) {
            throw new Error('require one spanProcessor');
        }
        for (const spanProcessorName in cfg.spanProcessor) {
            const SpanProcessorClass = this.getSpanProcesserClass(spanProcessorName);
            const spanProcessorCfg = cfg.spanProcessor[spanProcessorName] || {};
            for (const exporterName in spanProcessorCfg.spanExpoter) {
                const ExporterClass = this.getExporterClass(exporterName);
                const exporterCfg = spanProcessorCfg.spanExpoter[exporterName] || {};
                if (spanProcessorCfg.config) {
                    provider.addSpanProcessor(new SpanProcessorClass(new ExporterClass(exporterCfg), spanProcessorCfg.config));
                }
                else {
                    provider.addSpanProcessor(new SpanProcessorClass(new ExporterClass(exporterCfg)));
                }
            }
        }
        provider.register();
        if (cfg.instrumentation) {
            (0, instrumentation_1.registerInstrumentations)({
                instrumentations: this.getInstrumentations(cfg.instrumentation)
            });
        }
        // 返回 Global TracerApi 实例
        const tracer = api_1.default.trace.getTracer('tracer');
        return tracer;
    }
    /**
     * 获取当前 active 的 span
     * @returns Span
     */
    getCurrentActiveSpan() {
        return api_1.default.trace.getSpan(api_1.default.context.active());
    }
    /**
     * 获取当前活跃的 traceId
     * @returns String | null
     */
    getCurrentActiveTraceId() {
        var _a;
        const currentActiveSpan = this.getCurrentActiveSpan();
        return (_a = currentActiveSpan === null || currentActiveSpan === void 0 ? void 0 : currentActiveSpan.spanContext()) === null || _a === void 0 ? void 0 : _a.traceId;
    }
    /**
     * 获取 opentelemetry 实例，用于执行原生的 opentelemetry-js 操作
     * @returns opentelemetry
     */
    getOpentelemetry() {
        return api_1.default;
    }
}
exports.Tracer = Tracer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNkRBQThDO0FBQzlDLG9FQUErRDtBQUMvRCxvRUFBeUU7QUFDekUsOEVBQXlFO0FBQ3pFLDRFQUF1RTtBQUN2RSx3REFBbUQ7QUFDbkQsa0VBQTRHO0FBQzVHLGtFQUFrRTtBQUNsRSxvREFBMkU7QUFpQzNFLE1BQWEsTUFBTTtJQUNqQixZQUFZLEdBQXFCO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsQ0FBQztJQUVELGdCQUFnQixDQUFDLElBQVk7UUFDM0IsUUFBUSxJQUFJLEVBQUU7WUFDWixLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTyxvQ0FBbUIsQ0FBQTtZQUM1QixLQUFLLHNCQUFzQjtnQkFDekIsT0FBTyw4QkFBb0IsQ0FBQTtZQUM3QixLQUFLLGdCQUFnQjtnQkFDbkIsT0FBTyxnQ0FBYyxDQUFBO1lBQ3ZCO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLElBQUksRUFBRSxDQUFDLENBQUE7U0FDbkQ7SUFDSCxDQUFDO0lBRUQscUJBQXFCLENBQUMsSUFBWTtRQUNoQyxJQUFJLGtCQUFrQixDQUFBO1FBQ3RCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxxQkFBcUI7Z0JBQ3hCLGtCQUFrQixHQUFHLG9DQUFtQixDQUFBO2dCQUN4QyxNQUFLO1lBQ1AsS0FBSyxvQkFBb0I7Z0JBQ3ZCLGtCQUFrQixHQUFHLG1DQUFrQixDQUFBO2dCQUN2QyxNQUFLO1lBQ1A7Z0JBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsSUFBSSxFQUFFLENBQUMsQ0FBQTtTQUNwRDtRQUVELE9BQU8sa0JBQWtCLENBQUE7SUFDM0IsQ0FBQztJQUVELGtCQUFrQixDQUFDLElBQVk7UUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFD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