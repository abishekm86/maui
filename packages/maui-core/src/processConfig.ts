import { computed, signal, Signal } from '@preact/signals'
// import { ProcessedConfig } from './types'
import { withCache } from './cache'
import { ProcessedConfig, Schema } from './types'

export const processConfig = withCache(processConfigInternal, {
  cacheLimit: 50,
  getKey: ([cacheKey]) => cacheKey,
})

function processConfigInternal<T extends Schema<string>, P extends Schema<T['schema']>>(
  _cacheKey: string,
  configFn: () => Omit<T, 'schema'>,
  transformFn?: (config: Omit<T, 'schema'>) => any,
): ProcessedConfig<P> {
  const config = configFn()
  const transformedConfig = transformFn ? transformFn(config) : config
  const evaluatedConfig = evaluateExpressionsToSignals(transformedConfig)
  return evaluatedConfig
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
