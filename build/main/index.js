"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.init(cfg);
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
    init(cfg) {
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
        const tracer = api_1.default.trace.getTracer('tracer');
        return tracer;
    }
}
exports.Tracer = Tracer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2REFBOEM7QUFDOUMsb0VBQStEO0FBQy9ELG9FQUF5RTtBQUN6RSw4RUFBeUU7QUFDekUsNEVBQXVFO0FBQ3ZFLHdEQUFtRDtBQUNuRCxrRUFBNEc7QUFDNUcsa0VBQWtFO0FBQ2xFLG9EQUEyRTtBQWlDM0UsTUFBTSxNQUFNO0lBQ1YsWUFBWSxHQUFxQjtRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxJQUFZO1FBQzNCLFFBQVEsSUFBSSxFQUFFO1lBQ1osS0FBSyxxQkFBcUI7Z0JBQ3hCLE9BQU8sb0NBQW1CLENBQUE7WUFDNUIsS0FBSyxzQkFBc0I7Z0JBQ3pCLE9BQU8sOEJBQW9CLENBQUE7WUFDN0IsS0FBSyxnQkFBZ0I7Z0JBQ25CLE9BQU8sZ0NBQWMsQ0FBQTtZQUN2QjtnQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixJQUFJLEVBQUUsQ0FBQyxDQUFBO1NBQ25EO0lBQ0gsQ0FBQztJQUVELHFCQUFxQixDQUFDLElBQVk7UUFDaEMsSUFBSSxrQkFBa0IsQ0FBQTtRQUN0QixRQUFRLElBQUksRUFBRTtZQUNaLEtBQUsscUJBQXFCO2dCQUN4QixrQkFBa0IsR0FBRyxvQ0FBbUIsQ0FBQTtnQkFDeEMsTUFBSztZQUNQLEtBQUssb0JBQW9CO2dCQUN2QixrQkFBa0IsR0FBRyxtQ0FBa0IsQ0FBQTtnQkFDdkMsTUFBSztZQUNQO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLElBQUksRUFBRSxDQUFDLENBQUE7U0FDcEQ7UUFFRCxPQUFPLGtCQUFrQixDQUFBO0lBQzNCLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxJQUFZO1FBQzdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJ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