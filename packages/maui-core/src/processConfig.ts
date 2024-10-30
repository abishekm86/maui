import { computed, Signal } from '@preact/signals'
import { DeepRequired, Defaults, ProcessedConfig } from './types'
import { withCache } from './cache'

export const processConfig = withCache(processConfigInternal, {
  cacheLimit: 50,
  getKey: ([config]) => config.id,
})

function processConfigInternal<T extends object>(
  config: T,
  defaults: Defaults<T>,
): ProcessedConfig<T> {
  const fullConfig = applyDefaults(config, defaults)
  const evaluatedConfig = evaluateExpressionsToSignals(fullConfig)
  return evaluatedConfig as ProcessedConfig<T>
}

function applyDefaults<T extends object>(config: T, defaults: Defaults<T>): DeepRequired<T> {
  const result = { ...config } as any

  const keys = Object.keys(defaults) as Array<keyof Defaults<T>>
  for (const key of keys) {
    const defaultValue = defaults[key]
    const configValue = result[key]

    if (configValue === undefined) {
      result[key] = defaultValue
    } else if (
      typeof defaultValue === 'object' &&
      defaultValue !== null &&
      typeof configValue === 'object' &&
      configValue !== null &&
      !Array.isArray(defaultValue) && // TODO: support merging arrays
      !Array.isArray(configValue)
    ) {
      // Use type assertions to 'any' to prevent deep type instantiation
      result[key] = applyDefaults(configValue as any, defaultValue as any) as any
    }
    // Else, keep the config value (no action needed for primitives)
  }

  return result as DeepRequired<T>
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
    return configValue.map(item => evaluateExpressionsToSignals(item))
  } else if (typeof configValue === 'object' && configValue !== null) {
    // Object: Process properties recursively
    const evaluatedObject: any = {}
    for (const key in configValue) {
      evaluatedObject[key] = evaluateExpressionsToSignals(configValue[key])
    }
    return evaluatedObject
  } else {
    // Primitive value: Wrap in a signal
    return { value: configValue }
  }
}
