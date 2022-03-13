import opentelemetry from '@opentelemetry/api'
import { JaegerExporter } from "@opentelemetry/exporter-jaeger"
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { KoaInstrumentation } from '@opentelemetry/instrumentation-koa'
import { Resource } from "@opentelemetry/resources"
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { InMemorySpanExporter, TracerConfig } from "@opentelemetry/tracing"

// type SpanProcessorConfig = {
//   SimpleSpanProcessor?: {
//     ConsoleSpanExporter?: any,
//     InMemorySpanExporter?: any,
//     JaegerExporter?: ExporterConfig,
//   },
//   BatchSpanProcessor?: {
//     ConsoleSpanExporter?: {},
//     InMemorySpanExporter?: {},
//     JaegerExporter?: ExporterConfig,
//   }
// }

export type SpanProcessorConfig = { 
  [key: string]: {
    config: {
      [key: string]: any
    } | null | undefined,

    spanExpoter: {
      [key: string]: any
    }
  }
}

export type AppTracingConfig = {
  config: TracerConfig,
  spanProcessor: SpanProcessorConfig,
  instrumentation: string[]
}

export class Tracer {
  constructor(cfg: AppTracingConfig) {
    this.initial(cfg)
  }

  getExporterClass(name: string) {
    switch (name) {
      case 'ConsoleSpanExporter':
        return ConsoleSpanExporter
      case 'InMemorySpanExporter':
        return InMemorySpanExporter
      case 'JaegerExporter':
        return JaegerExporter
      default: 
        throw new Error(`Unknown SpanExporter: ${name}`)      
    }
  }

  getSpanProcesserClass(name: string) {
    let SpanProcessorClass
    switch (name) {
      case 'SimpleSpanProcessor':
        SpanProcessorClass = SimpleSpanProcessor
        break
      case 'BatchSpanProcessor':
        SpanProcessorClass = BatchSpanProcessor
        break
      default: 
        throw new Error(`Unknown SpanProcessor: ${name}`)
    }

    return SpanProcessorClass
  }

  getInstrumentation(name: string) {
    const iClass = this.getInstrumentationClass(name)
    return new iClass()
  }

  getInstrumentations(names: string[]) {
    const instrumentations = []
    for (const name of names) {
      instrumentations.push(this.getInstrumentation(name))
    }

    return instrumentations
  }

  getInstrumentationClass(name: string) {
    switch (name) {
      case 'KoaInstrumentation':
        return KoaInstrumentation
      case 'HttpInstrumentation':
        return HttpInstrumentation
      default:
        throw new Error(`Unknown Instrumentation: ${name}`)
    }
  }

  initial(cfg: AppTracingConfig) {
    const config: TracerConfig = {}
    if (cfg.config && cfg.config.resource) {
      const resultAttrs: any = Object.assign({}, cfg.config.resource)
      config.resource = new Resource(resultAttrs)
    }

    const provider = new NodeTracerProvider(config)
    if (Object.keys(cfg.spanProcessor).length === 0) {
      throw new Error('require one spanProcessor')
    }

    for (const spanProcessorName in cfg.spanProcessor) {
      const SpanProcessorClass = this.getSpanProcesserClass(spanProcessorName)
      
      const spanProcessorCfg = cfg.spanProcessor[spanProcessorName] || {}
      for (const exporterName in spanProcessorCfg.spanExpoter) {
        const ExporterClass = this.getExporterClass(exporterName)
        const exporterCfg = spanProcessorCfg.spanExpoter[exporterName] || {}
        
        if (spanProcessorCfg.config) {
          provider.addSpanProcessor(new SpanProcessorClass(new ExporterClass(exporterCfg), spanProcessorCfg.config))
        } else {
          provider.addSpanProcessor(new SpanProcessorClass(new ExporterClass(exporterCfg)))
        }
      }
    }

    provider.register()

    if (cfg.instrumentation) {
      registerInstrumentations({
        instrumentations: this.getInstrumentations(cfg.instrumentation)
      })
    }
    
    // 返回 Global TracerApi 实例
    const tracer = opentelemetry.trace.getTracer('tracer')
    return tracer
  }

  /**
   * 获取当前 active 的 span
   * @returns Span
   */
  getCurrentActiveSpan () {
    return opentelemetry.trace.getSpan(opentelemetry.context.active())
  }

  /**
   * 获取当前活跃的 traceId
   * @returns String | null
   */
  getCurrentActiveTraceId () {
    const currentActiveSpan = this.getCurrentActiveSpan()
    return currentActiveSpan?.spanContext()?.traceId
  }

  /**
   * 获取 opentelemetry 实例，用于执行原生的 opentelemetry-js 操作
   * @returns opentelemetry
   */
  getOpentelemetry () {
    return opentelemetry
  }
}
