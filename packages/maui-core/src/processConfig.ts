import { computed, signal, Signal } from '@preact/signals'
import { ProcessedConfig } from './types'
import { withCache } from './cache'

export const processConfig = withCache(processConfigInternal, {
  cacheLimit: 50,
  getKey: ([config]) => config.id,
})

function processConfigInternal<T extends object>(config: T): ProcessedConfig<T> {
  const evaluatedConfig = evaluateExpressionsToSignals(config)
  return evaluatedConfig as ProcessedConfig<T>
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
