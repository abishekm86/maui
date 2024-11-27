// import { ProcessedConfig } from './types'
import { withCache } from './cache'
import { $computed } from './filaments'
import { ProcessedConfig, SIGNAL_GETTER, Schema } from './types'

// TODO: BUG: cache key based on template id as well, since transforms are template specific
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
  // TODO: evaluate expressions first before transformation to simplify tranforming the input config?
  const transformedConfig = transformFn ? transformFn(config) : config
  const evaluatedConfig = evaluateExpressionsToSignals(transformedConfig)
  return evaluatedConfig
}

function evaluateExpressionsToSignals(configValue: any): any {
  if (typeof configValue === 'function') {
    if ((configValue as any)[SIGNAL_GETTER]) {
      // **configValue is a signal getter, use it directly**
      return configValue
    } else {
      // Function: Evaluate and wrap in a computed signal
      return $computed(() => (configValue as Function)())
    }
  } else if (Array.isArray(configValue)) {
    // Array: Process each element recursively
    return configValue.map(item => evaluateExpressionsToSignals(item))
  } else if (typeof configValue === 'object' && configValue !== null) {
    // Object: Process properties recursively
    const evaluatedObject: any = {}
    for (const key in configValue) {
      evaluatedObject[key] = evaluateExpressionsToSignals(configValue[key])
    }
    return evaluatedObject
  } else {
    return () => configValue
  }
}
