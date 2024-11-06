import { computed, signal, Signal } from '@preact/signals'
// import { ProcessedConfig } from './types'
import { withCache } from './cache'
import { ProcessedConfig, Schema } from './types'

export const processConfig = withCache(processConfigInternal, {
  cacheLimit: 50,
  getKey: ([config]) => config.id,
})

function processConfigInternal<T extends Schema<string>, P extends Schema<T['schema']>>(
  config: T,
  transformFn?: (config: T) => any,
): ProcessedConfig<P> {
  const evaluatedConfig = evaluateExpressionsToSignals(config)
  const transformedConfig = transformFn ? transformFn(evaluatedConfig) : evaluatedConfig
  return transformedConfig
}

function evaluateExpressionsToSignals(configValue: any): any {
  if (typeof configValue === 'function') {
    // Function: Evaluate and wrap in a signal
    return computed(() => (configValue as Function)())
  } else if (configValue instanceof Signal) {
    // Signal: Return as is
    return configValue
  } else if (Array.isArray(configValue)) {
    // Array: Process each element recursively
    return [] // TODO: support arrays
  } else if (typeof configValue === 'object' && configValue !== null) {
    // Object: Process properties recursively
    const evaluatedObject: any = {}
    for (const key in configValue) {
      evaluatedObject[key] = evaluateExpressionsToSignals(configValue[key])
    }
    return evaluatedObject
  } else {
    // Primitive value: Wrap in a signal
    return signal(configValue) // TODO: can we get away with returning just ({ value: configValue })
  }
}
