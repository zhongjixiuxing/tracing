# Node.js Tracing(opentelemetry) Lib

### 已验证的框架
- [x] koa 2+

### 使用示例
```
const config = {
  config: {
    resource: {
      'service.name': "anxing",
      'service.namespace': "my-namespace"
    }
  },
  spanProcessor: {
    SimpleSpanProcessor: {
      spanExpoter: {
        ConsoleSpanExporter: {}
      }
    },
    BatchSpanProcessor: {
      config: {
        /** The maximum batch size of every export. It must be smaller or equal to
         * maxQueueSize. The default value is 512. */
        maxExportBatchSize: 1,
        /** The delay interval in milliseconds between two consecutive exports.
         *  The default value is 5000ms. */
        scheduledDelayMillis: 500,
        /** How long the export can run before it is cancelled.
         * The default value is 30000ms */
        exportTimeoutMillis: 3000,
        /** The maximum queue size. After the size is reached spans are dropped.
         * The default value is 2048. */
        maxQueueSize: 10,
      },
      spanExpoter: {
        JaegerExporter: {
          host: '47.100.254.204', 
          port: 30371
        }
      }
    }
  },
  instrumentation: ['KoaInstrumentation', 'HttpInstrumentation']
}

const tracer = new Tracer(config)
```

### 参考链接
 - https://docs.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-enable?tabs=nodejs
 - https://github.com/open-telemetry/opentelemetry-js
 - https://open-telemetry.github.io/opentelemetry-js-api/modules.html